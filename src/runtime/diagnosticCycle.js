/*
DIAGNOSTIC CYCLE
- One run = one object
- Immutable record
- No execution authority
*/

export function createDiagnosticCycle({ inputSnapshot }) {
  const cycle = {
    id: crypto.randomUUID(),
    startedAt: new Date().toISOString(),
    input: inputSnapshot,
    stages: [],
    status: "ACTIVE"
  };

  return Object.freeze(cycle);
}

export function closeDiagnosticCycle(cycle) {
  return Object.freeze({
    ...cycle,
    endedAt: new Date().toISOString(),
    status: "CLOSED"
  });
}
