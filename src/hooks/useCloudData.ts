import { useState, useEffect } from "react";
import { DataSyncService } from "@/services/dataSync";
import { RecyclingEntry, ConsumptionEntry, ConsumptionGoal } from "./useSchoolData";
import { useToast } from "@/hooks/use-toast";

export function useCloudData() {
  const [dataSync] = useState(() => new DataSyncService());
  const [recyclingEntries, setRecyclingEntries] = useState<RecyclingEntry[]>([]);
  const [consumptionEntries, setConsumptionEntries] = useState<ConsumptionEntry[]>([]);
  const [consumptionGoals, setConsumptionGoals] = useState<ConsumptionGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    let isMounted = true;
    
    const initData = async () => {
      if (!isMounted) return;
      await loadData();
    };
    
    initData();
    
    return () => {
      isMounted = false;
    };
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      await dataSync.initialize();
      
      const [recycling, consumption, goals] = await Promise.all([
        dataSync.getRecyclingEntries(),
        dataSync.getConsumptionEntries(),
        dataSync.getConsumptionGoals()
      ]);

      setRecyclingEntries(recycling);
      setConsumptionEntries(consumption);
      setConsumptionGoals(goals);
    } catch (error) {
      console.error("Error loading data:", error);
      toast({
        title: "Erro ao carregar dados",
        description: "Não foi possível carregar os dados do servidor",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const addRecyclingEntry = async (entry: Omit<RecyclingEntry, "id">) => {
    try {
      const newEntry = await dataSync.saveRecyclingEntry(entry);
      await loadData(); // Reload all data
      return newEntry;
    } catch (error) {
      console.error("Error saving recycling entry:", error);
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar a entrada de reciclagem",
        variant: "destructive"
      });
      throw error;
    }
  };

  const addConsumptionEntry = async (entry: Omit<ConsumptionEntry, "id">) => {
    try {
      const newEntry = await dataSync.saveConsumptionEntry(entry);
      await loadData(); // Reload all data
      return newEntry;
    } catch (error) {
      console.error("Error saving consumption entry:", error);
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar a entrada de consumo",
        variant: "destructive"
      });
      throw error;
    }
  };

  const updateConsumptionGoal = async (goal: ConsumptionGoal) => {
    try {
      await dataSync.saveConsumptionGoal(goal);
      await loadData(); // Reload all data
    } catch (error) {
      console.error("Error saving goal:", error);
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar a meta",
        variant: "destructive"
      });
      throw error;
    }
  };

  const deleteAllRecords = async () => {
    try {
      await Promise.all([
        dataSync.deleteAllRecyclingEntries(),
        dataSync.deleteAllConsumptionEntries()
      ]);
      await loadData();
    } catch (error) {
      console.error("Error deleting records:", error);
      toast({
        title: "Erro ao deletar",
        description: "Não foi possível deletar os registros",
        variant: "destructive"
      });
      throw error;
    }
  };

  const deleteRecyclingByMonth = async (month: string) => {
    try {
      await dataSync.deleteRecyclingByMonth(month);
      await loadData();
    } catch (error) {
      console.error("Error deleting recycling by month:", error);
      toast({
        title: "Erro ao deletar",
        description: "Não foi possível deletar os registros do mês",
        variant: "destructive"
      });
      throw error;
    }
  };

  const deleteConsumptionByMonth = async (type: string, month: string) => {
    try {
      await dataSync.deleteConsumptionByTypeAndMonth(type, month);
      await loadData();
    } catch (error) {
      console.error("Error deleting consumption by month:", error);
      toast({
        title: "Erro ao deletar",
        description: "Não foi possível deletar os registros do mês",
        variant: "destructive"
      });
      throw error;
    }
  };

  return {
    recyclingEntries,
    consumptionEntries,
    consumptionGoals,
    loading,
    addRecyclingEntry,
    addConsumptionEntry,
    updateConsumptionGoal,
    deleteAllRecords,
    deleteRecyclingByMonth,
    deleteConsumptionByMonth,
    refresh: loadData
  };
}