
export interface ResearchSource {
    id: string;
    title: string;
    author: string;
    url?: string;
    type: 'academic' | 'book' | 'journal' | 'website';
    credibilityScore: number;
}

export interface PresentationMetadata {
    id: string;
    title: string;
    author: string;
    createdAt: Date;
    lastUpdated: Date;
    status: 'draft' | 'in_review' | 'approved' | 'completed';
}

export interface QualityCheckResult {
    passed: boolean;
    issues: string[];
    score: number;
}

export interface ContentDevelopmentProgress {
    totalSteps: number;
    completedSteps: number;
    progress: number;
}

export interface SubmissionResult {
    metadata: PresentationMetadata;
    sources: ResearchSource[];
    qualityScore: number;
}