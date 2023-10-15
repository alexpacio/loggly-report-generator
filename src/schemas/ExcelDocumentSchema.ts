import { Percentiles } from "../interfaces/Percentile";

function getExcelHeader() {
    const excelHeader = [
        {
            value: 'Starting from date',
            fontWeight: 'bold'
        },
        {
            value: 'Until date',
            fontWeight: 'bold'
        },
        {
            value: 'Total users involved in errors',
            fontWeight: 'bold',
            wrap: true
        },
        {
            value: 'Errors detected in total',
            fontWeight: 'bold',
            wrap: true
        },
        {
            value: 'Avg errors per user',
            fontWeight: 'bold',
            wrap: true
        }
    ];
    
    for (const percentileName of Object.values(Percentiles)) {
        excelHeader.push({
            value: 'Percentile ' + percentileName,
            fontWeight: 'bold',
            wrap: true
        })
    }

    return excelHeader;
}


export default getExcelHeader();