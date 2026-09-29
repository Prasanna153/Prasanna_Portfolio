# Prasanna T – Portfolio Website

React + Vite + Tailwind + Framer Motion (front end) and Node + Express (back end).
Dark glass design, particle background, typing effect, scroll animations, certificate lightbox,
contact form, and an **admin login** to add / edit / remove certificates.

## 1. Run it on your computer

1. Install Node.js (version 20.19 or newer) from https://nodejs.org
2. Open a terminal in this folder and run:

```
npm install
```

3. Copy `.env.example` to a new file named `.env`, then open `.env` and set your own
   `ADMIN_PASSWORD` (long and hard to guess) and `JWT_SECRET` (any long random text).
4. Start the website for development:

```
npm run dev
```

Open http://localhost:5173 . The admin page is http://localhost:5173/admin

To run the finished version: `npm run build` then `npm start` → http://localhost:3001

## 2. Where to change things

| What you want to change | File |
| --- | --- |
| Name, intro, skills, projects, education, courses, links (LinkedIn!) | `src/data/portfolio.js` |
| Profile photo | replace `public/profile.jpg` |
| Resume download | replace `public/Prasanna_T_Resume.pdf` |
| Colours | `tailwind.config.js` |

Add your LinkedIn link in `src/data/portfolio.js` (`linkedin: ''`). Set `showPhone: true` there if you
want your phone number visible. Project links: fill `repo` and `demo` for each project.

## 3. Manage your site from the admin page

Go to `your-website/admin` and sign in with the username and password from `.env`.

- **Projects** — add, edit, delete and reorder your project cards.
- **Skills** — add or remove skill groups and the tags inside each one.
- **Certificates** — choose an image, type a title, and press **Add certificate**. It appears on the site at once. Use **Edit** to change the text, or **Delete** to remove it.
- **Resume** — upload a PDF to replace the file every "Download resume" button gives out. The old one is overwritten as soon as you upload a new one; there's no separate step to publish it.
- **Messages** — shows what visitors sent from the contact form.

Everything you change here appears on the live site immediately — no rebuild or restart needed.

## 4. Put it online

The site needs a host that can run Node (Render, Railway, Fly.io, a VPS). Vercel/Netlify alone
cannot save new certificates, because they do not keep uploaded files.

Example on Render:
1. Upload this folder to a GitHub repository (do **not** upload `.env`).
2. On render.com: New → Web Service → pick the repository.
3. Build command: `npm install --include=dev && npm run build`  ·  Start command: `npm start`
4. Environment: add `ADMIN_USERNAME`, `ADMIN_PASSWORD`, `JWT_SECRET`.
5. **Important:** attach a persistent disk (for example mounted at `/var/data`) and add
   `DATA_DIR=/var/data`. Without a disk, certificates you add in admin are lost each time the
   host restarts or redeploys. The two starter certificates always come back.
