// ハイスコア保存 (localStorage)

const HISCORE_KEY = 'gensou_danmaku_hiscore_v1';

function loadHiScores() {
  try {
    const raw = localStorage.getItem(HISCORE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return {}; // { "Easy": 0, "Normal": 0, "Hard": 0 }
}

function saveHiScore(diff, sc) {
  const scores = loadHiScores();
  if (!scores[diff] || sc > scores[diff]) {
    scores[diff] = sc;
    try { localStorage.setItem(HISCORE_KEY, JSON.stringify(scores)); } catch (e) {}
    return true;
  }
  return false;
}

function getHiScore(diff) {
  const scores = loadHiScores();
  return scores[diff] || 0;
}

// グレイズ記録保存 (localStorage、ハイスコアと同じパターン)
const GRAZE_KEY = 'gensou_danmaku_graze_v1';

function loadGrazeRecords() {
  try {
    const raw = localStorage.getItem(GRAZE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return {}; // { "Easy": 0, "Normal": 0, "Hard": 0 }
}

function saveGrazeRecord(diff, count) {
  const records = loadGrazeRecords();
  if (!records[diff] || count > records[diff]) {
    records[diff] = count;
    try { localStorage.setItem(GRAZE_KEY, JSON.stringify(records)); } catch (e) {}
    return true;
  }
  return false;
}

function getGrazeRecord(diff) {
  const records = loadGrazeRecords();
  return records[diff] || 0;
}

// FPS カウンター表示設定 (F3 で切替、デフォルト ON、明示的に OFF にすれば保存される)
const FPS_VISIBLE_KEY = 'gensou_danmaku_fps_visible_v1';

function loadFpsVisible() {
  try {
    const v = localStorage.getItem(FPS_VISIBLE_KEY);
    if (v === null) return true;   // 未設定 (初回起動 or キー削除) はデフォルト ON
    return v === '1';
  } catch (e) { return true; }
}

function saveFpsVisible(v) {
  try { localStorage.setItem(FPS_VISIBLE_KEY, v ? '1' : '0'); } catch (e) {}
}
