function getEl(id) { return document.getElementById(id); }
function setText(id, text) { const el = getEl(id); if (el) el.innerText = text; }
function show(id) { const el = getEl(id); if (el) el.style.display = ''; }
function hide(id) { const el = getEl(id); if (el) el.style.display = 'none'; }
function makeCSV(data) {
  return 'Имя,Местоположение\n' + data.map(d => `"${d.name}","${d.location}"`).join('\n');
}

export { makeCSV };