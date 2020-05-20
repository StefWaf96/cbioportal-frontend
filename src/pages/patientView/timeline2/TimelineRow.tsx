import { EventPosition, TimelineEvent } from './types';
import React from 'react';
import Tooltip from 'rc-tooltip';
import classNames from 'classnames';

export interface ITimelineRowProps {
    items: any[];
    limit: number;
    getPosition: (item: TimelineEvent, limit: number) => EventPosition;
}

export const TimelineRow: React.FunctionComponent<
    ITimelineRowProps
> = function({ items, limit, getPosition }) {
    return (
        <div className={'tl-row'}>
            {items.map(item => {
                const style = getPosition(item, limit);

                let content = null;

                const isPoint = item.start === item.end;

                if (isPoint) {
                    content = (
                        <i className="fa fa-circle" aria-hidden="true"></i>
                    );
                }

                return (
                    <Tooltip
                        overlay={<span>{`${item.start}/${item.end}`}</span>}
                    >
                        <div
                            style={style}
                            className={classNames({
                                'tl-item': true,
                                'tl-item-point': isPoint,
                                'tl-item-range': !isPoint,
                            })}
                        >
                            {content}
                        </div>
                    </Tooltip>
                );
            })}
        </div>
    );
};
