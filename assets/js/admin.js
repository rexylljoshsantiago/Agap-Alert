(function () {

  /* ── Auth guard ──────────────────────────────────────────────────────────── */
  var raw  = localStorage.getItem('agapalert_user');
  var user = null;
  try { user = JSON.parse(raw); } catch (e) {}

  if (!user || user.role !== 'admin') {
    window.location.href = 'login.html';
    return;
  }

  fetch('api/me.php', { credentials: 'same-origin' })
    .then(function (r) { return r.json(); })
    .then(function (data) {
      if (!data.ok || data.user.role !== 'admin') {
        localStorage.removeItem('agapalert_user');
        window.location.href = 'login.html';
      }
    })
    .catch(function () { /* offline — continue with cached user */ });

  document.getElementById('admin-name').textContent = user.full_name;

  /* ── Sign out ────────────────────────────────────────────────────────────── */
  document.getElementById('signout-btn').addEventListener('click', function () {
    fetch('api/logout.php', { method: 'POST', credentials: 'same-origin' })
      .finally(function () {
        localStorage.removeItem('agapalert_user');
        window.location.href = 'login.html';
      });
  });

  /* ── Theme ───────────────────────────────────────────────────────────────── */
  var root      = document.documentElement;
  var themeBtn  = document.getElementById('theme-btn');
  var themeIcon = document.getElementById('theme-icon');

  var MOON = '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>';
  var SUN  = '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/>';

  function applyTheme(dark) {
    root.setAttribute('data-theme', dark ? 'dark' : 'light');
    themeIcon.innerHTML = dark ? MOON : SUN;
    try { localStorage.setItem('agapalert_theme', dark ? 'dark' : 'light'); } catch (e) {}
  }

  applyTheme(localStorage.getItem('agapalert_theme') !== 'light');
  themeBtn.addEventListener('click', function () {
    applyTheme(root.getAttribute('data-theme') !== 'dark');
  });

  /* ── Settings dropdown ───────────────────────────────────────────────────── */
  var settingsBtn      = document.getElementById('settings-btn');
  var settingsDropdown = document.getElementById('settings-dropdown');

  settingsBtn.addEventListener('click', function (e) {
    e.stopPropagation();
    var open = settingsDropdown.style.display === 'block';
    settingsDropdown.style.display = open ? 'none' : 'block';
    settingsBtn.setAttribute('aria-expanded', String(!open));
  });

  document.addEventListener('click', function (e) {
    if (!settingsDropdown.contains(e.target) && e.target !== settingsBtn) {
      settingsDropdown.style.display = 'none';
      settingsBtn.setAttribute('aria-expanded', 'false');
    }
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      settingsDropdown.style.display = 'none';
      settingsBtn.setAttribute('aria-expanded', 'false');
    }
  });

  /* ── Tab switching ───────────────────────────────────────────────────────── */
  document.getElementById('admin-tabs').addEventListener('click', function (e) {
    var btn = e.target.closest('.admin-tab');
    if (!btn) return;
    document.querySelectorAll('.admin-tab').forEach(function (t) { t.classList.remove('active'); });
    document.querySelectorAll('.tab-panel').forEach(function (p) { p.style.display = 'none'; });
    btn.classList.add('active');
    document.getElementById('panel-' + btn.dataset.tab).style.display = '';
  });

  /* ── Toast ───────────────────────────────────────────────────────────────── */
  var _tt;
  function toast(msg) {
    var el = document.getElementById('toast');
    el.textContent = msg;
    el.classList.add('on');
    clearTimeout(_tt);
    _tt = setTimeout(function () { el.classList.remove('on'); }, 2400);
  }

  /* ── API helper ──────────────────────────────────────────────────────────── */
  function api(url, options) {
    return fetch(url, Object.assign({ credentials: 'same-origin' }, options))
      .then(function (r) { return r.json(); });
  }

  /* ── Invite codes ────────────────────────────────────────────────────────── */
  function renderCodes() {
    var tbody = document.getElementById('code-tbody');
    var empty = document.getElementById('code-empty');
    tbody.innerHTML = '<tr><td colspan="6" style="padding:1.2rem;color:var(--dim)">Loading…</td></tr>';

    api('api/admin/codes.php')
      .then(function (data) {
        if (!data.ok) { toast('Failed to load codes.'); return; }
        var codes = data.codes;
        if (codes.length === 0) {
          tbody.innerHTML = '';
          empty.style.display = '';
          return;
        }
        empty.style.display = 'none';
        tbody.innerHTML = codes.map(function (c) {
          var badgeCls = c.status === 'unused' ? 'badge-unused' : c.status === 'used' ? 'badge-used' : 'badge-expired';
          var badgeTxt = c.status === 'unused' ? 'Unused'       : c.status === 'used' ? 'Used'       : 'Expired';
          return '<tr>'
            + '<td><button class="code-mono" title="Click to copy" data-copy="' + c.code + '">' + c.code + '</button></td>'
            + '<td style="color:var(--mute)">' + (c.note || '<span style="color:var(--dim)">—</span>') + '</td>'
            + '<td style="color:var(--dim);font-size:13px">' + c.created_at.slice(0, 16).replace('T', ' ') + '</td>'
            + '<td><span class="badge ' + badgeCls + '">' + badgeTxt + '</span></td>'
            + '<td style="color:var(--dim);font-size:13px">' + (c.used_by_name || '—') + '</td>'
            + '<td>' + (c.status === 'unused' ? '<button class="btn-revoke" data-id="' + c.id + '">Revoke</button>' : '') + '</td>'
          + '</tr>';
        }).join('');

        tbody.querySelectorAll('[data-copy]').forEach(function (btn) {
          btn.addEventListener('click', function () {
            navigator.clipboard.writeText(this.dataset.copy)
              .then(function () { toast('Code copied to clipboard.'); });
          });
        });

        tbody.querySelectorAll('[data-id]').forEach(function (btn) {
          btn.addEventListener('click', function () {
            api('api/admin/codes.php?id=' + this.dataset.id, { method: 'DELETE' })
              .then(function (data) {
                if (!data.ok) { toast(data.error || 'Could not revoke code.'); return; }
                renderCodes();
                toast('Code revoked.');
              });
          });
        });
      })
      .catch(function () { toast('Could not load codes.'); });
  }

  document.getElementById('gen-btn').addEventListener('click', function () {
    var note = document.getElementById('gen-note').value.trim();
    var btn  = this;
    btn.disabled = true;

    api('api/admin/codes.php', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ note: note }),
    })
      .then(function (data) {
        btn.disabled = false;
        if (!data.ok) { toast(data.error || 'Failed to generate code.'); return; }
        document.getElementById('gen-note').value = '';
        renderCodes();
        toast('Code ' + data.code + ' generated. Click to copy.');
      })
      .catch(function () { btn.disabled = false; toast('Could not reach server.'); });
  });

  /* ── Pending approvals ───────────────────────────────────────────────────── */
  function renderPending() {
    var el    = document.getElementById('pending-list');
    var count = document.getElementById('pending-count');
    var badge = document.getElementById('tab-pending-count');
    el.innerHTML = '<div class="empty">Loading…</div>';

    api('api/admin/pending.php')
      .then(function (data) {
        if (!data.ok) { toast('Failed to load pending requests.'); return; }
        var pending = data.pending;
        count.textContent = pending.length + ' pending';
        count.className   = 'badge ' + (pending.length > 0 ? 'badge-pending' : 'badge-used');
        badge.textContent = pending.length;
        badge.className   = 'tab-badge' + (pending.length > 0 ? ' on' : '');

        if (pending.length === 0) {
          el.innerHTML = '<div class="empty">No pending requests.</div>';
          return;
        }

        el.innerHTML = pending.map(function (u) {
          return '<div class="approval-row">'
            + '<div class="approval-info">'
                + '<strong>' + u.full_name + '</strong>'
                + '<span>'
                    + (u.email || u.phone_number || '')
                    + (u.barangay_name ? ' &mdash; ' + u.barangay_name + (u.barangay_city ? ', ' + u.barangay_city : '') : '')
                + '</span>'
            + '</div>'
            + '<div class="approval-actions">'
                + '<button class="btn-approve" data-id="' + u.id + '">Approve</button>'
                + '<button class="btn-reject"  data-id="' + u.id + '">Reject</button>'
            + '</div>'
          + '</div>';
        }).join('');

        el.querySelectorAll('.btn-approve').forEach(function (btn) {
          btn.addEventListener('click', function () {
            var id = parseInt(this.dataset.id);
            btn.disabled = true;
            api('api/admin/pending.php', {
              method: 'POST', headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ user_id: id, action: 'approve' }),
            }).then(function (data) {
              if (!data.ok) { toast(data.error || 'Failed.'); btn.disabled = false; return; }
              renderPending(); renderOfficials(); toast('Official access granted.');
            });
          });
        });

        el.querySelectorAll('.btn-reject').forEach(function (btn) {
          btn.addEventListener('click', function () {
            var id = parseInt(this.dataset.id);
            btn.disabled = true;
            api('api/admin/pending.php', {
              method: 'POST', headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ user_id: id, action: 'reject' }),
            }).then(function (data) {
              if (!data.ok) { toast(data.error || 'Failed.'); btn.disabled = false; return; }
              renderPending(); toast('Request rejected.');
            });
          });
        });
      })
      .catch(function () { toast('Could not load pending requests.'); });
  }

  /* ── Officials ───────────────────────────────────────────────────────────── */
  function renderOfficials() {
    var el      = document.getElementById('officials-list');
    var countEl = document.getElementById('officials-count');
    el.innerHTML = '<div class="empty">Loading…</div>';

    api('api/admin/officials.php')
      .then(function (data) {
        if (!data.ok) { toast('Failed to load officials.'); return; }
        var officials = data.officials;
        countEl.textContent = officials.length + ' official' + (officials.length !== 1 ? 's' : '');

        if (officials.length === 0) {
          el.innerHTML = '<div class="empty">No approved officials yet.</div>';
          return;
        }

        el.innerHTML = officials.map(function (u) {
          var avatar = u.avatar_path ? '<img src="' + u.avatar_path + '" alt="">' : (u.full_name || '?').charAt(0).toUpperCase();
          return '<div class="officials-row">'
            + '<div class="officials-avatar">' + avatar + '</div>'
            + '<div class="officials-info">'
                + '<strong>' + u.full_name + '</strong>'
                + '<span>'
                    + (u.barangay_name ? u.barangay_name + (u.barangay_city ? ', ' + u.barangay_city : '') : '')
                    + (u.email ? ' &mdash; ' + u.email : '')
                    + (!u.email && u.phone_number ? u.phone_number : '')
                + '</span>'
            + '</div>'
            + '<span class="badge badge-active" style="margin-right:0.5rem">Active</span>'
            + '<button class="btn-revoke" data-id="' + u.id + '">Revoke</button>'
          + '</div>';
        }).join('');

        el.querySelectorAll('[data-id]').forEach(function (btn) {
          btn.addEventListener('click', function () {
            if (!confirm('Revoke official access? This user will revert to resident.')) return;
            var id = parseInt(this.dataset.id);
            btn.disabled = true;
            api('api/admin/officials.php', {
              method: 'POST', headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ user_id: id }),
            }).then(function (data) {
              if (!data.ok) { toast(data.error || 'Failed.'); btn.disabled = false; return; }
              renderOfficials(); toast('Official access revoked.');
            });
          });
        });
      })
      .catch(function () { toast('Could not load officials.'); });
  }

  /* ── Initial load ────────────────────────────────────────────────────────── */
  renderPending();
  renderCodes();
  renderOfficials();

})();
