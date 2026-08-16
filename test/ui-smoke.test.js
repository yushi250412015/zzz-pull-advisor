// @vitest-environment jsdom
// UI 冒烟测试：用 jsdom 加载 index.html + 副作用导入 main.js，断言各面板真实渲染
import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { JSDOM } from 'jsdom';

let dom;

beforeAll(async () => {
  const html = readFileSync(join(process.cwd(), 'index.html'), 'utf8');
  dom = new JSDOM(html, { url: 'http://localhost/', pretendToBeVisual: true });
  globalThis.window = dom.window;
  globalThis.document = dom.window.document;
  globalThis.navigator = dom.window.navigator;
  await import('../src/main.js'); // 副作用导入触发全部渲染
});

describe('UI 冒烟（jsdom 渲染）', () => {
  it('角色推荐结果渲染出卡片（含预算/风险/帕累托信息）', () => {
    const list = document.getElementById('results-list');
    expect(list).not.toBeNull();
    expect(list.querySelectorAll('.card').length).toBeGreaterThan(0);
    expect(list.innerHTML).toContain('空手风险');
  });

  it('音擎/邦布推荐面板渲染', () => {
    const el = document.getElementById('equipment-results');
    expect(el.innerHTML).toContain('音擎');
    expect(el.innerHTML).toContain('空羽复归之诗');
    expect(el.innerHTML).toContain('艾瑞儿');
  });

  it('四池状态含欧非统计', () => {
    expect(document.getElementById('pools-list').innerHTML).toContain('欧非');
  });

  it('官方情报面板渲染（3.1 快照 + 提及角色）', () => {
    const el = document.getElementById('official-facts');
    expect(el.innerHTML).toContain('3.1');
    expect(el.innerHTML).toContain('公告正文提及角色');
  });

  it('账号同步面板渲染（UID 输入 + 同步按钮 + 本地服务提示）', () => {
    expect(document.getElementById('sync-uid')).not.toBeNull();
    expect(document.getElementById('sync-btn')).not.toBeNull();
    expect(document.getElementById('sync-status').innerHTML).toContain('--serve');
  });

  it('强度可信度面板渲染后验', () => {
    expect(document.getElementById('meta-confidence').innerHTML).toContain('后验');
  });

  it('权重面板初始化（自动模式）', () => {
    expect(document.getElementById('w-auto').checked).toBe(true);
    expect(document.getElementById('w-combat').value).toBe('0.8');
    expect(document.getElementById('w-favor')).toBeNull(); // 喜好权重已移除：纯强度推荐
  });

  it('MCTS 场景由卡池自动生成（含运行按钮）', () => {
    const el = document.getElementById('mcts-scenarios');
    expect(el.innerHTML).toContain('运行规划');
    expect(el.innerHTML).toContain('希格莉德');
  });
});
