# ZZZ 抽卡参谋（Pull Advisor）

基于你的角色 box 与资源，为下版本卡池提供「抽 / 观望 / 跳过」的推荐决策。

> ⚠️ 非官方同人工具，仅使用角色名称与数值，不包含游戏素材；推荐结果仅供参考。

## 当前状态

- ✅ 五层算法全部实现（**160 项单元测试**）：概率（精确 DP + 蒙特卡洛 + CVaR 下行风险）/ 效用（可学习贡献向量 θ + meta 先验 + Kalman 后验）/ 决策（权重推导 + 帕累托策略集 + MCTS）/ 时序（Kalman）/ 接线（推荐编排 + 多源观测闭环）
- ✅ UI 面板：资源 / box / **账号同步（UID 一键同步 box·保底·欧非）** / 四池状态（含欧非）/ 角色推荐（帕累托最优预算 + CVaR90，**纯强度**）/ **音擎邦布推荐** / 官方情报 / **强度可信度（Kalman 后验）** / 权重面板 / 多场景 MCTS
- ✅ 真实账号数据（四池 1168 条）已解析并实测校准（**uid 已脱敏**，公开仓库仅保留聚合统计）；**31 位角色**（18 S + 13 A）经官方公告/BWIKI/权威博主多源审计
- ✅ 数据工具链：`update-banners`（官方公告→数据更新建议）/ `import-records`（抽卡记录导入）/ `fetch-bv`+`find-bili-videos`+`bili-batch`（B站观测源发现与消化）
- 🔄 3.2 版本上线后按 SOP 更新数据（docs/data-sources.md §10）

## 核心思路

```
输入：box + 资源 + 卡池（纯强度：喜好不参与评分）
  → P1 概率层：空手风险 R = 1 − P(拿UP)（精确 Markov DP + 蒙特卡洛）
  → P2 效用层：边际效用 ΔU（成型度 F(S) + 协同增益 + TrueSkill 可学习权重）
  → P3 决策层：总效用 = α·ΔU − λ·R − 机会成本 → 帕累托策略集
  → P4 时序：Kalman 滤波更新隐效用（置信区间）
输出：抽 / 观望 / 跳过 + 风险 + 理由
```

## 技术栈

- Vite + 原生 JS + Vitest
- 概率：Markov 链精确 DP + 蒙特卡洛
- 学习：TrueSkill 贝叶斯技能评分、Kalman 滤波
- 决策：帕累托前沿

## 快速开始

```bash
npm install
npm run dev      # 本地开发
npm test         # 单元测试
npm run build    # 构建

# 账号同步（UID 一键同步 box / 保底 / 欧非）：
node scripts/import-records.mjs --serve   # 本地服务 localhost:8787（游戏内先打开一次抽卡记录页）
# 然后在页面「账号同步」面板输入 UID → 同步账号
```

> 官方没有「输入 UID 直查」接口：抽卡记录必须带游戏内生成的 authkey（约 1 天过期），由本地服务代抓；UID 仅用于校验账号一致。

## 隐私与安全

- **公开仓库不含真实个人信息**：`src/data/my-account.js` 为示例占位（无 UID、空 box）；真实数据由「账号同步」写入本机 `docs/data/`（已 gitignore）。
- **无跟踪**：页面无埋点、无广告、不加载第三方资源；外部链接（BWIKI 等）带 `no-referrer`，不泄露访问来源。
- **UID 只用于本地校验**：官方没有「输入 UID 直查」接口；同步由本地服务（只监听 127.0.0.1、Origin 白名单、3 秒限速）代抓，authkey 落盘快照一律脱敏，约 1 天过期。
- **你的 cookie 不进仓库**：B 站观测 cookie 仅存于本机 `%TEMP%` 目录。
- 建议：GitHub 仓库可设为 private，历史提交中的旧快照也会随之不再公开。

## 项目结构

- 架构与设计原则（核心要点 + SOLID 逐条落点 + 模块地图）：[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)
- 计划与演进：[PLAN.md](PLAN.md)、[CHANGELOG.md](CHANGELOG.md)、[docs/HANDOVER.md](docs/HANDOVER.md)
