import React, { useEffect, useState } from 'react';
import './App.css';
import './timeline.scss';
import _ from 'lodash';
import $ from 'jquery';
import { Observer, observer } from 'mobx-react-lite';

import { TimelineTrack } from './types';
import 'rc-slider/assets/index.css';

import 'rc-tooltip/assets/bootstrap.css';
import { TimelineStore } from './TimelineStore';

import Timeline from './Timeline';
import { ClinicalEvent } from 'cbioportal-ts-api-client';

function getData(eventData: any) {
    return _.groupBy(eventData, (e: any) => e.eventType);
}

function makeItems(items: any) {
    return items.map((e: any) => {
        return {
            end:
                e.endNumberOfDaysSinceDiagnosis ||
                e.startNumberOfDaysSinceDiagnosis,
            start: e.startNumberOfDaysSinceDiagnosis,
            event: e,
        };
    });
}

function splitCats(splits: string[], cat: any): TimelineTrack {
    if (!cat[0].attributes.find((att: any) => att.key === splits[0])) {
        return {
            type: 'moo',
            items: makeItems(cat),
        };
    }

    const groups = _.groupBy(
        cat,
        item => item.attributes.find((att: any) => att.key === splits[0]).value
    );

    const tracks: TimelineTrack[] = _.map(groups, (group, key) => {
        if (splits.length > 1) {
            const track = splitCats(splits.slice(1), group);
            track.type = key;
            return track;
        } else {
            return {
                type: key,
                items: makeItems(group),
            };
        }
    });

    const track = {
        type: cat[0].attributes.find((att: any) => att.key === splits[0]).value,
        tracks,
        items: [],
    };

    return track;
}

// function splitCats(splits:string[], cat:any) : TimelineTrack {
//
//     const groups = _.groupBy(cat,(item)=>(
//                                  item.attributes.find((att:any)=>att.key===splits[0]).value
//                              )
//     );
//
//     const tracks: TimelineTrack[] = _.map(groups, (group, key)=>{
//         if (splits.length > 1) {
//             const track =  splitCats(splits.slice(1),group);
//             track.type = key;
//             return track;
//         } else {
//             return {
//                 type:key,
//                 items:makeItems(group)
//             }
//         }
//     });
//
//     const track = {
//         type: cat[0].attributes.find((att:any)=>att.key===splits[0]).value,
//         tracks,
//         items:[]
//     }
//
//     return track;
//
// }

const Timeline2: React.FunctionComponent<{ data: ClinicalEvent[] }> = observer(
    function({ data }) {
        const [events, setEvents] = useState<TimelineTrack[] | null>(null);

        const [store, setStore] = useState<TimelineStore | null>(null);

        useEffect(() => {
            let splitConfig = [
                ['TREATMENT', 'TREATMENT_TYPE', 'SUBTYPE', 'AGENT'],
                ['LAB_TEST', 'TEST'],
            ];

            const sortOrder = [
                'Specimen',
                'Surgery',
                'Med Onc Assessment',
                'Status',
                'Diagnostics',
                'Diagnostic',
                'Imaging',
                'Lab_test',
                'Treatment',
            ];

            const keyedSplits = _.keyBy(splitConfig, arr => arr[0]);

            //data[0].startNumberOfDaysSinceDiagnosis = -720;

            const cats = getData(data);

            const merged = _.uniq(
                sortOrder
                    .map(name => name.toUpperCase())
                    .concat(Object.keys(cats))
            );
            const sortedCats = _.reduce(
                merged,
                (agg: { [k: string]: any }, key) => {
                    if (key in cats) {
                        agg[key] = cats[key];
                    }
                    return agg;
                },
                {}
            );

            const d = _.map(sortedCats, (cat, key) => {
                if (key in keyedSplits) {
                    const splits = splitCats(keyedSplits[key].slice(1), cat);
                    return {
                        type: key,
                        items: [],
                        tracks: splits.tracks,
                    };
                } else {
                    return {
                        type: key,
                        items: makeItems(cat),
                    };
                }
            });

            const store = new TimelineStore(d);

            setStore(store);

            (window as any).store = store;
        }, []);

        if (store) {
            return <Timeline store={store} />;
        } else {
            return <div></div>;
        }
    }
);

export default Timeline2;
