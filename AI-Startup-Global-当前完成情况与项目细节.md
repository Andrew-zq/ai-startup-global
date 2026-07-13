# AI Startup Global 当前完成情况与项目细节

更新时间：2026-07-10  
项目目录：`D:\CodeX\CA义工项目宣传网站`  
线上仓库：`https://github.com/Andrew-zq/ai-startup-global`  
当前 GitHub Pages：`https://andrew-zq.github.io/ai-startup-global/`

---

## 1. 当前项目定位

AI Startup Global 当前已经从一个品牌展示型网站，逐步升级为一个面向温哥华及全球中文 AI 创业者、学习者和社区成员的综合平台。

现在网站的核心方向是：

- 展示 AI Startup Global 品牌与社区定位。
- 承载公开活动与会员活动。
- 支持用户注册、登录、会员身份区分。
- 支持管理员管理活动和用户信息。
- 建立 Global+ 付费会员转化路径。
- 展示 AI Radar、活动、下载资料、ShouldWeTV 等内容入口。
- 后续接入 Stripe、Supabase Edge Functions、真实 AI 简报和视频 API。

一句话总结：这是一个“社区官网 + 活动系统 + 会员系统 + AI 信息服务”的 MVP 产品。

---

## 2. 已经完成的主要页面

| 页面 | 文件 | 当前状态 |
|---|---|---|
| 首页 | `index.html` | 已完成基础视觉、品牌展示、活动入口、Global+ CTA、AI Radar/ShouldWeTV 等入口 |
| 活动分流页 | `apply.html` | 已改为 Luma 活动与网站会员活动的分流入口 |
| 活动列表页 | `events.html` | 已支持活动展示，区分 Luma 与站内会员活动 |
| 用户中心 | `dashboard.html` | 已支持普通用户、付费会员权益展示、活动/资料入口 |
| 管理员后台 | `admin.html` | 已有基础后台结构，用于管理活动和用户信息 |
| AI Radar | `ai-radar.html` | 已有 GitHub AI Top 10 信息展示结构 |
| GitHub 项目详情页 | `github-project.html` | 已有单个 GitHub 项目介绍和跳转入口 |
| 下载中心 | `downloads.html` | 已有中英文 PPT 与练习题下载入口 |
| Global+ 加入页 | `join.html` | 新增，作为会员订阅落地页 |
| 隐私政策 | `privacy.html` | 新增草稿版 |
| 服务条款 | `terms.html` | 新增草稿版 |

---

## 3. 首页已经完成的内容

首页目前已经包含：

- AI Startup Global 品牌 Logo 与导航。
- 中英文切换入口。
- 注册与登录入口。
- Global+ 会员 CTA。
- 活动申请入口，已调整为跳转到站内活动分流页。
- AI 每日简报 / AI Radar 区域。
- ShouldWeTV 频道展示区域。
- 合作资本方 / 合作伙伴模块，目前可以先显示“敬请期待”。
- 社区、创业者、活动、资源等内容区块。

首页 CTA 已经从单纯“开始申请”逐步转向：

- 查看活动；
- 加入 Global+；
- 通过站内会员体系沉淀用户。

---

## 4. 用户系统

当前用户系统方向：

- 使用 Supabase Auth 作为账号系统。
- 支持邮箱注册和登录。
- 支持 Google / Gmail 登录。
- 注册时已加入二次密码确认，减少用户输入错误。
- 注册时已加入隐私政策和服务条款勾选逻辑。
- 用户登录后进入用户中心。

用户角色分为：

| 角色 | 含义 | 权限 |
|---|---|---|
| 游客 | 未登录用户 | 浏览公开页面、查看公开活动、查看公开资料 |
| 普通用户 | 已注册登录用户 | 进入用户中心、查看公开活动、申请/开通会员 |
| Global+ 会员 | 付费会员或试用会员 | 报名会员活动、访问会员资源、查看会员权益 |
| 管理员 | 网站运营者 | 管理活动、用户、报名、会员状态和内容 |

---

## 5. 会员系统

根据 PRD，当前会员方向已经调整为 Global+ 订阅模式。

### 5.1 当前会员定价

- Global+ Membership
- CA$29.99 / month
- 30 天免费试用
- 每个用户仅可使用一次试用

### 5.2 当前会员规则

用户需要满足以下条件，才可以开通 Global+：

