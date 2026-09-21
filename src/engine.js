import {
  BUILDINGS,
  HEROES,
  MISSIONS,
  RESOURCES,
  DAILY_QUESTS,
  LOGIN_REWARDS,
  CHAPTERS,
  HOUR,
} from "./data.js";
export const SAVE_KEY = "emberfall-save-v1";
export const dayKey = (now = Date.now()) =>
  new Date(now).toISOString().slice(0, 10);
export const getHero = (id) => HEROES.find((h) => h.id === id);
export const getBuilding = (id) => BUILDINGS.find((b) => b.id === id);
export const getMission = (id) => MISSIONS.find((m) => m.id === id);
export const level = (s, id) => s.buildings[id]?.level || 0;
export const capacityHours = (s) => 24 + level(s, "warehouse") * 12;
export const production = (s, id) => {
  const b = getBuilding(id);
  return b?.base ? Math.round(b.base * Math.pow(level(s, id), 1.22)) : 0;
};
export const missionSlots = (s) => 2 + level(s, "guild");
export const power = (h) =>
  Math.round(
    getHero(h.id).power * (1 + (h.level - 1) * 0.085) * (1 + h.rank * 0.2),
  );
export const totalPower = (s) => s.heroes.reduce((a, h) => a + power(h), 0);
export const heroBusy = (s, id) =>
  s.missions.some((m) => m.heroes.includes(id));
export const upgradeCost = (s, id) =>
  Object.fromEntries(
    Object.entries(getBuilding(id).cost).map(([r, v]) => [
      r,
      Math.round(v * Math.pow(1.7, Math.max(0, level(s, id) - 1))),
    ]),
  );
export const upgradeTime = (s, id) =>
  Math.min(
    48,
    getBuilding(id).time * Math.pow(1.5, Math.max(0, level(s, id) - 1)),
  ) * HOUR;
export const canAfford = (s, cost) =>
  Object.entries(cost).every(([r, v]) => s.resources[r] >= v);
