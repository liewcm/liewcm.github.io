# Liew Cheah Ming — Portfolio

Single-page portfolio built in vanilla HTML, CSS, and JavaScript. Content and interactive modules are configured through `config.json` and individual script files for easy tuning.

## Getting Started

1. Clone or download the repository.
2. Open `index.html` in a modern browser to preview locally.
3. Host the contents on GitHub Pages (instructions below) or any static hosting provider.

## Editing Content (`config.json`)

`config.json` is the single source of truth for site copy and assets.

- `site`: Page <title> and meta description.
- `hero`: Name, headline, and hero image path.
- `about.summary`: Array of paragraphs shown in the About section.
- `infiniteMenu.items`: Skills/technologies displayed in the marquee.
- `socials`: Contact platforms used by the Flowing Menu component. Provide `url` values (e.g., `https://github.com/...` or `mailto:you@example.com`).
- `projects`: List of project cards with `title`, `desc`, `tags`, `image`, `links`, and `date`.

After editing `config.json`, refresh the page to see updates.

## Updating Images & Icons

- Replace the hero portrait at `assets/images/profile/myimage.png`.
- Update project screenshots in `assets/images/projects/placeholder-#.jpg`. Keep filenames or update `config.json` with new paths.
- Replace the favicon source image at `assets/images/favicon/sheep.png` and regenerate `favicon.ico` if desired.
- Social icons live in `assets/icons/`. Swap SVGs while maintaining the same filenames (or update paths in `config.json`).

## Tuning Animation Parameters

Each interactive module exposes configurable constants at the top of its JS file:

- `js/gooeyNav.js`: `NAV` (hover radius, particle behavior, pill padding).
- `js/infiniteMenu.js`: `MARQUEE` (speed, gap, hover pause).
- `js/lightRays.js`: `RAYS` (density, speed, opacity, hue shift).
- `js/blurText.js`: `BLUR` (max blur, hover boost, animation duration).
- `js/scrollFloat.js`: `FLOAT` (max offset, easing, throttle).
- `js/flowingMenu.js`: `FLOW` (activation radius, orbit radius, responsiveness).
- `js/main.js`: `SCROLLBAR` (reveal edge, width, thumb size, idle opacity).

Adjust the values and reload the page to experiment. Motion respects `prefers-reduced-motion` automatically.

## Deploying on GitHub Pages

1. Push the project to a public repository named `liewcm.github.io`.
2. In GitHub, open **Settings → Pages**.
3. Select the `main` branch (or the branch hosting your site) with the / root folder.
4. Save. GitHub Pages will build and serve the site at https://liewcm.github.io/.
5. Changes pushed to the selected branch will automatically update the live site.

For custom domains, configure DNS records and set the custom domain under **GitHub Pages** settings.
