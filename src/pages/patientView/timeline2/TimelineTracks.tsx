import { TickIntervalEnum, TimelineTick } from './types';
import { TimelineRow } from './TimelineRow';
import React, { useCallback } from 'react';
import { TimelineStore } from './TimelineStore';
import _ from 'lodash';
import { observer } from 'mobx-react';

export interface ITimelineTracks {
    store: TimelineStore;
}

const TimelineTracks: React.FunctionComponent<ITimelineTracks> = observer(
    function({ store }) {
        const hoverCallback = e => {
            switch (e.type) {
                case 'mouseenter':
                    const rowIndex = _.findIndex(
                        e.currentTarget.parentNode!.children,
                        el => el === e.currentTarget
                    );
                    if (rowIndex !== undefined) {
                        store.hoveredRowIndex = rowIndex;
                    }
                    break;
                default:
                    store.hoveredRowIndex = undefined;
            }
        };

        return (
            <>
                <div className={'tl-rowGroup'}>
                    {store.data.map((row, i) => {
                        return (
                            <TimelineRow
                                limit={store.trimmedLimit}
                                trackData={row}
                                handleMouseHover={hoverCallback}
                                getPosition={store.getPosition}
                            />
                        );
                    })}
                </div>
            </>
        );
    }
);

export default TimelineTracks;
