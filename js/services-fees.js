/* =========================================================
   Medislot — Services & Fees Page Logic
   Renders the 4 clinic services in a 2x2 grid & routes to booking.
   ========================================================= */

(function () {
  "use strict";

  var ICONS = {
    stethoscope:
      '<svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3"/><path d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4"/><circle cx="20" cy="10" r="2"/></svg>',
    heart:
      '<svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/><path d="M7 10h2l1.5-2.5L13 13l1.5-3H17"/></svg>',
    syringe:
      '<svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m18 2 4 4"/><path d="m17 7 3-3"/><path d="M19 9 8.7 19.3c-1 1-2.5 1-3.4 0l-.6-.6c-1-1-1-2.5 0-3.4L15 5"/><path d="m9 11 4 4"/><path d="m5 19-3 3"/><path d="m14 4 6 6"/></svg>',
    flask:
      '<svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 2v7.31"/><path d="M14 9.3V1.99"/><path d="M8.5 2h7"/><path d="M14 9.3a6.5 6.5 0 1 1-4 0"/><path d="M5.52 16h12.96"/></svg>'
  };

  function renderServicesGrid() {
    var grid = document.getElementById("servicesGrid");
    if (!grid) return;

    var services = window.MedislotData.SERVICES;
    grid.innerHTML = "";

    services.forEach(function (service) {
      var card = document.createElement("article");
      card.className = "service-card";
      card.setAttribute("data-service-id", service.id);

      card.innerHTML =
        '<div class="service-icon-box">' +
        (ICONS[service.icon] || ICONS.stethoscope) +
        "</div>" +
        '<h2 class="service-name">' +
        service.shortTitle +
        "</h2>" +
        '<p class="service-description">' +
        service.description +
        "</p>" +
        '<p class="service-fee">' +
        window.MedislotState.formatPKR(service.fee) +
        "</p>" +
        '<button type="button" class="btn btn-ms-primary btn-book-now" data-book-service="' +
        service.id +
        '">Book NOW</button>';

      grid.appendChild(card);
    });

    grid.querySelectorAll("[data-book-service]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var serviceId = btn.getAttribute("data-book-service");
        window.MedislotState.setSelectedServiceId(serviceId);
        window.location.href = "book-appointment.html?service=" + encodeURIComponent(serviceId);
      });
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    renderServicesGrid();
    window.MedislotState.bindPlaceholderNavLinks();
  });
})();
