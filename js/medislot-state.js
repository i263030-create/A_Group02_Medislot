/* =========================================================
   Medislot — Shared State, Date Helpers, Calculations & Navigation
   Uses localStorage for persistence across all 3 Member 3 pages.
   ========================================================= */

window.MedislotState = (function () {
  "use strict";

  const STORAGE_KEYS = {
    SELECTED_SERVICE: "medislot_selected_service",
    TAKEN_SLOTS: "medislot_taken_slots",
    BOOKINGS: "medislot_bookings",
    ACTIVE_BOOKING_ID: "medislot_active_booking_id",
    BOOKING_COUNTER: "medislot_booking_counter",
    UNAVAILABLE_DOCTORS: "medislot_unavailable_doctors"
  };

  function safeParse(jsonStr, fallback) {
    try {
      return jsonStr ? JSON.parse(jsonStr) : fallback;
    } catch (e) {
      return fallback;
    }
  }

  function readStorage(key, fallback) {
    try {
      return safeParse(window.localStorage.getItem(key), fallback);
    } catch (e) {
      return fallback;
    }
  }

  function writeStorage(key, value) {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      return false;
    }
  }

  // ---- Currency & Fee Calculations ----
  // Total fee equals the exact selected service fee (no extra registration fee or discount).
  function formatPKR(amount) {
    var num = Number(amount) || 0;
    return "Rs. " + Math.round(num);
  }

  function calculateFees(options) {
    var serviceFee = Number(options && options.serviceFee) || 0;
    return {
      serviceFee: serviceFee,
      totalFee: serviceFee
    };
  }

  // ---- Dynamic Date Helpers (never hardcoded) ----
  function toISODate(dateObj) {
    var y = dateObj.getFullYear();
    var m = String(dateObj.getMonth() + 1).padStart(2, "0");
    var d = String(dateObj.getDate()).padStart(2, "0");
    return y + "-" + m + "-" + d;
  }

  function parseISODate(isoStr) {
    if (!isoStr || !/^\d{4}-\d{2}-\d{2}$/.test(isoStr)) {
      return null;
    }
    var parts = isoStr.split("-");
    return new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
  }

  function getTodayISO() {
    return toISODate(new Date());
  }

  function addDaysISO(baseISO, deltaDays) {
    var d = parseISODate(baseISO) || new Date();
    d.setDate(d.getDate() + deltaDays);
    return toISODate(d);
  }

  function getDayOffsetFromToday(isoStr) {
    var target = parseISODate(isoStr);
    var today = parseISODate(getTodayISO());
    if (!target || !today) return null;
    var diffMs = target.getTime() - today.getTime();
    return Math.round(diffMs / 86400000);
  }

  function formatDisplayDate(isoStr) {
    var d = parseISODate(isoStr);
    if (!d) return "Select Date";
    return d.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric"
    });
  }

  function formatLongDate(isoStr) {
    var d = parseISODate(isoStr);
    if (!d) return "";
    return d.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric"
    });
  }

  function getNextOpenDateISO(doctor) {
    var todayISO = getTodayISO();
    for (var i = 1; i <= 14; i++) {
      var candidateISO = addDaysISO(todayISO, i);
      var candidateDate = parseISODate(candidateISO);
      if (candidateDate && (!doctor || !doctor.offDays.includes(candidateDate.getDay()))) {
        return candidateISO;
      }
    }
    return addDaysISO(todayISO, 1);
  }

  function parseTimeTo24Hour(timeStr) {
    var match = /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i.exec(String(timeStr).trim());
    if (!match) return null;
    var hour = parseInt(match[1], 10);
    var minute = parseInt(match[2], 10);
    var period = match[3].toUpperCase();
    if (period === "PM" && hour !== 12) hour += 12;
    if (period === "AM" && hour === 12) hour = 0;
    return { hour: hour, minute: minute };
  }

  function isSlotPastForToday(dateISO, timeStr) {
    if (dateISO !== getTodayISO()) return false;
    var parsed = parseTimeTo24Hour(timeStr);
    if (!parsed) return false;
    var now = new Date();
    var slotDate = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      parsed.hour,
      parsed.minute
    );
    return slotDate.getTime() <= now.getTime();
  }

  // ---- Dynamic Booking ID Generation ----
  function generateBookingId(appointmentDateISO) {
    var datePart = (appointmentDateISO || getTodayISO()).replace(/-/g, "");
    var counters = readStorage(STORAGE_KEYS.BOOKING_COUNTER, {});
    var nextSeq = (Number(counters[datePart]) || 0) + 1;
    counters[datePart] = nextSeq;
    writeStorage(STORAGE_KEYS.BOOKING_COUNTER, counters);
    return "MS" + datePart + "-" + String(nextSeq).padStart(3, "0");
  }

  // ---- Selected Service Handoff ----
  function setSelectedServiceId(serviceId) {
    writeStorage(STORAGE_KEYS.SELECTED_SERVICE, serviceId || null);
  }

  function getSelectedServiceId() {
    return readStorage(STORAGE_KEYS.SELECTED_SERVICE, null);
  }

  // ---- Doctor Availability (supports dynamic unavailable state) ----
  function isDoctorAvailable(doctor) {
    if (!doctor || doctor.status !== "available") return false;
    var params = new URLSearchParams(window.location.search);
    var urlUnavail = params.get("unavailableDoctor");
    if (urlUnavail && urlUnavail === doctor.id) return false;
    var storedUnavail = readStorage(STORAGE_KEYS.UNAVAILABLE_DOCTORS, []);
    if (Array.isArray(storedUnavail) && storedUnavail.indexOf(doctor.id) !== -1) {
      return false;
    }
    return true;
  }

  function setDoctorUnavailable(doctorId, isUnavailable) {
    var list = readStorage(STORAGE_KEYS.UNAVAILABLE_DOCTORS, []);
    if (!Array.isArray(list)) list = [];
    if (isUnavailable) {
      if (list.indexOf(doctorId) === -1) list.push(doctorId);
    } else {
      list = list.filter(function (id) {
        return id !== doctorId;
      });
    }
    writeStorage(STORAGE_KEYS.UNAVAILABLE_DOCTORS, list);
  }

  // ---- Taken Slots Persistence ----
  function makeSlotKey(doctorId, dateISO, timeStr) {
    return doctorId + "|" + dateISO + "|" + String(timeStr).trim().toUpperCase();
  }

  function getUserTakenSlots() {
    return readStorage(STORAGE_KEYS.TAKEN_SLOTS, []);
  }

  function addTakenSlot(doctorId, dateISO, timeStr) {
    var list = getUserTakenSlots();
    var key = makeSlotKey(doctorId, dateISO, timeStr);
    if (list.indexOf(key) === -1) {
      list.push(key);
      writeStorage(STORAGE_KEYS.TAKEN_SLOTS, list);
    }
  }

  function getSlotStatus(doctor, dateISO, timeStr) {
    if (!doctor || !dateISO) return "unavailable";
    if (!isDoctorAvailable(doctor)) return "unavailable";

    var dateObj = parseISODate(dateISO);
    if (!dateObj) return "unavailable";
    if (dateISO < getTodayISO()) return "unavailable";
    if (doctor.offDays.indexOf(dateObj.getDay()) !== -1) return "unavailable";
    if (doctor.unavailableSlots.indexOf(timeStr) !== -1) return "unavailable";
    if (isSlotPastForToday(dateISO, timeStr)) return "unavailable";

    var offset = getDayOffsetFromToday(dateISO);
    var preBooked =
      offset !== null &&
      doctor.preBookedByDayOffset &&
      doctor.preBookedByDayOffset[offset]
        ? doctor.preBookedByDayOffset[offset]
        : [];
    if (preBooked.indexOf(timeStr) !== -1) return "taken";

    var userTaken = getUserTakenSlots();
    if (userTaken.indexOf(makeSlotKey(doctor.id, dateISO, timeStr)) !== -1) {
      return "taken";
    }

    return "available";
  }

  // ---- Bookings History & Active Booking ----
  function saveBooking(bookingObj) {
    var bookings = readStorage(STORAGE_KEYS.BOOKINGS, []);
    bookings.unshift(bookingObj);
    writeStorage(STORAGE_KEYS.BOOKINGS, bookings);
    writeStorage(STORAGE_KEYS.ACTIVE_BOOKING_ID, bookingObj.bookingId);
    addTakenSlot(bookingObj.doctorId, bookingObj.dateISO, bookingObj.time);
  }

  function getBookings() {
    return readStorage(STORAGE_KEYS.BOOKINGS, []);
  }

  function getBookingById(bookingId) {
    if (!bookingId) return null;
    var bookings = getBookings();
    return (
      bookings.find(function (b) {
        return b.bookingId === bookingId;
      }) || null
    );
  }

  function getActiveBooking() {
    var params = new URLSearchParams(window.location.search);
    var idFromUrl = params.get("bookingId");
    if (idFromUrl) {
      var byUrl = getBookingById(idFromUrl);
      if (byUrl) return byUrl;
    }
    var activeId = readStorage(STORAGE_KEYS.ACTIVE_BOOKING_ID, null);
    if (activeId) {
      var byActive = getBookingById(activeId);
      if (byActive) return byActive;
    }
    var all = getBookings();
    return all.length > 0 ? all[0] : null;
  }

  // ---- Toast & Teammate Link Guard ----
  function showToast(message) {
    var existing = document.getElementById("msToastNotice");
    if (existing) existing.remove();
    var toast = document.createElement("div");
    toast.id = "msToastNotice";
    toast.className = "ms-toast-notice";
    toast.setAttribute("role", "status");
    toast.setAttribute("aria-live", "polite");
    toast.textContent = message;
    document.body.appendChild(toast);
    window.setTimeout(function () {
      if (toast.parentNode) toast.remove();
    }, 4000);
  }

  function bindPlaceholderNavLinks() {
    var links = document.querySelectorAll("[data-member-module]");
    links.forEach(function (link) {
      link.addEventListener("click", function (event) {
        var targetPage = link.getAttribute("href");
        var label = link.getAttribute("data-member-module");
        if (window.location.protocol === "http:" || window.location.protocol === "https:") {
          event.preventDefault();
          fetch(targetPage, { method: "HEAD" })
            .then(function (res) {
              if (res.ok) {
                window.location.href = targetPage;
              } else {
                showToast(
                  label +
                    " belongs to another team member's module and has not been added yet. Use Services & Fees, Book Appointment, or My Account."
                );
              }
            })
            .catch(function () {
              showToast(
                label +
                  " page is not in the workspace yet. Use Services & Fees, Book Appointment, or My Account."
              );
            });
        }
      });
    });
  }

  return {
    formatPKR: formatPKR,
    calculateFees: calculateFees,
    toISODate: toISODate,
    parseISODate: parseISODate,
    getTodayISO: getTodayISO,
    addDaysISO: addDaysISO,
    formatDisplayDate: formatDisplayDate,
    formatLongDate: formatLongDate,
    getNextOpenDateISO: getNextOpenDateISO,
    generateBookingId: generateBookingId,
    setSelectedServiceId: setSelectedServiceId,
    getSelectedServiceId: getSelectedServiceId,
    isDoctorAvailable: isDoctorAvailable,
    setDoctorUnavailable: setDoctorUnavailable,
    getSlotStatus: getSlotStatus,
    saveBooking: saveBooking,
    getBookings: getBookings,
    getBookingById: getBookingById,
    getActiveBooking: getActiveBooking,
    showToast: showToast,
    bindPlaceholderNavLinks: bindPlaceholderNavLinks
  };
})();
