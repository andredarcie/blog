# André N. Darcie — Blog

Personal blog built with [Eleventy](https://www.11ty.dev/) and deployed to GitHub Pages.

## Stack

- [Eleventy 3](https://www.11ty.dev/) — static site generator
- Nunjucks — templating
- Markdown — content
- GitHub Actions — CI/CD
- GitHub Pages — hosting

## Getting started

```bash
npm install
npm start        # dev server at http://localhost:8080
npm run build    # output to _site/
```

## Project structure

```
src/
├── _includes/   # layouts (base.njk, post.njk)
├── css/         # styles
├── posts/       # blog posts in Markdown
├── index.njk    # home page
└── sobre.md     # about page
```

## Adding a post

Create a `.md` file in `src/posts/` with the following frontmatter:

```markdown
---
title: Post title
date: YYYY-MM-DD
tags:
  - posts
---

Content here.
```

## Deploy

Pushes to `main` trigger an automatic deploy via GitHub Actions to GitHub Pages.
