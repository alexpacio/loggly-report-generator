import stringSimilarity from "string-similarity";
import { ILogglyJsonEvent } from "../../interfaces/LogglyDataSchema";
import { EVENT_OUTPUT_PARSER_SIMILARITY_SCORE_THRESHOLD } from "../../Settings";
import { Debugger } from "../debugging/Debugger";

class LogglyEvent {
    constructor(private event: ILogglyJsonEvent) {
    }

    getEventOutput(): string {
        return;
    }

}

interface ILogEventStats {
    userId: string;
    occurrenciesDetected: number;
    similarityScores: number[]; // from 0 to 1
}

interface ILogEvent {
    data: LogglyEvent;
    statsPerUser: ILogEventStats[];
    similarOccurrenciesPayload?: LogglyEvent[]; // enabled only when debugging is verbose
}

export class LogglyDataInspector {
    private collection: ILogEvent[];
    constructor() {
        this.collection = [];
    }

    public inspectAndCollectNewEvent(userId: string, logEvent: ILogglyJsonEvent) {
        const incomingLog = new LogglyEvent(logEvent);
        let stringSimilarityScore: number;
        const logglyEvent = this.collection.find(event => {
            stringSimilarityScore = stringSimilarity.compareTwoStrings(incomingLog.getEventOutput(), event.data.getEventOutput()) as number;
            return stringSimilarityScore >= EVENT_OUTPUT_PARSER_SIMILARITY_SCORE_THRESHOLD;
        });
        if (logglyEvent == null) {
            this.collection.push({
                data: incomingLog,
                statsPerUser: [{
                    occurrenciesDetected: 1,
                    userId: userId,
                    similarityScores: []
                }]
            })
        } else {
            const matchedStat = logglyEvent.statsPerUser.find(stat => stat.userId === userId);
            if (matchedStat != null) {
                matchedStat.occurrenciesDetected++;
                matchedStat.similarityScores.push(stringSimilarityScore);
            } else {
                logglyEvent.statsPerUser.push({
                    occurrenciesDetected: 1,
                    userId: userId,
                    similarityScores: [stringSimilarityScore]
                })
            }
            if (Debugger.getInstance().getDebugLevel === "verbose") {
                if (logglyEvent.similarOccurrenciesPayload == null) {
                    logglyEvent.similarOccurrenciesPayload = [];
                }
                logglyEvent.similarOccurrenciesPayload.push(incomingLog);
            }
        }
    }

    public getExcelSheetDataForGeneralSummary(): object[] { // returns a unique excel file for every deduplicated event detected
        return
    }

    public getExcelSheetDataForSimilarEventOccurrencies(): object[] { // returns an excel file per deduplicated event
        return
    }
}
