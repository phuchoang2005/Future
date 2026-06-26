# Python Training Script Standards

Python is the runtime for every training job executed by this platform. When a user clicks **Start Training**, the backend launches `python:3.11-slim` in a Docker container, mounts the project source tree at `/source` (read-only) and a per-job workspace at `/workspace` (read/write), then runs the entrypoint command stored in the project's training configuration.

This document defines what a compliant training script must do so it integrates correctly with the platform's log viewer, progress bar, artifact collection, and job-status transitions.

---

## Python Version

**3.11** (pinned in `.python-version`). The container image is `python:3.11-slim`. New projects must not require 3.12+ features.

---

## Required Project Structure

The platform validates this layout during project registration (GitHub clone or ZIP upload). Registration is rejected if any of the three required items are missing.

```
<project-name>/
├── main.py                # REQUIRED — training entrypoint
├── requirements.txt       # REQUIRED — pinned Python dependencies
├── configs/               # REQUIRED — YAML configuration files
│   └── default.yaml       # at least one config file
├── pyproject.toml         # optional: project metadata + tool config (ruff, mypy)
└── tests/
    └── test_*.py
```

The entrypoint stored in the project configuration must point to `main.py`:

```
python main.py
```

---

## Container Contract

### Mount points

| Path in container | Host path | Mode |
|---|---|---|
| `/source` | `/data/sources/{project_id}/` | read-only |
| `/workspace` | `/data/workspaces/{job_id}/` | read-write |

The runner copies the job's immutable config snapshot into `/workspace/config.yaml` before starting the container. The backend runs the entrypoint as:

```sh
cd /source && python main.py
```

### Exit code

| Exit code | Platform interpretation |
|---|---|
| `0` | Job → `SUCCESS` |
| non-zero | Job → `FAILED` |

Always exit with a non-zero code on unrecoverable failure. An unhandled exception that crashes the interpreter also produces a non-zero exit and is treated as `FAILED`.

---

## Reading the Job Configuration

The runner writes an immutable YAML snapshot to `/workspace/config.yaml` before the container starts. Your script must read its configuration from there — not from `/source/configs/` directly, which reflects the repository state and may differ from what the user submitted.

```python
import yaml
import os

WORKSPACE = os.environ.get("WORKSPACE", "/workspace")

with open(os.path.join(WORKSPACE, "config.yaml")) as f:
    config = yaml.safe_load(f)

# Example fields — match your project's YAML schema
epochs      = config["training"]["epochs"]
batch_size  = config["training"]["batch_size"]
artifact_path = config.get("artifact_path", "outputs/models")
```

The `artifact_path` field in `config.yaml` tells the platform where inside the container to find artifacts after the job finishes. Define it consistently in every project config.

---

## Artifact Output

After a `SUCCESS` exit, the platform's artifact scanner reads `artifact_path` from the config snapshot and copies any files found there to host storage (`/data/artifacts/{project_id}/{job_id}/`). Artifacts are only registered on `SUCCESS`; a `FAILED` job keeps only its logs.

Write artifacts to the path from `config.yaml`, resolved relative to `/workspace`:

```python
import os
import json

WORKSPACE    = os.environ.get("WORKSPACE", "/workspace")
artifact_dir = os.path.join(WORKSPACE, config.get("artifact_path", "outputs/models"))
os.makedirs(artifact_dir, exist_ok=True)

# Save model
model.save(os.path.join(artifact_dir, "model.pt"))

# Save metrics alongside the model
with open(os.path.join(artifact_dir, "metrics.json"), "w") as f:
    json.dump({"accuracy": acc, "loss": loss}, f)
```

Do not write artifacts to `/source` (read-only) or to any hard-coded absolute path outside `/workspace`.

---

## Progress Reporting (required)

The backend's `ProgressParser` scans every stdout line for progress signals. The UI shows a live progress bar while the job is `RUNNING`. If no recognised pattern appears in any line, the progress bar shows "Progress Information Not Available" (NFR-UX-002).

**Emit at least one of the following patterns to stdout per training iteration:**

| Pattern | Example | Notes |
|---|---|---|
| `Epoch N/M` | `Epoch 3/10 — loss: 0.312` | Preferred for epoch-based training. Case-insensitive. |
| `Step N/M` | `Step 120/500 — lr: 1e-4` | Preferred for step-based training. Case-insensitive. |
| `NN%` | `Training: 75% done` | Fallback. Use only when epoch/step counts are unavailable. |

