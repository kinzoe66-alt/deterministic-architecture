
Invariant: Diagnostic Cycle
- Exactly one cycle per run
- Cycle is immutable once closed
- No cross-cycle reads
- Cycle explains, never decides

Invariant: Stage Registration
- Stages append only
- No stage may mutate another
- Registration is observational only
