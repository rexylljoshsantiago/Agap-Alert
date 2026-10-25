

(function () {

  var _raw  = localStorage.getItem('agapalert_user');
  var _user = null;
  if (_raw) {
    try { _user = JSON.parse(_raw); } catch (e) { _user = null; }
  }
  if (!_user) {
    window.location.href = 'login.html';
    return;
  }

  // Background session check — redirect if server session is gone
  fetch('api/me.php', { credentials: 'same-origin' })
    .then(function (res) { return res.json(); })
    .then(function (data) {
      if (!data.ok) {
        localStorage.removeItem('agapalert_user');
        window.location.href = 'login.html';
        return;
      }
      // Keep localStorage in sync with DB (role/status may have changed)
      localStorage.setItem('agapalert_user', JSON.stringify(data.user));
    })
    .catch(function () { /* offline — keep going with cached user */ });

  var _isOfficial = _user.role === 'official';
  var _isAdmin    = _user.role === 'admin';
  var _isPending  = _user.role === 'official' && _user.status === 'pending';

  /* ── User chip ───────────────────────────────────────────────────────────── */
  var _chip = document.getElementById('user-chip');
  var _nameEl = document.getElementById('user-name');

  function _setChipName() {
    var avatarSrc = _user.avatar_path ? _user.avatar_path : (_user.avatar || null);
    if (avatarSrc) {
      _nameEl.innerHTML = '<img src="' + avatarSrc + '" alt="" style="width:26px;height:26px;border-radius:50%;object-fit:cover;vertical-align:middle;margin-right:4px">' + (_user.full_name || '');
    } else {
      _nameEl.textContent = _user.full_name || '';
    }
  }

  _setChipName();
  document.getElementById('user-role').textContent = _isAdmin
    ? 'Administrator'
    : _isOfficial
      ? (_isPending ? 'Official (pending)' : 'Barangay official')
      : 'Resident';
  _chip.style.display = 'flex';

  // Admin gets a shortcut link to the admin panel via the nav tab
  document.getElementById('signout-btn').addEventListener('click', function () {
    fetch('api/logout.php', { method: 'POST', credentials: 'same-origin' })
      .finally(function () {
        localStorage.removeItem('agapalert_user');
        window.location.href = 'login.html';
      });
  });

  /* ── Settings dropdown toggle ────────────────────────────────────────────── */
  var _settingsBtn      = document.getElementById('settings-btn');
  var _settingsDropdown = document.getElementById('settings-dropdown');

  _settingsBtn.addEventListener('click', function (e) {
    e.stopPropagation();
    var open = _settingsDropdown.classList.toggle('open');
    _settingsBtn.setAttribute('aria-expanded', String(open));
  });

  document.addEventListener('click', function (e) {
    if (!_settingsDropdown.contains(e.target) && e.target !== _settingsBtn) {
      _settingsDropdown.classList.remove('open');
      _settingsBtn.setAttribute('aria-expanded', 'false');
    }
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      _settingsDropdown.classList.remove('open');
      _settingsBtn.setAttribute('aria-expanded', 'false');
    }
  });

  /* ── Helpers ─────────────────────────────────────────────────────────────── */
  var $ = function (s) { return document.querySelector(s); };

  var ic = function (name, extra) {
    return '<svg class="i"' + (extra || '') + '><use href="#i-' + name + '"/></svg>';
  };

  var LOGO = 'assets/img/logo.png';

  /* ── Copy strings (EN / FIL) ─────────────────────────────────────────────── */
  var D = {
    en: {
      map: 'Live map', sh: 'Shelters', rp: 'Reports', inc: 'Incidents',
      hot: 'Hotlines', sos: 'Request rescue', pubb: 'Publish advisory',
      goNow: 'Go now', near: 'Nearest shelter', walk: 'min on foot',
      left: 'places left', route: 'Show route', shown: 'Route shown',
      close: 'Close', river: 'River level at Dalongue gauge', todo: 'What to do',
      wind: 'Wind', rain: 'Rain', space: 'Shelter space',
      upd: 'Updated 14:05', saved: 'Saved 14:05',
      hrs: '24 hours ago', now: 'Now', fc: '+6 h',
      stead: 'No rise expected in the next 6 hours.',
      above: 'Above the Critical line of 8.0 m.',
      reach: 'At this rate it reaches {m} m in {t}.',
      h1: 'about an hour', hn: 'about {n} hours',
      nofc: 'Forecast unavailable while offline.',
      off1: 'No connection.',
      off2: 'Showing information saved at 14:05. Numbers may be out of date.',
      offb: 'Send SOS by SMS',
      l_flood: 'Flood zone', l_sh: 'Shelters', l_inc: 'Incidents',
      callTxt: 'Call', issuer: 'MDRRMO Santa Barbara, 14:05', alarm: 'Alarm',
      lv: ['Normal', 'Watch', 'Warning', 'Critical'],
      ti: [
        'Conditions normal',
        'Monitor flood conditions',
        'Preparatory evacuation advised',
        'Forced evacuation in effect'
      ],
      td: [
        [
          'Keep your phone charged and alerts on.',
          'Know which shelter is nearest to your home.',
          'Check this page again if heavy rain starts.'
        ],
        [
          'Pack your go-bag: water, food, medicines, documents.',
          'Agree a meeting place with your family.',
          'Be ready to leave if the level reaches 6.0 m.'
        ],
        [
          'Leave low-lying and riverside homes now.',
          'Take your go-bag, IDs and medicines.',
          'Walk to Dalongue Barangay Evacuation Hall, 0.4 km away.'
        ],
        [
          'Leave now and avoid flooded roads.',
          'Go to the nearest high-ground shelter.',
          'If you cannot leave, call the MDRRMO on (075) 518-2024.'
        ]
      ]
    },

    fil: {
      map: 'Mapa', sh: 'Likasan', rp: 'Mga ulat', inc: 'Mga insidente',
      hot: 'Hotline', sos: 'Humingi ng saklolo', pubb: 'Maglabas ng abiso',
      goNow: 'Pumunta na ngayon', near: 'Pinakamalapit na likasan',
      walk: 'minuto kung lalakad', left: 'puwesto pa',
      route: 'Ipakita ang ruta', shown: 'Ipinapakita ang ruta', close: 'Isara',
      river: 'Lebel ng ilog sa Dalongue', todo: 'Ano ang gagawin',
      wind: 'Hangin', rain: 'Ulan', space: 'Puwesto sa likasan',
      upd: 'Na-update 14:05', saved: 'Na-save 14:05',
      hrs: '24 oras ang nakaraan', now: 'Ngayon', fc: '+6 oras',
      stead: 'Walang inaasahang pagtaas sa susunod na 6 na oras.',
      above: 'Lampas na sa Critical na 8.0 m.',
      reach: 'Sa bilis na ito, aabot ito sa {m} m sa loob ng {t}.',
      h1: 'mga isang oras', hn: 'mga {n} oras',
      nofc: 'Walang forecast habang offline.',
      off1: 'Walang koneksyon.',
      off2: 'Ipinapakita ang impormasyong na-save noong 14:05. Maaaring luma na ang mga numero.',
      offb: 'Magpadala ng SOS sa text',
      l_flood: 'Binabaha', l_sh: 'Likasan', l_inc: 'Insidente',
      callTxt: 'Tawagan', issuer: 'MDRRMO Santa Barbara, 14:05', alarm: 'Alarma',
      lv: ['Normal', 'Bantay', 'Babala', 'Kritikal'],
      ti: [
        'Normal ang kalagayan',
        'Bantayan ang lebel ng baha',
        'Maghanda nang lumikas',
        'Sapilitang paglikas na'
      ],
      td: [
        [
          'Panatilihing may charge ang telepono at bukas ang mga alerto.',
          'Alamin kung saan ang pinakamalapit na likasan.',
          'Bumalik dito kung magsimula ang malakas na ulan.'
        ],
        [
          'Ihanda ang go-bag: tubig, pagkain, gamot, mahahalagang papeles.',
          'Magkasundo ang pamilya kung saan magkikita.',
          'Maging handang lumikas kung umabot sa 6.0 m ang lebel.'
        ],
        [
          'Lumikas na mula sa mabababang lugar at tabing-ilog.',
          'Dalhin ang go-bag, ID, at gamot.',
          'Maglakad papunta sa Dalongue Barangay Evacuation Hall, 0.4 km ang layo.'
        ],
        [
          'Lumikas na ngayon at iwasan ang binabahang daan.',
          'Pumunta sa pinakamalapit na likasan sa mataas na lugar.',
          'Kung hindi makalikas, tumawag sa MDRRMO: (075) 518-2024.'
        ]
      ]
    }
  };

  // River level data per alert level [0–3]
  var LVD = [
    { m: 3.2,  rate: 0,    w: 12,  r: 0.5, hz: 0,    tr: 'Steady for the last 6 hours' },
    { m: 4.6,  rate: 0.05, w: 38,  r: 8,   hz: 0.35, tr: 'Rising, up 0.3 m since this morning' },
    { m: 5.82, rate: 0.18, w: 82,  r: 34,  hz: 0.6,  tr: 'Rising, up 0.18 m in the last hour' },
    { m: 8.2,  rate: 0.5,  w: 105, r: 52,  hz: 0.9,  tr: 'Rising fast, up 0.5 m in the last hour' }
  ];

  // Filipino trend strings (index matches alert level)
  var TRF = [
    'Matatag nitong nakaraang 6 na oras',
    'Tumataas, 0.3 m mula kaninang umaga',
    'Tumataas, 0.18 m sa nakaraang oras',
    'Mabilis na tumataas, 0.5 m sa nakaraang oras'
  ];

  // Evacuation centers
  var CT = [
    {
      n: 'Dalongue Barangay Evacuation Hall', b: 'Dalongue',
      k: 0.4, o: 42, c: 180, el: 18,
      e: '18 m high ground',
      f: 'Medical aid, generator power, rescue boats on site',
      s: 'Clean drinking water (800 L), ready-to-eat rice, hygiene kits, first aid station',
      p: '(075) 518-2024', x: 272, y: 268
    },
    {
      n: 'Santa Barbara Multi-Purpose Gymnasium', b: 'Poblacion Sur',
      k: 1.2, o: 110, c: 350, el: 22,
      e: '22 m high elevation',
      f: 'Medical aid, pet friendly, solar backup',
      s: 'Hot meals desk, thermal blankets, medical station, infant formula',
      p: '0917-508-1122', x: 138, y: 342
    },
    {
      n: 'Tuliao Disaster Evacuation Center', b: 'Tuliao',
      k: 1.8, o: 65, c: 220, el: 20,
      e: '20 m elevation', f: '', s: '', p: '', x: 504, y: 98
    },
    {
      n: 'Minien National High School Shelter', b: 'Minien',
      k: 2.6, o: 88, c: 200, el: 21,
      e: '21 m high ground', f: '', s: '', p: '', x: 572, y: 338
    }
  ];

  // Priority hotlines
  var HL = [
    ['Santa Barbara MDRRMO',        '(075) 518-2024', 'Flood rescue and boat dispatch'],
    ['Santa Barbara Mayor Emergency','0917-508-1122',  '24/7 disaster quick response'],
    ['National Emergency',           '911',            'Police, fire and ambulance']
  ];

  // Secondary hotlines (expandable)
  var HM = [
    ['Pangasinan PDRRMO',              '(075) 542-7000', 'Provincial rescue and air or boat assets'],
    ['Philippine Red Cross Pangasinan','(075) 522-2258', 'Medical response and relief aid'],
    ['PAGASA Weather Alert',           '(02) 8284-0800', 'Typhoon and Sinocalan river bulletins'],
    ['Coast Guard Pangasinan Station', '0917-819-4825',  'Flood and watercraft rescue'],
    ['DOH Health Emergency',           '1555',           'Emergency medical advice']
  ];

  // Incident statuses / priorities / trust levels
  var ST = ['New', 'Acknowledged', 'Dispatched', 'Resolved'];
  var SC = ['--rose', '--amb', '--blu', '--ok'];
  var AC = ['Acknowledge', 'Dispatch', 'Resolve'];
  var TB = ['Unverified', 'Phone confirmed', 'Verified household'];

  /* ── App state ───────────────────────────────────────────────────────────── */
  var S = {
    lv:      2,
    role:    _isOfficial ? 'off' : 'res',
    tab:     'radar',
    net:     1,
    lang:    'en',
    sel:     null,
    route:   null,
    open:    null,
    more:    false,
    z:       1,
    fl:      1,
    inc:     1,
    pubLv:   2,
    pubC:    0,
    userLat: null,   // real GPS latitude  (null = not yet granted)
    userLon: null,   // real GPS longitude
    reps: [
      {
        t: '3 families stranded near Sinocalan River dike',
        w: 'Barangay Dalongue, Sinocalan riverbank',
        h: '2 min', st: 0, pr: 'Critical', tr: 2,
        dt: 'Floodwater rising above waist level. 8 people including 2 seniors and 1 infant on an upper roof deck. A rescue boat is needed.',
        ppl: 8, dep: 'Waist-deep (1.2 m)', sos: 1, x: 285, y: 196
      },
      {
        t: 'Chest-deep flood water on the Dalongue-Tuliao access road',
        w: 'Dalongue-Tuliao boundary road',
        h: '12 min', st: 0, pr: 'High', tr: 1,
        dt: 'Water level reached 1.4 m. Light vehicles and tricycles cannot pass. A high-clearance truck or rubber boat is needed.',
        x: 392, y: 146
      },
      {
        t: 'Senior insulin patient evacuation required',
        w: 'Santa Barbara, Pangasinan',
        h: '25 min', st: 1, pr: 'High', tr: 2, dt: '', x: 196, y: 150
      },
      {
        t: 'Waist-deep rapid flood near Katipunan St.',
        w: 'Santa Barbara, Pangasinan',
        h: '35 min', st: 1, pr: 'Critical', tr: 0, dt: '', x: 432, y: 252
      }
    ]
  };

  /* ── Utility functions ───────────────────────────────────────────────────── */
  var H  = {};   // hydrograph state
  var tt;        // toast timer

  function T(k) {
    return D[S.lang][k] != null ? D[S.lang][k] : D.en[k];
  }

  function toast(msg) {
    var el = $('#toast');
    el.textContent = msg;
    el.classList.add('on');
    clearTimeout(tt);
    tt = setTimeout(function () { el.classList.remove('on'); }, 2600);
  }

  function off()  { return S.role === 'off'; }
  function tel(n) { return 'tel:' + n.replace(/[^0-9+]/g, ''); }
  function walk(c){ return Math.max(1, Math.round(c.k * 15)); }

  function hz() {
    return S.lv === 1 ? 'var(--amb)' : S.lv === 2 ? '#E2662B' : 'var(--rose)';
  }

  function clk(h) {
    var m = (14 * 60 + 5 - Math.round(h * 60) + 1440) % 1440;
    return ('0' + Math.floor(m / 60)).slice(-2) + ':' + ('0' + m % 60).slice(-2);
  }

  /* ── Hydrograph ──────────────────────────────────────────────────────────── */
  function hydro(L) {
    var N  = 25;
    var st = L.rate === 0;
    var vals = [], fc = [];
    var GW = 340, HH = 132;
    var xs = GW * 0.8;

    var y = function (v) { return 120 - Math.min(v, 10) / 10 * 108; };

    for (var i = 0; i < N; i++) {
      var u  = i / (N - 1);
      var s0 = Math.max(1.4, L.m * 0.5);
      vals.push(
        st
          ? L.m + Math.sin(i * 1.3) * 0.07
          : s0 + (L.m - s0) * Math.pow(u, 1.7) + Math.sin(i * 1.7) * 0.05
      );
    }
    vals[N - 1] = L.m;

    if (S.net && !st) {
      for (var j = 1; j <= 6; j++) fc.push(L.m + L.rate * j);
    }

    H = { vals: vals, fc: fc, xs: xs, W: GW };

    var px = function (i) { return (i / (N - 1) * xs).toFixed(1); };

    var d  = 'M' + vals.map(function (v, i) { return px(i) + ' ' + y(v).toFixed(1); }).join('L');
    var fd = fc.length
      ? 'M' + xs + ' ' + y(L.m) + 'L' + fc.map(function (v, j) {
          return (xs + (GW - xs) * (j + 1) / 6).toFixed(1) + ' ' + y(v).toFixed(1);
        }).join('L')
      : '';

    return (
      '<svg class="hy" id="hy" viewBox="0 0 ' + GW + ' ' + HH + '"'
        + ' role="img" aria-label="River level over 24 hours with alarm and critical lines">'
      + '<rect x="0" y="' + y(8) + '" width="' + GW + '" height="' + (y(6) - y(8)).toFixed(1) + '" fill="var(--amb)" opacity=".1"/>'
      + '<rect x="0" y="12" width="' + GW + '" height="' + (y(8) - 12).toFixed(1) + '" fill="var(--rose)" opacity=".12"/>'
      + '<line x1="0" x2="' + GW + '" y1="' + y(6) + '" y2="' + y(6) + '" stroke="var(--amb)" stroke-dasharray="3 3"/>'
      + '<line x1="0" x2="' + GW + '" y1="' + y(8) + '" y2="' + y(8) + '" stroke="var(--rose)" stroke-dasharray="3 3"/>'
      + '<text x="3" y="' + (y(6) - 4) + '" fill="var(--amb)" font-size="10">Alarm 6.0 m</text>'
      + '<text x="3" y="' + (y(8) - 4) + '" fill="var(--rose)" font-size="10">Critical 8.0 m</text>'
      + '<path d="' + d + '" fill="none" stroke="var(--ink)" stroke-width="2" stroke-linejoin="round"'
        + (S.net ? '' : ' opacity=".55"') + '/>'
      + (fd ? '<path d="' + fd + '" fill="none" stroke="var(--ink)" stroke-width="2" stroke-dasharray="2 4"/>' : '')
      + '<line id="hl" x1="0" x2="0" y1="6" y2="124" stroke="var(--dim)" opacity="0"/>'
      + '<circle id="hd" r="4.5" cx="' + xs + '" cy="' + y(L.m) + '" fill="var(--ink)" stroke="var(--bg)" stroke-width="2"/>'
      + '</svg>'
      + '<div class="ax">'
        + '<span>' + T('hrs') + '</span>'
        + '<span>' + T('now') + '</span>'
        + '<span>' + (fc.length ? T('fc') : '') + '</span>'
      + '</div>'
    );
  }

  function proj(L) {
    if (!S.net) return T('nofc');
    if (L.rate === 0) return T('stead');
    var nx = L.m < 6 ? 6 : L.m < 8 ? 8 : 0;
    if (!nx) return T('above');
    var h = (nx - L.m) / L.rate;
    return T('reach')
      .replace('{m}', nx.toFixed(1))
      .replace('{t}', h < 1.5 ? T('h1') : T('hn').replace('{n}', Math.round(h)));
  }

  function bindHydro() {
    var s = $('#hy');
    if (!s || !s.addEventListener) return;

    function mv(e) {
      var r = s.getBoundingClientRect();
      var x = (e.clientX - r.left) / r.width * H.W;
      var v, t;

      if (x <= H.xs) {
        var i = Math.round(x / H.xs * 24);
        v = H.vals[i];
        t = clk(24 - i);
        x = i / 24 * H.xs;
      } else if (H.fc.length) {
        var j = Math.max(1, Math.round((x - H.xs) / (H.W - H.xs) * 6));
        v = H.fc[j - 1];
        t = clk(-j) + ' (est.)';
        x = H.xs + (H.W - H.xs) * j / 6;
      } else {
        return;
      }

      $('#hl').setAttribute('x1', x);
      $('#hl').setAttribute('x2', x);
      $('#hl').setAttribute('opacity', '.6');
      $('#hv').textContent = t + ', ' + v.toFixed(2) + ' m';
    }

    function lv() {
      $('#hl').setAttribute('opacity', '0');
      $('#hv').textContent = '';
    }

    s.addEventListener('pointermove',  mv);
    s.addEventListener('pointerleave', lv);
  }

  /* ── Leaflet map ─────────────────────────────────────────────────────────── */
  var _leafMap      = null;   // Leaflet map instance
  var _userMarker   = null;   // blue dot marker
  var _shelterMarkers = [];   // evacuation center markers
  var _floodLayer   = null;   // flood polygon layer
  var _incidentMarkers = [];  // incident markers (officials only)

  // Real-world coordinates for evacuation centers (Dalongue area)
  var CT_COORDS = [
    [15.9640, 120.4140],  // Dalongue Barangay Evacuation Hall
    [15.9610, 120.4110],  // Santa Barbara Multi-Purpose Gymnasium
    [15.9700, 120.4200],  // Tuliao Disaster Evacuation Center
    [15.9590, 120.4220]   // Minien National High School Shelter
  ];

  // Approximate flood zone polygon around Sinocalan River (Dalongue)
  var FLOOD_ZONE = [
    [15.9680, 120.4100], [15.9690, 120.4150], [15.9670, 120.4190],
    [15.9650, 120.4210], [15.9620, 120.4200], [15.9600, 120.4170],
    [15.9610, 120.4130], [15.9630, 120.4110]
  ];

  function floodColor() {
    return S.lv === 0 ? '#3b82f6'
         : S.lv === 1 ? '#f59e0b'
         : S.lv === 2 ? '#f97316'
         :               '#ef4444';
  }

  function initMap() {
    // Map container must exist in the DOM
    var el = document.getElementById('leaflet-map');
    if (!el || _leafMap) return;

    _leafMap = L.map('leaflet-map', {
      center:    [15.9650, 120.4150],
      zoom:      15,
      zoomControl: false   // we use our own buttons
    });

    // OpenStreetMap tiles — free, no key needed
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19
    }).addTo(_leafMap);

    // Flood zone polygon
    _updateFloodLayer();

    // Evacuation center markers
    _updateShelterMarkers();

    // If we already have user location, add the dot
    if (S.userLat !== null) _updateUserMarker();

    // Incident markers (officials)
    if (off()) _updateIncidentMarkers();
  }

  function _updateFloodLayer() {
    if (!_leafMap) return;
    if (_floodLayer) { _leafMap.removeLayer(_floodLayer); _floodLayer = null; }
    if (!S.fl || S.lv === 0) return;
    var c = floodColor();
    _floodLayer = L.polygon(FLOOD_ZONE, {
      color:       c,
      fillColor:   c,
      fillOpacity: 0.25,
      weight:      2,
      dashArray:   '6 4'
    }).addTo(_leafMap);
    _floodLayer.bindTooltip('Flood zone – Sinocalan River', { sticky: true });
  }

  function _updateShelterMarkers() {
    if (!_leafMap) return;
    _shelterMarkers.forEach(function (m) { _leafMap.removeLayer(m); });
    _shelterMarkers = [];

    var shelterIcon = L.divIcon({
      className: '',
      html: '<div style="width:28px;height:28px;border-radius:50%;background:var(--ac,#2563eb);border:3px solid #fff;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:12px;color:#fff;box-shadow:0 2px 6px rgba(0,0,0,.4)">S</div>',
      iconSize:   [28, 28],
      iconAnchor: [14, 14]
    });

    CT.forEach(function (c, i) {
      var coords = CT_COORDS[i];
      var cap    = c.c - c.o;
      var pct    = Math.round(c.o / c.c * 100);
      var m = L.marker(coords, { icon: shelterIcon })
        .addTo(_leafMap)
        .bindPopup(
          '<b>' + (i + 1) + '. ' + c.n + '</b><br>' +
          c.b + '<br>' +
          c.k + ' km away · ' + walk(c) + ' min walk<br>' +
          '<span style="color:' + (pct > 90 ? '#ef4444' : pct > 70 ? '#f59e0b' : '#22c55e') + '">' +
          cap + ' places left (' + pct + '% full)</span>' +
          (c.p ? '<br>📞 ' + c.p : '')
        );
      _shelterMarkers.push(m);
    });
  }

  function _updateUserMarker() {
    if (!_leafMap || S.userLat === null) return;
    if (_userMarker) { _leafMap.removeLayer(_userMarker); }
    var userIcon = L.divIcon({
      className: '',
      html: '<div style="width:18px;height:18px;border-radius:50%;background:#3b82f6;border:3px solid #fff;box-shadow:0 0 0 6px rgba(59,130,246,.25)"></div>',
      iconSize:   [18, 18],
      iconAnchor: [9, 9]
    });
    _userMarker = L.marker([S.userLat, S.userLon], { icon: userIcon, zIndexOffset: 1000 })
      .addTo(_leafMap)
      .bindPopup('<b>Your location</b>');
  }

  function _updateIncidentMarkers() {
    if (!_leafMap) return;
    _incidentMarkers.forEach(function (m) { _leafMap.removeLayer(m); });
    _incidentMarkers = [];
    if (!S.inc) return;

    var incIcon = L.divIcon({
      className: '',
      html: '<div style="width:16px;height:16px;background:#ef4444;transform:rotate(45deg);border:2px solid #fff;box-shadow:0 2px 4px rgba(0,0,0,.4)"></div>',
      iconSize:   [16, 16],
      iconAnchor: [8, 8]
    });

    S.reps.filter(function (r) { return r.st < 3; }).forEach(function (r) {
      // Approximate positions near the area (static demo data has no real coords)
      var baseCoords = [15.9645 + (Math.random() - 0.5) * 0.005,
                        120.4145 + (Math.random() - 0.5) * 0.005];
      var m = L.marker(baseCoords, { icon: incIcon })
        .addTo(_leafMap)
        .bindPopup('<b>' + r.pr + ' priority</b><br>' + r.t + '<br><small>' + r.w + '</small>');
      _incidentMarkers.push(m);
    });
  }

  function map() {
    return '<div class="map">'
      + '<div id="leaflet-map"></div>'
      + '<span class="tag mono' + (S.net ? '' : ' old') + '">'
          + (S.net ? T('upd') : T('saved'))
      + '</span>'
      + '<div class="lyr">'
          + '<button data-a="lfl" aria-pressed="' + (S.fl ? 'true' : 'false') + '">'
              + '<i style="background:' + floodColor() + ';opacity:.7"></i>'
              + T('l_flood')
          + '</button>'
          + (off()
              ? '<button data-a="linc" aria-pressed="' + (S.inc ? 'true' : 'false') + '">'
                  + '<i style="background:var(--rose);transform:rotate(45deg) scale(.8)"></i>'
                  + T('l_inc')
                + '</button>'
              : '')
      + '</div>'
      + '<div class="zm">'
          + '<button data-a="zin"  aria-label="Zoom in">'  + ic('plus')  + '</button>'
          + '<button data-a="zout" aria-label="Zoom out">' + ic('minus') + '</button>'
          + '<button data-a="zr"   aria-label="Center on my location">' + ic('loc') + '</button>'
      + '</div>'
      + '</div>';
  }

  // Called after map() HTML is injected into the DOM
  function initMapAfterRender() {
    if (S.tab !== 'radar') return;
    setTimeout(function () {
      var el = document.getElementById('leaflet-map');
      if (!el) return;

      // If map exists but container was re-created by render(), destroy and reinit
      if (_leafMap) {
        _leafMap.remove();
        _leafMap = null;
        _userMarker = null;
        _shelterMarkers = [];
        _floodLayer = null;
        _incidentMarkers = [];
      }

      initMap();
    }, 100);
  }

  /* ── Capacity bar ────────────────────────────────────────────────────────── */
  function bar(c) {
    var p = c.o / c.c * 100;
    var colour = p > 90 ? 'var(--rose)' : p > 70 ? 'var(--amb)' : 'var(--ok)';
    return '<div class="bar"><i style="width:' + p + '%;background:' + colour + '"></i></div>'
      + '<span class="mute" style="font-size:13.5px">' + (c.c - c.o) + ' ' + T('left') + '</span>';
  }

  /* ── View renderers ──────────────────────────────────────────────────────── */
  function band() {
    var b = $('#band');
    b.dataset.l = S.lv;
    b.innerHTML = '<div class="bi">'
      + (S.lv === 0 ? '<img src="' + LOGO + '" alt="">' : '')
      + '<div>'
          + '<span class="k">' + (S.lv ? T('alarm') + ' ' + S.lv + ', ' : '') + T('lv')[S.lv] + '</span>'
          + '<h2>' + T('ti')[S.lv] + '</h2>'
      + '</div>'
      + '<span class="by' + (S.net ? '' : ' old') + '">'
          + (S.lv ? T('issuer') : (S.net ? T('upd') : T('saved')))
      + '</span>'
      + '</div>';
  }

  function netbar() {
    $('#netbar').innerHTML = S.net
      ? ''
      : '<div class="net" role="status"><div>'
          + '<b>' + T('off1') + '</b>'
          + '<span>' + T('off2') + '</span>'
          + (!_isOfficial && !_isAdmin ? '<button class="btn s" data-a="sos">' + T('offb') + '</button>' : '')
        + '</div></div>';
  }

  function radar() {
    var L  = LVD[S.lv];
    var c  = CT[0];
    var u  = S.lv >= 2;
    var sp = CT.reduce(function (a, x) { return a + x.c - x.o; }, 0);
    var nw = S.reps.filter(function (r) { return r.st === 0; }).length;
    var o  = S.net ? '' : ' old';

    var teams = off()
      ? '<div class="sec"><p class="lb">Response teams</p>'
          + [
              ['Water Search and Rescue',    'Active in Dalongue',    '--ok'],
              ['Dalongue QRT boat crew',     'On patrol',             '--ac'],
              ['MDRRMO logistics truck',     'En route to Tuliao',    '--amb']
            ].map(function (t) {
              return '<div class="rw"><span>' + t[0] + '</span>'
                + '<span class="dot" style="--c:var(' + t[2] + ')">' + t[1] + '</span></div>';
            }).join('')
          + '<button class="lk" data-a="tab" data-v="reports">' + nw + ' new incidents, review</button>'
        + '</div>'
      : '';

    return '<div class="ph">'
        + '<div><h1>Dalongue, Santa Barbara</h1><p>Sinocalan River, Pangasinan</p></div>'
        + '<div class="facts' + o + '">'
            + '<div>' + T('wind') + '<b>' + L.w + ' km/h</b></div>'
            + '<div>' + T('rain') + '<b>' + L.r + ' mm/h</b></div>'
            + '<div>' + T('space') + '<b>' + sp + '</b></div>'
        + '</div>'
      + '</div>'
      + '<div class="cols"><div>' + map() + '</div><aside>'
          + '<div class="sec">'
              + '<div class="go" data-l="' + S.lv + '">'
                  + '<p class="lb">' + (u ? T('goNow') : T('near')) + '</p>'
                  + '<h3>' + c.n + '</h3>'
                  + '<p class="mute">' + c.k + ' km, ' + walk(c) + ' ' + T('walk') + '</p>'
                  + bar(c)
                  + '<button class="btn ac w" data-a="route" data-v="0">' + ic('nav') + T('route') + '</button>'              + '</div>'
          + '</div>'
          + '<div class="sec">'
              + '<p class="lb">' + T('river') + '</p>'
              + '<div class="read' + o + '">' + L.m.toFixed(2).replace(/0$/, '') + '<small>m</small></div>'
              + '<p class="mute' + o + '" style="margin-top:6px">'
                  + (S.lang === 'fil' ? TRF[S.lv] : L.tr)
              + '</p>'
              + '<div class="hv" id="hv"></div>'
              + hydro(L)
              + '<p class="mute" style="font-size:13.5px;margin-top:8px">' + proj(L) + '</p>'
          + '</div>'
          + '<div class="sec">'
              + '<p class="lb">' + T('todo') + '</p>'
              + '<ol class="todo">'
                  + T('td')[S.lv].map(function (t) { return '<li><span>' + t + '</span></li>'; }).join('')
              + '</ol>'
          + '</div>'
          + teams
      + '</aside></div>';
  }

  function centers() {
    return '<div class="ph"><div>'
        + '<h1>' + T('sh') + '</h1>'
        + '<p>' + CT.length + ' open near Dalongue, ' + (S.net ? 'updated 6 minutes ago' : 'saved 14:05') + '</p>'
      + '</div></div>'
      + '<div class="led">'
          + CT.map(function (c, i) {
              var o = S.open === 'c' + i;
              return '<div class="r sh">'
                + '<div><b class="t">' + (i + 1) + '. ' + c.n + '</b><span class="mute">' + c.b + '</span></div>'
                + '<div class="mono">' + c.k.toFixed(1) + ' km</div>'
                + '<div>' + bar(c) + '</div>'
                + '<div class="ops">'
                    + '<button class="btn s" data-a="route" data-v="' + i + '">' + ic('nav') + T('route') + '</button>'
                    + '<button class="btn s o" data-a="open" data-v="c' + i + '" aria-expanded="' + o + '">'
                        + (o ? 'Less' : 'Details')
                    + '</button>'
                + '</div>'
                + '<div class="fold' + (o ? ' on' : '') + '"><div><p>'
                    + c.e
                    + (c.p ? '. Contact ' + c.p : '') + '.'
                    + (c.f ? ' ' + c.f + '.' : '')
                    + (c.s ? ' Supplies: ' + c.s + '.' : '')
                + '</p></div></div>'
              + '</div>';
            }).join('')
      + '</div>';
  }

  function reports() {
    var O    = off();
    var rows = S.reps.filter(function (r) { return O || !r.sos; });

    return '<div class="ph">'
        + '<div>'
            + '<h1>' + (O ? 'Incident queue' : 'Community reports') + '</h1>'
            + '<p>' + (O ? 'Every SOS is delivered, whatever its trust level.' : 'Reports from people in your area.') + '</p>'
        + '</div>'
        + '<button class="btn" data-a="rep">' + ic('plus') + 'Report incident</button>'
      + '</div>'
      + '<div class="led">'
          + rows.map(function (r) {
              var i = S.reps.indexOf(r);
              var o = S.open === 'r' + i;
              return '<div class="r in">'
                + '<span class="mono dim">' + r.h + '</span>'
                + '<div>'
                    + '<b class="t">' + r.t + '</b>'
                    + '<span class="mute">' + r.w + '</span>'
                    + (O
                        ? '<div style="margin-top:6px;display:flex;gap:14px;flex-wrap:wrap">'
                            + '<span class="tg">' + ic('shield') + TB[r.tr] + '</span>'
                            + '<span class="tg">' + r.pr + ' priority, '
                                + (r.tr < 2 && !r.sos && r.pr !== 'High' ? 'call back first' : 'dispatch now')
                            + '</span>'
                          + '</div>'
                        : '')
                + '</div>'
                + '<span class="dot" style="--c:var(' + SC[r.st] + ')">' + ST[r.st] + '</span>'
                + '<div class="ops">'
                    + (O && r.st < 3
                        ? '<button class="btn s" data-a="adv" data-v="' + i + '">' + AC[r.st] + '</button>'
                        : '')
                    + (r.dt
                        ? '<button class="btn s o" data-a="open" data-v="r' + i + '" aria-expanded="' + o + '">'
                            + (o ? 'Hide' : 'Details')
                          + '</button>'
                        : '')
                + '</div>'
                + (r.dt
                    ? '<div class="fold' + (o ? ' on' : '') + '"><div><p>'
                        + r.dt + (r.ppl ? ' ' + r.ppl + ' people, ' + r.dep + '.' : '')
                      + '</p></div></div>'
                    : '')
              + '</div>';
            }).join('')
      + '</div>';
  }

  function hotlines() {
    return '<div class="ph"><div>'
        + '<h1>' + T('hot') + '</h1>'
        + '<p>Tap a number to call. These work without internet.</p>'
      + '</div></div>'
      + '<div class="led hl">'
          + HL.map(function (h) {
              return '<div class="r">'
                + '<div><b class="t">' + h[0] + '</b><span class="mute">' + h[2] + '</span></div>'
                + '<a class="tel" href="' + tel(h[1]) + '">' + h[1] + '</a>'
              + '</div>';
            }).join('')
      + '</div>'
      + '<button class="lk" style="margin-top:8px" data-a="more" aria-expanded="' + S.more + '">'
          + (S.more ? 'Hide other numbers' : 'Other numbers (' + HM.length + ')')
          + ic('chev', S.more ? ' style="transform:rotate(180deg)"' : '')
      + '</button>'
      + '<div class="fold' + (S.more ? ' on' : '') + '" style="grid-column:auto">'
          + '<div class="led hl">'
              + HM.map(function (h) {
                  return '<div class="r" style="padding:14px 0">'
                    + '<div>'
                        + '<b class="t" style="font-size:15px">' + h[0] + '</b>'
                        + '<span class="mute">' + h[2] + '</span>'
                    + '</div>'
                    + '<a class="tel" style="font-size:20px" href="' + tel(h[1]) + '">' + h[1] + '</a>'
                  + '</div>';
                }).join('')
          + '</div>'
      + '</div>';
  }

  function nav() {
    var T2 = [
      ['radar',    'map',   T('map')],
      ['centers',  'home',  T('sh')],
      null,
      ['reports',  'list',  off() ? T('inc') : T('rp')],
      ['hotlines', 'phone', T('hot')],
      _isAdmin ? ['admin', 'shield', 'Admin panel'] : null
    ];
    var n = S.reps.filter(function (r) { return r.st === 0; }).length;

    $('#tabs').innerHTML = T2.filter(Boolean).map(function (t) {
      return '<button data-a="tab" data-v="' + t[0] + '"'
        + (S.tab === t[0] ? ' aria-current="page"' : '') + '>'
        + t[2]
        + (t[0] === 'reports' && off() && n ? '<span class="n">' + n + '</span>' : '')
      + '</button>';
    }).join('');

    $('#bn').innerHTML = T2.map(function (t) {
      return t
        ? '<button data-a="tab" data-v="' + t[0] + '"'
            + (S.tab === t[0] ? ' aria-current="page"' : '') + '>'
            + ic(t[1], ' style="width:22px;height:22px"') + t[2]
          + '</button>'
        : (_isOfficial || _isAdmin)
            ? ''
            : '<button class="sb" data-a="sos" aria-label="' + T('sos') + '">SOS</button>';
    }).join('');

    $('#sosb').textContent = T('sos');
    $('#sosb').style.display = (_isOfficial || _isAdmin) ? 'none' : '';
    $('#pub').innerHTML = off()
      ? '<button class="btn s o" data-a="pub">' + T('pubb') + '</button>'
      : '';
  }

  function render() {
    var scrollY = window.scrollY;
    var views   = { radar: radar, centers: centers, reports: reports, hotlines: hotlines };
    $('#pg').innerHTML = views[S.tab]();
    netbar();
    nav();
    if (S.tab === 'radar') { initMapAfterRender(); bindHydro(); updateWeatherUI(); }
    document.documentElement.lang = S.lang === 'fil' ? 'fil' : 'en';

    // Sync language toggle pressed state
    document.querySelectorAll('#lg button').forEach(function (b) {
      b.setAttribute('aria-pressed', String(b.dataset.v === S.lang));
    });

    window.scrollTo(0, scrollY);
  }

  /* ── Dialogs ─────────────────────────────────────────────────────────────── */
  var C   = 2 * Math.PI * 46;  // SOS ring circumference
  var n   = 1;                  // people count
  var dep = 'Knee';             // flood depth
  var raf = 0, t0 = 0, tm = [];

  function dlg(h) {
    $('#dlg').innerHTML = h;
    $('#shade').classList.add('on');
  }

  function xb() {
    return '<button data-a="close" aria-label="Close" style="padding:6px">' + ic('x') + '</button>';
  }

  function sosForm() {
    dlg(
      '<header><h3>' + T('sos') + '</h3>' + xb() + '</header>'
      + (S.net
          ? '<p class="mute" style="width:100%">Press and hold the button for 1 second.</p>'
          : '<p class="mute" style="width:100%"><b>No signal.</b> Hold to save your SOS. It sends the moment signal returns, or send it by SMS now.</p>')
      + '<div class="hb">'
          + '<svg viewBox="0 0 100 100" aria-hidden="true">'
              + '<circle class="tr" cx="50" cy="50" r="46"/>'
              + '<circle id="ring" cx="50" cy="50" r="46" stroke-dasharray="' + C + '" stroke-dashoffset="' + C + '"/>'
          + '</svg>'
          + '<button id="hold" aria-label="Hold to send SOS">Hold</button>'
      + '</div>'
      + '<div class="stp">'
          + '<button data-a="m" aria-label="Fewer people">&minus;</button>'
          + '<output id="pp">' + n + (n === 1 ? ' person' : ' people') + '</output>'
          + '<button data-a="p" aria-label="More people">+</button>'
      + '</div>'
      + '<div class="chips" role="group" aria-label="Flood depth">'
          + ['Ankle', 'Knee', 'Waist', 'Chest or higher'].map(function (d) {
              return '<button class="chp" data-a="dep" data-v="' + d + '" aria-pressed="' + (d === dep) + '">' + d + '</button>';
            }).join('')
      + '</div>'
      + '<input class="fi" type="tel" placeholder="Your phone number (optional)" aria-label="Your phone number">'
      + '<p class="dim" style="font-size:13px">Using your location, accurate to 12 m</p>'
      + '<div style="display:flex;gap:8px;width:100%">'
          + '<a class="btn o" style="flex:1" href="tel:911">' + ic('phone') + 'Call 911</a>'
          + '<button class="btn ' + (S.net ? 'o' : '') + '" style="flex:1" data-a="toast"'
              + ' data-v="Opening your messages with the SOS text ready">SMS</button>'
      + '</div>'
    );

    var hold = $('#hold');
    hold.addEventListener('pointerdown', hs);
    ['pointerup', 'pointerleave', 'pointercancel'].forEach(function (e) {
      hold.addEventListener(e, hx);
    });
    hold.addEventListener('keydown', function (e) {
      if ((e.key === 'Enter' || e.key === ' ') && !e.repeat) hs(e);
    });
    hold.addEventListener('keyup', hx);
  }

  function tick(now) {
    var p = Math.min((now - t0) / 1000, 1);
    var r = $('#ring');
    if (r) r.style.strokeDashoffset = C * (1 - p);
    if (p >= 1) { sent(); return; }
    raf = requestAnimationFrame(tick);
  }

  function hs(e) {
    e.preventDefault();
    cancelAnimationFrame(raf);
    t0  = performance.now();
    raf = requestAnimationFrame(tick);
  }

  function hx() {
    cancelAnimationFrame(raf);
    var r = $('#ring');
    if (r) r.style.strokeDashoffset = C;
  }

  function sent() {
    try { navigator.vibrate && navigator.vibrate(80); } catch (e) {}
    var q = !S.net;
    dlg(
      '<header><h3>' + (q ? 'SOS saved' : 'SOS sent') + '</h3>' + xb() + '</header>'
      + '<img src="' + LOGO + '" alt="" style="width:64px;height:64px;border-radius:50%">'
      + '<p class="mute" style="text-align:center">'
          + (q ? 'Waiting for signal. It will send automatically.' : 'Help is being arranged. Stay where it is safe.')
      + '</p>'
      + '<p class="mono dim" style="font-size:13px">AGAP-2310-0417, '
          + n + (n === 1 ? ' person' : ' people') + ', water ' + dep.toLowerCase()
      + '</p>'
      + (q
          ? '<ul class="tl"><li class="d2">Saved on this phone</li><li>Sending when signal returns</li></ul>'
            + '<button class="btn w" data-a="toast" data-v="Opening your messages with the SOS text ready">Send by SMS now</button>'
          : '<ul class="tl">'
              + '<li id="s1">Received</li>'
              + '<li id="s2">Seen by your barangay</li>'
              + '<li id="s3">Help on the way</li>'
            + '</ul>')
      + '<a class="btn ' + (q ? 'o ' : '') + 'w" href="tel:911">' + ic('phone') + 'Call 911</a>'
      + '<button class="ul" data-a="safe">I\'m safe, cancel this SOS</button>'
    );

    tm.forEach(clearTimeout);
    if (!q) {
      tm = [300, 2500, 5000].map(function (d, i) {
        return setTimeout(function () {
          var el = $('#s' + (i + 1));
          if (el) el.classList.add('d2');
        }, d);
      });
    }
  }

  function repForm() {
    dlg(
      '<header><h3>Report incident</h3>' + xb() + '</header>'
      + '<div class="chips" style="width:100%" role="group" aria-label="Type">'
          + ['Flood', 'Medical', 'Relief', 'Debris'].map(function (t, i) {
              return '<button class="chp" data-a="rt" aria-pressed="' + (i === 0) + '">' + t + '</button>';
            }).join('')
      + '</div>'
      + '<input class="fi" placeholder="What is happening?" aria-label="Details">'
      + '<p class="dim" style="width:100%;font-size:13px">Your location is added automatically.</p>'
      + '<button class="btn ac w" data-a="rsend">Send report</button>'
    );
  }

  function pubForm() {
    var levels = ['Watch', 'Warning', 'Critical'];
    var reach  = [1860, 2640, 3240][S.pubLv - 1];

    dlg(
      '<header><h3>Publish advisory</h3>' + xb() + '</header>'
      + '<div class="chips" style="width:100%" role="group" aria-label="Level">'
          + levels.map(function (t, i) {
              return '<button class="chp" data-a="pl" data-v="' + (i + 1) + '" aria-pressed="' + (S.pubLv === i + 1) + '">' + t + '</button>';
            }).join('')
      + '</div>'
      + '<textarea class="fi" aria-label="Message">' + D.en.ti[S.pubLv] + '. ' + D.en.td[S.pubLv][0] + '</textarea>'
      + '<div class="rw" style="width:100%"><span>Areas</span><span>Dalongue, Poblacion Sur, Tuliao</span></div>'
      + '<div class="rw" style="width:100%"><span>Estimated reach</span><span class="mono">' + reach + ' devices, SMS and push</span></div>'
      + '<button class="btn w" data-a="pubgo" style="' + (S.pubC ? 'background:var(--rose);color:#fff' : '') + '">'
          + (S.pubLv === 3 && !S.pubC ? 'Review Critical alert'
            : S.pubLv === 3           ? 'Confirm and publish Critical alert'
                                      : 'Publish to ' + reach + ' devices')
      + '</button>'
      + '<p class="dim" style="font-size:13px;text-align:center">Published as MDRRMO Santa Barbara. Recorded in the audit log.</p>'
    );
  }

  /* ── Action handlers ─────────────────────────────────────────────────────── */
  var A = {
    tab:   function (v)     { if (v === 'admin') { window.location.href = 'admin.html'; return; } S.tab = v; render(); },
    route: function (v)     { S.tab = 'radar'; S.sel = +v; S.route = +v; render(); toast('Route to ' + CT[v].n + ', about ' + walk(CT[v]) + ' min on foot'); },
    pin:   function (v)     { S.sel = S.sel == +v ? null : +v; render(); },
    open:  function (v)     { S.open = S.open === v ? null : v; render(); },
    more:  function ()      { S.more = !S.more; render(); },
    adv:   function (v)     { var r = S.reps[v]; if (r.st < 3) r.st++; render(); },
    zin:   function ()      { if (_leafMap) _leafMap.zoomIn();  },
    zout:  function ()      { if (_leafMap) _leafMap.zoomOut(); },
    zr:    function ()      { requestLocation(); if (_leafMap && S.userLat !== null) { _leafMap.setView([S.userLat, S.userLon], 16); } else if (_leafMap) { _leafMap.setView([15.9650, 120.4150], 15); } },
    lfl:   function ()      { S.fl  = !S.fl;  _updateFloodLayer(); var b = document.querySelector('[data-a="lfl"]'); if(b) b.setAttribute('aria-pressed', String(S.fl)); },
    linc:  function ()      { S.inc = !S.inc; if(off()) _updateIncidentMarkers(); var b = document.querySelector('[data-a="linc"]'); if(b) b.setAttribute('aria-pressed', String(S.inc)); },
    toast: function (v)     { toast(v); },
    sos:   sosForm,
    rep:   repForm,
    pub:   function ()      { S.pubC = 0; pubForm(); },
    pl:    function (v)     { S.pubLv = +v; S.pubC = 0; pubForm(); },
    pubgo: function () {
      if (S.pubLv === 3 && !S.pubC) { S.pubC = 1; pubForm(); return; }
      A.close();
      S.lv = S.pubLv;
      S.pubC = 0;
      render();
      toast('Advisory published to Dalongue, Poblacion Sur and Tuliao');
    },
    close: function () {
      hx();
      tm.forEach(clearTimeout);
      $('#shade').classList.remove('on');
    },
    m: function () {
      n = Math.max(1, n - 1);
      $('#pp').textContent = n + (n === 1 ? ' person' : ' people');
    },
    p: function () {
      n = Math.min(20, n + 1);
      $('#pp').textContent = n + (n === 1 ? ' person' : ' people');
    },
    dep: function (v) {
      dep = v;
      document.querySelectorAll('[data-a="dep"]').forEach(function (b) {
        b.setAttribute('aria-pressed', String(b.dataset.v === v));
      });
    },
    rt: function (v, el) {
      document.querySelectorAll('[data-a="rt"]').forEach(function (b) {
        b.setAttribute('aria-pressed', 'false');
      });
      el.setAttribute('aria-pressed', 'true');
    },
    rsend: function () {
      A.close();
      toast(S.net
        ? 'Report sent. Your barangay can now see it.'
        : 'Report saved. It will send when signal returns.');
    },
    safe: function () {
      A.close();
      toast('SOS cancelled. Your barangay was told you\'re safe.');
    }
  };

  /* ── Event delegation ────────────────────────────────────────────────────── */
  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-a]');
    if (!b || b.disabled) return;
    var a = A[b.dataset.a];
    if (a) a(b.dataset.v, b);
  });

  document.addEventListener('keydown', function (e) {
    var p = e.target.closest && e.target.closest('.pin');
    if ((e.key === 'Enter' || e.key === ' ') && p) {
      e.preventDefault();
      A.pin(p.dataset.v);
    }
    if (e.key === 'Escape') A.close();
  });

  $('#shade').addEventListener('click', function (e) {
    if (e.target.id === 'shade') A.close();
  });

  // Language segmented control
  document.getElementById('lg').addEventListener('click', function (e) {
    var b = e.target.closest('button');
    if (b) { S.lang = b.dataset.v; render(); }
  });

  /* ── Theme toggle ────────────────────────────────────────────────────────── */
  var root     = document.documentElement;
  var themeBtn = document.getElementById('theme-btn');

  function applyTheme(dark) {
    root.setAttribute('data-theme', dark ? 'dark' : 'light');
    themeBtn.innerHTML = '<svg class="i"><use href="#i-' + (dark ? 'sun' : 'moon') + '"/></svg>';
    themeBtn.setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to dark mode');
    try { localStorage.setItem('agapalert_theme', dark ? 'dark' : 'light'); } catch (e) {}
  }

  /* ── Theme toggle ────────────────────────────────────────────────────────── */
  var root     = document.documentElement;
  var themeBtn = document.getElementById('theme-btn');

  function applyTheme(dark) {
    root.setAttribute('data-theme', dark ? 'dark' : 'light');
    themeBtn.innerHTML = '<svg class="i"><use href="#i-' + (dark ? 'sun' : 'moon') + '"/></svg>';
    themeBtn.setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to dark mode');
    try { localStorage.setItem('agapalert_theme', dark ? 'dark' : 'light'); } catch (e) {}
  }

  var _savedTheme = localStorage.getItem('agapalert_theme');
  applyTheme(_savedTheme ? _savedTheme === 'dark' : true);

  themeBtn.addEventListener('click', function () {
    applyTheme(root.getAttribute('data-theme') !== 'dark');
  });

  /* ── Geolocation ─────────────────────────────────────────────────────────── */  function requestLocation() {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      function (pos) {
        S.userLat = pos.coords.latitude;
        S.userLon = pos.coords.longitude;
        S.userSVG = null; // no longer used
        // Update Leaflet map
        if (_leafMap) {
          _leafMap.setView([S.userLat, S.userLon], 16);
          _updateUserMarker();
        }
        // Re-fetch weather using user's actual position
        fetchWeather();
        toast('Location found — map updated to your position.');
      },
      function () { /* denied or unavailable — stay at default */ },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  /* ── Weather fetch ───────────────────────────────────────────────────────── */
  // Dalongue, Santa Barbara, Pangasinan coordinates
  var WEATHER_LAT   = 15.9667;
  var WEATHER_LON   = 120.4167;
  var WEATHER_BRGID = 1;  // barangay_id for Dalongue

  // Live weather data from API (null until loaded)
  var W = null;

  function fetchWeather() {
    var lat = S.userLat !== null ? S.userLat : WEATHER_LAT;
    var lon = S.userLon !== null ? S.userLon : WEATHER_LON;
    var url = 'api/weather.php?lat=' + lat
            + '&lon=' + lon
            + '&barangay_id=' + WEATHER_BRGID;

    fetch(url, { credentials: 'same-origin' })
      .then(function (res) { return res.json(); })
      .then(function (data) {
        if (!data.ok || !data.weather) return;
        W = data.weather;
        updateWeatherUI();
      })
      .catch(function () { /* offline — keep showing static values */ });
  }

  function updateWeatherUI() {
    if (!W) return;
    var factsEls = document.querySelectorAll('.facts > div');
    if (factsEls.length >= 2) {
      var dir = compassDir(W.wind_direction_deg);
      factsEls[0].innerHTML = T('wind') + '<b>' + Math.round(W.wind_speed_kmh) + ' km/h ' + dir + '</b>';
      factsEls[1].innerHTML = T('rain') + '<b>' + W.rain_mm.toFixed(1) + ' mm</b>';
    }
  }

  function compassDir(deg) {
    if (deg == null) return '';
    var dirs = ['N','NE','E','SE','S','SW','W','NW'];
    return dirs[Math.round(deg / 45) % 8];
  }

  /* ── Initial render ──────────────────────────────────────────────────────── */
  render();

  // Request user location — browser will prompt allow/deny
  requestLocation();

  // Fetch live weather on load, then refresh every 10 minutes
  fetchWeather();
  setInterval(fetchWeather, 10 * 60 * 1000);

  // Show flash message left by login / register
  var _flashRaw = localStorage.getItem('agapalert_flash');
  if (_flashRaw) {
    localStorage.removeItem('agapalert_flash');
    try {
      var _f = JSON.parse(_flashRaw);
      toast(_f.message);
    } catch (e) {}
  }

})();