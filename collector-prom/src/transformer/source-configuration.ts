import { SourceType } from './source-types';
export interface SourceConfiguration {
    type: SourceType,
    isRanged?: boolean,
    query?: string,
    resolution?: string | number,
    timeout?: string | number

}