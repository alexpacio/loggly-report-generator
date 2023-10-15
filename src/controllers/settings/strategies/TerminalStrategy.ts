import { AbstractExecutionSettingStrategy } from "../ExecutionSetting";
import readline from "readline/promises";
import { Debugger } from "../../debugging/Debugger";

export class TerminalExecutionSettingStrategy extends AbstractExecutionSettingStrategy {
    private rl: readline.Interface;

    constructor() {
        super();
        this.data.logglyApiKey = process.env.LOGGLY_API_KEY;

        // check if env is there
        this.validateLogglyApiKey(this.data.logglyApiKey);
    }

    public async promptDataFromUser() {
        const { stdin: input, stdout: output } = process;
        this.rl = readline.createInterface({ input, output });

        // setting timeframes
        const startingFromDateTemp = await this.promptForDate("startingFrom");
        const untilDateTemp = await this.promptForDate("until");
        try {
            this.validateTimeframe(startingFromDateTemp, untilDateTemp);
            this.data.startingDate = startingFromDateTemp;
            this.data.untilDate = untilDateTemp;
        } catch (err) {
            Debugger.getInstance().debugLog("error", err.message);
        }

        // setting frequency per hour
        while (this.data.frequency == null) {
            const freqInput = (await this.rl.question("Provide frequency in hours: ")).trim();
            try {
                const freqInputNumber = parseInt(freqInput);
                this.validateFrequencyFromInput(freqInputNumber);
                this.data.frequency = freqInputNumber;
            } catch (err) {
                Debugger.getInstance().debugLog("error", err.message);
            }
        }

        this.rl.close();
    }

    private async promptForDate(type: "startingFrom" | "until"): Promise<string> {
        let selectedDate: string;
        let selectedTime: string;
        while (selectedDate == null) {
            const dateToBeValidated: string = (await this.rl.question(`${type === "startingFrom" ? "Starting from" : "Until"} day (format YYYY-MM-DD, UTC time): `)).trim();
            try {
                this.validateDateFromInput(dateToBeValidated);
                selectedDate = dateToBeValidated;
            } catch (err) {
                Debugger.getInstance().debugLog("error", err.message);
            }
        }

        while (selectedTime == null) {
            const timeToBeValidated: string = (await this.rl.question(`${type === "startingFrom" ? "Starting from" : "Until"} time (format HH:MM, UTC time): `)).trim();
            try {
                this.validateTimeFromImput(timeToBeValidated);
                selectedTime = timeToBeValidated;
            } catch (err) {
                Debugger.getInstance().debugLog("error", err.message);
            }
        }

        return this.concatDateAndTimeInValidFormat(selectedDate, selectedTime);
    }

}