import { MOUNTS } from "../sdom/mounts.js";

export function mountWorkspace() {
  const root = document.getElementById(MOUNTS.workspace);
  if (!root) throw new Error("Workspace mount not found");
  root.setAttribute("data-mounted", "true");
}
