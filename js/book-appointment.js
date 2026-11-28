/* =========================================================
   Medislot — Book Appointment Flow & Validation Logic
   Flow: Choose Doctor -> Check Availability -> Select Date & Time
         -> Enter Patient Details -> Review Booking -> Booking Confirmation
   Includes all 7 vertical prototype states and exact service fee calculation.
   ========================================================= */

(function () {
  "use strict";

  var Data = window.MedislotData;
  var State = window.MedislotState;

  var appState = {
    searchQuery: "",
    specialistFilter: "all",
    selectedDoctorId: null,
    selectedServiceId: null,
    selectedDateISO: null,
    calendarMonthDate: null,
    showCalendar: true,
    selectedTime: null,
    patientName: "",
    patientEmail: "",
    patientPhone: "",
    // Mobile accordion collapsed states for separated Select Date & Select Time
    mobileDateCollapsed: false,
    mobileTimeCollapsed: false,
    // Vertical state flags:
    // doctorStatusView: 'normal' | 'doctor_unavailable'
    // slotStatusView: 'normal' | 'slot_taken'
    // flowStage: 'details' | 'invalid_details' | 'review' | 'success' | 'failed'
    doctorStatusView: "normal",
    unavailableDoctorName: "",
    slotStatusView: "normal",
    takenSlotLabel: "",
    flowStage: "details",
    invalidFieldInfo: { field: "", value: "", message: "" },
    confirmedBooking: null,
    fieldErrors: {},
    simulateNextFailOnce: false,
    urlFailConsumed: false
  };

  function initDefaultsFromRouteAndStorage() {
    var params = new URLSearchParams(window.location.search);
    var urlService = params.get("service");
    var urlDoctor = params.get("doctor");
    var urlUnavailableDoctor = params.get("unavailableDoctor");
    var storedService = State.getSelectedServiceId();
    var serviceId = urlService || storedService;

    var defaultDoctor = null;
    if (urlDoctor) {
      defaultDoctor = Data.getDoctorById(urlDoctor);
    } else if (urlUnavailableDoctor) {
      defaultDoctor = Data.getDoctorById(urlUnavailableDoctor);
    }
    if (!defaultDoctor && serviceId) {
      var svcObj = Data.getServiceById(serviceId);
      if (svcObj) {
        defaultDoctor = Data.DOCTORS.find(function (d) {
          return d.specialty === svcObj.specialty && State.isDoctorAvailable(d);
        });
      }
    }
    if (!defaultDoctor) {
      defaultDoctor =
        Data.DOCTORS.find(function (d) {
          return State.isDoctorAvailable(d);
        }) || Data.DOCTORS[0];
    }

    appState.selectedDoctorId = defaultDoctor.id;
    appState.selectedServiceId = serviceId || defaultDoctor.serviceId;
    if (urlService && Data.getServiceById(urlService)) {
      State.setSelectedServiceId(urlService);
    }

    if (defaultDoctor && !State.isDoctorAvailable(defaultDoctor)) {
      appState.doctorStatusView = "doctor_unavailable";
      appState.unavailableDoctorName = defaultDoctor.name;
    }

    var nextOpenISO = State.getNextOpenDateISO(defaultDoctor);
    appState.selectedDateISO = nextOpenISO;
    var dateObj = State.parseISODate(nextOpenISO) || new Date();
    appState.calendarMonthDate = new Date(dateObj.getFullYear(), dateObj.getMonth(), 1);
  }

  function getSelectedDoctor() {
    return Data.getDoctorById(appState.selectedDoctorId);
  }

  function getActiveService() {
    var doc = getSelectedDoctor();
    var svc = Data.getServiceById(appState.selectedServiceId);
    if (!svc && doc) {
      svc = Data.getServiceById(doc.serviceId);
    }
    return svc;
  }

  function updateStepper() {
    var step1 = document.getElementById("stepBtn1");
    var step2 = document.getElementById("stepBtn2");
    var step3 = document.getElementById("stepBtn3");
    var conn1 = document.getElementById("stepConn1");
    var conn2 = document.getElementById("stepConn2");

    var doc = getSelectedDoctor();
    var hasDoctor = Boolean(doc && appState.doctorStatusView === "normal" && State.isDoctorAvailable(doc));
    var hasDateAndTime = Boolean(hasDoctor && appState.selectedDateISO && appState.selectedTime);
    var inDetailsOrLater =
      hasDateAndTime ||
      appState.flowStage === "review" ||
      appState.flowStage === "success";

    [step1, step2, step3].forEach(function (el) {
      el.classList.remove("active", "completed");
    });
    conn1.classList.remove("completed");
    conn2.classList.remove("completed");

    if (!hasDoctor) {
      step1.classList.add("active");
    } else if (!hasDateAndTime) {
      step1.classList.add("completed");
      conn1.classList.add("completed");
      step2.classList.add("active");
    } else if (appState.flowStage === "success") {
      step1.classList.add("completed");
      step2.classList.add("completed");
      step3.classList.add("completed");
      conn1.classList.add("completed");
      conn2.classList.add("completed");
    } else {
      step1.classList.add("completed");
      step2.classList.add("completed");
      conn1.classList.add("completed");
      conn2.classList.add("completed");
      step3.classList.add(inDetailsOrLater ? "active" : "");
    }
  }

  // ---- Column 1: Render Choose Doctor ----
  function renderDoctors() {
    var listEl = document.getElementById("doctorList");
    if (!listEl) return;

    var q = appState.searchQuery.trim().toLowerCase();
    var spec = appState.specialistFilter;

    var filtered = Data.DOCTORS.filter(function (doc) {
      var matchesQuery =
        !q ||
        doc.name.toLowerCase().indexOf(q) !== -1 ||
        doc.specialty.toLowerCase().indexOf(q) !== -1;
      var matchesSpec = spec === "all" || doc.specialty === spec;
      return matchesQuery && matchesSpec;
    });

    listEl.innerHTML = "";

    if (filtered.length === 0) {
      listEl.innerHTML =
        '<div class="state-card">' +
        '<p class="state-title mb-1">No matching doctors found</p>' +
        '<p class="state-subtitle mb-2">Try clearing the search or specialist filter.</p>' +
        '<button type="button" class="btn btn-sm btn-ms-outline" id="resetDoctorFilterBtn">Reset Filters</button>' +
        "</div>";
      var resetBtn = document.getElementById("resetDoctorFilterBtn");
      if (resetBtn) {
        resetBtn.addEventListener("click", function () {
          appState.searchQuery = "";
          appState.specialistFilter = "all";
          document.getElementById("doctorSearchInput").value = "";
          document.getElementById("specialistFilter").value = "all";
          renderDoctors();
        });
      }
      return;
    }

    filtered.forEach(function (doc) {
      var isAvailable = State.isDoctorAvailable(doc);
      var isSelected =
        appState.selectedDoctorId === doc.id &&
        appState.doctorStatusView === "normal" &&
        isAvailable;

      var card = document.createElement("article");
      card.className =
        "doctor-card" +
        (isSelected ? " selected" : "") +
        (!isAvailable ? " unavailable" : "");
      card.setAttribute("data-doctor-id", doc.id);

      var avatarHtml = doc.photo
        ? '<img class="doctor-photo-circle doctor-photo-circle--sm' +
          (!isAvailable ? " doctor-photo-circle--unavailable" : "") +
          '" src="' +
          escapeHtml(doc.photo) +
          '" alt="' +
          escapeHtml(doc.photoAlt || "Portrait of " + doc.name) +
          '" width="44" height="44">'
        : '<span class="doctor-empty-circle doctor-empty-circle--sm' +
          (!isAvailable ? " doctor-empty-circle--unavailable" : "") +
          '" aria-hidden="true"></span>';

      card.innerHTML =
        '<div class="doctor-card-top">' +
        avatarHtml +
        '<div class="doctor-info">' +
        '<h3 class="doctor-name">' +
        doc.name +
        "</h3>" +
        '<p class="doctor-specialty">' +
        doc.specialty +
        " &bull; " +
        State.formatPKR(doc.fee) +
        "</p>" +
        '<div class="doctor-rating">&#9733; ' +
        doc.rating +
        " (" +
        doc.reviewsLabel +
        ")</div>" +
        "</div>" +
        "</div>" +
        '<div class="doctor-card-bottom">' +
        '<span class="doctor-status-badge ' +
        (!isAvailable ? "doctor-status-badge--unavailable" : "doctor-status-badge--available") +
        '">' +
        (!isAvailable ? "Unavailable" : "Available") +
        "</span>" +
        '<button type="button" class="btn btn-sm ' +
        (isSelected ? "btn-ms-primary" : "btn-ms-outline") +
        '" data-select-doctor="' +
        doc.id +
        '">' +
        (isSelected ? "Selected" : "Select") +
        "</button>" +
        "</div>";

      listEl.appendChild(card);
    });

    listEl.querySelectorAll("[data-select-doctor]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var docId = btn.getAttribute("data-select-doctor");
        handleDoctorSelect(docId);
      });
    });
  }

  function handleDoctorSelect(doctorId) {
    var doc = Data.getDoctorById(doctorId);
    if (!doc) return;

    // Vertical Screen #2: Doctor Unavailable
    if (!State.isDoctorAvailable(doc)) {
      appState.selectedDoctorId = doc.id;
      appState.selectedTime = null;
      appState.doctorStatusView = "doctor_unavailable";
      appState.unavailableDoctorName = doc.name;
      appState.slotStatusView = "normal";
      appState.flowStage = "details";
      renderAll();
      return;
    }

    appState.selectedDoctorId = doc.id;
    // Preserve Vaccination / Lab Tests service fee if coming from Services & Fees for General Physician
    var currentSvc = Data.getServiceById(appState.selectedServiceId);
    var keepGeneralService =
      currentSvc &&
      currentSvc.specialty === doc.specialty &&
      (currentSvc.id === "vaccination" || currentSvc.id === "lab-tests");
    if (!keepGeneralService) {
      appState.selectedServiceId = doc.serviceId;
      State.setSelectedServiceId(doc.serviceId);
    }

    appState.doctorStatusView = "normal";
    appState.slotStatusView = "normal";
    appState.selectedTime = null;
    if (
      appState.flowStage === "review" ||
      appState.flowStage === "success" ||
      appState.flowStage === "failed"
    ) {
      appState.flowStage = "details";
    }

    var currentDateObj = State.parseISODate(appState.selectedDateISO);
    if (
      !currentDateObj ||
      appState.selectedDateISO < State.getTodayISO() ||
      doc.offDays.indexOf(currentDateObj.getDay()) !== -1
    ) {
      appState.selectedDateISO = State.getNextOpenDateISO(doc);
      var newDateObj = State.parseISODate(appState.selectedDateISO) || new Date();
      appState.calendarMonthDate = new Date(newDateObj.getFullYear(), newDateObj.getMonth(), 1);
    }

    renderAll();
  }

  // ---- Column 2: Render Calendar, Available Slots & Error States ----
  function getMonthBounds() {
    var today = State.parseISODate(State.getTodayISO()) || new Date();
    var maxDate = State.parseISODate(State.addDaysISO(State.getTodayISO(), 30)) || today;
    return {
      minYear: today.getFullYear(),
      minMonth: today.getMonth(),
      maxYear: maxDate.getFullYear(),
      maxMonth: maxDate.getMonth()
    };
  }

  function renderCalendarHTML(doc) {
    var monthDate = appState.calendarMonthDate || new Date();
    var year = monthDate.getFullYear();
    var month = monthDate.getMonth();
    var monthLabel = monthDate.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric"
    });

    var bounds = getMonthBounds();
    var canPrevMonth =
      year > bounds.minYear || (year === bounds.minYear && month > bounds.minMonth);
    var canNextMonth =
      year < bounds.maxYear || (year === bounds.maxYear && month < bounds.maxMonth);

    var firstDayWeekday = new Date(year, month, 1).getDay();
    var daysInMonth = new Date(year, month + 1, 0).getDate();
    var todayISO = State.getTodayISO();
    var maxISO = State.addDaysISO(todayISO, 30);

    var weekdays = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
    var gridHtml = weekdays
      .map(function (w) {
        return '<div class="calendar-weekday">' + w + "</div>";
      })
      .join("");

    for (var blank = 0; blank < firstDayWeekday; blank++) {
      gridHtml += '<span class="calendar-day calendar-day--empty" aria-hidden="true"></span>';
    }

    for (var day = 1; day <= daysInMonth; day++) {
      var dObj = new Date(year, month, day);
      var iso = State.toISODate(dObj);
      var isOffDay = doc && doc.offDays.indexOf(dObj.getDay()) !== -1;
      var isDisabled = iso < todayISO || iso > maxISO || isOffDay;
      var isSelected = iso === appState.selectedDateISO;

      gridHtml +=
        '<button type="button" class="calendar-day' +
        (isSelected ? " selected" : "") +
        '" data-cal-date="' +
        iso +
        '"' +
        (isDisabled ? " disabled" : "") +
        ' aria-label="' +
        State.formatLongDate(iso) +
        (isOffDay ? " (Clinic Closed)" : "") +
        '">' +
        day +
        "</button>";
    }

    return (
      '<div class="calendar-box">' +
      '<div class="calendar-header">' +
      '<button type="button" class="date-nav-arrow" id="calPrevMonth" aria-label="Previous month"' +
      (!canPrevMonth ? " disabled" : "") +
      ">&lsaquo;</button>" +
      "<span>" +
      monthLabel +
      "</span>" +
      '<button type="button" class="date-nav-arrow" id="calNextMonth" aria-label="Next month"' +
      (!canNextMonth ? " disabled" : "") +
      ">&rsaquo;</button>" +
      "</div>" +
      '<div class="calendar-grid">' +
      gridHtml +
      "</div>" +
      "</div>"
    );
  }

  function renderSlotsPanel() {
    var body = document.getElementById("slotsPanelBody");
    if (!body) return;

    // Vertical Screen #2: Doctor Unavailable
    if (appState.doctorStatusView === "doctor_unavailable") {
      body.innerHTML =
        '<div class="state-card" role="alert">' +
        '<div class="state-icon-circle state-icon-circle--warning" aria-hidden="true">&#9888;</div>' +
        '<h3 class="state-title">The Doctor is now unavailable</h3>' +
        '<p class="state-subtitle">' +
        appState.unavailableDoctorName +
        " is currently unavailable.<br>Please choose another doctor.</p>" +
        '<button type="button" class="btn btn-ms-primary" id="findOtherDoctorBtn">Find other Doctor</button>' +
        "</div>";

      document.getElementById("findOtherDoctorBtn").addEventListener("click", function () {
        var otherAvailable = Data.DOCTORS.find(function (d) {
          return d.id !== appState.selectedDoctorId && State.isDoctorAvailable(d);
        }) || Data.DOCTORS.find(function (d) {
          return State.isDoctorAvailable(d);
        });
        if (otherAvailable) {
          handleDoctorSelect(otherAvailable.id);
        } else {
          State.setDoctorUnavailable(appState.selectedDoctorId, false);
          appState.doctorStatusView = "normal";
          renderAll();
        }
        var searchEl = document.getElementById("doctorSearchInput");
        if (searchEl) searchEl.focus();
      });
      return;
    }

    // Vertical Screen #4: Slot Already Taken
    if (appState.slotStatusView === "slot_taken") {
      body.innerHTML =
        '<div class="state-card" role="alert">' +
        '<div class="state-icon-circle state-icon-circle--danger" aria-hidden="true">&#128337;</div>' +
        '<h3 class="state-title">Time slot is No Longer Available</h3>' +
        '<p class="state-subtitle"><strong>' +
        appState.takenSlotLabel +
        "</strong> has already been booked.<br>Please choose another slot.</p>" +
        '<button type="button" class="btn btn-ms-primary" id="chooseAnotherSlotBtn">Choose slot</button>' +
        "</div>";

      document.getElementById("chooseAnotherSlotBtn").addEventListener("click", function () {
        appState.slotStatusView = "normal";
        renderSlotsPanel();
      });
      return;
    }

    var doc = getSelectedDoctor();
    if (!doc) return;

    var todayISO = State.getTodayISO();
    var canGoPrev = appState.selectedDateISO > todayISO;
    var maxISO = State.addDaysISO(todayISO, 30);
    var canGoNext = appState.selectedDateISO < maxISO;

    var slotsHtml = "";
    var availableCount = 0;

    Data.ALL_TIME_SLOTS.forEach(function (timeStr) {
      var status = State.getSlotStatus(doc, appState.selectedDateISO, timeStr);
      if (status === "available") availableCount++;
      var isSelected = appState.selectedTime === timeStr && status === "available";

      var btnClass = "slot-btn";
      var tagClass = "slot-tag slot-tag--available";
      var tagText = isSelected ? "Selected" : "Available";

      if (status === "taken") {
        btnClass += " slot-btn--taken";
        tagClass = "slot-tag slot-tag--taken";
        tagText = "Taken";
      } else if (status === "unavailable") {
        btnClass += " slot-btn--unavailable";
        tagClass = "slot-tag slot-tag--unavailable";
        tagText = "Unavailable";
      } else if (isSelected) {
        btnClass += " selected";
      }

      slotsHtml +=
        '<button type="button" class="' +
        btnClass +
        '" data-slot-time="' +
        timeStr +
        '" data-slot-status="' +
        status +
        '"' +
        (status === "unavailable" ? ' disabled aria-disabled="true"' : "") +
        ">" +
        "<span>" +
        timeStr +
        "</span>" +
        '<span class="' +
        tagClass +
        '">' +
        tagText +
        "</span>" +
        "</button>";
    });

    var noSlotsNotice =
      availableCount === 0
        ? '<div class="alert alert-warning py-2 px-3 small mt-2 mb-0" role="status">No open slots on this date. Please select another date.</div>'
        : "";

    body.innerHTML =
      '<div class="mobile-subpanel' +
      (appState.mobileDateCollapsed ? " is-collapsed" : "") +
      '" id="mobileDatePanel">' +
      '<button type="button" class="mobile-subpanel-btn" id="mobileDateToggleBtn" aria-expanded="' +
      String(!appState.mobileDateCollapsed) +
      '">' +
      "<span>Select Date</span>" +
      '<span class="panel-chevron" aria-hidden="true">&#9662;</span>' +
      "</button>" +
      '<div class="mobile-subpanel-body">' +
      '<div class="date-nav-bar">' +
      '<button type="button" class="date-nav-arrow" id="prevDateBtn" aria-label="Previous day"' +
      (!canGoPrev ? " disabled" : "") +
      ">&lsaquo;</button>" +
      '<button type="button" class="date-current-btn" id="toggleCalBtn" aria-expanded="' +
      appState.showCalendar +
      '">' +
      State.formatDisplayDate(appState.selectedDateISO) +
      "</button>" +
      '<button type="button" class="date-nav-arrow" id="nextDateBtn" aria-label="Next day"' +
      (!canGoNext ? " disabled" : "") +
      ">&rsaquo;</button>" +
      "</div>" +
      (appState.showCalendar ? renderCalendarHTML(doc) : "") +
      "</div>" +
      "</div>" +
      '<div class="mobile-subpanel' +
      (appState.mobileTimeCollapsed ? " is-collapsed" : "") +
      '" id="mobileTimePanel">' +
      '<button type="button" class="mobile-subpanel-btn" id="mobileTimeToggleBtn" aria-expanded="' +
      String(!appState.mobileTimeCollapsed) +
      '">' +
      "<span>Select Time</span>" +
      '<span class="panel-chevron" aria-hidden="true">&#9662;</span>' +
      "</button>" +
      '<div class="mobile-subpanel-body">' +
      '<div class="slots-subheading">Available slots:</div>' +
      '<div class="slot-legend">' +
      '<span><span class="slot-dot slot-dot--available"></span>Available</span>' +
      '<span><span class="slot-dot slot-dot--taken"></span>Taken</span>' +
      '<span><span class="slot-dot slot-dot--unavailable"></span>Unavailable</span>' +
      "</div>" +
      '<div class="slots-list">' +
      slotsHtml +
      "</div>" +
      noSlotsNotice +
      "</div>" +
      "</div>";

    document.getElementById("mobileDateToggleBtn").addEventListener("click", function () {
      if (window.innerWidth >= 768) return;
      appState.mobileDateCollapsed = !appState.mobileDateCollapsed;
      renderSlotsPanel();
    });

    document.getElementById("mobileTimeToggleBtn").addEventListener("click", function () {
      if (window.innerWidth >= 768) return;
      appState.mobileTimeCollapsed = !appState.mobileTimeCollapsed;
      renderSlotsPanel();
    });

    document.getElementById("prevDateBtn").addEventListener("click", function () {
      var prev = State.addDaysISO(appState.selectedDateISO, -1);
      if (prev >= todayISO) {
        selectDateISO(prev);
      }
    });

    document.getElementById("nextDateBtn").addEventListener("click", function () {
      var next = State.addDaysISO(appState.selectedDateISO, 1);
      if (next <= maxISO) {
        selectDateISO(next);
      }
    });

    document.getElementById("toggleCalBtn").addEventListener("click", function () {
      appState.showCalendar = !appState.showCalendar;
      renderSlotsPanel();
    });

    var calPrev = document.getElementById("calPrevMonth");
    var calNext = document.getElementById("calNextMonth");
    if (calPrev && !calPrev.disabled) {
      calPrev.addEventListener("click", function () {
        var m = appState.calendarMonthDate;
        appState.calendarMonthDate = new Date(m.getFullYear(), m.getMonth() - 1, 1);
        renderSlotsPanel();
      });
    }
    if (calNext && !calNext.disabled) {
      calNext.addEventListener("click", function () {
        var m = appState.calendarMonthDate;
        appState.calendarMonthDate = new Date(m.getFullYear(), m.getMonth() + 1, 1);
        renderSlotsPanel();
      });
    }

    body.querySelectorAll("[data-cal-date]").forEach(function (dayBtn) {
      dayBtn.addEventListener("click", function () {
        selectDateISO(dayBtn.getAttribute("data-cal-date"));
      });
    });

    body.querySelectorAll("[data-slot-time]").forEach(function (slotBtn) {
      slotBtn.addEventListener("click", function () {
        var timeStr = slotBtn.getAttribute("data-slot-time");
        var status = slotBtn.getAttribute("data-slot-status");
        if (status === "taken") {
          appState.slotStatusView = "slot_taken";
          appState.takenSlotLabel = timeStr;
          appState.selectedTime = null;
          renderAll();
          return;
        }
        if (status === "available") {
          appState.selectedTime = timeStr;
          appState.slotStatusView = "normal";
          if (appState.flowStage === "invalid_details" || appState.flowStage === "failed") {
            appState.flowStage = "details";
          }
          renderAll();
        }
      });
    });
  }

  function selectDateISO(newISO) {
    var doc = getSelectedDoctor();
    var dObj = State.parseISODate(newISO);
    if (!dObj) return;
    if (doc && doc.offDays.indexOf(dObj.getDay()) !== -1) {
      State.showToast("Clinic is closed on Sundays. Please select Monday to Saturday.");
      return;
    }
    appState.selectedDateISO = newISO;
    appState.selectedTime = null;
    appState.calendarMonthDate = new Date(dObj.getFullYear(), dObj.getMonth(), 1);
    renderAll();
  }

  // ---- Column 3: Summary, Fees, Details, Review, Success & Failed States ----
  function renderSummaryValues() {
    var doc = getSelectedDoctor();
    var svc = getActiveService();
    var isDoctorAvailable =
      doc && appState.doctorStatusView === "normal" && State.isDoctorAvailable(doc);

    document.getElementById("summaryDoctor").textContent = isDoctorAvailable
      ? doc.name
      : "Unavailable — Choose another";
    document.getElementById("summaryService").textContent = svc ? svc.shortTitle : "Not selected";
    document.getElementById("summaryDate").textContent =
      isDoctorAvailable && appState.selectedDateISO
        ? State.formatDisplayDate(appState.selectedDateISO)
        : "Not selected";
    document.getElementById("summaryTime").textContent =
      isDoctorAvailable && appState.selectedTime ? appState.selectedTime : "Not selected";

    var baseFee = isDoctorAvailable ? (svc ? svc.fee : doc.fee) : 0;
    var fees = State.calculateFees({ serviceFee: baseFee });

    document.getElementById("feeService").textContent = State.formatPKR(fees.serviceFee);
    document.getElementById("feeTotal").textContent = State.formatPKR(fees.totalFee);
  }

  function validateSingleField(fieldId, rawValue) {
    var val = String(rawValue || "").trim();
    if (fieldId === "patientName") {
      if (
        val.length < 3 ||
        !/^[A-Za-z\s.'-]{3,}$/.test(val) ||
        !/[A-Za-z].*[A-Za-z]/.test(val)
      ) {
        return {
          error: "Enter full name (min 3 letters).",
          value: val || "(empty)",
          message: "Please enter valid Full Name"
        };
      }
      return null;
    }
    if (fieldId === "patientEmail") {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(val)) {
        return {
          error: "Invalid Format",
          value: val || "(empty)",
          message: "Please enter valid Email address"
        };
      }
      return null;
    }
    if (fieldId === "patientPhone") {
      if (!/^(?:\+92[-\s]?|0)?3\d{2}[-\s]?\d{7}$/.test(val)) {
        return {
          error: "Use valid mobile format (e.g. 0300-1234567).",
          value: val || "(empty)",
          message: "Please enter valid Phone number"
        };
      }
      return null;
    }
    return null;
  }

  function validatePatientDetails() {
    var errors = {};
    var firstInvalid = null;
    var fields = [
      { id: "patientName", val: appState.patientName },
      { id: "patientEmail", val: appState.patientEmail },
      { id: "patientPhone", val: appState.patientPhone }
    ];

    fields.forEach(function (item) {
      var res = validateSingleField(item.id, item.val);
      if (res) {
        errors[item.id] = res.error;
        if (!firstInvalid) {
          firstInvalid = {
            field: item.id,
            value: res.value,
            message: res.message
          };
        }
      }
    });

    appState.fieldErrors = errors;
    appState.invalidFieldInfo = firstInvalid;
    return Object.keys(errors).length === 0;
  }

  function clearLiveFieldError(fieldId, inputEl) {
    delete appState.fieldErrors[fieldId];
    inputEl.classList.remove("is-invalid");
    inputEl.setAttribute("aria-invalid", "false");
    inputEl.removeAttribute("aria-describedby");
    var errEl = document.getElementById(fieldId + "Error");
    if (errEl) {
      errEl.remove();
    }
  }

  function handleLiveFieldInput(fieldId, inputEl) {
    appState[fieldId] = inputEl.value;
    var validationResult = validateSingleField(fieldId, inputEl.value);
    if (!validationResult) {
      clearLiveFieldError(fieldId, inputEl);
    } else if (appState.fieldErrors[fieldId]) {
      appState.fieldErrors[fieldId] = validationResult.error;
      inputEl.classList.add("is-invalid");
      inputEl.setAttribute("aria-invalid", "true");
      inputEl.setAttribute("aria-describedby", fieldId + "Error");
      var errEl = document.getElementById(fieldId + "Error");
      if (errEl) {
        errEl.textContent = validationResult.error;
      }
    }
  }

  function renderBookingFlowContainer() {
    var container = document.getElementById("bookingFlowContainer");
    if (!container) return;

    var doc = getSelectedDoctor();
    var svc = getActiveService();
    var isDoctorAvailable =
      doc && appState.doctorStatusView === "normal" && State.isDoctorAvailable(doc);

    // Vertical Screen #6: Booking Success
    if (appState.flowStage === "success" && appState.confirmedBooking) {
      container.innerHTML =
        '<div class="state-card" role="status">' +
        '<div class="state-icon-circle state-icon-circle--success" aria-hidden="true">&#10003;</div>' +
        '<h3 class="state-title">Your Appointment is confirmed!</h3>' +
        '<p class="state-subtitle mb-2">Booking ID:<br><strong>' +
        appState.confirmedBooking.bookingId +
        "</strong></p>" +
        '<button type="button" class="btn btn-ms-primary w-100" id="viewAppointmentBtn">View Appointment</button>' +
        "</div>";

      document.getElementById("viewAppointmentBtn").addEventListener("click", function () {
        window.location.href =
          "confirmation.html?bookingId=" +
          encodeURIComponent(appState.confirmedBooking.bookingId);
      });
      return;
    }

    // Vertical Screen #7: Booking Failed (Retry returns to Review Booking step)
    if (appState.flowStage === "failed") {
      container.innerHTML =
        '<div class="state-card" role="alert">' +
        '<div class="state-icon-circle state-icon-circle--danger" aria-hidden="true">&#10005;</div>' +
        '<h3 class="state-title">Something went wrong!</h3>' +
        '<p class="state-subtitle">Please try again later.</p>' +
        '<button type="button" class="btn btn-ms-primary w-100" id="retryBookingBtn">Retry</button>' +
        "</div>";

      document.getElementById("retryBookingBtn").addEventListener("click", function () {
        appState.simulateNextFailOnce = false;
        appState.urlFailConsumed = true;
        appState.flowStage = "review";
        updateStepper();
        renderBookingFlowContainer();
      });
      return;
    }

    // Vertical Screen #5: Invalid Details
    if (appState.flowStage === "invalid_details" && appState.invalidFieldInfo) {
      container.innerHTML =
        '<div class="state-card" role="alert">' +
        '<div class="state-icon-circle state-icon-circle--danger" aria-hidden="true">!</div>' +
        '<h3 class="state-title">' +
        appState.invalidFieldInfo.message +
        "</h3>" +
        '<div class="invalid-sample-box">' +
        escapeHtml(appState.invalidFieldInfo.value) +
        "</div>" +
        '<p class="state-subtitle text-danger fw-semibold mb-3">Invalid Format</p>' +
        '<button type="button" class="btn btn-ms-primary w-100" id="tryAgainDetailsBtn">Try again</button>' +
        "</div>";

      document.getElementById("tryAgainDetailsBtn").addEventListener("click", function () {
        var focusField = appState.invalidFieldInfo.field;
        appState.flowStage = "details";
        renderBookingFlowContainer();
        var el = document.getElementById(focusField);
        if (el) el.focus();
      });
      return;
    }

    // Step 5: Review Booking Confirmation Step
    if (appState.flowStage === "review") {
      var fees = State.calculateFees({
        serviceFee: svc ? svc.fee : doc.fee
      });

      container.innerHTML =
        '<div class="review-card">' +
        '<h3 class="h6 fw-bold mb-2">Review Booking</h3>' +
        '<div class="review-card-row"><span>Patient</span><strong>' +
        escapeHtml(appState.patientName) +
        "</strong></div>" +
        '<div class="review-card-row"><span>Email</span><strong>' +
        escapeHtml(appState.patientEmail) +
        "</strong></div>" +
        '<div class="review-card-row"><span>Phone</span><strong>' +
        escapeHtml(appState.patientPhone) +
        "</strong></div>" +
        '<div class="review-card-row"><span>Doctor</span><strong>' +
        doc.name +
        "</strong></div>" +
        '<div class="review-card-row"><span>Service</span><strong>' +
        (svc ? svc.shortTitle : doc.specialty) +
        "</strong></div>" +
        '<div class="review-card-row"><span>Date &amp; Time</span><strong>' +
        State.formatDisplayDate(appState.selectedDateISO) +
        " &bull; " +
        appState.selectedTime +
        "</strong></div>" +
        '<div class="review-card-row"><span>Total Fee</span><strong>' +
        State.formatPKR(fees.totalFee) +
        "</strong></div>" +
        "</div>" +
        '<div class="d-grid gap-2">' +
        '<button type="button" class="btn btn-ms-primary" id="finalizeBookingBtn">Confirm Booking</button>' +
        '<button type="button" class="btn btn-ms-outline btn-sm" id="backToEditBtn">Edit Details</button>' +
        "</div>";

      document.getElementById("backToEditBtn").addEventListener("click", function () {
        appState.flowStage = "details";
        renderBookingFlowContainer();
      });

      document.getElementById("finalizeBookingBtn").addEventListener("click", handleFinalizeBooking);
      return;
    }

    // Default Step 3 / Step 4: Enter Patient Details Form -> "Review Booking"
    container.innerHTML =
      '<form id="patientDetailsForm" novalidate>' +
      '<div class="patient-details-fieldset">' +
      '<div class="patient-details-title">Patient Details (Step 3)</div>' +
      '<div class="mb-2">' +
      '<label for="patientName" class="form-label">Full Name *</label>' +
      '<input type="text" id="patientName" class="form-control' +
      (appState.fieldErrors.patientName ? " is-invalid" : "") +
      '" aria-invalid="' +
      String(Boolean(appState.fieldErrors.patientName)) +
      '"' +
      (appState.fieldErrors.patientName ? ' aria-describedby="patientNameError"' : "") +
      ' placeholder="e.g. Ayesha Siddiqui" value="' +
      escapeHtml(appState.patientName) +
      '" required>' +
      (appState.fieldErrors.patientName
        ? '<div class="field-error-text" id="patientNameError">' +
          appState.fieldErrors.patientName +
          "</div>"
        : "") +
      "</div>" +
      '<div class="mb-2">' +
      '<label for="patientEmail" class="form-label">Email Address *</label>' +
      '<input type="email" id="patientEmail" class="form-control' +
      (appState.fieldErrors.patientEmail ? " is-invalid" : "") +
      '" aria-invalid="' +
      String(Boolean(appState.fieldErrors.patientEmail)) +
      '"' +
      (appState.fieldErrors.patientEmail ? ' aria-describedby="patientEmailError"' : "") +
      ' placeholder="e.g. ayesha@example.com" value="' +
      escapeHtml(appState.patientEmail) +
      '" required>' +
      (appState.fieldErrors.patientEmail
        ? '<div class="field-error-text" id="patientEmailError">' +
          appState.fieldErrors.patientEmail +
          "</div>"
        : "") +
      "</div>" +
      '<div>' +
      '<label for="patientPhone" class="form-label">Phone Number *</label>' +
      '<input type="tel" id="patientPhone" class="form-control' +
      (appState.fieldErrors.patientPhone ? " is-invalid" : "") +
      '" aria-invalid="' +
      String(Boolean(appState.fieldErrors.patientPhone)) +
      '"' +
      (appState.fieldErrors.patientPhone ? ' aria-describedby="patientPhoneError"' : "") +
      ' placeholder="e.g. 0300-1234567" value="' +
      escapeHtml(appState.patientPhone) +
      '" required>' +
      (appState.fieldErrors.patientPhone
        ? '<div class="field-error-text" id="patientPhoneError">' +
          appState.fieldErrors.patientPhone +
          "</div>"
        : "") +
      "</div>" +
      "</div>" +
      '<button type="submit" class="btn btn-ms-primary w-100 py-2" id="reviewBookingBtn"' +
      (!isDoctorAvailable ? " disabled" : "") +
      ">Review Booking</button>" +
      "</form>";

    var nameInput = document.getElementById("patientName");
    var emailInput = document.getElementById("patientEmail");
    var phoneInput = document.getElementById("patientPhone");

    nameInput.addEventListener("input", function () {
      handleLiveFieldInput("patientName", nameInput);
    });
    emailInput.addEventListener("input", function () {
      handleLiveFieldInput("patientEmail", emailInput);
    });
    phoneInput.addEventListener("input", function () {
      handleLiveFieldInput("patientPhone", phoneInput);
    });

    document.getElementById("patientDetailsForm").addEventListener("submit", function (event) {
      event.preventDefault();
      handleProceedToReview();
    });
  }

  function handleProceedToReview() {
    var doc = getSelectedDoctor();
    if (!doc || appState.doctorStatusView === "doctor_unavailable" || !State.isDoctorAvailable(doc)) {
      State.showToast("Please select an available doctor first.");
      return;
    }

    if (!appState.selectedDateISO || !appState.selectedTime) {
      State.showToast("Please select an available date and time slot first.");
      return;
    }

    var currentSlotStatus = State.getSlotStatus(
      doc,
      appState.selectedDateISO,
      appState.selectedTime
    );
    if (currentSlotStatus !== "available") {
      appState.slotStatusView = "slot_taken";
      appState.takenSlotLabel = appState.selectedTime;
      appState.selectedTime = null;
      renderAll();
      return;
    }

    if (!validatePatientDetails()) {
      appState.flowStage = "invalid_details";
      renderBookingFlowContainer();
      return;
    }

    appState.flowStage = "review";
    updateStepper();
    renderBookingFlowContainer();
  }

  function handleFinalizeBooking() {
    var params = new URLSearchParams(window.location.search);
    var doc = getSelectedDoctor();
    var svc = getActiveService();
    var shouldSimulateUrlFail = params.get("simulateFail") === "1" && !appState.urlFailConsumed;

    if (
      appState.simulateNextFailOnce ||
      shouldSimulateUrlFail ||
      !doc ||
      !State.isDoctorAvailable(doc) ||
      State.getSlotStatus(doc, appState.selectedDateISO, appState.selectedTime) !== "available"
    ) {
      appState.flowStage = "failed";
      renderBookingFlowContainer();
      return;
    }

    var baseFee = svc ? svc.fee : doc.fee;
    var fees = State.calculateFees({ serviceFee: baseFee });

    var bookingObj = {
      bookingId: State.generateBookingId(appState.selectedDateISO),
      createdAt: new Date().toISOString(),
      status: "Confirmed",
      doctorId: doc.id,
      doctorName: doc.name,
      doctorSpecialty: doc.specialty,
      doctorPhoto: doc.photo,
      doctorPhotoAlt: doc.photoAlt,
      serviceId: svc ? svc.id : doc.serviceId,
      serviceName: svc ? svc.shortTitle : doc.specialty,
      dateISO: appState.selectedDateISO,
      dateLabel: State.formatDisplayDate(appState.selectedDateISO),
      time: appState.selectedTime,
      patientName: appState.patientName.trim(),
      patientEmail: appState.patientEmail.trim(),
      patientPhone: appState.patientPhone.trim(),
      fees: fees
    };

    State.saveBooking(bookingObj);
    appState.confirmedBooking = bookingObj;
    appState.flowStage = "success";
    renderAll();
  }

  function escapeHtml(str) {
    return String(str || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function bindFiltersAndAccordions() {
    var searchEl = document.getElementById("doctorSearchInput");
    var specEl = document.getElementById("specialistFilter");

    searchEl.addEventListener("input", function () {
      appState.searchQuery = searchEl.value;
      renderDoctors();
    });

    specEl.addEventListener("change", function () {
      appState.specialistFilter = specEl.value;
      renderDoctors();
    });

    document.querySelectorAll("[data-accordion-target]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        if (window.innerWidth >= 768) return;
        var panelId = btn.getAttribute("data-accordion-target");
        var panel = document.getElementById(panelId);
        if (!panel) return;
        var collapsed = panel.classList.toggle("is-collapsed");
        btn.setAttribute("aria-expanded", String(!collapsed));
      });
    });

    document.querySelectorAll(".step-item").forEach(function (stepBtn) {
      stepBtn.addEventListener("click", function () {
        var step = stepBtn.getAttribute("data-step");
        var targetId =
          step === "1" ? "panelDoctor" : step === "2" ? "panelSlots" : "panelSummary";
        var targetEl = document.getElementById(targetId);
        if (targetEl) {
          targetEl.classList.remove("is-collapsed");
          targetEl.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      });
    });
  }

  function renderHeroDoctorAvatar() {
    var heroImg = document.getElementById("bookingHeroDoctorImg");
    var doc = getSelectedDoctor();
    if (!heroImg || !doc || !doc.photo) return;
    heroImg.src = doc.photo;
    heroImg.alt = doc.photoAlt || "Portrait of " + doc.name;
    var isAvailable = appState.doctorStatusView === "normal" && State.isDoctorAvailable(doc);
    heroImg.classList.toggle("doctor-photo-circle--unavailable", !isAvailable);
  }

  function renderAll() {
    updateStepper();
    renderHeroDoctorAvatar();
    renderDoctors();
    renderSlotsPanel();
    renderSummaryValues();
    renderBookingFlowContainer();
  }

  // Test hook for documented failure/unavailability verification without UI clutter
  window.MedislotBookingDebug = {
    getState: function () {
      return appState;
    },
    simulateNextBookingFail: function () {
      appState.simulateNextFailOnce = true;
    },
    setDoctorUnavailable: function (doctorId, flag) {
      State.setDoctorUnavailable(doctorId, flag);
      renderAll();
    }
  };

  document.addEventListener("DOMContentLoaded", function () {
    initDefaultsFromRouteAndStorage();
    bindFiltersAndAccordions();
    renderAll();
    State.bindPlaceholderNavLinks();
  });
})();
