# Contributing to Emberfall

Thanks for making a little more room for adventure.

## Development

Use Node.js 22+, run `npm ci`, then `npm run dev`. No credentials or external services are needed. Keep runtime assets local so a built game can work offline and on any GitHub Pages repository path.

Before sending a change:

```sh
npm run format
npm test
npx playwright install chromium
npm run test:e2e
npm run build
npm run test:production
```

## Architecture

- Put balance/content changes in `src/data.js` and update the field guide / `DESIGN.md` when formulas change.
- Keep economic actions in the pure engine, not just UI event handlers. Every action must enforce its own affordability, prerequisites, and duplicate-claim rules.
- Inject clock and random values into tests. Do not add debug rewards or time-skip buttons to the production interface.
- Rendering components must have stable identities between clock ticks. Dialogs should retain focus, close with Escape, and restore focus on exit.
- Test narrow screens as well as desktop. All icon-only controls need accessible names. Honor reduced-motion preferences.
- Use original SVG artwork or assets with documented compatible licenses. Never introduce temporary artwork or remote stock-image dependencies.
- Treat saved progress as important user data. Add migrations or reject incompatible imports safely; do not silently discard a supported save.
- Do not commit `dist`, dependencies, browser binaries, screenshots from test runs, or user save data.

## Product principles

The game is fully free. Please preserve the quiet cadence, forgiving failure rewards, no lost streak progress, transparent odds, and absence of ads or purchases. There should always be a meaningful reason to choose a different hero, not just a higher rarity.

## Pull requests

Explain the player-facing change and include tests for progression effects. UI changes should describe desktop and mobile behavior. Contributions are accepted under the repository's MIT license; retain third-party asset notices where applicable.
