import { EventPosition, TickIntervalEnum, TimelineTrack } from './types';
import { computed, observable } from 'mobx';
import {
    getFullTicks,
    getPerc,
    getPointInTrimmedSpace,
    getTrimmedTicks,
} from './lib/tick_helpers';
import _ from 'lodash';
import $ from 'jquery';
import autobind from 'autobind-decorator';

export class TimelineStore {
    constructor(tracks: TimelineTrack[]) {
        this.data = tracks;
    }

    @computed get limit() {
        return this.lastTick.end;
    }

    @computed get tickInterval() {
        return Math.abs(this.firstTick.end - this.firstTick.start + 1);
    }

    @observable.ref zoomBounds: { start: number; end: number } | undefined;

    dragging:
        | { start: number | null; end: number | null }
        | undefined = undefined;

    @computed get viewPortWidth() {
        const width = $('.tl-timelineviewport').width()!;
        return width;
    }

    get timelineWidthInPixels() {
        const width = $('.tl-timeline').width()!;
        return width;
    }

    setZoomBounds(start?: number, end?: number) {
        if (start && end) {
            this.zoomBounds = { start, end };
            setTimeout(this.setScroll.bind(this), 10);
        } else {
            this.zoomBounds = undefined;
        }
    }

    @autobind
    getPosition(item: any, limit: number): EventPosition {
        const start = getPointInTrimmedSpace(item.start, this.ticks);
        const end = getPointInTrimmedSpace(item.end || item.start, this.ticks);

        // this shifts them over so that we start at zero instead of negative
        const normalizedStart = start + Math.abs(this.firstTick.start);
        const normalizedEnd = end + Math.abs(this.firstTick.start);

        let width =
            getPerc(normalizedEnd, this.absoluteWidth) -
            getPerc(normalizedStart, this.absoluteWidth) +
            '%';

        width =
            getPerc(normalizedEnd - normalizedStart, this.absoluteWidth) + '%';

        return {
            left: getPerc(normalizedStart, this.absoluteWidth) + '%',
            width: width,
        };
    }

    @computed get trimmedLimit() {
        return this.lastTick.end + Math.abs(this.firstTick.start);
    }

    @observable.ref data: TimelineTrack[];

    @computed get allItems() {
        function getItems(track: TimelineTrack) {
            if (track.tracks && track.tracks.length > 0) {
                return track.tracks.map(t => t.items);
            } else {
                return track.items;
            }
        }

        const events = _.flattenDeep(this.data.map(t => getItems(t)));

        return _.sortBy(events, e => e.start);
    }

    @computed get ticks() {
        // we need to figure out based on the actual time we need to dislay (not zoomed)
        // what our ticks should be
        // so first determine ticks with weeks
        // if we get too many ticks to fit nicely in the viewport
        // then go to years
        // if we get too few, meaning, it's only a few months, then go to a year

        // if we are zoomed, then get a bigger portal to play with, so calculation when zoomed
        // should be different

        let trimmedTicks;

        const fullTicks = getFullTicks(this.allItems, TickIntervalEnum.MONTH);

        trimmedTicks = getTrimmedTicks(fullTicks);

        const tickWidth = this.viewPortWidth / trimmedTicks.length;

        if (true || tickWidth < 100) {
            const fullTicks = getFullTicks(
                this.allItems,
                TickIntervalEnum.YEAR
            );
            trimmedTicks = getTrimmedTicks(fullTicks);
        }

        return trimmedTicks;
    }

    @computed get lastTick() {
        return this.ticks[this.ticks.length - 1];
    }

    @computed get firstTick() {
        return this.ticks[0];
    }

    @computed get absoluteWidth() {
        const start = this.firstTick.start + Math.abs(this.firstTick.start);
        const end =
            getPointInTrimmedSpace(this.lastTick.end, this.ticks) +
            Math.abs(this.firstTick.start);
        return end - start;
    }

    @computed get zoomedWidth() {
        if (this.zoomRange) {
            return this.zoomRange.end - this.zoomRange.start;
        } else {
            return undefined;
        }
    }

    @computed get tickPixelWidth() {
        // pixel width equals total pixel width / number of ticks (trims are zero width, so discard them)
        return (
            (this.viewPortWidth * this.zoomLevel) /
            this.ticks.filter(t => !t.isTrim).length
        );
    }

    @computed get zoomRange() {
        if (this.zoomBounds) {
            return {
                start: getPointInTrimmedSpace(
                    this.zoomBounds.start,
                    this.ticks
                ),
                end: getPointInTrimmedSpace(this.zoomBounds.end, this.ticks),
            };

            // return {
            //     start: this.zoomBounds.start,
            //     end: this.zoomBounds.end
            // }
        } else {
            return undefined;
        }
    }

    @computed get zoomLevel() {
        return !this.zoomedWidth ? 1 : this.absoluteWidth / this.zoomedWidth!;
    }

    @observable hoveredRowIndex: number | undefined;

    setScroll() {
        const trimmedPos = this.getPosition(
            { start: this.zoomBounds!.start, end: this.zoomBounds!.end },
            this.absoluteWidth
        );

        // @ts-ignore
        const perc =
            (parseFloat(trimmedPos.left) / 100) * $('#tl-timeline').width()!;

        //@ts-ignore
        document.getElementById('tl-timeline')!.parentNode!.scrollLeft = perc;
    }
}
