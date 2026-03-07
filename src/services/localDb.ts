import { ConsumptionEntry, ConsumptionGoal, RecyclingEntry } from "@/hooks/useSchoolData";

export type LocalUserRole = "coordinator" | "teacher" | "student";

export interface LocalSchool {
  id: string;
  name: string;
  code: string;
  city?: string;
}

export interface LocalUser {
  id: string;
  email: string;
  password: string;
  full_name: string;
  school_id: string | null;
  role: LocalUserRole;
  created_at: string;
}

interface LocalRecyclingRow {
  id: string;
  school_id: string;
  user_id: string;
  material: string;
  quantity: number;
  co2_saved: number;
  entry_date: string;
}

interface LocalConsumptionRow {
  id: string;
  school_id: string;
  user_id: string;
  type: "water" | "energy";
  month: string;
  cost: number;
  consumption: number;
  entry_date: string;
}

interface LocalGoalRow {
  school_id: string;
  type: "water" | "energy";
  reduction_percentage: number;
}

interface LocalDb {
  schools: LocalSchool[];
  users: LocalUser[];
  recycling_entries: LocalRecyclingRow[];
  consumption_entries: LocalConsumptionRow[];
  consumption_goals: LocalGoalRow[];
}

interface LocalSession {
  user_id: string;
}

const DB_KEY = "oep-local-db-v1";
const SESSION_KEY = "oep-local-session-v1";

const now = () => new Date().toISOString();
const id = () => crypto.randomUUID();

const CANONICAL_SCHOOLS: Array<Pick<LocalSchool, "code" | "name" | "city">> = [
  { code: "elvira", name: "Escola Elvira Brandão", city: "Campo Grande" },
  { code: "oswald", name: "Escola Oswald Cruz", city: "Campo Grande" },
  { code: "piaget", name: "Escola Piaget", city: "Campo Grande" },
  { code: "santo-antonio", name: "Escola Santo Antonio", city: "Campo Grande" },
];

function normalizeDb(db: LocalDb): LocalDb {
  const existingByCode = new Map(db.schools.map((s) => [s.code, s]));

  for (const canonical of CANONICAL_SCHOOLS) {
    const existing = existingByCode.get(canonical.code);
    if (existing) {
      existing.name = canonical.name;
      existing.city = canonical.city;
    } else {
      db.schools.push({
        id: id(),
        code: canonical.code,
        name: canonical.name,
        city: canonical.city,
      });
    }
  }

  return db;
}

function seedDb(): LocalDb {
  const schools: LocalSchool[] = CANONICAL_SCHOOLS.map((school) => ({
    id: id(),
    name: school.name,
    code: school.code,
    city: school.city,
  }));

  const users: LocalUser[] = [
    {
      id: id(),
      email: "coordenador@oep.local",
      password: "123456",
      full_name: "Coordenador OEP",
      school_id: null,
      role: "coordinator",
      created_at: now(),
    },
    ...schools.map((school) => ({
      id: id(),
      email: `${school.code}@oep.local`,
      password: "123456",
      full_name: `Usuario ${school.name}`,
      school_id: school.id,
      role: "teacher" as const,
      created_at: now(),
    })),
  ];

  const recycling_entries: LocalRecyclingRow[] = [];
  const consumption_entries: LocalConsumptionRow[] = [];
  const consumption_goals: LocalGoalRow[] = [];

  schools.forEach((school) => {
    const schoolUser = users.find((u) => u.school_id === school.id);
    if (!schoolUser) return;

    recycling_entries.push(
      {
        id: id(),
        school_id: school.id,
        user_id: schoolUser.id,
        material: "Papel",
        quantity: 18,
        co2_saved: 22,
        entry_date: "2026-02-12",
      },
      {
        id: id(),
        school_id: school.id,
        user_id: schoolUser.id,
        material: "Plastico",
        quantity: 11,
        co2_saved: 17,
        entry_date: "2026-02-20",
      }
    );

    consumption_entries.push(
      {
        id: id(),
        school_id: school.id,
        user_id: schoolUser.id,
        type: "water",
        month: "02/2026",
        cost: 860,
        consumption: 12400,
        entry_date: "2026-02-28",
      },
      {
        id: id(),
        school_id: school.id,
        user_id: schoolUser.id,
        type: "energy",
        month: "02/2026",
        cost: 1430,
        consumption: 2980,
        entry_date: "2026-02-28",
      }
    );

    consumption_goals.push(
      { school_id: school.id, type: "water", reduction_percentage: 10 },
      { school_id: school.id, type: "energy", reduction_percentage: 8 }
    );
  });

  return {
    schools,
    users,
    recycling_entries,
    consumption_entries,
    consumption_goals,
  };
}

