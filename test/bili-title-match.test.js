import { describe, it, expect } from 'vitest';
import { matchCharactersInTitle } from '../src/datasource/bili-title-match.js';
import { characters } from '../src/data/characters.js';

describe('matchCharactersInTitle', () => {
  it('按中文名匹配', () => {
    expect(matchCharactersInTitle('【绝区零】希格莉德综合测评：超级力量！', characters)).toEqual(['sigrid']);
  });

  it('按英文名连写变体匹配（蕾米埃尔丹 → Remielle Dan 去空格）', () => {
    const ids = matchCharactersInTitle('【绝区零】蕾米埃尔丹综合测评：圣光级虚狩！', characters);
    expect(ids).toContain('remielle');
  });

  it('无关标题返回空', () => {
    expect(matchCharactersInTitle('【原神】奥黛塔测评', characters)).toEqual([]);
  });
});
