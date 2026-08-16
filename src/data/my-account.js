// 示例账号（演示用占位数据，不含任何真实个人信息）
// 隐私说明：本项目公开仓库不存放真实账号数据。真实 box / 保底 / 欧非请用页面「账号同步」一键获取：
//   node scripts/import-records.mjs --serve → 页面输入 UID → 同步账号
// 同步结果只写入本机 docs/data/（已被 gitignore），不会上传到公开仓库。
export const myAccount = {
  uid: null, // 同步后由本地服务回填（仅用于校验账号一致，不进入公开仓库）
  analyzedAt: null,
  box: [], // 示例为空；同步后自动填充
  limited: { pulls: 0, pity: 0, fails: 0, sCount: 0, losses: 0, lastS: null, sList: [] },
  standard: { pulls: 0, pity: 0, sCount: 0, lastS: null, sList: [] },
  weapon: { pulls: 0, pity: 0, sCount: 0, sList: [], lastS: null },
  bangboo: { pulls: 0, pity: 0, sCount: 0, sList: [], lastS: null },
  luck: { totalPulls: 0, agentPulls: 0, agentSCount: 0, avgPullsPerAgentS: 0, limitedWinRate: 0 },
};
