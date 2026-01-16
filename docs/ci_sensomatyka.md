# Ci Sensomatyka

The sensomatyka model treats each intent as a **Sense** with context, polarity, and coordinates in a conceptual field.

- **SenseNode**: `{ tag, weight, polarity, coordinates }`
- **Polarity**: `+` indicates active resonance, `-` indicates potential energy.
- **Resonance**: cosine-like score between query vector and node coordinates, scaled by polarity and weight.
- **Vector of change**: shifts in resonance over time, reflected by timeline visualizations.

The FastAPI layer exposes resonance metadata on `/ci/chat` and aligns module responses based on these scores. The orchestrator schedules tasks in the order of semantic priority, allowing Ci to keep modules synchronized.
