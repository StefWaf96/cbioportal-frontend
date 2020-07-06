import React from 'react';
import { TimelineTrack } from './types';

interface ITrackHeaderProps {
    track: TimelineTrack;
    level?: number;
}

const TrackHeader: React.FunctionComponent<ITrackHeaderProps> = function({
    track,
    level = 5,
}) {
    if (track.tracks) {
        return (
            <>
                <div style={{ paddingLeft: level }}>
                    {track.type.toLowerCase().replace(/_/g, '')}
                </div>
                {track.tracks.map(track => (
                    <TrackHeader level={level + 17} track={track} />
                ))}
            </>
        );
    } else {
        return (
            <div style={{ paddingLeft: level }}>
                {track.type.toLowerCase().replace(/_/g, '')}
            </div>
        );
    }
};

export default TrackHeader;
