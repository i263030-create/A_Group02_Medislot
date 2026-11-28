# MediSlot — Frontend Project Documentation

**MediSlot** (*Your Health, Your Priority*) is a multi-page clinic appointment booking and health information web project.

## Folder Structure

```text
A_Group02_Medislot/
├── index.html                 # Page 1: Health Hub — Health Articles
├── css/
│   └── styles.css             # Global tokens, reset, layout, responsive & component styles
├── js/
│   └── main.js                # Navigation, filtering, search, localStorage saved list & modal
├── pages/                     # Reserved for secondary HTML pages (e.g., page2.html, page3.html)
├── images/                    # Production SVG brand mark and article category illustrations
│   ├── logo-icon.svg
│   ├── article-heart.svg
│   ├── article-skin.svg
│   ├── article-bones.svg
│   ├── article-general.svg
│   └── article-nutrition.svg
├── docs/
│   └── README.md              # Project structure, page overview & setup guide
└── temp/                      # Design reference prototypes (kept untouched)
```

## Page Overview

### Page 1 — Health Articles (`index.html`)
Built from the `temp/horizontal p1.jpeg` (desktop) and `temp/vertical p1.jpeg` (mobile) prototypes:
- **Responsive Header & Navigation**: Brand mark (`MediSlot`), desktop nav bar with active `Health Hub` pill and `Book Now` CTA, plus collapsible mobile hamburger menu (`≡`).
- **Hero Banner**: Displays page title (`Health Articles`) and instruction subtitle.
- **Category Filter Pills & Search**: Filter articles dynamically across `All`, `Heart Health`, `Skin Care`, `Bones & Joints`, `General Health`, and `Nutrition`, or search in real time. Includes an empty state (`No articles found` + `Clear filter`).
- **Saved Articles (`localStorage`)**: Click the star (`☆` / `★`) on any card or inside the reader modal to save/unsave articles. Saved counts and the `Saved (N) ▾` dropdown list persist across page reloads.
- **Pagination**: 6 articles per page across 3 pages (`< Prev`, `Page X of Y`, `Next >`).
- **Article Reader Modal**: Clicking `Read More` opens an accessible dialog showing the full doctor-authored article.

### Upcoming Pages (`pages/`)
- **Page 2 (`pages/page2.html`)**: Health Packages & BMI Calculator *(planned next milestone)*
- **Page 3 (`pages/page3.html`)**: FAQ & Insurance *(planned)*

## Setup Instructions

1. Clone or download the repository.
2. Open `index.html` directly in any modern web browser, or serve the root folder with a local static server:
   ```bash
   npx serve .
   ```
   or with VS Code **Live Server**.
3. No build step or external dependencies are required.
