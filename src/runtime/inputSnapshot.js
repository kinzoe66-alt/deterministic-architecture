/*
INPUT SNAPSHOT MODULE
- Captures input once
- Freezes it
- No mutation allowed
*/

export function captureInput(text) {
  const snapshot = {
    value: text,
    timestamp: new Date().toISOString(),
    length: text.length
  };

  return Object.freeze(snapshot);
}
