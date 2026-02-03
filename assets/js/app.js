import { bindSchema } from "../../sdom/bind.js";

fetch("./schema/schema.json")
  .then(r => r.json())
  .then(schema => {
    bindSchema(schema);
    console.log("CHECKPOINT 20 :: schema bound");
  });

console.log("OBISTAR :: app.js loaded");