export const xpNeeded = (h) => 80 * h.level;
export const trainCost = (h) => 100 * h.level;
export const duration = (ms) => {
  if (ms <= 0) return "Ready";
  let minutes = Math.ceil(ms / 60000);
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60),
    m = minutes % 60;
  return `${h}h${m ? ` ${m}m` : ""}`;
};
export function freshState(now = Date.now()) {
  return {
    version: 1,
    revision: 0,
    name: "Emberfall",
    createdAt: now,
    lastAt: now,
    resources: { gold: 2450, wood: 1280, stone: 960, aether: 180 },
    buildings: Object.fromEntries(
      BUILDINGS.map((b) => [
        b.id,
        {
          level: b.unlock === 1 ? 1 : 0,
          stock: { mine: 180, lumber: 120, quarry: 90 }[b.id] || 0,
          upgrade: null,
        },
      ]),
    ),
    heroes: HEROES.slice(0, 6).map((h) => ({
      id: h.id,
      level: 1,
      xp: 100,
      rank: 0,
      shards: 0,
    })),
    missions: [],
    completed: [],
    totalMissions: 0,
    totalSuccess: 0,
    summons: 0,
    pity: 0,
    rarePity: 0,
    chapter: 0,
    daily: {
      day: dayKey(now),
      progress: { collect: 0, dispatch: 0, train: 0 },
      claimed: [],
      bonus: false,
    },
    login: { lastDay: null, count: 0 },
    freeSummonDay: null,
    log: [
      {
        id: `${now}-welcome`,
        at: now,
        text: "Your story begins. Six heroes have answered the call.",
        type: "story",
      },
    ],
  };
}
function addLog(s, text, type = "reward", now = Date.now()) {
  s.log.unshift({
    id: `${now}-${s.log.length}-${Math.random().toString(36).slice(2, 6)}`,
    at: now,
    text,
    type,
  });
  s.log = s.log.slice(0, 80);
}
function gain(s, rewards) {
  for (const [r, n] of Object.entries(rewards)) s.resources[r] += n;
}
function spend(s, cost) {
  if (!canAfford(s, cost))
    throw new Error(
      "Not enough resources yet. Your buildings keep working while you’re away.",
    );
  for (const [r, n] of Object.entries(cost)) s.resources[r] -= n;
}
function produce(s, elapsed) {
  for (const b of BUILDINGS) {
    if (b.resource) {
      const rate = production(s, b.id);
      s.buildings[b.id].stock = Math.min(
        rate * capacityHours(s),
        s.buildings[b.id].stock + (rate * elapsed) / HOUR,
      );
    }
  }
}
export function advance(state, now = Date.now()) {
  const s = structuredClone(state);
  if (now < s.lastAt) return s;
  const ends = BUILDINGS.filter(
    (b) => s.buildings[b.id].upgrade && s.buildings[b.id].upgrade.end <= now,
  ).sort(
    (a, b) => s.buildings[a.id].upgrade.end - s.buildings[b.id].upgrade.end,
  );
  let cursor = s.lastAt;
  for (const b of ends) {
    const building = s.buildings[b.id];
    const at = Math.max(cursor, building.upgrade.end);
    produce(s, at - cursor);
    cursor = at;
    building.level++;
    building.upgrade = null;
    addLog(s, `${b.name} reached level ${building.level}.`, "building", at);
  }
  produce(s, now - cursor);
  s.lastAt = now;
  if (s.daily.day !== dayKey(now)) {
    s.daily = {
      day: dayKey(now),
      progress: { collect: 0, dispatch: 0, train: 0 },
      claimed: [],
      bonus: false,
    };
    s.completed = s.completed.filter((id) => id === "first");
  }
  return s;
}
export function upgradeProblem(s, id) {
  const b = getBuilding(id),
    l = level(s, id);
  if (!b) return "Unknown building";
  if (s.buildings[id].upgrade) return "An upgrade is already underway";
  if (level(s, "keep") < b.unlock) return `Requires Keep level ${b.unlock}`;
  if (l >= b.max) return "Maximum level reached";
  if (id !== "keep" && l >= level(s, "keep") + 1)
    return `Upgrade the Keep to level ${l} first`;
  if (
    id === "keep" &&
    ["lumber", "quarry", "mine"].some((x) => level(s, x) < l)
  )
    return `Lumber Mill, Stone Quarry, and Gold Mine must reach level ${l}`;
  const builders = level(s, "keep") >= 4 ? 2 : 1;
  if (BUILDINGS.filter((x) => s.buildings[x.id].upgrade).length >= builders)
    return "All builders are busy. Finish the current upgrade first.";
  if (!canAfford(s, upgradeCost(s, id))) return "Not enough resources";
  return null;
}
export function missionStats(s, m, ids) {
  const heroes = ids
    .map((id) => s.heroes.find((h) => h.id === id))
    .filter(Boolean);
  const p = heroes.reduce((a, h) => a + power(h), 0);
  const traits = m.traits.filter((t) =>
    heroes.some((h) => getHero(h.id).traits.includes(t)),
  );
  const affinity = heroes.some((h) => getHero(h.id).affinity === m.affinity);
  const diverse = new Set(heroes.map((h) => getHero(h.id).role)).size >= 3;
  const chance = heroes.length
    ? Math.min(
        100,
        Math.round(
          25 +
            Math.min(1.5, p / m.power) * 35 +
            traits.length * 12 +
            (affinity ? 8 : 0) +
            (diverse ? 5 : 0) +
            level(s, "sanctum") * 5,
        ),
      )
    : 0;
  return { power: p, traits, affinity, diverse, chance };
}
export function missionAvailable(s, m) {
  return (
    level(s, "keep") >= m.tier &&
    !s.completed.includes(m.id) &&
    !s.missions.some((a) => a.id === m.id)
  );
}
export function chapterReady(s) {
  const c = CHAPTERS[s.chapter];
  return (
    !!c &&
    level(s, "keep") >= c.keep &&
    s.totalMissions >= c.missions &&
    s.heroes.length >= c.heroes
  );
}
function summonOne(s, random) {
  s.summons++;
  s.pity++;
  s.rarePity++;
  const r = random();
  let rarity =
    s.pity >= 40
      ? "Legendary"
      : r < 0.03
        ? "Legendary"
        : r < 0.18
          ? "Epic"
          : r < 0.55
            ? "Rare"
            : "Common";
  if (s.rarePity >= 10 && rarity === "Common") rarity = "Rare";
  if (rarity === "Legendary") s.pity = 0;
  if (rarity !== "Common") s.rarePity = 0;
  const pool = HEROES.filter((h) => h.rarity === rarity);
  const chosen =
    pool[Math.min(pool.length - 1, Math.floor(random() * pool.length))];
  const owned = s.heroes.find((h) => h.id === chosen.id);
  if (owned) owned.shards++;
  else s.heroes.push({ id: chosen.id, level: 1, xp: 100, rank: 0, shards: 0 });
  return { id: chosen.id, duplicate: !!owned };
}
export function act(state, action, now = Date.now(), random = Math.random) {
  const s = advance(state, now);
  let result = null;
  switch (action.type) {
    case "collect": {
      let sum = 0;
      for (const b of BUILDINGS.filter((b) => b.resource)) {
        const amount = Math.floor(s.buildings[b.id].stock);
        s.resources[b.resource] += amount;
        s.buildings[b.id].stock -= amount;
        sum += amount;
      }
      if (!sum)
        throw new Error(
          "Your stores are still filling. Check back in a little while.",
        );
      s.daily.progress.collect++;
      result = {
        message: `Collected ${sum.toLocaleString()} resources from your stronghold.`,
      };
      break;
    }
    case "upgrade": {
      const problem = upgradeProblem(s, action.id);
      if (problem) throw new Error(problem);
      spend(s, upgradeCost(s, action.id));
      s.buildings[action.id].upgrade = {
        start: now,
        end: now + upgradeTime(s, action.id),
      };
      addLog(
        s,
        `${getBuilding(action.id).name}: ${level(s, action.id) ? "upgrade" : "construction"} started.`,
        "building",
        now,
      );
      result = {
        message:
          "The builders are on their way. Work continues while you’re away.",
      };
      break;
    }
    case "dispatch": {
      const m = getMission(action.id);
      if (!m || !missionAvailable(s, m))
        throw new Error("This expedition is not currently available.");
      if (s.missions.length >= missionSlots(s))
        throw new Error(
          "Your mission slots are full. Build or upgrade the Guild for more.",
        );
      const ids = [...new Set(action.heroes)];
      if (
        !ids.length ||
        ids.length > m.slots ||
        ids.some((id) => !s.heroes.some((h) => h.id === id) || heroBusy(s, id))
      )
        throw new Error("Choose an available party first.");
      const stats = missionStats(s, m, ids);
      s.missions.push({
        id: m.id,
        heroes: ids,
        start: now,
        end: now + m.hours * HOUR,
        chance: stats.chance,
        success: random() * 100 < stats.chance,
        rewardMultiplier: 1 + level(s, "observatory") * 0.1,
        xpMultiplier: 1 + level(s, "academy") * 0.2,
      });
      s.daily.progress.dispatch++;
      addLog(s, `Your company set out for ${m.name}.`, "mission", now);
      result = {
        message: "Your heroes are on their way. You can safely close the game.",
      };
      break;
    }
    case "claimMission": {
      const mission = s.missions.find((m) => m.id === action.id);
      if (!mission || mission.end > now)
        throw new Error("Your heroes are still on their expedition.");
      const m = getMission(mission.id);
      const rewards = Object.fromEntries(
        Object.entries(m.rewards).map(([r, v]) => [
          r,
          Math.round(
            v * mission.rewardMultiplier * (mission.success ? 1 : 0.6),
          ),
        ]),
      );
      gain(s, rewards);
      const xp = Math.round(m.xp * mission.xpMultiplier);
      for (const id of mission.heroes)
        s.heroes.find((h) => h.id === id).xp += xp;
      s.missions = s.missions.filter((a) => a.id !== mission.id);
      s.completed.push(m.id);
      s.totalMissions++;
      if (mission.success) s.totalSuccess++;
      addLog(
        s,
        `${m.name}: ${mission.success ? "a triumphant return" : "a difficult journey; your heroes salvaged 60% of the rewards"}.`,
        "mission",
        now,
      );
      result = {
        mission: m,
        success: mission.success,
        rewards,
        xp,
        heroes: mission.heroes,
      };
      break;
    }
    case "train": {
      const h = s.heroes.find((h) => h.id === action.id);
      if (!h) throw new Error("Hero not found");
      if (heroBusy(s, h.id))
        throw new Error("This hero is away on an expedition.");
      if (h.level >= Math.min(50, 10 + level(s, "keep") * 5))
        throw new Error("Upgrade the Keep to raise your training level cap.");
      if (h.xp < xpNeeded(h))
        throw new Error(
          "This hero needs more experience. Send them on expeditions.",
        );
      spend(s, { gold: trainCost(h) });
      h.xp -= xpNeeded(h);
      h.level++;
      s.daily.progress.train++;
      result = { message: `${getHero(h.id).short} reached level ${h.level}!` };
      break;
    }
    case "ascend": {
      const h = s.heroes.find((h) => h.id === action.id);
      if (!h) throw new Error("Hero not found");
      if (heroBusy(s, h.id))
        throw new Error("This hero is away on an expedition.");
      if (h.rank >= 5) throw new Error("Maximum ascension reached");
      const cost = 2 + h.rank * 2;
      if (h.shards < cost)
        throw new Error(
          `You need ${cost} soul shards. Duplicate summons give one shard.`,
        );
      h.shards -= cost;
      h.rank++;
      result = {
        message: `${getHero(h.id).short} ascended! Their power has increased.`,
      };
      break;
    }
    case "summon": {
      const free = action.free;
      const count = free ? 1 : action.count;
      if (![1, 5].includes(count)) throw new Error("Invalid summon count");
      if (free) {
        if (s.freeSummonDay === dayKey(now))
          throw new Error("Your free summon returns tomorrow at 00:00 UTC.");
        s.freeSummonDay = dayKey(now);
      } else spend(s, { aether: count === 5 ? 270 : 60 });
      result = {
        summoned: Array.from({ length: count }, () => summonOne(s, random)),
      };
      addLog(
        s,
        `${count === 1 ? "A hero answered" : "Five heroes answered"} the summoning call.`,
        "hero",
        now,
      );
      break;
    }
    case "login": {
      if (s.login.lastDay === dayKey(now))
        throw new Error("Today’s gift has already been claimed.");
      const rewards = LOGIN_REWARDS[s.login.count % 7];
      gain(s, rewards);
      s.login.lastDay = dayKey(now);
      s.login.count++;
      result = {
        message: "A little gift for a new day. Welcome home.",
        rewards,
      };
      break;
    }
    case "quest": {
      const q = DAILY_QUESTS.find((q) => q.id === action.id);
      if (
        !q ||
        s.daily.claimed.includes(q.id) ||
        s.daily.progress[q.id] < q.target
      )
        throw new Error("Complete this quest before claiming its reward.");
      gain(s, q.reward);
      s.daily.claimed.push(q.id);
      result = {
        message: "Daily quest complete. Rewards added to your treasury.",
      };
      break;
    }
    case "dailyBonus": {
      if (s.daily.bonus || s.daily.claimed.length !== 3)
        throw new Error("Claim all three daily quests to open this chest.");
      s.daily.bonus = true;
      gain(s, { aether: 25, gold: 300 });
      result = { message: "Daily chest opened! +25 Aether and +300 Gold." };
      break;
    }
    case "chapter": {
      if (!chapterReady(s))
        throw new Error("Complete the chapter’s milestones first.");
      const c = CHAPTERS[s.chapter];
      gain(s, c.reward);
      s.chapter++;
      addLog(s, `Chapter ${s.chapter} complete: ${c.name}.`, "story", now);
      result = { message: `Chapter complete! ${c.name}`, rewards: c.reward };
      break;
    }
    case "rename": {
      const name = String(action.name).trim().slice(0, 24);
      if (!name) throw new Error("Give your stronghold a name.");
      s.name = name;
      result = { message: "Your stronghold has a new name." };
      break;
    }
    default:
      throw new Error("Unknown action");
  }
  s.revision = (s.revision || 0) + 1;
  return { state: s, result };
}
export function validateSave(input) {
  const fail = () => {
    throw new Error(
      "This file is not a valid Emberfall save. Your current progress is safe.",
    );
  };
  if (
    !input ||
    input.version !== 1 ||
    typeof input.name !== "string" ||
    input.name.length > 24
  )
    fail();
  if (
    input.revision !== undefined &&
    (!Number.isSafeInteger(input.revision) || input.revision < 0)
  )
    fail();
  const finite = (v, max = 1e15) =>
    typeof v === "number" && Number.isFinite(v) && v >= 0 && v <= max;
  const integer = (v, max = 1e9) => finite(v, max) && Number.isInteger(v);
  if (
    !finite(input.lastAt) ||
    !finite(input.createdAt) ||
    input.lastAt > Date.now() + 86400000
  )
    fail();
  if (!RESOURCES.every((r) => finite(input.resources?.[r]))) fail();
  if (
    !BUILDINGS.every((b) => {
      const v = input.buildings?.[b.id];
      return (
        v &&
        integer(v.level, b.max) &&
        finite(v.stock) &&
        (!v.upgrade ||
          (finite(v.upgrade.start) &&
            finite(v.upgrade.end) &&
            v.upgrade.end >= v.upgrade.start &&
            v.level < b.max))
      );
    })
  )
    fail();
  if (
    !Array.isArray(input.heroes) ||
    input.heroes.length < 1 ||
    input.heroes.length > HEROES.length ||
    new Set(input.heroes.map((h) => h.id)).size !== input.heroes.length
  )
    fail();
  if (
    !input.heroes.every(
      (h) =>
        getHero(h.id) &&
        integer(h.level, 50) &&
        h.level >= 1 &&
        integer(h.rank, 5) &&
        finite(h.xp) &&
        integer(h.shards),
    )
  )
    fail();
  if (
    !Array.isArray(input.missions) ||
    input.missions.length > 6 ||
    new Set(input.missions.map((m) => m.id)).size !== input.missions.length
  )
    fail();
  const assigned = [];
  for (const m of input.missions) {
    if (
      !getMission(m.id) ||
      !Array.isArray(m.heroes) ||
      !m.heroes.length ||
      m.heroes.length > getMission(m.id).slots ||
      !m.heroes.every((id) => input.heroes.some((h) => h.id === id)) ||
      !finite(m.start) ||
      !finite(m.end) ||
      m.end < m.start ||
      typeof m.success !== "boolean" ||
      !finite(m.chance, 100) ||
      !finite(m.rewardMultiplier, 2) ||
      !finite(m.xpMultiplier, 3)
    )
      fail();
    assigned.push(...m.heroes);
  }
  if (new Set(assigned).size !== assigned.length) fail();
  if (
    !Array.isArray(input.completed) ||
    !input.completed.every((id) => getMission(id))
  )
    fail();
  if (
    ![
      "totalMissions",
      "totalSuccess",
      "summons",
      "pity",
      "rarePity",
      "chapter",
    ].every((k) => integer(input[k]))
  )
    fail();
  if (
    input.chapter > CHAPTERS.length ||
    !input.daily ||
    typeof input.daily.day !== "string" ||
    !DAILY_QUESTS.every((q) => integer(input.daily.progress?.[q.id])) ||
    !Array.isArray(input.daily.claimed) ||
    new Set(input.daily.claimed).size !== input.daily.claimed.length ||
    !input.daily.claimed.every((id) => DAILY_QUESTS.some((q) => q.id === id)) ||
    typeof input.daily.bonus !== "boolean"
  )
    fail();
  if (
    !input.login ||
    !integer(input.login.count) ||
    (input.login.lastDay !== null && typeof input.login.lastDay !== "string") ||
    (input.freeSummonDay !== null && typeof input.freeSummonDay !== "string")
  )
    fail();
  if (
    !Array.isArray(input.log) ||
    input.log.length > 80 ||
    !input.log.every(
      (l) =>
        l &&
        typeof l.id === "string" &&
        typeof l.text === "string" &&
        typeof l.type === "string" &&
        finite(l.at),
    )
  )
    fail();
  return { ...structuredClone(input), revision: input.revision || 0 };
}
