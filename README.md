# Michael Ewumi — Student Portfolio

A responsive five-page academic portfolio for **Michael Ewumi**, a BSc Cybersecurity student at **Miva Open University**. Built with semantic HTML, a single external stylesheet and vanilla JavaScript — no framework, no build step.

The design adapts the visual principles of the Framer template reference supplied with the brief: a near-black canvas, a lime accent, mono section labels, terminal panels, marquees and restrained motion, with a matching light theme.

---

## 1. Pages

| Page | File | Purpose |
| --- | --- | --- |
| Homepage | `index.html` | Name, portrait, welcome message, short biography, focus areas, featured projects, toolkit |
| About Me | `about.html` | Biography, education timeline, career aspirations, six technical skills, hobbies, audio introduction |
| Projects | `projects.html` | Four projects with covers, descriptions, category filters, links and a comparison table |
| Academic Planner | `planner.html` | Interactive task manager: add, complete, filter, sort and delete tasks with persistence |
| Contact | `contact.html` | Contact details and a validated name / email / phone / message form |

---

## 2. Tech stack

- **HTML5** — semantic landmarks, forms, tables, lists, audio, images and links.
- **CSS3** — one external stylesheet, custom properties, Grid, Flexbox, responsive breakpoints, transitions and keyframe animation.
- **JavaScript (ES5-compatible)** — event handling, DOM rendering, validation, arrays/objects/functions, `localStorage` persistence.
- **Fonts** — Space Grotesk (display), Manrope (body) and JetBrains Mono (labels), loaded from Google Fonts with system fallbacks.

No npm, bundler or server-side runtime is required.
---

## 3. File structure

```text
.
├── index.html
├── about.html
├── projects.html
├── planner.html
├── contact.html
├── css/
│   └── styles.css
├── js/
│   ├── main.js        # theme, mobile nav, scroll reveal, year, audio state
│   ├── projects.js    # project category filters
│   ├── planner.js     # task CRUD, validation, filters, localStorage
│   └── contact.js     # contact form validation and success panel
├── assets/
│   ├── audio/
│   │   └── welcome.wav
│   └── img/
│       ├── favicon.svg
│       ├── portrait.jpg
│       ├── project-sentinel.svg
│       ├── project-phishguard.svg
│       ├── project-campusshield.svg
│       └── project-studyflow.svg
└── README.md
```

---

## 4. Features

### Shared

- Sticky header with active-page state and elevated background on scroll.
- Accessible mobile menu: `aria-expanded`, Escape to close, click-outside to close, closes on link click and on resize.
- Light/dark theme toggle. Default is **dark**; the preference persists in `localStorage` under `me-theme`. An inline head script applies the saved theme before paint to avoid a flash.
- Scroll-reveal animations via `IntersectionObserver`, disabled automatically for `prefers-reduced-motion`.
- Skip link, visible focus styles and semantic landmarks.
- Dynamic copyright year.

### Homepage

- Hero with name, role, welcome copy, and a portrait.
- Marquee of study and career keywords.
- Stats strip, terminal-style `whoami` panel and four focus-area cards.
- Three featured projects and a toolkit cloud.

### About

- Profile narrative and a six-item profile facts grid.
- Education timeline and three career-aspiration cards.
- Six honestly rated skill bars across three groups.
- Four hobby cards and an HTML5 audio introduction with an animated waveform.

### Projects

- Four project cards: SentinelScan, PhishGuard, CampusShield and StudyFlow.
- Category filters (`all`, `security`, `web`, `data`) with live result status and an empty state.
- Project snapshot table with responsive `data-label` stacking.
- Clearly labelled simulated demos; StudyFlow links to the live planner.

### Planner

- Add tasks with title, course (with `datalist` suggestions), due date and priority.
- Inline validation: title required (3+ characters), due date cannot be in the past.
- Complete, delete and clear-completed actions with confirmation where destructive.
- All / Active / Completed filters, live counts, and sort by due date, priority or newest.
- Stat cards and an ARIA progress bar update on every change.
- Task list, counts and sort state persist in `localStorage` under `me-planner-tasks-v1`.
- Toast and screen-reader live-region announcements for every action.
- Responsive table that becomes stacked cards on small screens.

### Contact

