# Station Orientation Catalog

This repository publishes the generated static website for the Station
Orientation Catalog. The English and Japanese catalog pages are stored under
[`docs/`](docs/) for GitHub Pages.

The observation inputs, local processing scripts, notebooks, build reports,
SAGE-derived metadata, and intermediate products are maintained separately and
are intentionally excluded from this public repository. Scientific definitions,
quality notes, and citation information intended for readers are provided on the
website's About page.

## GitHub Pages

In the repository settings, select **Pages → Deploy from a branch**, choose the
default branch (normally `main`), and select `/docs` as the publishing folder.
The entry point is [`docs/index.html`](docs/index.html).

---

このリポジトリは，Station Orientation Catalog の生成済み静的サイトを公開する
ためのものです．英語版・日本語版のカタログは，GitHub Pages用の
[`docs/`](docs/) 以下に収録されています．

観測入力，ローカル処理用スクリプト，Notebook，ビルドレポート，SAGE由来の
メタデータおよび中間生成物は公開対象に含めません．読者向けの科学的定義，
品質上の注意および引用情報は，サイト内のAboutページに掲載しています．

## 文面確認用の代表ページ

表現や文面を確認するときは，次の生成済み `index.html` を見ると，主要なページ形式を一通り確認できます．同じ形式の観測点ページをすべて確認する必要はありません．

| 確認対象 | English | 日本語 |
|---|---|---|
| Home | [`docs/index.html`](docs/index.html) | [`docs/ja/index.html`](docs/ja/index.html) |
| About・科学的説明 | [`docs/about/index.html`](docs/about/index.html) | [`docs/ja/about/index.html`](docs/ja/about/index.html) |
| マップ一覧 | [`docs/maps/index.html`](docs/maps/index.html) | [`docs/ja/maps/index.html`](docs/ja/maps/index.html) |
| 年別マップ・PDF操作 | [`docs/maps/global/index.html`](docs/maps/global/index.html) | [`docs/ja/maps/global/index.html`](docs/ja/maps/global/index.html) |
| ネットワーク一覧 | [`docs/networks/index.html`](docs/networks/index.html) | [`docs/ja/networks/index.html`](docs/ja/networks/index.html) |
| 定常ネットワークの例 | [`docs/networks/AU/index.html`](docs/networks/AU/index.html) | [`docs/ja/networks/AU/index.html`](docs/ja/networks/AU/index.html) |
| 臨時ネットワークの例 | [`docs/networks/1E/index.html`](docs/networks/1E/index.html) | [`docs/ja/networks/1E/index.html`](docs/ja/networks/1E/index.html) |
| 観測点詳細の例 | [`docs/stations/IU.ANMO/index.html`](docs/stations/IU.ANMO/index.html) | [`docs/ja/stations/IU.ANMO/index.html`](docs/ja/stations/IU.ANMO/index.html) |
| 臨時観測点詳細の例 | [`docs/stations/1E.SQA04/index.html`](docs/stations/1E.SQA04/index.html) | [`docs/ja/stations/1E.SQA04/index.html`](docs/ja/stations/1E.SQA04/index.html) |

### 文面を恒久的に修正する場所

`docs/` 内のHTMLは生成物なので，直接編集した内容は次回のカタログ更新で上書きされます．確認には上記HTMLを使い，実際の修正は次の生成元に加えてください．

| 表示部分 | 修正する生成元 |
|---|---|
| 共通ヘッダー，ナビゲーション，フッター，PDFプレビュー | `build_catalog.py` の `page_shell()` |
| Home | `config.json` の `catalog_summary`／`catalog_summary_ja`，および `render_home()` |
| About | `build_catalog.py` の `render_about()` |
| マップ一覧 | `build_catalog.py` の `render_maps_index()` |
| 年別マップページ | `build_catalog.py` の `render_map_region()` |
| ネットワーク一覧 | `build_catalog.py` の `render_networks_index()` |
| 個別ネットワーク | `build_catalog.py` の `render_network()` |
| 観測点詳細 | `build_catalog.py` の `render_station()` |
| 観測点ごとのメタデータ注記 | `README.cat` の `** Noting` 以下 |
| 検索・PDFプレビューの動作文言 | `static/catalog.js` |
| 色，余白，文字サイズ，レイアウト | `static/styles.css` |

修正後は次のコマンドで，変更された公開ファイルだけを `docs/` に反映します．

```bash
python3 build_catalog.py --config config.json --update-docs
```
