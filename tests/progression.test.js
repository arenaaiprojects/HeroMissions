import test from "node:test";
import assert from "node:assert/strict";
import {
  freshState,
  advance,
  act,
  level,
  upgradeProblem,
  heroBusy,
  missionAvailable,
  missionSlots,
  chapterReady,
  xpNeeded,
} from "../src/engine.js";
import { BUILDINGS, MISSIONS, HOUR, DAILY_QUESTS } from "../src/data.js";

test("a realm can complete every chapter with only three visits a day and no cheats or paid resources", () => {
  let seed = 123456789;
  const random = () => {
    seed = (1664525 * seed + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  const start = Date.parse("2026-01-01T08:00:00Z");
  let state = freshState(start),
    now = start;
  const attempt = (action) => {
    try {
      state = act(state, action, now, random).state;
      return true;
    } catch {
      return false;
    }
  };
  // A patient player: collect, welcome home, tend heroes, construct, then dispatch.
  // No state edits after initialization; even the intro waits for the next check-in.
  for (let visit = 0; visit < 180 * 3; visit++) {
    now = start + visit * 8 * HOUR;
    state = advance(state, now);
    attempt({ type: "collect" });
    for (const mission of [...state.missions])
      if (mission.end <= now) attempt({ type: "claimMission", id: mission.id });
    attempt({ type: "login" });
    attempt({ type: "summon", free: true });
    const trainee = state.heroes.find(
      (h) => !heroBusy(state, h.id) && h.xp >= xpNeeded(h) && h.level < 20,
    );
    if (trainee) attempt({ type: "train", id: trainee.id });
    for (let i = 0; i < 4 && state.resources.aether >= 60; i++)
      attempt({ type: "summon", count: 1 });
    for (const quest of DAILY_QUESTS) attempt({ type: "quest", id: quest.id });
    attempt({ type: "dailyBonus" });
    while (chapterReady(state)) attempt({ type: "chapter" });
    for (let builder = 0; builder < 2; builder++) {
      const support = BUILDINGS.find(
        (b) =>
          b.unlock <= level(state, "keep") &&
          level(state, b.id) === 0 &&
          !upgradeProblem(state, b.id),
      );
      const nextBuilding =
        support?.id ||
        ["mine", "lumber", "quarry"].find(
          (id) =>
            level(state, id) < level(state, "keep") &&
            !upgradeProblem(state, id),
        ) ||
        (!upgradeProblem(state, "keep") ? "keep" : null);
      if (nextBuilding) attempt({ type: "upgrade", id: nextBuilding });
    }
    const missions = MISSIONS.filter((m) => missionAvailable(state, m)).sort(
      (a, b) => b.tier - a.tier || a.hours - b.hours,
    );
    for (const mission of missions) {
      if (state.missions.length >= missionSlots(state)) break;
      const party = state.heroes
        .filter((h) => !heroBusy(state, h.id))
        .sort((a, b) => b.level - a.level)
        .slice(0, mission.slots)
        .map((h) => h.id);
      if (party.length)
        attempt({ type: "dispatch", id: mission.id, heroes: party });
    }
    if (state.chapter === 7) break;
  }
  assert.equal(
    state.chapter,
    7,
    "the complete progression loop must be reachable",
  );
  assert.equal(level(state, "keep"), 10);
  assert.ok(state.totalMissions >= 100);
  assert.ok(state.heroes.length >= 22);
  assert.ok(Object.values(state.resources).every((v) => v >= 0));
});
