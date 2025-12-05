from dataclasses import dataclass, field
from typing import Dict, List, Tuple


@dataclass
class SenseNode:
    tag: str
    weight: float
    polarity: int
    coordinates: Tuple[float, float, float] = field(default_factory=lambda: (0.0, 0.0, 0.0))

    def resonance(self, query_vector: Tuple[float, float, float]) -> float:
        """Calculate a lightweight cosine-like resonance score."""
        if not query_vector:
            return 0.0
        dot = sum(a * b for a, b in zip(self.coordinates, query_vector))
        norm_node = sum(a * a for a in self.coordinates) ** 0.5 or 1.0
        norm_query = sum(a * a for a in query_vector) ** 0.5 or 1.0
        base = dot / (norm_node * norm_query)
        polarity_boost = 1.0 if self.polarity > 0 else 0.85
        return round(base * self.weight * polarity_boost, 4)


def map_resonance(nodes: List[SenseNode], query: Tuple[float, float, float]) -> Dict[str, float]:
    """Return resonance scores for a list of SenseNodes against a query vector."""
    return {node.tag: node.resonance(query) for node in nodes}
