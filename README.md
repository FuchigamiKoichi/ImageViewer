# 画像表示ウェブアプリ 設計書

## 0. 前提と用語

* **画像**: ユーザーが閲覧する静止画（JPEG/PNG/WebP）。
* **タグ（タブ）**: 画像に付与する属性。UI 上は「タブ」で切替可能。タブ＝選択中のタグまたはタグ集合のショートカット。
* **絞り込み**: タグ（タブ）基準でのフィルタリング。
* **全画面表示**: ビューワで画像を画面いっぱいに表示（ズーム/パン対応）。

> 参考構成: Notion 上の HALPAL 系ドキュメントの「要件定義書」項目構造を踏襲（章立ての深さ・UI/UX 項目の並び方）。

---

## 1. 目的 / 非目的

**目的**

* タグ（タブ）で高速に絞り込み、選んだ画像を**即座に全画面で確認**できる閲覧体験を提供する。

**非目的**

* 画像の高度編集（レイヤー編集・フィルタ加工など）は対象外。
* ソーシャル機能（コメント/いいね/共有タイムライン）は将来検討。

---

## 2. ユースケース

* U1: タブをクリックして目的のカテゴリだけに絞り、一覧から画像を確認する。
* U2: 画像をクリックして全画面表示し、矢印キーまたはUIボタンで前後に遷移。
* U3: 全画面内で**フィット**/**実寸**/**ズーム**/**パン**。
* U4: タグ複数選択による合致フィルタ（AND/OR は設定で選択）。
* U5: （任意）検索ボックスでファイル名/タグをフリーテキスト検索。

---

## 3. 機能要件（FR）

* FR-1: 画像の**タグ付け**。最低1個、複数可。
* FR-2: **タブ（=タグ/タグセットのショートカット）**をヘッダに表示。クリックで即時絞り込み。
* FR-3: 一覧は**グリッド**（固定/マasonry 切替可）。遅延読み込み（LazyLoad）。
* FR-4: サムネイルをクリックで**全画面ビューワ**を開く。
* FR-5: ビューワで**ズーム/パン/前後移動/閉じる**が可能。キーボード（←→, Esc）対応。
* FR-6: **フィット・トゥ・スクリーン**/実寸/拡大率指定。
* FR-7: タグ複数選択のフィルタ AND/OR 切替（設定）。
* FR-8: URL クエリで状態復元（選択タブ、ページ、画像ID）。
* FR-9: PWA 対応（任意）：キャッシュでオフライン簡易閲覧。
* FR-10: （任意）アップロード + タグ入力。ドラッグ&ドロップ。

> 章立て/UX セクションの置き方は HALPAL 文書の UI/UX 系章見出し配置に寄せている（構造参照）。

---

## 4. 非機能要件（NFR）

* NFR-1: 初回視覚応答（LCP）1.5〜2.5秒以内（端末/回線に依存）。
* NFR-2: 1,000〜10,000 枚規模での一覧操作が**ストレスなく**行える。
* NFR-3: 主要ブラウザ（Chrome/Edge/Firefox/Safari 最新2世代）をサポート。
* NFR-4: 画像配信は CDN 前提（HTTP/2, HTTP/3, 圧縮/最適化）。
* NFR-5: アクセシビリティ（キーボード操作, alt テキスト, コントラスト）。

---

## 5. 画面仕様（ワイヤ概要）

### 5.1 一覧ページ

* **ヘッダ**: ロゴ / 検索 / タブ（横スクロール可） / 設定メニュー
* **コンテンツ**: 画像グリッド（ホバーでタグ/ファイル名）。無限スクロール。
* **フッタ**: 省略可

### 5.2 全画面ビューワ

* **キャンバス**: 画像を**画面いっぱい**に収める（fit）/実寸/ズーム
* **オーバーレイ**: 前 / 次 / 閉じる / タグ表示 / ダウンロード
* **操作**: キーボード矢印/Esc、マウスホイール、ピンチ（モバイル）

