(function () {

  /* ── Auth guard ──────────────────────────────────────────────────────────── */
  var raw  = localStorage.getItem('agapalert_user');
  var user = null;
  try { user = JSON.parse(raw); } catch (e) {}
  if (!user) { window.location.href = 'login.html'; return; }

  /* ── Theme ───────────────────────────────────────────────────────────────── */
  var root     = document.documentElement;
  var themeBtn = document.getElementById('theme-btn');

  function applyTheme(dark) {
    root.setAttribute('data-theme', dark ? 'dark' : 'light');
    themeBtn.innerHTML = dark
      ? '<svg class="i"><use href="#i-sun"/></svg>'
      : '<svg class="i"><use href="#i-moon"/></svg>';
    try { localStorage.setItem('agapalert_theme', dark ? 'dark' : 'light'); } catch (e) {}
  }

  var saved = localStorage.getItem('agapalert_theme');
  applyTheme(saved ? saved === 'dark' : true);
  themeBtn.addEventListener('click', function () {
    applyTheme(root.getAttribute('data-theme') !== 'dark');
  });

  /* ── Header chip ─────────────────────────────────────────────────────────── */
  var chip = document.getElementById('user-chip');
  document.getElementById('user-role').textContent =
    user.role === 'admin'    ? 'Administrator' :
    user.role === 'official' ? (user.status === 'pending' ? 'Official (pending)' : 'Barangay official') :
    'Resident';
  chip.style.display = 'flex';

  document.getElementById('signout-btn').addEventListener('click', function () {
    fetch('api/logout.php', { method: 'POST', credentials: 'same-origin' })
      .finally(function () {
        localStorage.removeItem('agapalert_user');
        window.location.href = 'login.html';
      });
  });

  /* ── Settings dropdown ───────────────────────────────────────────────────── */
  var settingsBtn      = document.getElementById('settings-btn');
  var settingsDropdown = document.getElementById('settings-dropdown');

  settingsBtn.addEventListener('click', function (e) {
    e.stopPropagation();
    var open = settingsDropdown.classList.toggle('open');
    settingsBtn.setAttribute('aria-expanded', String(open));
  });

  document.addEventListener('click', function (e) {
    if (!settingsDropdown.contains(e.target) && e.target !== settingsBtn) {
      settingsDropdown.classList.remove('open');
      settingsBtn.setAttribute('aria-expanded', 'false');
    }
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      settingsDropdown.classList.remove('open');
      settingsBtn.setAttribute('aria-expanded', 'false');
    }
  });

  /* ── Chip avatar ─────────────────────────────────────────────────────────── */
  function updateChipAvatar() {
    var nameEl    = document.getElementById('user-name');
    var avatarSrc = user.avatar_path || null;
    if (avatarSrc) {
      nameEl.innerHTML = '<img src="' + avatarSrc + '" alt="" style="width:26px;height:26px;border-radius:50%;object-fit:cover;vertical-align:middle;margin-right:4px">' + (user.full_name || '');
    } else {
      nameEl.textContent = user.full_name || '';
    }
  }
  updateChipAvatar();

  /* ── Populate fields ─────────────────────────────────────────────────────── */
  function populate() {
    var initial   = (user.full_name || '?').charAt(0).toUpperCase();
    var avatarEl  = document.getElementById('avatar-el');
    var initialEl = document.getElementById('avatar-initial');
    var removeBtn = document.getElementById('avatar-remove');
    var avatarSrc = user.avatar_path || null;

    if (avatarSrc) {
      initialEl.style.display = 'none';
      var existImg = avatarEl.querySelector('img');
      if (!existImg) {
        var img = document.createElement('img');
        img.alt = user.full_name || '';
        avatarEl.appendChild(img);
        existImg = img;
      }
      existImg.src = avatarSrc;
      removeBtn.style.display = 'block';
    } else {
      initialEl.style.display = '';
      initialEl.textContent   = initial;
      var oldImg = avatarEl.querySelector('img');
      if (oldImg) oldImg.remove();
      removeBtn.style.display = 'none';
    }

    document.getElementById('display-name').textContent = user.full_name || '—';
    document.getElementById('display-sub').textContent  =
      (user.barangay_name ? user.barangay_name + (user.barangay_city ? ', ' + user.barangay_city : '') : '')
      || (user.email || user.phone_number || '');

    var badge   = document.getElementById('role-badge');
    var isAdmin = user.role === 'admin';
    var isOff   = user.role === 'official';
    var isPend  = isOff && user.status === 'pending';
    badge.textContent = isAdmin ? 'Administrator' : isPend ? 'Official — pending' : isOff ? 'Barangay official' : 'Resident';
    badge.className   = 'role-badge ' + (isAdmin ? 'role-admin' : isPend ? 'role-pending' : isOff ? 'role-official' : 'role-resident');

    document.getElementById('pending-notice').style.display  = isPend             ? '' : 'none';
    document.getElementById('official-notice').style.display = (isOff && !isPend) ? '' : 'none';

    document.getElementById('pf-name').value  = user.full_name    || '';
    document.getElementById('pf-phone').value = user.phone_number || '';
    document.getElementById('pf-email').value = user.email        || '';
    document.getElementById('pf-brgy').value  = user.barangay_id  ? String(user.barangay_id) : '';
  }

  populate();

  /* ── Avatar upload ───────────────────────────────────────────────────────── */
  document.getElementById('avatar-input').addEventListener('change', function () {
    var file = this.files[0];
    if (!file) return;
    if (file.size > 4 * 1024 * 1024) { alert('Image must be under 4 MB.'); return; }

    var formData = new FormData();
    formData.append('avatar', file);

    fetch('api/profile/avatar.php', { method: 'POST', credentials: 'same-origin', body: formData })
      .then(function (r) { return r.json(); })
      .then(function (data) {
        if (!data.ok) { alert(data.error || 'Upload failed.'); return; }
        user.avatar_path = data.avatar_path;
        localStorage.setItem('agapalert_user', JSON.stringify(user));
        populate();
        updateChipAvatar();
      })
      .catch(function () { alert('Upload failed. Check your connection.'); });

    this.value = '';
  });

  document.getElementById('avatar-remove').addEventListener('click', function () {
    fetch('api/profile/avatar.php', { method: 'DELETE', credentials: 'same-origin' })
      .then(function (r) { return r.json(); })
      .then(function (data) {
        if (!data.ok) return;
        user.avatar_path = null;
        localStorage.setItem('agapalert_user', JSON.stringify(user));
        populate();
        updateChipAvatar();
      });
  });

  document.getElementById('avatar-el').addEventListener('click', function () {
    document.getElementById('avatar-input').click();
  });

  /* ── Validation helpers ──────────────────────────────────────────────────── */
  function showErr(id, msg) {
    var el = document.getElementById('err-' + id);
    if (!el) return;
    el.textContent   = msg;
    el.style.display = msg ? 'block' : 'none';
    var inp = document.getElementById('pf-' + id);
    if (inp) inp.classList.toggle('error', !!msg);
  }
  function clearErrs(ids) { ids.forEach(function (id) { showErr(id, ''); }); }

  function flashStatus(id) {
    var el = document.getElementById(id);
    el.classList.add('on');
    setTimeout(function () { el.classList.remove('on'); }, 2500);
  }

  /* ── Save personal info ──────────────────────────────────────────────────── */
  document.getElementById('save-info').addEventListener('click', function () {
    clearErrs(['name', 'phone', 'email', 'brgy']);

    var name  = document.getElementById('pf-name').value.trim();
    var phone = document.getElementById('pf-phone').value.trim();
    var email = document.getElementById('pf-email').value.trim().toLowerCase();
    var brgy  = document.getElementById('pf-brgy').value;
    var ok    = true;

    if (name.length < 2) { showErr('name', 'Enter your full name.'); ok = false; }
    if (phone && !/^[0-9+()\-\s]{7,40}$/.test(phone)) { showErr('phone', 'Mobile number looks invalid.'); ok = false; }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { showErr('email', 'Email address looks invalid.'); ok = false; }
    if (!brgy) { showErr('brgy', 'Select your barangay.'); ok = false; }
    if (!ok) return;

    var btn  = document.getElementById('save-info');
    btn.disabled = true;

    fetch('api/profile/update.php', {
      method:      'POST',
      credentials: 'same-origin',
      headers:     { 'Content-Type': 'application/json' },
      body:        JSON.stringify({ full_name: name, phone_number: phone || null, email: email || null, barangay_id: parseInt(brgy, 10) }),
    })
      .then(function (r) { return r.json(); })
      .then(function (data) {
        btn.disabled = false;
        if (!data.ok) {
          if (data.errors) Object.keys(data.errors).forEach(function (f) { showErr(f === 'phone_number' ? 'phone' : f, data.errors[f]); });
          return;
        }
        user = data.user;
        localStorage.setItem('agapalert_user', JSON.stringify(user));
        populate();
        updateChipAvatar();
        flashStatus('info-saved');
      })
      .catch(function () { btn.disabled = false; showErr('name', 'Could not reach the server.'); });
  });

  /* ── Save password ───────────────────────────────────────────────────────── */
  document.getElementById('save-pw').addEventListener('click', function () {
    clearErrs(['pw1', 'pw2']);
    var pw1 = document.getElementById('pf-pw1').value;
    var pw2 = document.getElementById('pf-pw2').value;
    var ok  = true;

    if (!pw1 || pw1.length < 8) { showErr('pw1', 'Must be at least 8 characters.'); ok = false; }
    if (pw1 !== pw2)             { showErr('pw2', 'Passwords do not match.');        ok = false; }
    if (!ok) return;

    var btn  = document.getElementById('save-pw');
    btn.disabled = true;

    fetch('api/profile/password.php', {
      method:      'POST',
      credentials: 'same-origin',
      headers:     { 'Content-Type': 'application/json' },
      body:        JSON.stringify({ password: pw1, password_confirm: pw2 }),
    })
      .then(function (r) { return r.json(); })
      .then(function (data) {
        btn.disabled = false;
        if (!data.ok) {
          if (data.errors) Object.keys(data.errors).forEach(function (f) { showErr(f, data.errors[f]); });
          return;
        }
        document.getElementById('pf-pw1').value = '';
        document.getElementById('pf-pw2').value = '';
        flashStatus('pw-saved');
      })
      .catch(function () { btn.disabled = false; showErr('pw1', 'Could not reach the server.'); });
  });

  /* ── Sign out ────────────────────────────────────────────────────────────── */
  document.getElementById('signout-page').addEventListener('click', function () {
    fetch('api/logout.php', { method: 'POST', credentials: 'same-origin' })
      .finally(function () {
        localStorage.removeItem('agapalert_user');
        window.location.href = 'login.html';
      });
  });

  /* ── Delete account ──────────────────────────────────────────────────────── */
  document.getElementById('delete-account').addEventListener('click', function () {
    if (!confirm('Delete your account? This cannot be undone.')) return;
    fetch('api/logout.php', { method: 'POST', credentials: 'same-origin' })
      .finally(function () {
        localStorage.removeItem('agapalert_user');
        window.location.href = 'login.html';
      });
  });

})();
