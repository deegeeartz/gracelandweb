# Codebase Logic, Functionality & Security Audit Report

**Project:** RCCG Graceland Area HQ Website & Admin Portal  
**Date:** September 7, 2026  
**Status:** Review Complete — Actionable Audit & Fix Matrix  

---

## Executive Summary

A comprehensive architectural and functional review of the codebase was conducted across backend Express routes, database models, Next.js public pages, and the React Admin Portal. 

While the system's core structure (Next.js server-side rendering, Express routing, TiDB/MySQL connection pooling, and Cloudinary media processing) is robust, several critical vulnerabilities, broken user flows, and schema-to-UI mismatches were uncovered that prevent normal operation in both the admin suite and public-facing site.

---

## 1. 🚨 Critical Security Vulnerabilities

### Issue 1.1: Unprotected Database Wipe Endpoint with Hardcoded Fallback Token
* **Severity:** **CRITICAL (P0)**
* **Affected Files:**
  * [`routes/reset-database.js`](./routes/reset-database.js)
  * [`api-server.js`](./api-server.js)
* **Description:**
  The Express router in `api-server.js` mounts `routes/reset-database.js` at `/api/admin`. The reset route listens at `POST /api/admin/reset-database` and evaluates:
  ```javascript
  const adminToken = process.env.ADMIN_RESET_TOKEN || 'change-this-secret-token';
  if (token !== adminToken) {
      return res.status(403).json({ error: 'Unauthorized' });
  }
  ```
  Because `ADMIN_RESET_TOKEN` is not defined in `.env` or production variables, the fallback string `'change-this-secret-token'` is active.
* **Impact:** Any unauthenticated actor or web crawler can execute:
  ```bash
  curl -X POST https://rccggraceland.com/api/admin/reset-database \
       -H "Authorization: Bearer change-this-secret-token"
  ```
  This immediately drops all 14 database tables (`SET FOREIGN_KEY_CHECKS = 0; DROP TABLE IF EXISTS ...`), resulting in catastrophic data loss.
* **Remediation:**
  1. Guard the route with standard JWT admin authentication (`verifyToken`) and require role `'admin'`.
  2. Disallow fallback tokens: if `process.env.ADMIN_RESET_TOKEN` is unset or set to the default, disable the endpoint entirely.
  3. Ensure it is strictly disabled in `NODE_ENV === 'production'`.

---

### Issue 1.2: Unauthenticated Gallery Image Upload & Deletion
* **Severity:** **HIGH (P1)**
* **Affected File:**
  * [`routes/gallery.js`](./routes/gallery.js)
* **Description:**
  `POST /api/gallery` and `DELETE /api/gallery/:id` do not include the `verifyToken` middleware. A developer comment in `routes/gallery.js` notes:
  ```javascript
  // Admin: Upload to gallery (Assume mounted at /api/admin/gallery or protected in server.js)
  // But for ease of integration, we'll keep upload here and protect it in server.js
  ```
  However, in `api-server.js`, `routes/gallery.js` is mounted directly at `/api/gallery` without route protection.
* **Impact:** Any unauthenticated visitor or malicious script can upload arbitrary image files to the church's Cloudinary quota and permanently delete any image from the church gallery.
* **Remediation:** Import `verifyToken` from `./auth` and attach it to both `router.post('/')` and `router.delete('/:id')`.

---

## 2. 🛑 Broken Core Logic & Disconnected User Features

### Issue 2.1: Broken `/sermons` Navigation (HTTP 404)
* **Severity:** **HIGH (P1)**
* **Affected Files:**
  * [`pages/index.jsx`](./pages/index.jsx)
* **Description:**
  On the public homepage, under the Sermons section, the primary CTA button states:
  ```jsx
  <a href="/sermons" className="btn btn-primary">
      <i className="fas fa-archive"></i> View All Sermons
  </a>
  ```
  However, there is no `pages/sermons.jsx` or `pages/sermons/index.jsx` in the Next.js router.
* **Impact:** Clicking "View All Sermons" renders a 404 page for church visitors.
* **Remediation:** Create `pages/sermons.jsx` using `MainLayout`, with server-side data fetching (`getServerSideProps`) from `SermonModel`, category/speaker filtering, and audio/video playback cards.

---

### Issue 2.2: Mobile Navigation Drawer Inoperable
* **Severity:** **HIGH (P1)**
* **Affected File:**
  * [`components/layout/Header.jsx`](./components/layout/Header.jsx)
* **Description:**
  The hamburger button is rendered as:
  ```jsx
  <button className="menu-toggle" aria-label="Toggle menu">
      <span className="hamburger"></span>
      <span className="hamburger"></span>
      <span className="hamburger"></span>
  </button>
  <ul className="nav-links" id="navLinks">
  ```
  There is no React state (`useState`) or `onClick` handler attached to the button. The CSS in `styles.css` expects `.menu-toggle.active` and `.nav-links.active` to display the dropdown menu.
