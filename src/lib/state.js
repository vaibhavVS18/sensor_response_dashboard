let latest = null;
let history = [];

export function setLatest(entry) {
  latest = entry;

  history.unshift(entry);

  // Keep only last 100 entries
  if (history.length > 100) {
    history.length = 100; // faster than pop()
  }
}

export function getLatest() {
  return latest ? { ...latest } : null; // avoid external mutation
}

export function getHistory() {
  return [...history]; // return a shallow copy
}
