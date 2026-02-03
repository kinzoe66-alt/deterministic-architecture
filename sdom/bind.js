export function bindSchema(schema) {
  Object.entries(schema.components).forEach(([key, c]) => {
    const el = document.querySelector(c.mount);
    if (el) {
      el.dataset.schema = key;
      el.dataset.role = c.role;
    }
  });
}
