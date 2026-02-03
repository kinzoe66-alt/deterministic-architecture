/*
STAGE REGISTRY
- Records stage activity into a diagnostic cycle
- No logic, no decisions, no branching
*/

export function registerStage(cycle, stage) {
  if (cycle.status !== "ACTIVE") {
    throw new Error("Cannot register stage on closed cycle");
  }

  const entry = Object.freeze({
    stage: stage.name,
    timestamp: new Date().toISOString(),
    inputs: stage.inputs || null,
    outputs: stage.outputs || null,
    notes: stage.notes || null
  });

  cycle.stages.push(entry);
}
