import { useLocalStorage } from './useLocalStorage';

export interface RecyclingEntry {
  id: string;
  material: string;
  quantity: number;
  co2Saved: number;
  date: string;
}

export interface ConsumptionEntry {
  id: string;
  type: 'water' | 'energy';
  month: string;
  cost: number;
  consumption: number;
  date: string;
}

export interface ConsumptionGoal {
  type: 'water' | 'energy';
  reductionPercentage: number;
}

export interface SchoolData {
  recyclingEntries: RecyclingEntry[];
  consumptionEntries: ConsumptionEntry[];
  consumptionGoals: ConsumptionGoal[];
}

export type SchoolType = 'elvira' | 'oswald' | 'piaget' | 'santo-antonio' | 'consolidated';

export function useSchoolData() {
  const [elviraData, setElviraData] = useLocalStorage('oep-elvira-data', {
    recyclingEntries: [] as RecyclingEntry[],
    consumptionEntries: [] as ConsumptionEntry[],
    consumptionGoals: [] as ConsumptionGoal[]
  });
  
  const [oswaldData, setOswaldData] = useLocalStorage('oep-oswald-data', {
    recyclingEntries: [] as RecyclingEntry[],
    consumptionEntries: [] as ConsumptionEntry[],
    consumptionGoals: [] as ConsumptionGoal[]
  });
  
  const [piagetData, setPiagetData] = useLocalStorage('oep-piaget-data', {
    recyclingEntries: [] as RecyclingEntry[],
    consumptionEntries: [] as ConsumptionEntry[],
    consumptionGoals: [] as ConsumptionGoal[]
  });

  const [santoAntonioData, setSantoAntonioData] = useLocalStorage('oep-santo-antonio-data', {
    recyclingEntries: [] as RecyclingEntry[],
    consumptionEntries: [] as ConsumptionEntry[],
    consumptionGoals: [] as ConsumptionGoal[]
  });

  const [activeSchool, setActiveSchool] = useLocalStorage<SchoolType>('oep-active-tab', 'consolidated');

  const getSchoolData = (schoolType: SchoolType): SchoolData => {
    switch (schoolType) {
      case 'elvira': return elviraData;
      case 'oswald': return oswaldData;
      case 'piaget': return piagetData;
      case 'santo-antonio': return santoAntonioData;
      default: return elviraData;
    }
  };

  const updateSchoolData = (schoolType: SchoolType, data: SchoolData) => {
    switch (schoolType) {
      case 'elvira': setElviraData(data); break;
      case 'oswald': setOswaldData(data); break;
      case 'piaget': setPiagetData(data); break;
      case 'santo-antonio': setSantoAntonioData(data); break;
    }
  };

  return {
    elviraData,
    oswaldData,
    piagetData,
    santoAntonioData,
    activeSchool,
    setActiveSchool,
    getSchoolData,
    updateSchoolData
  };
}