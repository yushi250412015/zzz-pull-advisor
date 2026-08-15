import { describe, it, expect } from 'vitest';
import { extractGachaUrl } from '../src/datasource/gacha-log.js';

describe('extractGachaUrl', () => {
  it('从日志中提取 gacha URL', () => {
    const log =
      '[2026-08-15 10:00:00] INFO OnGetWebViewPageFinish url=https://public-operation-nap.hoyoverse.com/common/gacha_record/api/getGachaLog?authkey=abc123&game_biz=nap_cn';
    expect(extractGachaUrl(log)).toBe(
      'https://public-operation-nap.hoyoverse.com/common/gacha_record/api/getGachaLog?authkey=abc123&game_biz=nap_cn',
    );
  });

  it('无 gacha URL 返回 null', () => {
    expect(extractGachaUrl('some log text without url')).toBeNull();
  });
});
