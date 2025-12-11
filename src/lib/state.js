let latest = null;
let history = [];

export function setLatest(entry) {
  latest = entry;
  history.unshift(entry);     // add to start (newest first)

  // limit history to last 100 logs (optional)
  if (history.length > 100) history.pop();
}

export function getLatest() {
  return latest;
}

export function getHistory() {
  return history;
}
