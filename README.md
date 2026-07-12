# Tasmania 2027 Itinerary

A standalone static itinerary for Raymond, Jodie and the family.

**Live site: https://nbarrett.github.io/tasmania-2027-itinerary/**

## Local preview

```bash
npm install
npm run dev
```

Open the local URL printed by Vite.

## Hosting

Publishing is automated: every push to `main` runs [.github/workflows/publish.yml](.github/workflows/publish.yml), which builds the site with `npm run build` and deploys `dist` to GitHub Pages.

For any other static host, run `npm run build` and publish the `dist` directory.

No API key or server-side configuration is required. The route geometry and distance figures are stored with the site; the TypeScript map implementation loads public OpenStreetMap tiles through Leaflet.
