import React, { useState, useEffect, useRef } from "react";
import { createRoot } from "react-dom/client";
import {
  LayoutDashboard,
  Castle,
  Users,
  Compass,
  Sparkles,
  ScrollText,
  BookOpen,
  Gift,
  Settings,
  ChevronRight,
  ArrowRight,
  ArrowUpRight,
  Plus,
  X,
  Check,
  CheckCheck,
  Clock3,
  Coins,
  TreePine,
  Gem,
  Mountain,
  Shield,
  Sword,
  WandSparkles,
  Heart,
  Target,
  Footprints,
  Flame,
  Sun,
  Moon,
  Wind,
  Leaf,
  LockKeyhole,
  Hammer,
  CircleHelp,
  Download,
  Upload,
  RotateCcw,
  Menu,
  Bell,
  Trophy,
  Star,
  Zap,
  CircleCheck,
  Circle,
  PackageOpen,
  ExternalLink,
  Search,
  Crown,
  Flag,
  ArrowUp,
  CalendarDays,
  CheckCircle2,
} from "lucide-react";
import {
  BUILDINGS,
  HEROES,
  MISSIONS,
  RESOURCES,
  RESOURCE_NAMES,
  RARITY_COLORS,
  DAILY_QUESTS,
  LOGIN_REWARDS,
  CHAPTERS,
  HOUR,
} from "./data.js";
import {
  SAVE_KEY,
  dayKey,
  freshState,
  advance,
  act,
  validateSave,
  level,
  production,
  capacityHours,
  power,
  totalPower,
  heroBusy,
  upgradeCost,
  upgradeTime,
  xpNeeded,
  trainCost,
  upgradeProblem,
  missionStats,
  missionAvailable,
  missionSlots,
  chapterReady,
  getHero,
  duration,
} from "./engine.js";
import {
  WorldArt,
  BuildingArt,
  HeroArt,
  MissionArt,
  SummonArt,
} from "./Art.jsx";
import "@fontsource-variable/dm-sans/wght.css";
import "@fontsource-variable/lora/wght.css";
import "./styles.css";

