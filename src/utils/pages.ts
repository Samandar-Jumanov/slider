interface PagesDetails {
    id: string;
    name: string;
    description: string;
    requirements: string[];
    completed: boolean;
  }
  
  export const pagesMap = new Map<string, PagesDetails[]>()
  
  export function updateStageCompletion(workType: string, stageId: string, completed: boolean): boolean {
    const stages = pagesMap.get(workType);
    if (stages) {
      const stage = stages.find(s => s.id === stageId);
      if (stage) {
        stage.completed = completed;
        return true;
      }
    }
    return false;
  }
  
  export function getCurrentStage(workType: string): PagesDetails | undefined {
    const stages = pagesMap.get(workType);
    return stages?.find(stage => !stage.completed);
  }
  
  // Convenience arrays for quick access
  export const slideStages: string[] = pagesMap.get('slides')?.map(stage => stage.id) || [];
  export const independentWorkStages: string[] = pagesMap.get('independentWork')?.map(stage => stage.id) || [];
  export const referatStages: string[] = pagesMap.get('referat')?.map(stage => stage.id) || [];