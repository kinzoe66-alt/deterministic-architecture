/*
DIAGNOSTIC CYCLE
- One per run
- Owns stage trace only
*/

export function createDiagnosticCycle() {
  return {
    id: crypto.randomUUID(),
    status: "ACTIVE",
    startedAt: new Date().toISOString(),
    stages: []
  };
}

export function closeCycle(cycle) {
  cycle.status = "CLOSED";
  cycle.closedAt = new Date().toISOString();
}
