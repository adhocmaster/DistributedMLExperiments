import { SourceType } from './source-types';
export interface SourceConfiguration {
    type: SourceType,
    isRanged?: boolean,
    query?: string,
    resolution?: number, // seconds in float
    captureStep?: string, // prom duration syntax
    timeout?: string // prom duration syntax
    requestInterval?: number //in ms

}