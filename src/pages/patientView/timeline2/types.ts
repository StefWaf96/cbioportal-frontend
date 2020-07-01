export interface TimelineEvent {
    start: number;
    end: number;
    event: any;
    render(item: TimelineEvent): JSX.Element | string;
}

export interface TimelineTrack {
    items: TimelineEvent[];
    type: string;
    tracks?: TimelineTrack[];
    render?: (e: TimelineEvent) => JSX.Element | string;
}

export interface TimelineTick {
    start: number;
    end: number;
    realEnd?: number;
    offset?: number;
    isTrim?: boolean;
    events?: TimelineEvent[];
}

export interface EventPosition {
    left: string;
    width: string;
}

export enum TickIntervalEnum {
    MONTH = 30.41666,
    YEAR = 365,
    DAY = 1,
}
