# Emberfall: design and balance

## Design promises

1. Two or three visits per day should feel productive. There is no stamina meter, expiring seven-day streak, paid acceleration, or penalty for a missed day.
2. Heroes have different jobs, not just different numbers. Building a wide roster should enable more parties with useful traits.
3. No death or injury. Unsuccessful expeditions still yield resources and full experience.
4. All game content and probabilities are visible in source. There is no server-side economy or hidden shop.

## Economy

A new realm has 2,450 gold, 1,280 timber, 960 stone, and 180 aether. A starting cache contains 180 gold, 120 timber, and 90 stone in production stores. Six starting heroes have 100 XP each, enough for one training level.

Production is `round(base × level^1.22)` per hour. Base rates:

| Building     | Rate at level 1 |
| ------------ | --------------- |
| Gold Mine    | 55 gold/hour    |
| Lumber Mill  | 36 timber/hour  |
| Stone Quarry | 28 stone/hour   |
| Aether Spire | 3 aether/hour   |

Unbuilt buildings produce nothing. Buildings store `rate × (24 + 12 × Storehouse level)` resources. Collection transfers whole units to the treasury and preserves fractions. Treasury resources do not expire.

The clock is reconciled at startup, once per second while open, and before each action. Finished upgrades split elapsed time into intervals, each with the correct production rate and storage capacity. A long absence does not retroactively apply new rates to earlier hours.

## Buildings

| Keep requirement | New options                                                        |
| ---------------- | ------------------------------------------------------------------ |
| 1                | Keep, Lumber Mill, Stone Quarry, Gold Mine; these begin at level 1 |
| 2                | Aether Spire, Adventurers' Guild                                   |
| 3                | Storehouse, Moonwell Sanctum                                       |
| 4                | Heroes' Academy; second builder                                    |
| 5                | Star Observatory                                                   |

Construction and upgrades use the data-defined base cost multiplied by `1.7^max(0, currentLevel − 1)`, rounded per resource. Duration is base hours multiplied by `1.5^max(0, currentLevel − 1)`, capped at 48 hours. Costs are charged when work begins. Existing production is uninterrupted.

Non-Keep buildings can reach one level above the current Keep, up to their own maximum. To upgrade the Keep from level L to L+1, all three original production buildings must be at least level L. Maximum Keep level is 10.

Support effects:

- Guild: +1 simultaneous expedition per level, on top of two base slots.
- Storehouse: +12 hours of offline storage per level; maximum 72 hours total.
- Sanctum: +5 percentage points of mission success per level.
- Academy: +20% expedition XP per level.
- Observatory: +10% expedition resource rewards per level.

## Heroes

Each definition provides base power, role, affinity, rarity, and two traits. Ownership tracks level, XP, ascension rank, and soul shards.

`power = round(basePower × (1 + 0.085 × (level − 1)) × (1 + 0.2 × rank))`

Training costs `100 × currentLevel` gold and `80 × currentLevel` XP. Training cap is `min(50, 10 + 5 × KeepLevel)`. Every selected hero receives the full expedition XP value, including on setbacks.

Duplicates grant one hero-specific soul shard. Ranks 1–5 cost 2, 4, 6, 8, and 10 shards respectively. Heroes on an expedition cannot train or ascend until rewards are claimed.

## Expedition resolution

The first mission allows up to two heroes; other missions allow up to three. Sending fewer is allowed. Each hero can be on only one unclaimed expedition. Mission slots include returned expeditions awaiting collection.

```
chance = round(min(100,
  25
  + 35 × min(1.5, partyPower / recommendedPower)
  + 12 × numberOfCounteredChallenges
  + (anyMatchingAffinity ? 8 : 0)
  + (threeDifferentRoles ? 5 : 0)
  + 5 × SanctumLevel
))
```

An empty party has zero chance and cannot depart. A challenge counts only once even if multiple heroes counter it. Outcome, success chance, Academy multiplier, and Observatory multiplier are committed at dispatch; later upgrades do not change an expedition already underway.

A successful expedition grants full boosted resources. A setback grants 60%, rounded per resource. Both grant full boosted XP. There are no critical-success jackpots or hidden penalties.

Each mission can be completed once per UTC day, except the one-time introductory mission. Active missions survive the midnight reset. A mission claimed after midnight counts as that day's completion. Keep upgrades open higher tiers immediately.

## Summoning

Base probabilities: Common 45%, Rare 37%, Epic 15%, Legendary 3%. Each hero within a selected rarity is equally likely.

- Cost: 60 aether, or 270 for five calls.
- One free call per UTC day.
- The tenth consecutive call without Rare or better upgrades a Common outcome to Rare.
- The fortieth call without a Legendary is Legendary.
- Legendary pity takes precedence. Any Rare-or-better result resets Rare pity; Legendary resets both.
- All free and paid-with-earned-aether calls count toward guarantees.

Displayed base odds exclude the conditional guarantee; both counters are visible.

## Daily and long-term progression

The login reward track advances only on a successful claim and repeats every seven claims. It never resets for missed days. Quests track resource collection, two departures, and one training action. Claiming all three makes the daily chest available.

Campaign chapters require increasing Keep levels, completed expeditions (not necessarily successful), and unique owned heroes. Each chapter's reward is claimed once. There are seven chapters; the final milestone is Keep 10, 100 expeditions, and 22 heroes. The game remains playable afterward.

## Persistence boundaries

State is versioned and validated before import. Pure `advance(state, time)` and `act(state, action, time, random)` functions clone rather than mutate input. UI saves after transactions. Monotonic action revisions reconcile saved actions from other tabs and prevent a stale passive autosave overwriting a newer action. This is not a multiplayer consensus protocol; one active tab is recommended.

Local time can be changed by the player and local saves can be edited. This is intentionally a personal, noncompetitive game. Do not add intrusive anti-cheat or a required backend to protect a nonexistent monetized economy.
