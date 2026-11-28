/**
 * MediSlot shared clinic data: doctors, reviews, availability, and departments.
 * Loaded via <script src="data/doctors.js"></script> so it works over both file:// and http://.
 */
(function (global) {
  'use strict';

  var DEPARTMENTS = [
    {
      id: 'cardiology',
      name: 'Cardiology',
      tagline: 'Comprehensive heart & vascular care',
      description:
        'Preventive cardiac screening, ECG/echocardiography, hypertension management, and personalized interventional cardiology follow-up.',
      services: ['ECG & Stress Testing', 'Echocardiography', 'Hypertension Clinic', 'Lipid Management'],
      floor: '2nd Floor, Wing A',
      hours: 'Mon-Sat, 8:00 AM - 6:00 PM',
      accent: '#0F766E'
    },
    {
      id: 'orthopedics',
      name: 'Orthopedics',
      tagline: 'Joint, spine, and sports injury recovery',
      description:
        'Targeted care for fractures, arthritis, back and neck pain, ligament injuries, and structured post-operative rehabilitation plans.',
      services: ['Joint Pain Assessment', 'Sports Injury Clinic', 'Spine & Posture Care', 'Fracture Follow-Up'],
      floor: '3rd Floor, Wing A',
      hours: 'Mon-Sat, 9:00 AM - 6:00 PM',
      accent: '#4338CA'
    },
    {
      id: 'neurology',
      name: 'Neurology',
      tagline: 'Brain, spine, and nervous system care',
      description:
        'Evaluation and ongoing management for migraines, epilepsy, stroke recovery, neuropathy, and movement or memory disorders.',
      services: ['Migraine & Headache Clinic', 'EEG & Nerve Studies', 'Stroke Follow-Up', 'Epilepsy Management'],
      floor: '2nd Floor, Wing B',
      hours: 'Mon-Sat, 9:00 AM - 5:30 PM',
      accent: '#7C3AED'
    },
    {
      id: 'pediatrics',
      name: 'Pediatrics',
      tagline: 'Compassionate care for infants, kids & teens',
      description:
        'Well-child checkups, growth and developmental tracking, routine childhood immunizations, and prompt pediatric acute illness visits.',
      services: ['Well-Child Visits', 'Childhood Immunizations', 'Growth & Nutrition', 'Pediatric Fever & Allergy'],
      floor: '1st Floor, Wing A',
      hours: 'Mon-Sat, 8:30 AM - 7:30 PM',
      accent: '#D97706'
    },
    {
      id: 'dermatology',
      name: 'Dermatology',
      tagline: 'Clinical skin, hair, and nail specialists',
      description:
        'Evidence-based diagnosis and treatment for eczema, acne, psoriasis, skin allergies, mole mapping, and minor dermatological procedures.',
      services: ['Dermatoscopy & Mole Check', 'Acne & Rosacea Care', 'Allergy Patch Testing', 'Pediatric Dermatology'],
      floor: '1st Floor, Wing B',
      hours: 'Mon-Sat, 9:00 AM - 7:00 PM',
      accent: '#0369A1'
    }
  ];

  // Availability offsets (days from today) so the calendar stays realistic on any date
  var DOCTORS = [
    {
      id: 'dr-ayesha-khan',
      name: 'Dr. Ayesha Khan',
      speciality: 'Cardiology',
      qualifications: 'MBBS, FCPS (Cardiology)',
      gender: 'Female',
      experience: 14,
      availabilityTag: 'Today',
      availableToday: true,
      availableThisWeek: true,
      consultationFee: '$85',
      room: 'Suite 204',
      languages: ['English', 'Urdu'],
      initials: 'AK',
      avatarBg: '#CCFBF1',
      avatarFg: '#0F766E',
      about:
        'Dr. Ayesha Khan is a senior consultant cardiologist with 14 years of clinical experience in preventive cardiology, heart failure management, and non-invasive cardiac imaging. She focuses on clear patient education and sustainable lifestyle-plus-medication plans.',
      education: [
        'MBBS — King Edward Medical University',
        'FCPS (Cardiology) — College of Physicians & Surgeons',
        'Fellowship in Non-Invasive Echocardiography'
      ],
      services: ['Hypertension Management', 'Echocardiography Review', 'Chest Pain Evaluation', 'Preventive Cardiac Screening'],
      scheduleOffsets: [
        { dayOffset: 0, slots: ['09:30 AM', '11:30 AM', '04:00 PM'] },
        { dayOffset: 1, slots: ['10:00 AM', '02:00 PM'] },
        { dayOffset: 2, slots: ['09:00 AM', '12:30 PM', '05:00 PM'] },
        { dayOffset: 4, slots: ['11:00 AM', '03:30 PM'] }
      ],
      reviews: [
        {
          id: 'rev-ak-1',
          author: 'Bilal Ahmed',
          rating: 5,
          date: '2026-11-18',
          comment: 'Very thorough and calm. Explained my ECG results clearly and adjusted my blood pressure plan without rushing.'
        },
        {
          id: 'rev-ak-2',
          author: 'Sana Tariq',
          rating: 5,
          date: '2026-11-09',
          comment: 'Booked for my mother and felt genuinely listened to. Follow-up instructions were crisp and easy to follow.'
        },
        {
          id: 'rev-ak-3',
          author: 'Hassan Raza',
          rating: 4,
          date: '2026-10-27',
          comment: 'Great diagnostic clarity and minimal wait time at Suite 204.'
        }
      ]
    },
    {
      id: 'dr-omar-farooq',
      name: 'Dr. Omar Farooq',
      speciality: 'Cardiology',
      qualifications: 'MBBS, FCPS (Medicine), FCPS (Cardiology)',
      gender: 'Male',
      experience: 11,
      availabilityTag: 'This Week',
      availableToday: false,
      availableThisWeek: true,
      consultationFee: '$80',
      room: 'Suite 208',
      languages: ['English', 'Arabic'],
      initials: 'OF',
      avatarBg: '#E0F2FE',
      avatarFg: '#0369A1',
      about:
        'Dr. Omar Farooq specializes in arrhythmia evaluation, lipid disorders, and cardiac risk assessment for working adults. He emphasizes early detection and practical follow-up schedules.',
      education: [
        'MBBS — Aga Khan Medical College',
        'FCPS (Internal Medicine & Cardiology)'
      ],
      services: ['Arrhythmia Consultation', 'Lipid & Cholesterol Care', 'Stress Test Interpretation'],
      scheduleOffsets: [
        { dayOffset: 1, slots: ['10:30 AM', '01:00 PM', '04:30 PM'] },
        { dayOffset: 3, slots: ['09:30 AM', '03:00 PM'] },
        { dayOffset: 5, slots: ['11:00 AM', '02:30 PM'] }
      ],
      reviews: [
        {
          id: 'rev-of-1',
          author: 'Nadia Malik',
          rating: 5,
          date: '2026-11-12',
          comment: 'Clear communication and practical advice on managing cholesterol and palpitations.'
        },
        {
          id: 'rev-of-2',
          author: 'Zainab Qureshi',
          rating: 4,
          date: '2026-10-30',
          comment: 'Very structured consultation and helpful written summary.'
        }
      ]
    },
    {
      id: 'dr-zara-malik',
      name: 'Dr. Zara Malik',
      speciality: 'Dermatology',
      qualifications: 'MBBS, FCPS (Dermatology)',
      gender: 'Female',
      experience: 9,
      availabilityTag: 'Today',
      availableToday: true,
      availableThisWeek: true,
      consultationFee: '$70',
      room: 'Suite 112',
      languages: ['English', 'Urdu'],
      initials: 'ZM',
      avatarBg: '#FCE7F3',
      avatarFg: '#9D174D',
      about:
        'Dr. Zara Malik treats chronic inflammatory skin conditions, pediatric rashes, and hair/scalp disorders using evidence-based regimens tailored to sensitive skin.',
      education: [
        'MBBS — Dow University of Health Sciences',
        'FCPS (Dermatology) — College of Physicians & Surgeons'
      ],
      services: ['Eczema & Psoriasis Care', 'Acne Treatment Plans', 'Mole & Skin Screening', 'Hair Loss Evaluation'],
      scheduleOffsets: [
        { dayOffset: 0, slots: ['11:00 AM', '02:00 PM', '05:30 PM'] },
        { dayOffset: 2, slots: ['10:00 AM', '01:30 PM'] },
        { dayOffset: 3, slots: ['09:30 AM', '04:00 PM'] }
      ],
      reviews: [
        {
          id: 'rev-zm-1',
          author: 'Hira Siddiqui',
          rating: 5,
          date: '2026-11-20',
          comment: 'Resolved my persistent eczema flare-up in three weeks with a gentle routine.'
        },
        {
          id: 'rev-zm-2',
          author: 'Usman Ali',
          rating: 5,
          date: '2026-11-04',
          comment: 'Friendly, attentive, and did not push unnecessary products.'
        }
      ]
    },
    {
      id: 'dr-daniel-reed',
      name: 'Dr. Daniel Reed',
      speciality: 'Dermatology',
      qualifications: 'MBBS, FCPS (Dermatology)',
      gender: 'Male',
      experience: 7,
      availabilityTag: 'This Week',
      availableToday: false,
      availableThisWeek: true,
      consultationFee: '$65',
      room: 'Suite 115',
      languages: ['English'],
      initials: 'DR',
      avatarBg: '#E0E7FF',
      avatarFg: '#3730A3',
      about:
        'Dr. Daniel Reed joined MediSlot recently with a focus on dermatoscopy, contact dermatitis, and minor outpatient skin procedures. He welcomes new patients for comprehensive skin evaluations.',
      education: [
        'MBBS — University of Health Sciences',
        'FCPS (Dermatology)'
      ],
      services: ['Contact Dermatitis', 'Dermatoscopy', 'Wart & Lesion Removal'],
      scheduleOffsets: [
        { dayOffset: 2, slots: ['09:00 AM', '11:30 AM', '03:00 PM'] },
        { dayOffset: 4, slots: ['10:30 AM', '02:30 PM'] }
      ],
      // Intentionally empty to verify and showcase the "No reviews yet" state
      reviews: []
    },
    {
      id: 'dr-hamza-sheikh',
      name: 'Dr. Hamza Sheikh',
      speciality: 'General Physician',
      qualifications: 'MBBS, FCPS (Medicine)',
      gender: 'Male',
      experience: 16,
      availabilityTag: 'Today',
      availableToday: true,
      availableThisWeek: true,
      consultationFee: '$55',
      room: 'Suite 003',
      languages: ['English', 'Urdu', 'Punjabi'],
      initials: 'HS',
      avatarBg: '#D1FAE5',
      avatarFg: '#065F46',
      about:
        'Dr. Hamza Sheikh leads primary care at MediSlot with 16 years of experience managing acute infections, diabetes, thyroid disorders, and preventive adult health checkups.',
      education: [
        'MBBS — Allama Iqbal Medical College',
        'FCPS (Internal Medicine)'
      ],
      services: ['General Medical Consults', 'Diabetes & Thyroid Care', 'Preventive Physicals', 'Travel Vaccinations'],
      scheduleOffsets: [
        { dayOffset: 0, slots: ['08:30 AM', '10:30 AM', '01:00 PM', '06:00 PM'] },
        { dayOffset: 1, slots: ['09:00 AM', '12:00 PM', '05:00 PM'] },
        { dayOffset: 2, slots: ['08:30 AM', '03:00 PM'] },
        { dayOffset: 3, slots: ['10:00 AM', '04:00 PM'] }
      ],
      reviews: [
        {
          id: 'rev-hs-1',
          author: 'Kamran Javed',
          rating: 5,
          date: '2026-11-21',
          comment: 'Our family physician for years. Always takes time to review lab trends carefully.'
        },
        {
          id: 'rev-hs-2',
          author: 'Farah Naz',
          rating: 4,
          date: '2026-11-10',
          comment: 'Very practical and reassuring. Same-day appointment ran right on time.'
        },
        {
          id: 'rev-hs-3',
          author: 'Adeel Hussain',
          rating: 5,
          date: '2026-10-19',
          comment: 'Helped get my diabetes readings under control within two months.'
        }
      ]
    },
    {
      id: 'dr-maryam-noor',
      name: 'Dr. Maryam Noor',
      speciality: 'General Physician',
      qualifications: 'MBBS, FCPS (Family Medicine)',
      gender: 'Female',
      experience: 8,
      availabilityTag: 'Today',
      availableToday: true,
      availableThisWeek: true,
      consultationFee: '$55',
      room: 'Suite 007',
      languages: ['English', 'Urdu'],
      initials: 'MN',
      avatarBg: '#FEF3C7',
      avatarFg: '#92400E',
      about:
        'Dr. Maryam Noor practices holistic family medicine, focusing on women’s wellness, metabolic health, respiratory infections, and preventive screenings.',
      education: [
        'MBBS — Rawalpindi Medical University',
        'FCPS (Family Medicine)'
      ],
      services: ['Women’s Primary Care', 'Respiratory & Fever Care', 'Routine Bloodwork Review'],
      scheduleOffsets: [
        { dayOffset: 0, slots: ['10:00 AM', '01:30 PM', '04:30 PM'] },
        { dayOffset: 1, slots: ['11:00 AM', '03:30 PM'] },
        { dayOffset: 4, slots: ['09:30 AM', '02:00 PM'] }
      ],
      reviews: [
        {
          id: 'rev-mn-1',
          author: 'Amna Bashir',
          rating: 5,
          date: '2026-11-15',
          comment: 'Compassionate and organized. Answered every question I brought in.'
        }
      ]
    },
    {
      id: 'dr-tariq-mehmood',
      name: 'Dr. Tariq Mehmood',
      speciality: 'Orthopedics',
      qualifications: 'MBBS, FCPS (Orthopedic Surgery)',
      gender: 'Male',
      experience: 15,
      availabilityTag: 'This Week',
      availableToday: false,
      availableThisWeek: true,
      consultationFee: '$90',
      room: 'Suite 302',
      languages: ['English', 'Urdu'],
      initials: 'TM',
      avatarBg: '#EDE9FE',
      avatarFg: '#5B21B6',
      about:
        'Dr. Tariq Mehmood is an orthopedic specialist experienced in knee and shoulder preservation, sports ligament injuries, and conservative spine rehabilitation.',
      education: [
        'MBBS — Quaid-e-Azam Medical College',
        'FCPS (Orthopedic Surgery)'
      ],
      services: ['Knee & Shoulder Pain', 'Sports Ligament Injuries', 'Back & Sciatica Assessment', 'Fracture Care'],
      scheduleOffsets: [
        { dayOffset: 1, slots: ['09:30 AM', '12:00 PM', '04:00 PM'] },
        { dayOffset: 3, slots: ['10:30 AM', '03:00 PM'] },
        { dayOffset: 5, slots: ['09:00 AM', '01:00 PM'] }
      ],
      reviews: [
        {
          id: 'rev-tm-1',
          author: 'Saad Iqbal',
          rating: 5,
          date: '2026-11-14',
          comment: 'Diagnosed my meniscus strain immediately and recommended physiotherapy before surgery. Spot-on guidance.'
        },
        {
          id: 'rev-tm-2',
          author: 'Rida Waqar',
          rating: 4,
          date: '2026-10-22',
          comment: 'Very knowledgeable and clear when walking through X-ray findings.'
        }
      ]
    },
    {
      id: 'dr-elena-vance',
      name: 'Dr. Elena Vance',
      speciality: 'Orthopedics',
      qualifications: 'MBBS, FCPS (Orthopedics)',
      gender: 'Female',
      experience: 10,
      availabilityTag: 'Today',
      availableToday: true,
      availableThisWeek: true,
      consultationFee: '$85',
      room: 'Suite 305',
      languages: ['English', 'Spanish'],
      initials: 'EV',
      avatarBg: '#FFE4E6',
      avatarFg: '#9F1239',
      about:
        'Dr. Elena Vance focuses on joint arthritis care, bone health, ergonomic spine disorders, and guided physical recovery programs for active patients.',
      education: [
        'MBBS — Shifa College of Medicine',
        'FCPS (Orthopedics & Trauma)'
      ],
      services: ['Osteoarthritis Care', 'Ergonomic Spine Rehab', 'Osteoporosis Screening'],
      scheduleOffsets: [
        { dayOffset: 0, slots: ['12:00 PM', '03:00 PM', '05:00 PM'] },
        { dayOffset: 2, slots: ['09:30 AM', '01:30 PM'] },
        { dayOffset: 4, slots: ['11:00 AM', '04:00 PM'] }
      ],
      reviews: [
        {
          id: 'rev-ev-1',
          author: 'Tania Joseph',
          rating: 5,
          date: '2026-11-19',
          comment: 'Gave me a clear mobility plan for chronic lower back stiffness. Already feeling better.'
        },
        {
          id: 'rev-ev-2',
          author: 'Imran Aziz',
          rating: 4,
          date: '2026-11-01',
          comment: 'Attentive and practical approach without rushing.'
        }
      ]
    },
    {
      id: 'dr-salman-qureshi',
      name: 'Dr. Salman Qureshi',
      speciality: 'Neurology',
      qualifications: 'MBBS, FCPS (Neurology)',
      gender: 'Male',
      experience: 13,
      availabilityTag: 'Today',
      availableToday: true,
      availableThisWeek: true,
      consultationFee: '$95',
      room: 'Suite 214',
      languages: ['English', 'Urdu'],
      initials: 'SQ',
      avatarBg: '#EDE9FE',
      avatarFg: '#6D28D9',
      about:
        'Dr. Salman Qureshi is a consultant neurologist specializing in chronic migraine prevention, seizure disorders, and peripheral neuropathy diagnostics.',
      education: [
        'MBBS — Dow University of Health Sciences',
        'FCPS (Neurology) — College of Physicians & Surgeons'
      ],
      services: ['Migraine Care', 'EEG Evaluation', 'Neuropathy Management', 'Stroke Recovery'],
      scheduleOffsets: [
        { dayOffset: 0, slots: ['10:00 AM', '01:00 PM', '04:30 PM'] },
        { dayOffset: 2, slots: ['09:30 AM', '02:30 PM'] },
        { dayOffset: 4, slots: ['11:00 AM', '03:00 PM'] }
      ],
      reviews: [
        {
          id: 'rev-sq-1',
          author: 'Maha Rizwan',
          rating: 5,
          date: '2026-11-16',
          comment: 'Very patient listener. His migraine prevention plan cut my headaches in half within a month.'
        },
        {
          id: 'rev-sq-2',
          author: 'Faisal Nadeem',
          rating: 5,
          date: '2026-11-03',
          comment: 'Explained nerve study results in plain English and answered every question.'
        }
      ]
    },
    {
      id: 'dr-hina-zaidi',
      name: 'Dr. Hina Zaidi',
      speciality: 'Pediatrics',
      qualifications: 'MBBS, FCPS (Pediatrics)',
      gender: 'Female',
      experience: 12,
      availabilityTag: 'Today',
      availableToday: true,
      availableThisWeek: true,
      consultationFee: '$65',
      room: 'Suite 104',
      languages: ['English', 'Urdu'],
      initials: 'HZ',
      avatarBg: '#FEF3C7',
      avatarFg: '#B45309',
      about:
        'Dr. Hina Zaidi provides warm, family-centered pediatric care covering newborn checkups, childhood vaccinations, respiratory infections, and adolescent wellness.',
      education: [
        'MBBS — Aga Khan Medical College',
        'FCPS (Pediatrics) — College of Physicians & Surgeons'
      ],
      services: ['Well-Child Checkups', 'Immunizations', 'Pediatric Asthma & Allergy', 'Nutrition Guidance'],
      scheduleOffsets: [
        { dayOffset: 0, slots: ['09:00 AM', '11:30 AM', '03:30 PM'] },
        { dayOffset: 1, slots: ['10:00 AM', '02:00 PM', '05:00 PM'] },
        { dayOffset: 3, slots: ['09:30 AM', '01:30 PM'] }
      ],
      reviews: [
        {
          id: 'rev-hz-1',
          author: 'Sadia Imran',
          rating: 5,
          date: '2026-11-22',
          comment: 'Wonderful with toddlers. My son was completely relaxed during his checkup and vaccines.'
        },
        {
          id: 'rev-hz-2',
          author: 'Rehan Khalid',
          rating: 5,
          date: '2026-11-08',
          comment: 'Thorough, gentle, and gives very clear guidance for parents.'
        }
      ]
    }
  ];

  global.MEDISLOT_DATA = {
    doctors: DOCTORS,
    departments: DEPARTMENTS
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = global.MEDISLOT_DATA;
  }
})(typeof window !== 'undefined' ? window : globalThis);
