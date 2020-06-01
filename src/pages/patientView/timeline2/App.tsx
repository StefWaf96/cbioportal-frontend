import React, { useEffect, useState } from 'react';
import './App.css';
import './timeline.scss';
import _ from 'lodash';
import $ from 'jquery';
import { Observer, observer } from 'mobx-react-lite';

import { TimelineTrack } from './types';

import { TimelineStore } from './TimelineStore';

import Timeline from './Timeline';
import { ClinicalAttribute, ClinicalEvent } from 'cbioportal-ts-api-client';
import configureTracks from 'pages/patientView/timeline2/configureCats';
import { getAttributeValue } from 'pages/patientView/timeline2/lib/helpers';

function getData(eventData: any) {
    return _.groupBy(eventData, (e: any) => e.eventType.toUpperCase());
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

interface ITimeline2Props {
    data: ClinicalEvent[];
    caseMetaData: {
        color: { [sampleId: string]: string };
        index: { [sampleId: string]: number };
        label: { [sampleId: string]: string };
    };
}

const Timeline2: React.FunctionComponent<ITimeline2Props> = observer(function({
    data,
    caseMetaData,
}) {
    const [events, setEvents] = useState<TimelineTrack[] | null>(null);

    const [store, setStore] = useState<TimelineStore | null>(null);

    useEffect(() => {
        var isGenieBpcStudy = window.location.href.includes('genie_bpc');

        let baseConfig: any = {
            sortOrder: [
                'Specimen',
                'Surgery',
                'Med Onc Assessment',
                'Status',
                'Diagnostics',
                'Diagnostic',
                'Imaging',
                'Lab_test',
                'Treatment',
            ],
            splitConfig: [
                ['TREATMENT', 'TREATMENT_TYPE', 'SUBTYPE', 'AGENT'],
                ['LAB_TEST', 'TEST'],
            ],
            trackEventRenderers: [
                {
                    trackTypeMatch: /LAB_TEST/i,
                    configureTrack: (cat: TimelineTrack) => {
                        const psaTrack = cat.tracks
                            ? cat.tracks.find(t => t.type === 'PSA')
                            : undefined;

                        if (psaTrack && psaTrack && psaTrack.items.length) {
                            const psaValues = psaTrack.items.map(event => {
                                const val = getAttributeValue('VALUE', event);

                                return val
                                    ? parseFloat(val.replace(/^[<>]/gi, ''))
                                    : undefined;
                            });

                            //console.log(psaValues.map(v => v.value));
                            const max = _.max(psaValues);

                            psaTrack.items.forEach(event => {
                                event.render = () => {
                                    let perc =
                                        getAttributeValue('VALUE', event) /
                                        (max || 1)!;
                                    perc = perc > 0.2 ? perc : 0.2;
                                    return (
                                        <svg width="18" height="19">
                                            <circle
                                                cx={10}
                                                cy={10}
                                                r={8 * perc}
                                                fill={'#999999'}
                                            />
                                        </svg>
                                    );
                                };
                            });
                        }
                    },
                },
                {
                    trackTypeMatch: /SPECIMEN|SAMPLE ACQUISITION|SEQUENCING/i,
                    configureTrack: (cat: TimelineTrack) => {
                        cat.items.forEach((event, i) => {
                            const sampleId = event.event.attributes.find(
                                (att: any) => att.key === 'SAMPLE_ID'
                            );
                            if (sampleId) {
                                const color =
                                    caseMetaData.color[sampleId.value] ||
                                    '#333333';
                                const label =
                                    caseMetaData.label[sampleId.value] || '-';
                                event.render = event => {
                                    return (
                                        <svg width="15" height="15">
                                            <circle
                                                cx="7.5"
                                                cy="7.5"
                                                r="7"
                                                fill={color}
                                            />
                                            <text
                                                x="50%"
                                                y="50%"
                                                text-anchor="middle"
                                                fill="white"
                                                font-size="10px"
                                                font-family="Arial"
                                                dy=".3em"
                                            >
                                                {label}
                                            </text>
                                        </svg>
                                    );
                                };
                            }
                        });
                    },
                },
            ],
        };

        if (isGenieBpcStudy) {
            baseConfig.sortOrder = [
                'Sample acquisition',
                'Sequencing',
                'Surgery',
                'Med Onc Assessment',
                'Status',
                'Diagnostics',
                'Diagnostic',
                'IMAGING',
                'Lab_test',
                'Treatment',
            ];

            // status track
            baseConfig.trackEventRenderers.push({
                trackTypeMatch: /STATUS|Med Onc Assessment/i,
                configureTrack: (cat: TimelineTrack) => {
                    cat.type = 'Med Onc Assessment';
                    const colorMappings = [
                        { re: /indeter/i, color: '#ffffff' },
                        { re: /stable/i, color: 'gainsboro' },
                        { re: /mixed/i, color: 'goldenrod' },
                        { re: /improving/i, color: 'rgb(44, 160, 44)' },
                        { re: /worsening/i, color: 'rgb(214, 39, 40)' },
                    ];
                    cat.items.forEach((event, i) => {
                        const status = event.event.attributes.find(
                            (att: any) => att.key === 'STATUS'
                        );
                        let color = '#ffffff';
                        if (status) {
                            const colorConfig = colorMappings.find(m =>
                                m.re.test(status.value)
                            );
                            if (colorConfig) {
                                color = colorConfig.color;
                            }
                        }
                        event.render = event => {
                            return (
                                <svg width="10" height="10">
                                    <circle
                                        cx="5"
                                        cy="5"
                                        r="4"
                                        stroke="#999999"
                                        fill={color}
                                    />
                                </svg>
                            );
                        };
                    });
                },
            });

            // imaging track
            baseConfig.trackEventRenderers.push({
                trackTypeMatch: /IMAGING/i,
                configureTrack: (cat: TimelineTrack) => {
                    const colorMappings = [
                        { re: /indeter|does not mention/i, color: '#ffffff' },
                        { re: /stable/i, color: 'gainsboro' },
                        { re: /mixed/i, color: 'goldenrod' },
                        { re: /improving/i, color: 'rgb(44, 160, 44)' },
                        { re: /worsening/i, color: 'rgb(214, 39, 40)' },
                    ];
                    if (cat.items && cat.items.length) {
                        cat.items.forEach((event, i) => {
                            const status = event.event.attributes.find(
                                (att: any) => att.key === 'IMAGE_OVERALL'
                            );
                            let color = '#ffffff';
                            if (status) {
                                const colorConfig = colorMappings.find(m =>
                                    m.re.test(status.value)
                                );
                                if (colorConfig) {
                                    color = colorConfig.color;
                                }
                            }
                            event.render = event => {
                                return (
                                    <svg width="10" height="10">
                                        <circle
                                            cx="5"
                                            cy="5"
                                            r="4"
                                            stroke="#999999"
                                            fill={color}
                                        />
                                    </svg>
                                );
                            };
                        });
                    }
                },
            });
        } else {
        }

        const keyedSplits = _.keyBy(baseConfig.splitConfig, arr => arr[0]);

        //data[0].startNumberOfDaysSinceDiagnosis = -720;

        const cats = getData(data);

        //configureTracks(_.values(d), baseConfig.trackEventRenderers);

        const merged = _.uniq(
            baseConfig.sortOrder
                .map((name: string) => name.toUpperCase())
                .concat(Object.keys(cats))
        );
        const sortedCats = _.reduce(
            merged,
            (agg: { [k: string]: any }, key: string) => {
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

        configureTracks(d, baseConfig.trackEventRenderers);

        const store = new TimelineStore(d);

        setStore(store);

        (window as any).store = store;
    }, []);

    if (store) {
        return <Timeline store={store} />;
    } else {
        return <div></div>;
    }
});

export default Timeline2;
