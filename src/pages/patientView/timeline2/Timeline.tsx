import React, { useEffect, useRef, useState } from 'react';
import { Observer, observer } from 'mobx-react-lite';
import TimelineTracks from './TimelineTracks';
import { TimelineStore } from './TimelineStore';
import _ from 'lodash';
import $ from 'jquery';
import { getPointInTrimmedSpaceFromScreenRead } from './lib/tick_helpers';
import intersect from './lib/intersect';
import TrackHeader from './TrackHeader';
import TickRow from './TickRow';

(window as any).$ = $;

interface ITimelineProps {
    store: TimelineStore;
}

const getFocusedPoints = _.debounce(function(
    point: number,
    store: TimelineStore
) {
    const p = getPointInTrimmedSpaceFromScreenRead(point, store.ticks);

    const focusedPoints = store.allItems.filter(event =>
        intersect(p - 5, p + 5, event.start - 5, event.end + 5)
    );

    return focusedPoints;
},
100);

function handleMouseEvents(e: any, store: TimelineStore, refs: any) {
    const $timeline = $(refs.timeline.current);
    const $zoomSelectBox = $(refs.zoomSelectBox.current);

    switch (e.type) {
        case 'mouseup':
            if (store.dragging) {
                const width = $timeline.width()!;
                const percStart = store.dragging.start! / width;
                const percEnd = store.dragging.end! / width;
                const startVal = percStart * store.absoluteWidth;
                const endVal = percEnd * store.absoluteWidth;
                const myStart = getPointInTrimmedSpaceFromScreenRead(
                    startVal,
                    store.ticks
                );
                const myEnd = getPointInTrimmedSpaceFromScreenRead(
                    endVal,
                    store.ticks
                );

                store.setZoomBounds(myStart, myEnd);

                store.dragging = undefined;

                $zoomSelectBox.hide();
            }

            store.dragging = undefined;
            break;
        case 'mousedown':
            store.dragging = { start: null, end: null };
            break;

        case 'mousemove':
            const pos = e.clientX - $timeline.offset()!.left;
            if (store.dragging) {
                e.preventDefault();
                if (store.dragging.start === null) {
                    store.dragging.start = pos;
                }
                store.dragging.end = pos;

                $zoomSelectBox.show().css({
                    left:
                        store.dragging.start < store.dragging.end
                            ? store.dragging.start
                            : store.dragging.end,
                    width: Math.abs(store.dragging.end - store.dragging.start),
                });
            } else {
                const point = (pos / $timeline.width()!) * store.absoluteWidth;

                getFocusedPoints(point, store);

                $(refs.cursor.current).css({
                    left: e.clientX - $timeline.offset()!.left,
                    display: 'block',
                });
            }
            break;
    }
}

const Timeline: React.FunctionComponent<ITimelineProps> = observer(function({
    store,
}) {
    const [viewPortWidth, setViewPortWidth] = useState<number | null>(null);

    const [zoomBound, setZoomBound] = useState<string | null>(null);

    console.log('rending timeline');

    const refs = {
        cursor: useRef(null),
        wrapper: useRef(null),
        timeline: useRef(null),
        zoomSelectBox: useRef(null),
    };

    // on mount, there will be no element to measure, so we need to do this on equivalent
    // of componentDidMount
    useEffect(() => {
        setTimeout(() => {
            setViewPortWidth(store.viewPortWidth);
        }, 10);
    }, []);

    let myZoom = 1;
    if (store.zoomRange && store.zoomedWidth) {
        myZoom = store.absoluteWidth / store.zoomedWidth;
    }

    return (
        <div ref={refs.wrapper} className={'tl-timeline-wrapper'}>
            {store.zoomBounds && (
                <div className={'tl-timeline-unzoom'}>
                    <button
                        className={'btn btn-xs'}
                        onClick={() => {
                            store.setZoomBounds();
                        }}
                    >
                        reset zoom
                    </button>
                </div>
            )}

            <div className={'tl-timeline-display'}>
                <div className={'tl-timeline-leftbar'}>
                    <div className={'tl-timeline-tracklabels'}>
                        {store.data.map((track, i) => {
                            return <TrackHeader track={track} />;
                        })}
                    </div>
                </div>

                <div className={'tl-timelineviewport'}>
                    {viewPortWidth && store.ticks && (
                        <div
                            className={'tl-timeline'}
                            style={{
                                width: viewPortWidth * myZoom,
                            }}
                            id={'tl-timeline'}
                            ref={refs.timeline}
                            onMouseDown={e => handleMouseEvents(e, store, refs)}
                            onMouseUp={e => handleMouseEvents(e, store, refs)}
                            onMouseMove={e => handleMouseEvents(e, store, refs)}
                        >
                            <div
                                ref={refs.cursor}
                                className={'tl-cursor'}
                            ></div>
                            <div
                                ref={refs.zoomSelectBox}
                                className={'tl-zoom-selectbox'}
                            ></div>

                            <TickRow store={store} />

                            <TimelineTracks store={store} />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
});

export default Timeline;
