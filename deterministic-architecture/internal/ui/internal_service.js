/* OB-STAR Internal Service
   - Left: renders internal/kernel.md (+ TOC)
   - Right: Formal intake -> deterministic diagnostic suggestions (no execution)
*/

const $ = (id) => document.getElementById(id);

const state = {
  kernelRaw: "",
  headings: [],
  draftText: "",
};

function escapeHtml(s){
  return s.replace(/[&<>"']/g, (c)=>({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
  }[c]));
}

/** Minimal markdown renderer (headings, lists, code fences, paragraphs) */
function renderMarkdown(md){
  const lines = md.replace(/\r\n/g,"\n").split("\n");
  let html = "";
  let inCode = false;
  let codeBuf = [];
  let inList = false;

  const flushList = () => { if(inList){ html += "</ul>"; inList=false; } };
  const flushCode = () => {
    if(inCode){
      html += `<pre><code>${escapeHtml(codeBuf.join("\n"))}</code></pre>`;
      inCode=false; codeBuf=[];
    }
  };

  for(let i=0;i<lines.length;i++){
    const line = lines[i];

    if(line.trim().startsWith("```")){
      if(inCode){ flushCode(); }
      else { flushList(); inCode=true; }
      continue;
    }
    if(inCode){ codeBuf.push(line); continue; }

    const h = line.match(/^(#{1,6})\s+(.*)$/);
    if(h){
      flushList();
      const level = h[1].length;
      const text = h[2].trim();
      const id = `h_${i}_${text.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"")}`;
      html += `<h${Math.min(level,3)} id="${id}">${escapeHtml(text)}</h${Math.min(level,3)}>`;
      continue;
    }

    const li = line.match(/^\s*-\s+(.*)$/);
    if(li){
      if(!inList){ html += "<ul>"; inList=true; }
      html += `<li>${escapeHtml(li[1].trim())}</li>`;
      continue;
    } else {
      flushList();
    }

    if(line.trim()===""){
      html += `<div style="height:6px"></div>`;
      continue;
    }

    html += `<p>${escapeHtml(line)}</p>`;
  }

  flushList();
  flushCode();
  return html;
}

function extractHeadings(md){
  const lines = md.replace(/\r\n/g,"\n").split("\n");
  const hs = [];
  for(let i=0;i<lines.length;i++){
    const m = lines[i].match(/^(#{1,6})\s+(.*)$/);
    if(m){
      const level = m[1].length;
      const text = m[2].trim();
      const id = `h_${i}_${text.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"")}`;
      hs.push({ level, text, id });
    }
  }
  return hs;
}

function buildTOC(headings){
  const toc = $("tocList");
  toc.innerHTML = "";
  if(!headings.length){
    toc.innerHTML = `<div class="muted">No headings found.</div>`;
    return;
  }
  headings.forEach(h=>{
    const div = document.createElement("div");
    div.className = "tocItem";
    div.style.paddingLeft = `${Math.min(22,(h.level-1)*10)}px`;
    div.innerHTML = `<div class="h lvl">H${h.level}</div><div class="t">${escapeHtml(h.text)}</div>`;
    div.addEventListener("click", ()=>{
      const el = document.getElementById(h.id);
      if(el) el.scrollIntoView({behavior:"smooth",block:"start"});
    });
    toc.appendChild(div);
  });
}

async function loadKernel(){
  $("kernelStatus").textContent = "loading…";
  $("kernelStatus").className = "pill";
  try{
    const res = await fetch("../kernel.md", { cache: "no-store" });
    if(!res.ok) throw new Error(`HTTP ${res.status}`);
    const md = await res.text();
    state.kernelRaw = md;
    state.headings = extractHeadings(md);
    $("kernelRender").innerHTML = renderMarkdown(md);
    buildTOC(state.headings);
    $("kernelStatus").textContent = "loaded";
    $("kernelStatus").className = "pill";
  }catch(e){
    $("kernelRender").innerHTML = `<div class="muted">Failed to load internal/kernel.md. Error: ${escapeHtml(String(e))}</div>`;
    $("kernelStatus").textContent = "missing";
    $("kernelStatus").className = "pill muted";
  }
}

/** Deterministic intake classification (no recommendations; placement + missing fields) */
function diagnoseIntake(text){
  const t = (text || "").toLowerCase();

  const has = (kw) => t.includes(kw);
  const cues = {
    upwork: has("upwork"),
    tos: has("terms") || has("tos") || has("policy") || has("rules"),
    api: has("api") || has("webhook") || has("oauth") || has("token"),
    compliance: has("compliance") || has("gdpr") || has("hipaa") || has("pci") || has("soc 2") || has("soc2"),
    crm: has("crm") || has("hubspot") || has("salesforce") || has("pipedrive") || has("zoho"),
    data: has("data") || has("schema") || has("database") || has("etl") || has("migration"),
    scheduling: has("schedule") || has("cron") || has("queue"),
    environment: has("environment") || has("marketplace") || has("platform"),
    entity: has("company") || has("client") || has("vendor") || has("entity"),
    constraints: has("constraint") || has("must") || has("shall") || has("required") || has("prohibited"),
  };

  // Determine "ledger class"
  let ledgerClass = "UNKNOWN";
  if(cues.tos || cues.compliance) ledgerClass = "ENVIRONMENT_CONSTRAINT_LEDGER";
  else if(cues.api) ledgerClass = "CAPABILITY_LEDGER__INTEGRATION";
  else if(cues.crm || cues.data) ledgerClass = "CAPABILITY_LEDGER__DATA_PIPELINE";
  else if(cues.scheduling) ledgerClass = "CAPABILITY_LEDGER__SCHEDULING";
  else if(cues.environment) ledgerClass = "ENVIRONMENT_DESCRIPTOR";
  else if(cues.constraints) ledgerClass = "CONSTRAINT_PACKET";
  else if(text.trim().length) ledgerClass = "UNCLASSIFIED_INPUT";

  // Suggested placement (repo path)
  let placement = "UNKNOWN_UNDER_CURRENT_SCHEMA";
  if(ledgerClass === "ENVIRONMENT_DESCRIPTOR") placement = "filtration/environments/<env>/ENVIRONMENT_DESCRIPTOR.md";
  if(ledgerClass === "ENVIRONMENT_CONSTRAINT_LEDGER") placement = "filtration/environments/<env>/TERMS_OR_CONSTRAINTS.md";
  if(ledgerClass.startsWith("CAPABILITY_LEDGER")) placement = "filtration/capabilities/<capability>.md";

  // Environment hint
  let envHint = "UNKNOWN";
  if(cues.upwork) envHint = "upwork_real";
  else if(cues.environment) envHint = "custom_env";

  // Required minimum fields (deterministic checklist)
  const required = [];
  if(ledgerClass.includes("ENVIRONMENT")){
    required.push("ENVIRONMENT_NAME");
    required.push("STABILITY_PROFILE");
    required.push("INCENTIVE_STRUCTURE");
    required.push("ENTRY_CONDITIONS");
  }
  if(ledgerClass.includes("CAPABILITY_LEDGER")){
    required.push("CAPABILITY_NAME");
    required.push("INPUT_SURFACES");
    required.push("CONSTRAINTS");
    required.push("RATIONALE");
  }
  if(required.length === 0) {
    required.push("INTENT");
    required.push("SOURCE");
  }

  // FWF hinting (non-prescriptive)
  const fwfs = [];
  if(cues.upwork) fwfs.push("FWF: BID_COMPETITION_VOLATILITY");
  if(cues.tos) fwfs.push("FWF: COMPLIANCE_BOUNDARY_AMBIGUITY");
  if(cues.api) fwfs.push("FWF: AUTH_FAILURE_OR_RATE_LIMITING");
  if(cues.crm) fwfs.push("FWF: PIPELINE_STATE_DRIFT");
  if(cues.data) fwfs.push("FWF: SCHEMA_MISMATCH_OR_DATA_QUALITY");
  if(fwfs.length === 0) fwfs.push("FWF: UNKNOWN_UNDER_CURRENT_INPUT");

  // Build diagnostic output
  const out = [];
  out.push(`# DIAGNOSTIC_RESULT`);
  out.push(`TIMESTAMP_UTC: ${new Date().toISOString()}`);
  out.push(``);
  out.push(`RECOGNIZED_ENVIRONMENT_HINT: ${envHint}`);
  out.push(`LEDGER_CLASS: ${ledgerClass}`);
  out.push(`SUGGESTED_PLACEMENT: ${placement.replace("<env>", envHint)}`);
  out.push(``);
  out.push(`RECOGNITION_CUES:`);
  Object.entries(cues).forEach(([k,v])=> out.push(`- ${k.toUpperCase()}: ${v ? "TRUE" : "FALSE"}`));
  out.push(``);
  out.push(`REQUIRED_FIELDS_MINIMUM:`);
  required.forEach(r=> out.push(`- ${r}`));
  out.push(``);
  out.push(`FWF_SIGNAL_HINTS (DESCRIPTIVE_ONLY):`);
  fwfs.forEach(f=> out.push(`- ${f}`));
  out.push(``);
  out.push(`NEXT_ACTION (DOCUMENT_ONLY):`);
  out.push(`- Convert intake into a ledger file at SUGGESTED_PLACEMENT.`);
  out.push(`- Do not execute. Only record + bind measurement if testing.`);

  return out.join("\n");
}

function generateDraftFromIntake(text){
  const t = (text || "").trim();
  const now = new Date().toISOString();
  const guessEnv = t.toLowerCase().includes("upwork") ? "upwork_real" : "custom_env";

  // Draft is a “packet of constraints” that can be pasted into repo
  return [
    `# LEDGER_DRAFT`,
    `TIMESTAMP_UTC: ${now}`,
    ``,
    `## IDENTIFIERS`,
    `ENVIRONMENT_NAME: ${guessEnv}`,
    `LEDGER_NAME: <name_this_ledger>`,
    `SOURCE: intake`,
    ``,
    `## INTENT`,
    `<describe what this ledger constrains or enables>`,
    ``,
    `## CONSTRAINTS`,
    `<list constraints as bullet points>`,
    ``,
    `## INPUT_SURFACES`,
    `- TEXT`,
    `- FILE_UPLOAD (if applicable)`,
    ``,
    `## MEASUREMENT_BINDINGS (OPTIONAL)`,
    `- SIGNAL: <signal_name>`,
    `- SOURCE: filtration/observations/${guessEnv}/LOG.md`,
    `- CONDITION: <event_condition>`,
    ``,
    `## RAW_INTAKE_COPY`,
    `\`\`\``,
    t || "<empty>",
    `\`\`\``,
    ``,
    `## NOTES`,
    `- Descriptive only. No recommendations.`,
    `- Promotion requires explicit human authorization.`
  ].join("\n");
}

function setDiag(text){
  $("diagOutput").innerHTML = `<pre style="margin:0"><code>${escapeHtml(text)}</code></pre>`;
}

function setPill(mode){
  const pill = $("diagPill");
  if(mode==="idle"){ pill.textContent="idle"; pill.className="pill muted"; return; }
  if(mode==="ok"){ pill.textContent="diagnosed"; pill.className="pill"; return; }
  if(mode==="warn"){ pill.textContent="insufficient_input"; pill.className="pill"; return; }
}

function downloadTextFile(filename, content){
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

// Wire UI
window.addEventListener("DOMContentLoaded", async ()=>{
  await loadKernel();

  $("reloadKernel").addEventListener("click", loadKernel);

  $("clearIntake").addEventListener("click", ()=>{
    $("intakeText").value = "";
    state.draftText = "";
    $("downloadDraft").disabled = true;
    setDiag("CLEARED");
    setPill("idle");
  });

  $("fileInput").addEventListener("change", (e)=>{
    const file = e.target.files && e.target.files[0];
    if(!file) return;
    const reader = new FileReader();
    reader.onload = () => { $("intakeText").value = String(reader.result || ""); };
    reader.readAsText(file);
  });

  $("diagnose").addEventListener("click", ()=>{
    const text = $("intakeText").value || "";
    if(text.trim().length < 20){
      setDiag("# DIAGNOSTIC_RESULT\nINSUFFICIENT_INPUT: Provide more than 20 characters.");
      setPill("warn");
      return;
    }
    const result = diagnoseIntake(text);
    setDiag(result);
    setPill("ok");
  });

  $("generateDraft").addEventListener("click", ()=>{
    const text = $("intakeText").value || "";
    state.draftText = generateDraftFromIntake(text);
    $("downloadDraft").disabled = false;
    setDiag(state.draftText);
    setPill("ok");
  });

  $("downloadDraft").addEventListener("click", ()=>{
    if(!state.draftText) return;
    const ts = new Date().toISOString().replace(/[:.]/g,"-");
    downloadTextFile(`ledger_draft_${ts}.md`, state.draftText);
  });
});
