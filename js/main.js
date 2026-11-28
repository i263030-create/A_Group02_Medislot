/**
 * MediSlot — Page 1 (Health Articles) Interactive Behavior
 * Handles mobile navigation toggle, category pill filtering, live search,
 * localStorage-persisted saved articles, saved popover list, pagination,
 * and the full-article reader modal.
 */

(function () {
  "use strict";

  const STORAGE_KEY = "medislot_saved_articles";
  const CARDS_PER_PAGE = 6;

  // Article dataset (18 items across 5 categories = 3 pages of 6 cards)
  // First 6 entries match the desktop prototype layout in temp/horizontal p1.jpeg.
  const ARTICLES = [
    {
      id: "healthy-heart-habits",
      category: "Heart Health",
      title: "5 Habits for a Healthy Heart",
      readTime: "4 min read",
      author: "Dr. Ayesha Khan",
      image: "images/article-heart.svg",
      paragraphs: [
        "Small daily routines make the biggest difference for long-term cardiovascular health. Aim for at least 30 minutes of brisk walking or moderate movement five days a week to strengthen your heart muscle and improve circulation.",
        "Balance your plate with leafy greens, whole grains, fatty fish, and unsalted nuts while cutting back on hidden sodium in packaged snacks. Keeping blood pressure and cholesterol in healthy ranges reduces strain on your arteries.",
        "Prioritize 7 to 8 hours of consistent sleep and schedule routine blood pressure checks with your MediSlot physician—even when you feel completely fine."
      ]
    },
    {
      id: "sun-protection-summer",
      category: "Skin Care",
      title: "Sun Protection in Summer",
      readTime: "5 min read",
      author: "MediSlot Care Team",
      image: "images/article-skin.svg",
      paragraphs: [
        "High UV index days can cause sunburn and cumulative skin damage in less than 20 minutes. Apply a broad-spectrum SPF 30 or higher sunscreen generously 15 minutes before stepping outdoors, and reapply every two hours or after sweating.",
        "Whenever possible, seek shade between 11 a.m. and 4 p.m. and pair sunscreen with wide-brimmed hats, UV-filtering sunglasses, and breathable cotton sleeves.",
        "If you notice a new mole changing in size, shape, or color, book a quick dermatology check at MediSlot for peace of mind."
      ]
    },
    {
      id: "desk-back-pain",
      category: "Bones & Joints",
      title: "Easing Back Pain at a Desk",
      readTime: "6 min read",
      author: "MediSlot Care Team",
      image: "images/article-bones.svg",
      paragraphs: [
        "Sitting with a rounded lower back or craning your neck toward a laptop puts steady pressure on spinal discs. Adjust your chair so your feet rest flat on the floor and keep your monitor top at eye level.",
        "Follow the 30-2 rule: every 30 minutes of desk work, stand up and gently stretch your shoulders, chest, and hip flexors for 2 minutes.",
        "Persistent numbness, tingling, or pain radiating down a leg warrants an orthopedic or physiotherapy evaluation rather than pushing through discomfort."
      ]
    },
    {
      id: "when-to-see-gp",
      category: "General Health",
      title: "When to See a GP",
      readTime: "3 min read",
      author: "Dr. Saba",
      image: "images/article-general.svg",
      paragraphs: [
        "Many mild viral colds improve with rest and hydration, but certain warning signs mean it is time to book a General Practitioner visit. High fever lasting beyond three days, shortness of breath, or unexplained fatigue should always be checked.",
        "Routine GP visits are equally valuable for preventive care—reviewing medications, checking lab trends, and catching early metabolic shifts before they become urgent.",
        "Bringing a brief list of symptoms, current medications, and questions helps you get the most out of every 15-minute consultation."
      ]
    },
    {
      id: "ramadan-nutrition",
      category: "Nutrition",
      title: "What to Eat in Ramadan",
      readTime: "6 min read",
      author: "MediSlot Care Team",
      image: "images/article-nutrition.svg",
      paragraphs: [
        "At Suhoor, choose slow-digesting complex carbohydrates such as oats, whole-wheat roti, or brown rice paired with protein like eggs, yogurt, or lentils to sustain energy through the day.",
        "Break your fast gently at Iftar with water and two to three dates, followed by a balanced meal with grilled protein and vegetables rather than deep-fried platters that trigger sluggishness and reflux.",
        "Spread 8 to 10 glasses of water steadily between Iftar and Suhoor, and consult your doctor ahead of time if you take daily blood pressure or diabetes medications."
      ]
    },
    {
      id: "annual-checkups-matter",
      category: "Heart Health",
      title: "Why Annual Checkups Matter",
      readTime: "3 min read",
      author: "Dr. Omar Farooq",
      image: "images/article-heart.svg",
      paragraphs: [
        "Conditions such as hypertension, elevated cholesterol, and pre-diabetes rarely cause noticeable symptoms in their earliest stages. An annual checkup spots subtle changes years before complications arise.",
        "Reviewing baseline labs once a year lets your doctor compare trends over time rather than reacting to a single isolated reading.",
        "Early lifestyle adjustments guided by real numbers are simpler, safer, and far more effective than waiting for symptoms to appear."
      ]
    },
    {
      id: "understanding-cholesterol",
      category: "Heart Health",
      title: "Understanding Good vs Bad Cholesterol",
      readTime: "5 min read",
      author: "Dr. Omar Farooq",
      image: "images/article-heart.svg",
      paragraphs: [
        "Not all cholesterol behaves the same way in your bloodstream. LDL cholesterol can gradually build up inside artery walls, while HDL cholesterol helps clear excess lipids back to the liver.",
        "Soluble fiber from oats, beans, apples, and flaxseed naturally lowers LDL, while regular aerobic exercise helps raise protective HDL levels.",
        "Ask your MediSlot physician how your lipid panel fits alongside your blood pressure, family history, and blood sugar."
      ]
    },
    {
      id: "dry-skin-winter",
      category: "Skin Care",
      title: "Preventing Dry Skin in Winter",
      readTime: "4 min read",
      author: "Dr. Hina Tariq",
      image: "images/article-skin.svg",
      paragraphs: [
        "Cold air and indoor heaters strip moisture from the skin barrier quickly. Swap very hot showers for lukewarm water and keep bathing under 10 minutes.",
        "Apply a fragrance-free ceramide or glycerin moisturizer onto slightly damp skin within three minutes of drying off to lock hydration in.",
        "If cracking, redness, or itching persists despite regular moisturizing, a dermatologist can check for eczema or contact irritation."
      ]
    },
    {
      id: "knee-joint-care",
      category: "Bones & Joints",
      title: "Protecting Your Knees While Walking",
      readTime: "5 min read",
      author: "Dr. Kamran Siddiqui",
      image: "images/article-bones.svg",
      paragraphs: [
        "Walking is one of the gentlest ways to keep knee cartilage nourished, provided your footwear offers proper arch support and shock absorption.",
        "Strengthening your quadriceps and glutes with simple wall sits and straight-leg raises takes mechanical load off the knee joint itself.",
        "Warm up at an easy pace for five minutes before picking up speed, and avoid sudden jumps in daily step counts."
      ]
    },
    {
      id: "better-sleep-hygiene",
      category: "General Health",
      title: "Sleep Hygiene for Busy Schedules",
      readTime: "4 min read",
      author: "Dr. Saba",
      image: "images/article-general.svg",
      paragraphs: [
        "Your body clock thrives on a steady wake-up time, even on weekends. Keeping your bedroom cool, dark, and quiet signals your brain to enter deeper restorative sleep stages.",
        "Avoid heavy meals and caffeine within six hours of bedtime, and dim bright phone screens 45 minutes before turning in.",
        "If loud snoring or daytime exhaustion continues for weeks, discuss sleep quality screening during your next GP visit."
      ]
    },
    {
      id: "hydration-daily-guide",
      category: "Nutrition",
      title: "How Much Water Do You Really Need?",
      readTime: "3 min read",
      author: "MediSlot Care Team",
      image: "images/article-nutrition.svg",
      paragraphs: [
        "Hydration needs shift with heat, physical activity, and diet—around 2 to 2.5 liters from fluids and water-rich foods suits most healthy adults.",
        "Pale straw-colored urine is a practical everyday sign that you are well hydrated, while headaches and afternoon fatigue can reflect mild dehydration.",
        "Keep a reusable bottle nearby and add cucumber, mint, or lemon slices if plain water feels monotonous."
      ]
    },
    {
      id: "blood-pressure-home",
      category: "Heart Health",
      title: "Measuring Blood Pressure at Home",
      readTime: "4 min read",
      author: "Dr. Ayesha Khan",
      image: "images/article-heart.svg",
      paragraphs: [
        "Accurate home readings help your doctor tailor treatment without white-coat anxiety. Rest quietly for five minutes with your back supported and feet uncrossed before pressing start.",
        "Place the cuff directly over bare skin on your upper arm resting at heart level—never over thick sleeves.",
        "Log morning and evening readings for a week before your appointment so your care team sees a reliable average."
      ]
    },
    {
      id: "acne-myths-facts",
      category: "Skin Care",
      title: "Common Acne Myths Debunked",
      readTime: "5 min read",
      author: "Dr. Hina Tariq",
      image: "images/article-skin.svg",
      paragraphs: [
        "Scrubbing your face harshly with abrasive soaps often worsens breakouts by irritating pores and triggering rebound oiliness. A gentle pH-balanced cleanser twice a day is plenty.",
        "Popping pimples pushes inflammation deeper and increases the risk of dark marks or scarring.",
        "Consistent, targeted routines take 6 to 8 weeks to show full results, so give evidence-based treatments time to work."
      ]
    },
    {
      id: "vitamin-d-bones",
      category: "Bones & Joints",
      title: "Vitamin D and Bone Strength",
      readTime: "4 min read",
      author: "Dr. Kamran Siddiqui",
      image: "images/article-bones.svg",
      paragraphs: [
        "Vitamin D helps your body absorb dietary calcium and maintain strong bone mineral density across every decade of life.",
        "Office routines and indoor lifestyles mean low Vitamin D is common even in sunny climates. Fortified dairy, egg yolks, and fatty fish contribute modest amounts.",
        "A simple blood test lets your doctor recommend the right maintenance or replacement dose rather than guessing."
      ]
    },
    {
      id: "seasonal-flu-prep",
      category: "General Health",
      title: "Preparing for Seasonal Flu",
      readTime: "3 min read",
      author: "MediSlot Care Team",
      image: "images/article-general.svg",
      paragraphs: [
        "Annual flu vaccination lowers your risk of severe respiratory illness and protects older family members and young children around you.",
        "Regular handwashing with soap for 20 seconds and avoiding touching your eyes or nose in crowded places cut transmission dramatically.",
        "Stay home to rest if you develop a fever or body aches, and seek prompt care if breathing becomes labored."
      ]
    },
    {
      id: "balanced-lunchbox",
      category: "Nutrition",
      title: "Building a Balanced Work Lunch",
      readTime: "4 min read",
      author: "MediSlot Care Team",
      image: "images/article-nutrition.svg",
      paragraphs: [
        "A midday meal heavy in refined carbs often causes a 3 p.m. energy crash. Aim to fill half your container with colorful vegetables, a quarter with lean protein, and a quarter with whole grains.",
        "Prepping roasted chickpeas, grilled chicken strips, or boiled eggs ahead of time makes healthy weekday assembly effortless.",
        "Pair lunch with fresh fruit or a handful of almonds instead of sugary bottled drinks."
      ]
    },
    {
      id: "stress-heart-link",
      category: "Heart Health",
      title: "How Chronic Stress Affects Your Heart",
      readTime: "5 min read",
      author: "Dr. Ayesha Khan",
      image: "images/article-heart.svg",
      paragraphs: [
        "Ongoing stress keeps adrenaline and cortisol elevated, nudging heart rate and blood pressure upward over time.",
        "Five minutes of slow box breathing, a brief outdoor walk without notifications, or talking with trusted friends helps reset your nervous system.",
        "If chest tightness, palpitations, or dizziness ever accompany stress, always get medically evaluated promptly."
      ]
    },
    {
      id: "iron-rich-foods",
      category: "Nutrition",
      title: "Iron-Rich Foods to Boost Energy",
      readTime: "4 min read",
      author: "Dr. Saba",
      image: "images/article-nutrition.svg",
      paragraphs: [
        "Low iron stores are a frequent, overlooked reason for persistent tiredness, pale skin, and poor exercise stamina.",
        "Combine plant sources like spinach, lentils, and kidney beans with Vitamin C foods such as lemon juice, tomatoes, or oranges to boost absorption.",
        "Avoid drinking strong tea or coffee right alongside iron-rich meals, as tannins reduce how much iron your gut absorbs."
      ]
    }
  ];

  // Application State
  const state = {
    activeCategory: "All",
    searchQuery: "",
    currentPage: 1,
    savedIds: loadSavedIds(),
    openArticleId: null
  };

  // DOM References
  const mobileMenuBtn = document.getElementById("mobileMenuBtn");
  const primaryNav = document.getElementById("primaryNav");
  const categoryPills = document.getElementById("categoryPills");
  const articleSearch = document.getElementById("articleSearch");
  const savedDropdownBtn = document.getElementById("savedDropdownBtn");
  const savedCountEl = document.getElementById("savedCount");
  const savedPopover = document.getElementById("savedPopover");
  const savedPopoverBody = document.getElementById("savedPopoverBody");
  const articlesGrid = document.getElementById("articlesGrid");
  const emptyState = document.getElementById("emptyState");
  const clearFilterBtn = document.getElementById("clearFilterBtn");
  const paginationNav = document.getElementById("paginationNav");
  const prevPageBtn = document.getElementById("prevPageBtn");
  const nextPageBtn = document.getElementById("nextPageBtn");
  const pageIndicator = document.getElementById("pageIndicator");

  const articleModal = document.getElementById("articleModal");
  const modalCategory = document.getElementById("modalCategory");
  const modalStarBtn = document.getElementById("modalStarBtn");
  const modalCloseBtn = document.getElementById("modalCloseBtn");
  const modalDoneBtn = document.getElementById("modalDoneBtn");
  const modalImage = document.getElementById("modalImage");
  const modalTitle = document.getElementById("modalTitle");
  const modalMeta = document.getElementById("modalMeta");
  const modalBody = document.getElementById("modalBody");
  const toastNotice = document.getElementById("toastNotice");

  let toastTimer = null;
  let lastFocusedElement = null;

  // =========================================================================
  // Persistence Helpers
  // =========================================================================
  function loadSavedIds() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (_err) {
      return [];
    }
  }

  function persistSavedIds() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.savedIds));
    } catch (_err) {
      // Ignore storage quota / privacy mode errors gracefully
    }
  }

  function isSaved(articleId) {
    return state.savedIds.includes(articleId);
  }

  function toggleSaved(articleId) {
    if (isSaved(articleId)) {
      state.savedIds = state.savedIds.filter(function (id) {
        return id !== articleId;
      });
    } else {
      state.savedIds.push(articleId);
    }
    persistSavedIds();
    updateSavedUI();
    renderArticles();
    if (state.openArticleId === articleId) {
      syncModalStarButton(articleId);
    }
  }

  // =========================================================================
  // Filtering & Pagination
  // =========================================================================
  function getFilteredArticles() {
    const query = state.searchQuery.trim().toLowerCase();
    return ARTICLES.filter(function (article) {
      const matchesCategory =
        state.activeCategory === "All" || article.category === state.activeCategory;
      if (!matchesCategory) return false;
      if (!query) return true;

      const searchable = [
        article.title,
        article.category,
        article.author,
        article.paragraphs.join(" ")
      ]
        .join(" ")
        .toLowerCase();

      return searchable.includes(query);
    });
  }

  function renderArticles() {
    const filtered = getFilteredArticles();
    const totalPages = Math.max(1, Math.ceil(filtered.length / CARDS_PER_PAGE));

    if (state.currentPage > totalPages) {
      state.currentPage = totalPages;
    }

    if (filtered.length === 0) {
      articlesGrid.innerHTML = "";
      articlesGrid.hidden = true;
      emptyState.hidden = false;
      paginationNav.hidden = true;
      return;
    }

    articlesGrid.hidden = false;
    emptyState.hidden = true;
    paginationNav.hidden = false;

    const startIndex = (state.currentPage - 1) * CARDS_PER_PAGE;
    const pageItems = filtered.slice(startIndex, startIndex + CARDS_PER_PAGE);

    const fragment = document.createDocumentFragment();
    pageItems.forEach(function (article) {
      fragment.appendChild(createArticleCard(article));
    });

    articlesGrid.innerHTML = "";
    articlesGrid.appendChild(fragment);

    pageIndicator.textContent = "Page " + state.currentPage + " of " + totalPages;
    prevPageBtn.disabled = state.currentPage <= 1;
    nextPageBtn.disabled = state.currentPage >= totalPages;
  }

  function createArticleCard(article) {
    const saved = isSaved(article.id);
    const card = document.createElement("article");
    card.className = "article-card";

    // Photo frame + star save button
    const photoWrap = document.createElement("div");
    photoWrap.className = "article-photo";

    const img = document.createElement("img");
    img.src = article.image;
    img.alt = article.category + " illustration";
    img.loading = "lazy";

    const starBtn = document.createElement("button");
    starBtn.type = "button";
    starBtn.className = "star-btn" + (saved ? " is-saved" : "");
    starBtn.setAttribute("aria-pressed", String(saved));
    starBtn.setAttribute(
      "aria-label",
      (saved ? "Remove " : "Save ") + article.title + (saved ? " from saved" : " for later")
    );
    starBtn.innerHTML = saved ? "&#9733;" : "&#9734;";
    starBtn.addEventListener("click", function () {
      toggleSaved(article.id);
    });

    photoWrap.appendChild(img);
    photoWrap.appendChild(starBtn);

    // Card body
    const body = document.createElement("div");
    body.className = "article-content";

    const badge = document.createElement("span");
    badge.className = "category-badge";
    badge.textContent = article.category;

    const title = document.createElement("h2");
    title.className = "article-title";
    title.textContent = article.title;

    const meta = document.createElement("p");
    meta.className = "article-meta";
    meta.textContent = article.readTime + " \u00B7 " + article.author;

    const readMoreBtn = document.createElement("button");
    readMoreBtn.type = "button";
    readMoreBtn.className = "btn btn-outline-blue read-more-btn";
    readMoreBtn.textContent = "Read More";
    readMoreBtn.addEventListener("click", function () {
      openArticleModal(article.id);
    });

    body.appendChild(badge);
    body.appendChild(title);
    body.appendChild(meta);
    body.appendChild(readMoreBtn);

    card.appendChild(photoWrap);
    card.appendChild(body);
    return card;
  }

  // =========================================================================
  // Saved Dropdown Popover
  // =========================================================================
  function updateSavedUI() {
    const validSaved = ARTICLES.filter(function (article) {
      return isSaved(article.id);
    });

    savedCountEl.textContent = String(validSaved.length);

    if (validSaved.length === 0) {
      savedPopoverBody.innerHTML =
        '<p class="saved-popover-empty">No saved articles yet.</p>';
      return;
    }

    const list = document.createElement("ul");
    list.className = "saved-list";

    validSaved.forEach(function (article) {
      const li = document.createElement("li");
      li.className = "saved-item";

      const openBtn = document.createElement("button");
      openBtn.type = "button";
      openBtn.className = "saved-item-open";
      openBtn.textContent = article.title;
      openBtn.addEventListener("click", function () {
        closeSavedPopover();
        openArticleModal(article.id);
      });

      const removeBtn = document.createElement("button");
      removeBtn.type = "button";
      removeBtn.className = "saved-item-remove";
      removeBtn.setAttribute("aria-label", "Remove " + article.title);
      removeBtn.innerHTML = "&times;";
      removeBtn.addEventListener("click", function (event) {
        event.stopPropagation();
        toggleSaved(article.id);
      });

      li.appendChild(openBtn);
      li.appendChild(removeBtn);
      list.appendChild(li);
    });

    savedPopoverBody.innerHTML = "";
    savedPopoverBody.appendChild(list);
  }

  function toggleSavedPopover() {
    const isOpen = !savedPopover.hidden;
    savedPopover.hidden = isOpen;
    savedDropdownBtn.setAttribute("aria-expanded", String(!isOpen));
  }

  function closeSavedPopover() {
    if (!savedPopover.hidden) {
      savedPopover.hidden = true;
      savedDropdownBtn.setAttribute("aria-expanded", "false");
    }
  }

  // =========================================================================
  // Full Article Modal
  // =========================================================================
  function syncModalStarButton(articleId) {
    const saved = isSaved(articleId);
    modalStarBtn.className = "star-btn" + (saved ? " is-saved" : "");
    modalStarBtn.setAttribute("aria-pressed", String(saved));
    modalStarBtn.setAttribute(
      "aria-label",
      saved ? "Remove from saved articles" : "Save article for later"
    );
    modalStarBtn.innerHTML = saved ? "&#9733;" : "&#9734;";
  }

  function openArticleModal(articleId) {
    const article = ARTICLES.find(function (item) {
      return item.id === articleId;
    });
    if (!article) return;

    lastFocusedElement = document.activeElement;
    state.openArticleId = article.id;

    modalCategory.textContent = article.category;
    modalImage.src = article.image;
    modalImage.alt = article.category + " illustration";
    modalTitle.textContent = article.title;
    modalMeta.textContent = article.readTime + " \u00B7 " + article.author;

    modalBody.innerHTML = "";
    article.paragraphs.forEach(function (text) {
      const p = document.createElement("p");
      p.textContent = text;
      modalBody.appendChild(p);
    });

    syncModalStarButton(article.id);
    articleModal.hidden = false;
    document.body.style.overflow = "hidden";
    modalCloseBtn.focus();
  }

  function closeArticleModal() {
    if (articleModal.hidden) return;
    articleModal.hidden = true;
    state.openArticleId = null;
    document.body.style.overflow = "";
    if (lastFocusedElement && typeof lastFocusedElement.focus === "function") {
      lastFocusedElement.focus();
    }
  }

  // =========================================================================
  // Mobile Navigation & Toast Helpers
  // =========================================================================
  function toggleMobileMenu() {
    const isOpen = primaryNav.classList.toggle("is-open");
    mobileMenuBtn.setAttribute("aria-expanded", String(isOpen));
  }

  function closeMobileMenu() {
    primaryNav.classList.remove("is-open");
    mobileMenuBtn.setAttribute("aria-expanded", "false");
  }

  function showToast(message) {
    toastNotice.textContent = message;
    toastNotice.hidden = false;
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(function () {
      toastNotice.hidden = true;
    }, 2600);
  }

  // =========================================================================
  // Event Wiring
  // =========================================================================
  function bindEvents() {
    mobileMenuBtn.addEventListener("click", toggleMobileMenu);

    // Category pill filter clicks
    categoryPills.addEventListener("click", function (event) {
      const btn = event.target.closest(".pill-btn");
      if (!btn) return;

      const selected = btn.getAttribute("data-category");
      if (selected === state.activeCategory) return;

      state.activeCategory = selected;
      state.currentPage = 1;

      categoryPills.querySelectorAll(".pill-btn").forEach(function (pill) {
        const isActive = pill === btn;
        pill.classList.toggle("is-active", isActive);
        pill.setAttribute("aria-pressed", String(isActive));
      });

      renderArticles();
    });

    // Live search input
    articleSearch.addEventListener("input", function (event) {
      state.searchQuery = event.target.value;
      state.currentPage = 1;
      renderArticles();
    });

    // Clear filter action from empty state
    clearFilterBtn.addEventListener("click", function () {
      state.activeCategory = "All";
      state.searchQuery = "";
      state.currentPage = 1;
      articleSearch.value = "";

      categoryPills.querySelectorAll(".pill-btn").forEach(function (pill) {
        const isAll = pill.getAttribute("data-category") === "All";
        pill.classList.toggle("is-active", isAll);
        pill.setAttribute("aria-pressed", String(isAll));
      });

      renderArticles();
    });

    // Pagination buttons
    prevPageBtn.addEventListener("click", function () {
      if (state.currentPage > 1) {
        state.currentPage -= 1;
        renderArticles();
      }
    });

    nextPageBtn.addEventListener("click", function () {
      const totalPages = Math.max(1, Math.ceil(getFilteredArticles().length / CARDS_PER_PAGE));
      if (state.currentPage < totalPages) {
        state.currentPage += 1;
        renderArticles();
      }
    });

    // Saved popover toggle & outside-click dismiss
    savedDropdownBtn.addEventListener("click", function (event) {
      event.stopPropagation();
      toggleSavedPopover();
    });

    document.addEventListener("click", function (event) {
      if (!savedPopover.hidden && !event.target.closest(".saved-dropdown")) {
        closeSavedPopover();
      }
    });

    // Modal interactions
    modalStarBtn.addEventListener("click", function () {
      if (state.openArticleId) {
        toggleSaved(state.openArticleId);
      }
    });

    modalCloseBtn.addEventListener("click", closeArticleModal);
    modalDoneBtn.addEventListener("click", closeArticleModal);

    articleModal.addEventListener("click", function (event) {
      if (event.target === articleModal) {
        closeArticleModal();
      }
    });

    // Global Escape handler
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") {
        closeArticleModal();
        closeSavedPopover();
        closeMobileMenu();
      }
    });

    // Close mobile menu when resizing to desktop width
    window.addEventListener("resize", function () {
      if (window.innerWidth >= 768) {
        closeMobileMenu();
      }
    });

    // Graceful feedback for upcoming multi-page links
    document.querySelectorAll("[data-upcoming]").forEach(function (link) {
      link.addEventListener("click", function (event) {
        event.preventDefault();
        closeMobileMenu();
        const label = link.getAttribute("data-upcoming");
        showToast(label + " page is coming in the next milestone.");
      });
    });
  }

  // Initialize Page 1
  bindEvents();
  updateSavedUI();
  renderArticles();
})();