> 画面遷移・構成のダイアグラム（FigJam）は本設計下部の埋め込みを参照。

---

## 6. 情報設計 / データモデル（概略）

```
Image {
  id: string
  url: string         // CDN/ストレージURL
  width: number
  height: number
  createdAt: ISODate
  tags: string[]      // 1..n
  title?: string
  description?: string
}
Tag {
  id: string
  name: string        // 表示名
  color?: string
  order?: number
}
TabPreset {           // タブ=タグ集合のショートカット
  id: string
  name: string
  tagIds: string[]    // 0..n（空=ALL）
  logic: "AND"|"OR"
}
```

---

## 7. API（例：REST/GraphQL どちらでも可）

* `GET /images?tags=…&logic=AND|OR&cursor=…`
  サムネイル用メタ + ページング。
* `GET /images/{id}`
  単体詳細。
* `GET /tags` / `GET /tabs`
  タグ/タブ定義。
* `POST /upload`（任意）
  マルチパート + タグ付与。
* 画像本体は CDN（署名付きURLまたは公開パス）。

---

## 8. UI/UX 仕様詳細

* **タブ**: ヘッダ固定。横スクロール/折返し。選択状態は強調表示。複数選択モードのトグル有り。
* **グリッド**:

  * 密度（S/M/L）切替。
  * 遅延読み込み。
  * Masonry は列幅固定 + 高さ可変 / 代替として固定セルも選択可。
* **ビューワ**:

  * 背景は黒系（クリックで UI トグル）。
  * ダブルクリックでズーム、ホイールで倍率変更、ドラッグでパン。
  * 前後移動は左右クリック/矢印キー。Esc で閉じる。
  * **Fit/Actual/倍率指定**の表示切替 UI。
* **状態保持**: タブ/検索/ページ/画像ID を URL クエリ/History API で復元。

---

## 9. 権限/セキュリティ

* 公開閲覧 or 認証（Cookie/JWT）。アップロード機能を有効化する場合は認証必須。
* 画像アップロードは**拡張子/シグネチャ**検証、サイズ上限、ウイルススキャン。
* CDN 署名URL（期限付き）で直リンク流出対策。

---

## 10. パフォーマンス / 最適化

* サムネイルの**自動生成**（複数解像度）+ `srcset`/`sizes`。
* 事前フェッチ（次/前画像）。
* HTTP キャッシュ制御（ETag/immutable）、Service Worker（PWA）で離脱後も即再開。
* 画像メタは別 API で先行取得→**骨組み UI**（skeleton）表示。

---

## 11. 監視 / ロギング

* Web Vitals（LCP/FID/CLS/INP）収集。
* 画像エラー率、ビューワ滞在時間、タブ別クリック率。
* 500/4xx ログ、CDN ログ（帯域・キャッシュ率）。

---

## 12. 対応環境

* PC/Mobile/Tablet（レスポンシブ）。
* 最新 2 世代の主要ブラウザ。
* PWA（任意）：`display: standalone`、スプラッシュ、オフライン簡易閲覧。

---

## 13. テスト

* **ユニット**: フィルタ条件（AND/OR）、URL 状態復元、ズーム倍率計算。
* **E2E**: タブ→一覧→ビューワ→前後遷移→復帰。
* **性能**: 1k〜10k 点の仮データでスクロール/検索/ビューワ遷移を計測。

---

## 14. 開発スタック（例）

* フロント: React or Vue / Vite / TypeScript / Tailwind / Zustand（状態）
* 画像表示: `<img>` + CSS `object-fit`、または Canvas / WebGL（将来の超大判対応）
* バックエンド: Node.js + Fastify / NestJS / Cloud Functions
* ストレージ: S3 互換 + CDN（CloudFront / Cloudflare Images など）

---

## 15. 参考

* Notion: **HALPAL設計書**（要件定義書ページ配下を参照） 
* Notion: **要件定義書**（UI/UX 章見出しの配置を参照） 
* Figma(FigJam) 画面レイアウト案: **このチャット内に埋め込み済み**（上の図のメニューから共有リンクを取得して貼り替えてください）

