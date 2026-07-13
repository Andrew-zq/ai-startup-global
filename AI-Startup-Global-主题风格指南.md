# AI Startup Global 主题风格指南

更新时间：2026-07-11  
用途：以后制作新页面、活动页、下载页、会员页、PPT、海报或交给开发者继续扩展时，保持 AI Startup Global 的统一视觉风格。

---

## 1. 风格关键词

AI Startup Global 的整体风格可以总结为：

```text
未来感 / 创业社区 / 全球网络 / 黑白高对比 / 柔和米白 / 亮青绿色点缀 / 紫色科技感 / 大字号排版 / 圆角卡片 / 轻量仪表盘
```

更具体地说：

- 不是传统企业官网，而是一个有创业能量的 AI 社区平台。
- 不是厚重科技蓝，而是米白 + 黑色 + 荧光青绿 + 紫色。
- 页面应该有“全球网络、数据仪表盘、社区活动、创业加速”的感觉。
- 视觉上要大胆，但不能杂乱。
- 内容表达要专业、教育性强，同时保留年轻创业社区的开放感。

---

## 2. 核心色彩

当前网站的核心 CSS 色彩变量如下：

```css
:root {
  --ink: #171717;
  --paper: #f3f0e8;
  --lime: #c9ff3d;
  --purple: #625df5;
  --muted: #69665f;
  --line: #17171722;
}
```

### 2.1 主色

| 名称 | 色值 | 用途 |
|---|---|---|
| Ink Black | `#171717` | 主文字、深色背景、按钮、卡片 |
| Paper Beige | `#f3f0e8` | 网站主背景、页面底色 |
| Signal Lime | `#c9ff3d` | 高亮信号、状态点、重点文字、进度条 |
| Startup Purple | `#625df5` | 品牌强调色、链接、按钮 hover、重点标题 |
| Muted Gray | `#69665f` | 次级正文、说明文字 |

### 2.2 辅助色

| 色值 | 用途 |
|---|---|
| `#ded9ff` | 浅紫背景，用于会员、视频、辅助模块 |
| `#202124` | 仪表盘深色背景 |
| `#292a2e` | 深色卡片内部区块 |
| `#fffef9` | 白色卡片或输入框背景 |
| `#e9e5db` | FAQ 或浅色分区背景 |

### 2.3 使用原则

- 大面积背景优先使用 `#f3f0e8`。
- 深色内容区使用 `#171717` 或 `#202124`。
- 青绿色 `#c9ff3d` 只做点睛，不要大面积滥用。
- 紫色 `#625df5` 用于强调、链接、重要标签和科技感渐变。
- 不建议加入新的主色，否则品牌会变散。

---

## 3. 字体与排版

### 3.1 字体

网站当前主要使用：

```css
font-family: Manrope, Arial, sans-serif;
```

中文状态下使用：

```css
font-family: Manrope, "Microsoft YaHei", "PingFang SC", sans-serif;
```

### 3.2 标题风格

标题是这个网站最重要的视觉资产之一。

核心特点：

- 超大字号。
- 字距很紧。
- 行高很低。
- 有强烈海报感。
- 英文标题更适合大字压缩排版。
- 中文标题也可以很大，但字距不要过度压缩到影响阅读。

推荐写法：

```css
h1 {
  font-size: clamp(58px, 7vw, 112px);
  line-height: .91;
  letter-spacing: -0.075em;
}
```

中文页面建议：

```css
letter-spacing: -0.055em;
```

### 3.3 正文字体

正文应保持清晰、克制：

```css
font-size: 12px - 20px;
line-height: 1.7 - 1.9;
color: #514e48 或 #69665f;
```

### 3.4 标签文字

标签、状态、eyebrow 文案使用小字号、大写、加粗、拉开字距：

```css
font-size: 8px - 11px;
font-weight: 800;
letter-spacing: .12em - .15em;
```

例子：

```text
GLOBAL SIGNAL
AI RADAR / DAILY
GLOBAL+ / MEMBER ACCESS
LUMA EVENT
```

---

## 4. 页面布局语言

### 4.1 整体布局

页面通常使用：

- 大留白。
- 大标题。
- 双栏布局。
- 卡片网格。
- 深色仪表盘容器。
- 顶部 fixed header。
- 背景网格线与径向光晕。

### 4.2 页面边距

推荐：

```css
padding: 100px max(6vw, 28px);
```

首页 Hero 可以更大：

```css
padding: 145px max(5vw, 32px) 85px;
```

### 4.3 网格背景

网站经常使用浅色网格背景，体现 AI / 网络 / 系统感：

```css
background-image:
  linear-gradient(#1717170b 1px, transparent 1px),
  linear-gradient(90deg, #1717170b 1px, transparent 1px);
background-size: 72px 72px;
```

