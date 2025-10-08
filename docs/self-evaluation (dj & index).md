# Self-Evaluation – Assignment 2 (Index & DJ only)

**Student:** _Pedro San Martin_  
**Deliverables:** Code + `docs/screenshots.md` (screenshots) + this self-evaluation.

---

## Points Claimed
- **Core HTML:** 50 / 50  
- **Basic CSS:** 30 / 30  
- **More CSS:** 10 / 10  
- **Role Based:** 10 / 10  
**Total:** **100 / 100**

---

## Core HTML (50)

**Points claimed:** **50 / 50**

**How I satisfy this (Index & DJ):**
- **Semantic HTML5** on both pages: `header`, `nav`, `main`, `aside`, `footer`; clear section headings.
- **Lists:** top navigation on Index (`ul.topnav`) and DJ sidebar menu (`ul.menu`).
- **Table:** DJ “Current on-air queue” uses `caption`, `thead`, `tbody`, and `th scope="col"`.
- **Forms & native validation:**
  - DJ “Choose assigned playlist”: separate `type="date"` + `type="time"` inputs for time slot, playlist `<select>`, all `required`.
  - DJ “Quick add”: `type="search"` with `required` and `pattern`.
  - DJ “On-air notes”: `textarea` with `maxlength`.
  - Labels linked via `for`, grouped with `fieldset` + `legend`.
- **Accessibility:** `aria-current="page"` in nav; `aria-live="polite"` status region on DJ; logical source order and focusable controls.

**Evidence (screenshots):**  
`index.png`, `dj-select.png`, `dj-queue.png`, `dj-quick-add.png`, `dj-notes.png`.

---

## Basic CSS (30)

**Points claimed:** **30 / 30**

**How I satisfy this (Index & DJ):**
- **External stylesheet** `assets/css/base.css` with a minimal, modern theme:
  - Color tokens (light/dark via `prefers-color-scheme`), typography, spacing, shadows, radii.
  - Component styles for **buttons**, **tables**, **forms**, **cards**.
  - Accessible focus rings and readable contrast.
- **Selectors & specificity** are clean and maintainable; consistent look across Index & DJ.

**Evidence:** `assets/css/base.css` and the screenshots above.

---

## More CSS (10)

**Points claimed:** **10 / 10**

**How I satisfy this (Index & DJ):**
- **CSS Grid** for page layout (`.layout`: header, sidebar, content, footer).
- **Flexbox** for action groups (`.toolbar` in DJ forms/queue).
- **Style placement varieties (as required):**
  - **External**: `assets/css/base.css`.
  - **Internal**: small `<style>` block in `index.html` (hero section).
  - **Inline**: one minimal inline style on the DJ page (single element) to demonstrate the pattern.

**Evidence:** Layout visible in `index.png`; toolbars/actions in `dj-queue.png`.

---

## Role Based (10)

**Points claimed:** **10 / 10**

**How I satisfy this (DJ core screen):**
- **Assignment**: choose date, time, and playlist (required fields).
- **Current on-air queue**: table with UI actions (move up/down, remove) and clear structure.
- **Quick add**: add tracks to top/bottom with validation.
- **On-air notes**: textarea with length limit for break script.
- **Index** provides the app shell and navigation to the DJ core screen.

**Evidence:** `dj-choose.png`, `dj-queue.png`, `dj-quick-add.png`, `dj-notes.png`.

---

## Final Checklist (Index & DJ)

- [x] `index.html` and `dj.html` open and navigate correctly.  
- [x] Forms show native validation on missing/invalid input.  
- [x] Queue table uses caption/thead/tbody/`th[scope]`.  
- [x] External + internal + inline CSS are demonstrated.  
- [x] Screenshots added to `docs/output.md`.

