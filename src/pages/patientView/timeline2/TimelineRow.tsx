import { EventPosition, TimelineEvent, TimelineTrack } from './types';
import React from 'react';
import Tooltip from 'rc-tooltip';
import classNames from 'classnames';

export interface ITimelineRowProps {
    trackData: TimelineTrack;
    limit: number;
    getPosition: (item: TimelineEvent, limit: number) => EventPosition;
    handleMouseHover: (e: React.MouseEvent<HTMLDivElement>) => void;
}

export const TimelineRow: React.FunctionComponent<
    ITimelineRowProps
> = function({ trackData, limit, getPosition, handleMouseHover }) {
    return (
        <>
            {trackData.tracks && trackData.tracks.length && (
                <>
                    <div
                        className={'tl-row'}
                        onMouseEnter={handleMouseHover}
                        onMouseLeave={handleMouseHover}
                    ></div>
                    {trackData.tracks.map(track => (
                        <TimelineRow
                            handleMouseHover={handleMouseHover}
                            trackData={track}
                            limit={limit}
                            getPosition={getPosition}
                        />
                    ))}
                </>
            )}
            {!trackData.tracks && (
                <div
                    className={'tl-row'}
                    onMouseEnter={handleMouseHover}
                    onMouseLeave={handleMouseHover}
                >
                    {trackData.items.map(item => {
                        const style = getPosition(item, limit);

                        let content = null;

                        const isPoint = item.start === item.end;

                        if (isPoint) {
                            content = (
                                <i
                                    className="fa fa-circle"
                                    aria-hidden="true"
                                ></i>
                            );
                        }

                        return (
                            <Tooltip
                                overlay={
                                    <span>{`${item.start}/${item.end}`}</span>
                                }
                                destroyTooltipOnHide={true}
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
            )}
        </>
    );
};
