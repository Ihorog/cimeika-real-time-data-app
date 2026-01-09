# Ci Core

The Ci core coordinates every module by translating user intent into orchestrator tasks and sense vectors.

- **Navigation**: resolves which module should respond based on resonance scores from `SenseNode`.
- **Analytics**: aggregates module health, uptime, and resonance metrics exposed at `/ci/data` and `/ci/components`.
- **Dialogue**: `/ci/chat` echoes the Ci assistant behavior and annotates replies with resonance scores.
