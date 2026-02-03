/*
DELTA EXPLAINER
- Explains prediction vs outcome
- No authority
*/

export function explainDelta(predicted = [], actual = []) {
  const out = [];

  actual.forEach(a => {
    const p = predicted.find(x => x.key === a.key);
    if (!p) {
      out.push(`${a.label}: NONE → ${a.weight}`);
    } else if (p.weight !== a.weight) {
      out.push(`${a.label}: ${p.weight} → ${a.weight}`);
    }
  });

  return out.length
    ? out.join("\n")
    : "No deviation between prediction and outcome.";
}
