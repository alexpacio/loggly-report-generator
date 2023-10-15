/* export interface IStringDataContainer {
    type: typeof String;
    value: string;
    backgroundColor?: "#ff0000" // red, to be used for errors;
}

export interface IDateDataContainer {
    type: typeof Date;
    value: Date;
    backgroundColor?: "#ff0000" // red, to be used for errors;
} */


export type ExcelRow = {value: string | number}[];

export interface IExcelCellBlankWithError {
    value: "failedToFetchData",
    backgroundColor: "#ff0000"
}

interface IExcelCellWithError {
    value: string,
    backgroundColor: "#ff0000"
}

export type ExcelRowWithError = IExcelCellWithError[];