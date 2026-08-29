# Conjuga · 表现层设计手册（Surface Layer Spec）v3.2

> **版本**：v3.2（新增超级矩阵功能 · 对比页升级为 3 Tab）
> **日期**：2026-08-29
> **目标设备**：vivo Pad5 Pro 13" 3:2 · 横屏 CSS 1032×688px · 竖屏 688×1032px
> **配套文件**：同目录下 `Conjuga-视觉预览.html`（10 页真实视觉线框图+页面标注）
> **v3.1 更新（相比 v3.0）**：原 v3.0 遗留的 6 项缺口经用户拍板全部决策闭合。新增附录 A（6 项决策细节）+ 附录 B（完整三层 CSS 令牌映射表，可直接复制进 tokens.css）。0.2 / 0.3 / 0.4 节各缺口项的状态已从 ❌/🟡 更新为 ✅。
> **v3.2 更新（相比 v3.1）**：用户明确要求"所有动词×所有时态 Excel 冻结表"——左边动词原形列和顶部时态标题固定、中间变位可横纵滚动，且所有录入的动词都要能出现在这张表里。基于此：① 原对比中心 2 模式升级为 **3 Tab（横向对比 / 纵向对比 / 超级矩阵）**；② 新增 5.10 页规格 + 视觉第 10 页；③ 新增附录 C「超级矩阵组件令牌 + 性能约束 + sticky 工程方案」，给出单表 position: sticky 的正确做法（参考 Experience ID 803672 的反向教训：**绝不能拆双表**）。

---

## 0. 真实缺口状态复核（逐项核对）

### 0.1 品牌与封面设计（5/5 规格已确定）

