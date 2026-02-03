/*
INTERNAL DIAGNOSTIC LEDGER (IDL)
- Append-only
- Read-only
- No inference
*/

const ledger = [];

export function writeIDL(entry) {
  ledger.push({
    timestamp: new Date().toISOString(),
    ...entry
  });
}

export function readIDL() {
  return [...ledger];
}
