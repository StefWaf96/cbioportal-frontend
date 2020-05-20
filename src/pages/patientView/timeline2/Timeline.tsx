import React, { useEffect, useState } from 'react';
import { Observer, observer } from 'mobx-react';
import { Range } from 'rc-slider';
import TimelineTracks from './TimelineTracks';
import { TimelineStore } from './TimelineStore';
import _ from 'lodash';
import $ from 'jquery';
import {
    getPointInTrimmedSpace,
    getPointInTrimmedSpaceFromScreenRead,
} from './lib/tick_helpers';

//const $: any = (window as any).$;

interface ITimelineProps {
    store: TimelineStore;
}

function handleMouseMove(e: any) {
    $('.tl-cursor').css('left', e.clientX - $('.tl-timeline').offset()!.left);
}

let dragging:
    | { start: number | null; end: number | null }
    | undefined = undefined;

function handleDrag(e: any, store: TimelineStore) {
    switch (e.type) {
        case 'mouseup':
            if (dragging) {
                const width = $('.tl-timeline').width()!;
                const percStart = dragging.start! / width;
                const percEnd = dragging.end! / width;
                const total = store.trimmedLimit;
                const startVal = percStart * total;
                const endVal = percEnd * total;

                const myStart = getPointInTrimmedSpaceFromScreenRead(
                    startVal,
                    store.ticks
                );

                const myEnd = getPointInTrimmedSpaceFromScreenRead(
                    endVal,
                    store.ticks
                );

                store.setZoomBounds(myStart, myEnd);

                dragging = undefined;

                $('.tl-zoom-selectbox').hide();
            }

            dragging = undefined;
            break;
        case 'mousedown':
            dragging = { start: null, end: null };
            break;

        case 'mousemove':
            if (dragging) {
                const pos = e.clientX - $('.tl-timeline').offset()!.left;
                e.preventDefault();
                if (dragging.start === null) {
                    dragging.start = pos;
                }
                dragging.end = pos;

                $('.tl-zoom-selectbox')
                    .show()
                    .css({
                        left:
                            dragging.start < dragging.end
                                ? dragging.start
                                : dragging.end,
                        width: Math.abs(dragging.end - dragging.start),
                    });
            }
            break;
    }
}

const Timeline: React.FunctionComponent<ITimelineProps> = function({ store }) {
    const [viewPortWidth, setViewPortWidth] = useState(0);

    // on mount, there will be no element to measure, so we need to do this on equivalent
    // of componentDidMount
    useEffect(() => {
        setTimeout(() => {
            setViewPortWidth(store.viewPortWidth);
        }, 1000);
    }, []);

    const [zoomBound, setZoomBound] = useState<string | null>(null);

    return (
        <Observer>
            {() => {
                const me = store.ticks;

                console.log(viewPortWidth);

                let myZoom = 1;
                if (store.zoomRange && store.zoomedWidth) {
                    myZoom = store.absoluteWidth / store.zoomedWidth;
                }

                return (
                    <div
                        className={'tl-timeline-wrapper'}
                        id={'timeline-wrapper'}
                    >
                        <div className={'tl-timeline-display'}>
                            <div className={'tl-timeline-leftbar'}>
                                <div className={'tl-timeline-tracklabels'}>
                                    {store.data.map(row => {
                                        return <div>{row.type}</div>;
                                    })}
                                </div>
                            </div>

                            <div
                                className={'tl-timelineviewport'}
                                onMouseDown={e => handleDrag(e, store)}
                                onMouseUp={e => handleDrag(e, store)}
                                onMouseMove={e => handleDrag(e, store)}
                            >
                                {viewPortWidth && viewPortWidth > 0 && (
                                    <TimelineTracks
                                        handleMouseMove={handleMouseMove}
                                        store={store}
                                        width={viewPortWidth * myZoom}
                                    />
                                )}
                            </div>
                        </div>
                    </div>
                );
            }}
        </Observer>
    );
};

export default Timeline;
