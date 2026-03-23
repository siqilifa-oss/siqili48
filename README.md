## 游戏币交易电商SaaS平台 - 网页原型（纯前端）

### 使用方式
- 直接用浏览器打开 `index.html`
- 或者打开 `pages/stats.html` / `pages/orders.html`

### 页面
- **数据**：营业额统计（指标卡片 + 简易图表 + 最近7天表格）
- **订单**：订单列表、筛选、操作列（详情按钮弹窗）；**站内订单**（批次号、购买商品、数量与成本、成功/失败笔数、提交时间等，分页与导出 CSV）

### 技术栈
- HTML + CSS + 原生 JS
- 无后端、无构建依赖
- 商品对接页「新增商品」写入 `localStorage`（`gamecoin_pd_docking_user_rows`），刷新后仍保留

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

4. **第四步：Import 页面上的「部署配置」逐项说明**  

   点 **Import** 后会进入 **New Project** 页（与当前 Vercel 界面一致）。**本项目是纯静态 HTML，主界面几项保持默认即可；折叠区需展开核对一次。**

   **主界面（无需改动的常见正确状态）**

   | 界面上显示的名称 | 建议值 | 说明 |
   |--------|--------|------|
   | **Vercel Team** | 你的团队（如 Hobby） | 仅决定项目归属，不影响访问地址。 |
   | **Project Name** | 自定（例：`siqiligame`） | 决定默认域名：**`https://项目名.vercel.app`**，可与 GitHub 仓库名不同。 |
   | **Application Preset** | **`Other`** | 与旧版文案中的「Framework Preset」是同一类选项；勿选 Next.js / Nuxt 等，以免自动带上错误构建命令。 |
   | **Root Directory** | **`./`** | 表示仓库**根目录**即网站根；`index.html` 须在根目录。**不要**只填 `pages`。 |

   **折叠块「Build and Output Settings」——请点开核对（与你截图一致）**

   展开后若看到灰色说明「默认使用 `npm run vercel-build` / `npm run build`」「`public` 若存在否则 `.`」等，**不要只靠默认**：对本原型（根目录 `index.html`、无打包）请**手动覆盖**如下。

   1. **Build Command** 一行：打开右侧 **Override**（或「覆盖」）开关 → 输入框里**清空**，不执行任何构建（若平台不允许完全为空，可填 `true` 或 `echo skip`）。  
   2. **Output Directory** 一行：打开 **Override** → 填 **`.`**（英文句点，表示网站根就是仓库根）。**不要**填 `public`，除非你故意把整站放在 `public/` 目录下。  
   3. **Install Command** 一行：若仓库**没有** `package.json`，打开 **Override** 并清空；若不允许空，可填 `echo skip`，避免无意义地执行 `npm install` 报错。**切勿**只填一个英文句点 **`.`**（在 shell 里 `.` 是「执行脚本」命令，会报错 `filename argument required`）。

   **仓库已含 `vercel.json`**：在根目录固定了 `installCommand` / `buildCommand` 为无操作（`true`）、`outputDirectory` 为 `.`，与纯静态一致；推送到 Git 后 Vercel 会优先采用，可减少在网页里误配的概率。若项目 **Settings** 里仍有 Override，建议与之一致或关闭冲突项。

   若三项右侧的 Override **均为关闭**，Vercel 仍可能按「默认」去跑 `npm run build`，容易失败或与纯静态不符——务必按上表改完再部署。

   **折叠块「Environment Variables」**：无需配置；若展开也不要添加变量。

   **常见误操作（请避免）**  
   - **Output Directory** 填了 `dist`：静态根目录的 `index.html` 会找不到。  
   - 在项目里配置**全站 Rewrite 到** `/index.html`：本站是多页面（`pages/*.html`），子页会异常。

   主界面已是 **Other + Root `./`** 时即正确；**务必展开 Build and Output Settings 确认无多余 Build/Output**，再点 **Deploy**。

5. 点 **Deploy**。等待 **Building → Ready** 完成后，打开该项目的 **Deployments** 里最新一条应显示 **Ready**。在顶部 **Domains**（或部署成功页上的链接）可看到 **`https://项目名.vercel.app`**，即为长期公网地址。以后每次 `git push` 到 `main`，Vercel 会自动重新部署。

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

