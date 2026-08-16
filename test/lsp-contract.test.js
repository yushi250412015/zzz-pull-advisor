// 里氏替换原则契约测试：同族对象（角色/音擎/邦布推荐、各池配置）同形可互换
import { describe, it, expect } from 'vitest';
import { DEFAULT_CONFIG } from '../src/core/gacha/config.js';
import { recommendCharacter } from '../src/core/recommend.js';
import { recommendEquipment } from '../src/core/recommend-equipment.js';
import { characters } from '../src/data/characters.js';
import { weapons, bangboos } from '../src/data/equipment.js';
import { systems } from '../src/models/systems.js';

const RECOMMENDATION_KEYS = ['pulls', 'risk', 'combatDelta', 'cost', 'utility'];
const box = { characters: {} };
const resources = { encryptedTapes: 20, polychrome: 0, pity: 0, fails: 0 };
const weights = { alphaCombat: 0.8, alphaFavor: 0, lambdaRisk: 30, alphaCost: 0.143 };

describe('LSP：推荐结果契约（角色/音擎/邦布可替换）', () => {
  it('recommendCharacter 输出满足 Recommendation 契约', () => {
    const r = recommendCharacter({
      box, resources, characterId: 'sigrid', systems,
      bannerCfg: DEFAULT_CONFIG.character, favor: 50, weights, characters, metaMap: {},
    });
    for (const k of RECOMMENDATION_KEYS) expect(r).toHaveProperty(k);
  });

  it('recommendEquipment 对 weapon 与 bangboo 输出同一契约（渲染层可无差别消费）', () => {
    const weaponR = recommendEquipment({
      kind: 'weapon', equipment: weapons['kongyu-fuguizhishi'], characters, box, resources, systems, favor: 50, weights,
    });
    const bangbooR = recommendEquipment({
      kind: 'bangboo', equipment: bangboos.airuier, characters, box, resources, systems, favor: 50, weights,
    });
    for (const k of RECOMMENDATION_KEYS) {
      expect(weaponR).toHaveProperty(k);
      expect(bangbooR).toHaveProperty(k);
    }
  });
});

describe('LSP：池配置契约（概率引擎按同一接口消费任意池）', () => {
  const POOL_CONFIG_KEYS = ['baseRate', 'softPityStart', 'softPityIncrement', 'hardPity', 'rateUpChance', 'guaranteeAfterFails'];
  it('character / weapon 配置同形', () => {
    for (const k of POOL_CONFIG_KEYS) {
      expect(DEFAULT_CONFIG.character).toHaveProperty(k);
      expect(DEFAULT_CONFIG.weapon).toHaveProperty(k);
    }
  });
});
