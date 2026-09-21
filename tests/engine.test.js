import test from "node:test";
import assert from "node:assert/strict";
import {
  BUILDINGS,
  HEROES,
  MISSIONS,
  HOUR,
  LOGIN_REWARDS,
} from "../src/data.js";
import {
  freshState,
  advance,
  act,
  production,
  capacityHours,
  upgradeCost,
  upgradeTime,
  upgradeProblem,
  missionStats,
  missionAvailable,
  heroBusy,
  missionSlots,
  dayKey,
  power,
  validateSave,
  chapterReady,
} from "../src/engine.js";
const T = Date.parse("2026-09-01T08:00:00Z");
const initial = () => freshState(T);
const run = (s, a, now = T, rng = () => 0) => act(s, a, now, rng).state;
const rich = () => {
  const s = initial();
  for (const r in s.resources) s.resources[r] = 1e9;
  return s;
};

test("a new realm is complete, valid, and independently allocated", () => {
  const s = initial();
  assert.equal(s.heroes.length, 6);
  assert.equal(Object.keys(s.buildings).length, 10);
  assert.equal(s.resources.aether, 180);
  assert.deepEqual(validateSave(s), s);
  s.heroes[0].level = 4;
  assert.equal(initial().heroes[0].level, 1);
});
test("offline production accrues without crediting uncollected supplies", () => {
  const s = initial(),
    next = advance(s, T + 6 * HOUR);
  assert.equal(next.buildings.mine.stock, 180 + 6 * 55);
  assert.equal(next.buildings.lumber.stock, 120 + 6 * 36);
  assert.equal(next.resources.gold, s.resources.gold);
  assert.equal(s.lastAt, T);
});
test("offline storage caps at 24h, not elapsed wall clock", () => {
  const next = advance(initial(), T + 200 * HOUR);
  assert.equal(next.buildings.mine.stock, 24 * 55);
  assert.equal(next.buildings.quarry.stock, 24 * 28);
  assert.equal(capacityHours(next), 24);
});
test("storehouse expands offline capacity", () => {
  const s = initial();
  s.buildings.warehouse.level = 2;
  const next = advance(s, T + 200 * HOUR);
  assert.equal(capacityHours(next), 48);
  assert.equal(next.buildings.mine.stock, 48 * 55);
});
test("resource collection is integer-safe and preserves fractions", () => {
  let s = advance(initial(), T + HOUR / 10);
  const stock = s.buildings.mine.stock;
  const previous = s.resources.gold;
  s = run(s, { type: "collect" }, T + HOUR / 10);
  assert.equal(s.resources.gold, previous + Math.floor(stock));
  assert.equal(s.buildings.mine.stock, stock - Math.floor(stock));
  assert.equal(s.daily.progress.collect, 1);
  assert.throws(
    () => run(s, { type: "collect" }, T + HOUR / 10),
    /stores are still filling/,
  );
});
test("a finished production upgrade divides offline time at its completion", () => {
  let s = run(initial(), { type: "upgrade", id: "lumber" });
  assert.equal(s.buildings.lumber.level, 1);
  const cost = upgradeCost(initial(), "lumber");
  assert.equal(s.resources.gold, 2450 - cost.gold);
  s = advance(s, T + 3 * HOUR);
  assert.equal(s.buildings.lumber.level, 2);
  assert.equal(s.buildings.lumber.upgrade, null);
  assert.equal(
    s.buildings.lumber.stock,
    120 + 36 + 2 * production(s, "lumber"),
  );
  assert.equal(s.log.filter((l) => l.text.includes("reached level")).length, 1);
  assert.equal(
    advance(s, T + 4 * HOUR).log.filter((l) => l.text.includes("reached level"))
      .length,
    1,
  );
});
test("construction starts producing only after completion", () => {
  let s = rich();
  s.buildings.keep.level = 2;
  s = run(s, { type: "upgrade", id: "spire" });
  s = advance(s, T + 5 * HOUR);
  assert.equal(s.buildings.spire.level, 1);
  assert.equal(s.buildings.spire.stock, 6);
});
test("busy builders, locked buildings, prerequisites, and limits are enforced", () => {
  let s = initial();
  assert.match(upgradeProblem(s, "spire"), /Keep level 2/);
  s = run(s, { type: "upgrade", id: "keep" });
  assert.match(upgradeProblem(s, "lumber"), /builders are busy/);
  s = advance(s, T + 3 * HOUR);
  assert.match(upgradeProblem(s, "keep"), /must reach level 2/);
  s.buildings.lumber.level = 3;
  assert.match(upgradeProblem(s, "lumber"), /Keep to level 3/);
  s.buildings.keep.level = 10;
  s.buildings.lumber.level = 10;
  assert.match(upgradeProblem(s, "lumber"), /Maximum/);
});
test("Keep 4 gives two builders and upgrade durations cap at 48h", () => {
  let s = rich();
  s.buildings.keep.level = 4;
  s = run(s, { type: "upgrade", id: "lumber" });
  s = run(s, { type: "upgrade", id: "mine" });
  assert.match(upgradeProblem(s, "quarry"), /builders are busy/);
  s.buildings.keep.level = 10;
  assert.ok(upgradeTime(s, "keep") <= 48 * HOUR);
});
test("backward clocks do not duplicate or subtract production", () => {
  const s = initial();
  assert.deepEqual(advance(s, T - HOUR), s);
  assert.deepEqual(advance(s, T), s);
});
test("matching traits and affinity improve mission success", () => {
  const s = initial(),
    m = MISSIONS.find((m) => m.id === "whisper");
  const matched = missionStats(s, m, ["lyra", "elowen"]);
  const unmatched = missionStats(s, m, ["bram", "aldric"]);
  assert.ok(matched.chance > unmatched.chance);
  assert.equal(matched.traits.length, 2);
  assert.equal(matched.affinity, true);
  assert.equal(missionStats(s, m, []).chance, 0);
  assert.ok(missionStats(s, m, ["lyra", "mira", "aldric"]).chance <= 100);
});
test("trait counters are counted once and diverse roles receive a bonus", () => {
  const s = initial(),
    m = MISSIONS[0];
  const stats = missionStats(s, m, ["aldric", "bram"]);
  assert.equal(stats.traits.filter((t) => t === "Defender").length, 1);
  assert.equal(
    missionStats(s, MISSIONS[1], ["lyra", "mira", "aldric"]).diverse,
    true,
  );
});
test("dispatch records outcome and locks heroes until reward collection", () => {
  let s = run(initial(), {
    type: "dispatch",
    id: "first",
    heroes: ["lyra", "aldric"],
  });
  assert.equal(s.missions.length, 1);
  assert.equal(s.missions[0].success, true);
  assert.equal(heroBusy(s, "lyra"), true);
  assert.throws(() => run(s, { type: "train", id: "lyra" }), /away/);
  assert.throws(
    () => run(s, { type: "dispatch", id: "whisper", heroes: ["lyra"] }),
    /available party/,
  );
  assert.throws(
    () => run(s, { type: "claimMission", id: "first" }),
    /still on/,
  );
  s = advance(s, T + HOUR);
  assert.equal(heroBusy(s, "lyra"), true);
  s = run(s, { type: "claimMission", id: "first" }, T + HOUR);
  assert.equal(heroBusy(s, "lyra"), false);
  assert.equal(s.totalMissions, 1);
  assert.equal(s.totalSuccess, 1);
  assert.equal(s.heroes[0].xp, 145);
  assert.equal(s.resources.gold, 2630);
  assert.throws(() => run(s, { type: "claimMission", id: "first" }, T + HOUR));
});
test("failed expeditions preserve heroes and grant 60% resources, full XP", () => {
  let s = run(
    initial(),
    { type: "dispatch", id: "whisper", heroes: ["bram"] },
    T,
    () => 0.999,
  );
  assert.equal(s.missions[0].success, false);
  s = run(s, { type: "claimMission", id: "whisper" }, T + 5 * HOUR);
  assert.equal(s.heroes.length, 6);
  assert.equal(s.resources.gold, 2450 + Math.round(380 * 0.6));
  assert.equal(s.heroes.find((h) => h.id === "bram").xp, 200);
  assert.equal(s.totalSuccess, 0);
});
test("Guild, Academy, Observatory, and Sanctum have real effects", () => {
  let s = initial();
  s.buildings.guild.level = 2;
  s.buildings.academy.level = 2;
  s.buildings.observatory.level = 2;
  s.buildings.sanctum.level = 1;
  assert.equal(missionSlots(s), 4);
  const base = missionStats(initial(), MISSIONS[2], ["bram"]);
  assert.equal(missionStats(s, MISSIONS[2], ["bram"]).chance, base.chance + 5);
  s = run(s, { type: "dispatch", id: "first", heroes: ["lyra", "aldric"] });
  s = run(s, { type: "claimMission", id: "first" }, T + HOUR);
  assert.equal(s.resources.gold, 2450 + 216);
  assert.equal(s.heroes[0].xp, 100 + 63);
});
test("party capacity, region locks, and mission concurrency are enforced", () => {
  let s = initial();
  assert.throws(() =>
    run(s, {
      type: "dispatch",
      id: "first",
      heroes: ["lyra", "aldric", "mira"],
    }),
  );
  assert.throws(() =>
    run(s, { type: "dispatch", id: "crypt", heroes: ["lyra"] }),
  );
  s = run(s, { type: "dispatch", id: "first", heroes: ["lyra"] });
  s = run(s, { type: "dispatch", id: "whisper", heroes: ["aldric"] });
  assert.throws(
    () => run(s, { type: "dispatch", id: "mines", heroes: ["mira"] }),
    /slots are full/,
  );
});
test("midnight refresh keeps active missions and retires the intro permanently", () => {
  let s = run(initial(), { type: "dispatch", id: "first", heroes: ["lyra"] });
  s = run(s, { type: "claimMission", id: "first" }, T + HOUR);
  s = run(s, { type: "dispatch", id: "whisper", heroes: ["lyra"] }, T + HOUR);
  s = advance(s, T + 24 * HOUR);
  assert.equal(s.missions.length, 1);
  assert.ok(s.completed.includes("first"));
  assert.equal(missionAvailable(s, MISSIONS[0]), false);
  assert.equal(s.daily.progress.dispatch, 0);
});
test("daily gifts are one per UTC date; skipped days preserve the seven-claim track", () => {
  let s = run(initial(), { type: "login" });
  assert.equal(s.resources.gold, 2700);
  assert.equal(s.login.count, 1);
  assert.throws(() => run(s, { type: "login" }), /already/);
  s = run(s, { type: "login" }, T + 72 * HOUR);
  assert.equal(s.login.count, 2);
  assert.equal(s.resources.wood, 1280 + 300);
  for (let i = 2; i < 8; i++)
    s = run(s, { type: "login" }, T + (i + 2) * 24 * HOUR);
  assert.equal(s.login.count, 8);
  assert.equal(s.resources.gold, 2450 + 250 + 500 + 750 + 250);
});
test("quest rewards and daily chest cannot be duplicated", () => {
  let s = initial();
  assert.throws(() => run(s, { type: "quest", id: "train" }));
  assert.throws(() => run(s, { type: "dailyBonus" }));
  s.daily.progress = { collect: 1, dispatch: 2, train: 1 };
  for (const id of ["collect", "dispatch", "train"])
    s = run(s, { type: "quest", id });
  assert.throws(() => run(s, { type: "quest", id: "train" }));
  s = run(s, { type: "dailyBonus" });
  assert.equal(s.daily.bonus, true);
  assert.equal(s.resources.aether, 180 + 5 + 10 + 10 + 25);
  assert.throws(() => run(s, { type: "dailyBonus" }));
  s = advance(s, T + 24 * HOUR);
  assert.deepEqual(s.daily.claimed, []);
  assert.equal(s.daily.bonus, false);
});
test("training consumes gold and XP and increases actual power", () => {
  const s = initial(),
    before = power(s.heroes[0]);
  const next = run(s, { type: "train", id: "lyra" });
  assert.equal(next.heroes[0].level, 2);
  assert.equal(next.heroes[0].xp, 20);
  assert.equal(next.resources.gold, 2350);
  assert.ok(power(next.heroes[0]) > before);
  assert.equal(next.daily.progress.train, 1);
  assert.throws(() => run(next, { type: "train", id: "lyra" }), /experience/);
});
test("training cap and ascension cost/rank limits are enforced", () => {
  let s = rich();
  s.heroes[0].level = 15;
  s.heroes[0].xp = 1e5;
  assert.throws(() => run(s, { type: "train", id: "lyra" }), /Keep/);
  s.heroes[0].level = 1;
  s.heroes[0].shards = 2;
  const before = power(s.heroes[0]);
  s = run(s, { type: "ascend", id: "lyra" });
  assert.equal(s.heroes[0].shards, 0);
  assert.equal(s.heroes[0].rank, 1);
  assert.equal(power(s.heroes[0]), Math.round(before * 1.2));
  assert.throws(() => run(s, { type: "ascend", id: "lyra" }), /need 4/);
  s.heroes[0].rank = 5;
  assert.throws(() => run(s, { type: "ascend", id: "lyra" }), /Maximum/);
});
test("summoning is free once daily and uses real aether otherwise", () => {
  let s = initial();
  s = run(s, { type: "summon", free: true });
  assert.equal(s.resources.aether, 180);
  assert.equal(s.summons, 1);
  assert.throws(() => run(s, { type: "summon", free: true }), /tomorrow/);
  s = run(s, { type: "summon", count: 1 });
  assert.equal(s.resources.aether, 120);
  assert.throws(() => run(s, { type: "summon", count: 5 }), /Not enough/);
  assert.throws(() => run(s, { type: "summon", count: -1 }));
  s = run(s, { type: "summon", free: true }, T + 24 * HOUR);
  assert.equal(s.summons, 3);
});
test("five summons use discounted cost and duplicates turn into shards", () => {
  let s = initial();
  s.resources.aether = 1000;
  s = run(s, { type: "summon", count: 5 }, T, () => 0.6);
  assert.equal(s.resources.aether, 730);
  assert.equal(s.summons, 5);
  assert.equal(s.heroes.length, 7);
  assert.equal(s.heroes.find((h) => h.shards === 4).id, "poppy");
});
test("hard pity guarantees legendary on 40 and rare or better on 10", () => {
  let s = initial();
  s.pity = 39;
  s.rarePity = 9;
  s = run(s, { type: "summon", count: 1 }, T, () => 0.99);
  assert.equal(s.pity, 0);
  assert.equal(s.rarePity, 0);
  assert.equal(
    HEROES.find((h) => h.id === s.heroes.at(-1).id).rarity,
    "Legendary",
  );
  s = initial();
  s.rarePity = 9;
  s = run(s, { type: "summon", count: 1 }, T, () => 0.99);
  assert.equal(s.rarePity, 0);
  assert.equal(HEROES.find((h) => h.id === s.heroes.at(-1).id).rarity, "Rare");
});
test("chapter rewards require real milestones and advance exactly once", () => {
  let s = initial();
  assert.equal(chapterReady(s), false);
  assert.throws(() => run(s, { type: "chapter" }));
  s.totalMissions = 1;
  assert.equal(chapterReady(s), true);
  s = run(s, { type: "chapter" });
  assert.equal(s.chapter, 1);
  assert.equal(s.resources.aether, 230);
  assert.throws(() => run(s, { type: "chapter" }));
});
test("invalid imports never mutate a current save", () => {
  const original = initial();
  for (const mutation of [
    (s) => (s.version = 2),
    (s) => (s.resources.gold = -1),
    (s) => (s.resources.wood = NaN),
    (s) => (s.buildings.keep.level = 99),
    (s) => (s.heroes[0].id = "ghost"),
    (s) => s.heroes.push(s.heroes[0]),
    (s) => (s.login = null),
    (s) => (s.daily.claimed = ["train", "train"]),
    (s) => (s.log = [null]),
    (s) => (s.lastAt = Infinity),
  ]) {
    const broken = structuredClone(original);
    mutation(broken);
    assert.throws(() => validateSave(broken));
  }
  assert.deepEqual(original, initial());
});
test("save validation rejects overlapping parties", () => {
  let s = run(initial(), { type: "dispatch", id: "first", heroes: ["lyra"] });
  s.missions.push({ ...s.missions[0], id: "whisper" });
  assert.throws(() => validateSave(s));
});
test("save round trip retains committed outcomes and all progression", () => {
  let s = run(initial(), { type: "dispatch", id: "first", heroes: ["lyra"] });
  s = run(s, { type: "upgrade", id: "keep" });
  assert.deepEqual(validateSave(JSON.parse(JSON.stringify(s))), s);
});
