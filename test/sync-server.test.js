// 本地同步服务助手测试（Origin 白名单 / 限速 / 依赖注入约束）
import { describe, it, expect } from 'vitest';
import { isOriginAllowed, canSyncNow, SYNC_MIN_INTERVAL_MS, startSyncServer } from '../src/datasource/sync-server.js';

describe('本地同步服务助手', () => {
  it('无 Origin（本机工具）放行；恶意来源拒绝；本工具页面放行', () => {
    expect(isOriginAllowed(null)).toBe(true);
    expect(isOriginAllowed('https://evil.example')).toBe(false);
    expect(isOriginAllowed('https://yushi250412015.github.io')).toBe(true);
    expect(isOriginAllowed('http://localhost:5173')).toBe(true);
    expect(isOriginAllowed('http://127.0.0.1:5173')).toBe(true);
  });

  it('限速窗口：间隔不足拒绝，达到间隔放行', () => {
    expect(canSyncNow(0, 1000)).toBe(false);
    expect(canSyncNow(0, SYNC_MIN_INTERVAL_MS)).toBe(true);
    expect(canSyncNow(0, 4000, 5000)).toBe(false); // 自定义窗口 5s
  });

  it('startSyncServer 强制注入 performSync（依赖倒置：缺实现即报错）', () => {
    expect(() => startSyncServer({})).toThrow(/performSync/);
  });
});
