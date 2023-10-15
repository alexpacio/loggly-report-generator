// Abstract classes

import moment from "moment";

export interface IExecutionSettingData {
    logglyApiKey: string;
    startingDate: string; // '2022-08-29T09:45:00.000Z'; // this is UTC
    untilDate: string; // '2022-08-29T09:45:00.000Z'; // this is UTC
    frequency: number; //= 1; // in hours
    timezoneOffset: number; // eg. -1 or 4, hourse of offset from UTC
    tenantFqdnNamesToInspect: string[];
}

export interface IExecutionSettingStrategy {
    promptDataFromUser(): Promise<void>;
    getSettings(): IExecutionSettingData;
}

export abstract class AbstractExecutionSettingStrategy implements IExecutionSettingStrategy {
    protected data: IExecutionSettingData;

    constructor() {
        this.data = {
            logglyApiKey: null,
            frequency: null,
            startingDate: null,
            tenantFqdnNamesToInspect: [],
            timezoneOffset: null,
            untilDate: null
        };
    }

    public validateDateFromInput(dateToBeValidated: string) { // eg. 2022-08-12
        // should be YYYY-MM-DD, UTC time
        const isValidated: boolean = /^[0-9]{4}-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1])$/.test(dateToBeValidated);
        if (!dateToBeValidated || isValidated !== true) {
            throw new Error("Validation error for date prompted.");
        }
    }

    public validateTimeFromImput(timeToBeValidated: string) {
        // format HH:MM, UTC time
        if (/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/i.test(timeToBeValidated) === false) {
            throw new Error("Validation error for time prompted.");
        }
    }

    public validateFrequencyFromInput(frequency: number) {
        if (frequency <= 0) {
            throw new Error("Validation error for frequency prompted.");
        }
    }

    public validateTimezoneFromInput(timezoneToBeValidated: number) {
        if (isNaN(timezoneToBeValidated) === true && timezoneToBeValidated >= -12 && timezoneToBeValidated <= 14) {
            throw new Error("Validation error for timezone prompted.");
        }
    }

    public validateFqdnDnsHostnameFromInput(fqdnHostname: string) {
        if (/^(?!:\/\/)([a-zA-Z0-9]+\.)?[a-zA-Z0-9][a-zA-Z0-9-]+\.[a-zA-Z]{2,6}?$/i.test(fqdnHostname) === false) {
            throw new Error("Validation error for dns fqdn hostname prompted.");
        }
    }

    public validateLogglyApiKey(logglyApiKey: string) {
        if(!logglyApiKey) {
            throw new Error("Loggly API key is void or non valid");
        }
    }

    protected validateTimeframe(startingDate: string, untilDate: string) {
        const untilUnixTime = moment(untilDate).unix();
        const startingUnixTime = moment(startingDate).unix();
        const currentTimeWithoutMsInUnix = moment().unix();
        if ((untilUnixTime - startingUnixTime) < 60 || untilUnixTime > currentTimeWithoutMsInUnix || startingUnixTime > currentTimeWithoutMsInUnix) {
            throw new Error("Until time is minor than starting time or is in the future. Timeframe should be at least of 1 minute");
        }
    }

    protected concatDateAndTimeInValidFormat(selectedDate: string, selectedTime: string): string {
        return selectedDate + "T" + selectedTime + ":00.000Z";
    }

    private validateFqdnsUniqueness(data: IExecutionSettingData) {
        if(data.tenantFqdnNamesToInspect.length !== [...new Set(data.tenantFqdnNamesToInspect)].length) {
            throw new Error("You passed non-unique fqdn tenant hostnames");
        }
    }

    public abstract promptDataFromUser(): Promise<void>;

    public getSettings(): IExecutionSettingData {
        return this.data;
    }

    public setSettings(data: IExecutionSettingData): void {
        this.validateFqdnsUniqueness(data);
        this.data = data;
    }
}

// Implementations / strategies

export class ExecutionSetting {
    private strategy: AbstractExecutionSettingStrategy;

    constructor(strategy: AbstractExecutionSettingStrategy) {
        this.setStrategy(strategy);
    }

    public setStrategy(strategy: AbstractExecutionSettingStrategy) {
        this.strategy = strategy;
    }

    public getStrategy() {
        return this.strategy;
    }
}