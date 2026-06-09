"use strict";

const STORAGE_KEY = "rf4-seed-level-progress-v1";

const SEASON_SCORE = {
  "☆": 5,
  "★": 4,
  "◎": 3,
  "○": 2,
  "●": 1,
  "△": 0,
  "▲": -1,
  "×": -2,
  "－": -3
};

const SEASONS = [
  ["spring", "春"],
  ["summer", "夏"],
  ["autumn", "秋"],
  ["winter", "冬"]
];

// Crop names and season marks are based on the Rune Factory 4 Wiki crop list.
// https://wikiwiki.jp/rune4/農作業
const ITEMS = [
  crop("turnip", "カブ", "野菜", "○◎◎△"),
  crop("potato", "ジャガイモ", "野菜", "○◎○△"),
  crop("spinach", "ホウレン草", "野菜", "○○◎○"),
  crop("radish", "ダイコン", "野菜", "○△◎○"),
  crop("sweet-potato", "サツマイモ", "野菜", "○◎◎△"),
  crop("pumpkin", "カボチャ", "野菜", "◎◎○△"),
  crop("cucumber", "キュウリ", "野菜", "◎◎○△"),
  crop("carrot", "ニンジン", "野菜", "○○◎○"),
  crop("corn", "トウモロコシ", "野菜", "◎◎○△"),
  crop("strawberry", "イチゴ", "野菜", "◎○◎○"),
  crop("leek", "ネギ", "野菜", "◎△◎○"),
  crop("pink-turnip", "サクラカブ", "野菜", "◎○○△"),
  crop("bell-pepper", "ピーマン", "野菜", "○◎○△"),
  crop("eggplant", "ナス", "野菜", "◎◎○△"),
  crop("hot-hot-fruit", "ほかほかの実", "野菜", "○△○◎"),
  crop("fodder", "牧草", "野菜", "○○○○"),
  crop("chinese-cabbage", "白菜", "野菜", "○△◎○"),
  crop("cabbage", "キャベツ", "野菜", "◎○◎○"),
  crop("onion", "タマネギ", "野菜", "○○◎○"),
  crop("tomato", "トマト", "野菜", "◎◎○△"),
  crop("emery-flower", "オトメロン", "野菜", "◎◎○△"),
  crop("pineapple", "パイナップル", "野菜", "△◎△△"),
  crop("gold-potato", "金ジャガイモ", "野菜", "○△○◎"),
  crop("gold-pumpkin", "金カボチャ", "野菜", "○△○◎"),
  crop("gold-cabbage", "金キャベツ", "野菜", "○△○◎"),
  crop("gold-turnip", "金カブ", "野菜", "○△○◎"),
  crop("dungeon-seed", "ダンジョンの種", "特殊", "○○○○"),
  crop("sword-seed", "剣の種", "特殊", "○○○○"),
  crop("shield-seed", "盾の種", "特殊", "○○○○"),
  crop("twinkle-tree", "キラメ木", "果樹", "○○○△"),
  crop("orange-tree", "オレンジ", "果樹", "○○○○"),
  crop("grape-tree", "ブドウ", "果樹", "○○○○"),
  crop("apple-tree", "リンゴ", "果樹", "○○○○"),
  crop("toyherb", "トイハーブ", "花", "◎○○△"),
  crop("pink-cat", "ピンクキャット", "花", "○◎○△"),
  crop("moondrop", "ムーンドロップ", "花", "◎○◎△"),
  crop("charm-blue", "チャームブルー", "花", "○○◎△"),
  crop("cherry-grass", "サクラ草", "花", "◎○○△"),
  crop("empoison", "タンポイズン", "花", "○○◎△"),
  crop("lamp-grass", "ランプ草", "花", "○○○◎"),
  crop("ironleaf", "鉄千輪", "花", "○△○◎"),
  crop("clover", "クローバー", "花", "◎△◎○"),
  crop("autumn-grass", "花紅葉", "花", "○○◎△"),
  crop("tree-grass", "ツリー草", "花", "○△○◎"),
  crop("fireflower", "野之花火", "花", "○◎○△"),
  crop("white-crystal-flower", "金剛花", "花", "○○○○"),
  crop("blue-crystal", "青水晶", "花", "◎△△△"),
  crop("green-crystal", "緑水晶", "花", "△◎△△"),
  crop("red-crystal", "赤水晶", "花", "△△◎△"),
  crop("white-crystal", "白水晶", "花", "△△△◎")
];

let progress = loadProgress();
let currentFilter = "all";

const list = document.querySelector("#crop-list");
const emptyMessage = document.querySelector("#empty-message");
const menuButton = document.querySelector("#menu-button");
const appMenu = document.querySelector("#app-menu");
const exportButton = document.querySelector("#export-button");
const filterButtons = Array.from(document.querySelectorAll(".filter-button"));

render();

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    currentFilter = button.dataset.filter;
    filterButtons.forEach((item) => {
      item.classList.toggle("is-active", item === button);
    });
    render();
  });
});

menuButton.addEventListener("click", (event) => {
  event.stopPropagation();
  setMenuOpen(appMenu.hidden);
});

exportButton.addEventListener("click", () => {
  exportMarkdown();
  setMenuOpen(false);
});

document.addEventListener("click", (event) => {
  if (appMenu.hidden || appMenu.contains(event.target) || menuButton.contains(event.target)) {
    return;
  }

  setMenuOpen(false);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    setMenuOpen(false);
  }
});

