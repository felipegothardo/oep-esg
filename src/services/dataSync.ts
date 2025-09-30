import { supabase } from "@/integrations/supabase/client";
import { RecyclingEntry, ConsumptionEntry, ConsumptionGoal } from "@/hooks/useSchoolData";

export class DataSyncService {
  private userId: string | null = null;
  private schoolId: string | null = null;

  async initialize() {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      this.userId = session.user.id;
      
      // Get user's school
      const { data: profile } = await supabase
        .from("profiles")
        .select("school_id")
        .eq("user_id", session.user.id)
        .single();
      
      if (profile) {
        this.schoolId = profile.school_id;
      }
    }
  }

  async saveRecyclingEntry(entry: Omit<RecyclingEntry, "id">) {
    if (!this.schoolId || !this.userId) {
      throw new Error("User not authenticated or school not set");
    }

    const { data, error } = await supabase
      .from("recycling_entries")
      .insert({
        school_id: this.schoolId,
        user_id: this.userId,
        material: entry.material,
        quantity: entry.quantity,
        co2_saved: entry.co2Saved,
        entry_date: entry.date
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getRecyclingEntries(): Promise<RecyclingEntry[]> {
    if (!this.schoolId) {
      throw new Error("School not set");
    }

    const { data, error } = await supabase
      .from("recycling_entries")
      .select("*")
      .eq("school_id", this.schoolId)
      .order("entry_date", { ascending: false });

    if (error) throw error;

    return data.map(item => ({
      id: item.id,
      material: item.material,
      quantity: Number(item.quantity),
      co2Saved: Number(item.co2_saved),
      date: item.entry_date
    }));
  }

  async saveConsumptionEntry(entry: Omit<ConsumptionEntry, "id">) {
    if (!this.schoolId || !this.userId) {
      throw new Error("User not authenticated or school not set");
    }

    const { data, error } = await supabase
      .from("consumption_entries")
      .insert({
        school_id: this.schoolId,
        user_id: this.userId,
        type: entry.type,
        month: entry.month,
        cost: entry.cost,
        consumption: entry.consumption,
        entry_date: entry.date
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getConsumptionEntries(): Promise<ConsumptionEntry[]> {
    if (!this.schoolId) {
      throw new Error("School not set");
    }

    const { data, error } = await supabase
      .from("consumption_entries")
      .select("*")
      .eq("school_id", this.schoolId)
      .order("month", { ascending: false });

    if (error) throw error;

    return data.map(item => ({
      id: item.id,
      type: item.type as "water" | "energy",
      month: item.month,
      cost: Number(item.cost),
      consumption: Number(item.consumption),
      date: item.entry_date
    }));
  }

  async saveConsumptionGoal(goal: ConsumptionGoal) {
    if (!this.schoolId) {
      throw new Error("School not set");
    }

    const { error } = await supabase
      .from("consumption_goals")
      .upsert({
        school_id: this.schoolId,
        type: goal.type,
        reduction_percentage: goal.reductionPercentage
      }, {
        onConflict: "school_id,type"
      });

    if (error) throw error;
  }

  async getConsumptionGoals(): Promise<ConsumptionGoal[]> {
    if (!this.schoolId) {
      throw new Error("School not set");
    }

    const { data, error } = await supabase
      .from("consumption_goals")
      .select("*")
      .eq("school_id", this.schoolId);

    if (error) throw error;

    return data.map(item => ({
      type: item.type as "water" | "energy",
      reductionPercentage: Number(item.reduction_percentage)
    }));
  }

  async deleteRecyclingEntry(id: string) {
    const { error } = await supabase
      .from("recycling_entries")
      .delete()
      .eq("id", id);

    if (error) throw error;
  }

  async deleteConsumptionEntry(id: string) {
    const { error } = await supabase
      .from("consumption_entries")
      .delete()
      .eq("id", id);

    if (error) throw error;
  }

  async deleteAllRecyclingEntries() {
    if (!this.schoolId) {
      throw new Error("School not set");
    }

    const { error } = await supabase
      .from("recycling_entries")
      .delete()
      .eq("school_id", this.schoolId);

    if (error) throw error;
  }

  async deleteAllConsumptionEntries() {
    if (!this.schoolId) {
      throw new Error("School not set");
    }

    const { error } = await supabase
      .from("consumption_entries")
      .delete()
      .eq("school_id", this.schoolId);

    if (error) throw error;
  }

  async deleteRecyclingByMonth(month: string) {
    if (!this.schoolId) {
      throw new Error("School not set");
    }

    const { error } = await supabase
      .from("recycling_entries")
      .delete()
      .eq("school_id", this.schoolId)
      .like("entry_date", `${month}%`);

    if (error) throw error;
  }

  async deleteConsumptionByTypeAndMonth(type: string, month: string) {
    if (!this.schoolId) {
      throw new Error("School not set");
    }

    const { error } = await supabase
      .from("consumption_entries")
      .delete()
      .eq("school_id", this.schoolId)
      .eq("type", type)
      .eq("month", month);

    if (error) throw error;
  }

  // Método para migrar dados locais para o banco
  async migrateLocalData(localData: {
    recyclingEntries: RecyclingEntry[];
    consumptionEntries: ConsumptionEntry[];
    consumptionGoals: ConsumptionGoal[];
  }) {
    if (!this.schoolId || !this.userId) {
      throw new Error("User not authenticated or school not set");
    }

    // Migrar entradas de reciclagem
    for (const entry of localData.recyclingEntries) {
      try {
        await this.saveRecyclingEntry(entry);
      } catch (error) {
        console.error("Error migrating recycling entry:", error);
      }
    }

    // Migrar entradas de consumo
    for (const entry of localData.consumptionEntries) {
      try {
        await this.saveConsumptionEntry(entry);
      } catch (error) {
        console.error("Error migrating consumption entry:", error);
      }
    }

    // Migrar metas
    for (const goal of localData.consumptionGoals) {
      try {
        await this.saveConsumptionGoal(goal);
      } catch (error) {
        console.error("Error migrating goal:", error);
      }
    }
  }
}