function saveDb(db: LocalDb) {
  localStorage.setItem(DB_KEY, JSON.stringify(db));
}

export function getLocalDb(): LocalDb {
  const raw = localStorage.getItem(DB_KEY);
  if (!raw) {
    const seeded = normalizeDb(seedDb());
    saveDb(seeded);
    return seeded;
  }

  try {
    const parsed = JSON.parse(raw) as LocalDb;
    if (!parsed?.schools || !parsed?.users) {
      const seeded = normalizeDb(seedDb());
      saveDb(seeded);
      return seeded;
    }
    const normalized = normalizeDb(parsed);
    saveDb(normalized);
    return normalized;
  } catch {
    const seeded = normalizeDb(seedDb());
    saveDb(seeded);
    return seeded;
  }
}

export function resetLocalDb() {
  const seeded = normalizeDb(seedDb());
  saveDb(seeded);
  localStorage.removeItem(SESSION_KEY);
}

export function getLocalSession(): LocalSession | null {
  const raw = localStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as LocalSession;
  } catch {
    return null;
  }
}

function setLocalSession(session: LocalSession) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function localSignOut() {
  localStorage.removeItem(SESSION_KEY);
}

export function localSignIn(email: string, password: string): { ok: true } | { ok: false; error: string } {
  const db = getLocalDb();
  const user = db.users.find(
    (u) => u.email.toLowerCase() === email.trim().toLowerCase() && u.password === password
  );

  if (!user) {
    return { ok: false, error: "Email ou senha incorretos." };
  }

  setLocalSession({ user_id: user.id });
  return { ok: true };
}

export function localSignUp(input: {
  email: string;
  password: string;
  fullName: string;
  schoolId: string;
}): { ok: true } | { ok: false; error: string } {
  const db = getLocalDb();
  const exists = db.users.some((u) => u.email.toLowerCase() === input.email.trim().toLowerCase());
  if (exists) {
    return { ok: false, error: "Este email ja esta cadastrado." };
  }

  const schoolExists = db.schools.some((s) => s.id === input.schoolId);
  if (!schoolExists) {
    return { ok: false, error: "Unidade invalida." };
  }

  const user: LocalUser = {
    id: id(),
    email: input.email.trim().toLowerCase(),
    password: input.password,
    full_name: input.fullName.trim(),
    school_id: input.schoolId,
    role: "student",
    created_at: now(),
  };

  db.users.push(user);
  saveDb(db);
  setLocalSession({ user_id: user.id });
  return { ok: true };
}

export function localGetCurrentUser(): LocalUser | null {
  const session = getLocalSession();
  if (!session) return null;
  const db = getLocalDb();
  return db.users.find((u) => u.id === session.user_id) ?? null;
}

export function localGetSchoolById(schoolId: string | null) {
  if (!schoolId) return null;
  const db = getLocalDb();
  return db.schools.find((s) => s.id === schoolId) ?? null;
}

export function localListSchools(): LocalSchool[] {
  const db = getLocalDb();
  return [...db.schools].sort((a, b) => a.name.localeCompare(b.name));
}

export function localGetRole(userId: string): LocalUserRole {
  const db = getLocalDb();
  return db.users.find((u) => u.id === userId)?.role ?? "student";
}