### 4.4 光晕背景

紫色或青绿色径向光晕是品牌的重要质感：

```css
background: radial-gradient(circle, #625df588, transparent 67%);
```

或：

```css
background: radial-gradient(circle, #c9ff3dbb, transparent 68%);
```

使用原则：

- 光晕应放在背景，不要抢正文。
- 紫色用于科技感。
- 青绿色用于信号、机会、增长。

---

## 5. Logo 使用规范

### 5.1 AI Startup Global Logo

你的 AI Startup Global Logo 应直接使用原始图形，不做颜色和形态改动。

当前使用路径：

```text
assets/brand/ai-startup-global-logo-original.png
assets/brand/ai-startup-global-logo.png
```

使用原则：

- 不要重新绘制。
- 不要改变颜色。
- 不要加滤镜。
- 不要拉伸变形。
- 可以放入圆角方形容器中，但 Logo 本身不要被修改。

### 5.2 Logo 容器

网站中常用 Logo 容器：

```css
.mark {
  width: 42px;
  height: 42px;
  border-radius: 11px;
  background-color: #f3f0e8;
  background-position: center;
  background-repeat: no-repeat;
  background-size: 125%;
}
```

### 5.3 ShouldWeTV 联合频道

展示形式：

```text
AI Startup Global + ShouldWeTV
```

风格：

- AI Startup Global Logo 在左。
- 中间使用 `+`。
- ShouldWeTV 使用黑色圆形或深色视频符号。
- 整体保持简洁，不要做成复杂 banner。

---

## 6. 按钮风格

按钮是圆角胶囊形。

### 6.1 主按钮

```css
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  min-height: 52px;
  padding: 0 23px;
  border-radius: 99px;
  font-size: 12px;
  font-weight: 800;
}
```

### 6.2 深色按钮

```css
.dark {
  background: #171717;
  color: #fff;
}

.dark:hover {
  background: #625df5;
}
```

### 6.3 白色按钮

```css
.white {
  background: #fff;
  color: #111;
}
```

### 6.4 Ghost 按钮

```css
.ghost {
  border-color: #17171722;
  background: #ffffff55;
}
```

### 6.5 按钮交互

按钮 hover 时建议轻微上浮：

```css
transform: translateY(-2px);
```

不要使用复杂阴影或过多颜色变化。

---

## 7. 卡片风格

### 7.1 基础卡片

卡片通常具备：

- 大圆角。
- 大内边距。
- 高度较高。
- 清晰分区。
- hover 轻微上浮。

```css
.card {
  min-height: 510px;
  padding: 25px;
  border-radius: 28px;
  transition: .3s;
}

.card:hover {
  transform: translateY(-8px);
}
```

### 7.2 常用卡片颜色

```css
.black {
  background: #171717;
  color: #fff;
}

.purple {
  background: #625df5;
  color: #fff;
}

.green {
  background: #c9ff3d;
  color: #171717;
}
```

### 7.3 卡片内容结构

推荐结构：

```text
顶部：编号 / 标签 / 状态
中部：视觉符号 / icon / orbit / 图形
底部：标题 + 描述 + 操作
```

这种结构已经在资本方、导师、市场、活动等模块里形成统一语言。

---

## 8. 仪表盘与控制台风格

AI Startup Global 很重要的视觉语言是“控制台 / 仪表盘”。

常见元素：

- 深色大容器。
- 顶部模拟窗口栏。
- 左侧导航。
- 数据卡片。
- 地图线条。
- 信号点。
- 自动滚动 ticker。

### 8.1 控制台背景

```css
background: #202124;
color: #fff;
border-radius: 28px - 32px;
```

### 8.2 内部线条

```css
border-color: #37383c 或 #3a3b3f;
```

### 8.3 信号点

```css
background: #c9ff3d;
box-shadow: 0 0 12px #c9ff3d;
```

### 8.4 AI Radar 页面

AI Radar 的风格更偏“全球启动平台控制台”：

- 大号项目标题。
- 左侧分类。
- 中间大项目卡。
- 底部自动滚动 ticker。
- Top 5 大卡 + 后 5 小列表。

以后做“AI 简报”“政策页”“Github 项目页”都可以复用这个控制台语言。

---

## 9. 活动页面风格

活动页面目前使用更强的深色背景：

```css
background: #171717;
color: #fff;
```

活动列表风格：

- 每行一个活动。
- 左侧编号。
- 中间日期与活动标题。
- 标签显示 Luma / Member / Public。
- 右侧报名按钮。
- hover 时整行微亮。

活动标签建议：

| 类型 | 标签 |
|---|---|
| Luma 活动 | `LUMA EVENT` |
| 网站会员活动 | `MEMBER EVENT` |
| 免费公开活动 | `PUBLIC EVENT` |
| 收费公开活动 | `PAID PUBLIC` |

