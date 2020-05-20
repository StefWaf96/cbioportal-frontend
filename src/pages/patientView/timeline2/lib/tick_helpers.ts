import { TimelineEvent, TimelineTick } from '../types';
import { intersect } from './intersect';
import _ from 'lodash';

const TRIM_TICK_THRESHHOLD = 4;

const TICK_OFFSET = 30;

export function getTrimmedTicks(ticks: TimelineTick[]): TimelineTick[] {
    let tickCache: TimelineTick[] = [];
    let offset = 0;

    return ticks.reduce((aggr: TimelineTick[], tick) => {
        if (tick.events!.length === 0) {
            tick.offset = offset;
            tickCache.push(tick);
            // see if we are going to collapse a new trim region
        } else {
            if (tickCache.length >= TRIM_TICK_THRESHHOLD) {
                // we want to leave the first trimmed tick as a normal tick
                // because it serves as an end to last tick region
                // otherwise, it will appear as though points are inside the trimmed region

                aggr.push(tickCache[0]);

                const trimmedTicks = tickCache.slice(1, -1);

                aggr.push({
                    isTrim: true,
                    start: trimmedTicks[0].start,
                    end: trimmedTicks[0].end,
                    realEnd: trimmedTicks[trimmedTicks.length - 1].end,
                    offset: offset,
                } as TimelineTick);

                const lastTick = tickCache[tickCache.length - 1];

                //offset += (TICK_OFFSET);
                offset += trimmedTicks.length * (tick.end - tick.start + 1);

                lastTick.offset = offset;

                aggr.push(lastTick);

                tickCache = []; // start new cache;
            } else {
                // we don't have enough for trim so just put em in as regular ticks
                aggr.push(...tickCache);
            }

            aggr.push(tick);
            tickCache = []; // start new cache
        }
        tick.offset = offset;
        return aggr;
    }, []);
}

export function getFullTicks(events: TimelineEvent[], tickInterval: number) {
    const ticks = [];

    const lowerBound = Math.min(...events.map(e => e.start));

    const upperBound = Math.max(...events.map(e => e.end));

    const floor = Math.floor(lowerBound / tickInterval) * tickInterval;

    let place = floor;

    const ceiling = Math.ceil(upperBound / tickInterval) * tickInterval;

    let i = 0;

    do {
        const start = place;
        const end = place + tickInterval - 1;
        ticks.push({
            start,
            end,
            index: i,
            events: events.filter(e => {
                return intersect(e.start, e.end, start, end);
            }),
        });
        place += tickInterval;
        i++;
    } while (place < ceiling);

    return ticks;
}

export function getPerc(n: number, l: number) {
    return (n / l) * 100;
}

export function getPointInTrimmedSpace(x: number, regions: TimelineTick[]) {
    const region = _.find(regions, r => {
        return r.start <= x && (r.end >= x || r.realEnd! >= x);
    });

    if (region) {
        if (region.isTrim) {
            return region.start - (region.offset || 0);
        } else {
            return x - (region.offset || 0);
        }
    } else {
        throw `TIMELINE: FAILED TO FIND REGION CORESPONDING TO POINT ${x}`;
    }
}

export function getPointInTrimmedSpaceFromScreenRead(
    val: number,
    ticks: TimelineTick[]
) {
    let rem = val;
    let result = 0;
    _.forEach(ticks, tick => {
        if (!tick.isTrim) {
            if (rem >= tick.end - tick.start) {
                rem = rem - (tick.end - tick.start);
            } else {
                result = tick.start + rem;
                return false;
            }
        }
    });
    return result;
}
