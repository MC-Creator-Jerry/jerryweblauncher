// ============================================================
//  共享 SSO 客户端核心（单一真相源）
//  片屿 / 茶馆 / 书栈 / 音乐电台 四站的 SSO 起点(start)与回调(callback)
//  都复用本文件，避免各抄一份导致写法漂移、回归时漏改。
//
//  历史教训（2026-10-03）：某站 callback 曾用 `Authorization: Bearer <secret>`
//  传密钥，而 Pages secret 在写入时可能混入不可见字符（如换行），放进 HTTP
//  header 会抛 "Invalid header value" 让整次换码失败、登录 100% 挂。
//  故 exchangeCode 一律走 body.client_secret，且这是唯一实现，
//  杜绝日后任何一站再把密钥改回 header 写法。
// ============================================================

// 小蓝页（IdP）默认地址
export const IDP_DEFAULT = 'https://mc-creator-jerry-webpage.pages.dev';

// 只允许本站绝对路径，杜绝开放重定向。
// fallback 用于各站默认落点不同（书栈后台用 /admin/，其余用 /）。
export function safeNext(v, fallback = '/') {
  const s = String(v || '');
  if (!s || s[0] !== '/' || s[1] === '/' || s.indexOf('\\') >= 0) return fallback;
  return s;
}

// 302 跳转并下发一组 set-cookie（每个元素是一整条 Set-Cookie 头字符串）
export function redirect(location, cookies) {
  const h = new Headers();
  (cookies || []).forEach((c) => h.append('set-cookie', c));
  h.set('location', location);
  h.set('cache-control', 'no-store');
  return new Response(null, { status: 302, headers: h });
}

// 拼装小蓝页授权端点 URL
export function buildAuthorizeUrl({ idp, clientId, redirectUri, state }) {
  return (
    idp +
    '/api/sso/authorize' +
    '?client_id=' + encodeURIComponent(clientId) +
    '&redirect_uri=' + encodeURIComponent(redirectUri) +
    '&state=' + encodeURIComponent(state)
  );
}

// 用一次性 code 向 IdP 换身份。
// 永远用 body 传 client_secret（见文件头注释），绝不走 Authorization header。
// 成功返回 IdP 的 data（含 sub/login/name/avatar_url/isAdmin/provider 等），
// 失败（网络异常 / 非 200 / body 解析失败）统一返回 null，
// 由调用方按 token_failed 处理。
export async function exchangeCode({ idp, clientId, code, secret }) {
  if (!secret) return null;
  try {
    const r = await fetch(idp + '/api/sso/token', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        code: code,
        client_id: clientId,
        client_secret: secret,
      }),
    });
    const j = await r.json().catch(() => null);
    if (r.ok && j && j.ok) return j;
    return null;
  } catch (e) {
    return null;
  }
}
