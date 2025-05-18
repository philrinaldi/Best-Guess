# Best Guess

A daily word guessing game inspired by Contexto. Built with React and TailwindCSS using Vite.

## Development

Install dependencies and start the development server:

```bash
npm install
npm run dev
```

The game picks a secret word each day. Use hints or give up if you're stuck. Game state is stored in your browser's local storage.

## Deployment

To deploy the site to GitHub Pages make sure to build the production files first.

```bash
npm run build
```

The generated `dist` folder can then be served from the repository's
`gh-pages` branch or committed directly when using GitHub Pages. The Vite
configuration sets `base` to `/Best-Guess/` so assets resolve correctly at
`https://philrinaldi.github.io/Best-Guess/`.
