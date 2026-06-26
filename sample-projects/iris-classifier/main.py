import json
import logging
import os
import sys

import numpy as np
import yaml
from sklearn.datasets import load_iris
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, classification_report
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler

logging.basicConfig(
    level=logging.INFO,
    format="[%(levelname)s] %(message)s",
    stream=sys.stdout,
    force=True,
)
log = logging.getLogger(__name__)

WORKSPACE = os.environ.get("WORKSPACE", "/workspace")


def load_config() -> dict:
    config_path = os.path.join(WORKSPACE, "config.yaml")
    with open(config_path) as f:
        return yaml.safe_load(f)


def prepare_data(config: dict):
    iris = load_iris()
    X, y = iris.data, iris.target

    training = config.get("training", {})
    test_size = training.get("test_size", 0.2)
    seed = training.get("random_seed", 42)

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=test_size, random_state=seed, stratify=y
    )

    scaler = StandardScaler()
    X_train = scaler.fit_transform(X_train)
    X_test = scaler.transform(X_test)

    return X_train, X_test, y_train, y_test, scaler, iris.target_names


def simulate_epoch_training(
    model: LogisticRegression,
    X_train: np.ndarray,
    y_train: np.ndarray,
    X_test: np.ndarray,
    y_test: np.ndarray,
    epochs: int,
) -> tuple[float, float]:
    n = len(X_train)
    rng = np.random.default_rng(42)

    for epoch in range(1, epochs + 1):
        idx = rng.integers(0, n, size=min(32, n))
        model.fit(X_train[idx], y_train[idx])

        train_acc = accuracy_score(y_train, model.predict(X_train))
        val_acc = accuracy_score(y_test, model.predict(X_test))
        loss = 1.0 - train_acc

        print(
            f"Epoch {epoch}/{epochs} — loss: {loss:.4f}  train_acc: {train_acc:.4f}  val_acc: {val_acc:.4f}",
            flush=True,
        )

    model.fit(X_train, y_train)
    final_train_acc = accuracy_score(y_train, model.predict(X_train))
    final_val_acc = accuracy_score(y_test, model.predict(X_test))
    return final_train_acc, final_val_acc


def save_artifacts(
    config: dict,
    model: LogisticRegression,
    scaler: StandardScaler,
    metrics: dict,
    target_names: np.ndarray,
) -> None:
    artifact_dir = os.path.join(WORKSPACE, config.get("artifact_path", "outputs/models"))
    os.makedirs(artifact_dir, exist_ok=True)

    import pickle

    with open(os.path.join(artifact_dir, "model.pkl"), "wb") as f:
        pickle.dump(model, f)

    with open(os.path.join(artifact_dir, "scaler.pkl"), "wb") as f:
        pickle.dump(scaler, f)

    with open(os.path.join(artifact_dir, "metrics.json"), "w") as f:
        json.dump(metrics, f, indent=2)

    with open(os.path.join(artifact_dir, "classes.json"), "w") as f:
        json.dump(list(target_names), f)

    log.info("Artifacts saved to %s", artifact_dir)


def main() -> None:
    log.info("Starting Iris classifier training")

    config = load_config()

    # The platform mounts an immutable config snapshot at /workspace/config.yaml whose
    # schema may be the generic platform default rather than this project's configs/.
    # Read every field defensively with sensible defaults so a missing section never
    # crashes the run (see README-PYTHON.md — the script owns its config schema).
    training = config.get("training", {})
    epochs = int(training.get("epochs", 10))
    learning_rate = float(training.get("learning_rate", 0.01))
    test_size = float(training.get("test_size", 0.2))
    random_seed = int(training.get("random_seed", 42))
    max_iter = int(config.get("model", {}).get("max_iter", 1000))

    log.info(
        "Config loaded — epochs=%d  lr=%.4f  test_size=%.2f", epochs, learning_rate, test_size
    )

    log.info("Loading and splitting Iris dataset")
    X_train, X_test, y_train, y_test, scaler, target_names = prepare_data(config)
    log.info("Dataset ready — %d train / %d test samples", len(X_train), len(X_test))

    model = LogisticRegression(
        max_iter=max_iter,
        C=1.0 / learning_rate,
        random_state=random_seed,
    )

    log.info("Training for %d epochs", epochs)

    train_acc, val_acc = simulate_epoch_training(
        model, X_train, y_train, X_test, y_test, epochs
    )

    report = classification_report(
        y_test,
        model.predict(X_test),
        target_names=target_names,
        output_dict=True,
    )

    metrics = {
        "train_accuracy": round(train_acc, 4),
        "val_accuracy": round(val_acc, 4),
        "classification_report": report,
    }

    log.info("Final train_acc=%.4f  val_acc=%.4f", train_acc, val_acc)

    save_artifacts(config, model, scaler, metrics, target_names)
    log.info("Training complete")


if __name__ == "__main__":
    main()
