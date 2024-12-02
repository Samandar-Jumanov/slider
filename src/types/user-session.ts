export enum BotState {
    IDLE = 'idle',
    WAITING_PRESENTATION_TOPIC = 'waiting_presentation_topic',
    WAITING_SLIDE_COUNT = 'waiting_slide_count'
}

export interface UserSession {
    userId: number;
    currentState: BotState;
    presentationTopic?: string;
    slideCount?: number;
    createdAt: Date;
}