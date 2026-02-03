# DIAGNOSTIC_CYCLE_BOUNDARY

Definition:
A diagnostic cycle begins at explicit user trigger
and ends after readout is rendered.

Cycle Stages:
1. INPUT_CAPTURE
   - Raw text snapshot
   - Immutable for cycle

2. EVALUATION
   - Deterministic processing
   - No external memory access

3. OUTPUT_RENDER
   - Readout written to ROOT_SURFACE
   - No side effects

4. TERMINATION
   - Cycle is closed
   - State is discarded

Rules:
- One click = one cycle
- Page refresh = zero cycles
- No cycle may read another cycle
- No partial cycles allowed

Purpose:
Prevent loops, drift, and ghost state.
