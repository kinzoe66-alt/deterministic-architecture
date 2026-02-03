console.log("CHECKPOINT 22 :: output surface bound");
import { mountExpression } from "./express/mount.js";
import { bindSchema } from "../../sdom/bind.js";

fetch("./schema/schema.json")
  .then(r => r.json())
  .then(schema => {
    bindSchema(schema);
    console.log("CHECKPOINT 20 :: schema bound");
  });

console.log("OBISTAR :: app.js loaded");

console.log("CHECKPOINT 21 :: expression mount ready");
document.addEventListener("DOMContentLoaded", mountExpression);