list.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-action]");
  if (!button) {
    return;
  }

  const id = button.closest(".crop-card").dataset.id;
  const level = progress[id] ?? null;

  if (button.dataset.action === "decrease") {
    progress[id] = level === null ? null : Math.max(1, level - 1);
  }

  if (button.dataset.action === "increase") {
    progress[id] = level === null ? 1 : Math.min(10, level + 1);
  }

  if (button.dataset.action === "toggle-max") {
    progress[id] = level === 10 ? null : 10;
  }

  saveProgress();
  render();
});

function crop(id, name, category, seasonMarks) {
  const seasons = SEASONS.map(([key, label], index) => ({
    key,
    label,
    mark: seasonMarks[index] ?? "－"
  }));

  return {
    id,
    name,
    category,
    seasons,
    bestSeasons: getBestSeasons(seasons),
    weakSeasons: getWeakSeasons(seasons)
  };
}

function getBestSeasons(seasons) {
  const bestScore = Math.max(...seasons.map((season) => SEASON_SCORE[season.mark]));
  const best = seasons.filter((season) => SEASON_SCORE[season.mark] === bestScore);
  return best.length === seasons.length ? ["通年"] : best.map((season) => season.label);
}

function getWeakSeasons(seasons) {
  const weak = seasons.filter((season) => SEASON_SCORE[season.mark] <= 0);
  return weak.length === 0 ? ["なし"] : weak.map((season) => season.label);
}

function render() {
  const items = ITEMS.filter(matchesFilter);
  list.replaceChildren(...items.map(createCard));
  emptyMessage.hidden = items.length > 0;
}

function createCard(item) {
  const level = progress[item.id] ?? null;
  const card = document.createElement("article");
  card.className = "crop-card";
  card.classList.toggle("is-level-max", level === 10);
  card.dataset.id = item.id;

  const categoryClass = categoryClassName(item.category);
  const levelLabel = level === null ? "未確認" : `Lv ${level}`;
  const toggleLabel = level === 10 ? "未確認" : "Lv10";
  const toggleClass = level === 10 ? "is-reset" : "";
  const toggleAria = level === 10 ? `${item.name}を未確認に戻す` : `${item.name}をLv10にする`;

  card.innerHTML = `
    <div class="card-main">
      <div class="item-icon" aria-hidden="true">
        <img src="${itemIcon(item)}" alt="">
      </div>
      <div>
        <h2 class="crop-name">${item.name}</h2>
        <div class="meta-row">
          <span class="chip ${categoryClass}">${item.category}</span>
          <span class="chip">得意: ${item.bestSeasons.join("・")}</span>
          <span class="chip">苦手: ${item.weakSeasons.join("・")}</span>
        </div>
      </div>
      <div class="level-badge ${level === null ? "" : "is-known"} ${level === 10 ? "is-max" : ""}">
        ${levelLabel}
      </div>
    </div>
    <div class="control-row">
      <button class="control-button" type="button" data-action="decrease" aria-label="${item.name}のLvを下げる">-</button>
      <button class="control-button" type="button" data-action="increase" aria-label="${item.name}のLvを上げる">+</button>
      <button class="control-button ${toggleClass}" type="button" data-action="toggle-max" aria-label="${toggleAria}">${toggleLabel}</button>
    </div>
  `;

  return card;
}

function matchesFilter(item) {
  const level = progress[item.id] ?? null;

  if (currentFilter === "unknown") {
    return level === null;
  }

  if (currentFilter === "not-max") {
    return level !== 10;
  }

  if (currentFilter === "crop") {
    return item.category !== "花";
  }

  if (currentFilter === "flower") {
    return item.category === "花";
  }

  if (currentFilter.startsWith("season:")) {
    const seasonKey = currentFilter.slice("season:".length);
    return isBestSeason(item, seasonKey);
  }

  return true;
}

function categoryClassName(category) {
  if (category === "花") {
    return "category-flower";
  }

  if (category === "果樹") {
    return "category-tree";
  }

  if (category === "特殊") {
    return "category-special";
  }

  return "";
}

function itemIcon(item) {
  if (item.category === "花") {
    return "assets/flower-bouquet.png";
  }

  if (item.category === "果樹") {
    return "assets/axe.png";
  }

  if (item.category === "特殊") {
    return "assets/hoe.png";
  }

  return "assets/turnip.png";
}

function isBestSeason(item, seasonKey) {
  if (item.bestSeasons.includes("通年")) {
    return true;
  }

  const season = item.seasons.find((entry) => entry.key === seasonKey);
  if (!season) {
    return false;
  }

  const bestScore = Math.max(...item.seasons.map((entry) => SEASON_SCORE[entry.mark]));
  return SEASON_SCORE[season.mark] === bestScore;
}

function setMenuOpen(isOpen) {
  appMenu.hidden = !isOpen;
  menuButton.setAttribute("aria-expanded", String(isOpen));
}

function exportMarkdown() {
  const markdown = createMarkdown();
  const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `rf4-seed-levels-${todayString()}.md`;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function createMarkdown() {
  const lines = ITEMS.flatMap((item) => {
    const level = progress[item.id] ?? null;
    const levelLabel = level === null ? "未確認" : `Lv ${level}`;
    return [`- ${item.name}`, `  - 店販売Lv: ${levelLabel}`];
  });

  return `${lines.join("\n")}\n`;
}

function todayString() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function loadProgress() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (!saved || typeof saved !== "object") {
      return {};
    }

    return ITEMS.reduce((result, item) => {
      const value = saved[item.id];
      result[item.id] = Number.isInteger(value) && value >= 1 && value <= 10 ? value : null;
      return result;
    }, {});
  } catch {
    return {};
  }
}

function saveProgress() {
  const normalized = ITEMS.reduce((result, item) => {
    const value = progress[item.id];
    result[item.id] = Number.isInteger(value) && value >= 1 && value <= 10 ? value : null;
    return result;
  }, {});
  progress = normalized;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
}
