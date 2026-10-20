// ============================================================
//  jerryweblauncher-site / functions/api/sso/start.js —— 登录起点
//  GET /api/sso/start?next=/
//  生成一次性 state（KV 10 分钟 + HttpOnly Cookie 双保险），302 到小蓝页授权端点。
// ============================================================

import { randomId, ssoStateCookie, IDP, CLIENT_ID } from '../../_lib/jlauth.js';
import { buildAuthorizeUrl, safeNext } from '../../_lib/ssoCore.js';

export async function onRequestGet(context) {
  const url = new URL(context.request.url);
  const next = safeNext(url.searchParams.get('next'));
  const state = randomId(16);

  const redirectUri = url.origin + '/api/sso/callback';

  const kv = context.env.LAUNCHER_KV;
  if (kv) {
    try {
      await kv.put('jl:sso:state:' + state, JSON.stringify({ ts: Date.now(), next: next }), {
        expirationTtl: 600,
      });
    } catch (e) {
      /* KV 不可用时仍继续：callback 会因 state 缺失而拒绝 */
    }
  }

  const target = buildAuthorizeUrl({ idp: IDP, clientId: CLIENT_ID, redirectUri: redirectUri, state: state });

  return new Response(null, {
    status: 302,
    headers: {
      location: target,
      'set-cookie': ssoStateCookie(state, 600),
      'cache-control': 'no-store',
    },
  });
}
