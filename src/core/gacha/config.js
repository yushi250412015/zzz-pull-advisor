// 抽卡机制配置（全部可调，便于对齐真实游戏机制）
// 说明：武器池软保底起抽数、定轨机制待核实；当前按 ZZZ 音擎池 75/25 无定轨配置。

export const DEFAULT_CONFIG = {
  character: {
    baseRate: 0.006,        // 基础 S 级概率
    softPityStart: 74,      // 软保底起始抽数（第 74 抽开始递增）
    softPityIncrement: 0.06,// 软保底每抽递增
    hardPity: 90,           // 硬保底
    rateUpChance: 0.5,      // 出 S 时为 UP 的概率（50/50）
    guaranteeAfterFails: 1, // 歪 1 次后大保底
  },
  weapon: {
    baseRate: 0.01,
    softPityStart: 66,      // 待核实：音擎软保底起抽数
    softPityIncrement: 0.06,
    hardPity: 80,
    rateUpChance: 0.75,     // 75/25
    guaranteeAfterFails: Infinity, // 无定轨；若确认有定轨改为 2
  },
};
