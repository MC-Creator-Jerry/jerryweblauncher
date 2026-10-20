/* ============================================================
   网站启动台 / auth.js
   小蓝页 SSO 前端：登录按钮 / 头像菜单（挂 #hdrRight）+ SSO 错误提示
   后端：/api/me · /api/sso/start · /api/logout（本域薄会话，见 functions/）
   ============================================================ */
(function () {
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function api(url, opts) {
    return fetch(url, opts || {}).then(function (r) { return r.json(); });
  }

  var PROFILE_BASE = 'https://mc-creator-jerry-webpage.pages.dev/personal_profile/?user=';

  var JL = {
    _cached: undefined,

    load: async function (force) {
      if (!force && this._cached !== undefined) return this._cached;
      try {
        var d = await api('/api/me');
        this._cached = (d && d.ok && d.user) || null;
      } catch (e) {
        this._cached = null;
      }
      return this._cached;
    },

    initial: function (u) {
      var s = String((u && (u.name || u.login)) || 'J').trim();
      return s ? s.slice(0, 1).toUpperCase() : 'J';
    },

    loginUrl: function () {
      var next = location.pathname + location.search;
      return '/api/sso/start?next=' + encodeURIComponent(next);
    },

    logout: async function () {
      try { await api('/api/logout', { method: 'POST' }); } catch (e) {}
      this._cached = null;
      location.reload();
    },

    mount: async function (slotId) {
      var slot = document.getElementById(slotId || 'hdrRight');
      if (!slot) return;
      var u = await this.load(true);
      slot.innerHTML = '';

      var wrap = document.createElement('div');
      wrap.className = 'user-wrap';

      if (!u) {
        wrap.innerHTML =
          '<a class="login-btn" href="' + esc(this.loginUrl()) + '">' +
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><path d="M10 17l5-5-5-5"/><path d="M15 12H3"/></svg>' +
          '<span>登录</span></a>';
        slot.appendChild(wrap);
        return;
      }

      var av = u.avatar_url
        ? '<img src="' + esc(u.avatar_url) + '" alt="" onerror="this.replaceWith(Object.assign(document.createElement(\'span\'),{className:\'fb\',textContent:\'' + esc(this.initial(u)) + '\'}))">'
        : '<span class="fb">' + esc(this.initial(u)) + '</span>';

      wrap.innerHTML =
        '<button class="avatar-btn" id="jlAvatarBtn" aria-haspopup="true" aria-expanded="false">' +
        av +
        '<span class="nm">' + esc(u.name || u.login || '用户') + '</span>' +
        '</button>' +
        '<div class="jl-menu hide" id="jlUserMenu" role="menu">' +
        '<div class="mhd"><div class="n">' + esc(u.name || u.login || '用户') +
        (u.isAdmin ? '<span class="badge">站长</span>' : '') +
        '</div><div class="l">' + esc(u.login ? '@' + u.login : '小蓝页账户') + '</div></div>' +
        '<div class="sep"></div>' +
        '<a role="menuitem" href="' + esc(PROFILE_BASE + (u.login || '')) + '" target="_blank" rel="noopener">个人主页 ↗</a>' +
        '<a role="menuitem" href="https://mc-creator-jerry-webpage.pages.dev/" target="_blank" rel="noopener">小蓝页首页 ↗</a>' +
        '<div class="sep"></div>' +
        '<button role="menuitem" id="jlLogoutBtn">退出登录</button>' +
        '</div>';

      slot.appendChild(wrap);

      var btn = wrap.querySelector('#jlAvatarBtn');
      var menu = wrap.querySelector('#jlUserMenu');
      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        var hidden = menu.classList.toggle('hide');
        btn.setAttribute('aria-expanded', hidden ? 'false' : 'true');
      });
      document.addEventListener('click', function () {
        menu.classList.add('hide');
        btn.setAttribute('aria-expanded', 'false');
      });
      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
          menu.classList.add('hide');
          btn.setAttribute('aria-expanded', 'false');
        }
      });
      wrap.querySelector('#jlLogoutBtn').addEventListener('click', function (e) {
        e.stopPropagation();
        JL.logout();
      });
    },
  };

  window.JL = JL;

  // SSO 回调带回的错误码 → 顶部提示条（6 秒自动消失）
  function showSsoNotice() {
    var code = new URLSearchParams(location.search).get('sso');
    if (!code) return;
    var map = {
      bad_params: '登录参数不完整，请重试。',
      bad_state: '登录校验失败（可能是链接过期），请重试。',
      not_ready: '站点尚未就绪，请稍后重试。',
      not_configured: '站点未配置登录密钥，请联系站长。',
      token_failed: '身份校验未通过，请重新登录。',
    };
    var msg = map[code];
    if (!msg) return;

    var bar = document.createElement('div');
    bar.className = 'sso-notice';
    bar.setAttribute('role', 'alert');
    bar.textContent = msg;
    var main = document.querySelector('main.content');
    if (main && main.parentNode) main.parentNode.insertBefore(bar, main);
    else document.body.appendChild(bar);
    setTimeout(function () { bar.remove(); }, 6000);
  }

  document.addEventListener('DOMContentLoaded', function () {
    JL.mount('hdrRight');
    showSsoNotice();
  });
})();