* **Impact:** On mobile phones and tablets, tapping the menu toggle does nothing; visitors cannot open the navigation menu.
* **Remediation:** Add `const [isNavOpen, setIsNavOpen] = useState(false)` to `Header.jsx`, toggling `.active` classes on click and closing upon navigation.

---

### Issue 2.3: Homepage Prayer Request & Connect Card Modals Are Non-Functional Stubs
* **Severity:** **HIGH (P1)**
* **Affected File:**
  * [`pages/index.jsx`](./pages/index.jsx)
* **Description:**
  Both interactive modals on the homepage intercept submit events with simulated alerts:
  ```jsx
  <form onSubmit={(e) => { e.preventDefault(); alert("Prayer request submitted!"); setIsPrayerModalOpen(false); }}>
  ```
  ```jsx
  <form onSubmit={(e) => { e.preventDefault(); alert("Connect card submitted!"); setIsMemberModalOpen(false); }}>
  ```
  Neither form sends payload requests to `POST /api/prayer` or `POST /api/members/register`. Additionally, the Connect Card modal only provides a "First Name" input, but `routes/members.js` rejects submissions without `last_name` (`First and last name are required`).
* **Impact:** Visitors believe their prayers and membership connect cards have been received by the church, but all submitted information is silently lost.
* **Remediation:** Connect both modals to controlled state and send asynchronous `POST` requests to their respective endpoints with proper validation and status feedback.

---

## 3. ⚠️ Data Schema & Admin UI Mismatches

### Issue 3.1: Prayer Requests Manager Displays Blank Request Text
* **Severity:** **MEDIUM (P2)**
* **Affected File:**
  * [`pages/admin/prayers.jsx`](./pages/admin/prayers.jsx)
* **Description:**
  The admin UI accesses `p.request` across search filtering, table rows, and the modal view:
  ```jsx
  <td>{p.request}</td>
  <p>{selectedPrayer.request}</p>
  ```
  In the database table `prayer_requests`, the column is defined as `request_text`.
* **Impact:** Administrators see a list of submitter names, but the prayer request content is completely empty.
* **Remediation:** Update property access to `p.request_text || p.request`.

---

### Issue 3.2: Blog Comments Manager Displays Blank Comment Body & Author Details
* **Severity:** **MEDIUM (P2)**
* **Affected File:**
  * [`pages/admin/comments.jsx`](./pages/admin/comments.jsx)
* **Description:**
  The admin UI attempts to display `c.content` and `c.author_email`:
  ```jsx
  <p>{c.content}</p>
  <span>{c.author_email}</span>
  ```
  In the MySQL `comments` table, the schema defines `comment`, `name`, and `email`.
* **Impact:** The "Comment Text" column in the admin moderation dashboard is always empty.
* **Remediation:** Update references to `c.comment || c.content` and `c.email || c.author_email`.

---

### Issue 3.3: Member Directory Displays Every Submitter as "Member" with No Date
* **Severity:** **MEDIUM (P2)**
* **Affected File:**
  * [`pages/admin/members.jsx`](./pages/admin/members.jsx)
* **Description:**
  The table row renders:
  ```jsx
  <td>{m.full_name || m.name || 'Member'}</td>
  <td>{m.created_at ? new Date(m.created_at).toLocaleDateString() : '—'}</td>
  ```
  The `members` database schema contains `first_name`, `last_name`, and `joined_date`.
* **Impact:** Every connect card entry in the admin table renders with name **"Member"** and date **"—"**.
* **Remediation:** Render `${m.first_name || ''} ${m.last_name || ''}`.trim() || m.full_name || 'Member' and `m.joined_date || m.created_at`.

---

### Issue 3.4: Admin Events Manager Hides Draft & Past Events
* **Severity:** **MEDIUM (P2)**
* **Affected Files:**
  * [`routes/events.js`](./routes/events.js)
  * [`pages/admin/events.jsx`](./pages/admin/events.jsx)
* **Description:**
  The admin panel fetches events via `GET /api/events`. That endpoint applies a public filter:
  ```sql
  WHERE status = 'published' AND start_time >= NOW()
  ```
* **Impact:**
  1. If an admin creates an event marked as `'draft'`, it vanishes from the table immediately upon creation.
  2. Any past events are invisible, preventing editing, archiving, or auditing.
* **Remediation:** Check for admin authentication in `GET /api/events` (or provide `GET /api/events/all`) to return all events regardless of date or status when accessed by an authorized admin.

---

### Issue 3.5: Admin Blog Pagination Locked to Page 1
* **Severity:** **MEDIUM (P2)**
* **Affected File:**
  * [`pages/admin/blog.jsx`](./pages/admin/blog.jsx)
* **Description:**
  In `fetchPosts`, the response pagination is set via:
  ```javascript
  setTotalPages(data.pagination ? data.pagination.pages : 1);
  ```
  However, `routes/admin.js` returns `{ totalPages, currentPage, totalCount }`. Because `data.pagination.pages` is `undefined`, `totalPages` defaults to `1`.
