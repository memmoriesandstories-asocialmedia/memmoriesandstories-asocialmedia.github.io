# 🚀 發佈到 GitHub Pages 指南 (Publish to GitHub Pages)

本專案已完全配置完畢，支援直接發佈至：
**`https://memmoriesandstories-asocialmedia.github.io/`**

---

## 方式一：使用 GitHub Actions 自動建置發佈（最推薦、零設定）

本專案已內建 `.github/workflows/deploy.yml` 自動化工作流程檔案：

1. **匯出或推送至 GitHub**：
   - 點擊本平台右上角「**Settings (設定)**」選單 ➔ 選擇「**Export to GitHub**」，推送到您的 GitHub 組織/帳號：
     - 若儲存庫名稱為：`memmoriesandstories-asocialmedia.github.io`
   - 或使用 Git 指令推送：
     ```bash
     git remote add origin https://github.com/memmoriesandstories-asocialmedia/memmoriesandstories-asocialmedia.github.io.git
     git branch -M main
     git push -u origin main
     ```

2. **啟用 GitHub Pages**：
   - 到 GitHub 專案頁面 ➔ 點擊上方 **Settings** ➔ 側邊欄點擊 **Pages**。
   - 在 **Build and deployment** 下的 **Source** 下拉選單：
     - 選擇 **GitHub Actions**。

3. **自動完成**：
   - GitHub Actions 會自動執行 `npm run build` 並部署至：
     👉 **`https://memmoriesandstories-asocialmedia.github.io/`**

---

## 方式二：使用指令一鍵部署 (`npm run deploy`)

如果是在本機終端機操作：

1. 確保已設定遠端 GitHub 儲存庫。
2. 執行：
   ```bash
   npm run deploy
   ```
3. 該指令會自動打包 `dist` 目錄並推送到 GitHub 的 `gh-pages` 分支。
4. 在 GitHub 專案的 **Settings** ➔ **Pages** ➔ **Source** 選擇 **Deploy from a branch** ➔ 分支選擇 `gh-pages` 即可。

---

## ✨ 已為您做好的相容性優化

- **相對路徑配置 (`base: './'`)**：在 `vite.config.ts` 中配置為相對路徑，確保無論是個人首頁 (`xxx.github.io`) 還是子專案路徑 (`xxx.github.io/repo/`) 均可正常載入 JS、CSS 與圖片。
- **專屬 App Icon**：自訂的高質感漸層專屬圖標已整合至網頁 Favicon、Apple Touch Icon 與社群分享卡片。
- **404 SPA 路由支援**：已建立 `public/404.html`，防止重新整理頁面時產生 404 錯誤。
