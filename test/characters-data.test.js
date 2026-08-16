import { describe, it, expect } from 'vitest';
import { characters } from '../src/data/characters.js';

describe('meta 全量校准不变量（2026-08 完成）', () => {
  it('31 位角色 meta 全部非 null 且值域 [0,100]', () => {
    const list = Object.values(characters);
    expect(list.length).toBe(31);
    for (const c of list) {
      expect(c.meta, c.name).not.toBeNull();
      expect(c.meta, c.name).toBeGreaterThanOrEqual(0);
      expect(c.meta, c.name).toBeLessThanOrEqual(100);
    }
  });

  it('无来源的占位先验已全部标注来源/校准口径（note 含依据）', () => {
    for (const c of Object.values(characters)) {
      expect(c.note && c.note.length, c.name).toBeGreaterThan(0);
    }
  });
});