* **Impact:** The pagination buttons never advance beyond page 1, trapping admins on the first 15 blog posts.
* **Remediation:** Change assignment to `data.pagination?.totalPages || data.pagination?.pages || 1`.

---

## 4. 🔧 Backend Integration & Cloudinary Handling

### Issue 4.1: Ministry Image Upload Assigns `undefined`
* **Severity:** **MEDIUM (P2)**
* **Affected File:**
  * [`routes/ministries.js`](./routes/ministries.js)
* **Description:**
  In file upload handlers, the code reads:
  ```javascript
  imageUrl = uploadResult.secure_url;
  ```
  `cloudinaryService.uploadImage` returns `{ success, public_id, url, urls }` (keyed as `url`, not `secure_url`).
* **Impact:** Uploaded ministry images are saved as `undefined` in the database.
* **Remediation:** Change to `imageUrl = uploadResult.url || uploadResult.secure_url;`.

---

### Issue 4.2: Ministry Deletion Crashes on External / Unresolved URLs
* **Severity:** **LOW (P3)**
* **Affected File:**
  * [`routes/ministries.js`](./routes/ministries.js)
* **Description:**
  During deletion, the code passes the raw `ministry.image_url` (a full HTTP URL) to `cloudinaryService.deleteImage()`, which expects a Cloudinary `public_id`. If `deleteImage` throws, it triggers the top-level catch block and returns a 500 error.
* **Impact:** Ministries with direct URLs cannot be deleted through the admin panel.
* **Remediation:** Wrap the Cloudinary cleanup in a non-fatal `try/catch` block so database deletion proceeds even if Cloudinary file cleanup fails.

---

### Issue 4.3: Missing Comments Section on Public Blog Posts
* **Severity:** **LOW (P3)**
* **Affected File:**
  * [`pages/blog/[slug].jsx`](./pages/blog/[slug].jsx)
* **Description:**
  While `routes/comments.js` provides `GET /api/comments/post/:postId` and `POST /api/comments/post/:postId`, and the admin suite has a dedicated comment moderation panel, the public single post page (`pages/blog/[slug].jsx`) does not render existing approved comments or a submission form.
* **Impact:** The comment system cannot be used by church visitors.
* **Remediation:** Add a comment section and submission form to `pages/blog/[slug].jsx`.

---

## 5. 📦 Build, Deployment & Static Elements

### Issue 5.1: Dockerfile Missing Next.js Build Step
* **Severity:** **MEDIUM (P2)**
* **Affected File:**
  * [`Dockerfile`](./Dockerfile)
* **Description:**
  The `Dockerfile` performs `npm install` and immediately sets `CMD [ "npm", "start" ]`. Next.js requires `next build` before `next start` can run.
* **Impact:** Deploying this container results in runtime crash: `Error: Could not find a production build in the '.next' directory.`
* **Remediation:** Insert `RUN npm run build` between source copy and container start.

---

### Issue 5.2: Hardcoded Footer Contact & Social Media Information
* **Severity:** **LOW (P3)**
* **Affected File:**
  * [`components/layout/Footer.jsx`](./components/layout/Footer.jsx)
* **Description:**
  The site footer hardcodes phone numbers, church address, and social links rather than utilizing dynamic settings from the MySQL `settings` table.
* **Remediation:** Pass `settings` or read global church settings to keep the footer synchronized with the admin settings manager.

---

## Prioritized Implementation Roadmap

| Priority | Component / File | Issue Summary | Estimated Effort |
| :--- | :--- | :--- | :--- |
| **P0** | `routes/reset-database.js` | Lock down / disable public wipe endpoint | 15 mins |
| **P1** | `routes/gallery.js` | Add `verifyToken` to upload and delete | 10 mins |
| **P1** | `pages/sermons.jsx` | Implement missing sermons archive page | 45 mins |
| **P1** | `components/layout/Header.jsx` | Implement mobile hamburger drawer toggle | 15 mins |
| **P1** | `pages/index.jsx` | Wire up Prayer Request & Connect Card modals | 30 mins |
| **P2** | `pages/admin/prayers.jsx` | Fix `request_text` schema mapping | 10 mins |
| **P2** | `pages/admin/comments.jsx` | Fix `comment` and `email` schema mappings | 10 mins |
| **P2** | `pages/admin/members.jsx` | Fix full name and joined date rendering | 10 mins |
| **P2** | `routes/events.js` | Allow admins to fetch draft & past events | 20 mins |
| **P2** | `pages/admin/blog.jsx` | Fix `totalPages` pagination parsing | 5 mins |
| **P2** | `routes/ministries.js` | Fix `uploadResult.url` and safe delete | 10 mins |
| **P2** | `Dockerfile` | Add `RUN npm run build` before start | 5 mins |
| **P3** | `pages/blog/[slug].jsx` | Render comments and comment form | 35 mins |
| **P3** | `components/layout/Footer.jsx` | Dynamically bind contact & social settings | 15 mins |
