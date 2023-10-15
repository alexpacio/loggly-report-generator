import { AbstractExecutionSettingStrategy } from "../ExecutionSetting";

export class BrowserExecutionSettingStrategy extends AbstractExecutionSettingStrategy {

    constructor() {
        super();
    }

    public async promptDataFromUser() {
        this.validateLogglyApiKey(document.getElementById("loggly-api-key-input")["value"]);
        this.validateDateFromInput(document.getElementById("starting-date-input")["value"]);
        this.validateDateFromInput(document.getElementById("until-date-input")["value"]);
        this.validateTimeFromImput(document.getElementById("starting-time-input")["value"]);
        this.validateTimeFromImput(document.getElementById("until-time-input")["value"]);
        this.validateFqdnDnsHostnameFromInput(document.getElementById("principal-fqdn-input")["value"]);
        if(document.getElementById("alias-fqdn-input")["value"]) {
            this.validateFqdnDnsHostnameFromInput(document.getElementById("alias-fqdn-input")["value"]);
        }
        this.validateFrequencyFromInput(parseInt(document.getElementById("frequency-input")["value"]));
        this.validateTimezoneFromInput(parseInt(document.getElementById("timezone-input")["value"]));
        const startingDate = this.concatDateAndTimeInValidFormat(
            document.getElementById("starting-date-input")["value"],
            document.getElementById("starting-time-input")["value"]);
        const untilDate = this.concatDateAndTimeInValidFormat(
            document.getElementById("until-date-input")["value"],
            document.getElementById("until-time-input")["value"]);
        this.validateTimeframe(startingDate, untilDate);
        const tenantFqdnNamesToInspect = [document.getElementById("principal-fqdn-input")["value"]];
        if(document.getElementById("alias-fqdn-input")["value"]) {
            tenantFqdnNamesToInspect.push(document.getElementById("alias-fqdn-input")["value"]);
        }
        this.setSettings({
            frequency: parseInt(document.getElementById("frequency-input")["value"]),
            logglyApiKey: document.getElementById("loggly-api-key-input")["value"],
            startingDate: startingDate,
            tenantFqdnNamesToInspect: tenantFqdnNamesToInspect,
            timezoneOffset: parseInt(document.getElementById("timezone-input")["value"]),
            untilDate: untilDate
        })
    }
}