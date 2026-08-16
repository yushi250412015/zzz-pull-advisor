import { describe, it, expect } from 'vitest';
import { groupRecordsByType, summarizePool, summarizeAccount } from '../src/datasource/import-summary.js';
import { standardS } from '../src/data/characters.js';

// 与真实记录同构的样本（字段见 docs/data/gacha-records-2026-08-15.json）
const rec = (gachaType, time, name, rankType, itemType = '代理人') => ({
  gacha_type: String(gachaType),
  time,
  name,
  rank_type: rankType,
  item_type: itemType,
});

describe('groupRecordsByType', () => {
  it('按内部 gacha_type 1/2/3/5 分组', () => {
    const grouped = groupRecordsByType([
      rec(1, '2026-01-01 00:00:00', '丽娜', '4'),
      rec(2, '2026-01-02 00:00:00', '千夏', '4'),
      rec(3, '2026-01-03 00:00:00', '霓虹妄想', '4', '音擎'),
      rec(5, '2026-01-04 00:00:00', '阿饭', '4', '邦布'),
    ]);
    expect(grouped[1]).toHaveLength(1);
    expect(grouped[2][0].name).toBe('千夏');
    expect(grouped[3][0].name).toBe('霓虹妄想');
    expect(grouped[5][0].name).toBe('阿饭');
  });
});

describe('summarizePool', () => {
  it('限定池：乱序输入按时间排序；歪后 UP 重置 fails；pity 只计最后一只 S 之后', () => {
    const pool = summarizePool(
      [
        rec(2, '2026-07-29 20:12:29', '蕾米埃尔', '4'),
        rec(2, '2026-03-01 10:00:00', '千夏', '4'),
        rec(2, '2026-08-01 09:00:00', '安比', '3'),
        rec(2, '2026-06-17 12:00:00', '猫又', '4'),
      ],
      standardS,
    );
    expect(pool.pulls).toBe(4);
    expect(pool.sCount).toBe(3);
    expect(pool.losses).toBe(1);
    expect(pool.fails).toBe(0); // 最后一只 S 是蕾米埃尔（UP）→ 重置
    expect(pool.pity).toBe(1); // 蕾米埃尔之后 1 抽非 S
    expect(pool.lastS).toMatchObject({ name: '蕾米埃尔' });
    expect(pool.sList.map((s) => s.name)).toEqual(['千夏', '猫又', '蕾米埃尔']);
    expect(pool.sList[1].lost).toBe(true);
  });

  it('连续歪累计 fails 与 losses', () => {
    const pool = summarizePool(
      [
        rec(2, '2026-01-01 00:00:00', '丽娜', '4'),
        rec(2, '2026-02-01 00:00:00', '猫又', '4'),
        rec(2, '2026-03-01 00:00:00', '安比', '3'),
      ],
      standardS,
    );
    expect(pool.fails).toBe(2);
    expect(pool.losses).toBe(2);
    expect(pool.pity).toBe(1);
  });

  it('同秒批次按 id 打破平局（十连中间出 S 的 pity 只计其后抽数）', () => {
    const pool = summarizePool(
      [
        { gacha_type: '2', time: '2026-07-29 20:12:29', id: '0001', name: '「月相」-望', rank_type: '2', item_type: '音擎' },
        { gacha_type: '2', time: '2026-07-29 20:12:29', id: '0007', name: '蕾米埃尔', rank_type: '4', item_type: '代理人' },
        { gacha_type: '2', time: '2026-07-29 20:12:29', id: '0008', name: '「残响」-Ⅰ型', rank_type: '2', item_type: '音擎' },
        { gacha_type: '2', time: '2026-07-29 20:12:29', id: '0009', name: '「月相」-望', rank_type: '2', item_type: '音擎' },
        { gacha_type: '2', time: '2026-07-29 20:12:29', id: '0010', name: '「月相」-望', rank_type: '2', item_type: '音擎' },
      ],
      standardS,
    );
    expect(pool.sCount).toBe(1);
    expect(pool.pity).toBe(3); // 蕾米埃尔（十连第 7 抽）之后 3 抽
  });

  it('空池返回零值', () => {
    const pool = summarizePool([], standardS);
    expect(pool).toMatchObject({ pulls: 0, pity: 0, fails: 0, sCount: 0, losses: 0, lastS: null });
  });
});

describe('summarizeAccount', () => {
  const recordsByType = {
    1: [
      rec(1, '2026-06-15 17:44:29', '丽娜', '4'),
      rec(1, '2026-07-01 00:00:00', '安比', '3'),
      rec(1, '2026-07-02 00:00:00', '本', '3'),
    ],
    2: [
      rec(2, '2026-03-01 10:00:00', '千夏', '4'),
      rec(2, '2026-06-17 12:00:00', '猫又', '4'),
      rec(2, '2026-07-29 20:12:29', '蕾米埃尔', '4'),
      rec(2, '2026-08-01 09:00:00', '安比', '3'),
    ],
    3: [
      rec(3, '2026-08-06 22:48:28', '啜泣摇篮', '4', '音擎'),
      rec(3, '2026-08-07 00:00:00', '兔能环', '3', '音擎'),
    ],
    5: [rec(5, '2026-08-10 10:52:21', '艾瑞儿', '4', '邦布')],
  };
  const s = summarizeAccount(recordsByType, standardS);

  it('四池状态与 box（只收代理人，音擎/邦布不入 box）', () => {
    expect(s.pools.limited).toMatchObject({ pulls: 4, pity: 1, fails: 0, sCount: 3, losses: 1 });
    expect(s.pools.standard).toMatchObject({ pulls: 3, pity: 2, sCount: 1 });
    expect(s.pools.weapon).toMatchObject({ pulls: 2, pity: 1, sCount: 1 });
    expect(s.pools.bangboo).toMatchObject({ pulls: 1, pity: 0, sCount: 1 });
    expect(s.box).toEqual(['丽娜', '千夏', '安比', '本', '猫又', '蕾米埃尔'].sort());
  });

  it('欧非统计', () => {
    expect(s.luck).toMatchObject({ totalPulls: 10, agentPulls: 7, agentSCount: 4, limitedWinRate: 2 / 3 });
    expect(s.luck.avgPullsPerAgentS).toBeCloseTo(7 / 4);
  });
});