These patterns may appear anywhere on the line — no special prefix or format is required.

```python
# Epoch-based training
for epoch in range(1, epochs + 1):
    train_one_epoch(model, dataloader)
    loss = evaluate(model, val_loader)
    print(f"Epoch {epoch}/{epochs} — loss: {loss:.4f}", flush=True)

# Step-based training
for step, batch in enumerate(dataloader, start=1):
    train_step(model, batch)
    if step % log_every == 0:
        print(f"Step {step}/{total_steps}", flush=True)
```

Use `flush=True` (or `PYTHONUNBUFFERED=1`) so lines reach the log viewer in real time without buffering delay.

---

## Logging Conventions

All output written to **stdout and stderr** is captured line by line, streamed to the platform's real-time log viewer, and stored in `job_log_events`. There is no separate logging sink — the log viewer is stdout.

**Rules:**
- Write one meaningful event per line.
- Prefer structured prefixes for easier filtering:
  ```
  [INFO]  Dataset loaded: 50 000 samples
  [WARN]  No GPU detected — falling back to CPU
  [ERROR] FileNotFoundError: /source/data/train.csv not found
  ```
- Flush after each line in long-running loops (`flush=True` or `PYTHONUNBUFFERED=1`).
- Do not suppress exceptions silently. Let them propagate to stderr so the log viewer shows the full traceback and the job transitions to `FAILED`.

### Recommended logging setup

```python
import logging
import sys

logging.basicConfig(
    level=logging.INFO,
    format="[%(levelname)s] %(message)s",
    stream=sys.stdout,
    force=True,
)
log = logging.getLogger(__name__)
```

---

## Dependency Management

Use `requirements.txt` with pinned versions for reproducible container builds.

```
torch==2.3.1
torchvision==0.18.1
numpy==1.26.4
scikit-learn==1.5.0
pyyaml==6.0.2
```

Install inside the container via the entrypoint preamble or bake into a custom image. To pre-bake heavy dependencies, extend `python:3.11-slim` and set `APP_DOCKER_IMAGE` in the backend's environment.

For local development, manage the virtual environment with `uv` (preferred) or `venv`:

```bash
# uv (fast)
uv venv && uv pip install -r requirements.txt

# venv
python -m venv .venv && source .venv/bin/activate && pip install -r requirements.txt
```

---

## Code Quality

### Linter / formatter — ruff

```bash
# via rtk (preferred — token-optimized output)
rtk ruff check .

# direct
ruff check .
ruff format .
```

Minimum `pyproject.toml` config:

```toml
[tool.ruff]
line-length = 100
target-version = "py311"

[tool.ruff.lint]
select = ["E", "F", "I", "UP"]
```

### Type checking — mypy

```bash
mypy main.py --strict
```

---

## Testing

Use **pytest**. Tests live in `tests/` and follow `test_*.py` naming.

```bash
# via rtk (preferred)
rtk pytest

# direct
pytest tests/ -v
```

### What to test

- Data loading and preprocessing (fast, no GPU needed).
- Model output shapes.
- Config reading — assert the script correctly parses a sample `config.yaml`.
- Progress output format — assert that at least one line matches `Epoch N/M`, `Step N/M`, or `NN%` when running a short training loop. This prevents silent regressions that would hide the UI progress bar.

```python
import re

def test_progress_line_format(capsys):
    run_training(epochs=2, total=2)
    out = capsys.readouterr().out
    assert re.search(r"(?i)epoch\s+\d+\s*/\s*\d+", out), \
        "Training must emit 'Epoch N/M' lines for the progress bar"
```

---

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `WORKSPACE` | `/workspace` | Per-job workspace; contains `config.yaml` and receives artifact output |
| `PYTHONUNBUFFERED` | `1` | Ensures stdout is not line-buffered inside the container |

Always read `WORKSPACE` via `os.environ.get("WORKSPACE", "/workspace")` rather than hard-coding the path.

---

## Commit Style

Python changes follow the same Conventional Commits convention as the rest of the repository:

```
feat(training): add cosine-annealing LR scheduler to classifier script
fix(training): flush stdout on each epoch to prevent log buffering
chore(training): pin torch to 2.3.1 in requirements.txt
```

See `docs/github-commit-strategy.md` for the full convention.
