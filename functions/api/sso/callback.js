// ============================================================
//  jerryweblauncher-site / functions/api/sso/callback.js —— 登录回调
//  GET /api/sso/callback?code=&state=
//  用一次性 code 向小蓝页换身份（服务端到服务端），成功后在本域种 jl_uid。
// ============================================================

import {
  getCookie,
  SSO_COOKIE,
  createSession,
  sessionCookie,
  clearSsoStateCookie,
  IDP,
  CLIENT_ID,
} from '../../_lib/jlauth.js';
import { safeNext, redirect, exchangeCode } from '../../_lib/ssoCore.js';

export async function onRequestGet(context) {
  const url = new URL(context.request.url);
  const code = url.searchParams.get('code') || '';
  const state = url.searchParams.get('state') || '';
  const kv = context.env.LAUNCHER_KV;

  if (!code || !state) return redirect('/?sso=bad_params', [clearSsoStateCookie()]);
  if (!kv) return redirect('/?sso=not_ready', [clearSsoStateCookie()]);

  // state 双校验：HttpOnly Cookie + KV 记录，缺一不可（防 CSRF / 伪造回调）
  const cookieState = getCookie(context.request, SSO_COOKIE);
  if (!cookieState || cookieState !== state) {
    return redirect('/?sso=bad_state', [clearSsoStateCookie()]);
  }

  let rec = null;
  try {
    rec = await kv.get('jl:sso:state:' + state, { type: 'json' });
  } catch (e) {
    rec = null;
  }
  if (!rec) return redirect('/?sso=bad_state', [clearSsoStateCookie()]);
  try {
    await kv.delete('jl:sso:state:' + state);
  } catch (e) {
    /* 忽略 */
  }

  const secret = context.env.SSO_CLIENT_SECRET;
  if (!secret) return redirect('/?sso=not_configured', [clearSsoStateCookie()]);

  // 换码逻辑统一走共享核心（永远 body.client_secret，杜绝 Bearer header 事故）。
  const d = await exchangeCode({ idp: IDP, clientId: CLIENT_ID, code: code, secret: secret });
  if (!d) return redirect('/?sso=token_failed', [clearSsoStateCookie()]);

  const sid = await createSession(kv, {
    sub: d.sub,
    login: d.login,
    name: d.name,
    avatar_url: d.avatar_url,
    isAdmin: !!d.isAdmin,
    provider: d.provider || 'xiaolan',
  });

  const next = safeNext(rec.next);
  return redirect(next, [sessionCookie(sid, 60 * 60 * 24 * 30), clearSsoStateCookie()]);
}
