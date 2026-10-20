// ============================================================
//  jerryweblauncher-site / functions/api/me.js —— 当前登录态
//  GET /api/me -> { ok:true, user } （未登录 user = null）
// ============================================================

import { getSession, publicProfile, json } from '../_lib/jlauth.js';

export async function onRequestGet(context) {
  let sess = null;
  try {
    sess = await getSession(context);
  } catch (e) {
    sess = null;
  }
  return json({ ok: true, user: sess ? publicProfile(sess) : null });
}
