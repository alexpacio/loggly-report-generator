import axios, { AxiosError, AxiosResponse } from "axios";
import { RuntimeSetting } from "../settings/RuntimeSetting";
import { Debugger } from "../debugging/Debugger";
import { Percentiles, supportedPercentiles } from "../../interfaces/Percentile";
import moment from "moment";
import percentile from "percentile";
import { IExcelCellBlankWithError, ExcelRowWithError, ExcelRow } from "../../interfaces/ExcelSchema";
import { momentJsDateFormat } from "../../Settings";

export class LogglyFetcher {

    private getQueryString() {
        return `(${RuntimeSetting.getInstance().getSettings().tenantFqdnNamesToInspect.map(name => "syslog.host:" + name).join(" OR ")}) AND syslog.severity:Error AND json.userId:*`;
    }

    private async fetchDataOnATimeframe(startingFromDatePartial: string, untilDatePartial: string): Promise<ExcelRow> {
        let nextUrl: string = `https://provider.loggly.com/apiv2/events/iterate?q=${this.getQueryString()}&from=${startingFromDatePartial}&until=${untilDatePartial}&size=1000`;
        const userErrorsCounter: { [userId: string]: number } = {};

        while (nextUrl != null) {
            Debugger.getInstance().debugLog("verbose", "Calling " + nextUrl);
            const response = await axios.get(nextUrl, {
                headers: {
                    authorization: "Bearer " + RuntimeSetting.getInstance().getSettings().logglyApiKey
                }
            });
            Debugger.getInstance().debugLog("verbose", `Fetched events for timerange from ${startingFromDatePartial} to ${untilDatePartial} url ${nextUrl}: ${response.data.events?.length}`);

            for (let i = 0; i < response.data.events.length; i++) {
                if (userErrorsCounter[response.data.events[i].event.json.userId] == null) {
                    userErrorsCounter[response.data.events[i].event.json.userId] = 0;
                }
                userErrorsCounter[response.data.events[i].event.json.userId]++;
                while (response.data.events[i].event.json.userId === response.data.events[i + 1]?.event.json.userId && response.data.events[i].event.syslog.pid === response.data.events[i + 1]?.event.syslog.pid) {
                    //Debugger.getInstance().debugLog("verbose", `Found a duplicate log, skipping.`);
                    i++;
                }
            }
            nextUrl = response.data?.next;
            //await sleep(500); this is not needed, loggly is not applying restriction on sequential APIs
        }

        const totalUsersInvolved = Object.keys(userErrorsCounter).length;
        const totalErrorsCount = Object.keys(userErrorsCounter).reduce((acc, curr) => {
            acc += userErrorsCounter[curr];
            return acc;
        }, 0);
        const errorsUsers = Object.keys(userErrorsCounter).sort((a, b) => userErrorsCounter[a] - userErrorsCounter[b]);
        const userThrowingErrors = errorsUsers.reduce((acc, curr) => {
            acc.push({
                userId: curr,
                errors: userErrorsCounter[curr]
            });
            return acc;
        }, <{ userId: string, errors: number }[]>[]);
        const avgErrorsPerUser = totalErrorsCount / Object.keys(userErrorsCounter).length;

        const percentiles = percentile(
            supportedPercentiles,
            userThrowingErrors,
            item => item.errors
        );

        const returnObject: ExcelRow = [
            { value: moment(startingFromDatePartial).utcOffset(RuntimeSetting.getInstance().getSettings().timezoneOffset).format(momentJsDateFormat) },
            { value: moment(untilDatePartial).utcOffset(RuntimeSetting.getInstance().getSettings().timezoneOffset).format(momentJsDateFormat) },
            { value: totalErrorsCount },
            { value: totalUsersInvolved },
            { value: avgErrorsPerUser === NaN ? 0 : Math.round(avgErrorsPerUser) },
        ];

        let percentilesIndex = 0;
        for (const supportedPercentile of Object.values(Percentiles)) {
            returnObject.push({ value: percentiles[percentilesIndex]?.errors });
            percentilesIndex++;
        }

        /* for (let i = 0; i < 10 && i < topUserThrowingErrors.length; i++) {
            returnObject["topErrorsOnUser" + (i + 1)] = topUserThrowingErrors[i].errors;
        } */

        return returnObject;
    }

    public async runFetcher(): Promise<Array<ExcelRow | ExcelRowWithError>> {
        const settings = RuntimeSetting.getInstance().getSettings();
        const untilUnixTime = moment(settings.untilDate).unix();
        const rows: Array<ExcelRow | ExcelRowWithError> = [];

        for (let currentStartingUnixTime = moment(settings.startingDate).unix(); currentStartingUnixTime < untilUnixTime; currentStartingUnixTime += settings.frequency * 3600) {
            let currentUntilUnixTime = currentStartingUnixTime + (settings.frequency * 3600);
            if (currentUntilUnixTime > untilUnixTime) {
                currentUntilUnixTime = untilUnixTime;
            }
            let rowData: ExcelRow | ExcelRowWithError;
            let startingFromDatePartial = moment(currentStartingUnixTime * 1000).utcOffset(0).format(momentJsDateFormat).replace("+00:00", "Z");
            let untilDatePartial = moment(currentUntilUnixTime * 1000).utcOffset(0).format(momentJsDateFormat).replace("+00:00", "Z");
            try {
                rowData = await this.fetchDataOnATimeframe(startingFromDatePartial, untilDatePartial);
            } catch (err) {
                if (err.message.includes("401")) {
                    throw new Error("Please check the Loggly API key again, received a 401");
                }
                Debugger.getInstance().debugLog("warning", "Skipping timeframe from " + moment(currentStartingUnixTime * 1000).utcOffset(0).format(momentJsDateFormat).replace("+00:00", "Z") + " to " + moment(currentUntilUnixTime * 1000).utcOffset(0).format(momentJsDateFormat).replace("+00:00", "Z") + " due to error " + err.message);
                const errorCellContent: IExcelCellBlankWithError = {
                    value: "failedToFetchData",
                    backgroundColor: "#ff0000"
                };
                const partialRowData: ExcelRowWithError = [
                    {
                        value: moment(startingFromDatePartial).utcOffset(settings.timezoneOffset).format(momentJsDateFormat),
                        backgroundColor: "#ff0000"
                    },
                    {
                        value: moment(untilDatePartial).utcOffset(settings.timezoneOffset).format(momentJsDateFormat),
                        backgroundColor: "#ff0000"
                    },
                    errorCellContent,
                    errorCellContent,
                    errorCellContent
                ];
                rowData = partialRowData;
            }
            rows.push(rowData);
        }
        return rows;
    }
}