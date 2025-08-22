## Development Commands

### Local Development

- `make start` - Alternative Docker-only Jekyll development server
- `npm run deploy` - Build production assets with Webpack and deploy to GitHub Pages

### Build System
- Webpack builds SCSS assets from `styles/` directory into `build/style.css`
- Jekyll serves the blog using GitHub Pages Docker container
- Development uses hot reloading via webpack-dev-server on port 8080
- Production assets are committed to `build/` directory

## Architecture Overview

### Content Structure
- **Blog Posts**: Markdown files in `_posts/` with YAML frontmatter
- **Talks**: Collection in `_talks/` for presentation content
- **Layouts**: Jekyll templates in `_layouts/` (default.html, post.html, talk.html)
- **Static Assets**: Images and files in `img/` and `assets/`

### Theme and Styling
- SCSS entry point: `styles/style.scss`
- Modular stylesheets: `home.scss`, `post.scss`, `pygments.scss`
- Uses Roboto and Roboto Slab fonts from Google Fonts
- Responsive design with mobile-first approach

### Jekyll Configuration
- Main config: `_config.yml`
- Development overrides: `_config.dev.yml`
- Collections enabled for talks with custom layout
- Kramdown markdown processor with Rouge syntax highlighting
- Disqus comments integration in post layout

### Build Process
- Webpack processes SCSS and static assets
- Jekyll excludes build tools from final site
- Development: assets served from `http://localhost:8080/`
- Production: assets from `/build/` path
- Docker-based Jekyll serving for consistent environment

### Content Conventions
- Posts use frontmatter with title, excerpt, illustration
- Illustrations include thumbnail variants and attribution
- Talks follow similar structure with presentation-specific layouts
- All content uses Markdown with YAML frontmatter