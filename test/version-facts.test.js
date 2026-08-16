import { describe, it, expect } from 'vitest';
import { extractReleaseFacts } from '../src/datasource/version-facts.js';

// 与官方公告 1262 同构的样本（一/二/三 节原文）
const real3_1 = '3.1版本「漫长的告别」更新公告' +
  '【更新开始时间】2026/07/29 06:00（UTC+8）【版本全新内容】一、全新代理人• S级代理人[蕾米埃尔(流明·异常)]可通过「复乐园」频段调频获得。•  S级代理人[希格莉德(冰·强攻)]可通过「直到天空沉落」频段调频获得。' +
  '二、全新音擎• S级音擎[空羽复归之诗(异常)]可通过「空羽复归之诗」频段调频获得。• S级音擎[骁骑礼赞(强攻)]可通过「骁骑礼赞」频段调频获得。' +
  '三、全新邦布•  S级邦布[艾瑞儿]可通过「卓越搭档」频段调频获得。' +
  '3.1版本结束时间为2026/09/09 06:00（UTC+8），该版本共持续42天';

describe('extractReleaseFacts', () => {
  const facts = extractReleaseFacts(real3_1);

  it('提取全部全新代理人（含元素/定位映射）', () => {
    expect(facts.agents).toHaveLength(2);
    expect(facts.agents[0]).toMatchObject({ name: '蕾米埃尔', element: 'lumiflux', role: 'anomaly', channel: '复乐园' });
    expect(facts.agents[1]).toMatchObject({ name: '希格莉德', element: 'ice', role: 'attack', channel: '直到天空沉落' });
  });

  it('提取全部全新音擎与邦布', () => {
    expect(facts.engines).toHaveLength(2);
    expect(facts.engines[0]).toMatchObject({ name: '空羽复归之诗', role: 'anomaly' });
    expect(facts.engines[1]).toMatchObject({ name: '骁骑礼赞', role: 'attack' });
    expect(facts.bangboos).toHaveLength(1);
    expect(facts.bangboos[0]).toMatchObject({ name: '艾瑞儿', channel: '卓越搭档' });
  });

  it('提取版本号/名称与时间窗', () => {
    expect(facts.version).toMatchObject({ number: '3.1', name: '漫长的告别' });
    expect(facts.window).toMatchObject({ start: '2026/07/29', end: '2026/09/09' });
  });

  it('无内容或结构变化时返回空（不臆造）', () => {
    const empty = extractReleaseFacts('普通公告，没有全新内容。');
    expect(empty.agents).toEqual([]);
    expect(empty.complete).toBe(false);
  });
});
