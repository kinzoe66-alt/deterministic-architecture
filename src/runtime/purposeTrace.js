/*
PURPOSE TRACE
- Captures prediction state only
- No authority
*/

export function registerPurposePrediction(cycle, raw, signals) {
  if (!cycle) return;
  cycle.stages.push({
    name: "PURPOSE_PREDICTION",
    timestamp: new Date().toISOString(),
    rawInput: raw,
    predictedSignals: signals
  });
}
