/* =========================================================
   Medislot — Clinic Services, Doctors & Schedule Data
   Currency: PKR (Rs.)
   Approved Doctors: Dr. Amara Khan & Dr. Saba
   Additional 5 Fictional Academic Sample Profiles:
   Dr. Bilal Tariq, Dr. Zainab Raza, Dr. Hamza Siddiqui,
   Dr. Maham Qureshi, Dr. Usman Farooq
   ========================================================= */

window.MedislotData = (function () {
  "use strict";

  const SERVICES = [
    {
      id: "general-consultation",
      name: "General Consultation",
      shortTitle: "General consultation",
      fee: 1000,
      specialty: "General Physician",
      icon: "stethoscope",
      description:
        "Routine health checkups, fever and infection diagnosis, chronic care follow-ups, and personalized medical advice."
    },
    {
      id: "cardiology",
      name: "Cardiology",
      shortTitle: "Cardiology",
      fee: 2000,
      specialty: "Cardiologist",
      icon: "heart",
      description:
        "Comprehensive heart health evaluation, blood pressure management, chest pain screening, and cardiac care plans."
    },
    {
      id: "vaccination",
      name: "Vaccination",
      shortTitle: "Vaccination",
      fee: 1500,
      specialty: "General Physician",
      icon: "syringe",
      description:
        "Scheduled adult and pediatric immunizations, seasonal flu protection, and verified vaccination documentation."
    },
    {
      id: "lab-tests",
      name: "Lab Tests",
      shortTitle: "Lab Tests",
      fee: 1200,
      specialty: "General Physician",
      icon: "flask",
      description:
        "Essential blood panels, glucose and lipid screenings, and rapid diagnostic sample collection with fast reporting."
    }
  ];

  const ALL_TIME_SLOTS = [
    "09:00 AM",
    "10:00 AM",
    "11:00 AM",
    "02:00 PM",
    "04:00 PM"
  ];

  const DOCTORS = [
    {
      id: "dr-amara",
      name: "Dr. Amara Khan",
      specialty: "Cardiologist",
      serviceId: "cardiology",
      rating: 4.3,
      reviewsLabel: "20k reviews",
      fee: 2000,
      photo: "../image/dr-amara-khan.jpg",
      photoAlt: "Portrait of Dr. Amara Khan, Cardiologist",
      status: "available",
      unavailableReason: "",
      offDays: [0], // Clinic closed on Sundays (0)
      unavailableSlots: ["04:00 PM"], // Off-duty for evening 4 PM slot
      preBookedByDayOffset: {
        0: ["10:00 AM"],
        1: ["10:00 AM"],
        2: ["11:00 AM"]
      }
    },
    {
      id: "dr-saba",
      name: "Dr. Saba",
      specialty: "General Physician",
      serviceId: "general-consultation",
      rating: 4.5,
      reviewsLabel: "14k reviews",
      fee: 1000,
      photo: "../image/dr-saba.jpg",
      photoAlt: "Portrait of Dr. Saba, General Physician",
      status: "available",
      unavailableReason: "",
      offDays: [0],
      unavailableSlots: [],
      preBookedByDayOffset: {
        1: ["09:00 AM"],
        2: ["02:00 PM"]
      }
    },
    {
      id: "dr-bilal",
      name: "Dr. Bilal Tariq",
      specialty: "Dermatologist",
      serviceId: "general-consultation",
      rating: 4.6,
      reviewsLabel: "Sample rating",
      isSampleProfile: true,
      fee: 1000,
      photo: "../image/dr-bilal-tariq.jpg",
      photoAlt: "Portrait of Dr. Bilal Tariq, Dermatologist",
      status: "available",
      unavailableReason: "",
      offDays: [0],
      unavailableSlots: ["04:00 PM"],
      preBookedByDayOffset: {
        1: ["11:00 AM"],
        2: ["10:00 AM"]
      }
    },
    {
      id: "dr-zainab",
      name: "Dr. Zainab Raza",
      specialty: "Neurologist",
      serviceId: "general-consultation",
      rating: 4.7,
      reviewsLabel: "Sample rating",
      isSampleProfile: true,
      fee: 1000,
      photo: "../image/dr-zainab-raza.jpg",
      photoAlt: "Portrait of Dr. Zainab Raza, Neurologist",
      status: "available",
      unavailableReason: "",
      offDays: [0],
      unavailableSlots: ["09:00 AM"],
      preBookedByDayOffset: {
        1: ["02:00 PM"],
        2: ["11:00 AM"]
      }
    },
    {
      id: "dr-hamza",
      name: "Dr. Hamza Siddiqui",
      specialty: "Pediatrician",
      serviceId: "general-consultation",
      rating: 4.8,
      reviewsLabel: "Sample rating",
      isSampleProfile: true,
      fee: 1000,
      photo: "../image/dr-hamza-siddiqui.jpg",
      photoAlt: "Portrait of Dr. Hamza Siddiqui, Pediatrician",
      status: "available",
      unavailableReason: "",
      offDays: [0],
      unavailableSlots: [],
      preBookedByDayOffset: {
        1: ["10:00 AM"],
        2: ["04:00 PM"]
      }
    },
    {
      id: "dr-maham",
      name: "Dr. Maham Qureshi",
      specialty: "Orthopedic Specialist",
      serviceId: "general-consultation",
      rating: 4.5,
      reviewsLabel: "Sample rating",
      isSampleProfile: true,
      fee: 1000,
      photo: "../image/dr-maham-qureshi.jpg",
      photoAlt: "Portrait of Dr. Maham Qureshi, Orthopedic Specialist",
      status: "available",
      unavailableReason: "",
      offDays: [0],
      unavailableSlots: ["04:00 PM"],
      preBookedByDayOffset: {
        1: ["09:00 AM"],
        2: ["02:00 PM"]
      }
    },
    {
      id: "dr-usman",
      name: "Dr. Usman Farooq",
      specialty: "Dentist",
      serviceId: "general-consultation",
      rating: 4.4,
      reviewsLabel: "Sample rating",
      isSampleProfile: true,
      fee: 1000,
      photo: "../image/dr-usman-farooq.jpg",
      photoAlt: "Portrait of Dr. Usman Farooq, Dentist",
      status: "available",
      unavailableReason: "",
      offDays: [0],
      unavailableSlots: ["02:00 PM"],
      preBookedByDayOffset: {
        1: ["11:00 AM"],
        2: ["09:00 AM"]
      }
    }
  ];

  function getServiceById(serviceId) {
    return (
      SERVICES.find(function (s) {
        return s.id === serviceId;
      }) || null
    );
  }

  function getDoctorById(doctorId) {
    return (
      DOCTORS.find(function (d) {
        return d.id === doctorId;
      }) || null
    );
  }

  return {
    SERVICES: SERVICES,
    ALL_TIME_SLOTS: ALL_TIME_SLOTS,
    DOCTORS: DOCTORS,
    getServiceById: getServiceById,
    getDoctorById: getDoctorById
  };
})();
