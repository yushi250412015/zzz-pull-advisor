import { describe, it, expect } from 'vitest';
import { weaponValue, bangbooValue, recommendEquipment, EQUIPMENT_DEFAULTS } from '../src/core/recommend-equipment.js';
import { buildPlanningScenarios } from '../src/core/decision/planning.js';
import { systems } from '../src/models/systems.js';
import { characters } from '../src/data/characters.js';
import { weapons, bangboos } from '../src/data/equipment.js';
import { DEFAULT_CONFIG } from '../src/core/gacha/config.js';

const emptyBox = { characters: {} };

describe('weaponValue', () => {
  it('未拥有角色时专武价值为 0', () => {
    expect(weaponValue(emptyBox, systems, weapons['kongyu-fuguizhishi'])).toBe(0);
  });

  it('拥有角色时价值 = 边际效用 × weaponValueRatio（>0）', () => {
    const box = { characters: { remielle: { owned: true } } };
    const v = weaponValue(box, systems, weapons['kongyu-fuguizhishi']);
    expect(v).toBeGreaterThan(0);
    expect(v).toBeCloseTo(6 * ((0.85 / 1.1) - 0.5) * EQUIPMENT_DEFAULTS.weaponValueRatio, 5);
  });
});

describe('bangbooValue', () => {
  it('基础值 + 元素匹配 + 阵营同伴加成', () => {
    const box = { characters: { remielle: { owned: true }, 'nangong-yu': { owned: true } } };
    const v = bangbooValue(box, characters, bangboos.airuier);
    expect(v).toBe(EQUIPMENT_DEFAULTS.bangbooBaseValue + EQUIPMENT_DEFAULTS.bangbooElementBonus + EQUIPMENT_DEFAULTS.bangbooCompanionBonus);
  });

  it('无匹配时只有基础值', () => {
    expect(bangbooValue(emptyBox, characters, bangboos.airuier)).toBe(EQUIPMENT_DEFAULTS.bangbooBaseValue);
  });
});

describe('recommendEquipment', () => {
  const resources = { encryptedTapes: 30, polychrome: 4800 };

  it('音擎：risk 用武器池配置（75/25 无定轨），效用有限', () => {
    const box = { characters: { remielle: { owned: true } } };
    const r = recommendEquipment({
      kind: 'weapon',
      equipment: weapons['kongyu-fuguizhishi'],
      characters,
      box,
      resources,
      systems,
      favor: 50,
      poolState: { pity: 10, fails: 0 },
    });
    expect(r.pulls).toBe(60); // 30 + 4800/160
    expect(r.risk).toBeGreaterThan(0);
    expect(r.risk).toBeLessThan(1);
    expect(Number.isFinite(r.utility)).toBe(true);
    expect(r.owned).toBe(false);
  });

  it('邦布：官方概率暂缺 → risk 为 null', () => {
    const r = recommendEquipment({
      kind: 'bangboo',
      equipment: bangboos.airuier,
      characters,
      box: { characters: { remielle: { owned: true } } },
      resources,
      systems,
      favor: 50,
    });
    expect(r.risk).toBeNull();
    expect(r.combatDelta).toBeGreaterThan(0);
  });
});

describe('buildPlanningScenarios', () => {
  const bannersFixture = [
    { id: 'b-remielle', version: '3.1', characterId: 'remielle', type: 'character', phase: 'current' },
    { id: 'b-aria', version: '3.1', characterId: 'aria', type: 'character', phase: 'current' },
    { id: 'b-sigrid', version: '3.1', characterId: 'sigrid', type: 'character', phase: 'second-half' },
    { id: 'b-mixed', version: '3.1', type: 'character', phase: 'second-half', selectable: ['rinna', 'yuzuha', 'harumasa'] },
  ];
  const chars = { remielle: { name: '蕾米埃尔' }, aria: { name: '爱芮' }, sigrid: { name: '希格莉德' }, rinna: { name: '琉音' }, yuzuha: { name: '浮波柚叶' }, harumasa: { name: '浅羽悠真' } };

  it('生成「上半各目标 vs 下半非自选新角色」场景（3.1 → 2 个）', () => {
    const scenarios = buildPlanningScenarios(bannersFixture, chars);
    expect(scenarios).toHaveLength(2);
    expect(scenarios.map((s) => s.id)).toEqual(['remielle-vs-sigrid', 'aria-vs-sigrid']);
    expect(scenarios[0].label).toBe('现在抽「蕾米埃尔」 vs 攒给「希格莉德」');
    expect(scenarios[0].bannerSequence).toEqual([{ characterId: 'remielle' }, { characterId: 'sigrid' }]);
  });

  it('无下半角色时返回空（无场景可规划）', () => {
    const onlyNow = [bannersFixture[0]];
    expect(buildPlanningScenarios(onlyNow, chars)).toEqual([]);
  });
});