---

### 付録A: 画面フロー（FigJam）

* **Home（画像一覧） → タブ（タグチップ） → グリッド → 画像カード → 全画面ビューワ（オーバーレイUI） → 戻る**
* 設定（グリッド密度/テーマ/キーバインド）、任意のアップロード導線を分岐として配置済み。

> [画面のフロー図](https://www.figma.com/board/bgW2zfu76uenyFzKx8ZLRl/Image-Viewer-App---Screen-Layout?node-id=0-1&t=Tg6DsqBqj8LX6lsI-1)

---

## 想定変更点

* タグ/タブの**AND/OR**既定値や**グリッド方式（Masonry/固定セル）**は要使用感評価。
* オフライン閲覧（PWA）は必要性に応じて段階的に導入。

## 現時点で適切な点

* 章立て/粒度は参照ドキュメントの構造と整合しており、**大幅な変更は不要**です。

---

**注**: FigJam はレイアウト**概要図**であり、ピクセル精度のUIは別途 Figma デザインで拡張可能です。必要であれば、ワイヤ→ハイファイの移行手順を追記します。

---

## 17. 実装とサーバ起動手順（Clean Architecture）

本プロジェクトは `docs/ImageViewerClassDiagram.drawio` のクリーンアーキテクチャ設計に基づいて実装済みです。

### ディレクトリ構成
```
src/
├── entities/           # Image, Tag, TabPreset
├── ports/              # Repository/Gateway インターフェイス
├── usecases/           # FilterImages, GetImageDetail, Navigate, Zoom, Upload, UpdateUrlState
├── adapters/
│   ├── repositories/   # InMemory実装
│   ├── gateways/       # UrlStateGatewayImpl
│   └── presenters/     # Gallery, Viewer
├── framework/          # HTTP server (Node.js)
└── data/               # サンプルデータ seed
```

### 起動方法
```bash
# 初回のみ
npm install

# サーバ起動
npm start
# => http://localhost:3000 で起動
```

### API エンドポイント
| メソッド | パス | 説明 | 例 |
|---------|------|-----|-----|
| GET | `/images` | 画像一覧（フィルタ可能） | `?tags=nature,featured&logic=AND&cursor=0&limit=10` |
| GET | `/images/:id` | 画像詳細 | `/images/1` |
| GET | `/tags` | タグ一覧 | - |
| GET | `/tabs` | タブプリセット一覧 | - |
| POST | `/upload` | 画像アップロード (URL or base64 dataUrl) | body: `{ "url": "https://...", "tags": ["nature"] }` または `{ "dataUrl": "data:image/png;base64,...", "tags": ["nature"] }` |
| POST | `/tags` | タグ作成 | body: `{ "id": "new-tag", "name": "New Tag", "color": "#ff0000" }` |
| PUT | `/images/:id` | 画像編集 (タイトル/説明/タグ) | body: `{ "title": "新タイトル", "description": "説明", "tags": ["nature"] }` |
| DELETE | `/images/:id` | 画像削除 | `/images/123456789` |
| POST | `/zoom/toggle` | ズームモード切替 | body: `{"currentMode":"FIT"}` |
| POST | `/state` | URL状態保存 | body: `{"imageId":"1","tags":["nature"],"logic":"AND"}` |
| GET | `/state` | URL状態取得 | - |

### 動作確認例
```bash
# 全画像取得
curl http://localhost:3000/images

# タグでフィルタ (AND)
curl 'http://localhost:3000/images?tags=nature,featured&logic=AND'

# 画像詳細
curl http://localhost:3000/images/1

# タグ一覧
curl http://localhost:3000/tags

# 状態保存 & 取得
curl -X POST http://localhost:3000/state \
  -H 'Content-Type: application/json' \
  -d '{"imageId":"2","tags":["people"],"logic":"OR"}'
curl http://localhost:3000/state
```

### 画像の追加方法 (3通り)

#### 1. UI から URL またはドラッグ&ドロップで追加（推奨）
1. 画面右上「画像追加」ボタンをクリック
2. モーダル内で以下を実施:
   - 画像ファイルを枠内へドラッグ&ドロップ
   - クリックでファイル選択
3. 説明（任意）とタグを1つ以上選択
4. 「追加」クリック → 自動で `/uploads/` 配下に保存
5. ギャラリーに即反映

内部的には `POST /upload` に以下形式で送信:
```jsonc
// ローカルファイルの場合 (dataUrl)
{ "dataUrl": "data:image/png;base64,...", "description": "説明", "tags": ["nature"] }
```

#### 2. seed データ編集による初期画像追加
`src/data/seed.js` の `seedImages()` に `new Image({...})` を追加し再起動。

#### 3. 直接 `/uploads` ディレクトリへファイル配置
`uploads/` に画像を置き、再起動後 UI から URL として `/uploads/ファイル名` を指定して登録。

#### 保存仕様
| 項目 | 説明 |
|------|------|
| 保存場所 | `app/uploads/` (物理保存先) |
| ファイル名 | `Date.now()` + 拡張子 (dataUrl の MIME から決定) |
| 公開パス | `/uploads/<filename>` （サーバが `app/uploads/` を公開にマップ） |
| 対応形式 | jpg, jpeg, png, gif, webp |

#### 注意事項
* タグは最低1つ必須
* 不正な dataUrl 形式は 400 エラー
* ファイル書き込み失敗時は 500 エラー
* 同期保存方式（今後: 非同期 + サイズ検証/制限追加予定）

#### 今後の拡張案
* ファイル名衝突回避に UUID
* サムネイル生成（`sharp` 利用）
* マルチパートフォーム対応（現状 base64 or URL）
* 画像メタ（幅/高さ）自動取得
* サイズ上限/ウイルススキャン

### タグ管理機能
* ヘッダの「🏷️ タグ追加」ボタンをクリック
* タグID（英数字のみ）、表示名、色を入力して作成
* 作成したタグは即座に画像アップロード時に選択可能
* API: `POST /tags` with `{ "id": "tag-id", "name": "表示名", "color": "#hex" }`

### 画像削除機能
* 画像を全画面表示中、下部にマウスを移動すると操作パネルが表示
* 「🗑️ 削除」ボタンをクリック
* 確認ダイアログで「OK」→ 削除実行
* API: `DELETE /images/:id`
* 注意: ローカルファイル（`app/uploads/`）は手動削除が必要（今後自動削除対応予定）

### 画像編集機能
* 全画面表示中に「✏️ 編集」ボタン（下部パネル）をクリック
* タイトル、説明、タグを編集可能
* 保存すると即座にギャラリーとビューアに反映
* API: `PUT /images/:id` with `{ "title": "...", "description": "...", "tags": [...] }`

### ビューア機能
* 画像は実際のサイズを取得し、縦または横が画面端に到達するまで自動拡大
* 下部にマウスを移動すると操作パネル（前/次/閉じる/編集/削除）が2秒間表示
* キーボード操作: ← → (前後移動), Esc (閉じる)
* 画像以外の場所をクリックしても閉じる

### タグ検索機能
* 検索窓でタグを組み合わせた検索が可能
* **AND検索**: `nature AND featured` - 両方のタグを持つ画像のみ表示
* **OR検索**: `people OR landscape` - いずれかのタグを持つ画像を表示
* **単一タグ**: `nature` - そのタグを持つ画像を表示
* Enter キーで検索実行、「検索」ボタンでも可
* 「クリア」ボタンで全画像表示に戻る
* タブ選択時は検索窓がクリアされる

### 今後の拡張
- REST → GraphQL / IndexedDB への Repository 差し替え
- React/Vue によるフロントエンド実装（`src/framework/ui/` など）
- TypeScript 化 (`tsconfig.json` + `.ts` 化)
- ページングトークン実装、認証（JWT）、PWA 対応

---


## 16. クラス図（Clean Architecture）