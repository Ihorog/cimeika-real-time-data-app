import json

from backend.utils import axis_loader


def test_mixed_case_manifest_keywords_register(monkeypatch, tmp_path):
    manifest_path = tmp_path / "visual_axis_manifest.json"
    manifest_payload = {
        "axes": {
            "plus": {
                "color": "#E7FAD9",
                "keywords": ["Flow", "SPARK"],
                "symbol": "+",
            },
            "minus": {
                "color": "#9CAFBF",
                "keywords": ["Root", "Echo"],
                "symbol": "-",
            },
        },
        "balance_rule": "each + has its −, each − has its +",
        "formula": "7 = булоєбуде = немаєвже = - + = Ci",
    }
    manifest_path.write_text(json.dumps(manifest_payload), encoding="utf-8")
    monkeypatch.setattr(axis_loader, "MANIFEST_PATH", manifest_path)

    result = axis_loader.score_axis_resonance(["flow", "ROOT"])

    plus_scores = result["scores"]["plus"]
    minus_scores = result["scores"]["minus"]

    assert plus_scores["match_keywords"] == ["flow"]
    assert plus_scores["coverage"] > 0
    assert minus_scores["match_keywords"] == ["root"]
    assert minus_scores["coverage"] > 0
    assert result["resonance"]["axis_plus"] > 0
    assert result["resonance"]["axis_minus"] > 0