- Email, GitHub, university, phone and location details (phone/location intentionally "available on request").
- Required name, email, phone and message fields with live and on-submit validation.
- Email format check; phone accepts digits only, 7–15 digits.
- Message character counter (600 max).
- Accessible errors (`aria-invalid`, `aria-describedby`, `aria-live`) and focus management.
- Success panel with a visitor name and a `ME-` reference.
- The form is a front-end demo and does not send email; the panel says so and points to the email address.

---

## 5. Publish to GitHub Pages

The site is fully static, so any static host works. GitHub Pages steps:

1. Create a new repository on GitHub, for example `student-portfolio`.
2. Install Git if it is not already installed: <https://git-scm.com/downloads>.
3. From the project folder:

```bash
git init
git add .
git commit -m "Build Michael Ewumi student portfolio"
git branch -M main
git remote add origin https://github.com/Ghost-Link/student-portfolio.git
git push -u origin main
```

4. In the repository: **Settings → Pages**.
5. Under **Build and deployment**, choose **Deploy from a branch**.
6. Select branch **main** and folder **/ (root)**, then save.
7. Wait for the deployment and open `https://github.com/Ghost-Link/student-portfolio/`.

All paths are relative, so the site works from a repository subpath as well as a custom domain.

### Other free hosts

- **Netlify** — drag the folder onto the Netlify dashboard.
- **Cloudflare Pages** — connect the repository, no build command, output directory `/`.
- **Vercel** — import the repository as a static project.

---

## 6. Personalization checklist

The site uses Michael's real details for name, university, degree, email and GitHub. The following items were not supplied and are deliberately marked as placeholders:

- [ ] **Portrait** — replace `assets/img/portrait.jpg` with a real photograph, keep a roughly 4:4.7 aspect ratio, then remove the two "Photo placeholder" labels in `index.html` (the `.portrait-tag` text and the alt-text note).
- [ ] **Phone** — replace "Available on request" in `contact.html` and the footer notes once a public number is available.
- [ ] **Location** — replace "Available on request" in `contact.html` and the footer notes.
- [ ] **LinkedIn** — add a contact item in `contact.html` and a footer link if desired.
- [ ] **Project links** — replace the `https://github.com/Ghost-Link` source links with per-project repository URLs when the repositories exist.
- [ ] **Project demos** — replace the "simulated" labels with real demo URLs when hosted.
- [ ] **Audio** — optionally replace `assets/audio/welcome.wav` with a self-recorded introduction.
- [ ] **Email delivery** — the contact form validates but does not send. To receive submissions, connect it to a static-form service (for example Formspree or Netlify Forms) or replace it with a `mailto:` flow.
- [ ] **Repository link** — add the final GitHub repository URL to this README and, if required by the submission, to the site footer.

Search the project for `available on request`, `Photo placeholder` and `simulated` to find every placeholder quickly.

---

## 7. Requirement traceability

| Requirement | Where it is implemented | Status |
| --- | --- | --- |
| Five pages: Home, About, Projects, Planner, Contact | `index.html`, `about.html`, `projects.html`, `planner.html`, `contact.html` | Complete |
| Homepage: name, photograph, welcome message, navigation, short bio, professional layout | `index.html` hero, portrait card, intro section | Complete (photo is a labelled placeholder) |
| About: education, career aspirations, technical skills, hobbies/interests | `about.html` timeline, aspiration cards, skill groups, hobby grid | Complete |
| Projects: at least three projects with description, image and real/simulated links | `projects.html` four cards with SVG covers and links | Complete |
| Planner: JS add / complete / delete with dynamic updates and persistence | `planner.html` + `js/planner.js` | Complete |
| Contact: name, email, phone, message; no empty fields; valid email; digits-only phone | `contact.html` + `js/contact.js` | Complete |
| Semantic HTML elements | `header`, `nav`, `main`, `section`, `article`, `footer`, `address`, `table`, `form` throughout | Complete |
| Forms, tables, images, hyperlinks, lists, audio or video | Contact/planner forms, project and planner tables, portrait and project images, nav/footer/project links, timeline/hobby/contact lists, About audio player | Complete |
| External stylesheet | `css/styles.css` (single file) | Complete |
| Responsive design, Flexbox and Grid, styled navigation, animations/transitions, consistent palette | Media queries at 1080/920/760/560px; Grid and Flex layouts; sticky nav; reveal, marquee, pulse, wave and hover transitions; CSS custom-property palette | Complete |
| JavaScript event handling, DOM manipulation, validation, dynamic updates, arrays/functions, interactive tasks | `main.js`, `projects.js`, `planner.js`, `contact.js` | Complete |
| Light/dark toggle retained | Theme toggle on all pages, `localStorage` key `me-theme`, default dark | Complete |
| Hostable and GitHub-submittable | Static files, relative paths, Pages instructions in section 6 | Ready (repository not yet created) |

