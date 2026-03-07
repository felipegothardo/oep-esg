import { ConsumptionEntry, ConsumptionGoal, RecyclingEntry } from "@/hooks/useSchoolData";
import {
  consumptionEntrySchema,
  consumptionGoalSchema,
  recyclingEntrySchema,
  sanitizeNumber,
  sanitizeString,
  validateData,
} from "@/lib/validations";
import {
  localDeleteAllConsumptionBySchool,
  localDeleteAllRecyclingBySchool,
  localDeleteConsumptionByTypeAndMonth,
  localDeleteRecyclingByMonth,
  localGetConsumptionRowsBySchool,
  localGetCurrentUser,
  localGetEffectiveSchoolId,
  localGetGoalsBySchool,
  localGetRecyclingRowsBySchool,
  localInsertConsumptionRow,
  localInsertRecyclingRow,
  localUpsertGoal,
} from "@/services/localDb";

export class LocalDataSyncService {
  private userId: string | null = null;
  private schoolId: string | null = null;

  async initialize() {
    const user = localGetCurrentUser();
    if (!user) throw new Error("No active local session");
    this.userId = user.id;
    this.schoolId = localGetEffectiveSchoolId(user);
    if (!this.schoolId) throw new Error("No school available");
  }

  async saveRecyclingEntry(entry: Omit<RecyclingEntry, "id">) {
    if (!this.schoolId || !this.userId) {
      throw new Error("User not authenticated or school not set");
    }

    const validation = validateData(recyclingEntrySchema, entry);
    if (!validation.success) throw new Error(`Validation error: ${validation.error}`);
    const validated = validation.data;

    localInsertRecyclingRow({
      school_id: this.schoolId,
      user_id: this.userId,
      entry: {
        material: sanitizeString(validated.material!),
        quantity: sanitizeNumber(validated.quantity!, 100000),
        co2Saved: sanitizeNumber(validated.co2Saved!, 1000000),
        date: validated.date!,
      },
    });

    return { ok: true };
  }

  async getRecyclingEntries(): Promise<RecyclingEntry[]> {
    if (!this.schoolId) return [];
    return localGetRecyclingRowsBySchool(this.schoolId);
  }

  async saveConsumptionEntry(entry: Omit<ConsumptionEntry, "id">) {
    if (!this.schoolId || !this.userId) {
      throw new Error("User not authenticated or school not set");
    }

    const validation = validateData(consumptionEntrySchema, entry);
    if (!validation.success) throw new Error(`Validation error: ${validation.error}`);
    const validated = validation.data;

    localInsertConsumptionRow({
      school_id: this.schoolId,
      user_id: this.userId,
      entry: {
        type: validated.type!,
        month: sanitizeString(validated.month!),
        cost: sanitizeNumber(validated.cost!, 1000000),
        consumption: sanitizeNumber(validated.consumption!, 10000000),
        date: validated.date!,
      },
    });

    return { ok: true };
  }

  async getConsumptionEntries(): Promise<ConsumptionEntry[]> {
    if (!this.schoolId) return [];
    return localGetConsumptionRowsBySchool(this.schoolId);
  }

  async saveConsumptionGoal(goal: ConsumptionGoal) {
    if (!this.schoolId) throw new Error("School not set");

    const validation = validateData(consumptionGoalSchema, goal);
    if (!validation.success) throw new Error(`Validation error: ${validation.error}`);
    const validated = validation.data;

    localUpsertGoal({
      school_id: this.schoolId,
      goal: {
        type: validated.type!,
        reductionPercentage: sanitizeNumber(validated.reductionPercentage!, 100),
      },
    });
  }

  async getConsumptionGoals(): Promise<ConsumptionGoal[]> {
    if (!this.schoolId) return [];
    return localGetGoalsBySchool(this.schoolId);
  }

  async deleteAllRecyclingEntries() {
    if (!this.schoolId) throw new Error("School not set");
    localDeleteAllRecyclingBySchool(this.schoolId);
  }

  async deleteAllConsumptionEntries() {
    if (!this.schoolId) throw new Error("School not set");
    localDeleteAllConsumptionBySchool(this.schoolId);
  }

  async deleteRecyclingByMonth(month: string) {
    if (!this.schoolId) throw new Error("School not set");
    localDeleteRecyclingByMonth(this.schoolId, month);
  }

  async deleteConsumptionByTypeAndMonth(type: string, month: string) {
    if (!this.schoolId) throw new Error("School not set");
    localDeleteConsumptionByTypeAndMonth(this.schoolId, type, month);
  }

  async migrateLocalData(localData: {
    recyclingEntries: RecyclingEntry[];
    consumptionEntries: ConsumptionEntry[];
    consumptionGoals: ConsumptionGoal[];
  }) {
    for (const entry of localData.recyclingEntries) {
      await this.saveRecyclingEntry(entry);
    }
    for (const entry of localData.consumptionEntries) {
      await this.saveConsumptionEntry(entry);
    }
    for (const goal of localData.consumptionGoals) {
      await this.saveConsumptionGoal(goal);
    }
  }
}