export function localGetEffectiveSchoolId(user: LocalUser): string | null {
  if (user.school_id) return user.school_id;
  const schools = localListSchools();
  return schools[0]?.id ?? null;
}

export function localInsertRecyclingRow(input: {
  school_id: string;
  user_id: string;
  entry: Omit<RecyclingEntry, "id">;
}) {
  const db = getLocalDb();
  db.recycling_entries.push({
    id: id(),
    school_id: input.school_id,
    user_id: input.user_id,
    material: input.entry.material,
    quantity: input.entry.quantity,
    co2_saved: input.entry.co2Saved,
    entry_date: input.entry.date,
  });
  saveDb(db);
}

export function localInsertConsumptionRow(input: {
  school_id: string;
  user_id: string;
  entry: Omit<ConsumptionEntry, "id">;
}) {
  const db = getLocalDb();
  db.consumption_entries.push({
    id: id(),
    school_id: input.school_id,
    user_id: input.user_id,
    type: input.entry.type,
    month: input.entry.month,
    cost: input.entry.cost,
    consumption: input.entry.consumption,
    entry_date: input.entry.date,
  });
  saveDb(db);
}

export function localUpsertGoal(input: { school_id: string; goal: ConsumptionGoal }) {
  const db = getLocalDb();
  const idx = db.consumption_goals.findIndex(
    (g) => g.school_id === input.school_id && g.type === input.goal.type
  );

  if (idx >= 0) {
    db.consumption_goals[idx].reduction_percentage = input.goal.reductionPercentage;
  } else {
    db.consumption_goals.push({
      school_id: input.school_id,
      type: input.goal.type,
      reduction_percentage: input.goal.reductionPercentage,
    });
  }

  saveDb(db);
}

export function localGetRecyclingRowsBySchool(schoolId: string): RecyclingEntry[] {
  const db = getLocalDb();
  return db.recycling_entries
    .filter((r) => r.school_id === schoolId)
    .sort((a, b) => b.entry_date.localeCompare(a.entry_date))
    .map((r) => ({
      id: r.id,
      material: r.material,
      quantity: r.quantity,
      co2Saved: r.co2_saved,
      date: r.entry_date,
    }));
}

export function localGetConsumptionRowsBySchool(schoolId: string): ConsumptionEntry[] {
  const db = getLocalDb();
  return db.consumption_entries
    .filter((r) => r.school_id === schoolId)
    .sort((a, b) => b.month.localeCompare(a.month))
    .map((r) => ({
      id: r.id,
      type: r.type,
      month: r.month,
      cost: r.cost,
      consumption: r.consumption,
      date: r.entry_date,
    }));
}

export function localGetGoalsBySchool(schoolId: string): ConsumptionGoal[] {
  const db = getLocalDb();
  return db.consumption_goals
    .filter((g) => g.school_id === schoolId)
    .map((g) => ({
      type: g.type,
      reductionPercentage: g.reduction_percentage,
    }));
}

export function localDeleteAllRecyclingBySchool(schoolId: string) {
  const db = getLocalDb();
  db.recycling_entries = db.recycling_entries.filter((r) => r.school_id !== schoolId);
  saveDb(db);
}

export function localDeleteAllConsumptionBySchool(schoolId: string) {
  const db = getLocalDb();
  db.consumption_entries = db.consumption_entries.filter((r) => r.school_id !== schoolId);
  saveDb(db);
}

export function localDeleteRecyclingByMonth(schoolId: string, month: string) {
  const db = getLocalDb();
  db.recycling_entries = db.recycling_entries.filter(
    (r) => !(r.school_id === schoolId && r.entry_date.startsWith(month))
  );
  saveDb(db);
}

export function localDeleteConsumptionByTypeAndMonth(
  schoolId: string,
  type: string,
  month: string
) {
  const db = getLocalDb();
  db.consumption_entries = db.consumption_entries.filter(
    (r) => !(r.school_id === schoolId && r.type === type && r.month === month)
  );
  saveDb(db);
}
