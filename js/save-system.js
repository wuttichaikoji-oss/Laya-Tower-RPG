window.SAVE_KEY = 'layaTowerRpgPhase1Build1';

window.loadGame = function loadGame() {
  try {
    const raw = localStorage.getItem(window.SAVE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
};

window.saveGame = function saveGame(data) {
  localStorage.setItem(window.SAVE_KEY, JSON.stringify(data));
};

window.resetGame = function resetGame() {
  localStorage.removeItem(window.SAVE_KEY);
};
