import { TickIntervalEnum, TimelineTick } from './types';
import { TimelineRow } from './TimelineRow';
import React from 'react';
import { TimelineStore } from './TimelineStore';

export interface ITimelineTracks {
    handleMouseMove: (e: any) => void;
    store: TimelineStore;
    width: number;
}

const TimelineTracks: React.FunctionComponent<ITimelineTracks> = function({
    store,
    width,
    handleMouseMove,
}) {
    return (
        <div
            className={'tl-timeline'}
            style={{ width: width }}
            onMouseMove={handleMouseMove}
            id={'timeline'}
        >
            <div className={'tl-cursor'}></div>
            <div className={'tl-zoom-selectbox'}></div>
            <div className={'tl-ticks'}>
                {store.ticks.map((tick: TimelineTick) => {
                    let content: JSX.Element | null = null;
                    //let style = { left: getPerc(getPointInTrimmedSpace(tick.start, store.ticks), store.trimmedLimit) + "%" }

                    const style = {
                        left: store.getPosition(tick, store.trimmedLimit).left,
                    };

                    const minorTicks: JSX.Element[] = [];

                    if (tick.isTrim === true) {
                        // @ts-ignore
                        content = (
                            <>
                                <i
                                    className="fa fa-scissors"
                                    aria-hidden="true"
                                ></i>
                                <div className={'tl-timeline-tickline'}></div>
                            </>
                        );
                    } else {
                        const count = tick.start / store.tickInterval;
                        const unit =
                            store.tickInterval === TickIntervalEnum.MONTH
                                ? 'm'
                                : 'y';
                        content = (
                            <>
                                {`${count}${unit}`}
                                <div className={'tl-tickline'}></div>
                            </>
                        );

                        // add minor ticks
                        const minorTickWidth =
                            Math.abs(
                                store.firstTick.end - store.firstTick.start
                            ) / 12; // or 30 if it's a month

                        // note we start at 1 so as to ignore first tick, which is a "parent" tick already
                        for (let i = 1; i < 12; i++) {
                            const minorStyle = {
                                left: store.getPosition(
                                    { start: tick.start + minorTickWidth * i },
                                    store.trimmedLimit
                                ).left,
                            };
                            minorTicks.push(
                                <div
                                    className={'tl-timeline-minortick'}
                                    style={minorStyle}
                                >
                                    <div className={'tl-tickline'}></div>
                                </div>
                            );
                        }
                    }

                    return (
                        <>
                            <div
                                className={
                                    tick.isTrim ? 'tl-timeline-trim' : ''
                                }
                                style={style}
                            >
                                {content}
                            </div>
                            {minorTicks}
                        </>
                    );
                })}
            </div>

            <div className={'tl-rowGroup'}>
                {store.data.map(row => {
                    return (
                        <TimelineRow
                            limit={store.trimmedLimit}
                            items={row.items}
                            getPosition={store.getPosition}
                        />
                    );
                })}
            </div>
        </div>
    );
};

export default TimelineTracks;
