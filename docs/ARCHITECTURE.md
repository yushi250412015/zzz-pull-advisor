# 架构说明与设计原则（SOLID 落点）

## 0. 本项目核心要点（先定核心，再谈架构）

**一句话：这是一个抽卡决策工具**——同步卡池与你的 box，**纯按强度**给出「抽 / 观望 / 跳过」+ 风险 + 理由。
其余一切都是支撑：算法是手段，数据同步是入口，UI 是展示。

### 核心域（不可动摇）
1. **抽卡决策流水线**：输入（box + 资源 + 卡池）→ 概率层（空手风险 / CVaR 下行）→ 效用层（θ 体系 + meta 后验）→ 决策层（总效用 + 帕累托 + MCTS）→ 输出（结论 + 风险 + 理由）
2. **数据入口**：
   - 卡池：官方公告 → `banners.js`（数据驱动，新版本只加数据不改代码）
   - 账号：**UID 同步**（本地服务代抓四池记录 → box / 保底 / 欧非；官方无「输入 UID 直查」接口，如实说明）
   - 强度：多源观测 + Kalman 后验（Prydwen / 权威博主 / 卡特亚，逐条带出处）
3. **推荐口径：纯强度**（喜好不参与，α_f 恒为 0）
4. **质量底线**：不臆造（无源标 null / 待核实）；核心纯函数 + 单测；测试与构建全绿才交付
5. **安全隐私**：数据不出本机；公开仓库不含真实个人信息（示例占位 + gitignore + 脱敏）

### 明确非目标（避免蔓延）
- 角色机制速查（已移除：游戏内可查，非差异化）
- 喜好 / XP 评分（已移除：纯强度）
- 排行 / 社区 / 统计站功能

## 1. 分层与依赖方向（单向、无环）

```
src/main.js               组装根 Composition Root（只装配，不含逻辑）
  ↓ 依赖
src/ui/                   UI 层：state（状态+访问器）/ render/*（单面板渲染）/ controller（事件编排）/ dom（常量）
  ↓ 依赖
src/core/advisor.js       核心门面：UI 唯一的稳定契约（依赖倒置）
  ↓ 依赖
src/core/                 gacha（概率）/ bayes（观测融合）/ decision（决策）/ utility（效用）/ recommend*（编排）
  ↓ 依赖
src/datasource/           数据接入：gacha-log / import-summary / announcement / sync-client / sync-server / bili*
src/data/                 纯数据：characters / banners / equipment / observations / official-facts / my-account（示例）
src/models/systems.js     体系先验
scripts/import-records.mjs CLI 编排：--serve 时把抓取实现注入 sync-server
```

铁律：**core 不依赖 DOM / fetch / 文件系统**（浏览器与 Node 均可测）；datasource 不依赖 UI；render 层不互相调用。

## 2. SOLID 逐条落点

| 原则 | 落点 |
|---|---|
| **单一职责 SRP** | main.js 由 547 行降到 ~50 行纯组装；每个 render 函数只画一个面板；state 只管状态变更；controller 只管事件编排；sync-server 只管 HTTP 管道（抓取注入）；import-records 只做 CLI 编排 |
| **开闭 OCP** | 新角色/卡池/观测源 = 只加数据不改代码（characters.js / banners.js / observations.js）；UI 只依赖 advisor 固定契约，换算法实现（如替换 MCTS）不动 UI；引擎参数（权重/阈值/贡献向量）全部可配置 |
| **依赖倒置 DIP** | UI 依赖 advisor 契约而非具体算法模块；sync-client 注入 fetchImpl；sync-server 注入 performSync；mctsPlan 注入 valueFn；recommendCharacter 注入 characters/metaMap（均有测试证明可注入） |
| **接口隔离 ISP** | advisor 提供细粒度方法（recommendCharacter / recommendEquipment / plan / scenarios / confidenceRows / verdictFor），各面板只取所需；池配置按 character/weapon 分池隔离 |
| **里氏替换 LSP** | Recommendation 契约：角色/音擎/邦布推荐返回同形 `{pulls, risk, combatDelta, cost, utility}`，渲染层无差别消费（`test/lsp-contract.test.js`）；池配置契约同形，概率引擎可互换消费；观测条目同形 `{characterId, value, weight, source, date, note}` |
| **最小知识 LoD** | state 提供访问器 `getPool / getAccountLuck / getBudgetPulls`，UI 不深链 `state.account.*`；renderer 只接收自己需要的参数对象；controller 通过 hooks 回调（onRecompute / onSyncSuccess），不直接调用渲染细节 |
| **高内聚低耦合** | 依赖单向无环（见 §1）；core 无副作用可在 Node 直测；datasource 的 fetch/fs 全部可注入；UI 面板之间零调用 |

## 3. 模块地图（当前状态）

- `src/core/advisor.js`：核心门面，装配 data+models+core 并暴露稳定契约（2026-08 重构新增）
- `src/ui/state.js`：状态集中管理 + 最小访问器（2026-08 重构新增）
- `src/ui/render/{account,results,info}.js`：单面板渲染器（2026-08 重构新增）
- `src/ui/controller.js`：事件接线 + 同步编排 + MCTS 运行（2026-08 重构新增）
- `src/datasource/sync-client.js`：页面侧同步客户端（fetch 注入）（2026-08 重构新增）
- `src/datasource/sync-server.js`：本地同步 HTTP 管道（Origin 白名单/限速，抓取注入）（2026-08 重构新增）
- 既有 core/datasource/data 模块职责不变，仅收窄对外契约

## 4. 架构级测试

- `test/advisor.test.js`：假数据驱动全门面契约（DIP 证明）
- `test/state.test.js`：状态访问器与变更单一入口
- `test/sync-client.test.js`：映射纯函数 + fetch 注入失败分型
- `test/sync-server.test.js`：Origin 白名单 / 限速 / 强制注入
- `test/lsp-contract.test.js`：推荐与池配置契约同形（LSP 证明）
- `test/ui-smoke.test.js`：jsdom 加载真实页面，8 面板渲染断言（重构零回归证明）
