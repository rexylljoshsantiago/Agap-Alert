

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

  /* ── Copy strings (FIL) ─────────────────────────────────────────────────── */
  var D = {
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
      p: '(075) 518-2024'
    },
    {
      n: 'Santa Barbara Multi-Purpose Gymnasium', b: 'Poblacion Sur',
      k: 1.2, o: 110, c: 350, el: 22,
      e: '22 m high elevation',
      f: 'Medical aid, pet friendly, solar backup',
      s: 'Hot meals desk, thermal blankets, medical station, infant formula',
      p: '0917-508-1122'
    },
    {
      n: 'Tuliao Disaster Evacuation Center', b: 'Tuliao',
      k: 1.8, o: 65, c: 220, el: 20,
      e: '20 m elevation', f: '', s: '', p: ''
    },
    {
      n: 'Minien National High School Shelter', b: 'Minien',
      k: 2.6, o: 88, c: 200, el: 21,
      e: '21 m high ground', f: '', s: '', p: ''
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
    lv:    2,
    role:  _isOfficial ? 'off' : 'res',
    tab:   'radar',
    net:   1,
    open:  null,
    more:  false,
    fl:    1,
    inc:   1,
    pubLv: 2,
    pubC:  0,
    reps:  []
  };

  /* ── Utility functions ───────────────────────────────────────────────────── */
  var H  = {};   // hydrograph state
  var tt;        // toast timer

  function T(k) {
    // These four keys use the current time rather than a hardcoded value
    var t = nowHHMM();
    if (k === 'upd')    return 'Na-update ' + t;
    if (k === 'saved')  return 'Na-save ' + t;
    if (k === 'issuer') return 'MDRRMO Santa Barbara, ' + t;
    if (k === 'off2')   return 'Ipinapakita ang impormasyong na-save noong ' + t + '. Maaaring luma na ang mga numero.';
    return D.fil[k] != null ? D.fil[k] : k;
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

  function clk(h) {
    var base = new Date();
    var m = (base.getHours() * 60 + base.getMinutes() - Math.round(h * 60) + 1440) % 1440;
    return ('0' + Math.floor(m / 60)).slice(-2) + ':' + ('0' + m % 60).slice(-2);
  }

  function nowHHMM() {
    var d = new Date();
    return ('0' + d.getHours()).slice(-2) + ':' + ('0' + d.getMinutes()).slice(-2);
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
  var _leafMap         = null;
  var _shelterMarkers  = [];
  var _floodLayer      = null;
  var _incidentMarkers = [];
  var _routeLayer      = null;
  var _userMarker      = null;

  // Dalongue, Santa Barbara — fixed map center
  var MAP_CENTER = [15.9650, 120.4150];
  var MAP_ZOOM   = 15;

  // Real-world coordinates for evacuation centers (Dalongue, Santa Barbara, Pangasinan)
  var CT_COORDS = [
    [15.9643, 120.4138],  // Dalongue Barangay Evacuation Hall
    [15.9598, 120.4095],  // Santa Barbara Multi-Purpose Gymnasium (Poblacion Sur)
    [15.9712, 120.4198],  // Tuliao Disaster Evacuation Center
    [15.9581, 120.4230]   // Minien National High School Shelter
  ];

  // Flood zone polygon along Sinocalan River (Dalongue)
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
    var el = document.getElementById('leaflet-map');
    if (!el || _leafMap) return;

    L.Icon.Default.imagePath = 'assets/lib/images/';

    _leafMap = L.map('leaflet-map', {
      center:      MAP_CENTER,
      zoom:        MAP_ZOOM,
      zoomControl: false
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
      crossOrigin: true
    }).on('tileerror', function () {
      var el = document.getElementById('leaflet-map');
      if (el && !el.querySelector('.tile-error-msg')) {
        el.style.position = 'relative';
        var msg = document.createElement('div');
        msg.className = 'tile-error-msg';
        msg.style.cssText = 'position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);'
          + 'background:rgba(0,0,0,.7);color:#fff;padding:12px 20px;border-radius:8px;'
          + 'font-size:13px;text-align:center;z-index:9999;pointer-events:none;max-width:280px';
        msg.textContent = 'Kailangan ng internet para makita ang mapa. Gumagana pa rin ang mga marker at ruta.';
        el.appendChild(msg);
      }
    }).addTo(_leafMap);

    _updateFloodLayer();
    _updateShelterMarkers();
    if (off()) _updateIncidentMarkers();

    // Ask for location permission on map load
    requestLocation();
  }

  function _updateFloodLayer() {
    if (!_leafMap) return;
    if (_floodLayer) { _leafMap.removeLayer(_floodLayer); _floodLayer = null; }
    if (!S.fl || S.lv === 0) return;
    var c = floodColor();
    _floodLayer = L.polygon(FLOOD_ZONE, {
      color: c, fillColor: c, fillOpacity: 0.25, weight: 2, dashArray: '6 4'
    }).addTo(_leafMap);
    _floodLayer.bindTooltip('Flood zone – Sinocalan River', { sticky: true });
  }

  function _updateShelterMarkers() {
    if (!_leafMap) return;
    _shelterMarkers.forEach(function (m) { _leafMap.removeLayer(m); });
    _shelterMarkers = [];

    var shelterIcon = L.divIcon({
      className: '',
      html: '<div style="width:28px;height:28px;border-radius:50%;background:#2563eb;border:3px solid #fff;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:12px;color:#fff;box-shadow:0 2px 6px rgba(0,0,0,.4)">S</div>',
      iconSize: [28, 28], iconAnchor: [14, 14]
    });

    CT.forEach(function (c, i) {
      var cap = c.c - c.o;
      var pct = Math.round(c.o / c.c * 100);
      var col = pct > 90 ? '#ef4444' : pct > 70 ? '#f59e0b' : '#22c55e';
      var m = L.marker(CT_COORDS[i], { icon: shelterIcon })
        .addTo(_leafMap)
        .bindPopup(
          '<b>' + (i + 1) + '. ' + c.n + '</b><br>' +
          c.b + '<br>' +
          c.k + ' km · ' + walk(c) + ' min walk<br>' +
          '<span style="color:' + col + '">' + cap + ' places left (' + pct + '% full)</span>' +
          (c.p ? '<br>📞 ' + c.p : '')
        );
      _shelterMarkers.push(m);
    });
  }

  function _updateIncidentMarkers() {
    if (!_leafMap) return;
    _incidentMarkers.forEach(function (m) { _leafMap.removeLayer(m); });
    _incidentMarkers = [];
    if (!S.inc) return;

    var incIcon = L.divIcon({
      className: '',
      html: '<div style="width:16px;height:16px;background:#ef4444;transform:rotate(45deg);border:2px solid #fff;box-shadow:0 2px 4px rgba(0,0,0,.4)"></div>',
      iconSize: [16, 16], iconAnchor: [8, 8]
    });

    S.reps.filter(function (r) { return r.st < 3; }).forEach(function (r, idx) {
      var lat = MAP_CENTER[0] + (idx % 3 - 1) * 0.003;
      var lon = MAP_CENTER[1] + (Math.floor(idx / 3) - 0.5) * 0.003;
      var m = L.marker([lat, lon], { icon: incIcon })
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

      if (_leafMap) {
        _leafMap.remove();
        _leafMap      = null;
        _userMarker   = null;
        _shelterMarkers   = [];
        _floodLayer       = null;
        _incidentMarkers  = [];
        _routeLayer       = null;
      }

      initMap();

      // Restore user marker if location was already granted
      if (_userLat !== null) _updateUserMarker();
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
        + '<div class="facts' + o + (_dataLoaded ? '' : ' loading') + '">'
            + '<div>' + T('wind') + '<b>' + (_dataLoaded ? L.w + ' km/h' : '—') + '</b></div>'
            + '<div>' + T('rain') + '<b>' + (_dataLoaded ? L.r + ' mm/h' : '—') + '</b></div>'
            + '<div>' + T('space') + '<b>' + (_dataLoaded ? sp : '—') + '</b></div>'
            + '<div>Panahon<b id="wx-tile">' + (W ? (WX_FIL[W.weather_condition] || W.weather_condition) + ' · ' + W.temperature.toFixed(1) + '°C' : '—') + '</b></div>'
        + '</div>'
        + '<div id="refresh-bar" style="font-size:12px;color:var(--dim);text-align:right;padding:2px 0 6px">'
            + 'Huling na-refresh: <span id="last-refresh">ngayon</span>'
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
    var isOff = _isOfficial || _isAdmin;
    return '<div class="ph"><div>'
        + '<h1>' + T('sh') + '</h1>'
        + '<p>' + CT.length + ' bukas malapit sa Dalongue</p>'
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
                        + (o ? 'Itago' : 'Detalye')
                    + '</button>'
                + '</div>'
                + '<div class="fold' + (o ? ' on' : '') + '"><div>'
                    + '<p>'
                        + c.e
                        + (c.p ? '. Makipag-ugnayan: ' + c.p : '') + '.'
                        + (c.f ? ' ' + c.f + '.' : '')
                        + (c.s ? ' Suplay: ' + c.s + '.' : '')
                    + '</p>'
                    + (isOff
                        ? '<div class="rw" style="margin-top:10px;gap:8px;flex-wrap:wrap">'
                            + '<label style="font-size:13px;color:var(--mute);white-space:nowrap;margin:auto 0">I-update ang bilang ng tao:</label>'
                            + '<input type="number" min="0" max="' + c.c + '" value="' + c.o + '" id="socc-' + i + '"'
                                + ' style="width:80px;padding:4px 8px;border:1px solid var(--line2);border-radius:6px;background:var(--s2);color:var(--ink);font-size:14px">'
                            + '<button class="btn s" data-a="upd-shelter" data-v="' + i + '">I-save</button>'
                          + '</div>'
                        : '')
                + '</div></div>'
              + '</div>';
            }).join('')
      + '</div>';
  }

  function reports() {
    var O = off();
    return '<div class="ph">'
        + '<div>'
            + '<h1>' + (O ? 'Pila ng Insidente' : 'Mga Ulat ng Komunidad') + '</h1>'
            + '<p>' + (O ? 'Bawat SOS ay naihahatid, anuman ang antas ng tiwala.' : 'Mga ulat mula sa mga tao sa inyong lugar.') + '</p>'
        + '</div>'
        + '<button class="btn" data-a="rep">' + ic('plus') + 'Mag-ulat ng Insidente</button>'
      + '</div>'
      + '<div class="led" id="reports-led"></div>'
      + '<div style="text-align:center;padding:12px 0">'
          + '<button class="btn o" id="load-more-btn" style="display:none" data-a="load-more">Mag-load ng mas marami…</button>'
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
    if (S.tab === 'reports') {
      var led = document.getElementById('reports-led');
      if (led) { _renderReportRows(led); _renderLoadMore(); }
    }
    document.documentElement.lang = 'fil';

    window.scrollTo(0, scrollY);
  }

  /* ── Dialogs ─────────────────────────────────────────────────────────────── */
  var C   = 2 * Math.PI * 46;  // SOS ring circumference
  var n   = 1;                  // people count
  var dep = 'Tuhod';            // lalim ng baha (default chip)
  var raf = 0, t0 = 0, tm = [];
  var _stopCurrentSosPoll = null; // set by sent(), cleared by A.close()

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
      + '<p class="mute" style="width:100%">Pindutin at hawakan ang pindutan ng 1 segundo para magpadala ng SOS.</p>'
      + '<div class="hb">'
          + '<svg viewBox="0 0 100 100" aria-hidden="true">'
              + '<circle class="tr" cx="50" cy="50" r="46"/>'
              + '<circle id="ring" cx="50" cy="50" r="46" stroke-dasharray="' + C + '" stroke-dashoffset="' + C + '"/>'
          + '</svg>'
          + '<button id="hold" aria-label="Hawakan para magpadala ng SOS">Hawakan</button>'
      + '</div>'
      + '<div class="stp">'
          + '<button data-a="m" aria-label="Bawasan">&minus;</button>'
          + '<output id="pp">' + n + (n === 1 ? ' tao' : ' tao') + '</output>'
          + '<button data-a="p" aria-label="Dagdagan">+</button>'
      + '</div>'
      + '<div class="chips" role="group" aria-label="Lalim ng baha">'
          + ['Bukung-bukong', 'Tuhod', 'Baywang', 'Dibdib o mas mataas'].map(function (d) {
              return '<button class="chp" data-a="dep" data-v="' + d + '" aria-pressed="' + (d === dep) + '">' + d + '</button>';
            }).join('')
      + '</div>'
      + '<input class="fi" type="tel" id="sos-phone" placeholder="Iyong numero ng telepono (opsyonal)" aria-label="Numero ng telepono">'
      + '<p class="dim" style="font-size:13px">Gagamitin ang iyong lokasyon para sa rescue.</p>'
      + '<div style="display:flex;gap:8px;width:100%">'
          + '<a class="btn o" style="flex:1" href="tel:911">' + ic('phone') + 'Tumawag sa 911</a>'
          + '<button class="btn o" style="flex:1" data-a="sos-sms">Mag-SMS</button>'
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

    // Build SOS details
    var phoneEl = $('#sos-phone');
    var phone   = phoneEl ? phoneEl.value.trim() : '';
    var title   = 'SOS: ' + n + ' tao, baha sa ' + dep.toLowerCase();
    var desc    = 'Bilang ng tao: ' + n + '. Lalim ng baha: ' + dep + '.'
                + (phone ? ' Telepono: ' + phone : '');
    var locStr  = (_userLat !== null)
      ? 'Lat ' + _userLat.toFixed(5) + ', Lon ' + _userLon.toFixed(5)
      : 'Dalongue, Santa Barbara';

    // Show confirmation dialog immediately (don't wait for network)
    dlg(
      '<header><h3>SOS Naipadala</h3>' + xb() + '</header>'
      + '<img src="' + LOGO + '" alt="" style="width:64px;height:64px;border-radius:50%">'
      + '<p class="mute" style="text-align:center">Inaaayos na ang tulong. Manatili sa ligtas na lugar.</p>'
      + '<p class="mono dim" style="font-size:13px" id="sos-ref">Nagpapadala…</p>'
      + '<ul class="tl">'
          + '<li id="s1">Natanggap</li>'
          + '<li id="s2">Nakita ng iyong barangay</li>'
          + '<li id="s3">Tulong paparating</li>'
      + '</ul>'
      + '<a class="btn w" href="tel:911">' + ic('phone') + 'Tumawag sa 911</a>'
      + '<button class="ul" data-a="safe">Ligtas na ako, kanselahin ang SOS</button>'
    );

    // Mark step 1 (Natanggap) immediately — the report was received by the server
    tm.forEach(clearTimeout);
    tm = [setTimeout(function () {
      var el = $('#s1'); if (el) el.classList.add('d2');
    }, 300)];

    // Polling state
    var _sosReportId  = null;
    var _sosPollTimer = null;

    function _stopSosPoll() {
      if (_sosPollTimer) { clearInterval(_sosPollTimer); _sosPollTimer = null; }
    }

    function _pollSosStatus() {
      if (!_sosReportId) return;
      fetch('api/reports.php?id=' + _sosReportId, { credentials: 'same-origin' })
        .then(function (r) { return r.json(); })
        .then(function (data) {
          if (!data.ok || !data.report) return;
          var status = data.report.status;

          // Step 2 — official acknowledged
          if (status === 'acknowledged' || status === 'dispatched' || status === 'resolved') {
            var s2 = $('#s2');
            if (s2 && !s2.classList.contains('d2')) s2.classList.add('d2');
          }

          // Step 3 — dispatched or resolved
          if (status === 'dispatched' || status === 'resolved') {
            var s3 = $('#s3');
            if (s3 && !s3.classList.contains('d2')) s3.classList.add('d2');
            _stopSosPoll(); // done — no need to keep polling
          }
        })
        .catch(function () {}); // silent — offline is expected
    }

    // POST to database
    fetch('api/reports.php', {
      method:      'POST',
      credentials: 'same-origin',
      headers:     { 'Content-Type': 'application/json' },
      body:        JSON.stringify({
        title:       title,
        description: desc,
        location:    locStr,
        is_sos:      1
      })
    })
      .then(function (r) { return r.json(); })
      .then(function (data) {
        var refEl = $('#sos-ref');
        if (refEl) {
          refEl.textContent = data.ok
            ? 'Ref #' + data.id + ' · ' + n + ' tao · ' + dep
            : 'Nai-save nang lokal — ipapadala kapag may koneksyon.';
        }
        if (data.ok && data.id) {
          _sosReportId = data.id;
          // Poll every 8 seconds for real status updates from officials
          _sosPollTimer = setInterval(_pollSosStatus, 8000);
          // Store stop function so A.close() can cancel it
          _stopCurrentSosPoll = _stopSosPoll;
        }
        fetchReports(true);
      })
      .catch(function () {
        var refEl = $('#sos-ref');
        if (refEl) refEl.textContent = 'Nai-save nang lokal — ipapadala kapag may koneksyon.';
      });
  }

  function repForm() {
    var locStr = (_userLat !== null)
      ? _userLat.toFixed(4) + ', ' + _userLon.toFixed(4)
      : 'Dalongue, Santa Barbara';

    dlg(
      '<header><h3>Mag-ulat ng Insidente</h3>' + xb() + '</header>'
      + '<div class="chips" style="width:100%" role="group" aria-label="Uri">'
          + ['Baha', 'Medikal', 'Relief', 'Debris'].map(function (t, i) {
              return '<button class="chp" data-a="rt" aria-pressed="' + (i === 0) + '">' + t + '</button>';
            }).join('')
      + '</div>'
      + '<input class="fi" id="rep-title" placeholder="Ano ang nangyayari?" aria-label="Pamagat" required>'
      + '<textarea class="fi" id="rep-desc" placeholder="Ilarawan ang sitwasyon (opsyonal)" aria-label="Paglalarawan" rows="3" style="resize:vertical"></textarea>'
      + '<div style="width:100%">'
          + '<label style="font-size:12px;color:var(--mute);display:block;margin-bottom:4px">Lokasyon</label>'
          + '<input class="fi" id="rep-loc" value="' + locStr + '" aria-label="Lokasyon" style="margin:0">'
      + '</div>'
      + '<p class="dim" style="width:100%;font-size:12px;margin-top:4px">Maaaring baguhin ang lokasyon kung kinakailangan.</p>'
      + '<button class="btn ac w" data-a="rsend">Ipadala ang Ulat</button>'
    );
  }

  function pubForm() {
    var levels = [T('lv')[1], T('lv')[2], T('lv')[3]];
    var reach  = [1860, 2640, 3240][S.pubLv - 1];

    dlg(
      '<header><h3>' + T('pubb') + '</h3>' + xb() + '</header>'
      + '<div class="chips" style="width:100%" role="group" aria-label="Antas">'
          + levels.map(function (lbl, i) {
              return '<button class="chp" data-a="pl" data-v="' + (i + 1) + '" aria-pressed="' + (S.pubLv === i + 1) + '">' + lbl + '</button>';
            }).join('')
      + '</div>'
      + '<textarea class="fi" aria-label="Mensahe">' + T('ti')[S.pubLv] + '. ' + T('td')[S.pubLv][0] + '</textarea>'
      + '<div class="rw" style="width:100%"><span>Mga Lugar</span><span>Dalongue, Poblacion Sur, Tuliao</span></div>'
      + '<div class="rw" style="width:100%"><span>Tinatanggap</span><span class="mono">' + reach + ' device, SMS at push</span></div>'
      + '<button class="btn w" data-a="pubgo" style="' + (S.pubC ? 'background:var(--rose);color:#fff' : '') + '">'
          + (S.pubLv === 3 && !S.pubC ? 'Suriin ang Kritikal na abiso'
            : S.pubLv === 3           ? 'Kumpirmahin at ilabas ang Kritikal na abiso'
                                      : 'Ilabas sa ' + reach + ' device')
      + '</button>'
      + '<p class="dim" style="font-size:13px;text-align:center">Inilalabas bilang MDRRMO Santa Barbara. Nire-record sa audit log.</p>'
    );
  }

  /* ── Action handlers ─────────────────────────────────────────────────────── */
  var A = {
    tab:   function (v)     { if (v === 'admin') { window.location.href = 'admin.html'; return; } S.tab = v; render(); },
    route: function (v) {
      var idx = +v;
      if (S.tab !== 'radar') { S.tab = 'radar'; render(); }
      setTimeout(function () { _drawRoute(idx); }, 200);
      toast('Ginagawa ang ruta papunta sa ' + CT[idx].n + '…');
    },
    open:  function (v)     { S.open = S.open === v ? null : v; render(); },
    more:  function ()      { S.more = !S.more; render(); },
    'load-more': function () {
      if (_reportPage < _reportPages) {
        _reportPage++;
        var btn = document.getElementById('load-more-btn');
        if (btn) { btn.disabled = true; btn.textContent = 'Kumukuha…'; }
        fetchReports(false);
      }
    },
    'upd-shelter': function (v) {
      var idx = +v;
      var inp = document.getElementById('socc-' + idx);
      if (!inp) return;
      var occ = parseInt(inp.value) || 0;
      var cap = CT[idx].c;
      if (occ > cap) { toast('Hindi maaaring lampas sa kapasidad (' + cap + ').'); return; }
      // Need the DB shelter id — stored in CT when fetched
      var shelterId = CT[idx].dbId;
      if (!shelterId) { toast('Walang koneksyon sa database.'); return; }
      fetch('api/admin/shelters.php', {
        method: 'PATCH',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: shelterId, occupancy: occ })
      })
        .then(function (r) { return r.json(); })
        .then(function (data) {
          if (!data.ok) { toast(data.error || 'Hindi na-update.'); return; }
          CT[idx].o = occ;
          fetchShelters();
          toast('Na-update ang occupancy ng ' + CT[idx].n + '.');
        })
        .catch(function () { toast('Walang koneksyon sa server.'); });
    },
    adv:   function (v) {
      var r = S.reps[v];
      if (!r || r.st >= 3) return;
      var statusMap = ['acknowledged', 'dispatched', 'resolved'];
      var newStatus = statusMap[r.st];
      if (r.id) {
        fetch('api/reports.php', {
          method: 'PATCH',
          credentials: 'same-origin',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: r.id, status: newStatus })
        })
          .then(function (res) { return res.json(); })
          .then(function (data) {
            if (data.ok) { r.st++; render(); }
            else toast('Hindi na-update ang status.');
          })
          .catch(function () { r.st++; render(); }); // optimistic fallback
      } else {
        r.st++; render();
      }
    },
    zin:   function ()      { if (_leafMap) _leafMap.zoomIn(); },
    zout:  function ()      { if (_leafMap) _leafMap.zoomOut(); },
    zr:    function ()      { if (_userLat !== null && _leafMap) { _leafMap.setView([_userLat, _userLon], 16); } else { requestLocation(); if (_leafMap) _leafMap.setView(MAP_CENTER, MAP_ZOOM); } },
    lfl:   function ()      { S.fl  = !S.fl;  _updateFloodLayer(); var b = document.querySelector('[data-a="lfl"]'); if(b) b.setAttribute('aria-pressed', String(S.fl)); },
    linc:  function ()      { S.inc = !S.inc; if(off()) _updateIncidentMarkers(); var b = document.querySelector('[data-a="linc"]'); if(b) b.setAttribute('aria-pressed', String(S.inc)); },
    toast: function (v)     { toast(v); },
    sos:   sosForm,
    rep:   repForm,
    pub:   function ()      { S.pubC = 0; pubForm(); },
    pl:    function (v)     { S.pubLv = +v; S.pubC = 0; pubForm(); },
    pubgo: function () {
      if (S.pubLv === 3 && !S.pubC) { S.pubC = 1; pubForm(); return; }

      var lv    = S.pubLv;
      var notes = T('ti')[lv] + '. ' + T('td')[lv][0];

      // Get current river/wind/rain from LVD so we don't zero them out
      var river = LVD[lv].m;
      var wind  = LVD[lv].w;
      var rain  = LVD[lv].r;

      fetch('api/flood.php', {
        method:      'POST',
        credentials: 'same-origin',
        headers:     { 'Content-Type': 'application/json' },
        body:        JSON.stringify({ level: lv, river_meters: river, wind_kmh: wind, rain_mmh: rain, notes: notes })
      })
        .then(function (r) { return r.json(); })
        .then(function (data) {
          A.close();
          S.lv   = lv;
          S.pubC = 0;
          render();
          toast(data.ok
            ? 'Abiso nailabas — Antas ' + lv + ' para sa Dalongue, Poblacion Sur at Tuliao'
            : 'Na-update nang lokal lamang. ' + (data.error || ''));
        })
        .catch(function () {
          // Offline — still update locally
          A.close();
          S.lv   = lv;
          S.pubC = 0;
          render();
          toast('Walang koneksyon — na-update nang lokal lamang.');
        });
    },
    close: function () {
      hx();
      tm.forEach(clearTimeout);
      if (_stopCurrentSosPoll) { _stopCurrentSosPoll(); _stopCurrentSosPoll = null; }
      $('#shade').classList.remove('on');
    },
    m: function () {
      n = Math.max(1, n - 1);
      $('#pp').textContent = n + ' tao';
    },
    p: function () {
      n = Math.min(20, n + 1);
      $('#pp').textContent = n + ' tao';
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
      var titleEl = document.getElementById('rep-title');
      var descEl  = document.getElementById('rep-desc');
      var locEl   = document.getElementById('rep-loc');
      var title   = titleEl ? titleEl.value.trim() : '';
      var desc    = descEl  ? descEl.value.trim()  : '';
      var loc     = locEl   ? locEl.value.trim()   : '';
      if (!title) { toast('Ilarawan ang insidente.'); return; }
      fetch('api/reports.php', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: title, description: desc, location: loc, is_sos: 0 })
      })
        .then(function (r) { return r.json(); })
        .then(function (data) {
          A.close();
          toast(data.message || (S.net ? 'Ulat naipadala.' : 'Nai-save. Ipapadala kapag may signal.'));
          if (data.ok) fetchReports(true);
        })
        .catch(function () { A.close(); toast('Ulat nai-save. Ipapadala kapag may signal.'); });
    },
    safe: function () {
      A.close();
      toast('SOS nakansela. Inabisuhan ang iyong barangay na ligtas ka na.');
    },
    'sos-sms': function () {
      var body = encodeURIComponent(
        'SOS AGAPALERT: ' + n + ' tao nangangailangan ng tulong. '
        + 'Lalim ng baha: ' + dep + '. '
        + (_userLat !== null ? 'Lokasyon: ' + _userLat.toFixed(5) + ',' + _userLon.toFixed(5) : 'Dalongue, Santa Barbara')
        + '. Mangyaring sagutin agad.'
      );
      window.open('sms:+639175082024?body=' + body);
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

  /* ── Geolocation ─────────────────────────────────────────────────────────── */
  var _userLat = null;
  var _userLon = null;

  function _updateUserMarker() {
    if (!_leafMap || _userLat === null) return;
    var userIcon = L.divIcon({
      className: '',
      html: '<div style="width:18px;height:18px;border-radius:50%;background:#3b82f6;border:3px solid #fff;box-shadow:0 0 0 8px rgba(59,130,246,.2)"></div>',
      iconSize:   [18, 18],
      iconAnchor: [9, 9]
    });
    if (_userMarker) _leafMap.removeLayer(_userMarker);
    _userMarker = L.marker([_userLat, _userLon], { icon: userIcon, zIndexOffset: 1000 })
      .addTo(_leafMap)
      .bindPopup('<b>Your location</b>');
  }

  function requestLocation() {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      function (pos) {
        _userLat = pos.coords.latitude;
        _userLon = pos.coords.longitude;
        if (_leafMap) {
          _leafMap.setView([_userLat, _userLon], 16);
          _updateUserMarker();
        }
        toast('Nahanap ang lokasyon — makikita na ang iyong posisyon sa mapa.');
      },
      function () {
        // Denied or unavailable — stay centered on Dalongue, no dot shown
      },
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
    var url = 'api/weather.php?lat=' + WEATHER_LAT
            + '&lon=' + WEATHER_LON
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
    // Update weather condition tile (index 3)
    if (factsEls.length >= 4 && W.weather_condition) {
      var condFil = WX_FIL[W.weather_condition] || W.weather_condition;
      factsEls[3].innerHTML = 'Panahon<b>' + condFil + ' · ' + W.temperature.toFixed(1) + '°C</b>';
    }
  }

  function compassDir(deg) {
    if (deg == null) return '';
    var dirs = ['N','NE','E','SE','S','SW','W','NW'];
    return dirs[Math.round(deg / 45) % 8];
  }

  // Filipino translations for Open-Meteo weather condition strings
  var WX_FIL = {
    'Clear Sky':         'Maliwanag',
    'Mainly Clear':      'Halos Maliwanag',
    'Partly Cloudy':     'Bahagyang Maulap',
    'Overcast':          'Maulap',
    'Fog':               'Ulap sa Lupa',
    'Rime Fog':          'Makapal na Ulap',
    'Light Drizzle':     'Ambon',
    'Moderate Drizzle':  'Katamtamang Ambon',
    'Dense Drizzle':     'Makapal na Ambon',
    'Slight Rain':       'Bahagyang Ulan',
    'Moderate Rain':     'Katamtamang Ulan',
    'Heavy Rain':        'Malakas na Ulan',
    'Slight Snow':       'Bahagyang Niyebe',
    'Moderate Snow':     'Katamtamang Niyebe',
    'Heavy Snow':        'Malakas na Niyebe',
    'Slight Shower':     'Mabilis na Ulan',
    'Moderate Shower':   'Katamtamang Shower',
    'Violent Shower':    'Malakas na Shower',
    'Thunderstorm':      'Kulog at Kidlat',
    'Thunderstorm + Hail': 'Bagyo at Yelo',
    'Severe Thunderstorm': 'Malakas na Bagyo'
  };

  /* ── Live data fetch ─────────────────────────────────────────────────────── */

  var _lastRefresh = null;
  var _dataLoaded  = false;  // true once first fetch cycle completes

  function _updateRefreshTime() {
    _lastRefresh = new Date();
    var el = document.getElementById('last-refresh');
    if (el) el.textContent = nowHHMM();
  }

  function fetchFloodLevel() {
    fetch('api/flood.php', { credentials: 'same-origin' })
      .then(function (r) { return r.json(); })
      .then(function (data) {
        if (!data.ok || !data.flood) return;
        var f = data.flood;
        var lv = Math.min(3, Math.max(0, parseInt(f.level) || 0));
        var changed = S.lv !== lv;
        S.lv = lv;
        // Update static LVD with real readings so the hydrograph stays accurate
        if (f.river_meters) LVD[lv].m = parseFloat(f.river_meters);
        if (f.wind_kmh)     LVD[lv].w = parseFloat(f.wind_kmh);
        if (f.rain_mmh)     LVD[lv].r = parseFloat(f.rain_mmh);
        _updateRefreshTime();
        _dataLoaded = true;
        if (changed && S.tab === 'radar') render();
      })
      .catch(function () {});
  }

  function fetchShelters() {
    fetch('api/shelters.php', { credentials: 'same-origin' })
      .then(function (r) { return r.json(); })
      .then(function (data) {
        if (!data.ok || !data.shelters || !data.shelters.length) return;
        // Map DB shelters onto the CT array in order
        data.shelters.forEach(function (s, i) {
          if (!CT[i]) return;
          CT[i].dbId = parseInt(s.id);
          CT[i].c = parseInt(s.capacity)  || CT[i].c;
          CT[i].o = parseInt(s.occupancy) || 0;
          if (s.contact) CT[i].p = s.contact;
        });
        // Refresh shelter space in the facts bar if on radar tab
        if (S.tab === 'radar') {
          var sp = CT.reduce(function (a, x) { return a + x.c - x.o; }, 0);
          var factsEls = document.querySelectorAll('.facts > div');
          if (factsEls[2]) factsEls[2].innerHTML = T('space') + '<b>' + sp + '</b>';
        }
      })
      .catch(function () {});
  }

  var _reportPage     = 1;
  var _reportPages    = 1;
  var _reportLoading  = false;

  function _mapReport(r) {
    var stMap = { 'new': 0, 'acknowledged': 1, 'dispatched': 2, 'resolved': 3 };
    return {
      id:  r.id,
      t:   r.title,
      w:   r.location || r.barangay_name || 'Santa Barbara, Pangasinan',
      h:   timeAgo(r.created_at),
      st:  stMap[r.status] !== undefined ? stMap[r.status] : 0,
      pr:  r.is_sos ? 'Kritikal' : 'Mataas',
      tr:  1,
      dt:  r.description || '',
      sos: r.is_sos ? 1 : 0
    };
  }

  function fetchReports(reset) {
    if (_reportLoading) return;
    if (reset) { _reportPage = 1; S.reps = []; }
    _reportLoading = true;

    fetch('api/reports.php?page=' + _reportPage + '&limit=20', { credentials: 'same-origin' })
      .then(function (r) { return r.json(); })
      .then(function (data) {
        _reportLoading = false;
        if (!data.ok || !data.reports) return;
        var mapped = data.reports.map(_mapReport);
        if (_reportPage === 1) {
          S.reps = mapped;
        } else {
          // Append new page, avoid duplicates by id
          var ids = S.reps.map(function (r) { return r.id; });
          mapped.forEach(function (r) { if (ids.indexOf(r.id) === -1) S.reps.push(r); });
        }
        if (data.meta) _reportPages = data.meta.pages || 1;
        nav();
        // Refresh the reports tab list in place if it's currently visible
        if (S.tab === 'reports') {
          var led = document.querySelector('#pg .led');
          if (led) _renderReportRows(led);
          _renderLoadMore();
        }
      })
      .catch(function () { _reportLoading = false; });
  }

  function _renderReportRows(container) {
    var O    = off();
    var rows = S.reps.filter(function (r) { return O || !r.sos; });
    container.innerHTML = rows.map(function (r) {
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
                    + '<span class="tg">' + r.pr + (r.sos ? ' — SOS' : '') + '</span>'
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
                    + (o ? 'Itago' : 'Detalye')
                  + '</button>'
                : '')
        + '</div>'
        + (r.dt
            ? '<div class="fold' + (o ? ' on' : '') + '"><div><p>' + r.dt + '</p></div></div>'
            : '')
      + '</div>';
    }).join('') || '<div class="empty" style="padding:2rem;text-align:center;color:var(--dim)">Walang mga ulat.</div>';
  }

  function _renderLoadMore() {
    var btn = document.getElementById('load-more-btn');
    if (!btn) return;
    if (_reportPage < _reportPages) {
      btn.style.display = '';
      btn.disabled = false;
      btn.textContent = 'Mag-load ng mas marami…';
    } else {
      btn.style.display = 'none';
    }
  }

  function timeAgo(ts) {
    if (!ts) return '';
    var diff = Math.floor((Date.now() - new Date(ts).getTime()) / 1000);
    if (diff < 60)  return diff + ' segundo';
    if (diff < 3600) return Math.floor(diff / 60) + ' min';
    if (diff < 86400) return Math.floor(diff / 3600) + ' oras';
    return Math.floor(diff / 86400) + ' araw';
  }

  /* ── Initial render ──────────────────────────────────────────────────────── */
  render();

  // Fetch live data on load
  fetchFloodLevel();
  fetchShelters();
  fetchReports(true);

  // Refresh flood level every 2 minutes, shelters/reports every 5 minutes
  setInterval(fetchFloodLevel, 2 * 60 * 1000);
  setInterval(fetchShelters,   5 * 60 * 1000);
  setInterval(function () { fetchReports(true); }, 5 * 60 * 1000);

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