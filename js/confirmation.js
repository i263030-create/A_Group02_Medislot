/* =========================================================
   Medislot — Confirmation Page Logic
   Reads active booking from localStorage / URL, displays receipt,
   preserves Recent Bookings, and connects View Appointment & Back Home.
   ========================================================= */

(function () {
  "use strict";

  var State = window.MedislotState;
  var detailsExpanded = false;

  function escapeHtml(str) {
    return String(str || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function navigateBackHome() {
    if (window.location.protocol === "http:" || window.location.protocol === "https:") {
      fetch("../index.html", { method: "HEAD" })
        .then(function (res) {
          window.location.href = res.ok ? "../index.html" : "services-fees.html";
        })
        .catch(function () {
          window.location.href = "services-fees.html";
        });
    } else {
      window.location.href = "services-fees.html";
    }
  }

  function renderConfirmation() {
    var container = document.getElementById("confirmationContainer");
    if (!container) return;

    var booking = State.getActiveBooking();
    var allBookings = State.getBookings();

    if (!booking) {
      container.innerHTML =
        '<div class="confirmation-card text-center">' +
        '<div class="confirmation-check-circle" aria-hidden="true">&#128197;</div>' +
        '<h1 class="confirmation-title">No Active Appointment Found</h1>' +
        '<p class="confirmation-subtitle mb-4">You have not booked an appointment yet. Choose a service or doctor to get started.</p>' +
        '<div class="confirmation-actions">' +
        '<a href="book-appointment.html" class="btn btn-ms-primary">Book Appointment</a>' +
        '<a href="services-fees.html" class="btn btn-ms-outline">Services &amp; Fees</a>' +
        "</div>" +
        "</div>";
      return;
    }

    var fees = booking.fees || {
      serviceFee: 0,
      totalFee: 0
    };

    var recentHtml = "";
    if (allBookings.length > 1) {
      var listItems = allBookings
        .slice(0, 4)
        .map(function (b) {
          return (
            '<div class="d-flex justify-content-between align-items-center py-2 border-bottom">' +
            '<div><strong>' +
            escapeHtml(b.bookingId) +
            "</strong> &mdash; " +
            escapeHtml(b.doctorName) +
            " (" +
            escapeHtml(b.dateLabel) +
            ", " +
            escapeHtml(b.time) +
            ")</div>" +
            '<a class="btn btn-sm btn-ms-outline" href="confirmation.html?bookingId=' +
            encodeURIComponent(b.bookingId) +
            '">Open</a>' +
            "</div>"
          );
        })
        .join("");
      recentHtml =
        '<section class="recent-bookings-wrap" aria-label="Recent bookings">' +
        '<div class="confirmation-card p-3">' +
        '<h2 class="h6 fw-bold mb-2">Recent Bookings</h2>' +
        listItems +
        "</div>" +
        "</section>";
    }

    var doctorRecord =
      window.MedislotData && typeof window.MedislotData.getDoctorById === "function"
        ? window.MedislotData.getDoctorById(booking.doctorId)
        : null;
    var doctorPhoto = booking.doctorPhoto || (doctorRecord && doctorRecord.photo) || "";
    var doctorPhotoAlt =
      booking.doctorPhotoAlt ||
      (doctorRecord && doctorRecord.photoAlt) ||
      ("Portrait of " + (booking.doctorName || "Doctor"));
    var doctorAvatarHtml = doctorPhoto
      ? '<img class="doctor-photo-circle doctor-photo-circle--md" src="' +
        escapeHtml(doctorPhoto) +
        '" alt="' +
        escapeHtml(doctorPhotoAlt) +
        '" width="52" height="52">'
      : '<span class="doctor-empty-circle doctor-empty-circle--md" aria-hidden="true"></span>';

    container.innerHTML =
      '<div class="confirmation-hero">' +
      '<div class="confirmation-check-circle" aria-hidden="true">&#10003;</div>' +
      '<h1 class="confirmation-title">Your Appointment is confirmed!</h1>' +
      '<p class="confirmation-subtitle">Thank you for choosing Medislot</p>' +
      "</div>" +
      '<section class="confirmation-card" aria-label="Appointment confirmation details">' +
      '<div class="confirmation-id-bar">' +
      '<div class="confirmation-booking-id">Booking ID: <span id="bookingIdValue">' +
      escapeHtml(booking.bookingId) +
      "</span></div>" +
      '<span class="confirmation-status-pill">' +
      escapeHtml(booking.status || "Confirmed") +
      "</span>" +
      "</div>" +
      '<div class="confirmation-main-row">' +
      '<div class="confirmation-doctor-block">' +
      doctorAvatarHtml +
      "<div>" +
      '<h2 class="confirmation-doctor-name">' +
      escapeHtml(booking.doctorName) +
      "</h2>" +
      '<p class="confirmation-doctor-specialty">' +
      escapeHtml(booking.doctorSpecialty) +
      "</p>" +
      "</div>" +
      "</div>" +
      '<div class="confirmation-schedule-block">' +
      '<p class="confirmation-date-time">' +
      escapeHtml(booking.dateLabel) +
      "<br>" +
      escapeHtml(booking.time) +
      "</p>" +
      '<p class="confirmation-fee-highlight">Fee: ' +
      State.formatPKR(fees.totalFee) +
      "</p>" +
      "</div>" +
      "</div>" +
      '<div class="confirmation-details-grid" id="confirmationDetailsPanel">' +
      "<div>" +
      '<div class="details-subhead">Patient Details</div>' +
      '<div class="details-line"><span>Name</span><strong>' +
      escapeHtml(booking.patientName) +
      "</strong></div>" +
      '<div class="details-line"><span>Email</span><span>' +
      escapeHtml(booking.patientEmail) +
      "</span></div>" +
      '<div class="details-line"><span>Phone</span><span>' +
      escapeHtml(booking.patientPhone) +
      "</span></div>" +
      "</div>" +
      "<div>" +
      '<div class="details-subhead">Fee Summary</div>' +
      '<div class="details-line"><span>' +
      escapeHtml(booking.serviceName || "Consultation") +
      "</span><span>" +
      State.formatPKR(fees.serviceFee) +
      "</span></div>" +
      '<div class="details-line details-total-line"><span>Total Fee</span><span>' +
      State.formatPKR(fees.totalFee) +
      "</span></div>" +
      "</div>" +
      "</div>" +
      '<div class="confirmation-actions">' +
      '<button type="button" class="btn btn-ms-primary" id="viewAppointmentBtn">View Appointment</button>' +
      '<button type="button" class="btn btn-ms-outline" id="backHomeBtn">Back Home</button>' +
      "</div>" +
      "</section>" +
      recentHtml;

    document.getElementById("viewAppointmentBtn").addEventListener("click", function () {
      detailsExpanded = !detailsExpanded;
      var detailsPanel = document.getElementById("confirmationDetailsPanel");
      if (detailsPanel) {
        detailsPanel.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
      State.showToast(
        "Appointment " +
          booking.bookingId +
          ": " +
          booking.doctorName +
          " on " +
          booking.dateLabel +
          " at " +
          booking.time +
          " (" +
          State.formatPKR(fees.totalFee) +
          ")."
      );
    });

    document.getElementById("backHomeBtn").addEventListener("click", navigateBackHome);
  }

  document.addEventListener("DOMContentLoaded", function () {
    renderConfirmation();
    State.bindPlaceholderNavLinks();
  });
})();
