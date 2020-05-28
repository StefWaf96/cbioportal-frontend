import { TickIntervalEnum, TimelineTick } from './types';
import React from 'react';
import { TimelineStore } from './TimelineStore';
import { observer } from 'mobx-react';

interface ITickRowProps {
    store: TimelineStore;
}

const TickRow: React.FunctionComponent<ITickRowProps> = observer(function({
    store,
}) {
    console.log('render tickrow');

    return (
        <div className={'tl-ticks'}>
            {store.ticks.map((tick: TimelineTick) => {
                let content: JSX.Element | null = null;

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

                    let majorLabel: string = '';

                    if (count < 0) {
                        majorLabel = `${count}${unit}`;
                    }

                    if (count === 0) {
                        majorLabel = '0';
                    }

                    if (count > 0) {
                        majorLabel = `${count}${unit}`;
                    }

                    content = (
                        <>
                            {majorLabel}
                            <div className={'tl-tickline'}></div>
                        </>
                    );

                    if (store.tickPixelWidth > 150) {
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

                            let minorLabel = '';

                            if (store.tickPixelWidth > 500) {
                                let minorCount = i;
                                if (count < 0) {
                                    minorCount = 12 - i;
                                }
                                minorLabel =
                                    count === 0
                                        ? `${minorCount}m`
                                        : `${majorLabel} ${minorCount}m`;
                            }

                            minorTicks.push(
                                <div
                                    className={'tl-timeline-minortick'}
                                    style={minorStyle}
                                >
                                    {minorLabel}
                                    <div className={'tl-tickline'}></div>
                                </div>
                            );
                        }
                    }
                }

                return (
                    <>
                        <div
                            className={tick.isTrim ? 'tl-timeline-trim' : ''}
                            style={style}
                        >
                            {content}
                        </div>
                        {minorTicks}
                    </>
                );
            })}
        </div>
    );
});

export default TickRow;
