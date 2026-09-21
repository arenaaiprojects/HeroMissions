# Emberfall

**A little time. A grand adventure.**

Emberfall is a complete, free, open-source, single-player fantasy idle strategy game. Build a stronghold, gather a company of heroes, and send carefully chosen parties on offline expeditions. Designed around **two or three visits per day**, not constant attention.

Built with React, Vite, and original SVG illustrations. Runs entirely on **GitHub Pages**—no backend, account, database, API key, paid service, or external runtime asset request.

## In your realm

- **10 buildings** with timed construction, upgrades, prerequisites, production, and meaningful support bonuses. Keep level 4 unlocks a second builder.
- **24 collectible heroes**, six roles, six affinities, four rarities, complementary mission traits, 50 training levels, and five ascension ranks.
- **9 authored expeditions** across five unlock tiers. Eight repeatable expeditions take 4–12 hours; a one-time five-minute first adventure teaches the loop.
- Party power, challenge counters, affinity, role diversity, and your Sanctum all affect success. Outcomes are committed at departure. A setback still returns **60% of resources, full XP, and every hero**.
- **7 campaign chapters**, culminating in a level-10 Keep, 100 completed expeditions, and 22 collected heroes. Continue playing after the final chapter.
- A repeating **seven-claim gift track**, daily free summon, three daily quests, and a daily completion chest. Skipping a day never resets gift-track progress.
- Transparent summoning odds, a Rare-or-better guarantee within 10 calls, and a Legendary guarantee within 40. Duplicates become ascension shards.
- **24–72 hours of offline storage**, depending on Storehouse upgrades. Production continues during upgrades and is calculated using the rate before and after completion.
- Automatic saves, validated JSON backup/import, guarded reset, cross-tab saved-action synchronization, and offline reopening after a successful production-site visit.
- Responsive desktop/mobile interface, keyboard-operable dialogs, reduced-motion support, and an in-game field guide explaining the actual formulas.

**No ads, purchases, premium currency, energy system, or paid shortcuts.** Aether is earned entirely through play.

## Play locally

Requires **Node.js 22+** and npm.

```sh
npm ci
npm run dev
```

Open the URL Vite prints. The development server binds to `0.0.0.0` and permits proxied preview hosts. It has no backend to configure.

For a production build with an offline asset cache:

```sh
npm run build
npm run preview
```

The production service worker requires HTTPS or localhost. It is deliberately disabled during development.

## Deploy on GitHub Pages

The repository contains `.github/workflows/pages.yml`. **Adding the workflow does not itself publish the unpushed working branch.**

1. Use a **public repository** for free GitHub Pages hosting.
2. In **Settings → Pages → Build and deployment**, choose **GitHub Actions** as the source.
3. Merge this implementation into `main` and push it to GitHub. The **Publish Emberfall to GitHub Pages** workflow tests, builds, and deploys automatically.
4. Open the deployment URL shown by the workflow / repository's `github-pages` environment. For this repository, the standard URL is `https://arenaaiprojects.github.io/HeroMissions/` once deployed.

You can also run the workflow manually from the Actions tab. Repository / environment protection rules still apply. No custom secrets are needed; deployment uses GitHub's scoped Pages and OIDC permissions.

Vite's relative asset base supports a repository subdirectory, a root Pages site, or a custom domain. A production browser test specifically serves the build at `/HeroMissions/` and verifies offline reopening there.

Pull requests and non-`main` pushes run `.github/workflows/ci.yml` without deploying. Both workflows run unit tests, desktop/mobile browser tests, and the production offline/subdirectory test.

## A gentle first day

1. Collect the starting supply cache from your buildings.
2. Claim your daily gift and free summon.
3. Train a hero using their starting experience and a little gold.
4. Send a small party on **A road worth taking**, then send another party on a longer expedition. The party panel explains every matching trait and the resulting chance.
5. Start a Keep upgrade. You can safely close the game.
6. On your next visit, collect building stores, welcome your heroes home, claim daily quests and chapter milestones, and choose the next upgrades.

**Daily reset is 00:00 UTC.** Active missions carry over. The gift track counts claims, not consecutive days. There is no punishment for taking a break.

## Saves and offline play

- Saves live in this browser's `localStorage` under `emberfall-save-v1`. Actions save immediately; production saves every 10 seconds and when the tab is hidden.
- **No cloud synchronization.** Use **Settings & save → Export save** to move progress between devices or keep backups. Import requires confirmation before replacing progress.
- Browser storage may be cleared by private browsing, device policies, or manual cleanup. If storage is unavailable, the interface warns you; export before closing.
- Unreadable saves are retained under `emberfall-save-v1-recovery` where storage permits, before a new realm is created.
- Once the production site's offline cache finishes installing, its UI, fonts, and illustrations can reopen without a network. Browser cache eviction can require another online visit.
- Timers use the device clock. Keep it accurate. This is a local, single-player game—not an authoritative multiplayer economy or anti-cheat system.
- Saved actions synchronize between tabs. Use one actively played tab for the smoothest experience; simultaneous actions in multiple tabs are not a distributed transaction.

## Tests

```sh
npm test                            # 29 deterministic game-rule/progression tests
npx playwright install chromium     # first-time browser setup
npm run test:e2e                     # full first-day loop, filters, save flows, mobile layouts
npm run build
npm run test:production              # Pages subdirectory, offline reload, no external requests
npm run format:check                # source formatting
```

CI uses `npx playwright install --with-deps chromium`. A locally installed browser may be selected with `CHROMIUM_PATH=/path/to/chromium`.

Tests inject time and randomness into the engine. They cover storage caps, segmented offline production, build queues, resource spending, training, ascension, party exclusivity, probability bonuses, success/failure rewards, daily resets, guarantees, malformed imports, and duplicate-claim prevention. A seeded full-campaign simulation verifies that every chapter can be completed at three visits per day using only normal game actions. Browser tests advance a controlled clock rather than adding time-skip controls to the game.

## Source map

| File                      | Purpose                                                                            |
| ------------------------- | ---------------------------------------------------------------------------------- |
| `src/data.js`             | Authored heroes, buildings, missions, quests, gifts, and chapters                  |
| `src/engine.js`           | Pure progression engine, deterministic time handling, actions, and save validation |
| `src/Art.jsx`             | Original vector landscapes, architecture, hero portraits, and summoning gate       |
| `src/main.jsx`            | Game screens, accessible dialogs, persistence, and UI state                        |
| `src/styles.css`          | Responsive visual design and reduced-motion support                                |
| `scripts/generate-sw.mjs` | Content-versioned production offline cache                                         |
| `scripts/serve-pages.mjs` | Test-only static server simulating a Pages repository path                         |
| `tests/`                  | Engine, end-to-end, and offline production tests                                   |

See [CONTRIBUTING.md](CONTRIBUTING.md) for development guidance and [DESIGN.md](DESIGN.md) for the balance rules.

## License and credits

Game code, writing, and original SVG artwork are released under the [MIT License](LICENSE).

- Interface icons: [Lucide](https://lucide.dev), ISC license.
- Fonts: **DM Sans** and **Lora**, SIL Open Font License 1.1, bundled locally through Fontsource. No Google Fonts requests are made at runtime.
- React and Vite retain their respective upstream licenses.

Bundled asset license notices are included in `public/licenses/`. See [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).
