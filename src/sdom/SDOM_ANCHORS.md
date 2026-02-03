# SDOM_ANCHOR_DECLARATIONS

Purpose:
Define allowed DOM regions and their schema roles.

Anchors:

1. ROOT_SURFACE
   - Location: <main>
   - Role: System-wide diagnostic output
   - Content: Readouts only
   - No input, no controls

2. INPUT_SURFACE
   - Location: Decision input card
   - Role: Raw human input ingestion
   - Content: Text only
   - Immutable once submitted

3. CONTROL_SURFACE
   - Location: Button / trigger regions
   - Role: Initiate diagnostic cycles
   - No data interpretation

4. STATUS_SURFACE
   - Location: Pills / badges / headers
   - Role: Mode + state indicators only
   - Non-interactive

Rules:
- Anchors may not overlap
- Anchors may not assume authority of other anchors
- Styling must not imply authority
- SDOM maps to anchors, not visual layout

Notes:
These anchors are permanent.
Future features must bind to an anchor or be rejected.
