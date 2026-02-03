export function mountExpression() {
  const out = document.getElementById("out");
  if (!out) return;
  out.textContent = "SYSTEM STATE :: READY (Expression Layer Active)";
}
