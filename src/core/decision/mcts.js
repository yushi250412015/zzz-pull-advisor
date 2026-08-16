// MCTS 时序规划器：求解「每个卡池该投入多少抽」的时序决策。
// 树节点只存「预算序列」（确定性决策）；抽卡随机性在 rollout 中每次重新模拟。

import { simulatePullsFull } from '../gacha/simulate.js';
import { boxUtility } from '../utility/utility.js';

/** 离散预算候选：0 / 25% / 50% / 75% / 100% */
export function budgetOptions(pulls) {
  const opts = new Set([0]);
  for (const f of [0.25, 0.5, 0.75, 1]) {
    const v = Math.floor(pulls * f);
    if (v > 0) opts.add(v);
  }
  return [...opts].sort((a, b) => a - b);
}

/** UCB1 选择评分 */
export function ucb1(avgValue, visits, parentVisits, explorationWeight = 1.4) {
  if (visits === 0) return Infinity;
  return avgValue + explorationWeight * Math.sqrt(Math.log(parentVisits) / visits);
}

function step(state, budget, rng) {
  const banner = state.banners[state.bannerIndex];
  const result = simulatePullsFull({ pity: state.pity, fails: state.fails }, budget, state.bannerCfg, rng);
  const box = { characters: { ...state.box.characters } };
  if (result.gotRateUp) box.characters[banner.characterId] = { owned: true, mindscape: 0 };
  return {
    ...state,
    bannerIndex: state.bannerIndex + 1,
    pulls: state.pulls - budget,
    pity: result.pity,
    fails: result.fails,
    box,
  };
}

function randomBudget(pulls, rng) {
  const opts = budgetOptions(pulls);
  return opts[Math.floor(rng() * opts.length)];
}

/** 从初始状态按 node.budgets + 随机补全，完整模拟一遍抽卡，返回最终效用（价值口径由 valueFn 决定） */
function rollout(node, initialState, rng, valueFn) {
  let state = { ...initialState, box: { characters: { ...initialState.box.characters } } };
  for (let i = 0; i < initialState.banners.length; i += 1) {
    const budget = i < node.budgets.length ? node.budgets[i] : randomBudget(state.pulls, rng);
    state = step(state, budget, rng);
  }
  return valueFn(state.box, state.systems);
}

function createNode(budgets, pulls, actions, parent = null) {
  return { budgets, pulls, visits: 0, totalValue: 0, children: [], untriedActions: [...actions], parent };
}

function select(node, explorationWeight) {
  while (node.untriedActions.length === 0 && node.children.length > 0) {
    node = node.children.reduce((best, c) =>
      ucb1(c.node.totalValue / c.node.visits, c.node.visits, node.visits, explorationWeight) >
      ucb1(best.node.totalValue / best.node.visits, best.node.visits, node.visits, explorationWeight)
        ? c
        : best,
      node.children[0]).node;
  }
  return node;
}

/**
 * 运行 MCTS，返回根节点每个「首个卡池预算」动作的访问次数与平均收益。
 * valueFn(box, systems) 为评估口径，默认 boxUtility（θ 体系收益）；
 * 可注入 boxCombatValue（θ + meta 先验）等自定义口径。
 */
export function mctsPlan(
  initialState,
  { iterations = 1000, explorationWeight = 1.4, rng = Math.random, valueFn = boxUtility } = {},
) {
  const root = createNode([], initialState.pulls, budgetOptions(initialState.pulls));

  for (let i = 0; i < iterations; i += 1) {
    let node = select(root, explorationWeight);

    if (node.budgets.length < initialState.banners.length && node.untriedActions.length > 0) {
      const budget = node.untriedActions.pop();
      const childBudgets = [...node.budgets, budget];
      const childPulls = node.pulls - budget;
      const child = createNode(
        childBudgets,
        childPulls,
        childBudgets.length < initialState.banners.length ? budgetOptions(childPulls) : [],
        node,
      );
      node.children.push({ action: budget, node: child });
      node = child;
    }

    const value = rollout(node, initialState, rng, valueFn);

    let cur = node;
    while (cur) {
      cur.visits += 1;
      cur.totalValue += value;
      cur = cur.parent;
    }
  }

  return root.children.map((c) => ({
    action: c.action,
    visits: c.node.visits,
    avgValue: c.node.visits > 0 ? c.node.totalValue / c.node.visits : 0,
  }));
}
