"""Helpers for loading and scoring the Cimeika visual axis manifest."""
from __future__ import annotations

import json
from pathlib import Path
from typing import Any, Dict, List, Set, Tuple

from backend.utils.sense_engine import SenseNode, map_resonance

MANIFEST_PATH = Path(__file__).resolve().parents[2] / "visual_axis_manifest.json"


def load_axis_manifest() -> Dict[str, Any]:
    """Load the shared visual axis manifest with a graceful fallback."""
    fallback = {
        "axes": {
            "plus": {"color": "#E7FAD9", "keywords": [], "symbol": "+"},
            "minus": {"color": "#9CAFBF", "keywords": [], "symbol": "-"},
        },
        "balance_rule": "each + has its −, each − has its +",
        "formula": "7 = булоєбуде = немаєвже = - + = Ci",
        "status": "fallback",
    }

    try:
        with MANIFEST_PATH.open("r", encoding="utf-8") as manifest_file:
            manifest = json.load(manifest_file)
            manifest["status"] = "loaded"
            return manifest
    except FileNotFoundError:
        fallback["error"] = "visual_axis_manifest.json missing"
    except json.JSONDecodeError:
        fallback["error"] = "visual_axis_manifest.json invalid JSON"

    return fallback


def _axis_nodes(manifest: Dict[str, Any]) -> List[SenseNode]:
    axes = manifest.get("axes", {})
    nodes: List[SenseNode] = []

    for name, payload in axes.items():
        keywords = payload.get("keywords", [])
        polarity = 1 if name == "plus" else -1
        weight = max(len(keywords), 1) / 4
        coordinates = (
            1.0 if polarity > 0 else 0.25,
            0.25 if polarity > 0 else 1.0,
            len(keywords) / 10.0 + 0.1,
        )
        nodes.append(SenseNode(tag=f"axis_{name}", weight=weight, polarity=polarity, coordinates=coordinates))

    return nodes


def _keyword_matches(axis_keywords: List[str], focus: Set[str]) -> Tuple[List[str], float]:
    normalized_keywords = [kw.lower() for kw in axis_keywords]
    matches = sorted({kw for kw in normalized_keywords if kw in focus})
    coverage = round(len(matches) / max(len(normalized_keywords), 1), 3)
    return matches, coverage


def score_axis_resonance(focus_keywords: List[str]) -> Dict[str, Any]:
    """Calculate resonance coverage for plus/minus axes based on focus keywords."""
    manifest = load_axis_manifest()
    axes = manifest.get("axes", {})
    focus = {kw.lower() for kw in focus_keywords}

    scores: Dict[str, Dict[str, Any]] = {}
    for name, payload in axes.items():
        axis_keywords = payload.get("keywords", [])
        matches, coverage = _keyword_matches(axis_keywords, focus)
        scores[name] = {
            "match_keywords": matches,
            "coverage": coverage,
            "color": payload.get("color"),
            "symbol": payload.get("symbol"),
        }

    coverage_vector = (
        scores.get("plus", {}).get("coverage", 0.0),
        scores.get("minus", {}).get("coverage", 0.0),
        len(focus) / 10.0,
    )
    resonance = map_resonance(_axis_nodes(manifest), coverage_vector)

    return {
        "manifest": manifest,
        "scores": scores,
        "resonance": resonance,
    }
