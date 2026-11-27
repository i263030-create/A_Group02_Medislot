/**
 * MediSlot Doctor Profile page logic:
 * doctor lookup + invalid doctor state, dynamic average rating,
 * About/Reviews tabs, availability calendar, and validated review submission.
 */
(function () {
  'use strict';

  var MS = window.MediSlot;
  var DATA = window.MEDISLOT_DATA || { doctors: [] };

  MS.initShell('doctors', { showBottomBar: true, bottomActive: 'doctors' });

  var params = new URLSearchParams(window.location.search);
  var hasIdParam = params.has('id');
  var requestedId = params.get('id');

  var doctor = null;
  if (!hasIdParam) {
    doctor = DATA.doctors[0] || null;
  } else if (requestedId) {
    doctor = DATA.doctors.find(function (d) {
      return d.id === requestedId;
    }) || null;
  }

  var topNameEl = document.getElementById('profile-top-name');
  var invalidStateEl = document.getElementById('invalid-doctor-state');
  var profileContentEl = document.getElementById('profile-content');

  if (!doctor) {
    topNameEl.textContent = 'Doctor Not Found';
    invalidStateEl.hidden = false;
    profileContentEl.hidden = true;
    return;
  }

  MS.recordRecentlyViewed(doctor.id);

  invalidStateEl.hidden = true;
  profileContentEl.hidden = false;

  document.title = 'MediSlot — ' + doctor.name;
  topNameEl.textContent = doctor.name;

  document.getElementById('profile-avatar-mount').innerHTML = MS.renderAvatarHtml(doctor);
  document.getElementById('profile-name').textContent = doctor.name;
  document.getElementById('profile-specialty').textContent = doctor.speciality;
  document.getElementById('profile-qualifications').textContent = doctor.qualifications;
  document.getElementById('profile-experience').innerHTML = '<strong>' + MS.escapeHtml(doctor.experience) + ' yrs</strong> experience';
  document.getElementById('profile-gender').textContent = doctor.gender;
  document.getElementById('profile-room').textContent = doctor.room;
  document.getElementById('profile-fee').textContent = 'Fee: ' + doctor.consultationFee;

  var bookBtn = document.getElementById('profile-book-btn');
  bookBtn.textContent = 'Book with ' + doctor.name;

  document.getElementById('profile-availability-badge').innerHTML = doctor.availableToday
    ? '<span class="badge badge-today">Available Today</span>'
    : '<span class="badge badge-week">Available This Week</span>';

  document.getElementById('profile-about-me').textContent = doctor.about;
  document.getElementById('profile-languages').textContent = (doctor.languages || ['English']).join(', ');

  document.getElementById('profile-education-list').innerHTML = (doctor.education || [])
    .map(function (item) {
      return '<li>' + MS.escapeHtml(item) + '</li>';
    })
    .join('');

  document.getElementById('profile-services-list').innerHTML = (doctor.services || [])
    .map(function (svc) {
      return '<span class="service-pill">' + MS.escapeHtml(svc) + '</span>';
    })
    .join('');

  // Tabs handling
  var tabAboutBtn = document.getElementById('tab-btn-about');
  var tabReviewsBtn = document.getElementById('tab-btn-reviews');
  var panelAbout = document.getElementById('tab-panel-about');
  var panelReviews = document.getElementById('tab-panel-reviews');

  function activateTab(tabName) {
    var isAbout = tabName === 'about';
    tabAboutBtn.classList.toggle('is-active', isAbout);
    tabAboutBtn.setAttribute('aria-selected', String(isAbout));
    panelAbout.hidden = !isAbout;

    tabReviewsBtn.classList.toggle('is-active', !isAbout);
    tabReviewsBtn.setAttribute('aria-selected', String(!isAbout));
    panelReviews.hidden = isAbout;
  }

  tabAboutBtn.addEventListener('click', function () {
    activateTab('about');
  });
  tabReviewsBtn.addEventListener('click', function () {
    activateTab('reviews');
  });

  // Reviews & Dynamic Rating Rendering
  function renderReviewsSection() {
    var reviews = MS.getDoctorReviews(doctor);
    var stats = MS.calculateAverageRating(reviews);

    document.getElementById('reviews-tab-count').textContent = String(stats.count);

    var headerRatingEl = document.getElementById('profile-rating-summary');
    var summaryBoxEl = document.getElementById('reviews-summary-box');
    var listContainer = document.getElementById('reviews-list-container');

    if (stats.count === 0) {
      headerRatingEl.innerHTML =
        MS.renderStarsHtml(0, 'No reviews yet') +
        ' <span style="color:var(--text-muted);">No reviews yet</span>';

      summaryBoxEl.innerHTML =
        '<div>' +
        '  <div class="reviews-avg-score">0.0</div>' +
        '  <div style="font-size:0.85rem;color:var(--text-muted);">0 patient reviews</div>' +
        '</div>' +
        MS.renderStarsHtml(0, '0 out of 5 stars');

      listContainer.innerHTML =
        '<div class="no-reviews-box">' +
        '  <strong>No reviews yet</strong>' +
        '  <p style="margin:6px 0 0;">Be the first patient to share a review for ' +
        MS.escapeHtml(doctor.name) +
        '.</p>' +
        '</div>';
      return;
    }

    headerRatingEl.innerHTML =
      '<span class="doctor-rating-inline">' +
      MS.renderStarsHtml(stats.average, stats.average + ' out of 5 stars') +
      '<span>' +
      stats.average.toFixed(1) +
      '</span>' +
      '<span class="doctor-rating-count">(' +
      stats.count +
      ' review' +
      (stats.count === 1 ? '' : 's') +
      ')</span></span>';

    summaryBoxEl.innerHTML =
      '<div>' +
      '  <div class="reviews-avg-score">' +
      stats.average.toFixed(1) +
      ' <span style="font-size:0.95rem;font-weight:500;color:var(--text-muted);">/ 5.0</span></div>' +
      '  <div style="font-size:0.85rem;color:var(--text-secondary);">Based on ' +
      stats.count +
      ' patient review' +
      (stats.count === 1 ? '' : 's') +
      '</div>' +
      '</div>' +
      MS.renderStarsHtml(stats.average, stats.average + ' out of 5 stars');

    listContainer.innerHTML =
      '<div class="reviews-list">' +
      reviews
        .map(function (rev) {
          return (
            '<article class="review-item">' +
            '  <div class="review-item-head">' +
            '    <div>' +
            '      <span class="review-author">' +
            MS.escapeHtml(rev.author) +
            '</span> ' +
            MS.renderStarsHtml(rev.rating, rev.rating + ' out of 5 stars') +
            '    </div>' +
            '    <span class="review-date">' +
            MS.escapeHtml(rev.date) +
            '</span>' +
            '  </div>' +
            '  <p class="review-comment">' +
            MS.escapeHtml(rev.comment) +
            '</p>' +
            '</article>'
          );
        })
        .join('') +
      '</div>';
  }

  renderReviewsSection();

  // Star Picker + Review Form Validation
  var selectedRating = 0;
  var starButtons = Array.prototype.slice.call(document.querySelectorAll('.star-pick-btn'));
  var starSvg =
    '<svg width="24" height="24" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">' +
    '<path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.966a1 1 0 00.95.69h4.17c.969 0 1.371 1.24.588 1.81l-3.374 2.452a1 1 0 00-.364 1.118l1.287 3.966c.3.921-.755 1.688-1.538 1.118l-3.374-2.452a1 1 0 00-1.176 0l-3.374 2.452c-.783.57-1.838-.197-1.538-1.118l1.287-3.966a1 1 0 00-.364-1.118L2.05 9.393c-.783-.57-.38-1.81.588-1.81h4.17a1 1 0 00.95-.69l1.291-3.966z"/></svg>';

  function updateStarPickerUI(value) {
    starButtons.forEach(function (btn) {
      var val = Number(btn.getAttribute('data-rating-value'));
      var active = val <= value;
      btn.classList.toggle('is-active', active);
      btn.setAttribute('aria-checked', String(val === selectedRating));
    });
  }

  starButtons.forEach(function (btn) {
    btn.innerHTML = starSvg;
    btn.addEventListener('click', function () {
      selectedRating = Number(btn.getAttribute('data-rating-value'));
      updateStarPickerUI(selectedRating);
      document.getElementById('review-rating-error').textContent = '';
    });
    btn.addEventListener('mouseenter', function () {
      updateStarPickerUI(Number(btn.getAttribute('data-rating-value')));
    });
  });

  document.getElementById('star-picker').addEventListener('mouseleave', function () {
    updateStarPickerUI(selectedRating);
  });

  var reviewForm = document.getElementById('review-form');
  var nameInput = document.getElementById('reviewer-name');
  var commentInput = document.getElementById('review-comment');
  var nameErr = document.getElementById('reviewer-name-error');
  var ratingErr = document.getElementById('review-rating-error');
  var commentErr = document.getElementById('review-comment-error');
  var submitFeedback = document.getElementById('review-submit-feedback');

  reviewForm.addEventListener('submit', function (e) {
    e.preventDefault();
    submitFeedback.textContent = '';

    var nameVal = nameInput.value.trim();
    var commentVal = commentInput.value.trim();
    var valid = true;

    if (nameVal.length < 2) {
      nameErr.textContent = 'Please enter your name (at least 2 characters).';
      nameInput.classList.add('is-invalid');
      nameInput.setAttribute('aria-invalid', 'true');
      valid = false;
    } else {
      nameErr.textContent = '';
      nameInput.classList.remove('is-invalid');
      nameInput.removeAttribute('aria-invalid');
    }

    if (selectedRating < 1 || selectedRating > 5) {
      ratingErr.textContent = 'Please select a star rating from 1 to 5.';
      valid = false;
    } else {
      ratingErr.textContent = '';
    }

    if (commentVal.length < 10) {
      commentErr.textContent = 'Please write at least 10 characters about your visit.';
      commentInput.classList.add('is-invalid');
      commentInput.setAttribute('aria-invalid', 'true');
      valid = false;
    } else {
      commentErr.textContent = '';
      commentInput.classList.remove('is-invalid');
      commentInput.removeAttribute('aria-invalid');
    }

    if (!valid) return;

    var todayIso = new Date().toISOString().slice(0, 10);
    MS.addDoctorReview(doctor.id, {
      id: 'rev-user-' + Date.now(),
      author: nameVal,
      rating: selectedRating,
      date: todayIso,
      comment: commentVal
    });

    nameInput.value = '';
    commentInput.value = '';
    selectedRating = 0;
    updateStarPickerUI(0);

    renderReviewsSection();
    submitFeedback.textContent = 'Thank you! Your review has been saved.';
    MS.showToast('Review added for ' + doctor.name);
  });

  // Availability Calendar
  var daysGrid = document.getElementById('calendar-days-grid');
  var slotsGrid = document.getElementById('calendar-slots-grid');
  var slotsDateLabel = document.getElementById('slots-date-label');
  var calendarBookBtn = document.getElementById('calendar-book-btn');

  var scheduleByOffset = {};
  (doctor.scheduleOffsets || []).forEach(function (entry) {
    scheduleByOffset[entry.dayOffset] = entry.slots;
  });

  var calendarDays = [];
  var baseDate = new Date();
  var dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  var monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  for (var offset = 0; offset < 8; offset++) {
    var d = new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate() + offset);
    var slots = scheduleByOffset[offset] || [];
    calendarDays.push({
      offset: offset,
      dayName: offset === 0 ? 'Today' : dayNames[d.getDay()],
      dayNum: d.getDate(),
      fullLabel: monthNames[d.getMonth()] + ' ' + d.getDate() + ', ' + d.getFullYear(),
      slots: slots
    });
  }

  var firstAvailable = calendarDays.find(function (day) {
    return day.slots.length > 0;
  });
  var selectedDayOffset = firstAvailable ? firstAvailable.offset : 0;
  var selectedSlot = firstAvailable && firstAvailable.slots[0] ? firstAvailable.slots[0] : '';

  function getSelectedSlotSummary() {
    var dayObj = calendarDays.find(function (day) {
      return day.offset === selectedDayOffset;
    });
    if (!dayObj || !selectedSlot) return '';
    return dayObj.fullLabel + ' at ' + selectedSlot;
  }

  function renderCalendar() {
    daysGrid.innerHTML = calendarDays
      .map(function (day) {
        var hasSlots = day.slots.length > 0;
        var isSelected = day.offset === selectedDayOffset && hasSlots;
        return (
          '<button type="button" class="cal-day-btn' +
          (isSelected ? ' is-selected' : '') +
          '" data-day-offset="' +
          day.offset +
          '"' +
          (hasSlots ? '' : ' disabled') +
          ' aria-pressed="' +
          String(isSelected) +
          '">' +
          '<span class="cal-day-name">' +
          MS.escapeHtml(day.dayName) +
          '</span>' +
          '<span class="cal-day-num">' +
          MS.escapeHtml(day.dayNum) +
          '</span>' +
          '</button>'
        );
      })
      .join('');

    var activeDay = calendarDays.find(function (day) {
      return day.offset === selectedDayOffset;
    });

    if (!activeDay || activeDay.slots.length === 0) {
      slotsDateLabel.textContent = 'No slots available';
      slotsGrid.innerHTML = '<p class="calendar-sub" style="grid-column:1/-1;margin:0;">Please select another date.</p>';
      calendarBookBtn.disabled = true;
      return;
    }

    slotsDateLabel.textContent = 'Slots for ' + activeDay.fullLabel;
    calendarBookBtn.disabled = false;
    if (activeDay.slots.indexOf(selectedSlot) === -1) {
      selectedSlot = activeDay.slots[0];
    }

    slotsGrid.innerHTML = activeDay.slots
      .map(function (slot) {
        var active = slot === selectedSlot;
        return (
          '<button type="button" class="slot-btn' +
          (active ? ' is-selected' : '') +
          '" data-slot-time="' +
          MS.escapeHtml(slot) +
          '" aria-pressed="' +
          String(active) +
          '">' +
          MS.escapeHtml(slot) +
          '</button>'
        );
      })
      .join('');
  }

  daysGrid.addEventListener('click', function (e) {
    var btn = e.target.closest('[data-day-offset]');
    if (!btn || btn.disabled) return;
    selectedDayOffset = Number(btn.getAttribute('data-day-offset'));
    var dayObj = calendarDays.find(function (day) {
      return day.offset === selectedDayOffset;
    });
    selectedSlot = dayObj && dayObj.slots[0] ? dayObj.slots[0] : '';
    renderCalendar();
  });

  slotsGrid.addEventListener('click', function (e) {
    var btn = e.target.closest('[data-slot-time]');
    if (!btn) return;
    selectedSlot = btn.getAttribute('data-slot-time');
    renderCalendar();
  });

  bookBtn.addEventListener('click', function () {
    MS.openBookingModal(doctor.name, getSelectedSlotSummary());
  });

  calendarBookBtn.addEventListener('click', function () {
    MS.openBookingModal(doctor.name, getSelectedSlotSummary());
  });

  renderCalendar();
})();
