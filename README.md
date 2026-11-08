# Fernhollow (APE2601)

A regenerative design studio site. Wander through a night valley of flowers that grows as you move.

Built with React 19, Vite, Tailwind CSS 4 and Motion.

## Run locally

Prerequisites: Node.js 20+

```bash
npm install
npm run dev      # http://localhost:3000
```

Other scripts:

```bash
npm run build    # production build into dist/
npm run preview  # preview the production build
npm run lint     # type-check with tsc
```

## Environment

Copy `.env.example` to `.env.local` if you need a Gemini key (`GEMINI_API_KEY`). Never commit `.env.local`.

## Project structure

- `src/` — React app (`App.tsx`, `components/DiasAI.tsx`, `utils/`)
- `public/valley/` — terrain, flowers, rays and ambient audio
- `public/assets/` — extra static pages and audio

## Notes

`public/assets/aistudio/` contains an mp3 that may be copyrighted. Remove or replace it if you make the repository public.

## Deploy (GitHub Pages)

In the repository go to Settings → Pages → Source and choose **GitHub Actions**. Every push to `main` builds and publishes the site.