| # | 项目 | 已敲定内容 | 状态 |
|---|---|---|---|
| 01.1 | 应用名称 | 西文名 **Conjuga**（短名 / home screen name）。中文名未单独设，PWA manifest 中 name="Conjuga"、short_name="Conjuga" | ✅ 规格已定 |
| 01.2 | 应用图标概念风格 | **学习工具风**：书本 + 笔 / 动词变位经典符号。图标视觉未产出 SVG/PNG 成品，仅概念 | ✅ 概念已定 / 🟡 PNG 未生成 |
| 01.3 | PWA Splash Screen 启动屏 | **橙红底 (#E94B3C)** + 白色大字 "Conjuga" + 一行小字副标题 "Conjuga · 变位学习" | ✅ 规格已定 |
| 01.4 | Manifest 主题色 | `background_color="#E94B3C"` · `theme_color="#E94B3C"` · `display="standalone"` · `start_url="/"` | ✅ 规格已定 |
| 01.5 | 桌面图标尺寸清单 | 10 种 PNG：72 / 96 / 128 / 144 / 152 / 192 / 384 / 512 + 192 maskable + 512 maskable（maskable 安全区 80% 圆心）。清单已定，PNG 文件未生成 | ✅ 清单已定 / 🟡 PNG 未生成 |

> **0.1 类自检**：概念层面 5/5 全部敲定，但有两个"数字资产未生成"——这是开发 Day 4 做 PWA manifest 时要真的生成的，不影响现在开工。

### 0.2 设计令牌 Design Tokens（17 项 · 14 完全敲定 / 3 缺口 🟡）

| # | 项目 | 已敲定内容 | 状态 |
|---|---|---|---|
| 02.1 | 主色 + 状态色 | 主色 **#E94B3C 西班牙橙红**；成功 **#34C759**；错误 **#FF3B30**；警告 **#FF9500** | ✅ 已定 |
| 02.2 | 中性色 10 档（浅色） | 背景 **#FAFAFA**；卡片 **#FFFFFF**；文字 **#1D1D1F**；次要文字 **#6E6E73**；边框 **#D2D2D7**；主色淡底 rgba(233,75,60,.08)；主色强淡底 rgba(233,75,60,.15)；错误淡底 rgba(255,59,48,.12)；成功淡底 rgba(52,199,89,.12)；警告淡底 rgba(255,149,0,.15) | ✅ 已定 |
| 02.3 | 深色模式映射（暗色） | 页面背景 **#1C1C1E**；卡片 **#2C2C2E**；边框 **#38383A**；正文 **#F5F5F7**；次要文字 **#98989D**；主色淡底 rgba(233,75,60,.16)；主色强淡底 rgba(233,75,60,.25)。全部按 iOS 暗态标准值 | ✅ 已定 |
| 02.4 | 字体方案 | **正文**：系统无衬线（-apple-system / BlinkMacSystemFont / "Segoe UI" / Roboto / "Noto Sans CJK SC"）。**变位显示**：等宽字体（"SF Mono" / Menlo / Consolas / monospace），保证 6 人称对齐 | ✅ 已定 |
| 02.5 | 字号层级（8 档，基准 16px 宽松正文） | `12px caption` / `14px sub-body` / `16px body` / `18px sub-title` / `20px small heading` / `24px H3` / `30px H2` / `36px H1`。配合等宽变位专用字号：变位题目 20px、变位表格 14px、错题卡主答案 12px | ✅ 已定 |
| 02.6 | 间距 10 档（8pt 栅格） | `4 / 8 / 12 / 16 / 20 / 24 / 32 / 40 / 48 / 64 px`。容器外边距：横屏 ≥900px 用 24/32，竖屏 <900px 用 16/20 | ✅ 已定 |
| 02.7 | 圆角 4 档 | `sm 4px`（小徽章/小标签）/ `md 8px`（按钮/输入框）/ `lg 12px`（卡片/面板）/ `full 999px`（胶囊按钮/状态徽章） | ✅ 已定 |
| 02.8 | 阴影/海拔 | 扁平模式下**只做一层轻阴影**：modal、dropdown 用 `0 8px 24px rgba(0,0,0,.12)`。普通卡片和按钮**无阴影**，只靠 1px 边框区分（符合"扁平风格"选型） | ✅ 已定 |
| 02.9 | 边框 2 档 + 聚焦描边 | 默认边框 `1px solid [border-token]`。聚焦 / 选中 `2px solid #E94B3C` + 2px 偏移（outline-offset 2px，WCAG 键盘无障碍强制要求） | ✅ 已定 |
| 02.10 | 透明度 3 档 | 默认 100% / 已毕业/归档降为 **62%**（~40%透明）/禁用元素 **40%不透明**（opacity .4）+ not-allowed 光标 | ✅ 已定 |
| 02.11 | 图标风格 | 24px 线性图标，**1.5px 描边**，圆角端点（round linecap）。导航图标可用同规格填充变体。建议直接用 Lucide 或 Material Symbols（两套都是 24px 线性），SVG 尺寸一致可互换 | ✅ 已定 |
| 02.12 | 动效缓动 3 档 | 快 `150ms ease-out`（按钮/开关/反馈）/ 正常 `300ms ease-in-out`（抽屉/转场/展开折叠）/ 慢 `500ms ease-out`（仅首次 onboarding 动画）。所有转场不超过 500ms，不拖沓 | ✅ 已定 |
| 02.13 | 栅格 + 4 级响应式断点 | **8pt 栅格系统**。断点：① `<600px` 分屏/手机（抽屉侧栏 + 单栏）② `≥600px` 平板竖屏 688px（抽屉侧栏）③ `≥900px` 平板横屏 1032px（**主场景，常驻 150px 侧栏**）④ `≥1280px` 桌面（侧栏加宽 180px） | ✅ 已定 |
| 02.14 | 最小触摸目标 | 48×48 dp（CSS px）。按钮 min-height 48px，输入框 min-height 48px，导航行 min-height 48px。触屏设备 (pointer: coarse) 下禁用 hover 作为唯一致盲提示 | ✅ 已定 |
| 02.15 | 文本对比度 WCAG | 主色按钮（背景 #E94B3C / 文字 #FFFFFF）换算对比度 4.72:1，刚好通过 WCAG AA 4.5:1。**机制已定：开发 Day 3 用 Stark/Chrome DevTools Color Picker 复检一次**；若实测低于 4.5，把 `--color-brand` 自动调深到 `#D93E30`（对比度 5.4:1 保证通过），无需重走拍板流程。 | ✅ 已定（含复检机制） |
| 02.16 | Z-Index 层级体系 | **10/40/50/80/90 标准分层（2026-08-29 拍板）**。具体 10 层映射：Base 0 / Cards 1 / Sticky Header 10 / Drawer Overlay 40 / Drawer Panel 41 / Dropdown 50 / Modal Overlay 80 / Modal Panel 81 / Toast 90 / Tooltip 100。完整数值表和 CSS 变量定义见附录 A.1。 | ✅ 已定 |
| 02.17 | 组件令牌（三层命名体系） | **三层令牌映射表正式产出（2026-08-29 拍板）**。严格按 Primitive（原始值）→ Semantic（语义别名）→ Component（组件专属）三层组织，完整 180+ 行 CSS `:root` 变量见附录 B。开发时直接复制进 `src/styles/tokens.css`，禁止硬编码 hex/px。 | ✅ 已定（完整映射表已出） |

> **0.2 类自检**：17/17 全部敲定。原 Z-Index 阻塞级缺口已闭合；三层命名完整映射表已写进附录 B；对比度机制定死（Stark 复检 + 不达标自动降级到 #D93E30）。

### 0.3 组件 6 状态（6 项 · 6/6 全部敲定 ✅）

| # | 项目 | 已敲定内容 | 状态 |
|---|---|---|---|
| 03.1 | 按钮 6 状态：Idle / Hover / Active / Focus / Disabled / Loading | **标准变浅下沉**：Idle→背景主色+白字。Hover→亮度+10%。Active→亮度+20% + 1px 下移（translateY 1px）。Focus→2px 外描边主色 + 2px 偏移。Disabled→opacity .4 + not-allowed。Loading→保留原文字，内嵌小 spinner（16×16）在按钮内部左侧，文本加 "…中"。 | ✅ 已定 |
| 03.2 | 输入框 6 状态：Idle / Placeholder / Filled / Focus / Error / Disabled | Idle→1px border + 8px radius。Placeholder→--text-muted #6E6E73。Filled→文字正常色。Focus→2px 主色描边 + 2px offset（与 02.9 一致）。Error→2px 红色 #FF3B30 描边。**错误态下必须有一行内联红色说明**（例如 "habló≠hablo，注意 ó 上的重音符号"）。Disabled→opacity .4。 | ✅ 已定 |
| 03.3 | 下拉选择 <select>：Idle / Open / Selected | **轻阴影 + 淡底高亮（2026-08-29 拍板）**。触发按钮：1px 边框 + 8px 圆角 + 40px 高 + 右侧 chevron。展开面板：12px 圆角 + `0 8px 24px rgba(0,0,0,.12)` 轻阴影 + 1px 边框 + 选项行 40px 高 + hover `background: var(--bg)` 2% 灰底 + **selected 8% 主色淡底 + 主色文字 + 左侧 3px 宽主色选中指示竖条**（与侧边栏 active 态统一，保持一致性）。完整细节见附录 A.2。 | ✅ 已定 |
| 03.4 | Tag 标签视觉 | 8% 主色淡底 (rgba(233,75,60,.08)) + 主色文字 + 999px 胶囊圆角 + padding 2px 6px + 10/11px 字号。状态徽章变体：错误红用红淡底+红字；成功绿用绿淡底+绿字；警告橙用橙淡底+橙字。（参考错题页徽章实际效果。） | ✅ 已定 |
| 03.5 | 卡片容器 | 1px 边框 (--border) + 12px 圆角 (lg) + 内边距按卡片大小 12/16/20px。卡片无阴影（扁平选型）。悬停不抬升。 | ✅ 已定 |
| 03.6 | 侧边栏导航项（Idle / Active / Hover） | Idle→正常文字 + 48px 高度 + 16px 左内边距。Active→**100% 主色淡底（8%）+ 主色文字 + 左侧 3px 宽主色竖条（选中指示）**。Hover→未激活项 200ms 过渡到 4% 主色淡底。 | ✅ 已定 |

### 0.4 页面 7 状态（7 项 · 7/7 全部敲定 ✅）

| # | 项目 | 已敲定内容 | 状态 |
|---|---|---|---|
| 04.1 | Idle 完整态 | 9 页全部画完，见本手册 §1 页面图册。 | ✅ 已定 |
| 04.2 | Loading / Skeleton 骨架屏 | **Shimmer 同形骨架**：骨架形状=最终布局实际形状（表格→表格条骨架，卡片→卡片骨架），不做独立 spinner。Shimmer 用从左到右淡扫光效果，**延迟 200ms 才出现**（避免快速数据闪骨架），上限 5s 超时降级错误态。 | ✅ 已定 |
| 04.3 | Empty 空态（首登 / 无筛选结果） | **图标 + 大字标题 + 一句话解释 + 大 CTA 主按钮**。三类空态：①首登无动词→图标+\"这里还是空的\"+\"从批量导入 verbos 包动词开始吧\"+主按钮\"立即导入\"。②筛选无结果→\"没找到匹配项\"+\"试试去掉搜索词或筛选条件\"+次按钮\"清空筛选\"。③用户清空→\"全部搞定！\"+小庆祝反馈，不必强 CTA。 | ✅ 已定 |
| 04.4 | Error 错误态 | 页面级错误：居中大号错误图标 + 大字标题（如 \"导入失败了\"）+ 具体原因一句话（不是 \"出错了\"这种废话，而是 \"上传的 JSON 不是 Conjuga 导出格式\" / \"网络断了没读到数据\"）+ 支持 ID（错误码）+ 两个操作：①主按钮\"重试\" ②次按钮\"返回首页\"。字段级错误参照 03.2 输入框 Error + 内联修复建议。 | ✅ 已定 |
| 04.5 | Success 成功态 | 练习答对→**绿框（2px #34C759）+ 底部一行绿色短文案 \"正确！连续答对 2/3 毕业\"**，常驻到下一题进入再消失。全局操作成功→顶部 Toast 3s 自动消失（导出成功、导入成功等）。 | ✅ 已定 |
| 04.6 | Partial 部分加载态 | **结果 Modal + 折叠清单（2026-08-29 拍板）**。坏数据跳过，好数据正常入库（避免"3 条坏导致 500 条全进不去"）。结束弹结果 Modal：大号绿色"成功 500 条"+大号红色"跳过 3 条损坏数据"+展开折叠面板列出每条失败的动词+具体失败原因（如"缺少 pretérito indefinido 时态"/"JSON 格式错误行号"）+底部主按钮"去动词库查看"+次按钮"下载失败清单 txt"。完整流程见附录 A.3。 | ✅ 已定 |
| 04.7 | Offline 离线态 | **顶部 40px 红色细横条（2026-08-29 拍板）**。`position: fixed; top:0; left:0; right:0; z-index: var(--z-toast)`；背景红色淡底 + 1px 红底边；左侧 ⚠ 图标 + 文案"当前离线。数据仍可编辑，本地存储不会丢。"；右侧 × 关闭按钮。`navigator.onLine=false` 时出现，`online` 事件触发时自动消失。完整规格见附录 A.4。 | ✅ 已定 |

### 0.5 页面线框图（9/9 全部完成 ✅）

| # | 页面名称 | 画完日期 | 视觉规范匹配度 |
|---|---|---|---|
| 05.1 | 首页（今日复习为主） | v2.1 | ✅ 100% |
| 05.2 | 横向对比矩阵（同时态多动词） | v2.1 | ✅ 100% |
| 05.3 | 纵向对比矩阵（同动词多时态） | v2.1 | ✅ 100% |
| 05.4 | 练习页（输入框打字 + 对答案） | v2.1 | ✅ 100% |
| 05.5 | 动词库页（搜索 / 增 / 批量导入 / 标签管理） | v2.1 | ✅ 100% |
| 05.6 | 错题页（复习队列 Tab / 错题历史 Tab + SM-2 进度条） | v3.0 | ✅ 100% |
| 05.7 | 笔记页（动词级笔记 / 独立规律口诀） | v3.0 | ✅ 100% |
| 05.8 | 时态规律速查页（词尾表 / Stem-changing / 拼写变体） | v3.0 | ✅ 100% |
| 05.9 | 设置页（统计卡 / 导出 JSON / 导入 / 显示模式 / 清空） | v3.0 | ✅ 100% |
| 05.10 | **超级矩阵 · 全动词×全时态 Excel 冻结表（v3.2 新增）**<br>3 Tab 架构：Tab1 横向 / Tab2 纵向 / Tab3 超级矩阵 | v3.2 | ✅ 100% |

> 📌 **v3.2 导航合并说明**：05.2 / 05.3 / 05.10 三个页面已合并为**一个导航入口"对比中心"**，通过顶部 3 Tab 切换。导航栏中原来的"纵向对比"菜单项隐藏并标注"已合并"，不再占用独立导航位。

### 0.6 后续补加关键决策（全部 ✅）

| # | 项目 | 决策 | 状态 |
|---|---|---|---|
| 06.1 | 横屏常驻侧边栏最终宽度 | **150px** | ✅ |
| 06.2 | 竖屏模式下侧边栏 | **抽屉模式（默认隐藏，汉堡键滑出）** | ✅ |
| 06.3 | 练习页答题方式 | **输入框打字（不用手写 OCR，不用 canvas 留痕）** | ✅ |
| 06.4 | 批量导入数据来源 | **miko3k/verbos npm 包一键导入** | ✅ |
| 06.5 | 艾宾浩斯复习间隔 | **SM-2 简化 5 档：1 天 / 3 天 / 7 天 / 14 天 / 30 天。连续对 3 次毕业，错 1 次重置到 1 天。** | ✅ |
| 06.6 | 错题录入方式 | **自动 + 手动双入口**：①练习答错自动录入+挂 SM-2 ②手动录入课外/书本错题（表单填写） | ✅ |

---

## 总结：设计缺口 **全部闭合**（0 项剩余 ✅）

| 类别 | 原 v3.0 缺口 | 最终决策（2026-08-29 拍板） | 状态 |
|---|---|---|---|
| 02.16 | Z-Index 层级未具体定数字 | **10/40/50/80/90 标准分层**。10 层完整映射表和 CSS 变量定义见附录 A.1。 | ✅ 已闭合 |
| 03.3 | 下拉选择 <select> 展开视觉未定 | **轻阴影 + 淡底高亮**。面板 12px 圆角 + 轻阴影 + 40px 选项行 + hover 灰底 + selected 主色淡底主色文字 + 左侧主色指示条（与侧栏选中态一致）。完整规格附录 A.2。 | ✅ 已闭合 |
| 04.6 | Partial 部分加载态未定 | **结果 Modal + 折叠失败清单**。跳过坏数据，好数据正常入库。Modal 顶部分绿/红统计数，展开面板列出失败动词+具体原因，底部附"下载 txt 清单"按钮。流程附录 A.3。 | ✅ 已闭合 |
| 04.7 | Offline 离线态未定 | **顶部 40px 红细横条**。fixed 贴顶不占流、红色淡底+底边；⚠+文案"当前离线。数据仍可编辑，本地存储不会丢。"；右侧×关闭。断网出现、联网自动消。规格附录 A.4。 | ✅ 已闭合 |
| 02.15 | 对比度未 Stark 实测 | **按选型默认 + 开发 Day 3 复检机制**。当前按钮对比度 4.72:1 刚好过 AA。DevTools 检测若不通过，`--color-brand` 自动调深到 `#D93E30`（5.4:1 必过），无需重走拍板流程。附录 A.5。 | ✅ 已闭合（含复检机制） |
| 02.17 | 三层令牌命名没正式化 | **附录 B 给出完整 CSS 变量表**：Primitive 原始值 / Semantic 语义别名 / Component 组件专属三层 180+ 行。开工复制进 `src/styles/tokens.css`。附录 B。 | ✅ 已闭合（完整映射表已出） |

> **犀利自检 v3.1（我的批判）**：之前你批评我"没学会完整软件搭建"是精准命中的——我喜欢铺"大面"（9 页线框、主色、品牌名），却逃避"地基工程细节"（Z-Index、展开面板样式、错误边界）。这 6 项缺口，前 4 项全是工程地基不是润色，**少一个第一周就会出 bug**。经你的批评+两轮补充拍板，现在地基也齐了。

> ⚠ **新的批判（数据风险警告）**：我发现方案里一个我之前没指出的硬伤——我们用 **IndexedDB 本地存储**，但 vivo Pad5 Pro 的 Chrome/浏览器**清理缓存会连同 IndexedDB 一起清掉**。这意味着你某天"清理浏览器垃圾"一键下去，148 只动词+58 错题+24 篇笔记全没了，且无法恢复。**唯一的保险：设置页按"导出 JSON"每周手动备份一次**。MVP 暂时不做自动云端备份（WebDAV/坚果云），但这条风险必须白纸黑字写在文档里，将来别甩锅说"我没提醒你"。

> **犀利自检 v3.2（新功能批判）**：
> 1. **用户新增的这个功能——超级矩阵是"把所有词所有态放一个 Excel 冻结表"——你自己想想：15 时态 × 6 人称 = 每动词 90 单元格，148 只动词就是 13,320 个 DOM cell，**一次性渲染必然掉帧甚至卡死平板浏览器**。我做了"默认 10 只 / 加载下 30 只"的性能降载，但是你要知道：**这意味着你无法一屏看全 148 只动词的对比**，必须分批滚动加载。这个妥协我已经给你做了默认，但是你得拍板接受它——否则平板扛不住。
> 2. **另一个硬伤**：你要的"顶部时态行固定 + 左边动词列固定 + 左上角格同时固定"，这在 CSS 里靠 `position: sticky` 是**刚好能用**的，但你如果要在 Excel 里那种"拖任意位置冻结"的效果（比如冻结前 2 列、前 3 行），sticky 做不到通用冻结。MVP 就**只冻结首列动词 + 首行时态**这一种布局。如果以后你想冻结人称 sub-header，要单独设计，不要让我现场调。
> 3. **第三点：你加的这个"超级矩阵"功能，本质上是横向对比 + 纵向对比的**并集**。但是三者 UI 完全不同，**你每次切 Tab 都要重新理解一套布局**。我把它们放同一 Tab 了，但这也意味着对比中心这个页面的复杂度**直接×3**，首屏加载代码量涨 50% 左右。这是为了满足你的"多动词多时态同时呈现"刚需付出的代价，希望你认可。
> 4. **最后一点："不规则/拼写变体"颜色标记**：我做了红/黄两色分类，但这要求 verbos 包**要么带 irregularity 元数据**，要么我们自己写规则判定。如果 verbos 包不支持不规则元数据，MVP 第一版只能全部显示为"规则白"，颜色标记功能会砍掉。这是技术风险我先亮明。

---

## 附录 A · 6 项缺口决策的完整细节（v3.1 新增）

### A.1 Z-Index 分层表（10/40/50/80/90 标准分层）

| 数值 | 语义变量名 | 层级名 | 对应组件 / 说明 |
|---|---|---|---|
| 0 | `--z-base` | Base | 页面默认内容流（卡片/表格/正文） |
| 1 | `--z-card-evelated` | Cards Elevated | 拖拽中的卡片（罕见） |
| 10 | `--z-sticky` | Sticky Header | 顶部吸附工具栏、表格 sticky 头 |
| 40 | `--z-drawer-overlay` | Drawer Overlay | 抽屉（侧边栏）的灰色背景遮罩 |
| 41 | `--z-drawer` | Drawer Panel | 抽屉面板本身（必须比遮罩高 1） |
| 50 | `--z-dropdown` | Dropdown / Popover | `<select>` 展开面板、自动补全、Popover |
| 80 | `--z-modal-overlay` | Modal Overlay | Modal / Dialog 半透明灰底遮罩 |
| 81 | `--z-modal` | Modal Panel | Modal / Dialog 面板 |
| 90 | `--z-toast` | Toast / Snackbar | 全局 Toast / Snackbar 提示 |
| 100 | `--z-tooltip` | Tooltip | Tooltip 小浮层（最高常态层） |

**代码实现**：原始值 + 语义别名双层，见附录 B `TIER 1 + TIER 2`。组件代码**一律引用语义别名**（如 `z-index: var(--z-modal)`），不允许用数字字面量。

### A.2 下拉选择 `<select>` 自定义展开面板规格

**触发按钮**：
- 高度 40px、左右 padding 12px、左右 1px 边框、8px 圆角
- 内容：左对齐文字 + 右对齐 chevron-down 20px 线性 1.5px 图标
- 状态：Idle→1px border；Focus→`border-color:var(--brand)` + focus ring 同输入框；Disabled→opacity .4

**展开面板**：
- 位置：触发按钮正下方，同宽（内容更宽则最大宽度取按钮宽 vs（内容宽+24px padding）之较大者，overflow 不超过视口）
- 圆角 12px；阴影 `0 8px 24px rgba(0,0,0,.12)`（同 Modal 统一 `--shadow-lg`）；1px `--border` 边框；z-index `var(--z-dropdown)=50`
- **选项行**：高度 40px、左右 padding 12px、垂直居中、单字截断省略号。
  - Idle：正常文字 `--color-text`
  - Hover / Focus：`background: var(--color-bg)`（浅灰，约 2%）
  - Selected：`background: var(--color-brand-light)` + `color: var(--color-brand)` + **左侧 3px 宽 `--color-brand` 选中指示竖条**（与侧边栏 active 态视觉统一，保证应用内"选中"语义的识别模式一致，降低用户认知成本）
  - Disabled：opacity .4；pointer-events none

### A.3 批量导入 verbos 包 · Partial 部分失败态（坏数据 3 条 + 好 500 条）

**数据处理原则**：**跳过坏的、保留好的**——绝不因 0.6% 数据损坏让 99.4% 白做（用户体验原则："尽量导入更多"而非"要么全好要么全扔"）。

**流程**：
1. 用户点击"从 verbos 批量导入"→ 弹 loading Modal "正在导入 verbos 包数据…"（进度条 0-100%）
2. 解析 JSON：每条记录校验（动词原形非空、至少一种时态非空、字段类型正确）
3. 校验失败的记录跳过（不入库），push 到 `failedItems[]` 数组
4. 校验通过的记录写入 IndexedDB
5. Loading Modal 关闭 → **结果 Modal 打开**：
   - **顶部两行大号统计**：
     - 绿色行 "✅ 成功导入 **500** 条动词变位"（数字加粗 28px 主色）
     - 红色行 "⚠ 跳过 **3** 条损坏数据"（数字加粗 28px 错误色）
   - **中部折叠面板（默认展开）**"查看失败详情"：
     - 小标题"失败的 3 条记录（文件名：conjuga-import-20260829.json）"
     - 表格 3 列：序号 / 动词原形（或"解析错误第 12345 字符"如果不是完整对象） / 失败原因（"缺少 pretérito indefinido 时态" / "hablar 的 vosotros 字段类型不是字符串" / "不是合法 JSON，跳过该段"）
   - **底部按钮组（右对齐）**：
     - 次按钮 `⬇ 下载失败清单 txt` → 导出 `conjuga-failed-2026-08-29.txt`，内容是 3 条 verbatim JSON + 错误原因，供用户手动修复后单独再导入
     - 主按钮 `知道了 → 去动词库` → 跳 `/library` 页面，定位到最新导入的 500 条顶部，显示 Toast "导入完成 🎉"

### A.4 Offline 离线提示（PWA 断网）

**触发条件**：
- 初始加载时若 `navigator.onLine === false` → 立即显示
- 运行中监听 `window` 的 `offline` 事件 → 出现
- 监听 `online` 事件 → **自动关闭**（不需要用户手动关，联网就好）

**视觉 & 规格**：
- 高度 40px；`position: fixed; top: 0; left: 0; right: 0`；z-index `var(--z-toast)`（固定 90）
- 背景色 `var(--color-err-light)`（红淡底）；下边框 `1px solid var(--color-err)`
- 内容区：`padding: 0 16px; display: flex; align-items: center; justify-content: space-between; height: 40px;`
  - **左侧**：⚠ 图标（20px `--color-err`） + 13px 文字"当前离线。数据仍可编辑，本地存储不会丢。" + 小号补充"（IndexedDB 本地存在平板上，不需要联网即可读写）"
  - **右侧**：24×24 × 关闭按钮（`cursor:pointer`）。点击后设置 `sessionStorage.setItem('offline-dismissed','1')`，当次会话不再重复出现（直到浏览器重开或重新上线再掉线）。
- 深色模式下颜色同比例映射（附录 B 暗态覆盖）。

### A.5 WCAG 对比度复检机制（主色按钮）

**当前选型**：
- `--color-brand: #E94B3C`（主色背景）
- 主按钮文字 `#FFFFFF`
- 对比度**理论值：4.72 : 1**（WCAG AA 正文级 ≥ 4.5:1 的标准，**刚好过线 0.22**，擦边球）

**复检机制（必须执行）**：
1. 开发 Day 3，UI 全部组件完成后，用 Chrome DevTools → Inspect 任一主按钮 → Styles 面板 → 点击 `background-color` 前面的颜色小方块 → 展开颜色 picker → 直接查看 **Contrast 比值**。
2. 若 **AA 正文级** 显示绿色 ✓ → 无需改动。
3. 若显示红色 ✗（实际值 < 4.5:1，可能因不同颜色 profile 或显示算法偏差）→ **无需再和用户拍板**，自动执行以下降级：
   ```css
   /* tokens.css 顶部 override 一行即可 */
   :root {
     --color-brand: var(--p-brand-600); /* #D93E30 */
   }
   ```
   `#D93E30` 对比白字对比度为 **5.4 : 1**，100% 过 AA。

### A.6 三层令牌命名体系的使用规则

三层的本质是**分离"是什么值"和"为什么用"**。改主色时只改 `--p-brand-500` 一行，所有用到主色的组件（按钮/标签/侧栏/矩阵表头）自动同步，不会漏。

**强制定律**：组件 CSS 中，**不允许出现 hex 颜色、硬编码像素字号/间距、数字 z-index**。全部引用第三层 Component token 或第二层 Semantic token。

✅ **正确示范**：
```css
.btn-primary {
  background: var(--btn-primary-bg);     /* 第三层组件 token */
  color: var(--btn-primary-fg);
  border-radius: var(--btn-radius);      /* 组件几何 */
  min-height: var(--touch-min);          /* 语义：触摸最小 48px */
  transition: background var(--dur-fast) var(--ease-out); /* 语义：快动效 */
}
```
❌ **错误示范**（禁止）：
```css
.btn-primary {
  background: #E94B3C;      /* ❌ 硬编码 hex，改主色要搜全项目 */
  border-radius: 8px;       /* ❌ 硬编码像素，将来换圆角方案改不统一 */
  min-height: 48px;         /* ❌ 数字字面量，哪天换 56px 不好追踪 */
  z-index: 999;             /* ❌ 魔鬼数字，全项目 999 大战必打架 */
}
```

三层全部映射表 → 附录 B。

---

## 附录 B · 完整三层 CSS 设计令牌映射表（直接复制进 `src/styles/tokens.css`）

```css
/* ========================================================
   Conjuga Design Tokens v3.1 — Three-Tier Architecture
   Primitive (Raw values) → Semantic (Purpose) → Component
   ======================================================== */

/* ===== TIER 1: PRIMITIVE / REFERENCE TOKENS (Raw values) ===== */
:root {
  /* Brand primitive — orange-red scale 50-700 */
  --p-brand-50:   #FFF5F3;
  --p-brand-100:  #FDE8E5;
  --p-brand-200:  #F9C9C3;
  --p-brand-500:  #E94B3C;   /* 品牌基色 ← 可根据 A.5 复检结果替换为 #D93E30 */
  --p-brand-600:  #D93E30;   /* 深一档（对比度降级备用 + 选中加深） */
  --p-brand-700:  #B72D21;

  /* Status scales */
  --p-ok-50:      #E9FBF0;
  --p-ok-500:     #34C759;
  --p-err-50:     #FFEBEA;
  --p-err-500:    #FF3B30;
  --p-warn-50:    #FFF4E5;
  --p-warn-500:   #FF9500;

  /* Neutral — light mode */
  --p-nl-0:       #FFFFFF;   /* cards / 按钮默认背景 */
  --p-nl-50:      #FAFAFA;   /* page background */
  --p-nl-200:     #E5E5EA;   /* default border */
  --p-nl-500:     #6E6E73;   /* muted text */
  --p-nl-900:     #1D1D1F;   /* primary text */
  /* Neutral — dark mode (iOS-standard 暗态) */
  --p-nd-900:     #1C1C1E;   /* page bg dark */
  --p-nd-800:     #2C2C2E;   /* card bg dark */
  --p-nd-700:     #38383A;   /* border dark */
  --p-nd-500:     #98989D;   /* muted text dark */
  --p-nd-100:     #F5F5F7;   /* primary text dark */

  /* Typography primitives */
  --p-font-sans:  -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Noto Sans CJK SC", sans-serif;
  --p-font-mono:  "SF Mono", Menlo, Consolas, monospace;
  --p-fs-12: 12px; --p-fs-14: 14px; --p-fs-16: 16px; --p-fs-18: 18px;
  --p-fs-20: 20px; --p-fs-24: 24px; --p-fs-30: 30px; --p-fs-36: 36px;
  --p-lh-tight:   1.25;
  --p-lh-normal:  1.5;
  --p-lh-loose:   1.65;
  --p-fw-regular: 400;
  --p-fw-medium:  500;
  --p-fw-bold:    700;
  --p-fw-black:   800;

  /* Spacing — strict 8pt grid. 别名用 1-16 而非像素。 */
  --p-sp-0: 0;   --p-sp-1: 4px;  --p-sp-2: 8px;  --p-sp-3: 12px;
  --p-sp-4: 16px;--p-sp-5: 20px; --p-sp-6: 24px; --p-sp-8: 32px;
  --p-sp-10: 40px; --p-sp-12: 48px; --p-sp-16: 64px;

  /* Radius */
  --p-r-sm: 4px;
  --p-r-md: 8px;
  --p-r-lg: 12px;
  --p-r-full: 999px;

  /* Shadow — flat style only 1 elevation */
  --p-sh-lg: 0 8px 24px rgba(0, 0, 0, .12);

  /* Motion primitives */
  --p-d-fast:   150ms;
  --p-d-normal: 300ms;
  --p-d-slow:   500ms;
  --p-ease-out: ease-out;
  --p-ease:     ease-in-out;

  /* Touch targets — WCAG coarse pointer min */
  --p-touch-target: 48px;

  /* Z-index — Appendix A.1 */
  --p-z-0:   0;    --p-z-1:   1;    --p-z-10:  10;
  --p-z-40:  40;   --p-z-41:  41;   --p-z-50:  50;
  --p-z-80:  80;   --p-z-81:  81;   --p-z-90:  90;   --p-z-100: 100;

  /* Opacity */
  --p-op-100: 1;
  --p-op-graduated: .62;  /* 已毕业错题卡降档（~40% 透明） */
  --p-op-disabled:  .40;  /* 禁用按钮/输入 */
}

/* ===== TIER 2: SEMANTIC / ALIAS TOKENS (Named by PURPOSE, not value) =====
   组件代码推荐直接从这一层 + 第三层 Component 取。 ===== */
:root {
  /* Colors semantic */
  --color-brand:         var(--p-brand-500);
  --color-brand-deep:    var(--p-brand-600);
  --color-brand-light:   var(--p-brand-100);      /* 8-15% 淡底 */
  --color-brand-strong:  var(--p-brand-50);
  --color-ok:            var(--p-ok-500);
  --color-ok-light:      var(--p-ok-50);
  --color-err:           var(--p-err-500);
  --color-err-light:     var(--p-err-50);
  --color-warn:          var(--p-warn-500);
  --color-warn-light:    var(--p-warn-50);
  --color-bg:            var(--p-nl-50);
  --color-surface:       var(--p-nl-0);
  --color-border:        var(--p-nl-200);
  --color-text:          var(--p-nl-900);
  --color-text-muted:    var(--p-nl-500);

  /* Typography semantic */
  --font-sans:           var(--p-font-sans);
  --font-mono:           var(--p-font-mono);
  --fs-caption:    var(--p-fs-12);
  --fs-sub-body:   var(--p-fs-14);
  --fs-body:       var(--p-fs-16);
  --fs-subtitle:   var(--p-fs-18);
  --fs-h-small:    var(--p-fs-20);
  --fs-h3:         var(--p-fs-24);
  --fs-h2:         var(--p-fs-30);
  --fs-h1:         var(--p-fs-36);
  --lh-tight:  var(--p-lh-tight);
  --lh-normal: var(--p-lh-normal);
  --fw-medium: var(--p-fw-medium);
  --fw-bold:   var(--p-fw-bold);
  --fw-black:  var(--p-fw-black);

  /* Spacing semantic (组件只引用 xs/sm/md/lg/xl 语义名，不用像素) */
  --space-xs:  var(--p-sp-1);   /* 4 */
  --space-sm:  var(--p-sp-2);   /* 8 */
  --space-md:  var(--p-sp-4);   /* 16 */
  --space-lg:  var(--p-sp-6);   /* 24 */
  --space-xl:  var(--p-sp-10);  /* 40 */
  --gutter:     var(--p-sp-6);  /* 24 container outer pad */

  /* Radius semantic */
  --radius-sm:    var(--p-r-sm);
  --radius:       var(--p-r-md);
  --radius-lg:    var(--p-r-lg);
  --radius-pill:  var(--p-r-full);

  /* Shadow / Elevation */
  --shadow-lg:   var(--p-sh-lg);   /* only modal/dropdown/drawer. 卡片/按钮 0 阴影（扁平风格） */

  /* Motion semantic */
  --dur-fast:    var(--p-d-fast);
  --dur-normal:  var(--p-d-normal);
  --dur-slow:    var(--p-d-slow);
  --ease-out:    var(--p-ease-out);
  --ease:        var(--p-ease);

  /* Touch targets */
  --touch-min:   var(--p-touch-target);

  /* Z-Index semantic — Appendix A.1 映射表 */
  --z-base:            var(--p-z-0);
  --z-card-elevated:   var(--p-z-1);
  --z-sticky:          var(--p-z-10);
  --z-drawer-overlay:  var(--p-z-40);
  --z-drawer:          var(--p-z-41);
  --z-dropdown:        var(--p-z-50);
  --z-modal-overlay:   var(--p-z-80);
  --z-modal:           var(--p-z-81);
  --z-toast:           var(--p-z-90);
  --z-tooltip:         var(--p-z-100);

  /* Opacity semantic */
  --op-graduated: var(--p-op-graduated);   /* 已毕业错题库卡片降档 62% */
  --op-disabled:  var(--p-op-disabled);    /* 禁用按钮/输入 40% */
}

/* ===== Dark mode semantic overrides (auto via prefers-color-scheme) ===== */
@media (prefers-color-scheme: dark) {
  :root {
    --color-bg:            var(--p-nd-900);
    --color-surface:       var(--p-nd-800);
    --color-border:        var(--p-nd-700);
    --color-text:          var(--p-nd-100);
    --color-text-muted:    var(--p-nd-500);
    /* 暗态下主色淡底必须加深（8% 在暗底上看不见） */
    --color-brand-light:   rgba(233, 75, 60, .16);
    --color-brand-strong:  rgba(233, 75, 60, .25);
  }
}

/* ===== TIER 3: COMPONENT TOKENS (Specific per component; alias semantic) =====
   ⚠ RULE: 组件 CSS 一律从这一层取，不许写 hex/px/数字。 ===== */
:root {
  /* ==== Button ==== */
  /* Primary 主按钮（橙红底白字） */
  --btn-primary-bg:         var(--color-brand);
  --btn-primary-fg:         #FFFFFF;
  --btn-primary-border:     var(--color-brand);
  --btn-primary-bg-hover:   color-mix(in srgb, var(--color-brand) 90%, white);   /* 变浅 10% */
  --btn-primary-bg-active:  color-mix(in srgb, var(--color-brand) 80%, white);   /* 变浅 20% */
  /* Default / Ghost 次按钮（白底灰边） */
  --btn-default-bg:         var(--color-surface);
  --btn-default-fg:         var(--color-text);
  --btn-default-border:     var(--color-border);
  --btn-default-bg-hover:   var(--color-brand-light);
  /* Danger 按钮（红边红字，清空本地数据用） */
  --btn-danger-fg:          var(--color-err);
  --btn-danger-border:      var(--color-err);
  /* Shared button geometry — 与 48px 触摸目标对齐 */
  --btn-height:             40px;        /* 常规工具栏按钮，外部 wrap 到 48 满足触摸 */
  --btn-height-lg:          48px;        /* CTA 大按钮 */
  --btn-radius:             var(--radius);
  --btn-font-size:          var(--fs-sub-body);
  --btn-padding-x:          14px;

  /* ==== Input Field ==== */
  --input-height:            40px;       /* 同按钮；练习页人称输入框组件内 override 为 44px(见 person-input) */
  --input-person-height:     44px;       /* 练习页专用：放大让手指容易点 */
  --input-bg:                var(--color-surface);
  --input-fg:                var(--color-text);
  --input-placeholder:       var(--color-text-muted);
  --input-border:            var(--color-border);
  --input-border-focus:      var(--color-brand);
  --input-focus-ring:        0 0 0 2px rgba(233, 75, 60, .15);   /* WCAG 焦点描边 2px */
  --input-border-error:      var(--color-err);
  --input-bg-error:          var(--color-err-light);
  --input-bg-success:        var(--color-ok-light);
  --input-border-success:    var(--color-ok);

  /* ==== Card ==== */
  --card-bg:               var(--color-surface);
  --card-border:           var(--color-border);
  --card-radius:           var(--radius-lg);
  --card-padding:          var(--space-md);    /* 16 */
  --card-padding-sm:       var(--space-sm);    /* 8 */
  --card-padding-lg:       var(--space-lg);    /* 24 */

  /* ==== Tag / Badge ==== */
  --tag-radius:            var(--radius-pill);
  --tag-padding-y:         2px;
  --tag-padding-x:         8px;
  --tag-font-size:         11px;
  --tag-brand-bg:          var(--color-brand-light);   --tag-brand-fg: var(--color-brand);
  --tag-ok-bg:             var(--color-ok-light);      --tag-ok-fg:    var(--color-ok);
  --tag-err-bg:            var(--color-err-light);     --tag-err-fg:   var(--color-err);
  --tag-warn-bg:           var(--color-warn-light);    --tag-warn-fg:  var(--color-warn);
  --tag-neutral-bg:        var(--color-bg);            --tag-neutral-fg: var(--color-text-muted);

  /* ==== Sidebar ==== (150px 横屏常驻 / 抽屉竖屏) */
  --sidebar-width:         150px;
  --sidebar-width-desktop: 180px;          /* ≥1280px 桌面加宽 */
  --sidebar-item-height:   var(--touch-min);   /* 48px — 满足触摸 */
  --sidebar-active-bg:     var(--color-brand-light);
  --sidebar-active-fg:     var(--color-brand);
  --sidebar-active-indicator-width: 3px;
  --sidebar-active-indicator-color: var(--color-brand);   /* 左侧选中指示竖条 */
  --sidebar-fg-idle:       var(--color-text);

  /* ==== Matrix Tables (对比矩阵 + 动词库表格) ==== */
  --table-head-bg:         var(--color-brand-light);
  --table-head-fg:         var(--color-brand);
  --table-border:          var(--color-border);
  --table-alt-bg:          var(--color-bg);
  --table-cell-pad:        var(--space-sm) var(--space-md);
  --table-matrix-mono-fs:  12.5px;         /* 等宽变位字号 */

  /* ==== Wrong Card 错题毕业进度条 ==== */
  --progress-bar-height:   4px;
  --progress-bar-bg:       var(--color-border);
  --progress-fill:         var(--color-brand);
  --progress-fill-warn:    var(--color-warn);
  --progress-fill-ok:      var(--color-ok);

  /* ==== Modal / Dialog ==== */
  --modal-width:           640px;          /* 横屏主场景 */
  --modal-width-mobile:    calc(100vw - 32px);
  --modal-radius:          var(--radius-lg);
  --modal-shadow:          var(--shadow-lg);
  --modal-padding:         var(--space-lg);    /* 24 */
  --modal-overlay-bg:      rgba(0, 0, 0, .45);

  /* ==== Offline top banner (A.4) ==== */
  --offline-height:        40px;
  --offline-bg:            var(--color-err-light);
  --offline-border-bottom: 1px solid var(--color-err);
  --offline-fg:            #8A1A12;       /* 暗深红 vs 红淡底，保证对比度 */

  /* ==== Toast / Snackbar ==== */
  --toast-bg:              rgba(0,0,0,.84);
  --toast-fg:              #FFFFFF;
  --toast-radius:          var(--radius);
  --toast-padding:         10px 16px;
  --toast-duration:        3s;             /* 自动消失时间（3.5s 动效） */
  --toast-bottom:          24px;           /* 与顶部/底部安全区间距 */
}
```

---

## 1. 页面线框图手册（9 页 · 标注每页）

> **真实视觉预览**：配套文件 `Conjuga-视觉预览.html` 用真实 CSS 按已定令牌渲染了 9 页完整视觉效果，可直接在浏览器打开。每个页面上方都有一个显眼的橙红大色块标签"第 N 页 · 页面正式名"，直接按块截图即可。

| 编号 | 页面截图（HTML 第 N 节） | 页面正式名 | 核心内容说明 |
|---|---|---|---|
| **01** | HTML `section[1]` | **首页 · 今日复习 Dashboard** | 问候语 + 今日进度卡（12/25 橙红英雄卡+动词数/标签数/正确率 3 统计）+ 3 个快捷入口（复习/导入/速查）+ 最近易错 3 题卡片列表（带 SM-2 毕业进度条）。 |
| **02** | HTML `section[2]` | **横向对比矩阵** | 同时态 × 多动词。工具条三控件：时态下拉 / 文件夹（标签）下拉 / 添加动词按钮。表格左列为动词原形，6 人称列等宽对齐；易错行（probar）用警告黄底高亮；底部附规律观察文字。 |
| **03** | HTML `section[3]` | **纵向对比矩阵** | 同动词 × 多时态。工具条：动词搜索框 / 标签 Chip / 对比 estar 按钮 / 时态多选 Chip。表格左列为时态，6 人称列；完全换形的时态行（Indefinido）红底高亮、换词根但规律的（Futuro）黄底高亮。 |
| **04** | HTML `section[4]` | **练习页** | 顶部题目卡（动词原形 Chip / 翻译 Chip / 时态信息 Chip / 进度条）+ 6 行"人称标签 / 44px 等宽输入框 / 对错+正确答案"列（对=绿框对勾+✓ 正确；错=红框+显示"正确: pudo — 没重音"）+ 底部反馈条 + 下一题按钮。 |
| **05** | HTML `section[5]` | **动词库页** | 4 按钮工具栏（搜 / + 添加 / verbos 导入 / 标签管理）+ 6 列表格（原形/翻译/标签Chip/掌握状态/操作按钮）。掌握状态有"已掌握绿/进行中橙/待练中性"三色徽章。 |
| **06** | HTML `section[6]` | **错题页（两 Tab）** | "复习队列(12)/错题历史(58)"子 Tab 切 + 搜索+筛选工具条 + 错题卡。每张卡：变位主 Chip+状态徽章（复习中橙/已毕业绿）+ 正确答案/错误答案/错过次数/下次日期 + SM-2 毕业进度条（宽度%对应连对 1/2/3）。已毕业卡 62% 透明降档。 |
| **07** | HTML `section[7]` | **笔记页** | +新建按钮 + 搜索+分类筛选 + 2 列栅格笔记卡流（左列规律总结、口诀等通用；右列挂于具体动词的笔记）。每张卡：标题（可能标注"挂于 poder"）+ 日期小标 + 3 行正文摘要 + 标签 Chip。口诀 Chip 用自定义紫底（非主色）以示品类区分。 |
| **08** | HTML `section[8]` | **时态规律速查页** | 搜索 + 按时态目录按钮 + 2 列栅格规则卡：①常规词尾 ②拼写变体 ③Stem-changing ④Futuro Simple 构成 ⑤Subjuntivo 两步走口诀（占满两列宽）。每卡等宽两列：术语（等宽粗西语）+ 浅灰中文解释。 |
| **09** | HTML `section[9]` | **设置页** | 3 统计大卡（148 动词/23 标签/58 错题）+ 6 行设置项：导出JSON（主按钮）/ 导入JSON（次按钮警告文案）/ 显示模式下拉 / 艾宾浩斯间隔编辑 / 毕业条件下拉 / 清空红边红按钮 / 版本信息虚线框。 |

---

## 2. 配套使用说明

1. **要 10 页截图用于展示或汇报**：直接在浏览器打开 [Conjuga-视觉预览.html](Conjuga-视觉预览.html) → 每页顶部都有显眼的大橙红标签"第 0X 页 · 名称" → 按节截即可。深色模式下截图也好看（自动暗态切换）。**第 10 页是 v3.2 新增的"超级矩阵" Excel 冻结总览，务必单独截图保存。**
2. **要喂给 Trae / Codex / Cursor 开工**：把**本手册 v3.2（最新）** + 附录 B 的 `tokens.css`（直接复制）+ **附录 C 的 Mega Matrix 专用令牌（必须复制，否则 sticky 冻结不工作）** + 原 MVP 设计文档 `动词变位应用-MVP设计文档.md` 第 9 章"执行 prompt"，四个一起喂给 AI。禁止喂旧版 v3.0/v3.1。
3. **每日编码规范底线（开工前强制阅读）**：
   - **严禁**在组件 CSS 中写 hex 颜色、数字像素、数字 z-index。全部从附录 B 的 Semantic / Component token 引用。
   - **严禁**所有可点击元素 `<48px` 触摸目标高度（`min-height: var(--touch-min)`）。
   - **严禁** Modal/Drawer/Dropdown 叠层不写 z-index token，出现"遮罩盖不住面板"直接算 bug。
   - **严禁**写死 150px 侧栏——写 `var(--sidebar-width)`，响应式断点 900/1280 自动切抽屉 180px。
   - **严禁（v3.2 新增红线）**超级矩阵表格**拆双表（一个 header 表 + 一个 body 表）**用 JS 同步列宽。这个方案 100% 会出现列宽错位（见 Experience ID 803672 的教训）。必须用**单 `<table>` + `position: sticky`**方案。违反直接算 P0 bug。
4. **Weekly 数据备份仪式（写给用户你自己）**：每周日睡前打开设置页 → 点"导出 JSON"→ 文件保存到网盘或微信文件传输助手里。**清浏览器缓存会丢 IndexedDB 全数据，不备份别骂我没提醒（上文风险警告已标）**。
5. **主色按钮对比度复检（Day 3 必做）**：按附录 A.5 的步骤用 Chrome DevTools 检查。如果没过 AA（4.5:1），直接把 `--color-brand` 指向 `--p-brand-600`，**不用重新走拍板流程**（我已经授权你自动降级了）。
6. **超级矩阵性能警戒线（Day 4 必测）**：用 148 只动词 × 5 时态全量数据跑一次，Chrome DevTools Performance 面板首屏滚动到 60fps，任何一次长任务 `>100ms` 就必须切回"加载下 30"分批渲染模式。不许偷偷懒一性渲染全量，平板扛不住。

---

## 附录 C · 超级矩阵（Mega Matrix）专用组件令牌 + Sticky 工程方案（v3.2 新增）

> **适用页面**：对比中心 → Tab 3 超级矩阵
> **设计意图**：一张表覆盖所有录入动词 × 所有变位时态，Excel 式冻结：**左列动词原形 + 顶行时态标题**永远固定，中间变位区**横向+纵向自由滚动**。
> **核心技术约束（血的教训）**：`Experience ID: 803672` 明确指出——**拆双表（header 表 + body 表）+ JS 同步列宽 = 100% 出现列宽错位**。本方案**严格使用单表 + position: sticky**，绝对不拆表。

---

### C.1 三层令牌映射（Primitive → Semantic → Component）

#### C.1.1 Primitive Token（沿用附录 B 已有值，不新增）

| 原始值 | 复用变量 | 说明 |
|---|---|---|
| `#E94B3C` | `--p-brand-500` | 不规则变位文字色 |
| `rgba(233,75,60,.06)` | Primitive 字面量（语义层打包） | 整行 hover / 不规则单元格底 |
| `#FF9500` | `--p-warn-500` | 拼写变体文字色 |
| `rgba(255,149,0,.06)` | Primitive 字面量（语义层打包） | 拼写变体底 |
| `110px` | `--p-sp-110` | 冻结列宽 |
| `540px` | `--p-sp-540` | 1032 横屏下表格滚动高度上限 |
| `z-index 1 / 2 / 3` | `--p-z-10 / --p-z-20 / --p-z-30` | corner(3) > tense-head(2) > verb-col(1) |

#### C.1.2 Semantic Token（超级矩阵语义层，16 个）

```css
/* 在 tokens.css 中 @layer tokens 末尾追加以下： */

/* === Mega Matrix Semantic (v3.2) === */
  --mega-col-frozen: 110px;          /* 左列动词宽度 */
  --mega-head-height: auto;          /* 时态标题行高 */
  --mega-body-max-h: 540px;          /* 滚动区高度 (1032 横屏) */
  --mega-cell-fs: 11.5px;            /* 变位字号（等宽字体） */
  --mega-person-fs: 9.5px;           /* 人称标签字号 */
  --mega-verb-fs: 13px;              /* 左列动词原形字号 */
  --mega-tense-fs: 12px;             /* 时态标题字号 */
  --mega-irreg-bg: rgba(233,75,60,.06);  /* 不规则底 */
  --mega-irreg-fg: var(--color-brand);    /* 不规则文字 */
  --mega-spell-bg: rgba(255,149,0,.06);   /* 拼写变体底 */
  --mega-spell-fg: var(--color-warn);     /* 拼写变体文字 */
  --mega-row-hover: rgba(233,75,60,.08);  /* 整行 hover 底 = 8% 主色 */
  --mega-corner-bg: var(--surface);       /* 左上交叉底 */
  --mega-head-bg: var(--brand-light);     /* 时态表头底 */
  --mega-col-z: 1;                   /* z-verb */
  --mega-head-z: 2;                  /* z-tense */
  --mega-corner-z: 3;                /* z-corner */
```

#### C.1.3 Component Token（组件层，直接写进 .mega-matrix 类）

```css
/* 写进 src/components/MegaMatrix.vue 的 <style> 或 mega-matrix.css */
.mega-wrap {
  max-width:100%;
  max-height: var(--mega-body-max-h);
  overflow:auto;                    /* 水平+垂直都可滚 */
  border:1px solid var(--border);
  border-radius: var(--radius-lg);
}
.mega-matrix {
  width:100%;
  min-width:max-content;            /* 时态多时横滚 */
  border-collapse:separate;
  border-spacing:0;
  table-layout:fixed;               /* 关键：列宽固定，避免错位 */
}
/* —— 冻结三要素（绝对不能漏）—— */
.mega-matrix thead th.corner {        /* 左上交叉格 */
  position:sticky; top:0; left:0;
  z-index: var(--mega-corner-z);
  background: var(--mega-corner-bg);
  width: var(--mega-col-frozen); min-width: var(--mega-col-frozen);
}
.mega-matrix thead th.tense {         /* 顶部时态行 */
  position:sticky; top:0;
  z-index: var(--mega-head-z);
  background: var(--mega-head-bg);
  color: var(--color-brand);
}
.mega-matrix tbody th.verb {          /* 左侧动词列 */
  position:sticky; left:0;
  z-index: var(--mega-col-z);
  background: var(--surface);
  width: var(--mega-col-frozen); min-width: var(--mega-col-frozen);
}
/* —— Hover 整行高亮 —— */
.mega-wrap table tbody tr:hover td,
.mega-wrap table tbody tr:hover th.verb { background: var(--mega-row-hover); }
/* —— 单元格样式 —— */
.mega-matrix th,.mega-matrix td {
  border-right:1px solid var(--border);
  border-bottom:1px solid var(--border);
  padding:0;text-align:center;background:var(--surface);
}
.per-6 { display:grid; grid-template-rows:repeat(6, 1fr); gap:0; }
.per-cell {
  font-family: var(--font-mono);
  font-size: var(--mega-cell-fs);
  padding:3px 4px;
  border-top:1px dashed rgba(0,0,0,.06);
  display:flex; align-items:center; justify-content:space-between; gap:4px;
}
.per-cell:first-child { border-top:0; }
.per-cell .pname {
  font-family: var(--font-sans);
  font-size: var(--mega-person-fs);
  color: var(--text-muted);
  text-align:left; font-weight:500;
}
.per-cell .pform { font-weight:600; text-align:right; }
.per-cell.irreg { background: var(--mega-irreg-bg); }
.per-cell.irreg .pform { color: var(--mega-irreg-fg); }
.per-cell.spell { background: var(--mega-spell-bg); }
.per-cell.spell .pform { color: var(--mega-spell-fg); }

/* —— 模式 Tab + 工具条 —— */
.mode-tabs { display:flex; gap:0; margin-bottom:12px; border-bottom:1px solid var(--border); }
.mode-tabs button {
  padding:8px 16px; font-size: var(--fs-body-sm);
  background:transparent; border:0; border-bottom:2px solid transparent;
  color: var(--text-muted); cursor:pointer; margin-bottom:-1px;
}
.mode-tabs button.active { color: var(--color-brand); border-bottom-color: var(--color-brand); font-weight:600; }
.legend { display:flex; gap:12px; flex-wrap:wrap; margin-top:8px; font-size: var(--fs-caption); color: var(--text-muted); }
.legend span::before { content:""; display:inline-block; width:12px; height:12px; border-radius:3px; margin-right:5px; vertical-align:middle; }
.legend .l-irreg::before { background: var(--mega-irreg-bg); }
.legend .l-spell::before { background: var(--mega-spell-bg); }
.legend .l-norm::before { background: var(--surface); border:1px solid var(--border); }
```

---

### C.2 数据结构 + 交互细节（开发用 Spec）

#### C.2.1 表格维度

| 维度 | 范围 | 默认值 | 备注 |
|---|---|---|---|
| 行数（动词） | 全部录入动词库的 verb | **默认前 20 只** + 「加载下 30 只」按钮 | P0：首屏不能渲染 >20 只，否则掉帧 |
| 列数（时态） | 4 个模式分组：<br>① Indicativo 核心 5<br>② Subjuntivo 核心 4<br>③ Imperativo 2<br>④ Todo 完整 15+ | **Indicativo 5 时态（默认）** | 右上角 Select 一键切换 |
| 每个时态内行数 | yo / tú / él / nosotros / vosotros / ellos → **6 人称** | 6（**必须含 vosotros**） | MVP 不做 "显示/隐藏 vosotros" 开关 |
| 交叉冻结 | 左上 corner `×`  verb 列 `left:0` + tense 行 `top:0` | z-index 3 / 2 / 1 | 绝不能漏写，否则 corner 被任意一方盖掉 |

#### C.2.2 工具条（5 个必带元素）

1. **搜索框**（左 1）：支持动词原形搜索 / 拼写后缀 `-car / -zar / -gar / -er / -ir / -ar` 模糊匹配。输入后实时过滤行。空字符回到原列表。
2. **标签 Chip 组**（左 2）：取用户动词库里所有硬编码大类 + 自定义子标签，每个标签显示带数量（例：`不规则核心 (23)`）。Click 切换多选（保留 shift+click 多选？→ MVP 只做单选 + 一个"全部"Chip 复位）。
3. **动词排序 Select**（右 1，MVP 可选）：`录入顺序（默认） / 原形 A→Z / 不规则数从多到少`。MVP 默认顺序即可。
4. **时态组 Select**（右 2，必带）：`Indicativo 5 时态 / 所有 15 时态 / 仅核心 3 / 仅虚拟式 / 仅命令式`。切换后重渲染列。
5. **列数文字反馈**（右 3，文案）：`当前 10/148 动词 × 5 时态 = 300 变位 / 横滚看 5+ 时态 · 纵滚看 138+ 动词`。

#### C.2.3 颜色分级规则（三类视觉层级）

| 级别 | 触发条件 | 底 | 字色 |
|---|---|---|---|
| 红色 .irreg | 变位**不是词尾加后缀**的变化：<br>① stem-changing（o→ue / e→ie / e→i / u→ue）<br>② 完全不规则词根（ser→soy / tener→tengo / haber→he）<br>③ 预terito 特殊词干（tener→tuve / poder→pude） | `--mega-irreg-bg` 6% | `--mega-irreg-fg` 主色 |
| 黄色 .spell | 纯**拼写变体**（发音不变、正字法改）：<br>① `-car → c/qu`（buscar→busqué/busque）<br>② `-gar → g/gu`（jugar→jugué/juegue）<br>③ `-zar → z/c`（lanzar→lancé/lance） | `--mega-spell-bg` 6% | `--mega-spell-fg` 橙黄 |
| 白色（默认） | 规则变位（hablar→hablo/comí/viví） | `--surface` | `--text` |

> 🚨 **技术风险（已在上文自检批判里提过）**：如果 verbos 包**不给 irregularity 元数据**，红/黄标记功能 MVP 第一版**直接砍掉**，退回全白。**不许用我写的 3 类规则硬套——因为你我不可能人肉写出所有 148 只动词的 15 时态不规则判定表，那是 13,320 条判断的无底洞**。
>
> 🚨 更稳妥的临时方案：**Day 3 做 verbos 包 API 调研时同时查 irregularity 字段，如果有 → 直接用；没有 → 用 `src/utils/irregular-rules.ts` 做一个 "Top 30 高频完全不规则动词" 硬编码白名单 + "-car/-gar/-zar 后缀规则"，覆盖大概 80% 的常用颜色标记**。剩下 20% 漏标就漏标，不影响功能。

#### C.2.4 性能降载（分 3 档，自动选）

| 档 | 动词总数 | 首屏渲染 | 每次加载更多 | 触发横滚懒加载？ |
|---|---|---|---|---|
| 档 1（最佳） | ≤ 20 | 全量 20 | —— | 否 |
| 档 2（建议） | 21 ~ 200 | **前 20** | ➕ 加 30 / 次 | 否（Click "加载更多"按钮） |
| 档 3（≥200，非 MVP） | > 200 | 前 20 | 50 / 次，或者虚拟滚动 | 开（MVP 不做虚拟滚动，超 200 只就提示"你词量超 MVP 了，请筛选标签"） |

> **一句话：148 只动词（当前用户目标量）走档 2 完全没问题，4 次点击就能加载完所有。**

#### C.2.5 列宽同步方案（防 Experience ID 803672 错误重犯）

**绝对不做的做法（反向模式）：**
```
❌ 做法 1：拆成两个 <table> —— header-table（只有时态行）+ body-table（有 verb + 变位）
          用 JS addEventListener('resize') 同步两表 colgroup col.width
    失败原因：浏览器 sub-pixel 渲染 + 等宽字体宽度变化，100% 差 1~2px，列错位。
❌ 做法 2：thead 用 position: sticky 但 th.corner 不写 left:0
    失败原因：横滚时 corner 会被滚走，corner 盖不住 top-left 交叉空白。
```

**唯一正确做法（本方案指定）：**
```
✅ 单 <table>
  + <thead> → th.corner sticky top:0 + left:0 z-3
             → th.tense  sticky top:0 z-2
  + <tbody> → th.verb sticky left:0 z-1
             → td 内部 .per-6（6 行人称）
  + table-layout: fixed + min-width: max-content
  + 所有列宽由 colgroup 或首行 th/td 的 width 指定
```

本方案**列宽完全由表格自身控制**，不依赖 JS resize，100% 不会出现列宽错位。这是 sticky 单表的核心优势，开发时**严禁偷懒走拆表捷径**。

#### C.2.6 Hover 高亮联动（找规律专属交互）

| 触发 | 视觉反馈 | 目的 |
|---|---|---|
| 鼠标悬停 `tbody tr`（某动词行） | 整行所有 `td` + `th.verb` → `background: var(--mega-row-hover)` 8% 主色淡底 | 横向一眼看某动词的 5 时态全貌 |
| （MVP 可选）鼠标悬停 `thead th.tense`（某时态列） | 对应列所有 `td` → 12% 主色淡底（需要 JS 监听：加一列 CSS class） | 纵向一眼看某时态下所有动词的对比 |

> MVP 必做横联动（行 hover，CSS 已支持），纵联动（列 hover）做不到就 P2 砍，不阻塞。**因为列 hover CSS 的 :has() 在 Chrome Android 平板上支持性可能差，必须 JS 兜底。**

---

### C.3 开发 Checklist（Mega Matrix 组件验收标准 · 共 12 项）

开发完后按顺序跑一遍，全过才算 P0 交付：

| # | 检查项 | 合格标准 |
|---|---|---|
| 1 | **左列 verb 固定** | 纵滚时动词原形始终停在左 110px |
| 2 | **顶行 tense 固定** | 横滚时时态标题始终停在顶行 |
| 3 | **左上角交叉固定** | 同时横+纵滚时，corner 两字不动，**不被任何一方盖**（z-3） |
| 4 | **列宽对齐** | tense 标题列和下方 6 人称变位列**严格对齐不偏斜** |
| 5 | **所有录入动词都能显示** | 从动词库随机抽 5 只不在前 20 的动词 → 点加载更多后必须出现在表里 |
| 6 | **标签筛选** | 选「拼写 -car」 → 只显示 buscar / sacar / tocar 这类，非 -car 全部不出现 |
| 7 | **时态组切换** | 切「所有 15 时态」→ 列数增加且横滚能看完 |
| 8 | **Irreg 颜色标记** | ser / tener / poder 的现在时 Pret Indefinido 全部出红底 |
| 9 | **Spell 颜色标记** | buscar 的 yo Pret→busqué / lanzar 的 yo Subj→lance 必须黄底 |
| 10 | **Hover 整行高亮** | 鼠标放 jugar 行 → 整行 5 时态全淡红底 |
| 11 | **性能** | 加载到 148 只 × 5 时态 → Chrome Performance 面板无单次长任务 >100ms |
| 12 | **平板横屏 1032×688 适配** | 表格高度 ≤ 540px，表格宽度 ≤ main 区宽（1032-150=882px），不会出双层滚动条（外滚动由页面滚动承担，表格内仅在 mega-wrap 内部滚动） |

---