1. 已经注册并登录。
2. 至少参加过一次线上或线下活动。
3. 管理员在后台确认该用户的活动参与记录。
4. 用户进入 `join.html` 开通 Global+。

如果用户没有参加过活动，升级按钮仍然可见，但点击后会提示：

> 需要参加一次线上/线下活动后才可以升级。

### 5.3 已完成的会员页面和脚本

| 文件 | 功能 |
|---|---|
| `join.html` | Global+ 会员落地页 |
| `join.js` | 判断登录状态、活动参与资格、试用资格，并准备跳转 Stripe Checkout |
| `subscription-config.js` | 预留 Stripe Checkout Endpoint 配置 |
| `commercial.css` | 商业化相关页面样式 |
| `membership-review.js` | 已从人工审核申请流程改为引导到 Global+ 开通流程 |

### 5.4 尚未完成的会员核心功能

目前还没有真正接入 Stripe 支付。下一步需要完成：

- Stripe Product / Price 创建。
- Supabase Edge Function 创建 Checkout Session。
- Stripe Webhook 同步订阅状态。
- 用户取消订阅 / 管理订阅入口。
- 付款失败后的降级逻辑。

---

## 6. 活动系统

活动系统已经从“假活动展示”调整为支持真实活动数据。

### 6.1 当前活动类型

| 类型 | 说明 |
|---|---|
| Luma 活动 | 点击后跳转到 Luma 活动页面 |
| 网站会员活动 | 所有人可查看介绍，只有会员可以站内报名 |
| 免费公开活动 | 所有人可浏览和报名 |
| 收费公开活动 | 短期使用 Luma 售票，后续可迁移到站内售票 |

### 6.2 当前真实 Luma 活动

当前已经加入的真实活动：

- 活动名称：AI Workflow 101: Build Your First AI Workflow
- 中文名称：AI Workflow 101：构建你的第一个 AI 工作流
- 时间：2026 年 7 月 1 日，下午 6:30 - 8:00
- 地点：Vancouver, BC
- 报名链接：`https://luma.com/4ig5pzzb`
- 活动来源：Luma

### 6.3 活动相关文件

| 文件 | 功能 |
|---|---|
| `events-config.js` | 活动数据配置，包含真实 Luma 活动 |
| `events-page.js` | 活动页面展示逻辑 |
| `apply.js` | 活动分流页逻辑 |
| `supabase/seed.sql` | Supabase 初始化活动数据 |
| `supabase/prd-v1.2-migration.sql` | 新增活动收费类型、资料表、订阅字段等 |

---

## 7. 用户中心

用户中心目前包含：

- 用户头像 / 名称 / 邮箱。
- 普通用户或会员身份标识。
- Overview。
- Benefits。
- Events。
- Account。
- 管理员后台入口。
- “我的活动”子模块。
- 已加入活动、活动总结、对应 PPT 资料板块的方向已经加入到 Events 模块下。

目前仍需继续优化：

- 全站中英文切换时，用户中心菜单需要完全统一语言。
- 管理员入口需要更清楚地限制为管理员可见。
- 活动总结和 PPT 数据需要逐步迁移到 Supabase `materials` 表。

---

## 8. 管理员后台

管理员后台的目标是让你可以自己修改网站内容，而不是每次都改代码。

当前管理员后台方向：

- 创建活动。
- 修改活动。
- 删除活动。
- 区分 Luma 活动和网站会员活动。
- 设置中英文标题、介绍、类型、地点。
- 设置活动时间和报名链接。
- 标记用户参加过活动。
- 调整用户普通 / 会员状态。
- 管理活动总结和 PPT 链接。

需要注意：

- 管理员后台现在还属于基础版本。
- 后续应该继续增强图片上传、富文本编辑、活动草稿、预览、资料上传、订阅监控等功能。
- 管理权限必须依赖 Supabase RLS 和管理员角色，不能只依赖前端隐藏按钮。

---

## 9. 下载中心与学习资料

当前已经有下载页面：

- 中文 PPT。
- 英文 PPT。
- 中文练习题。
- 英文练习题。

未来资料应分为：

| 类型 | 可见范围 |
|---|---|
| 公开资料 | 所有人可查看和下载 |
| 会员资料 | 只有 Global+ 会员可查看和下载 |
| 活动回放 | 建议只对会员开放 |
| 活动总结 | 可根据活动类型设置公开或会员可见 |

已经新增的数据库方向：