---

## 10. 会员商业化页面风格

Global+ 页面比首页更直接、更转化导向。

视觉特点：

- 大标题。
- 价格卡片。
- 浅紫光晕。
- 三个价值卡片。
- 明确 CTA。

价格表达：

```text
CA$29.99 / month
30-day free trial
Global+ Membership
```

会员页不要太花，要让用户快速理解：

1. 多少钱。
2. 得到什么。
3. 为什么值得。
4. 如何加入。

---

## 11. 语言风格

### 11.1 中文语气

中文应当：

- 专业。
- 清晰。
- 有教育性。
- 不要太营销腔。
- 可以有一点创业感和未来感。

推荐表达：

```text
让你的想法被世界看见。
连接 AI 创业者、学习者与全球机会。
从第一次活动开始，进入真正的 AI 创业网络。
```

避免表达：

```text
爆火全网
颠覆世界
稳赚不赔
最强 AI 社群
```

### 11.2 英文语气

英文应当：

- Short.
- Confident.
- Builder-oriented.
- Community-first.

推荐表达：

```text
Build with AI. Connect globally.
Your next AI opportunity starts here.
A builder community for AI founders and learners.
```

避免表达：

```text
The best AI community in the world.
Guaranteed success.
Unlimited growth.
```

---

## 12. 动效风格

网站动效整体是轻量的。

可以使用：

- hover 上浮。
- fade in。
- 轻微 translateY。
- ticker 自动滚动。
- 卡片切换。
- 进度条循环。

不建议使用：

- 大量 3D 翻转。
- 过快闪烁。
- 复杂粒子动画。
- 干扰阅读的背景动画。

需要支持：

```css
@media (prefers-reduced-motion: reduce) {
  * {
    scroll-behavior: auto !important;
    transition: none !important;
  }
}
```

---

## 13. 圆角与边框

当前圆角语言非常明确：

| 元素 | 圆角 |
|---|---:|
| 小 Logo 容器 | 10px - 11px |
| 输入框 | 9px - 12px |
| 小卡片 | 18px - 22px |
| 大卡片 | 25px - 32px |
| 按钮 | 99px |
| 控制台外壳 | 28px - 32px |

边框通常使用：

```css
border: 1px solid #17171722;
```

深色区域使用：

```css
border: 1px solid #3a3b3f;
```

---

## 14. 图片与配图规范

### 14.1 网站配图方向

适合使用：

- AI 工作流。
- 创业者活动现场。
- 城市网络。
- GitHub / code / dashboard。
- 政策新闻配图。
- 线下 workshop 照片。

不适合使用：

- 过度科幻机器人。
- 低质量 AI 生成头像。
- 花哨渐变人物海报。
- 与 AI 创业无关的商务图库。

### 14.2 政策页配图

政策类页面必须使用可信来源，建议：

- 官方机构图片。
- 新闻来源授权图片。
- 地图或抽象政策图形。
- 不要随便抓取有版权风险的图片。

---

## 15. 新页面套用模板

以后新增页面时，可以参考这个结构：

```text
1. 顶部导航
2. 大标题 Hero
3. 一句话定位说明
4. 主要内容卡片 / 列表 / 控制台
5. CTA 区块
6. Footer
```

推荐页面骨架：

```html
<body>
  <header class="header">...</header>

  <main>
    <section class="hero-or-page-intro">
      <p class="eyebrow">AI STARTUP GLOBAL</p>
      <h1>Large, bold page title.</h1>
      <p class="lead">Clear explanation of this page.</p>
    </section>

    <section class="section">
      <div class="cards">...</div>
    </section>

    <section class="cta">...</section>
  </main>

  <footer>...</footer>
</body>
```

---

## 16. Do / Don't

### Do

- 使用米白背景。
- 使用黑色大标题。
- 使用紫色强调关键词。
- 使用青绿色做信号点。
- 使用大圆角卡片。
- 使用控制台、仪表盘、网络节点等视觉语言。
- 保持中英文文案清晰。
- 使用真实活动、真实来源、真实数据。

### Don't

- 不要随意改变 Logo。
- 不要加入太多新颜色。
- 不要使用普通 Bootstrap 风格。
- 不要让页面看起来像传统学校官网。
- 不要使用假活动、假新闻、假政策信息。
- 不要让中文和英文在同一个语言状态里混乱出现。
- 不要把密钥、Secret Key、Service Role Key 放进前端。

---

## 17. 一句话设计原则

如果以后不确定某个页面该怎么做，记住这句话：

> AI Startup Global 的视觉应该像一个温哥华 AI 创业社区的全球启动控制台：米白底色、黑色结构、紫色科技感、青绿色信号、高对比大标题、圆角卡片和真实可信的内容。

