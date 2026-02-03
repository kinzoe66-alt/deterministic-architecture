/*
  TEST MODE: payment gate OFF.
  Deterministic output: same input -> same structure.
*/

const $ = (id) => document.getElementById(id);

function normalize(text){
  return (text || "").trim();
}

function hash32(str){
  // deterministic non-crypto hash
  let h = 2166136261;
  for (let i=0;i<str.length;i++){
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0);
}

function classifyScope(text){
  const t = text.toLowerCase();
  const score =
    (t.includes("board")||t.includes("ceo")||t.includes("acquisition")||t.includes("lawsuit")||t.includes("regulatory")||t.includes("layoff")||t.includes("restructure") ? 3 : 0) +
    (t.includes("budget")||t.includes("team")||t.includes("hiring")||t.includes("deadline")||t.includes("milestone")||t.includes("roadmap") ? 2 : 0) +
    (t.includes("feature")||t.includes("launch")||t.includes("marketing")||t.includes("pricing")||t.includes("time") ? 1 : 0);

  if (score >= 5) return "EXECUTIVE";
  if (score >= 2) return "OPERATIONAL";
  return "TACTICAL";
}

function buildReadout(input){
  const text = normalize(input);
  const h = hash32(text);
  const scope = classifyScope(text);

  // deterministic “signals”
  const hasConflict = /\bbut\b|\bhowever\b|\bversus\b|\bor\b/i.test(text);
  const timePressure = /\b(urgent|deadline|today|this week|30 days|immediately)\b/i.test(text);
  const resourcePressure = /\b(cash|budget|runway|limited|burn|headcount|capacity)\b/i.test(text);
  const irreversibility = /\b(layoff|terminate|sell|acquire|lawsuit|regulatory|merge)\b/i.test(text);

  const summary = [
    "STRUCTURAL SUMMARY",
    "------------------",
    `• Scope: ${scope}`,
    `• Conflict Signal: ${hasConflict ? "Present" : "Not explicit"}`,
    `• Time Pressure: ${timePressure ? "Present" : "Not explicit"}`,
    `• Resource Pressure: ${resourcePressure ? "Present" : "Not explicit"}`,
    `• Irreversibility Risk: ${irreversibility ? "Present" : "Not explicit"}`,
    `• Deterministic Fingerprint: ${h}`
  ].join("\n");

  const tactical = [
    "TACTICAL READ",
    "------------",
    "What you asked is framed as a choice, but the decision is constrained by one limiting factor.",
    "Identify the single constraint you cannot violate (time, cash, credibility, or capacity).",
    "If you cannot state the constraint, the decision is not yet formable."
  ].join("\n");

  const operational = [
    "OPERATIONAL READ",
    "----------------",
    "You are balancing competing objectives inside the same resource envelope.",
    "Sequence first: stabilize the constraint, then pursue the objective.",
    "If you attempt both simultaneously, you convert uncertainty into drift."
  ].join("\n");

  const executive = [
    "EXECUTIVE READ",
    "--------------",
    "This decision changes the system you will be operating in after the decision.",
    "The risk is not the choice itself — it is locking irreversibility before alignment.",
    "Declare the governing principle, then force all options to satisfy it. If none can, stop."
  ].join("\n");

  return [summary, "", tactical, "", operational, "", executive].join("\n");
}

function run(){
  const text = $("input").value;
  const out = $("out");
  const clean = normalize(text);

  if (!clean){
    out.textContent = "(No input. Add a decision statement.)";
    return;
  }

  out.textContent = buildReadout(clean);
}

document.addEventListener("DOMContentLoaded", () => {
  $("runBtn").addEventListener("click", run);
});
