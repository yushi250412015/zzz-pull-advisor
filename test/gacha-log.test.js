import { describe, it, expect } from 'vitest';
import {
  extractGachaPageUrl,
  extractGachaType,
  extractAuthkey,
  buildApiUrl,
} from '../src/datasource/gacha-log.js';

// 与真实 NAP_20260815_221850.log 相同的行格式
const realLine =
  '[2026-08-15 22:22:38.735 7498][OTHER][I]: web: 4 url: https://webstatic.mihoyo.com/nap/event/e20230424gacha-v2/index.html?authkey_ver=1&sign_type=2&auth_appid=webview_gacha&win_mode=fullscreen&gacha_id=abc&gacha_type=2001&authkey=WQR4%2Babc%2Fdef%3D%3D&lang=zh-cn&game_biz=nap_cn';

describe('extractGachaPageUrl', () => {
  it('从真实 NAP 日志行提取抽卡 H5 页面 URL', () => {
    const u = extractGachaPageUrl(realLine);
    expect(u).toContain('webstatic.mihoyo.com/nap/event/e20230424gacha-v2/index.html');
    expect(u).toContain('authkey=');
  });

  it('无 gacha URL 返回 null', () => {
    expect(extractGachaPageUrl('some log text without url')).toBeNull();
  });
});

describe('extractGachaType', () => {
  it('提取请求参数 gacha_type（1001/2001/3001/5001）', () => {
    expect(extractGachaType(realLine)).toBe('2001');
  });
});

describe('extractAuthkey', () => {
  it('保留原始百分号编码形态（不解码）', () => {
    expect(extractAuthkey(realLine)).toBe('WQR4%2Babc%2Fdef%3D%3D');
  });
});

describe('buildApiUrl', () => {
  it('authkey 原样拼接（不二次编码），参数齐全', () => {
    const u = buildApiUrl(realLine, { page: 2, size: 20, endId: 999 });
    expect(u).toContain('public-operation-nap.mihoyo.com/common/gacha_record/api/getGachaLog');
    expect(u).toContain('authkey=WQR4%2Babc%2Fdef%3D%3D'); // 原样，不是 %252B
    expect(u).toContain('gacha_type=2001&page=2&size=20&end_id=999');
    expect(u).toContain('game_biz=nap_cn');
  });

  it('无 authkey 时抛错', () => {
    expect(() => buildApiUrl('https://x.com/no-authkey')).toThrow();
  });
});
