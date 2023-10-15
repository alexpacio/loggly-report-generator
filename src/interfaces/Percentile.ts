
/*
*
*   NOTE: if you want to add/remove some percentiles, just apply your percentiles here in this enum below, following this pattern!
*
*/

export enum Percentiles {
    p50 = 'p50',
    p70 = 'p70',
    p80 = 'p80',
    p90 = 'p90',
    p95 = 'p95',
    p99 = 'p99'
}

export const supportedPercentiles = Object.values(Percentiles).map(elm => parseInt(elm.slice(1)));

export type PercentileObject = {value: number}[];