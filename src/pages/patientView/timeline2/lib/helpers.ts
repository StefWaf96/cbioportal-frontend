import { TimelineEvent } from '../types';
import _ from 'lodash';

export function getAttributeValue(name: string, event: TimelineEvent) {
    const att = _.at(event as any, ['event.attributes']);
    const attObj = att[0]
        ? att[0].find((a: any) => a.key === 'RESULT')
        : undefined;
    return attObj ? attObj.value : undefined;
}
