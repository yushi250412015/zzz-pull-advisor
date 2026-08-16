import { describe, it, expect } from 'vitest';
import { parseGachaHistory, computeLuckStats } from '../src/core/gacha/parse.js';

const standard = new Set(['莱卡恩', '格莉丝', '11号']);

// ZZZ rank_type 语义：'4' = S 级 / '3' = A 级 / '2' = B 级
describe('parseGachaHistory', () => {
  it('解析 box / 保底 / 歪计数（乱序输入按时间排序，S=rank_type 4）', () => {
    const records = [
      { name: '安比', rank_type: '3', time: 't4' },
      { name: '妮可', rank_type: '3', time: 't1' },
      { name: '莱卡恩', rank_type: '4', time: 't2' }, // 常驻 S → 歪
      { name: '安比', rank_type: '3', time: 't3' },
    ];
    const r = parseGachaHistory(records, standard);
    expect(r.pity).toBe(2); // 莱卡恩后两个非 S
    expect(r.fails).toBe(1); // 莱卡恩是常驻 → 歪了
    expect(r.box.size).toBe(3);
    expect([...r.box]).toEqual(expect.arrayContaining(['安比', '妮可', '莱卡恩']));
  });

  it('抽到 UP 后 fails 归零', () => {
    const records = [
      { name: '莱卡恩', rank_type: '4', time: 't1' }, // 歪
      { name: '星见雅', rank_type: '4', time: 't2' }, // UP（不在 standard）
    ];
    const r = parseGachaHistory(records, standard);
    expect(r.fails).toBe(0);
    expect(r.pity).toBe(0);
  });

  it('音擎不入 box，但仍计入保底', () => {
    const records = [
      { name: '蕾米埃尔', rank_type: '4', time: 't1' },
      { name: '「月相」-望', rank_type: '2', item_type: '音擎', time: 't2' },
      { name: '安东', rank_type: '3', time: 't3' },
    ];
    const r = parseGachaHistory(records, standard);
    expect(r.pity).toBe(2);
    expect(r.box.size).toBe(2);
    expect([...r.box]).toEqual(expect.arrayContaining(['蕾米埃尔', '安东']));
  });

  it('同秒批量返回时按 id 打破平局（实测：一次十连的记录 time 相同）', () => {
    const records = [
      { name: '「月相」-望', rank_type: '2', item_type: '音擎', time: 't', id: '001' },
      { name: '蕾米埃尔', rank_type: '4', time: 't', id: '007' }, // 十连第 7 抽
      { name: '「月相」-望', rank_type: '2', item_type: '音擎', time: 't', id: '008' },
      { name: '安东', rank_type: '3', time: 't', id: '009' },
    ];
    const r = parseGachaHistory(records, standard);
    expect(r.pity).toBe(2); // 蕾米埃尔之后 2 抽
    expect(r.box.size).toBe(2); // 音擎不入 box
  });

  it('sRankType 可配置（兼容 5=S 的通用数据源）', () => {
    const records = [
      { name: 'A', rank_type: '5', time: 't1' },
      { name: 'B', rank_type: '4', time: 't2' },
    ];
    const r = parseGachaHistory(records, new Set(), { sRankType: '5' });
    expect(r.pity).toBe(1);
  });
});

describe('computeLuckStats', () => {
  it('统计平均每 S 抽数与 UP 胜率', () => {
    const records = [
      { name: '莱卡恩', rank_type: '4', time: 't1' }, // 常驻（歪）
      { name: '安比', rank_type: '3', time: 't2' },
      { name: '安比', rank_type: '3', time: 't3' },
      { name: '妮可', rank_type: '3', time: 't4' },
      { name: '安比', rank_type: '3', time: 't5' },
    ];
    const s = computeLuckStats(records, standard);
    expect(s.sCount).toBe(1);
    expect(s.avgPity).toBe(5);
    expect(s.winRate).toBe(0);
  });
});
