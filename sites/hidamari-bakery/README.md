# ひだまりベーカリー — パン屋さんの朝

スクロールで進む3Dストーリーサイト（架空のパン屋さん）。

- `app/` … ソース（Vite + React Three Fiber + Three.js + GSAP ScrollTrigger）
  - `src/state.js` … スクロールで変化する値とカメラ位置
  - `src/timeline.js` … GSAPタイムライン（場面の順番・タイミング）
  - `src/World.jsx` … 3D空間（町・製粉所・トラック・キッチン・オーブン・売り場）
  - `src/models.jsx` … ローポリモデル（パン10種・人物・トラックなど）
- `dist/` … 公開用ビルド（リポジトリの `scripts/build.py` はここをコピー）

再ビルド:

```sh
cd app && npm install && npm run build
```
