// 贝叶斯技能评分：TrueSkill 1v1 更新（Weng-Lin / TrueSkill 的基础）
// 把「角色/队伍强度」建模为隐变量 (μ, σ)，用比赛结果更新后验

/** 标准正态 PDF */
export function normPdf(x) {
  return Math.exp(-0.5 * x * x) / Math.sqrt(2 * Math.PI);
}

/** erf 近似（Abramowitz-Stegun 7.1.26，误差 ~1.5e-7） */
function erf(x) {
  const sign = x < 0 ? -1 : 1;
  const a = Math.abs(x);
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;
  const t = 1 / (1 + p * a);
  const y = 1 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-a * a);
  return sign * y;
}

/** 标准正态 CDF */
export function normCdf(x) {
  return 0.5 * (1 + erf(x / Math.sqrt(2)));
}

/**
 * TrueSkill 1v1 更新：winner 击败 loser 后，更新双方 (μ, σ)。
 * @param {{mu: number, sigma: number}} winner
 * @param {{mu: number, sigma: number}} loser
 * @param {number} beta 单局表现方差（默认 TrueSkill 值 25/6）
 */
export function trueSkill1v1(winner, loser, beta = 25 / 6) {
  const c2 = 2 * beta * beta + winner.sigma * winner.sigma + loser.sigma * loser.sigma;
  const c = Math.sqrt(c2);
  const tOverC = (winner.mu - loser.mu) / c;

  const v = normPdf(tOverC) / normCdf(tOverC);
  const w = v * (v + tOverC);

  const winnerMu = winner.mu + ((winner.sigma * winner.sigma) / c) * v;
  const loserMu = loser.mu - ((loser.sigma * loser.sigma) / c) * v;
  const winnerSigma = winner.sigma * Math.sqrt(Math.max(0, 1 - ((winner.sigma * winner.sigma) / c2) * w));
  const loserSigma = loser.sigma * Math.sqrt(Math.max(0, 1 - ((loser.sigma * loser.sigma) / c2) * w));

  return {
    winner: { mu: winnerMu, sigma: winnerSigma },
    loser: { mu: loserMu, sigma: loserSigma },
  };
}
