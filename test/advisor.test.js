// 核心门面契约测试（依赖倒置：注入最小化假数据即可驱动全流水线，不依赖真实数据模块）
import { describe, it, expect } from 'vitest';
import { createAdvisor } from '../src/core/advisor.js';

const characters = {
  a: { id: 'a', name: '角色A', rarity: 'S', element: 'ice', role: 'attack', meta: 80, standard: true },
  b: { id: 'b', name: '角色B', rarity: 'S', element: 'wind', role: 'anomaly', meta: 70 },
};
const banners = [{ id: 'b1', type: 'character', characterId: 'a', selectable: ['a', 'b'], firstGoldGuaranteed: true }];
const systems = [{ id: 'ice-attack', name: '冰攻体系', F_min: 0.2, delta_max: 3, k: 0.5, contributions: { a: 1 } }];
const observations = [];
const equipment = { weapons: {}, bangboos: {} };

const makeAdvisor = () => createAdvisor({ characters, banners, systems, observations, equipment });

describe('advisor 门面（依赖倒置 + 接口隔离）', () => {
  it('注入假数据即可驱动推荐契约', () => {
    const advisor = makeAdvisor();
    const r = advisor.recommendCharacter({
      box: { characters: {} },
      resources: { encryptedTapes: 10, polychrome: 0, pity: 0, fails: 0 },
      characterId: 'a',
      bannerCfg: advisor.characterCfg(banners[0]),
      favor: 50,
      weights: { alphaCombat: 0.8, alphaFavor: 0, lambdaRisk: 30, alphaCost: 0.143 },
    });
    expect(Number.isFinite(r.utility)).toBe(true);
    expect(typeof r.risk).toBe('number');
  });

  it('首金必不歪卡池 rateUpChance=1；普通卡池维持配置默认', () => {
    const advisor = makeAdvisor();
    expect(advisor.characterCfg(banners[0]).rateUpChance).toBe(1);
    expect(advisor.characterCfg({}).rateUpChance).toBe(0.5);
  });

  it('scenarios 由卡池数据推导；metaMap 覆盖全部有 meta 的角色', () => {
    const advisor = makeAdvisor();
    expect(Array.isArray(advisor.scenarios())).toBe(true);
    expect(advisor.metaMap().a).toBeGreaterThan(0);
  });

  it('plan 的 valueFn 可注入（开闭原则：评估口径可替换，不动门面）', () => {
    const advisor = makeAdvisor();
    const result = advisor.plan(
      { bannerIndex: 0, pulls: 10, banners: ['a'], bannerCfg: advisor.baseCharacterCfg(), pity: 0, fails: 0, box: { characters: {} } },
      { iterations: 50, valueFn: () => 1 },
    );
    expect(result.length).toBeGreaterThan(0);
    expect(result.every((x) => typeof x.avgValue === 'number')).toBe(true);
  });

  it('confidenceRows 返回渲染就绪行（计算归核心、渲染归 UI）', () => {
    const advisor = makeAdvisor();
    const rows = advisor.confidenceRows();
    expect(rows.length).toBe(2);
    expect(rows[0]).toHaveProperty('ciMin');
    expect(rows[0]).toHaveProperty('arrow');
  });
});
