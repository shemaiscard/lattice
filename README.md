# Lattice

Lattice is a puzzle and riddle campaign of 36 handcrafted levels. You link colored dots across a grid, light up a field of tiles, crack riddles and break number ciphers across three difficulties and nine stages.

**Play it:** [zelattice.netlify.app](https://zelattice.netlify.app)

## Puzzle types

| Puzzle | Goal | Levels |
| --- | --- | --- |
| Dot Link | Join each pair of matching dots with a path that never crosses another color | 15 |
| Riddle Vault | Type the answer to a lateral riddle, with up to two clues | 12 |
| Lumen | Tap tiles to toggle them and their neighbors until the whole grid is lit | 6 |
| Cipher | Find the rule behind a sequence and pick the missing value | 3 |

## How it plays

- Easy, Medium and Hard are open from the start. Inside each one, levels and stages unlock in order.
- Each level earns one to three stars based on your moves against par and the hints you used.
- Best results, streaks and the light or dark theme are saved in the browser.
- Sound effects and haptic feedback on phones that support vibration.

## Tech stack

React 19, TypeScript, Vite, Tailwind CSS 4, Motion, Lucide icons and Bun.

## Run locally

```bash
bun install
bun run dev      # http://localhost:3000
bun run build    # production build in dist/
bun run test     # level and engine tests
bun run lint     # type check
```
