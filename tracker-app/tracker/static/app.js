// Fast keyboard entry: Enter moves down a column, like a spreadsheet.
document.addEventListener("keydown", (e) => {
  const el = e.target;
  if (e.key !== "Enter" || !el.classList || !el.classList.contains("cell")) return;
  e.preventDefault();
  const col = el.dataset.col;
  const cells = [...document.querySelectorAll(`input.cell[data-col="${col}"]`)];
  const next = cells[cells.indexOf(el) + (e.shiftKey ? -1 : 1)];
  if (next) { next.focus(); next.select(); }
});
// Warn before leaving the entry page with unsaved changes.
let dirty = false;
document.addEventListener("input", (e) => { if (e.target.classList && e.target.classList.contains("cell")) dirty = true; });
document.addEventListener("submit", () => { dirty = false; });
window.addEventListener("beforeunload", (e) => { if (dirty) { e.preventDefault(); e.returnValue = ""; } });
