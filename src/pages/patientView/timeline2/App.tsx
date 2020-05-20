import React, { useEffect, useState } from 'react';
import logo from './logo.svg';
import './App.css';
import './timeline.scss';
import _ from 'lodash';
import $ from 'jquery';
import { ObservableMap, observable, computed } from 'mobx';
import { Observer, observer } from 'mobx-react';

import {
    EventPosition,
    TimelineEvent,
    TimelineTick,
    TimelineTrack,
} from './types';
import eventData from './data/events.json';
import Slider, { Handle, Range, createSliderWithTooltip } from 'rc-slider';
import 'rc-slider/assets/index.css';

import 'rc-tooltip/assets/bootstrap.css';
import { TimelineStore } from './TimelineStore';

import Timeline from './Timeline';
import TimelineTracks from './TimelineTracks';
import { getBrowserWindow } from 'cbioportal-frontend-commons';

function getData(eventData: any) {
    return _.groupBy(eventData, (e: any) => e.eventType);
}

let myStore: TimelineStore;

const Timeline2: React.FunctionComponent<{ data: any }> = function({ data }) {
    const [events, setEvents] = useState<TimelineTrack[] | null>(null);

    useEffect(() => {
        const cats = getData(data);

        const treatmentTracks = _.chain(cats['TREATMENT'])
            .groupBy(c => c.attributes[1].value)
            .map((m, k) => {
                const items = m.map((e: any) => {
                    return {
                        end:
                            e.endNumberOfDaysSinceDiagnosis ||
                            e.startNumberOfDaysSinceDiagnosis,
                        start: e.startNumberOfDaysSinceDiagnosis,
                        event: e,
                    };
                });

                return {
                    items,
                    type: k,
                };
            })
            .value();

        const newData: TimelineTrack[] = _.map(cats, (events: any[], key) => {
            const items = events.map((e: any) => {
                return {
                    end:
                        e.endNumberOfDaysSinceDiagnosis ||
                        e.startNumberOfDaysSinceDiagnosis,
                    start: e.startNumberOfDaysSinceDiagnosis,
                    event: e,
                };
            });

            return {
                type: key,
                items,
            };
        });

        newData.push(...treatmentTracks);

        setEvents(newData);
        console.log('new store');
        myStore = new TimelineStore(newData);

        (window as any).store = myStore;
    }, []);

    console.log('rendering app');

    if (!events || !myStore) {
        return <div>Loading</div>;
    } else {
        return (
            <div className="App">
                <Observer>
                    {() => {
                        return <Timeline store={myStore} />;
                    }}
                </Observer>
            </div>
        );
    }
};

export default Timeline2;
