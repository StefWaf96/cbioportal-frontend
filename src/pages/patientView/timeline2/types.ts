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

enum TickInterval {
    MONTH = 30,
    YEAR = 365,
    WEEK = 7,
}

export interface EventPosition {
    left: string;
    width: string;
}

export enum TickIntervalEnum {
    MONTH = 30,
    YEAR = 365,
    DAY = 1,
}
