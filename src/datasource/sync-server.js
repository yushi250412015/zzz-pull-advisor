// 本地同步 HTTP 服务（单一职责：只做 HTTP 管道——回环绑定 / Origin 白名单 / 限速 / JSON 收发）
// 具体抓取由调用方注入 performSync（依赖倒置）：服务不关心 authkey 与米哈游接口细节
import http from 'node:http';

export const ALLOWED_ORIGINS = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'https://yushi250412015.github.io',
];
export const SYNC_MIN_INTERVAL_MS = 3000;

export function isOriginAllowed(origin) {
  return !origin || ALLOWED_ORIGINS.includes(origin);
}

export function canSyncNow(lastSyncAt, now = Date.now(), minIntervalMs = SYNC_MIN_INTERVAL_MS) {
  return now - lastSyncAt >= minIntervalMs;
}

/**
 * @param {object} opts
 *   port: 默认 8787（只绑定 127.0.0.1，不对局域网/外网开放）
 *   performSync: async (expectUid) => { uid, uidMatched, recordCount, generatedAt, summary, snapshot }
 *   log: 默认 console.log
 * 返回 http.Server（已 listen）
 */
export function startSyncServer({ port = 8787, performSync, log = console.log }) {
  if (typeof performSync !== 'function') {
    throw new Error('startSyncServer 需要注入 performSync（依赖倒置：服务不直接依赖抓取实现）');
  }
  let lastSyncAt = 0;
  const server = http.createServer(async (req, res) => {
    const origin = req.headers.origin || null;
    const allowed = isOriginAllowed(origin);
    const send = (code, obj) => {
      const headers = {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'no-store',
        'X-Content-Type-Options': 'nosniff',
      };
      if (allowed && origin) headers['Access-Control-Allow-Origin'] = origin;
      res.writeHead(code, headers);
      res.end(JSON.stringify(obj));
    };
    if (req.method === 'OPTIONS') {
      res.writeHead(204, {
        'Access-Control-Allow-Origin': allowed && origin ? origin : 'null',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Max-Age': '86400',
      });
      res.end();
      return;
    }
    if (!allowed) {
      send(403, { ok: false, message: '来源不被允许（Origin 白名单）' });
      return;
    }
    try {
      if (req.url === '/health') {
        send(200, { ok: true });
        return;
      }
      if (req.url && req.url.startsWith('/sync')) {
        if (!canSyncNow(lastSyncAt)) {
          send(429, { ok: false, message: '请求过于频繁，请稍后再试' });
          return;
        }
        lastSyncAt = Date.now();
        const url = new URL(req.url, 'http://localhost');
        const payload = await performSync(url.searchParams.get('uid') || null);
        send(200, { ok: true, ...payload });
        return;
      }
      send(404, { ok: false, message: 'not found' });
    } catch (e) {
      send(500, { ok: false, message: e.message });
    }
  });
  server.listen(port, '127.0.0.1', () => {
    log('[serve] 本地同步服务已启动：http://127.0.0.1:' + port + '（只监听本机回环地址，不对局域网/外网开放）');
    log('[serve] /health 健康检查；/sync?uid=xxx 同步账号（Origin 白名单 + 3 秒限速；authkey 不出本机、落盘快照已脱敏）');
    log('[serve] 说明：官方无 UID 直查接口；同步依赖游戏日志中的 authkey（游戏内打开一次抽卡记录页后生效，约 1 天过期）');
  });
  return server;
}
