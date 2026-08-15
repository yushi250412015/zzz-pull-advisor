import { describe, it, expect } from 'vitest';
import { formation, synergyGain } from '../src/core/utility/formation.js';
import { boxUtility, marginalUtility } from '../src/core/utility/utility.js';
import { systems } from '../src/models/systems.js';

const emptyBox = { characters: {} };

describe('formation', () => {
  it('拥有全部贡献角色时为 1', () => {
    const box = { characters: { ellen: { owned: true }, lycaon: { owned: true } } };
    expect(formation(box, systems['ice-attack'])).toBeCloseTo(1);
  });

  it('缺失高权重角色比缺失低权重角色 F 更低（可学习灵魂角色的体现）', () => {
    const onlyLow = { characters: { lycaon: { owned: true } } }; // 缺 ellen（权重 0.6）
    const onlyHigh = { characters: { ellen: { owned: true } } }; // 缺 lycaon（权重 0.4）
    expect(formation(onlyLow, systems['ice-attack'])).toBeCloseTo(0.4);
    expect(formation(onlyHigh, systems['ice-attack'])).toBeCloseTo(0.6);
  });

  it('空 box 时为 0', () => {
    expect(formation(emptyBox, systems['ice-attack'])).toBe(0);
  });
});

describe('synergyGain', () => {
  it('低于启动门槛时为 0', () => {
    expect(synergyGain(0.4, systems['ice-attack'])).toBe(0);
  });
  it('门槛到完全成型之间线性增长', () => {
    expect(synergyGain(0.6, systems['ice-attack'])).toBeCloseTo(0.6); // 6*(0.6-0.5)
  });
  it('完全成型封顶为 delta_max', () => {
    expect(synergyGain(1, systems['ice-attack'])).toBe(12);
  });
});

describe('boxUtility / marginalUtility', () => {
  it('空 box 效用为 0', () => {
    expect(boxUtility(emptyBox, systems)).toBe(0);
  });

  it('补灵魂主C的边际效用高于补低权重角色', () => {
    // 单抽 ellen（F=0.6，过门槛）> 单抽 lycaon（F=0.4，未过门槛）
    expect(marginalUtility(emptyBox, 'ellen', systems)).toBeGreaterThan(
      marginalUtility(emptyBox, 'lycaon', systems),
    );
  });

  it('补齐最后一块拼图（跨过完全成型）边际效用最大', () => {
    const withEllen = { characters: { ellen: { owned: true } } };
    // 已有 ellen(F=0.6)，补 lycaon 后 F=1，协同从 0.6 跳到 12
    expect(marginalUtility(withEllen, 'lycaon', systems)).toBeCloseTo(11.4);
  });
});
