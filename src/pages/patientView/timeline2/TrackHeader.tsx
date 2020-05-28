import React from 'react';
import { TimelineTrack } from './types';

interface ITrackHeaderProps {
    track: TimelineTrack;
    level?: number;
}

const TrackHeader: React.FunctionComponent<ITrackHeaderProps> = function({
    track,
    level = 0,
}) {
    if (track.tracks) {
        return (
            <>
                <div style={{ paddingLeft: level }}>{track.type}</div>
                {track.tracks.map(track => (
                    <TrackHeader level={level + 20} track={track} />
                ))}
            </>
        );
    } else {
        return <div style={{ paddingLeft: level }}>{track.type}</div>;
    }
};

export default TrackHeader;