- `materials` 表。
- 支持 `public` / `member` 可见性。
- 支持 `ppt` / `exercise` / `video` / `other` 类型。

---

## 10. AI Radar / AI 每日信息

当前 AI Radar 方向已经建立：

- 展示每日 GitHub AI Top 10 项目。
- 前 5 个项目用更大的卡片展示。
- 后 5 个项目用较小列表展示。
- 每个项目可以进入详情页。
- 详情页显示基础介绍。
- 提供直达 GitHub 的按钮。
- 页面支持自动滚动 / 轮播方向。

计划中的 AI 信息页面包括：

1. GitHub AI 项目页。
2. 最近活动页。
3. 全球 AI 政策页。

全球 AI 政策页计划关注：

- 中国。
- 美国。
- 欧盟。
- 中国台湾及台积电相关 AI / 半导体政策。

注意：政策类内容需要真实来源、发布日期和配图来源，不能手写假内容上线。

---

## 11. ShouldWeTV

当前 ShouldWeTV 已完成方向：

- 首页加入 ShouldWeTV 展示区域。
- 品牌形式为：AI Startup Global + ShouldWeTV。
- 预留视频频道展示位置。
- 预留 `video-config.js` 配置文件。

尚未完成：

- 真实 ShouldWeTV 视频 API。
- API Key 或鉴权方式。
- 自动同步视频列表。
- 视频详情页或播放页。

---

## 12. 数据库与后端架构

当前网站没有传统独立后端服务器，采用：

```text
GitHub Pages 静态前端
        +
Supabase Auth / Database / RLS
        +
未来 Supabase Edge Functions
        +
未来 Stripe
```

### 12.1 已有核心数据表

| 表 | 功能 |
|---|---|
| `profiles` | 用户资料、角色、会员状态、参加活动次数 |
| `events` | 活动数据 |
| `event_registrations` | 活动报名记录 |
| `membership_requests` | 旧版会员申请记录，后续会逐步弱化 |

### 12.2 新增迁移文件

已新增：

`supabase/prd-v1.2-migration.sql`

该文件用于增加：

- 订阅状态字段。
- Stripe Customer ID。
- 会员到期时间。
- 试用是否已使用。
- 会员目录字段。
- 活动收费类型。
- 活动票价字段。
- Luma 会员优惠说明。
- `materials` 学习资料表。
- 相关 RLS 权限。

你需要在 Supabase SQL Editor 中执行该迁移文件，才能让数据库跟上新页面。

---

## 13. 认证与 Google 登录

当前登录系统方向：

- Supabase Auth 负责用户注册登录。
- Google Cloud OAuth Client 负责 Google 登录。
- Supabase 中需要配置 Google Provider。
- Google Cloud 中需要配置 Authorized JavaScript origins 和 Redirect URI。

之前出现过：

```text
Error 400: origin_mismatch
```

这说明 Google Cloud OAuth 配置中的域名或 localhost 没有正确加入。

需要确保加入：

- `http://localhost:5500`
- `https://andrew-zq.github.io`
- 未来正式域名，例如 `https://aistartupglobal.com`

具体 Redirect URL 需要以 Supabase Auth 提供的 callback 地址为准。

---

## 14. Gmail 通知

当前会员申请通知的方向：

- 使用 Google Apps Script Web App。
- 文件位置：`integrations/google-apps-script/MembershipNotifications.gs`
- 配置位置：`notification-config.js`
- 配置字段：`membershipReviewEndpoint`

当前情况：

- 如果没有填写 Google Apps Script `/exec` 地址，申请仍可进入后台。
- 但不会发送 Gmail 通知。

注意：由于 PRD 后续方向改成 Stripe 自助订阅，Gmail 通知更多会用于运营提醒，而不是正式付款审核。

---

## 15. 当前已新增或修改的重要文件

### 15.1 新增文件

| 文件 | 说明 |
|---|---|
| `join.html` | Global+ 会员开通页 |
| `join.js` | 会员资格检查和 Checkout 准备逻辑 |
| `commercial.css` | 商业化页面样式 |
| `subscription-config.js` | Stripe Checkout Endpoint 配置占位 |
| `prd-ui.js` | 注册协议勾选与 PRD UI 补充逻辑 |
| `privacy.html` | 隐私政策草稿 |
| `terms.html` | 服务条款草稿 |
| `supabase/prd-v1.2-migration.sql` | PRD v1.2 数据库迁移 |
| `AI-Startup-Global-当前完成情况与项目细节.md` | 当前文档 |

