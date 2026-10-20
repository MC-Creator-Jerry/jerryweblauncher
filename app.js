/* Jerry 网站启动台 —— app.js
 * 磁贴渲染 / 搜索 / 分类筛选 / 快捷键 / 时钟 / 主题
 * 新增网站：只改 SITES 数组即可（name/desc/url/icon/cat/keys）
 */
(function () {
  'use strict';

  var SITES = [
    {
      name: '小蓝页',
      desc: 'Jerry 的数字花园主页：项目、博客、工具与账号中心。',
      url: 'https://mc-creator-jerry-webpage.pages.dev/',
      domain: 'mc-creator-jerry-webpage.pages.dev',
      icon: '🏠',
      cat: '枢纽',
      keys: 'xiaolan xlp 主页 home 首页 小蓝 蓝色 jerry 博客 blog 工具'
    },
    {
      name: '茶馆',
      desc: '社区茶馆：游戏、书籍、心理专区分区畅聊，投稿与关注。',
      url: 'https://jerryteahouse.pages.dev/',
      domain: 'jerryteahouse.pages.dev',
      icon: '🍵',
      cat: '社区',
      keys: 'teahouse chaguan 社区 论坛 聊天 讨论 茶馆 游戏 心理'
    },
    {
      name: '片屿',
      desc: '视频社区：网页直连与片屿播放器双模式，倍速与定点讨论。',
      url: 'https://jerrypianyu.pages.dev/',
      domain: 'jerrypianyu.pages.dev',
      icon: '🎬',
      cat: '影音',
      keys: 'pianyu 片屿 视频 video 播放 影视 弹幕 b站 youtube'
    },
    {
      name: '书栈',
      desc: '藏书阁：公版好书与阅读书架，跨站收藏同步。',
      url: 'https://jerrybookstation.pages.dev/',
      domain: 'jerrybookstation.pages.dev',
      icon: '📚',
      cat: '阅读',
      keys: 'bookstation shuzhan 书栈 书 图书 阅读 藏书 library books'
    },
    {
      name: '音乐电台',
      desc: '自托管音乐库与播放器：循环模式、收藏与创作者中心。',
      url: 'https://jerrymusic.pages.dev/',
      domain: 'jerrymusic.pages.dev',
      icon: '🎵',
      cat: '音乐',
      keys: 'music yinyue 音乐 电台 播放器 歌曲 歌单'
    },
    {
      name: '每日全球要闻',
      desc: '每日 09:00 自动更新的中英双语全球要闻速读。',
      url: 'https://mc-creator-jerry.github.io/daily-news/',
      domain: 'mc-creator-jerry.github.io/daily-news',
      icon: '📰',
      cat: '新闻',
      keys: 'news yaowen 新闻 要闻 日报 全球 daily 资讯'
    },
    {
      name: '噪音警报器',
      desc: '麦克风实时监测：设定分贝阈值，超标即刻声光警报。',
      url: 'https://jerrydbalarm.pages.dev/',
      domain: 'jerrydbalarm.pages.dev',
      icon: '🔔',
      cat: '工具',
      keys: 'dbalarm zaoyin 噪音 警报器 分贝 db 声音 alarm 麦克风'
    }
  ];

  var LS_THEME = 'jl-theme';

  var grid = document.getElementById('tileGrid');
  var chipsBox = document.getElementById('chips');
  var input = document.getElementById('searchInput');
  var emptyTip = document.getElementById('emptyTip');
  var countEl = document.getElementById('siteCount');

  var state = { q: '', cat: '全部' };

  /* ---------- 主题 ---------- */
  function applyTheme(t) {
    document.documentElement.setAttribute('data-theme', t);
    try { localStorage.setItem(LS_THEME, t); } catch (e) {}
  }
  function initTheme() {
    var saved = null;
    try { saved = localStorage.getItem(LS_THEME); } catch (e) {}
    if (saved === 'dark' || saved === 'light') { applyTheme(saved); return; }
    var dark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    applyTheme(dark ? 'dark' : 'light');
  }
  document.getElementById('themeToggle').addEventListener('click', function () {
    var cur = document.documentElement.getAttribute('data-theme');
    applyTheme(cur === 'dark' ? 'light' : 'dark');
  });

  /* ---------- 分类 ---------- */
  function categories() {
    var set = ['全部'];
    SITES.forEach(function (s) { if (set.indexOf(s.cat) < 0) set.push(s.cat); });
    return set;
  }
  function renderChips() {
    chipsBox.innerHTML = '';
    categories().forEach(function (c) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'chip' + (c === state.cat ? ' on' : '');
      b.textContent = c;
      b.setAttribute('aria-pressed', c === state.cat ? 'true' : 'false');
      b.addEventListener('click', function () {
        state.cat = c;
        renderChips();
        renderTiles();
      });
      chipsBox.appendChild(b);
    });
  }

  /* ---------- 磁贴 ---------- */
  function matches(s) {
    if (state.cat !== '全部' && s.cat !== state.cat) return false;
    var q = state.q.trim().toLowerCase();
    if (!q) return true;
    return (s.name + ' ' + s.desc + ' ' + s.domain + ' ' + s.cat + ' ' + (s.keys || '')).toLowerCase().indexOf(q) >= 0;
  }
  function renderTiles() {
    var list = SITES.filter(matches);
    grid.innerHTML = '';
    list.forEach(function (s, i) {
      var a = document.createElement('a');
      a.className = 'tile';
      a.href = s.url;
      a.target = '_blank';
      a.rel = 'noopener';
      a.setAttribute('aria-label', s.name + '：' + s.desc);

      var ico = document.createElement('span');
      ico.className = 'tile-icon';
      ico.textContent = s.icon;

      var body = document.createElement('span');
      body.className = 'tile-body';

      var name = document.createElement('span');
      name.className = 'tile-name';
      name.appendChild(document.createTextNode(s.name));
      var arrow = document.createElement('span');
      arrow.className = 'arrow';
      arrow.textContent = '↗';
      arrow.setAttribute('aria-hidden', 'true');
      name.appendChild(arrow);

      var desc = document.createElement('span');
      desc.className = 'tile-desc';
      desc.textContent = s.desc;

      var meta = document.createElement('span');
      meta.className = 'tile-meta';
      var cat = document.createElement('span');
      cat.className = 'tile-cat';
      cat.textContent = s.cat;
      var dom = document.createElement('span');
      dom.className = 'tile-domain';
      dom.textContent = s.domain;
      meta.appendChild(cat);
      meta.appendChild(dom);

      body.appendChild(name);
      body.appendChild(desc);
      body.appendChild(meta);

      var key = document.createElement('span');
      key.className = 'tile-key';
      key.textContent = String(i + 1);
      key.setAttribute('aria-hidden', 'true');

      a.appendChild(ico);
      a.appendChild(body);
      a.appendChild(key);
      grid.appendChild(a);
    });
    emptyTip.hidden = list.length > 0;
    countEl.textContent = String(SITES.length);
  }

  /* ---------- 搜索 ---------- */
  var t = null;
  input.addEventListener('input', function () {
    clearTimeout(t);
    var v = input.value;
    t = setTimeout(function () { state.q = v; renderTiles(); }, 90);
  });
  input.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      var first = grid.querySelector('.tile');
      if (first) first.click();
    } else if (e.key === 'Escape') {
      input.value = '';
      state.q = '';
      renderTiles();
      input.blur();
    }
  });

  /* ---------- 全局快捷键 ---------- */
  document.addEventListener('keydown', function (e) {
    var tag = (e.target && e.target.tagName) || '';
    var typing = tag === 'INPUT' || tag === 'TEXTAREA';
    if (e.key === '/' && !typing) {
      e.preventDefault();
      input.focus();
      input.select();
    } else if (e.key === 'Escape' && typing) {
      input.value = '';
      state.q = '';
      renderTiles();
      input.blur();
    } else if (/^[1-9]$/.test(e.key) && !typing && !e.metaKey && !e.ctrlKey && !e.altKey) {
      var idx = Number(e.key) - 1;
      var visible = grid.querySelectorAll('.tile');
      if (visible[idx]) {
        e.preventDefault();
        window.open(visible[idx].href, '_blank', 'noopener');
      }
    }
  });

  /* ---------- 时钟 ---------- */
  var WEEK = ['日', '一', '二', '三', '四', '五', '六'];
  var timeEl = document.getElementById('clockTime');
  var dateEl = document.getElementById('clockDate');
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function tick() {
    var d = new Date();
    timeEl.textContent = pad(d.getHours()) + ':' + pad(d.getMinutes());
    dateEl.textContent = (d.getMonth() + 1) + '月' + d.getDate() + '日 周' + WEEK[d.getDay()];
  }
  tick();
  setInterval(tick, 1000);

  /* ---------- 启动 ---------- */
  initTheme();
  renderChips();
  renderTiles();
})();
