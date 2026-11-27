/**
 * MediSlot Doctors Directory page logic:
 * filtering, search, sorting, removable filter chips, saved filters,
 * dynamic rating calculation, and recently viewed persistence.
 */
(function () {
  'use strict';

  var MS = window.MediSlot;
  var DATA = window.MEDISLOT_DATA || { doctors: [] };

  MS.initShell('doctors', { showBottomBar: false });

  var searchInput = document.getElementById('doctor-search');
  var sortSelect = document.getElementById('doctor-sort');
  var gridEl = document.getElementById('doctors-grid');
  var emptyEl = document.getElementById('empty-results-state');
  var countEl = document.getElementById('results-count');
  var chipsBar = document.getElementById('active-chips-bar');
  var saveBtn = document.getElementById('save-filters-btn');
  var applySavedBtn = document.getElementById('apply-saved-filters-btn');
  var saveStatusEl = document.getElementById('save-filters-status');
  var sidebarClearBtn = document.getElementById('sidebar-clear-btn');
  var emptyClearBtn = document.getElementById('empty-clear-btn');
  var recentListEl = document.getElementById('recently-viewed-list');
  var clearRecentBtn = document.getElementById('clear-recent-btn');

  var state = {
    speciality: [],
    gender: [],
    availability: [],
    search: '',
    sort: 'recommended'
  };

  function getCheckboxes(groupName) {
    return Array.prototype.slice.call(document.querySelectorAll('input[name="' + groupName + '"]'));
  }

  function syncInputsFromState() {
    ['speciality', 'gender', 'availability'].forEach(function (group) {
      getCheckboxes(group).forEach(function (cb) {
        cb.checked = state[group].indexOf(cb.value) !== -1;
      });
    });
    searchInput.value = state.search;
    sortSelect.value = state.sort;
  }

  function readStateFromInputs() {
    ['speciality', 'gender', 'availability'].forEach(function (group) {
      state[group] = getCheckboxes(group)
        .filter(function (cb) {
          return cb.checked;
        })
        .map(function (cb) {
          return cb.value;
        });
    });
    state.search = searchInput.value.trim();
    state.sort = sortSelect.value || 'recommended';
  }

  function enrichDoctor(doc) {
    var reviews = MS.getDoctorReviews(doc);
    var stats = MS.calculateAverageRating(reviews);
    return {
      doc: doc,
      avgRating: stats.average,
      reviewCount: stats.count
    };
  }

  function matchesFilters(item) {
    var doc = item.doc;
    if (state.speciality.length > 0 && state.speciality.indexOf(doc.speciality) === -1) {
      return false;
    }
    if (state.gender.length > 0 && state.gender.indexOf(doc.gender) === -1) {
      return false;
    }
    if (state.availability.length > 0) {
      var matchesAvail = state.availability.some(function (avail) {
        if (avail === 'Today') return Boolean(doc.availableToday);
        if (avail === 'This Week') return Boolean(doc.availableThisWeek);
        return false;
      });
      if (!matchesAvail) return false;
    }
    if (state.search) {
      var q = state.search.toLowerCase();
      var haystack = [
        doc.name,
        doc.speciality,
        doc.qualifications,
        doc.about,
        (doc.services || []).join(' ')
      ]
        .join(' ')
        .toLowerCase();
      if (haystack.indexOf(q) === -1) return false;
    }
    return true;
  }

  function sortItems(items) {
    var copy = items.slice();
    if (state.sort === 'rating-desc') {
      copy.sort(function (a, b) {
        if (b.avgRating !== a.avgRating) return b.avgRating - a.avgRating;
        return b.reviewCount - a.reviewCount;
      });
    } else if (state.sort === 'experience-desc') {
      copy.sort(function (a, b) {
        return b.doc.experience - a.doc.experience;
      });
    } else if (state.sort === 'name-asc') {
      copy.sort(function (a, b) {
        return a.doc.name.localeCompare(b.doc.name);
      });
    }
    return copy;
  }

  function renderChips() {
    var chips = [];
    state.speciality.forEach(function (val) {
      chips.push({ group: 'speciality', value: val, label: 'Speciality: ' + val });
    });
    state.gender.forEach(function (val) {
      chips.push({ group: 'gender', value: val, label: 'Gender: ' + val });
    });
    state.availability.forEach(function (val) {
      chips.push({ group: 'availability', value: val, label: 'Available: ' + val });
    });
    if (state.search) {
      chips.push({ group: 'search', value: state.search, label: 'Search: "' + state.search + '"' });
    }

    if (chips.length === 0) {
      chipsBar.hidden = true;
      chipsBar.innerHTML = '';
      return;
    }

    chipsBar.hidden = false;
    chipsBar.innerHTML =
      chips
        .map(function (chip) {
          return (
            '<span class="filter-chip">' +
            MS.escapeHtml(chip.label) +
            '<button type="button" data-remove-group="' +
            MS.escapeHtml(chip.group) +
            '" data-remove-value="' +
            MS.escapeHtml(chip.value) +
            '" aria-label="Remove ' +
            MS.escapeHtml(chip.label) +
            '">&times;</button>' +
            '</span>'
          );
        })
        .join('') +
      '<button type="button" class="btn btn-outline btn-sm" id="chips-clear-all-btn">Clear all</button>';
  }

  function renderDoctors() {
    var enriched = DATA.doctors.map(enrichDoctor);
    var filtered = sortItems(enriched.filter(matchesFilters));

    renderChips();

    var total = DATA.doctors.length;
    countEl.textContent =
      'Showing ' +
      filtered.length +
      ' of ' +
      total +
      ' doctor' +
      (total === 1 ? '' : 's');

    if (filtered.length === 0) {
      gridEl.innerHTML = '';
      gridEl.hidden = true;
      emptyEl.hidden = false;
      return;
    }

    gridEl.hidden = false;
    emptyEl.hidden = true;

    gridEl.innerHTML = filtered
      .map(function (item) {
        var doc = item.doc;
        var availBadge = doc.availableToday
          ? '<span class="badge badge-today">Available Today</span>'
          : '<span class="badge badge-week">Available This Week</span>';

        var ratingHtml =
          item.reviewCount > 0
            ? '<span class="doctor-rating-inline">' +
              MS.renderStarsHtml(item.avgRating, item.avgRating + ' out of 5 stars') +
              '<span>' +
              item.avgRating.toFixed(1) +
              '</span>' +
              '<span class="doctor-rating-count">(' +
              item.reviewCount +
              ')</span></span>'
            : '<span class="doctor-rating-count">No reviews yet</span>';

        return (
          '<article class="card doctor-card" data-doctor-id="' +
          MS.escapeHtml(doc.id) +
          '">' +
          '  <div class="doctor-card-top">' +
          MS.renderAvatarHtml(doc) +
          '    <div class="doctor-card-info">' +
          '      <h3 class="doctor-card-name">' +
          MS.escapeHtml(doc.name) +
          '</h3>' +
          '      <p class="doctor-card-specialty">' +
          MS.escapeHtml(doc.speciality) +
          '</p>' +
          '      <p class="doctor-card-qual">' +
          MS.escapeHtml(doc.qualifications) +
          '</p>' +
          '    </div>' +
          '  </div>' +
          '  <div class="doctor-card-meta">' +
          '    <span><strong>' +
          MS.escapeHtml(doc.experience) +
          ' yrs</strong> experience &middot; ' +
          MS.escapeHtml(doc.gender) +
          '</span>' +
          ratingHtml +
          '  </div>' +
          '  <div class="doctor-card-actions">' +
          availBadge +
          '    <a class="btn btn-primary btn-sm" href="doctor-profile.html?id=' +
          encodeURIComponent(doc.id) +
          '" data-view-profile="' +
          MS.escapeHtml(doc.id) +
          '">View Profile</a>' +
          '  </div>' +
          '</article>'
        );
      })
      .join('');
  }

  function renderRecentlyViewed() {
    var ids = MS.getRecentlyViewedIds();
    var doctorsById = {};
    DATA.doctors.forEach(function (d) {
      doctorsById[d.id] = d;
    });

    var docs = ids
      .map(function (id) {
        return doctorsById[id];
      })
      .filter(Boolean);

    if (docs.length === 0) {
      clearRecentBtn.hidden = true;
      recentListEl.innerHTML =
        '<p class="page-subtitle" style="grid-column:1/-1;">Doctors you open will appear here for quick access.</p>';
      return;
    }

    clearRecentBtn.hidden = false;
    recentListEl.innerHTML = docs
      .map(function (doc) {
        return (
          '<a class="recent-item" href="doctor-profile.html?id=' +
          encodeURIComponent(doc.id) +
          '">' +
          MS.renderAvatarHtml(doc) +
          '  <div>' +
          '    <p class="recent-item-name">' +
          MS.escapeHtml(doc.name) +
          '</p>' +
          '    <p class="recent-item-spec">' +
          MS.escapeHtml(doc.speciality) +
          ' &middot; ' +
          MS.escapeHtml(doc.experience) +
          ' yrs</p>' +
          '  </div>' +
          '</a>'
        );
      })
      .join('');
  }

  function clearAllFilters() {
    state.speciality = [];
    state.gender = [];
    state.availability = [];
    state.search = '';
    state.sort = 'recommended';
    syncInputsFromState();
    saveStatusEl.textContent = '';
    renderDoctors();
  }

  function updateSavedBtnVisibility() {
    var saved = MS.safeReadStorage(MS.FILTERS_STORAGE_KEY, null);
    applySavedBtn.hidden = !saved;
  }

  function applySavedFilters(showMessage) {
    var saved = MS.safeReadStorage(MS.FILTERS_STORAGE_KEY, null);
    if (!saved || typeof saved !== 'object') return false;
    state.speciality = Array.isArray(saved.speciality) ? saved.speciality : [];
    state.gender = Array.isArray(saved.gender) ? saved.gender : [];
    state.availability = Array.isArray(saved.availability) ? saved.availability : [];
    state.search = typeof saved.search === 'string' ? saved.search : '';
    state.sort = typeof saved.sort === 'string' ? saved.sort : 'recommended';
    syncInputsFromState();
    renderDoctors();
    if (showMessage) {
      saveStatusEl.textContent = 'Loaded saved filters.';
    }
    return true;
  }

  // Event listeners
  ['speciality', 'gender', 'availability'].forEach(function (group) {
    getCheckboxes(group).forEach(function (cb) {
      cb.addEventListener('change', function () {
        readStateFromInputs();
        renderDoctors();
      });
    });
  });

  searchInput.addEventListener('input', function () {
    readStateFromInputs();
    renderDoctors();
  });

  sortSelect.addEventListener('change', function () {
    readStateFromInputs();
    renderDoctors();
  });

  chipsBar.addEventListener('click', function (e) {
    var clearAllTrigger = e.target.closest('#chips-clear-all-btn');
    if (clearAllTrigger) {
      clearAllFilters();
      return;
    }
    var removeBtn = e.target.closest('[data-remove-group]');
    if (!removeBtn) return;
    var group = removeBtn.getAttribute('data-remove-group');
    var val = removeBtn.getAttribute('data-remove-value');
    if (group === 'search') {
      state.search = '';
    } else if (Array.isArray(state[group])) {
      state[group] = state[group].filter(function (item) {
        return item !== val;
      });
    }
    syncInputsFromState();
    renderDoctors();
  });

  sidebarClearBtn.addEventListener('click', clearAllFilters);
  emptyClearBtn.addEventListener('click', clearAllFilters);

  saveBtn.addEventListener('click', function () {
    readStateFromInputs();
    MS.safeWriteStorage(MS.FILTERS_STORAGE_KEY, state);
    updateSavedBtnVisibility();
    saveStatusEl.textContent = 'Filters saved!';
    MS.showToast('Directory filters saved.');
  });

  applySavedBtn.addEventListener('click', function () {
    applySavedFilters(true);
  });

  gridEl.addEventListener('click', function (e) {
    var link = e.target.closest('[data-view-profile]');
    if (link) {
      MS.recordRecentlyViewed(link.getAttribute('data-view-profile'));
    }
  });

  clearRecentBtn.addEventListener('click', function () {
    MS.clearRecentlyViewed();
    renderRecentlyViewed();
  });

  // Initialize from URL ?speciality=... or saved filters
  var params = new URLSearchParams(window.location.search);
  var urlSpeciality = params.get('speciality');
  if (urlSpeciality) {
    state.speciality = [urlSpeciality];
    syncInputsFromState();
  } else {
    applySavedFilters(false);
  }

  updateSavedBtnVisibility();
  renderDoctors();
  renderRecentlyViewed();
})();
