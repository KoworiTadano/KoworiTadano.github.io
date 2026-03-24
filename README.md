# kowori.net 編集ガイド

デプロイ対象は `dist/` のみ。このファイルはアップロードされない。

---

## Notes を追加する

`src/content/notes/` に Markdown ファイルを追加するだけ。

**ファイル名:** `YYYY-なんでもいい.md`（例: `2025-ff14-8.0.md`）

```markdown
---
title: FF14 8.0クリア
date: 2025-12-01
tags: [FF14]
---

本文をここに書く。
```

| フィールド | 必須 | 説明 |
|---|---|---|
| `title` | ✅ | 一覧と記事タイトルに表示 |
| `date` | ✅ | `YYYY-MM-DD` 形式 |
| `tags` | - | 複数可: `[FF14, ネタバレ]` |

一覧は日付の新しい順に自動ソートされる。

---

## 警告バナーを切り替える

`src/config/alert.json` を編集する。

```json
{
  "enabled": true,      // false にすると非表示
  "level": 2,           // 1: ちょっと忙しい / 2: 別ゲーにハマってる / 3: リアルが爆発
  "reason": "仕事・Fallout76",
  "detail": "締め切りが重なってる。来週には戻れるはず。"
}
```

`detail` は省略可（`""` にすると表示されない）。

---

## Games を編集する

`src/pages/games.astro` の先頭にある `games` 配列を編集する。

```js
const games = [
  {
    title: "ゲーム名",
    url: "https://...",  // キャラページ等。なければ ""
    status: "プレイ中",  // "プレイ中" か "休止"
    memo: "一言コメント",
  },
  // ...
];
```

`status: "プレイ中"` にすると緑の `● PLAYING` バッジが表示される。

---

## Machines を編集する

`src/pages/machines.astro` の先頭にある `available` と `unavailable` を編集する。

**稼働中のゲーム機 (`available`):**

```js
const available = [
  {
    maker: "Nintendo",
    machines: [
      "Switch 2",
      "Switch Lite",
      // 追加・削除はここ
    ],
  },
  // ...
];
```

**手放したゲーム機 (`unavailable`):**

```js
const unavailable = [
  "FC / SFC",
  // 追加・削除はここ
];
```

---

## Reviews を追加する

`src/content/reviews/` に Markdown ファイルを追加する。

**ファイル名:** `ゲーム名.md`（例: `diablo4.md`）

```markdown
---
title: "Diablo4"
date: 2025-01-15
score: 7
---

ネクロが強くて楽しかった。エンドコンテンツが単調になりがちなのが惜しい。
```

| フィールド | 必須 | 説明 |
|---|---|---|
| `title` | ✅ | ゲーム名 |
| `date` | ✅ | `YYYY-MM-DD` 形式 |
| `score` | ✅ | `0`〜`10` の整数 |

スコアの色は自動で変わる（10〜9: シアン / 8〜7: イエロー / 6〜5: オレンジ / 4以下: ピンク）。

---

## Linkz を編集する

`src/pages/linkz.astro` の先頭にある `linkz` 配列を編集する。

```js
const linkz = [
  {
    category: "GAME",   // カテゴリ名
    links: [
      {
        title: "サイト名",
        url: "https://...",
        desc: "一言説明",  // 省略可（"" にすると表示されない）
      },
    ],
  },
];
```

カテゴリは自由に追加・削除できる。

---

## YouTube APIキーの設定

1. [Google Cloud Console](https://console.cloud.google.com/) でプロジェクト作成
2. 「APIとサービス」→「ライブラリ」→「YouTube Data API v3」を有効化
3. 「認証情報」→「APIキーを作成」
4. `.env.example` をコピーして `.env` を作成し、キーを記入

```bash
cp .env.example .env
# .env を編集して YOUTUBE_API_KEY=取得したキー を設定
```

BlueSkyはAPIキー不要。ビルド時に自動取得される。

---

## ビルドとプレビュー

```bash
# 開発サーバー起動
npm run dev

# 本番ビルド（dist/ に出力）
npm run build

# ビルド結果の確認
npm run preview
```
