# Varahmir UI

A Next.js frontend for the **Kundali Generator** — a Vedic astrology birth chart tool built by [Mithlesh Jasrotia](https://github.com/mithleshjs). It collects birth details and sends them to the Varahmir API, returning a detailed chart as either a structured JSON payload or an LLM-ready prompt.

## Features

- Birth detail form with name, gender, date, time, and location (place search or manual coordinates)
- Divisional charts selection (D2–D60)
- Toggle sections: Moon chart, Sun chart, Chalit chart, Ashtakvarga, Transits, Panchang
- Vimshottari Dasha with configurable depth (Mahadasha → Pratyantar)
- Output in **JSON** or **PROMPT** format, with one-click copy
- Dark mode support

## Tech Stack

- [Next.js 16](https://nextjs.org/) with Turbopack
- [React 19](https://react.dev/)
- [Base UI](https://base-ui.com/) + [shadcn/ui](https://ui.shadcn.com/) components
- [React Hook Form](https://react-hook-form.com/) + [Zod v4](https://zod.dev/)
- [Tailwind CSS v4](https://tailwindcss.com/)
- [Sonner](https://sonner.emilkowal.ski/) for toasts

## Getting Started

```bash
bun install
bun dev
```

The dev server runs at `http://localhost:3000`.

## Environment Variables

| Variable                    | Default                               | Description                                            |
| --------------------------- | ------------------------------------- | ------------------------------------------------------ |
| `VARAHMIR_API_URL`          | `http://localhost:3001`               | Base URL for the Varahmir API backend                  |
| `NEXT_PUBLIC_CHART_API_URL` | _(proxied via `/api/generate-chart`)_ | Override the chart generation endpoint from the client |

API calls to `/api/*` are proxied to `VARAHMIR_API_URL` via Next.js rewrites.

## Scripts

```bash
bun dev        # Start dev server with Turbopack
bun build      # Production build
bun start      # Start production server
bun lint       # Lint with ESLint
bun format     # Format with Prettier
bun typecheck  # Type-check with tsc
```
