# RUNTIME_STATE_DECLARATION

Allowed Runtime State (Read-Only After Init):

state = {
  cycle_id: string,        // unique per trigger
  input_text: string,      // immutable snapshot
  timestamp: ISO8601,      // cycle start time

  evaluation: {
    signals: array,        // deterministic outputs
    scope: string,         // where decision lives
    confidence: string     // structural confidence
  },

  output: {
    rendered: boolean      // confirms surface write
  }
}

Rules:
- State is created at INPUT_CAPTURE
- State is frozen before EVALUATION
- No mutation after freeze
- State is destroyed at TERMINATION
- No global state permitted
- No cross-cycle access permitted

Purpose:
Ensure determinism, debuggability, and zero drift.