const ICONS = { gold: Coins, wood: TreePine, stone: Mountain, aether: Gem };
const ROLES = {
  Guardian: Shield,
  Warrior: Sword,
  Mage: WandSparkles,
  Healer: Heart,
  Ranger: Target,
  Rogue: Footprints,
};
const AFFINITIES = {
  Grove: Leaf,
  Sun: Sun,
  Moon: Moon,
  Ember: Flame,
  Storm: Wind,
  Stone: Mountain,
};
const navItems = [
  { id: "overview", name: "Overview", icon: LayoutDashboard },
  { id: "stronghold", name: "Stronghold", icon: Castle },
  { id: "heroes", name: "Heroes", icon: Users },
  { id: "missions", name: "Missions", icon: Compass },
  { id: "summoning", name: "Summoning", icon: Sparkles },
];
const fmt = (n) => Math.floor(n).toLocaleString();
const roman = (n) => ["I", "II", "III", "IV", "V", "VI", "VII"][n] || "VIII";
function Resource({ type, amount, small = false }) {
  const Icon = ICONS[type];
  return (
    <span
      className={`resource-value ${type} ${small ? "small" : ""}`}
      title={RESOURCE_NAMES[type]}
    >
      <Icon size={small ? 13 : 16} />
      <span>{fmt(amount)}</span>
    </span>
  );
}
function Rewards({ rewards, small = false }) {
  return (
    <div className="rewards">
      {Object.entries(rewards).map(([type, amount]) => (
        <Resource key={type} type={type} amount={amount} small={small} />
      ))}
    </div>
  );
}
function Badge({ children, tone = "" }) {
  return <span className={`badge ${tone}`}>{children}</span>;
}
function BrandMark() {
  return (
    <svg viewBox="0 0 48 54" aria-hidden="true">
      <path
        d="M24 3 43 26 24 51 5 26Z"
        stroke="currentColor"
        fill="none"
        strokeWidth="1.7"
      />
      <path d="m24 12 11 15-11 15-11-15Z" fill="currentColor" />
      <path d="M24 19v15m-7-8h14" stroke="#172226" strokeWidth="1.8" />
      <path d="M0 26h7m34 0h7M24 0v5m0 45v4" stroke="currentColor" />
    </svg>
  );
}
function SectionHeading({ eyebrow, title, children }) {
  return (
    <div className="section-heading">
      <div>
        {eyebrow && <span className="eyebrow">{eyebrow}</span>}
        <h2>{title}</h2>
      </div>
      <div className="section-actions">{children}</div>
    </div>
  );
}
function EmptyState({ icon: Icon = Compass, title, children, action }) {
  return (
    <div className="empty-state">
      <div className="empty-icon">
        <Icon size={30} />
      </div>
      <h3>{title}</h3>
      <p>{children}</p>
      {action}
    </div>
  );
}
function Progress({ value, max = 100, className = "" }) {
  return (
    <div
      className={`progress ${className}`}
      role="progressbar"
      aria-label="Progress"
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={Math.max(0, Math.min(value, max))}
    >
      <span
        style={{ width: `${Math.max(0, Math.min(100, (value / max) * 100))}%` }}
      />
    </div>
  );
}
function Modal({ title, subtitle, children, onClose, wide = false }) {
  const box = useRef(null);
  useEffect(() => {
    const previous = document.activeElement;
    box.current?.focus();
    const listener = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "Tab") {
        const elements = box.current?.querySelectorAll(
          'button:not([disabled]), input, select, a[href], [tabindex="0"]',
        );
        if (!elements?.length) return;
        const first = elements[0],
          last = elements[elements.length - 1];
        if (
          e.shiftKey &&
          (document.activeElement === first ||
            document.activeElement === box.current)
        ) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", listener);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", listener);
      document.body.style.overflow = prevOverflow;
      previous?.focus();
    };
  }, []);
  return (
    <div
      className="modal-backdrop"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <section
        className={`modal ${wide ? "wide" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        tabIndex={-1}
        ref={box}
      >
        <header className="modal-header">
          <div>
            <h2 id="modal-title">{title}</h2>
            {subtitle && <p>{subtitle}</p>}
          </div>
          <button
            className="icon-button"
            aria-label="Close dialog"
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </header>
        {children}
      </section>
    </div>
  );
}
let loadNotice = "";
let offlineTime = 0;
function load() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (raw) {
      const s = validateSave(JSON.parse(raw));
      offlineTime = Date.now() - s.lastAt;
      return advance(s);
    }
  } catch {
    loadNotice =
      "Your previous save could not be loaded. A backup has been kept in browser storage where possible.";
    try {
      localStorage.setItem(
        `${SAVE_KEY}-recovery`,
        localStorage.getItem(SAVE_KEY) || "",
      );
    } catch {}
  }
  return freshState();
}
function BuildingCard({ b, full = false, state, setModal, now }) {
  const data = state.buildings[b.id],
    locked = level(state, "keep") < b.unlock,
    rate = production(state, b.id),
    upgrading = data.upgrade;
  return (
    <button
      className={`building-card ${locked ? "locked" : ""} ${upgrading ? "upgrading" : ""}`}
      onClick={() => setModal({ type: "building", id: b.id })}
    >
      <div className="building-art">
        <BuildingArt type={b.type} />
        <span className="building-level">
          {locked ? (
            <>
              <LockKeyhole size={10} /> Keep {b.unlock}
            </>
          ) : data.level ? (
            `LV. ${data.level}`
          ) : (
            "BUILD"
          )}
        </span>
        {upgrading && (
          <span className="building-working">
            <Hammer size={12} />
          </span>
        )}
      </div>
      <div className="building-card-content">
        <h3>{b.name}</h3>
        <div className="building-production">
          {upgrading ? (
            <>
              <Hammer size={12} />
              <span>{duration(upgrading.end - now)} remaining</span>
            </>
          ) : locked ? (
            <>
              <LockKeyhole size={12} />
              <span>Unlock at Keep level {b.unlock}</span>
            </>
          ) : b.resource && data.level ? (
            <>
              <Resource type={b.resource} amount={rate} small />
              <span>/ hour</span>
              <span className="production-dot" />
            </>
          ) : (
            <span>
              {data.level
                ? {
                    keep: "The heart of your realm",
                    guild: `${missionSlots(state)} expedition slots`,
                    warehouse: `${capacityHours(state)}h offline capacity`,
                    sanctum: `+${data.level * 5}% mission success`,
                    academy: `+${data.level * 20}% hero experience`,
                    observatory: `+${data.level * 10}% mission rewards`,
                  }[b.id]
                : "Ready for construction"}
            </span>
          )}
        </div>
        {full && <p className="building-description">{b.description}</p>}
        {upgrading ? (
          <Progress
            value={now - upgrading.start}
            max={upgrading.end - upgrading.start}
            className="gold-progress"
          />
        ) : b.resource && data.level ? (
          <Progress value={data.stock} max={rate * capacityHours(state)} />
        ) : (
          <div className="building-bottom-line" />
        )}
        {full && (
          <div className="building-footer">
            {b.resource && data.level ? (
              <span>{fmt(data.stock)} in storage</span>
            ) : (
              <span>{data.level ? "View building" : "Establish building"}</span>
            )}
            <ArrowUpRight size={15} />
          </div>
        )}
      </div>
    </button>
  );
}
function MissionCard({
  m,
  compact = false,
  active = null,
  state,
  setModal,
  now,
  claimMission,
  openMission,
}) {
  const locked = level(state, "keep") < m.tier,
    done = active && active.end <= now;
  return (
    <article
      className={`mission-card ${compact ? "compact" : ""} ${locked ? "mission-locked" : ""}`}
    >
      <div className="mission-landscape">
        <MissionArt scene={m.scene} />
        <span className="mission-duration">
          <Clock3 size={12} />
          {active ? duration(active.end - now) : duration(m.hours * HOUR)}
        </span>
        {m.intro && <span className="intro-badge">FIRST ADVENTURE</span>}
        {locked && (
          <span className="mission-lock">
            <LockKeyhole size={20} />
          </span>
        )}
      </div>
      <div className="mission-card-body">
        <span className="region">{m.region}</span>
        <h3>{m.name}</h3>
        {!compact && <p className="mission-description">{m.text}</p>}
        <div className="mission-traits">
          {m.traits.map((t) => (
            <span key={t}>
              <Shield size={11} />
              {t}
            </span>
          ))}
        </div>
        <div className="mission-card-footer">
          <Rewards
            rewards={Object.fromEntries(
              Object.entries(m.rewards).map(([r, v]) => [
                r,
                Math.round(
                  v *
                    (active?.rewardMultiplier ??
                      1 + level(state, "observatory") * 0.1),
                ),
              ]),
            )}
            small
          />
          {active ? (
            <button
              className={`button ${done ? "primary small-btn" : "quiet small-btn"}`}
              onClick={() =>
                done
                  ? claimMission(m.id)
                  : setModal({ type: "active", id: m.id })
              }
            >
              {done ? "Claim rewards" : "View party"}
              {done ? <Gift size={13} /> : <ChevronRight size={14} />}
            </button>
          ) : (
            <button
              className="mission-go"
              disabled={locked}
              onClick={() => openMission(m)}
              aria-label={`Prepare ${m.name}`}
            >
              {locked ? <span>Keep {m.tier}</span> : <ArrowRight size={17} />}
            </button>
          )}
        </div>
        {active && (
          <Progress
            value={now - active.start}
            max={active.end - active.start}
          />
        )}
      </div>
    </article>
  );
}
function MiniHero({ h, state, setModal }) {
  const def = getHero(h.id),
    busy = heroBusy(state, h.id),
    Role = ROLES[def.role];
  return (
    <button
      className="mini-hero"
      onClick={() => setModal({ type: "hero", id: h.id })}
    >
      <div
        className="mini-portrait"
        style={{ "--rarity": RARITY_COLORS[def.rarity] }}
      >
        <HeroArt hero={def} />
      </div>
      <div className="mini-hero-info">
        <strong>{def.name}</strong>
        <span>
          <Role size={11} />
          {def.role}
          <i />
          Level {h.level}
        </span>
      </div>
      <span className={`hero-status ${busy ? "away" : ""}`}>
        {busy ? "On a mission" : "Available"}
      </span>
    </button>
  );
}
function HeroCard({ def, owned, state, setModal }) {
  const Role = ROLES[def.role],
    Affinity = AFFINITIES[def.affinity];
  return (
    <button
      className={`hero-card ${!owned ? "uncollected" : ""}`}
      style={{ "--rarity": RARITY_COLORS[def.rarity] }}
      onClick={() => setModal({ type: "hero", id: def.id })}
    >
      <div className="hero-card-art">
        <HeroArt hero={def} />
        <span className="hero-rarity">{def.rarity}</span>
        <span className="hero-affinity" title={def.affinity}>
          <Affinity size={16} />
        </span>
        <div className="hero-art-footer">
          <span>{owned ? `LV. ${owned.level}` : "UNDISCOVERED"}</span>
          {owned && (
            <span>
              <Zap size={12} />
              {power(owned)}
            </span>
          )}
        </div>
      </div>
      <div className="hero-card-info">
        <h3>{def.name}</h3>
        <p>
          <Role size={12} />
          {def.role}
          <span>·</span>
          {def.affinity}
        </p>
        <div className="hero-traits">
          {def.traits.map((t) => (
            <span key={t}>{t}</span>
          ))}
        </div>
        {owned && (
          <div
            className={`hero-card-status ${heroBusy(state, def.id) ? "away" : ""}`}
          >
            <span />
            {heroBusy(state, def.id)
              ? "On an expedition"
              : "Ready for adventure"}
            {owned.shards > 0 && <b>{owned.shards} shards</b>}
          </div>
        )}
      </div>
    </button>
  );
}

function App() {
  const [state, setState] = useState(load);
  const stateRef = useRef(state);
  const [page, setPage] = useState("overview");
  const [modal, setModal] = useState(null);
  const [toast, setToast] = useState(null);
  const [menu, setMenu] = useState(false);
  const [saved, setSaved] = useState(true);
  const [filters, setFilters] = useState({
    role: "All roles",
    rarity: "All rarities",
    search: "",
    owned: true,
  });
  const [missionTab, setMissionTab] = useState("available");
  const [party, setParty] = useState([]);
  const [summonResults, setSummonResults] = useState(null);
  const [rename, setRename] = useState(state.name);
  const importRef = useRef(null);
  const [resetText, setResetText] = useState("");
  const now = state.lastAt;
  const notify = (message, error = false) =>
    setToast({ message, error, id: Date.now() });
  const latestSave = () => {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (raw) {
        const stored = JSON.parse(raw);
        if ((stored.revision || 0) > (stateRef.current.revision || 0))
          return advance(validateSave(stored));
      }
    } catch {}
    return stateRef.current;
  };
  const save = (s) => {
    try {
      const latest = latestSave();
      if (latest.revision > s.revision) {
        stateRef.current = latest;
        setState(latest);
        return;
      }
      localStorage.setItem(SAVE_KEY, JSON.stringify(s));
      setSaved(true);
    } catch {
      setSaved(false);
    }
  };
  useEffect(() => {
    const sync = (e) => {
      if (e.key !== SAVE_KEY || !e.newValue) return;
      try {
        const next = validateSave(JSON.parse(e.newValue));
        if (
          next.revision > stateRef.current.revision ||
          (next.revision === stateRef.current.revision &&
            next.lastAt > stateRef.current.lastAt)
        ) {
          const synced = advance(next);
          stateRef.current = synced;
          setState(synced);
        }
      } catch {}
    };
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);
  useEffect(() => {
    stateRef.current = state;
  }, [state]);
  useEffect(() => {
    save(stateRef.current);
    if (loadNotice) notify(loadNotice, true);
    else if (offlineTime > HOUR)
      setModal({ type: "welcome", elapsed: offlineTime });
    const timer = setInterval(() => {
      const next = advance(stateRef.current);
      stateRef.current = next;
      setState(next);
    }, 1000);
    const auto = setInterval(() => save(stateRef.current), 10000);
    const leave = () => save(stateRef.current);
    const visible = () => {
      if (document.visibilityState === "visible") {
        const next = advance(stateRef.current);
        stateRef.current = next;
        setState(next);
      } else leave();
    };
    window.addEventListener("pagehide", leave);
    document.addEventListener("visibilitychange", visible);
    return () => {
      clearInterval(timer);
      clearInterval(auto);
      window.removeEventListener("pagehide", leave);
      document.removeEventListener("visibilitychange", visible);
    };
  }, []);
  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 5500);
      return () => clearTimeout(t);
    }
  }, [toast]);
  const run = (action, { silent = false } = {}) => {
    try {
      const { state: next, result } = act(latestSave(), action);
      stateRef.current = next;
      setState(next);
      save(next);
      if (result?.message && !silent) notify(result.message);
      return result || {};
    } catch (e) {
      notify(e.message, true);
      return null;
    }
  };
  const go = (id) => {
    setPage(id);
    setMenu(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const openMission = (m) => {
    setParty([]);
    setModal({ type: "mission", mission: m });
  };
  const claimMission = (id) => {
    const result = run({ type: "claimMission", id }, { silent: true });
    if (result) setModal({ type: "missionResult", ...result });
  };
  const stored = Math.floor(
    BUILDINGS.reduce((a, b) => a + Math.floor(state.buildings[b.id].stock), 0),
  );
  const ready = state.missions.filter((m) => m.end <= now).length;
  const available = state.heroes.filter((h) => !heroBusy(state, h.id)).length;
  const c = CHAPTERS[state.chapter];
  const day = Math.floor((now - state.createdAt) / (24 * HOUR)) + 1;
  const loginReady = state.login.lastDay !== dayKey(now);
  const availableMissions = MISSIONS.filter((m) => missionAvailable(state, m));
  const currentPage =
    navItems.find((n) => n.id === page)?.name ||
    { daily: "Daily rewards", chronicle: "Chronicle", guide: "Field guide" }[
      page
    ];
  const closeModal = () => setModal(null);
  const summon = (count, free = false) => {
    const result = run({ type: "summon", count, free }, { silent: true });
    if (result) {
      setSummonResults(result.summoned);
      setModal({ type: "summonResult" });
    }
  };
  const exportSave = () => {
    const blob = new Blob([JSON.stringify(stateRef.current, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `emberfall-${dayKey()}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    notify("Your adventure has been exported. Keep this file somewhere safe.");
  };
  const importSave = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      if (file.size > 1_000_000)
        throw new Error("This save file is too large.");
      const next = validateSave(JSON.parse(await file.text()));
      setModal({ type: "import", state: next });
    } catch (err) {
      notify(err.message || "Could not read this save file.", true);
    }
    e.target.value = "";
  };
  return (
    <div className="app-shell">
      {menu && <div className="sidebar-scrim" onClick={() => setMenu(false)} />}
      <aside className={`sidebar ${menu ? "open" : ""}`}>
        <button
          className="brand"
          onClick={() => go("overview")}
          aria-label="Emberfall home"
        >
          <BrandMark />
          <div>
            EMBERFALL<span>A REALM OF YOUR OWN</span>
          </div>
        </button>
        <div className="stronghold-label">
          <span className="live-dot" />
          {state.name}
          <span>LV. {level(state, "keep")}</span>
        </div>
        <div className="nav-caption">YOUR REALM</div>
        <nav aria-label="Main navigation">
          {navItems.map(({ id, name, icon: Icon }) => (
            <button
              className={`nav-link ${page === id ? "active" : ""}`}
              aria-current={page === id ? "page" : undefined}
              key={id}
              onClick={() => go(id)}
            >
              <Icon size={18} />
              <span>{name}</span>
              {id === "heroes" ? (
                <span className="nav-count">{state.heroes.length}</span>
              ) : id === "missions" && state.missions.length > 0 ? (
                <span className={`nav-count ${ready ? "gold" : ""}`}>
                  {ready || state.missions.length}
                </span>
              ) : id === "summoning" && state.freeSummonDay !== dayKey(now) ? (
                <span className="nav-pip" />
              ) : null}
            </button>
          ))}
        </nav>
        <div className="nav-divider" />
        <div className="nav-caption">THE JOURNEY</div>
        <nav aria-label="Progression">
          {[
            { id: "daily", name: "Daily rewards", icon: Gift },
            { id: "chronicle", name: "Chronicle", icon: ScrollText },
            { id: "guide", name: "Field guide", icon: BookOpen },
          ].map(({ id, name, icon: Icon }) => (
            <button
              className={`nav-link ${page === id ? "active" : ""}`}
              aria-current={page === id ? "page" : undefined}
              key={id}
              onClick={() => go(id)}
            >
              <Icon size={18} />
              <span>{name}</span>
              {id === "daily" && loginReady && <span className="nav-pip" />}
              {id === "chronicle" && chapterReady(state) && (
                <span className="nav-pip" />
              )}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="daily-gift">
            <div className="daily-gift-top">
              <div className="gift-illustration">
                <Gift size={25} strokeWidth={1.3} />
                <span>✦</span>
              </div>
              <Badge tone="gold">
                DAY {((state.login.count - (loginReady ? 0 : 1) + 7) % 7) + 1}
              </Badge>
            </div>
            <h3>
              {loginReady ? "A gift for your journey" : "Until tomorrow, hero"}
            </h3>
            <p>
              {loginReady
                ? "A little something, every day."
                : "Your next gift arrives at 00:00 UTC."}
            </p>
            <button
              className="gift-button"
              onClick={() =>
                loginReady ? run({ type: "login" }) : go("daily")
              }
            >
              {loginReady ? "Claim daily reward" : "View daily rewards"}
              {loginReady ? <ArrowRight size={14} /> : <Check size={14} />}
            </button>
          </div>
          <button
            className="settings-link"
            onClick={() => {
              setRename(state.name);
              setModal({ type: "settings" });
            }}
          >
            <Settings size={16} />
            <span>Settings & save</span>
            <span className={`save-dot ${!saved ? "error" : ""}`} />
          </button>
          <div className="sidebar-footnote">
            <span>
              {saved
                ? "Your adventure is saved"
                : "Save unavailable · export a backup"}
            </span>
            <span>v1.0</span>
          </div>
        </div>
      </aside>
      <div className="main-shell">
        <header className="topbar">
          <div className="breadcrumb">
            <button
              className="mobile-menu icon-button"
              onClick={() => setMenu(true)}
              aria-label="Open navigation"
            >
              <Menu size={22} />
            </button>
            <Castle size={16} />
            <span>Your realm</span>
            <ChevronRight size={13} />
            <strong>{currentPage}</strong>
          </div>
          <div className="resource-bar">
            {RESOURCES.map((r) => (
              <button
                key={r}
                className={`resource-pill ${r}`}
                onClick={() => setModal({ type: "resource", resource: r })}
                title={`View ${RESOURCE_NAMES[r]} production`}
              >
                <span className="resource-icon">
                  {React.createElement(ICONS[r], {
                    size: 18,
                    strokeWidth: 1.6,
                  })}
                </span>
                <div>
                  <small>{RESOURCE_NAMES[r]}</small>
                  <strong>{fmt(state.resources[r])}</strong>
                </div>
                {r === "aether" && <Plus size={13} />}
              </button>
            ))}
          </div>
          <button
            className="notification-button icon-button"
            aria-label="View ready rewards"
            onClick={() => {
              if (ready) setMissionTab("active");
              go(ready ? "missions" : "daily");
            }}
          >
            <Bell size={19} />
            {(loginReady || ready > 0) && <span />}
          </button>
          <button
            className="commander-avatar"
            onClick={() => {
              setRename(state.name);
              setModal({ type: "settings" });
            }}
            aria-label="Commander settings"
          >
            <Shield size={21} />
          </button>
        </header>
        <main>
          {page === "overview" && (
            <>
              <div className="page-heading">
                <div>
                  <div className="eyebrow">WELCOME HOME, COMMANDER</div>
                  <h1>Your stronghold awaits.</h1>
                  <p>A little time. A grand adventure.</p>
                </div>
                <div className="season-badge">
                  <Sun size={19} />
                  <div>
                    Day {day}
                    <span>The Age of Embers</span>
                  </div>
                </div>
              </div>
              <section className="hero-banner">
                <WorldArt />
                <div className="hero-banner-content">
                  <div className="banner-chapter">
                    <span />
                    CHAPTER {roman(state.chapter)} ·{" "}
                    {state.chapter === 0
                      ? "THE FIRST SPARK"
                      : "THE JOURNEY CONTINUES"}
                  </div>
                  <h2>
                    Great stories start
                    <br />
                    with a small spark.
                  </h2>
                  <p>
                    Build a home. Gather your heroes.
                    <br />
                    Let the adventure unfold.
                  </p>
                  <button
                    className="button primary"
                    onClick={() => go("missions")}
                  >
                    Find your next adventure
                    <ArrowRight size={16} />
                  </button>
                </div>
                <div className="banner-location">
                  <Flag size={13} />
                  {state.name}
                  <span>YOUR LITTLE CORNER OF THE WORLD</span>
                </div>
              </section>
              <div className="realm-summary">
                <button onClick={() => go("heroes")}>
                  <div className="summary-icon">
                    <Users size={20} />
                  </div>
                  <div>
                    <strong>
                      {state.heroes.length} <span>heroes in your company</span>
                    </strong>
                    <small>
                      <span className="tiny-dot" />
                      {available} ready for adventure
                    </small>
                  </div>
                  <ChevronRight size={15} />
                </button>
                <button
                  onClick={() => {
                    setMissionTab(
                      state.missions.length ? "active" : "available",
                    );
                    go("missions");
                  }}
                >
                  <div className="summary-icon blue">
                    <Compass size={21} />
                  </div>
                  <div>
                    <strong>
                      {state.missions.length}
                      <span> / {missionSlots(state)} active expeditions</span>
                    </strong>
                    <small>
                      {ready ? (
                        <>
                          <span className="tiny-dot gold-dot" />
                          {ready} ready to claim
                        </>
                      ) : (
                        "The world is waiting for you"
                      )}
                    </small>
                  </div>
                  <ChevronRight size={15} />
                </button>
                <button onClick={() => go("stronghold")}>
                  <div className="summary-icon gold">
                    <Clock3 size={20} />
                  </div>
                  <div>
                    <strong>
                      {capacityHours(state)}h <span>offline production</span>
                    </strong>
                    <small>Your stronghold never sleeps</small>
                  </div>
                  <ChevronRight size={15} />
                </button>
              </div>
              <SectionHeading title="Your stronghold">
                <button
                  className="text-button"
                  onClick={() => go("stronghold")}
                >
                  Manage buildings
                  <ArrowUpRight size={14} />
                </button>
                <button
                  className="button collect-button"
                  onClick={() => run({ type: "collect" })}
                  disabled={stored < 1}
                >
                  <PackageOpen size={14} />
                  Collect resources<span>{fmt(stored)}</span>
                </button>
              </SectionHeading>
              <div className="buildings-grid overview-buildings">
                {BUILDINGS.slice(0, 4).map((b) => (
                  <BuildingCard
                    state={state}
                    setModal={setModal}
                    now={now}
                    b={b}
                    key={b.id}
                  />
                ))}
              </div>
              <div className="dashboard-bottom">
                <section>
                  <SectionHeading title="Adventure calls">
                    <button
                      className="text-button"
                      onClick={() => go("missions")}
                    >
                      Mission board
                      <ArrowUpRight size={14} />
                    </button>
                  </SectionHeading>
                  <div className="dashboard-missions">
                    {availableMissions.slice(0, 2).map((m) => (
                      <MissionCard
                        state={state}
                        setModal={setModal}
                        now={now}
                        claimMission={claimMission}
                        openMission={openMission}
                        m={m}
                        key={m.id}
                        compact
                      />
                    ))}
                    {!availableMissions.length && (
                      <EmptyState title="Your heroes know the way">
                        Check your active expeditions or come back after the
                        daily reset.
                      </EmptyState>
                    )}
                  </div>
                </section>
                <section>
                  <SectionHeading title="Your company">
                    <button
                      className="text-button"
                      onClick={() => go("heroes")}
                    >
                      View all
                      <ArrowUpRight size={14} />
                    </button>
                  </SectionHeading>
                  <div className="company-list">
                    {state.heroes.slice(0, 3).map((h) => (
                      <MiniHero
                        state={state}
                        setModal={setModal}
                        h={h}
                        key={h.id}
                      />
                    ))}
                    <button
                      className="company-summon"
                      onClick={() => go("summoning")}
                    >
                      <Sparkles size={15} />
                      <span>A new friend is a summon away</span>
                      <ArrowRight size={14} />
                    </button>
                  </div>
                </section>
              </div>
              <div className="gentle-reminder">
                <Leaf size={14} />
                <span>
                  No rush. Your buildings keep working and your heroes keep
                  adventuring, even when you’re away.
                </span>
                <span>MADE FOR LIFE BETWEEN ADVENTURES</span>
              </div>
            </>
          )}
          {page === "stronghold" && (
            <>
              <div className="page-heading">
                <div>
                  <div className="eyebrow">FROM A SPARK, A KINGDOM</div>
                  <h1>Your stronghold</h1>
                  <p>A place to grow. A place to come home to.</p>
                </div>
                <button
                  className="button primary"
                  disabled={stored < 1}
                  onClick={() => run({ type: "collect" })}
                >
                  <PackageOpen size={16} />
                  Collect all · {fmt(stored)}
                </button>
              </div>
              <div className="production-overview">
                {RESOURCES.map((r) => {
                  const b = BUILDINGS.find((b) => b.resource === r),
                    rate = production(state, b.id);
                  return (
                    <div key={r}>
                      <div>
                        <Resource type={r} amount={rate} />
                        <span>/ hour</span>
                      </div>
                      <p>
                        {fmt(state.buildings[b.id].stock)} /{" "}
                        {fmt(rate * capacityHours(state))} stored
                      </p>
                      <Progress
                        value={state.buildings[b.id].stock}
                        max={rate * capacityHours(state) || 1}
                      />
                    </div>
                  );
                })}
              </div>
              <div className="info-strip">
                <Hammer size={17} />
                <span>
                  <strong>
                    {
                      BUILDINGS.filter((b) => state.buildings[b.id].upgrade)
                        .length
                    }{" "}
                    / {level(state, "keep") >= 4 ? 2 : 1} builders at work.
                  </strong>{" "}
                  Upgrades finish automatically. A second builder unlocks at
                  Keep level 4.
                </span>
                <Badge>{capacityHours(state)}h storage</Badge>
              </div>
              <div className="buildings-grid full-buildings">
                {BUILDINGS.map((b) => (
                  <BuildingCard
                    state={state}
                    setModal={setModal}
                    now={now}
                    b={b}
                    key={b.id}
                    full
                  />
                ))}
              </div>
            </>
          )}
          {page === "heroes" && (
            <>
              <div className="page-heading">
                <div>
                  <div className="eyebrow">EVERY HERO HAS A STORY</div>
                  <h1>Your company</h1>
                  <p>
                    {state.heroes.length} of {HEROES.length} heroes discovered.
                    A thousand adventures ahead.
                  </p>
                </div>
                <button
                  className="button primary"
                  onClick={() => go("summoning")}
                >
                  <Sparkles size={16} />
                  Summon heroes
                </button>
              </div>
              <div className="collection-stats">
                <div>
                  <Users size={21} />
                  <strong>
                    {state.heroes.length}
                    <span>Heroes collected</span>
                  </strong>
                </div>
                <div>
                  <Zap size={21} />
                  <strong>
                    {fmt(totalPower(state))}
                    <span>Company power</span>
                  </strong>
                </div>
                <div>
                  <Compass size={21} />
                  <strong>
                    {state.heroes.length - available}
                    <span>On an expedition</span>
                  </strong>
                </div>
                <div>
                  <Crown size={21} />
                  <strong>
                    {
                      state.heroes.filter(
                        (h) => getHero(h.id).rarity === "Legendary",
                      ).length
                    }{" "}
                    / 4<span>Legends discovered</span>
                  </strong>
                </div>
              </div>
              <div className="filter-bar">
                <div className="tabs">
                  <button
                    className={filters.owned ? "active" : ""}
                    onClick={() => setFilters({ ...filters, owned: true })}
                  >
                    My heroes <span>{state.heroes.length}</span>
                  </button>
                  <button
                    className={!filters.owned ? "active" : ""}
                    onClick={() => setFilters({ ...filters, owned: false })}
                  >
                    Hero collection <span>{HEROES.length}</span>
                  </button>
                </div>
                <div className="filters">
                  <label className="search-field">
                    <Search size={15} />
                    <input
                      aria-label="Search heroes"
                      placeholder="Find a hero…"
                      value={filters.search}
                      onChange={(e) =>
                        setFilters({ ...filters, search: e.target.value })
                      }
                    />
                  </label>
                  <select
                    aria-label="Filter by role"
                    value={filters.role}
                    onChange={(e) =>
                      setFilters({ ...filters, role: e.target.value })
                    }
                  >
                    {["All roles", ...Object.keys(ROLES)].map((r) => (
                      <option key={r}>{r}</option>
                    ))}
                  </select>
                  <select
                    aria-label="Filter by rarity"
                    value={filters.rarity}
                    onChange={(e) =>
                      setFilters({ ...filters, rarity: e.target.value })
                    }
                  >
                    {["All rarities", ...Object.keys(RARITY_COLORS)].map(
                      (r) => (
                        <option key={r}>{r}</option>
                      ),
                    )}
                  </select>
                </div>
              </div>
              <div className="heroes-grid">
                {HEROES.filter(
                  (def) =>
                    (!filters.owned ||
                      state.heroes.some((h) => h.id === def.id)) &&
                    (filters.role === "All roles" ||
                      def.role === filters.role) &&
                    (filters.rarity === "All rarities" ||
                      def.rarity === filters.rarity) &&
                    `${def.name} ${def.traits.join(" ")}`
                      .toLowerCase()
                      .includes(filters.search.toLowerCase()),
                ).map((def) => (
                  <HeroCard
                    state={state}
                    setModal={setModal}
                    def={def}
                    owned={state.heroes.find((h) => h.id === def.id)}
                    key={def.id}
                  />
                ))}
              </div>
              {!HEROES.some(
                (def) =>
                  (!filters.owned ||
                    state.heroes.some((h) => h.id === def.id)) &&
                  (filters.role === "All roles" || def.role === filters.role) &&
                  (filters.rarity === "All rarities" ||
                    def.rarity === filters.rarity) &&
                  `${def.name} ${def.traits.join(" ")}`
                    .toLowerCase()
                    .includes(filters.search.toLowerCase()),
              ) && (
                <EmptyState icon={Search} title="No heroes found">
                  Try another name, trait, role, or rarity.
                </EmptyState>
              )}
            </>
          )}
          {page === "missions" && (
            <>
              <div className="page-heading">
                <div>
                  <div className="eyebrow">
                    THERE’S A WORLD BEYOND THE GATES
                  </div>
                  <h1>The mission board</h1>
                  <p>
                    Match their strengths. Send them forth. Welcome them home.
                  </p>
                </div>
                <Badge tone="green">
                  <Compass size={14} />
                  {state.missions.length} / {missionSlots(state)} expeditions
                  active
                </Badge>
              </div>
              <div className="mission-intro">
                <div className="mission-intro-icon">
                  <Compass size={29} strokeWidth={1.3} />
                </div>
                <div>
                  <h3>Good company makes all the difference.</h3>
                  <p>
                    Counter mission challenges with hero traits. Matching
                    affinities and diverse roles improve your odds, too.
                  </p>
                </div>
                <button className="text-button" onClick={() => go("guide")}>
                  How missions work
                  <ArrowUpRight size={15} />
                </button>
              </div>
              <div className="filter-bar">
                <div className="tabs">
                  {[
                    ["available", "Available", availableMissions.length],
                    ["active", "In progress", state.missions.length],
                    ["all", "All regions", MISSIONS.length],
                  ].map(([id, label, count]) => (
                    <button
                      className={missionTab === id ? "active" : ""}
                      onClick={() => setMissionTab(id)}
                      key={id}
                    >
                      {label}
                      <span>{count}</span>
                      {id === "active" && ready > 0 && (
                        <span className="ready-dot" />
                      )}
                    </button>
                  ))}
                </div>
                <span className="reset-note">
                  <Clock3 size={13} />
                  Board refreshes at 00:00 UTC
                </span>
              </div>
              <div className="missions-grid">
                {missionTab === "active"
                  ? state.missions.map((a) => (
                      <MissionCard
                        state={state}
                        setModal={setModal}
                        now={now}
                        claimMission={claimMission}
                        openMission={openMission}
                        key={a.id}
                        m={MISSIONS.find((m) => m.id === a.id)}
                        active={a}
                      />
                    ))
                  : (missionTab === "available"
                      ? availableMissions
                      : MISSIONS.filter(
                          (m) =>
                            !state.missions.some((a) => a.id === m.id) &&
                            !state.completed.includes(m.id),
                        )
                    ).map((m) => (
                      <MissionCard
                        state={state}
                        setModal={setModal}
                        now={now}
                        claimMission={claimMission}
                        openMission={openMission}
                        key={m.id}
                        m={m}
                      />
                    ))}
              </div>
              {missionTab === "active" && !state.missions.length && (
                <EmptyState
                  title="A new adventure is waiting"
                  action={
                    <button
                      className="button primary"
                      onClick={() => setMissionTab("available")}
                    >
                      Explore available missions
                      <ArrowRight size={15} />
                    </button>
                  }
                >
                  Your heroes are resting at the stronghold. Put together a
                  party and send them into the world.
                </EmptyState>
              )}
              {missionTab === "available" && !availableMissions.length && (
                <EmptyState icon={CheckCheck} title="A day well adventured">
                  All current expeditions are underway or complete. The board
                  refreshes at midnight UTC. Upgrading the Keep opens new
                  regions.
                </EmptyState>
              )}
              <div className="info-strip">
                <Shield size={17} />
                <span>
                  No hero is ever lost. Even a setback brings home{" "}
                  <strong>60% of resource rewards and full experience.</strong>
                </span>
              </div>
            </>
          )}
          {page === "summoning" && (
            <>
              <div className="page-heading">
                <div>
                  <div className="eyebrow">
                    A STRANGER TODAY. A LEGEND TOMORROW.
                  </div>
                  <h1>The summoning gate</h1>
                  <p>Somewhere out there, your next companion is waiting.</p>
                </div>
                <Resource type="aether" amount={state.resources.aether} />
              </div>
              <section className="summoning-scene">
                <div className="summoning-art">
                  <SummonArt />
                </div>
                <div className="summoning-copy">
                  <Badge tone="gold">
                    <Sparkles size={13} />
                    THE EVERLIGHT GATE
                  </Badge>
                  <h2>
                    A call across
                    <br />
                    the realms.
                  </h2>
                  <p>
                    Offer a little aether. Welcome a new story.
                    <br />
                    Every hero has a place in your company.
                  </p>
                  <div className="summon-buttons">
                    <button
                      className="button primary"
                      disabled={state.freeSummonDay === dayKey(now)}
                      onClick={() => summon(1, true)}
                    >
                      <Gift size={16} />
                      {state.freeSummonDay === dayKey(now)
                        ? "Free summon claimed"
                        : "Your daily free summon"}
                      {state.freeSummonDay !== dayKey(now) && (
                        <ArrowRight size={16} />
                      )}
                    </button>
                    <div>
                      <button
                        className="button secondary"
                        disabled={state.resources.aether < 60}
                        onClick={() => summon(1)}
                      >
                        Summon one
                        <Resource type="aether" amount={60} small />
                      </button>
                      <button
                        className="button secondary"
                        disabled={state.resources.aether < 270}
                        onClick={() => summon(5)}
                      >
                        Summon five
                        <Resource type="aether" amount={270} small />
                      </button>
                    </div>
                    <small>
                      Five summons save 10% · No paid currency. Ever.
                    </small>
                  </div>
                </div>
              </section>
              <div className="summon-guarantees">
                <div>
                  <Shield size={24} />
                  <div>
                    <h3>A little certainty in the magic</h3>
                    <p>Rare or better within {10 - state.rarePity} summons</p>
                    <Progress value={state.rarePity} max={10} />
                  </div>
                  <span>{state.rarePity}/10</span>
                </div>
                <div>
                  <Crown size={25} />
                  <div>
                    <h3>A legend is drawing closer</h3>
                    <p>Legendary within {40 - state.pity} summons</p>
                    <Progress
                      value={state.pity}
                      max={40}
                      className="gold-progress"
                    />
                  </div>
                  <span>{state.pity}/40</span>
                </div>
              </div>
              <SectionHeading title="The magic, made transparent">
                <span className="muted small-text">
                  Every summon, including free ones, counts toward guarantees.
                </span>
              </SectionHeading>
              <div className="odds-grid">
                {[
                  ["Common", 45],
                  ["Rare", 37],
                  ["Epic", 15],
                  ["Legendary", 3],
                ].map(([r, percent]) => (
                  <div key={r} style={{ "--rarity": RARITY_COLORS[r] }}>
                    <span>
                      <Star size={16} />
                      {r}
                    </span>
                    <strong>{percent}%</strong>
                    <Progress value={percent} />
                  </div>
                ))}
              </div>
              <div className="info-strip">
                <Users size={17} />
                <span>
                  Reunited with an old friend? Duplicate heroes grant{" "}
                  <strong>soul shards</strong> to ascend that hero, increasing
                  power by 20% per rank.
                </span>
              </div>
            </>
          )}
          {page === "daily" && (
            <>
              <div className="page-heading">
                <div>
                  <div className="eyebrow">
                    SMALL MOMENTS. MEANINGFUL REWARDS.
                  </div>
                  <h1>A little something, every day.</h1>
                  <p>
                    Your adventure fits around your life. Missing a day never
                    resets your reward track.
                  </p>
                </div>
                <span className="reset-note">
                  <Clock3 size={14} />
                  Resets at 00:00 UTC
                </span>
              </div>
              <SectionHeading title="The seven-day journey">
                <Badge tone="gold">
                  <CalendarDays size={13} />
                  {state.login.count} days welcomed
                </Badge>
              </SectionHeading>
              <div className="login-grid">
                {LOGIN_REWARDS.map((reward, i) => {
                  const index = state.login.count % 7,
                    current = loginReady ? index : (state.login.count - 1) % 7,
                    claimed = loginReady ? i < index : i <= current;
                  return (
                    <button
                      key={i}
                      className={`login-card ${i === current ? "current" : ""} ${claimed ? "claimed" : ""} ${i === 6 ? "grand" : ""}`}
                      disabled={i !== current || !loginReady}
                      onClick={() => run({ type: "login" })}
                    >
                      <span>DAY {i + 1}</span>
                      <div className="login-gift">
                        {claimed ? (
                          <CheckCheck size={33} strokeWidth={1.4} />
                        ) : i === 6 ? (
                          <Crown size={42} strokeWidth={1.2} />
                        ) : (
                          <Gift size={34} strokeWidth={1.2} />
                        )}
                      </div>
                      <Rewards rewards={reward} small />
                      <strong>
                        {claimed
                          ? "Claimed"
                          : i === current
                            ? "Claim reward"
                            : i === 6
                              ? "A grand little gift"
                              : "Coming soon"}
                      </strong>
                    </button>
                  );
                })}
              </div>
              <SectionHeading title="Today’s little adventures">
                <span className="muted small-text">
                  {state.daily.claimed.length} of 3 completed
                </span>
              </SectionHeading>
              <div className="daily-layout">
                <div className="quest-list">
                  {DAILY_QUESTS.map((q, i) => {
                    const done = state.daily.progress[q.id] >= q.target,
                      claimed = state.daily.claimed.includes(q.id);
                    const Icon = [PackageOpen, Compass, Sword][i];
                    return (
                      <div
                        className={`quest-card ${claimed ? "quest-claimed" : ""}`}
                        key={q.id}
                      >
                        <div className="quest-icon">
                          <Icon size={23} strokeWidth={1.5} />
                        </div>
                        <div className="quest-info">
                          <h3>{q.name}</h3>
                          <p>{q.text}</p>
                          <Progress
                            value={state.daily.progress[q.id]}
                            max={q.target}
                          />
                          <small>
                            {Math.min(q.target, state.daily.progress[q.id])} /{" "}
                            {q.target}
                          </small>
                        </div>
                        <Rewards rewards={q.reward} small />
                        {claimed ? (
                          <Badge tone="green">
                            <Check size={13} />
                            Claimed
                          </Badge>
                        ) : done ? (
                          <button
                            className="button primary small-btn"
                            onClick={() => run({ type: "quest", id: q.id })}
                          >
                            Claim
                            <Gift size={13} />
                          </button>
                        ) : (
                          <button
                            className="button quiet small-btn"
                            onClick={() =>
                              go(
                                {
                                  collect: "stronghold",
                                  dispatch: "missions",
                                  train: "heroes",
                                }[q.id],
                              )
                            }
                          >
                            Go
                            <ArrowRight size={13} />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
                <div className="daily-chest">
                  <div className="chest-art">
                    <Gift size={60} strokeWidth={1} />
                    <span>✦</span>
                    <i>✧</i>
                  </div>
                  <h3>A day well spent</h3>
                  <p>
                    Complete and claim all three daily quests for a little extra
                    magic.
                  </p>
                  <Rewards rewards={{ aether: 25, gold: 300 }} />
                  <button
                    className="button primary"
                    disabled={
                      state.daily.claimed.length !== 3 || state.daily.bonus
                    }
                    onClick={() => run({ type: "dailyBonus" })}
                  >
                    {state.daily.bonus ? (
                      <>
                        <Check size={15} />
                        Chest claimed
                      </>
                    ) : (
                      <>
                        <Gift size={15} />
                        Open daily chest
                      </>
                    )}
                  </button>
                </div>
              </div>
            </>
          )}
          {page === "chronicle" && (
            <>
              <div className="page-heading">
                <div>
                  <div className="eyebrow">
                    EVERY GREAT TALE BEGINS SOMEWHERE
                  </div>
                  <h1>The Emberfall chronicle</h1>
                  <p>
                    Not a race to the end. A story worth taking your time with.
                  </p>
                </div>
                <Badge tone="gold">
                  <BookOpen size={14} />
                  {state.chapter} / 7 chapters complete
                </Badge>
              </div>
              {c ? (
                <section className="chapter-feature">
                  <div>
                    <span className="eyebrow">
                      CHAPTER {roman(state.chapter)}
                    </span>
                    <h2>{c.name}</h2>
                    <p>{c.text}</p>
                    <div className="chapter-milestones">
                      {[
                        [
                          level(state, "keep"),
                          c.keep,
                          `Reach Keep level ${c.keep}`,
                        ],
                        [
                          state.totalMissions,
                          c.missions,
                          `Complete ${c.missions} expeditions`,
                        ],
                        [
                          state.heroes.length,
                          c.heroes,
                          `Collect ${c.heroes} heroes`,
                        ],
                      ].map(([value, target, text]) => (
                        <div key={text}>
                          {value >= target ? (
                            <CircleCheck size={18} />
                          ) : (
                            <Circle size={18} />
                          )}
                          <span>{text}</span>
                          <strong>
                            {Math.min(value, target)} / {target}
                          </strong>
                        </div>
                      ))}
                    </div>
                    <div className="chapter-claim">
                      <Rewards rewards={c.reward} />
                      <button
                        className="button primary"
                        disabled={!chapterReady(state)}
                        onClick={() => run({ type: "chapter" })}
                      >
                        Complete chapter
                        <Trophy size={15} />
                      </button>
                    </div>
                  </div>
                  <div className="chapter-art">
                    <WorldArt />
                  </div>
                </section>
              ) : (
                <section className="ending">
                  <Crown size={42} />
                  <h2>An ember, everlasting.</h2>
                  <p>
                    Seven chapters. One hundred adventures. A stronghold that
                    will always be home.
                    <br />
                    Your story is complete, but your heroes are not done
                    exploring.
                  </p>
                  <Badge tone="gold">KEEPER OF THE EVERLIGHT</Badge>
                </section>
              )}
              <div className="chapter-track">
                {CHAPTERS.map((ch, i) => (
                  <div
                    key={ch.name}
                    className={
                      i < state.chapter
                        ? "complete"
                        : i === state.chapter
                          ? "current"
                          : ""
                    }
                  >
                    <span>
                      {i < state.chapter ? <Check size={16} /> : roman(i)}
                    </span>
                    <strong>{ch.name}</strong>
                    <small>
                      {i < state.chapter
                        ? "Completed"
                        : i === state.chapter
                          ? "Your current chapter"
                          : `Keep ${ch.keep} · ${ch.missions} expeditions`}
                    </small>
                  </div>
                ))}
              </div>
              <SectionHeading title="Around the hearth">
                <span className="muted small-text">
                  The last 80 moments in your story
                </span>
              </SectionHeading>
              <div className="activity-log">
                {state.log.map((entry) => (
                  <div key={entry.id}>
                    <span className={`log-icon ${entry.type}`}>
                      {React.createElement(
                        {
                          story: BookOpen,
                          building: Hammer,
                          mission: Compass,
                          hero: Users,
                          reward: Gift,
                        }[entry.type] || Star,
                        { size: 16 },
                      )}
                    </span>
                    <p>{entry.text}</p>
                    <time dateTime={new Date(entry.at).toISOString()}>
                      {new Date(entry.at).toLocaleString(undefined, {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </time>
                  </div>
                ))}
              </div>
            </>
          )}
          {page === "guide" && (
            <>
              <div className="page-heading">
                <div>
                  <div className="eyebrow">A COMPANION FOR YOUR JOURNEY</div>
                  <h1>The field guide</h1>
                  <p>Everything you need to feel at home in Emberfall.</p>
                </div>
                <BookOpen size={31} className="gold-text" />
              </div>
              <div className="guide-welcome">
                <Leaf size={30} strokeWidth={1.5} />
                <div>
                  <h2>Made for life between adventures.</h2>
                  <p>
                    Check in over morning coffee. Collect your resources, send a
                    few heroes out, and start an upgrade. Come back in the
                    evening to see what they found. Two or three visits a day is
                    plenty.
                  </p>
                </div>
              </div>
              <div className="guide-grid">
                {[
                  [
                    "Your first day",
                    Castle,
                    "Collect your starting supply cache already waiting at your buildings. Train one hero, claim your daily gift, and take your free summon. Send two heroes on “A road worth taking”—your first, five-minute expedition. Other missions take 4–12 hours. Upgrade the Keep to level 2 when your builder is free.",
                  ],
                  [
                    "A growing stronghold",
                    Hammer,
                    "Gold, timber, stone, and aether come from production buildings. Collect their stores to use them. Buildings work offline up to 24 hours of storage; each Storehouse level adds 12 hours. Production per hour is the base rate × level^1.22, rounded. Upgrading a working building does not stop production.",
                  ],
                  [
                    "Building your kingdom",
                    Castle,
                    "One builder handles construction until Keep level 4 unlocks a second. Other buildings can rise one level above the Keep. To advance the Keep, your Lumber Mill, Gold Mine, and Stone Quarry must each match its current level. Construction costs scale by 1.7× and times by 1.5× per level, up to 48 hours.",
                  ],
                  [
                    "The right heroes for the job",
                    Shield,
                    "Success starts at 25%, plus up to 52.5 points from party power (35 × party power / recommended power, capped at 1.5). Each matching challenge gives +12 points, a matching affinity +8, three different roles +5, and each Sanctum level +5. The final chance is rounded and capped at 100%. Traits count once each, not once per hero.",
                  ],
                  [
                    "Away, but never forgotten",
                    Compass,
                    "Send one to three heroes per expedition (two on your first). Heroes cannot train or join another mission until you claim their return. The Guild adds one active mission slot per level. Missions resolve when dispatched, so reloading cannot change the outcome. Failure still brings 60% of resources and all experience; heroes are never injured or lost.",
                  ],
                  [
                    "Stronger together",
                    Sword,
                    "Each hero level adds 8.5% of their base power. Training costs 100 × current level gold and 80 × current level experience. All party members earn the full mission experience reward. Your level cap is 10 + 5 × Keep level, up to 50. Duplicate summons grant one hero-specific soul shard; ascension costs 2, 4, 6, 8, then 10 shards and adds 20% power per rank.",
                  ],
                  [
                    "Honest magic",
                    Sparkles,
                    "Summon for 60 aether, or five for 270. One free daily summon counts toward guarantees. Base odds: 45% Common, 37% Rare, 15% Epic, 3% Legendary. The tenth consecutive summon without Rare or better is at least Rare; the fortieth without a Legendary is guaranteed Legendary. A higher rarity resets its relevant counter. Heroes are equally likely within each rarity.",
                  ],
                  [
                    "A reason to return",
                    Gift,
                    "Daily gifts, the free summon, daily quests, and completed mission availability reset at midnight UTC. Gifts follow a repeating seven-claim track; missing a day does not reset it. Active missions carry over safely. Your first expedition is one-time only. Finish and claim all daily quests for a bonus chest. Chronicle chapters reward long-term milestones.",
                  ],
                  [
                    "Your save, your adventure",
                    Download,
                    "Progress is saved on this browser and device after every action and every 10 seconds. Offline progress uses your device clock, so keep it accurate. You can close the page while missions and upgrades are running. Export a backup from Settings before clearing browser data or switching devices. There is no account, cloud sync, tracking, or server to pay for. Open tabs synchronize saved actions; use one tab for the smoothest experience.",
                  ],
                  [
                    "Free, for all the right reasons",
                    Heart,
                    "Emberfall is completely free and open source under the MIT license. No purchases, energy timers, advertisements, or paid shortcuts. All illustrations are original SVG artwork included in the source. Built as a static site for GitHub Pages; game data never leaves your device.",
                  ],
                ].map(([title, Icon, text]) => (
                  <article key={title}>
                    <div className="guide-icon">
                      <Icon size={22} />
                    </div>
                    <h3>{title}</h3>
                    <p>{text}</p>
                  </article>
                ))}
              </div>
              <div className="guide-source">
                <span>Built with care. Shared with everyone.</span>
                <a
                  className="text-button"
                  href="https://github.com/arenaaiprojects/HeroMissions"
                  target="_blank"
                  rel="noreferrer"
                >
                  Explore the source
                  <ExternalLink size={14} />
                </a>
              </div>
            </>
          )}
          <footer className="main-footer">
            <span>
              <BrandMark />A realm of your own.
            </span>
            <span>Always free. Open source. Made to take your time.</span>
            <button onClick={() => go("guide")}>
              Field guide
              <ArrowUpRight size={12} />
            </button>
          </footer>
        </main>
      </div>
      {modal?.type === "building" &&
        (() => {
          const b = BUILDINGS.find((b) => b.id === modal.id),
            data = state.buildings[b.id],
            cost = upgradeCost(state, b.id),
            problem = upgradeProblem(state, b.id),
            rate = production(state, b.id);
          return (
            <Modal
              title={b.name}
              subtitle={
                data.level
                  ? `Level ${data.level} · ${data.level === b.max ? "Fully upgraded" : "Room to grow"}`
                  : "A new addition to your realm"
              }
              onClose={closeModal}
            >
              <div className="building-detail-art">
                <BuildingArt type={b.type} />
              </div>
              <div className="modal-content">
                <p className="detail-description">{b.description}</p>
                {b.resource && data.level > 0 && (
                  <div className="detail-stats">
                    <div>
                      <span>Production</span>
                      <strong>
                        <Resource type={b.resource} amount={rate} />
                        <small>/ hour</small>
                      </strong>
                    </div>
                    <div>
                      <span>In storage</span>
                      <strong>
                        {fmt(data.stock)}{" "}
                        <small>/ {fmt(rate * capacityHours(state))}</small>
                      </strong>
                    </div>
                    <div>
                      <span>Offline capacity</span>
                      <strong>
                        {capacityHours(state)} <small>hours</small>
                      </strong>
                    </div>
                  </div>
                )}
                {data.upgrade ? (
                  <div className="upgrade-status">
                    <div>
                      <Hammer size={20} />
                      <h3>
                        {data.level
                          ? "An even better home."
                          : "Something new is taking shape."}
                      </h3>
                    </div>
                    <p>
                      Level {data.level + 1} will be ready in{" "}
                      {duration(data.upgrade.end - now)}.
                    </p>
                    <Progress
                      value={now - data.upgrade.start}
                      max={data.upgrade.end - data.upgrade.start}
                      className="gold-progress"
                    />
                    <small>
                      Your builders keep working when the game is closed.
                    </small>
                  </div>
                ) : data.level < b.max ? (
                  <>
                    <div className="upgrade-preview">
                      <div>
                        <span>
                          {data.level ? "NEXT LEVEL" : "CONSTRUCTION"}
                        </span>
                        <h3>
                          {data.level
                            ? `Level ${data.level} → ${data.level + 1}`
                            : "Establish this building"}
                        </h3>
                      </div>
                      <Badge>
                        <Clock3 size={13} />
                        {duration(upgradeTime(state, b.id))}
                      </Badge>
                    </div>
                    {b.resource && (
                      <p className="upgrade-benefit">
                        <ArrowUp size={14} />
                        Production increases to{" "}
                        {Math.round(
                          b.base * Math.pow(data.level + 1, 1.22),
                        )}{" "}
                        {RESOURCE_NAMES[b.resource].toLowerCase()} / hour
                      </p>
                    )}
                    <div className="cost-row">
                      <span>Resources needed</span>
                      <Rewards rewards={cost} />
                    </div>
                    <button
                      className="button primary full-width"
                      disabled={!!problem}
                      onClick={() => {
                        if (run({ type: "upgrade", id: b.id })) closeModal();
                      }}
                    >
                      <Hammer size={16} />
                      {data.level ? "Begin upgrade" : "Start construction"}
                    </button>
                    {problem && (
                      <p className="requirement-note">
                        <CircleHelp size={13} />
                        {problem}
                      </p>
                    )}
                    <p className="modal-footnote">
                      Resources are spent now. Your building keeps producing
                      during upgrades.
                    </p>
                  </>
                ) : (
                  <div className="info-strip">
                    <Trophy size={20} />
                    <span>This building has reached its full potential.</span>
                  </div>
                )}
              </div>
            </Modal>
          );
        })()}
      {modal?.type === "hero" &&
        (() => {
          const h = state.heroes.find((h) => h.id === modal.id),
            def = getHero(modal.id),
            Role = ROLES[def.role],
            Affinity = AFFINITIES[def.affinity],
            busy = h && heroBusy(state, h.id),
            trainable =
              h &&
              !busy &&
              h.xp >= xpNeeded(h) &&
              state.resources.gold >= trainCost(h) &&
              h.level < Math.min(50, 10 + level(state, "keep") * 5);
          return (
            <Modal
              title={def.name}
              subtitle={def.title}
              onClose={closeModal}
              wide
            >
              <div className="hero-detail">
                <div
                  className="hero-detail-portrait"
                  style={{ "--rarity": RARITY_COLORS[def.rarity] }}
                >
                  <HeroArt hero={def} />
                  <span className="hero-rarity">{def.rarity}</span>
                </div>
                <div className="hero-detail-info">
                  <div className="detail-hero-tags">
                    <Badge>
                      <Role size={13} />
                      {def.role}
                    </Badge>
                    <Badge>
                      <Affinity size={13} />
                      {def.affinity}
                    </Badge>
                  </div>
                  <h3>
                    {h
                      ? "A hero in your story."
                      : "A story yet to be discovered."}
                  </h3>
                  <p>
                    Every adventure brings a little more experience. Every
                    companion brings something different.
                  </p>
                  <div className="hero-power">
                    <Zap size={20} />
                    <strong>{h ? power(h) : def.power}</strong>
                    <span>{h ? "Hero power" : "Base power"}</span>
                    {h && <Badge>LEVEL {h.level}</Badge>}
                  </div>
                  <div className="trait-details">
                    {def.traits.map((t) => (
                      <div key={t}>
                        <Shield size={15} />
                        <strong>{t}</strong>
                        <span>+12% when countering this challenge</span>
                      </div>
                    ))}
                  </div>
                  {h ? (
                    <>
                      <div className="xp-label">
                        <span>Experience</span>
                        <span>
                          {fmt(h.xp)} / {xpNeeded(h)} XP
                        </span>
                      </div>
                      <Progress value={h.xp} max={xpNeeded(h)} />
                      <button
                        className="button primary full-width"
                        disabled={!trainable}
                        onClick={() => run({ type: "train", id: h.id })}
                      >
                        <Sword size={15} />
                        Train to level {h.level + 1}
                        <Resource type="gold" amount={trainCost(h)} small />
                      </button>
                      <small className="muted">
                        {busy
                          ? "This hero must return from their expedition first."
                          : h.level >=
                              Math.min(50, 10 + level(state, "keep") * 5)
                            ? "Training cap reached. Upgrade the Keep."
                            : h.xp < xpNeeded(h)
                              ? "Earn more experience on expeditions."
                              : state.resources.gold < trainCost(h)
                                ? "Collect more gold to train this hero."
                                : `Uses ${xpNeeded(h)} XP · +8.5% of base power per level`}
                      </small>
                      <div className="ascension-row">
                        <div>
                          <strong>Ascension {h.rank} / 5</strong>
                          <span>
                            {h.shards} soul shards ·{" "}
                            {h.rank < 5
                              ? `${2 + h.rank * 2} needed`
                              : "Fully ascended"}
                          </span>
                        </div>
                        <button
                          className="button secondary small-btn"
                          disabled={
                            busy || h.rank >= 5 || h.shards < 2 + h.rank * 2
                          }
                          onClick={() => run({ type: "ascend", id: h.id })}
                        >
                          <Star size={14} />
                          Ascend
                        </button>
                      </div>
                      <div className="ascension-stars">
                        {Array.from({ length: 5 }, (_, i) => (
                          <Star
                            size={17}
                            key={i}
                            fill={i < h.rank ? "currentColor" : "none"}
                            className={i < h.rank ? "gold-text" : "muted"}
                          />
                        ))}
                      </div>
                    </>
                  ) : (
                    <button
                      className="button primary full-width"
                      onClick={() => {
                        closeModal();
                        go("summoning");
                      }}
                    >
                      <Sparkles size={15} />
                      Visit the summoning gate
                    </button>
                  )}
                </div>
              </div>
            </Modal>
          );
        })()}
      {modal?.type === "mission" &&
        (() => {
          const m = modal.mission,
            stats = missionStats(state, m, party),
            free = state.heroes.filter((h) => !heroBusy(state, h.id));
          const optimize = () => {
            let best = [],
              score = -1;
            const count = Math.min(m.slots, free.length);
            const search = (start, ids) => {
              if (ids.length === count) {
                const st = missionStats(state, m, ids);
                const val = st.chance * 10000 + st.power;
                if (val > score) {
                  best = [...ids];
                  score = val;
                }
                return;
              }
              for (let i = start; i < free.length; i++)
                search(i + 1, [...ids, free[i].id]);
            };
            search(0, []);
            setParty(best);
          };
          return (
            <Modal
              title="Assemble your company"
              subtitle={m.name}
              onClose={closeModal}
              wide
            >
              <div className="mission-detail-landscape">
                <MissionArt scene={m.scene} />
                <div>
                  <span className="region">{m.region}</span>
                  <h3>{m.name}</h3>
                  <span>
                    <Clock3 size={13} />
                    {duration(m.hours * HOUR)}
                    <i />
                    Recommended power {m.power}
                  </span>
                </div>
              </div>
              <div className="modal-content">
                <p className="detail-description">{m.text}</p>
                <div className="mission-match">
                  <div>
                    <span>MISSION CHALLENGES</span>
                    <div>
                      {m.traits.map((t) => (
                        <Badge
                          tone={stats.traits.includes(t) ? "green" : ""}
                          key={t}
                        >
                          {stats.traits.includes(t) ? (
                            <Check size={12} />
                          ) : (
                            <Shield size={12} />
                          )}{" "}
                          {t}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <span>FAVORED AFFINITY</span>
                    <Badge tone={stats.affinity ? "green" : ""}>
                      {React.createElement(AFFINITIES[m.affinity], {
                        size: 13,
                      })}
                      {m.affinity} {stats.affinity && <Check size={12} />}
                    </Badge>
                  </div>
                </div>
                <div className="party-heading">
                  <h3>
                    Select your party{" "}
                    <span>
                      {party.length} / {m.slots}
                    </span>
                  </h3>
                  <button
                    className="text-button"
                    disabled={!free.length}
                    onClick={optimize}
                  >
                    <Sparkles size={13} />
                    Suggest party
                  </button>
                </div>
                <div className="party-grid">
                  {state.heroes.map((h) => {
                    const def = getHero(h.id),
                      selected = party.includes(h.id),
                      busy = heroBusy(state, h.id);
                    return (
                      <button
                        key={h.id}
                        className={`party-hero ${selected ? "selected" : ""} ${busy ? "busy" : ""}`}
                        disabled={
                          busy || (!selected && party.length >= m.slots)
                        }
                        onClick={() =>
                          setParty(
                            selected
                              ? party.filter((id) => id !== h.id)
                              : [...party, h.id],
                          )
                        }
                        aria-pressed={selected}
                      >
                        <div className="party-portrait">
                          <HeroArt hero={def} />
                        </div>
                        <div>
                          <strong>{def.short}</strong>
                          <span>
                            {def.role} · Lv. {h.level}
                          </span>
                          <small>
                            {busy ? (
                              "On an expedition"
                            ) : (
                              <>
                                <Zap size={10} />
                                {power(h)}
                                <span>
                                  {def.traits.filter((t) =>
                                    m.traits.includes(t),
                                  ).length > 0
                                    ? "Trait match"
                                    : ""}
                                </span>
                              </>
                            )}
                          </small>
                        </div>
                        <span className="party-check">
                          {selected ? (
                            <Check size={13} />
                          ) : busy ? (
                            <LockKeyhole size={12} />
                          ) : (
                            <Plus size={13} />
                          )}
                        </span>
                      </button>
                    );
                  })}
                </div>
                <div className="mission-prediction">
                  <div>
                    <span>SUCCESS CHANCE</span>
                    <strong
                      className={
                        stats.chance >= 85
                          ? "green-text"
                          : stats.chance >= 60
                            ? "gold-text"
                            : ""
                      }
                    >
                      {stats.chance}%
                    </strong>
                    <Progress value={stats.chance} />
                  </div>
                  <div>
                    <span>PARTY POWER</span>
                    <strong>
                      {stats.power}
                      <small> / {m.power}</small>
                    </strong>
                    <p>
                      {stats.diverse
                        ? "Diverse roles · +5% chance"
                        : "3 different roles grant +5%"}
                    </p>
                  </div>
                  <div>
                    <span>EXPEDITION REWARDS</span>
                    <Rewards
                      rewards={Object.fromEntries(
                        Object.entries(m.rewards).map(([r, v]) => [
                          r,
                          Math.round(
                            v * (1 + level(state, "observatory") * 0.1),
                          ),
                        ]),
                      )}
                    />
                    <p>
                      +{Math.round(m.xp * (1 + level(state, "academy") * 0.2))}{" "}
                      XP per hero
                    </p>
                  </div>
                </div>
                <button
                  className="button primary full-width"
                  disabled={
                    !party.length ||
                    state.missions.length >= missionSlots(state)
                  }
                  onClick={() => {
                    if (run({ type: "dispatch", id: m.id, heroes: party })) {
                      closeModal();
                      setMissionTab("active");
                    }
                  }}
                >
                  <Compass size={16} />
                  {state.missions.length >= missionSlots(state)
                    ? "All expedition slots are in use"
                    : `Begin expedition · ${duration(m.hours * HOUR)}`}
                  <ArrowRight size={16} />
                </button>
                <p className="modal-footnote">
                  Heroes return safely, whatever the outcome. Close the game and
                  let them explore.
                </p>
              </div>
            </Modal>
          );
        })()}
      {modal?.type === "active" &&
        (() => {
          const a = state.missions.find((m) => m.id === modal.id);
          if (!a) return null;
          const m = MISSIONS.find((m) => m.id === a.id);
          return (
            <Modal
              title="An adventure in the making"
              subtitle={m.name}
              onClose={closeModal}
            >
              <div className="active-mission-art">
                <MissionArt scene={m.scene} />
              </div>
              <div className="modal-content">
                <div className="expedition-timer">
                  <Compass size={24} />
                  <strong>{duration(a.end - now)}</strong>
                  <span>
                    {a.end <= now
                      ? "Your company has returned"
                      : "until your heroes return"}
                  </span>
                </div>
                <Progress value={now - a.start} max={a.end - a.start} />
                <div className="active-party">
                  {a.heroes.map((id) => (
                    <div key={id}>
                      <HeroArt hero={getHero(id)} />
                      <strong>{getHero(id).short}</strong>
                    </div>
                  ))}
                </div>
                <div className="cost-row">
                  <span>Chance of success</span>
                  <strong className="green-text">{a.chance}%</strong>
                </div>
                <Rewards
                  rewards={Object.fromEntries(
                    Object.entries(m.rewards).map(([r, v]) => [
                      r,
                      Math.round(v * a.rewardMultiplier),
                    ]),
                  )}
                />
                {a.end <= now ? (
                  <button
                    className="button primary full-width"
                    onClick={() => claimMission(m.id)}
                  >
                    <Gift size={16} />
                    Welcome them home
                  </button>
                ) : (
                  <p className="modal-footnote">
                    The expedition continues while you’re away. Return after{" "}
                    {new Date(a.end).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}{" "}
                    to claim rewards.
                  </p>
                )}
              </div>
            </Modal>
          );
        })()}
      {modal?.type === "missionResult" && (
        <Modal
          title={
            modal.success ? "A triumphant return!" : "Every journey teaches us."
          }
          subtitle={modal.mission.name}
          onClose={closeModal}
        >
          <div className="mission-result">
            <div className={`result-emblem ${modal.success ? "success" : ""}`}>
              {modal.success ? (
                <Trophy size={45} strokeWidth={1.2} />
              ) : (
                <Shield size={45} strokeWidth={1.2} />
              )}
            </div>
            <h3>
              {modal.success
                ? "A story worth telling by the fire."
                : "Not a victory. Still an adventure."}
            </h3>
            <p>
              {modal.success
                ? "Your company has returned, their packs full and their spirits high."
                : "Your heroes returned safely with 60% of the treasure and all of the experience. They’ll be stronger next time."}
            </p>
            <div className="result-rewards">
              <Rewards rewards={modal.rewards} />
            </div>
            <Badge tone="green">
              +{modal.xp} experience for every party member
            </Badge>
            <div className="active-party">
              {modal.heroes.map((id) => (
                <div key={id}>
                  <HeroArt hero={getHero(id)} />
                  <strong>{getHero(id).short}</strong>
                </div>
              ))}
            </div>
            <button className="button primary full-width" onClick={closeModal}>
              Welcome home
              <Heart size={15} />
            </button>
          </div>
        </Modal>
      )}
      {modal?.type === "summonResult" && (
        <Modal
          title="Someone answered your call."
          subtitle="A new chapter for your company."
          onClose={closeModal}
          wide={summonResults.length > 1}
        >
          <div className="summon-reveal">
            <div
              className={`summon-results ${summonResults.length > 1 ? "multiple" : ""}`}
            >
              {summonResults.map((result, i) => {
                const def = getHero(result.id);
                return (
                  <div
                    key={`${def.id}-${i}`}
                    className="summoned-hero"
                    style={{
                      "--rarity": RARITY_COLORS[def.rarity],
                      animationDelay: `${i * 0.12}s`,
                    }}
                  >
                    <div>
                      <HeroArt hero={def} />
                      <span className="hero-rarity">{def.rarity}</span>
                    </div>
                    <h3>{def.name}</h3>
                    <p>
                      {def.role} · {def.affinity}
                    </p>
                    <Badge tone={result.duplicate ? "gold" : "green"}>
                      {result.duplicate ? "+1 soul shard" : "New companion"}
                    </Badge>
                  </div>
                );
              })}
            </div>
            <p>
              {summonResults.some((r) => r.duplicate)
                ? "Old friends make us stronger. Duplicate heroes grant a soul shard toward ascension."
                : "A thousand roads ahead. A new friend to walk them with."}
            </p>
            <button className="button primary" onClick={closeModal}>
              Let the story continue
              <ArrowRight size={15} />
            </button>
          </div>
        </Modal>
      )}
      {modal?.type === "resource" &&
        (() => {
          const r = modal.resource,
            b = BUILDINGS.find((b) => b.resource === r),
            rate = production(state, b.id);
          return (
            <Modal
              title={RESOURCE_NAMES[r]}
              subtitle="A little more possibility, every hour."
              onClose={closeModal}
            >
              <div className="modal-content">
                <div className={`resource-detail-icon ${r}`}>
                  {React.createElement(ICONS[r], {
                    size: 40,
                    strokeWidth: 1.3,
                  })}
                </div>
                <p className="detail-description">
                  {
                    {
                      gold: "Gold funds construction and hero training. Earn it in the Gold Mine, on expeditions, and through daily rewards.",
                      wood: "Timber shapes the walls, roofs, and future of your stronghold. The Lumber Mill and forest expeditions keep you supplied.",
                      stone:
                        "Stone builds a foundation that lasts. Gather it in the Stone Quarry and the mountains beyond your gates.",
                      aether:
                        "Aether calls heroes through the summoning gate. Earn it on missions, through daily gifts, or from an Aether Spire, available at Keep level 2. No purchases, ever.",
                    }[r]
                  }
                </p>
                <div className="detail-stats">
                  <div>
                    <span>In your treasury</span>
                    <strong>{fmt(state.resources[r])}</strong>
                  </div>
                  <div>
                    <span>Hourly production</span>
                    <strong>{rate}</strong>
                  </div>
                  <div>
                    <span>Ready to collect</span>
                    <strong>{fmt(state.buildings[b.id].stock)}</strong>
                  </div>
                </div>
                <button
                  className="button primary full-width"
                  onClick={() => {
                    closeModal();
                    go(r === "aether" ? "summoning" : "stronghold");
                  }}
                >
                  {r === "aether"
                    ? "Visit the summoning gate"
                    : "Visit your stronghold"}
                  <ArrowRight size={16} />
                </button>
              </div>
            </Modal>
          );
        })()}
      {modal?.type === "welcome" && (
        <Modal
          title="Welcome home, commander."
          subtitle="The world kept turning while you were away."
          onClose={closeModal}
        >
          <div className="welcome-art">
            <WorldArt />
          </div>
          <div className="modal-content">
            <p className="detail-description">
              You’ve been away for {duration(modal.elapsed)}. Your stronghold
              has been quietly working, storing up to {capacityHours(state)}{" "}
              hours of resources.
            </p>
            <div className="offline-rewards">
              {RESOURCES.map((r) => {
                const b = BUILDINGS.find((b) => b.resource === r);
                return (
                  <div key={r}>
                    <Resource type={r} amount={state.buildings[b.id].stock} />
                    <span>in storage</span>
                  </div>
                );
              })}
            </div>
            {ready > 0 && (
              <div className="info-strip">
                <Compass size={18} />
                <span>
                  {ready} expedition{ready > 1 ? "s have" : " has"} returned.
                  Your heroes are ready to tell their stories.
                </span>
              </div>
            )}
            <button
              className="button primary full-width"
              onClick={() => {
                if (stored > 0) run({ type: "collect" });
                closeModal();
              }}
            >
              Collect & settle in
              <PackageOpen size={16} />
            </button>
          </div>
        </Modal>
      )}
      {modal?.type === "settings" && (
        <Modal
          title="Your little corner of the world"
          subtitle="Make yourself at home. Keep your story safe."
          onClose={closeModal}
        >
          <div className="modal-content settings-content">
            <label className="input-label" htmlFor="realm-name">
              STRONGHOLD NAME
            </label>
            <form
              className="rename-form"
              onSubmit={(e) => {
                e.preventDefault();
                run({ type: "rename", name: rename });
              }}
            >
              <input
                id="realm-name"
                maxLength={24}
                value={rename}
                onChange={(e) => setRename(e.target.value)}
              />
              <button className="button secondary" type="submit">
                Save
              </button>
            </form>
            <div className="save-status">
              <span className={`save-dot ${!saved ? "error" : ""}`} />
              <strong>
                {saved
                  ? "Your progress is saved on this device."
                  : "Browser storage is unavailable. Export a backup now."}
              </strong>
            </div>
            <p>
              Your save is local to this browser. Back up your adventure before
              changing devices or clearing browser data.
            </p>
            <div className="settings-buttons">
              <button className="button secondary" onClick={exportSave}>
                <Download size={16} />
                Export save
              </button>
              <button
                className="button secondary"
                onClick={() => importRef.current?.click()}
              >
                <Upload size={16} />
                Import save
              </button>
            </div>
            <div className="settings-note">
              <Shield size={18} />
              <p>
                No accounts. No trackers. No cloud connection required.
                <br />
                Your realm stays yours.
              </p>
            </div>
            <div className="settings-source">
              <span>Emberfall v1.0 · MIT License</span>
              <a
                href="https://github.com/arenaaiprojects/HeroMissions"
                target="_blank"
                rel="noreferrer"
              >
                View source
                <ExternalLink size={13} />
              </a>
            </div>
            <button
              className="danger-link"
              onClick={() => {
                setResetText("");
                setModal({ type: "reset" });
              }}
            >
              <RotateCcw size={14} />
              Begin a new story…
            </button>
          </div>
        </Modal>
      )}
      {modal?.type === "import" && (
        <Modal
          title="Continue a different adventure?"
          subtitle="Importing replaces the progress on this device."
          onClose={closeModal}
        >
          <div className="modal-content">
            <div className="info-strip">
              <Castle size={22} />
              <span>
                <strong>{modal.state.name}</strong>
                <br />
                Keep level {level(modal.state, "keep")} ·{" "}
                {modal.state.heroes.length} heroes · {modal.state.totalMissions}{" "}
                expeditions complete
              </span>
            </div>
            <p className="detail-description">
              Export your current save first if you’d like to keep both stories.
            </p>
            <div className="settings-buttons">
              <button className="button secondary" onClick={exportSave}>
                <Download size={15} />
                Back up current save
              </button>
              <button
                className="button primary"
                onClick={() => {
                  const next = advance(modal.state);
                  next.revision = (latestSave().revision || 0) + 1;
                  stateRef.current = next;
                  setState(next);
                  save(next);
                  closeModal();
                  go("overview");
                  notify("Your adventure has found a new home.");
                }}
              >
                <Upload size={15} />
                Import this adventure
              </button>
            </div>
          </div>
        </Modal>
      )}
      {modal?.type === "reset" && (
        <Modal
          title="Every ending is a beginning."
          subtitle="This permanently resets your local progress."
          onClose={closeModal}
        >
          <div className="modal-content">
            <p className="detail-description">
              Your heroes, buildings, and resources will be replaced by a new
              adventure. There’s no undo, so export your save first.
            </p>
            <button
              className="button secondary full-width"
              onClick={exportSave}
            >
              <Download size={15} />
              Export my current story
            </button>
            <label className="input-label reset-label" htmlFor="reset-text">
              TYPE EMBERFALL TO START OVER
            </label>
            <input
              id="reset-text"
              value={resetText}
              onChange={(e) => setResetText(e.target.value)}
              placeholder="EMBERFALL"
            />
            <button
              className="button danger full-width"
              disabled={resetText !== "EMBERFALL"}
              onClick={() => {
                const next = freshState();
                next.revision = (latestSave().revision || 0) + 1;
                stateRef.current = next;
                setState(next);
                save(next);
                setParty([]);
                setSummonResults(null);
                closeModal();
                go("overview");
                notify("A new spark. A new beginning.");
              }}
            >
              Begin a new story
              <RotateCcw size={15} />
            </button>
          </div>
        </Modal>
      )}
      <input
        type="file"
        ref={importRef}
        accept="application/json,.json"
        hidden
        onChange={importSave}
      />
      {toast && (
        <div
          className={`toast ${toast.error ? "error" : ""}`}
          role={toast.error ? "alert" : "status"}
          key={toast.id}
        >
          {toast.error ? <CircleHelp size={20} /> : <CheckCircle2 size={20} />}
          <span>{toast.message}</span>
          <button
            onClick={() => setToast(null)}
            aria-label="Dismiss notification"
          >
            <X size={16} />
          </button>
        </div>
      )}
    </div>
  );
}

createRoot(document.getElementById("root")).render(<App />);

// The production build can reopen offline after its first successful visit.
if (import.meta.env.PROD && "serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register(`${import.meta.env.BASE_URL}sw.js`)
      .catch(() => {
        // Private browsing can disallow service workers; local game progress still works.
      });
  });
}
