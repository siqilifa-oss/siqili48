## 游戏币交易电商SaaS平台 - 网页原型（纯前端）

### 使用方式
- 直接用浏览器打开 `index.html`
- 或者打开 `pages/stats.html` / `pages/orders.html`

### 页面
- **数据**：营业额统计（指标卡片 + 简易图表 + 最近7天表格）
- **订单**：订单列表、筛选、操作列（详情按钮弹窗）

### 技术栈
- HTML + CSS + 原生 JS
- 无后端、无构建依赖

---

### 长期公网地址（部署说明）

本项目为**纯静态文件**，任意静态托管均可得到长期 HTTPS 域名。

---

#### Vercel 部署（推荐）

部署完成后会得到 **`https://你的项目名.vercel.app`**（可在控制台里改名或绑定自己的域名）。

**方式 1：网页 + Git（GitHub → Vercel）**

<details>
<summary>若本地还没有 Git 仓库，在项目根目录执行</summary>

```bash
cd gamecoin-saas-prototype
git init
git add .
git commit -m "Initial commit: 游戏兽SaaS 原型"
git branch -M main
```

</details>

1. **在 GitHub 新建空仓库**  
   打开 [github.com/new](https://github.com/new) → 仓库名自定（如 `gamecoin-saas-prototype`）→ **不要**勾选「Add a README」→ Create repository。

2. **把本地代码推上去**（把下面 URL 换成你仓库的 HTTPS 地址）：

```bash
cd gamecoin-saas-prototype
git remote add origin https://github.com/你的用户名/你的仓库名.git
git push -u origin main
```

若 GitHub 提示用 token 登录，在 GitHub → **Settings → Developer settings → Personal access tokens** 生成 token 作为密码。

3. **在 Vercel 关联仓库**  
   打开 [vercel.com/new](https://vercel.com/new) → 用 **Continue with GitHub** 授权 → **Import** 刚建的仓库。

4. **部署配置**（一般保持默认即可）  
   - **Framework Preset**：`Other`  
   - **Root Directory**：留空  
   - **Build Command**：留空  
   - **Output Directory**：留空（不要填 `dist`）

5. 点 **Deploy**。完成后在 **Project → Domains** 查看 **`https://项目名.vercel.app`**，即为长期公网地址。以后每次 `git push` 到 `main`，Vercel 会自动重新部署。

**方式 2：命令行（本地直接上传）**

```bash
cd /path/to/gamecoin-saas-prototype
npx vercel          # 按提示登录，生成预览 URL
npx vercel --prod   # 上线到生产域名（同上 *.vercel.app）
```

**注意**：本站是多页面 HTML（`index.html`、`pages/*.html`），**不要**在 Vercel 里配置把全部路由重写到 `index.html` 的 SPA 规则，否则子页面会异常。

---

#### 方式 A：Netlify（约 2 分钟）

1. 打开 [Netlify Drop](https://app.netlify.com/drop) 并登录。
2. 将本地 **`gamecoin-saas-prototype` 整个文件夹** 拖到页面里（或 ZIP 解压后拖入）。
3. 部署完成后会得到类似 **`https://随机名称.netlify.app`** 的地址，即为长期可访问链接。
4. 在 Netlify 站点设置里可 **Rename site** 改成更好记的二级域名（仍免费）。
5. 若用 Git 连接仓库：仓库根目录即站点根，本仓库已含 `netlify.toml`（`publish = "."`），无需构建命令。

#### 方式 B：GitHub Pages

1. 在 GitHub 新建仓库，把 `gamecoin-saas-prototype` 内**所有文件**推到仓库**根目录**（保证根目录有 `index.html`）。
2. 仓库 **Settings → Pages**：Source 选 **Deploy from a branch**，Branch 选 `main` / `master`，文件夹 `/ (root)`，保存。
3. 几分钟后访问 **`https://你的用户名.github.io/仓库名/`**（注意末尾路径与仓库名一致）。

#### 自定义域名（可选）

在 Netlify / Vercel / GitHub Pages 的域名设置里绑定你自己的域名，按平台提示添加 DNS 记录即可。

> **说明**：公网地址由你选的托管平台生成；我无法代你生成真实 URL，需按上面步骤在你账号下完成一次部署。

