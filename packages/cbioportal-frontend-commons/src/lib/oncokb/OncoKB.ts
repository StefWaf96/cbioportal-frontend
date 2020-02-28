import { CancerGene, IndicatorQueryResp } from '../../api/generated/OncoKbAPI';

export type Query = {
    id: string;
    alteration: string;
    tumorType: string;
    hugoSymbol: string;
};

export interface IOncoKbData {
    indicatorMap: { [id: string]: IndicatorQueryResp } | null;
    uniqueSampleKeyToTumorType?: { [sampleId: string]: string } | null;
}

export interface IOncoKbDataWrapper {
    status: 'pending' | 'error' | 'complete';
    result?: IOncoKbData | Error;
}

export interface IOncoKbCancerGenesWrapper {
    status: 'pending' | 'error' | 'complete';
    result?: CancerGene[] | Error;
}

export enum EvidenceType {
    GENE_SUMMARY = 'GENE_SUMMARY',
    MUTATION_SUMMARY = 'MUTATION_SUMMARY',
    TUMOR_TYPE_SUMMARY = 'TUMOR_TYPE_SUMMARY',
    GENE_TUMOR_TYPE_SUMMARY = 'GENE_TUMOR_TYPE_SUMMARY',
    PROGNOSTIC_SUMMARY = 'PROGNOSTIC_SUMMARY',
    DIAGNOSTIC_SUMMARY = 'DIAGNOSTIC_SUMMARY',
    GENE_BACKGROUND = 'GENE_BACKGROUND',
    ONCOGENIC = 'ONCOGENIC',
    MUTATION_EFFECT = 'MUTATION_EFFECT',
    VUS = 'VUS',
    PROGNOSTIC_IMPLICATION = 'PROGNOSTIC_IMPLICATION',
    DIAGNOSTIC_IMPLICATION = 'DIAGNOSTIC_IMPLICATION',
    STANDARD_THERAPEUTIC_IMPLICATIONS_FOR_DRUG_SENSITIVITY = 'STANDARD_THERAPEUTIC_IMPLICATIONS_FOR_DRUG_SENSITIVITY',
    STANDARD_THERAPEUTIC_IMPLICATIONS_FOR_DRUG_RESISTANCE = 'STANDARD_THERAPEUTIC_IMPLICATIONS_FOR_DRUG_RESISTANCE',
    INVESTIGATIONAL_THERAPEUTIC_IMPLICATIONS_DRUG_SENSITIVITY = 'INVESTIGATIONAL_THERAPEUTIC_IMPLICATIONS_DRUG_SENSITIVITY',
    INVESTIGATIONAL_THERAPEUTIC_IMPLICATIONS_DRUG_RESISTANCE = 'INVESTIGATIONAL_THERAPEUTIC_IMPLICATIONS_DRUG_RESISTANCE',
}