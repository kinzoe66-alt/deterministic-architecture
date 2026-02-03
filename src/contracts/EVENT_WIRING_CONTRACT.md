# EVENT_WIRING_CONTRACT

Permitted Runtime Events:

1. INPUT_SUBMIT
   Source: Button click (explicit)
   Element ID: runBtn
   Effect: Creates new diagnostic cycle

2. PAGE_LOAD
   Source: Browser load
   Effect: UI initialization only
   No evaluation permitted

Forbidden Events:
- Keypress auto-submit
- Input change triggers
- Timers / intervals
- Background listeners
- Network callbacks

Rules:
- One event = one cycle
- Events cannot chain
- No implicit execution
- UI is passive unless triggered

Purpose:
Guarantee human-terminated, deterministic execution.

Input Rules:
- Input is captured once per run
- Snapshot is immutable
- Downstream systems consume snapshot only
- No live reads from DOM after capture
