# ORUMA Wellness - Website Source Code

Source code for [oruma.me](https://oruma.me), exported from the SiteCanvas platform.

## Tech Stack

| Technology | Purpose |
|------------|---------|
| [React 18](https://react.dev) | UI framework |
| [React Router 6](https://reactrouter.com) | Client-side routing |
| [Vite 6](https://vite.dev) | Build tool & dev server |
| [TypeScript](https://www.typescriptlang.org) | Type safety |
| [Tailwind CSS](https://tailwindcss.com) | Utility-first CSS (loaded via CDN) |
| [Lucide Icons](https://lucide.dev) | Icon library (loaded via CDN) |
| [Google Fonts](https://fonts.google.com) | Playfair Display (headings) + Inter (body) |

## Project Structure

```
oruma/
  public/assets/      # Images and static files (131 files)
  routes/             # Page components (16 pages)
    index.tsx          # Homepage
    about.tsx          # About page
    services.tsx       # Services overview
    services/          # Nested service pages
      couple-therapy.tsx
      individual-therapy.tsx
      follow-up.tsx
      sexual-wellness.tsx
    concerns.tsx       # Concerns overview
    concerns/
      all-concerns.tsx
    therapists.tsx     # Therapist directory
    team.tsx           # Team page
    contact.tsx        # Contact page
    consultation.tsx   # Consultation page
    online-counselling.tsx
    articles.tsx       # Articles/blog
    careers.tsx        # Careers page
  components/          # Reusable UI components (72 files)
  src/
    main.tsx           # React entry point
    App.tsx            # Router setup with all routes
    icons.tsx          # Lucide icon component
  index.html           # HTML shell with CDN links
  vite.config.ts       # Vite configuration
  tsconfig.json        # TypeScript configuration
  package.json
```

## Prerequisites

- [Node.js](https://nodejs.org) 18 or later
- npm (comes with Node.js)

## Local Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev
```

Opens at **http://localhost:5173** with hot reload.

## Build for Production

```bash
# Create optimized build
npm run build

# Preview the production build locally
npm run preview
```

The build output goes to the `dist/` directory.

---

## Deployment

### Vercel

1. Push this project to a GitHub/GitLab repository.

2. Go to [vercel.com](https://vercel.com), import the repository.

3. Vercel auto-detects Vite. Confirm these settings:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

4. Click **Deploy**.

For SPA routing, create `vercel.json` in the project root:

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

### Cloudflare Pages

1. Push this project to a GitHub/GitLab repository.

2. Go to [Cloudflare Dashboard](https://dash.cloudflare.com) > **Workers & Pages** > **Create** > **Pages** > **Connect to Git**.

3. Configure build settings:
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`

4. Click **Save and Deploy**.

For SPA routing, create `public/_redirects`:

```
/*    /index.html   200
```

**CLI deploy (without Git):**

```bash
npm run build
npx wrangler pages deploy dist --project-name=oruma-wellness
```

### Firebase Hosting

1. Install the Firebase CLI:

```bash
npm install -g firebase-tools
firebase login
```

2. Initialize Firebase in the project:

```bash
firebase init hosting
```

When prompted:
- **Public directory**: `dist`
- **Single-page app**: Yes
- **Overwrite dist/index.html**: No

3. Build and deploy:

```bash
npm run build
firebase deploy
```

This creates a `firebase.json` like:

```json
{
  "hosting": {
    "public": "dist",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [
      { "source": "**", "destination": "/index.html" }
    ]
  }
}
```

### Netlify

1. Push to a Git repository and import in [Netlify](https://app.netlify.com).

2. Build settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`

3. For SPA routing, create `public/_redirects`:

```
/*    /index.html   200
```

**CLI deploy (without Git):**

```bash
npm run build
npx netlify deploy --dir=dist --prod
```

---

## Notes

- **Tailwind CSS** is loaded from the CDN via `<script src="https://cdn.tailwindcss.com">`. For production, consider migrating to a local Tailwind installation with PostCSS for smaller bundle size and better performance.
- **Assets**: All image URLs are local (`/assets/...`) and fully self-contained.
- **Icons**: Lucide icons are loaded from a CDN and initialized via a MutationObserver. They render as `<i data-lucide="icon-name">` elements that get replaced with SVGs on page load.
