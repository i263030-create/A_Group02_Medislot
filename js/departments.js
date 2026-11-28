/**
 * MediSlot Departments page logic:
 * renders clinic departments from shared data, links to filtered directory
 * and individual doctor profiles, and enables mobile bottom bar.
 */
(function () {
  'use strict';

  var MS = window.MediSlot;
  var DATA = window.MEDISLOT_DATA || { departments: [], doctors: [] };

  MS.initShell('home', { showBottomBar: true, bottomActive: 'home' });

  var gridEl = document.getElementById('departments-grid');

  // Accessible SVG icons keyed by department id
  var deptIcons = {
    cardiology:
      '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>',
    orthopedics:
      '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20M5 7h14M5 17h14"/></svg>',
    neurology:
      '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.5 3a4.5 4.5 0 0 0-4.5 4.5c0 .7.16 1.36.45 1.95A4 4 0 0 0 4 12.5 4 4 0 0 0 6.5 16.2V18a3 3 0 0 0 3 3h1V3h-1z"/><path d="M14.5 3a4.5 4.5 0 0 1 4.5 4.5c0 .7-.16 1.36-.45 1.95A4 4 0 0 1 20 12.5a4 4 0 0 1-2.5 3.7V18a3 3 0 0 1-3 3h-1V3h1z"/></svg>',
    pediatrics:
      '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="7" r="4"/><path d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"/><path d="M12 11v4M10 13h4"/></svg>',
    dermatology:
      '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M9 12l2 2 4-4"/></svg>'
  };

  gridEl.innerHTML = DATA.departments
    .map(function (dept) {
      var docs = DATA.doctors.filter(function (d) {
        return d.speciality === dept.name;
      });

      var servicesHtml = (dept.services || [])
        .map(function (svc) {
          return '<span class="service-pill">' + MS.escapeHtml(svc) + '</span>';
        })
        .join('');

      var docPillsHtml = docs
        .map(function (doc) {
          return (
            '<a class="mini-doc-pill" href="doctor-profile.html?id=' +
            encodeURIComponent(doc.id) +
            '">' +
            '<span>' +
            MS.escapeHtml(doc.name) +
            '</span>' +
            '</a>'
          );
        })
        .join('');

      return (
        '<article class="card department-card">' +
        '  <div class="department-card-head">' +
        '    <div class="department-icon" aria-hidden="true">' +
        (deptIcons[dept.id] || deptIcons.cardiology) +
        '    </div>' +
        '    <div>' +
        '      <h2>' +
        MS.escapeHtml(dept.name) +
        '</h2>' +
        '      <p class="department-tagline">' +
        MS.escapeHtml(dept.tagline) +
        '</p>' +
        '    </div>' +
        '  </div>' +
        '  <p class="department-desc">' +
        MS.escapeHtml(dept.description) +
        '</p>' +
        '  <div class="services-pills">' +
        servicesHtml +
        '</div>' +
        '  <div class="department-doctors-preview">' +
        docPillsHtml +
        '</div>' +
        '  <div class="department-meta">' +
        '    <span><strong>' +
        docs.length +
        '</strong> specialist' +
        (docs.length === 1 ? '' : 's') +
        '</span>' +
        '    <span>' +
        MS.escapeHtml(dept.floor) +
        '</span>' +
        '    <span>' +
        MS.escapeHtml(dept.hours) +
        '</span>' +
        '  </div>' +
        '  <div>' +
        '    <a class="btn btn-outline btn-sm" href="doctors.html?speciality=' +
        encodeURIComponent(dept.name) +
        '">View ' +
        MS.escapeHtml(dept.name) +
        ' Doctors</a>' +
        '  </div>' +
        '</article>'
      );
    })
    .join('');
})();