### 15.2 已修改文件

| 文件 | 说明 |
|---|---|
| `README.md` | 更新项目架构、数据库和商业配置说明 |
| `index.html` | 首页 CTA、活动入口、Global+ 加入入口调整 |
| `apply.html` | 活动分流页加载 Supabase 和活动脚本 |
| `dashboard.html` | 用户中心会员权益内容调整 |
| `events-config.js` | 活动数据改为真实 Luma 活动 |
| `events-page.js` | 活动页面中英文文案和 Luma 标识优化 |
| `membership-review.js` | 旧审核申请流程改为 Global+ 开通引导 |
| `supabase/seed.sql` | 初始化真实 Luma 活动数据 |

---

## 16. 当前本地代码状态

当前这些改动还在本地，没有确认已经提交或推送到 GitHub。

本地状态大致为：

- 有多个文件已修改。
- 有多个新文件未加入 Git。
- 需要完成测试、数据库迁移确认后，再 commit 和 push。

建议在正式发布前执行：

```powershell
git status
```

确认无误后再提交。

---

## 17. 当前仍需要你完成的配置

### 17.1 Supabase

你需要在 Supabase SQL Editor 中执行：

```text
supabase/prd-v1.2-migration.sql
```

执行后数据库才支持：

- 订阅字段。
- 会员资料字段。
- 活动收费类型。
- 学习资料表。

### 17.2 Stripe

你需要创建：

- Product：`Global+ Membership`
- Price：`CA$29.99 / month`
- Trial：30 days

不要把 Stripe Secret Key 写进前端代码。Secret Key 必须放在 Supabase Edge Functions 的环境变量中。

### 17.3 Google OAuth

你需要确认 Google Cloud OAuth 中已经加入：

- 本地开发地址。
- GitHub Pages 地址。
- 未来正式域名。
- Supabase callback URL。

### 17.4 正式域名

未来如果迁移到正式域名，需要配置：

- `aistartupglobal.com`
- `aistartupglobal.ca` 301 跳转到主域名
- GitHub Pages Custom Domain
- HTTPS
- Supabase Redirect URLs
- Google OAuth Origins

---

## 18. 下一步建议开发顺序

建议不要继续堆新页面，而是先把商业闭环打通。

优先级如下：

1. 在 Supabase 执行 `prd-v1.2-migration.sql`。
2. 创建 Stripe Product 和 Price。
3. 搭建 Supabase Edge Function：创建 Stripe Checkout Session。
4. 搭建 Stripe Webhook：同步订阅状态到 Supabase。
5. 完成会员订阅成功页和取消订阅逻辑。
6. 修复和验证管理员后台可用性。
7. 把学习资料迁移到 `materials` 表。
8. 发布当前版本到 GitHub。
9. 再继续做 AI 简报、政策页、ShouldWeTV API、活动自动检查。

---

## 19. 当前完成度估计

| 模块 | 完成度 |
|---|---:|
| 首页视觉与品牌展示 | 85% |
| 用户注册 / 登录 | 75% |
| Google 登录配置 | 60%，需要继续确认 OAuth 配置 |
| 用户中心 | 70% |
| 活动展示 | 70% |
| 真实 Luma 活动接入 | 60% |
| 管理员后台 | 60% |
| Global+ 会员页面 | 65% |
| Stripe 真实支付 | 0% |
| Supabase 数据库结构 | 75%，迁移待执行 |
| 下载中心 | 65% |
| AI Radar | 70% |
| ShouldWeTV | 40%，等待真实 API |
| AI 每日简报真实内容 | 25%，需要采集/审核工作流 |
| 正式上线运营能力 | 55% |

---

## 20. 总结

AI Startup Global 的产品骨架已经建立起来了：品牌官网、活动系统、用户系统、会员入口、管理员后台、下载中心和 AI Radar 都已经具备基础形态。

目前最关键的不是继续增加更多展示内容，而是完成三件事：

1. 让 Supabase 数据库结构真正迁移到 PRD v1.2。
2. 接入 Stripe，让 Global+ 会员可以真实开通和续费。
3. 强化管理员后台，让你可以自己维护活动、资料和用户状态。

完成这三步后，这个网站就会从“可展示的 MVP”进入“可以面向 150 人注册和运营的社区产品”阶段。

