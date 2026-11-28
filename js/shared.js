/**
 * MediSlot shared header, navigation, footer, mobile bottom bar,
 * rating helpers, and booking modal utilities.
 */
(function (global) {
  'use strict';

  var REVIEWS_STORAGE_KEY = 'medislot_saved_reviews_v1';
  var RECENT_STORAGE_KEY = 'medislot_recently_viewed_v1';
  var FILTERS_STORAGE_KEY = 'medislot_saved_filters_v1';

  function escapeHtml(str) {
    return String(str == null ? '' : str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function safeReadStorage(key, fallback) {
    try {
      var raw = global.localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (err) {
      return fallback;
    }
  }

  function safeWriteStorage(key, value) {
    try {
      global.localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (err) {
      return false;
    }
  }

  function getSavedReviewsMap() {
    var map = safeReadStorage(REVIEWS_STORAGE_KEY, {});
    return map && typeof map === 'object' ? map : {};
  }

  function getDoctorReviews(doctor) {
    if (!doctor) return [];
    var base = Array.isArray(doctor.reviews) ? doctor.reviews : [];
    var savedMap = getSavedReviewsMap();
    var saved = Array.isArray(savedMap[doctor.id]) ? savedMap[doctor.id] : [];
    return saved.concat(base);
  }

  function addDoctorReview(doctorId, review) {
    var savedMap = getSavedReviewsMap();
    var current = Array.isArray(savedMap[doctorId]) ? savedMap[doctorId] : [];
    savedMap[doctorId] = [review].concat(current);
    safeWriteStorage(REVIEWS_STORAGE_KEY, savedMap);
    return savedMap[doctorId];
  }

  function calculateAverageRating(reviews) {
    if (!Array.isArray(reviews) || reviews.length === 0) {
      return { average: 0, count: 0 };
    }
    var total = reviews.reduce(function (sum, item) {
      return sum + (Number(item.rating) || 0);
    }, 0);
    return {
      average: Math.round((total / reviews.length) * 10) / 10,
      count: reviews.length
    };
  }

  function renderStarsHtml(ratingValue, label) {
    var rounded = Math.round(Number(ratingValue) || 0);
    var stars = '';
    for (var i = 1; i <= 5; i++) {
      var cls = i <= rounded ? 'star-icon star-filled' : 'star-icon star-empty';
      stars +=
        '<svg class="' +
        cls +
        '" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">' +
        '<path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.966a1 1 0 00.95.69h4.17c.969 0 1.371 1.24.588 1.81l-3.374 2.452a1 1 0 00-.364 1.118l1.287 3.966c.3.921-.755 1.688-1.538 1.118l-3.374-2.452a1 1 0 00-1.176 0l-3.374 2.452c-.783.57-1.838-.197-1.538-1.118l1.287-3.966a1 1 0 00-.364-1.118L2.05 9.393c-.783-.57-.38-1.81.588-1.81h4.17a1 1 0 00.95-.69l1.291-3.966z"/></svg>';
    }
    var aria = label ? ' aria-label="' + escapeHtml(label) + '"' : '';
    return '<span class="star-row"' + aria + '>' + stars + '</span>';
  }

  function renderAvatarHtml(doctor) {
    return (
      '<div class="doctor-avatar" aria-hidden="true">' +
      '<svg width="34" height="34" viewBox="0 0 24 24" fill="currentColor">' +
      '<path d="M12 12a4.5 4.5 0 100-9 4.5 4.5 0 000 9zm0 2c-4.418 0-8 2.239-8 5v1h16v-1c0-2.761-3.582-5-8-5z"/>' +
      '</svg>' +
      '<span class="doctor-avatar-initials">' +
      escapeHtml(doctor.initials || 'MD') +
      '</span>' +
      '</div>'
    );
  }

  function getRecentlyViewedIds() {
    var list = safeReadStorage(RECENT_STORAGE_KEY, []);
    return Array.isArray(list) ? list : [];
  }

  function recordRecentlyViewed(doctorId) {
    if (!doctorId) return;
    var existing = getRecentlyViewedIds().filter(function (id) {
      return id !== doctorId;
    });
    var updated = [doctorId].concat(existing).slice(0, 4);
    safeWriteStorage(RECENT_STORAGE_KEY, updated);
  }

  function clearRecentlyViewed() {
    safeWriteStorage(RECENT_STORAGE_KEY, []);
  }

  function showToast(message) {
    var toast = document.getElementById('medislot-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'medislot-toast';
      toast.className = 'toast-banner';
      toast.setAttribute('role', 'status');
      toast.setAttribute('aria-live', 'polite');
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add('is-visible');
    clearTimeout(toast._hideTimer);
    toast._hideTimer = setTimeout(function () {
      toast.classList.remove('is-visible');
    }, 3200);
  }

  function openBookingModal(doctorName, slotText) {
    var backdrop = document.getElementById('medislot-booking-modal');
    if (!backdrop) return;
    var docInput = document.getElementById('booking-doctor-select');
    var slotInfo = document.getElementById('booking-slot-summary');
    var form = document.getElementById('booking-modal-form');
    var successBox = document.getElementById('booking-modal-success');

    if (form) form.hidden = false;
    if (successBox) successBox.hidden = true;

    if (docInput && doctorName) {
      for (var i = 0; i < docInput.options.length; i++) {
        if (docInput.options[i].value === doctorName) {
          docInput.selectedIndex = i;
          break;
        }
      }
    }
    if (slotInfo) {
      slotInfo.textContent = slotText ? 'Selected time: ' + slotText : 'Choose your preferred clinic date & slot.';
    }
    backdrop.classList.add('is-open');
    backdrop.setAttribute('aria-hidden', 'false');
    var closeBtn = backdrop.querySelector('.modal-close');
    if (closeBtn) closeBtn.focus();
  }

  function closeBookingModal() {
    var backdrop = document.getElementById('medislot-booking-modal');
    if (!backdrop) return;
    backdrop.classList.remove('is-open');
    backdrop.setAttribute('aria-hidden', 'true');
  }

  function initShell(activeNav, options) {
    options = options || {};
    var headerMount = document.getElementById('site-header-mount');
    var footerMount = document.getElementById('site-footer-mount');
    var bottomMount = document.getElementById('mobile-bottom-bar-mount');

    var navItems = [
      { key: 'home', label: 'Home', href: 'departments.html', externalNotice: false },
      { key: 'doctors', label: 'Doctors', href: 'doctors.html', externalNotice: false },
      { key: 'services', label: 'Services & Fees', href: 'departments.html#departments-grid', externalNotice: false },
      { key: 'book', label: 'Book Appointment', href: '#book-appointment', action: 'book' },
      { key: 'account', label: 'My Account', href: '#my-account', action: 'account' },
      { key: 'health-hub', label: 'Health Hub', href: 'departments.html#health-hub', externalNotice: false }
    ];

    if (headerMount) {
      var linksHtml = navItems
        .map(function (item) {
          var cls = 'nav-link' + (item.key === activeNav ? ' is-active' : '');
          var actionAttr = item.action ? ' data-shell-action="' + item.action + '"' : '';
          return '<a class="' + cls + '" href="' + item.href + '"' + actionAttr + '>' + item.label + '</a>';
        })
        .join('');

      headerMount.innerHTML =
        '<header class="site-header">' +
        '  <div class="container header-inner">' +
        '    <a class="brand-logo" href="doctors.html" aria-label="MediSlot Home">' +
        '      <img src="images/logo.png" alt="MediSlot logo" class="brand-logo-img">' +
        '    </a>' +
        '    <nav class="main-nav" aria-label="Primary Navigation">' +
        linksHtml +
        '    </nav>' +
        '    <div class="header-actions">' +
        '      <button type="button" class="btn btn-primary header-book-desktop" data-shell-action="book">Book Now</button>' +
        '      <button type="button" class="hamburger-btn" id="hamburger-toggle" aria-expanded="false" aria-controls="mobile-nav-drawer" aria-label="Toggle navigation menu">' +
        '        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">' +
        '          <path d="M4 7h16M4 12h16M4 17h16"/>' +
        '        </svg>' +
        '      </button>' +
        '    </div>' +
        '  </div>' +
        '  <div class="mobile-drawer" id="mobile-nav-drawer">' +
        '    <nav class="mobile-nav-list" aria-label="Mobile Navigation">' +
        linksHtml +
        '    </nav>' +
        '    <button type="button" class="btn btn-primary mobile-drawer-cta" data-shell-action="book">Book Now</button>' +
        '  </div>' +
        '</header>';
    }

    if (footerMount) {
      footerMount.innerHTML =
        '<footer class="site-footer">' +
        '  <div class="container footer-inner">' +
        '    <p class="footer-copy">&copy; MediSlot 2026. All rights reserved. 123 Clinic, Street No. 5, Health City, HC 90210 | (555) 123-4567 | Mon-Sat 8 AM-8 PM</p>' +
        '    <!-- Logo attribution placeholder: add "Logo generated using AI tools" once tool name is provided -->' +
        '    <div class="footer-links">' +
        '      <a href="doctors.html">Doctors</a>' +
        '      <a href="departments.html">Departments</a>' +
        '    </div>' +
        '  </div>' +
        '</footer>';
    }

    if (options.showBottomBar && bottomMount) {
      document.body.classList.add('has-bottom-bar');
      var bottomActive = options.bottomActive || activeNav;
      bottomMount.innerHTML =
        '<nav class="mobile-bottom-bar" aria-label="Mobile Quick Navigation">' +
        '  <a class="bottom-bar-item' + (bottomActive === 'home' ? ' is-active' : '') + '" href="departments.html">' +
        '    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 10.5L12 3l9 7.5V20a1 1 0 01-1 1h-5v-6H9v6H4a1 1 0 01-1-1v-9.5z"/></svg>' +
        '    <span>Home</span>' +
        '  </a>' +
        '  <a class="bottom-bar-item' + (bottomActive === 'doctors' ? ' is-active' : '') + '" href="doctors.html">' +
        '    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="7" r="4"/><path d="M5.5 21a6.5 6.5 0 0113 0"/></svg>' +
        '    <span>Doctors</span>' +
        '  </a>' +
        '  <button type="button" class="bottom-bar-item" data-shell-action="book">' +
        '    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>' +
        '    <span>Appointments</span>' +
        '  </button>' +
        '  <button type="button" class="bottom-bar-item" data-shell-action="account">' +
        '    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>' +
        '    <span>Account</span>' +
        '  </button>' +
        '</nav>';
    }

    // Inject shared quick-booking modal
    if (!document.getElementById('medislot-booking-modal')) {
      var doctors = (global.MEDISLOT_DATA && global.MEDISLOT_DATA.doctors) || [];
      var doctorOpts = doctors
        .map(function (doc) {
          return '<option value="' + escapeHtml(doc.name) + '">' + escapeHtml(doc.name + ' (' + doc.speciality + ')') + '</option>';
        })
        .join('');

      var modalEl = document.createElement('div');
      modalEl.id = 'medislot-booking-modal';
      modalEl.className = 'modal-backdrop';
      modalEl.setAttribute('aria-hidden', 'true');
      modalEl.innerHTML =
        '<div class="modal-card" role="dialog" aria-modal="true" aria-labelledby="booking-modal-title">' +
        '  <div class="modal-head">' +
        '    <h2 id="booking-modal-title">Book Appointment</h2>' +
        '    <button type="button" class="modal-close" id="booking-modal-close" aria-label="Close">&times;</button>' +
        '  </div>' +
        '  <p id="booking-slot-summary" class="calendar-sub"></p>' +
        '  <form id="booking-modal-form">' +
        '    <div class="form-field">' +
        '      <label for="booking-doctor-select">Doctor</label>' +
        '      <select id="booking-doctor-select" class="form-input">' +
        doctorOpts +
        '      </select>' +
        '    </div>' +
        '    <div class="form-field">' +
        '      <label for="booking-patient-name">Patient Name</label>' +
        '      <input id="booking-patient-name" class="form-input" type="text" required placeholder="Enter full name">' +
        '    </div>' +
        '    <div class="form-field">' +
        '      <label for="booking-patient-phone">Phone Number</label>' +
        '      <input id="booking-patient-phone" class="form-input" type="tel" required placeholder="(555) 000-0000">' +
        '    </div>' +
        '    <button type="submit" class="btn btn-primary" style="width:100%;">Confirm Appointment</button>' +
        '  </form>' +
        '  <div id="booking-modal-success" hidden>' +
        '    <p style="color:var(--primary);font-weight:600;margin-top:0;">Appointment request confirmed!</p>' +
        '    <p id="booking-confirm-text" class="calendar-sub"></p>' +
        '    <button type="button" class="btn btn-outline" id="booking-done-btn" style="width:100%;">Done</button>' +
        '  </div>' +
        '</div>';
      document.body.appendChild(modalEl);

      document.getElementById('booking-modal-close').addEventListener('click', closeBookingModal);
      document.getElementById('booking-done-btn').addEventListener('click', closeBookingModal);
      modalEl.addEventListener('click', function (e) {
        if (e.target === modalEl) closeBookingModal();
      });
      document.getElementById('booking-modal-form').addEventListener('submit', function (e) {
        e.preventDefault();
        var docName = document.getElementById('booking-doctor-select').value;
        var patient = document.getElementById('booking-patient-name').value.trim();
        if (!patient) return;
        document.getElementById('booking-modal-form').hidden = true;
        document.getElementById('booking-modal-success').hidden = false;
        document.getElementById('booking-confirm-text').textContent =
          'We have reserved a slot for ' + patient + ' with ' + docName + '.';
      });
    }

    // Hamburger toggle
    var hamburger = document.getElementById('hamburger-toggle');
    var drawer = document.getElementById('mobile-nav-drawer');
    if (hamburger && drawer) {
      hamburger.addEventListener('click', function () {
        var next = !drawer.classList.contains('is-open');
        drawer.classList.toggle('is-open', next);
        hamburger.setAttribute('aria-expanded', String(next));
      });
    }

    // Delegate shell actions (Book Now, My Account)
    document.addEventListener('click', function (e) {
      var trigger = e.target.closest('[data-shell-action]');
      if (!trigger) return;
      var action = trigger.getAttribute('data-shell-action');
      if (action === 'book') {
        e.preventDefault();
        openBookingModal(trigger.getAttribute('data-doctor') || '', trigger.getAttribute('data-slot') || '');
      } else if (action === 'account') {
        e.preventDefault();
        showToast('My Account portal is managed by the patient portal module.');
      }
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        closeBookingModal();
        if (drawer && drawer.classList.contains('is-open')) {
          drawer.classList.remove('is-open');
          if (hamburger) hamburger.setAttribute('aria-expanded', 'false');
        }
      }
    });
  }

  global.MediSlot = {
    FILTERS_STORAGE_KEY: FILTERS_STORAGE_KEY,
    escapeHtml: escapeHtml,
    safeReadStorage: safeReadStorage,
    safeWriteStorage: safeWriteStorage,
    getDoctorReviews: getDoctorReviews,
    addDoctorReview: addDoctorReview,
    calculateAverageRating: calculateAverageRating,
    renderStarsHtml: renderStarsHtml,
    renderAvatarHtml: renderAvatarHtml,
    getRecentlyViewedIds: getRecentlyViewedIds,
    recordRecentlyViewed: recordRecentlyViewed,
    clearRecentlyViewed: clearRecentlyViewed,
    showToast: showToast,
    openBookingModal: openBookingModal,
    initShell: initShell
  };
})(typeof window !== 'undefined' ? window : globalThis);
