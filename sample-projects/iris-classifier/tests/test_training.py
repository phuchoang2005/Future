import os
import re
import sys
import tempfile

import pytest
import yaml

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))


SAMPLE_CONFIG = {
    "training": {
        "epochs": 3,
        "batch_size": 32,
        "learning_rate": 0.01,
        "test_size": 0.2,
        "random_seed": 42,
    },
    "model": {"type": "logistic_regression", "max_iter": 1000},
    "artifact_path": "outputs/models",
}


@pytest.fixture()
def workspace(tmp_path):
    config_path = tmp_path / "config.yaml"
    config_path.write_text(yaml.dump(SAMPLE_CONFIG))
    os.environ["WORKSPACE"] = str(tmp_path)
    yield tmp_path
    del os.environ["WORKSPACE"]


def test_config_loading(workspace):
    import importlib
    import main as m

    importlib.reload(m)
    config = m.load_config()
    assert config["training"]["epochs"] == 3
    assert config["training"]["learning_rate"] == 0.01
    assert config["artifact_path"] == "outputs/models"


def test_data_preparation(workspace):
    import importlib
    import main as m

    importlib.reload(m)
    config = m.load_config()
    X_train, X_test, y_train, y_test, scaler, target_names = m.prepare_data(config)
    assert X_train.shape[1] == 4, "Iris has 4 features"
    assert len(X_train) + len(X_test) == 150
    assert set(y_train).issubset({0, 1, 2})


def test_progress_line_format(workspace, capsys):
    import importlib
    import main as m
    from sklearn.datasets import load_iris
    from sklearn.linear_model import LogisticRegression
    from sklearn.model_selection import train_test_split
    from sklearn.preprocessing import StandardScaler

    importlib.reload(m)
    config = m.load_config()
    X_train, X_test, y_train, y_test, scaler, _ = m.prepare_data(config)

    model = LogisticRegression(max_iter=1000, random_state=42)
    m.simulate_epoch_training(model, X_train, y_train, X_test, y_test, epochs=3)

    out = capsys.readouterr().out
    assert re.search(r"(?i)epoch\s+\d+\s*/\s*\d+", out), (
        "Training must emit 'Epoch N/M' lines for the progress bar"
    )


def test_artifacts_saved(workspace):
    import importlib
    import main as m
    from sklearn.datasets import load_iris
    from sklearn.linear_model import LogisticRegression
    from sklearn.preprocessing import StandardScaler

    importlib.reload(m)
    config = m.load_config()
    X_train, X_test, y_train, y_test, scaler, target_names = m.prepare_data(config)

    model = LogisticRegression(max_iter=1000, random_state=42)
    model.fit(X_train, y_train)

    metrics = {"train_accuracy": 0.95, "val_accuracy": 0.93}
    m.save_artifacts(config, model, scaler, metrics, target_names)

    artifact_dir = workspace / "outputs" / "models"
    assert (artifact_dir / "model.pkl").exists()
    assert (artifact_dir / "scaler.pkl").exists()
    assert (artifact_dir / "metrics.json").exists()
    assert (artifact_dir / "classes.json").exists()