---

## 8. Accessibility and quality notes

- Every page has one `h1`, ordered headings, landmarks and a skip link.
- All interactive controls are keyboard reachable and have visible focus styles.
- Form errors are announced with `aria-live` and linked through `aria-describedby`; invalid fields receive `aria-invalid`.
- The planner announces add/complete/delete/filter changes in a polite live region.
- The mobile menu traps nothing and closes on Escape, outside click, link activation and viewport resize.
- Motion is reduced automatically for `prefers-reduced-motion: reduce`.
- Print styles hide navigation, filters, toasts and actions, and avoid breaking cards across pages.
- The planner stores only task text, course, date and priority in the visitor's own browser.
- The contact form never transmits its contents.

## 9. Browser support

Tested in a current Chromium browser. Uses widely supported features: CSS custom properties, Grid, Flexbox, `IntersectionObserver` (with a no-JS/no-observer fallback that reveals content immediately), `crypto.randomUUID` (with a fallback) and `localStorage` (with a warning path if unavailable).

## 10. QA performed

The following checks were run against the local site (`python -m http.server 8123`):

| Area | Test | Result |
| --- | --- | --- |
| Static HTML | Exactly one `h1` per page, no duplicate IDs, balanced tags, all `header`/`nav`/`main`/`footer` landmarks | Pass |
| Links & assets | Every local `href` and `src` resolves; no stale identity files remain | Pass |
| Console | No errors on any of the five pages | Pass |
| Theme | Toggle switches palette, updates `aria-pressed`, `aria-label` and `theme-color`; preference survives reload via `me-theme` | Pass |
| Mobile nav | Toggle opens/closes; `aria-expanded` updates; menu is below the header; Escape/outside-click/resize handlers wired | Pass |
| Responsive | No horizontal page overflow at 390px or 768px; hero, project grid, stats, forms, footer and tables collapse correctly; mobile menu visible at both widths | Pass |
| Project filters | All = 4, Security = 3, Web = 1, Data = 2; `aria-pressed`, live status and empty-state logic correct | Pass |
| Contact empty submit | Four inline errors, success panel stays hidden, focus moves to name | Pass |
| Contact invalid submit | Short name, malformed email, non-digit phone and short message each rejected | Pass |
| Contact valid submit | Success panel shown and focused, name echoed, `ME-` reference generated, form and counter reset, button temporarily disabled | Pass |
| Planner seed | 6 tasks, 2 completed, 4 active, 33% progress, counts and progress ARIA correct | Pass |
| Planner validation | Empty title and past due date rejected with inline messages and focus | Pass |
| Planner add | 7 tasks, 29% progress, task rendered, toast and live-region announcement, form reset, due date minimum enforced | Pass |
| Planner complete | 3 completed, 43% progress, row struck through and checkbox checked | Pass |
| Planner filters/sort | Completed = 3, Active = 4; newest-first puts the new task first; priority sort works | Pass |
| Planner persistence | Added and completed task survives a full reload | Pass |
| Planner delete / clear | Delete removes the task and saves; clear-completed removes only completed rows; reset restores the sample set | Pass |
| Audio | `welcome.wav` loads with 18.6s duration and no media error; waveform element present | Pass |
| Lighthouse (dark) | All five pages: Accessibility 100, Best Practices 100, SEO 100 | Pass |
| Lighthouse (light) | Index, Projects, Planner and Contact: Accessibility 100, Best Practices 100, SEO 100 | Pass |

Two issues found during QA were fixed: a visible-text/accessibility-name mismatch on the brand links (redundant `aria-label` removed) and low-contrast muted text (palette tokens and the terminal `dim` colour darkened/lightened to meet WCAG AA).

