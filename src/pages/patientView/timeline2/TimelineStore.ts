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

    get viewPortWidth() {
        // ;  const width = $(".tl-timelineviewport").width()!;
        //return width
        return 1300;
    }

    setZoomBounds(start: number, end: number) {
        this.zoomBounds = { start, end };
        setTimeout(this.setScroll.bind(this), 10);
    }

    @autobind
    getPosition(item: any, limit: number): EventPosition {
        const start = getPointInTrimmedSpace(item.start, this.ticks);
        const end = getPointInTrimmedSpace(item.end || item.start, this.ticks);

        //let width = ((end - start) / limit) * 100 + "%";

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
        return getPointInTrimmedSpace(this.limit, this.ticks);
    }

    @observable.ref data: TimelineTrack[];

    @computed get allItems() {
        const items = _.chain(this.data)
            .map(t => t.items)
            .flatten()
            .sortBy(item => item.start)
            .value();

        return items;
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

        console.log('fulltics', fullTicks);

        trimmedTicks = getTrimmedTicks(fullTicks);

        console.log('trimmedTicks', trimmedTicks);

        const tickWidth = this.viewPortWidth / trimmedTicks.length;

        console.log('tickWdith', tickWidth);

        if (tickWidth < 100) {
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
        return this.absoluteWidth / this.zoomedWidth!;
    }

    setScroll() {
        const trimmedPos = this.getPosition(
            { start: this.zoomBounds!.start, end: this.zoomBounds!.end },
            this.trimmedLimit
        );

        // @ts-ignore
        const perc =
            (parseFloat(trimmedPos.left) / 100) * $('#timeline').width();

        //@ts-ignore
        document.getElementById('timeline')!.parentNode!.scrollLeft = perc;
    }
}
