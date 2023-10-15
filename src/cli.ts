// import axios from "axios";
// import * as validateDate from "validate-date";
// import moment from 'moment';
// import writeXlsxFile from 'write-excel-file/node';
// import percentile from 'percentile';
// import debug from 'debug';
// import { Percentiles, supportedPercentiles } from "./interfaces/Percentile";
// import { IErrorExcelRow, IExcelRow, IPartialExcelRow } from "./interfaces/ExcelSchema";
// import ExcelDocumentSchema from "./schemas/ExcelDocumentSchema";
// import { LogglyFetcher } from "./controllers/LogglyFetcher";
// import { RuntimeSetting } from "./controllers/settings/RuntimeSetting";

import { isNode } from "browser-or-node";
import { existsSync } from "fs";
import writeXlsxFile from "write-excel-file/node";
import { Debugger } from "./controllers/debugging/Debugger";
import { LogglyFetcher } from "./controllers/fetchers/LogglyFetcher";
import { RuntimeSetting } from "./controllers/settings/RuntimeSetting";
import { FileExecutionSettingStrategy } from "./controllers/settings/strategies/FileStrategy";
import { TerminalExecutionSettingStrategy } from "./controllers/settings/strategies/TerminalStrategy";
import ExcelDocumentSchema from "./schemas/ExcelDocumentSchema";
import { configFilePath } from "./Settings";

Debugger.getInstance().debugLog("verbose", "CLI loaded!");

function guessStrategyForRuntime() {
    if (existsSync(configFilePath)) {
        return new FileExecutionSettingStrategy();
    }
    if (isNode) {
        return new TerminalExecutionSettingStrategy();
    }
    throw new Error("Couldn't find a way to obtain settings (file, terminal), this mode is not supported.");
}

async function run() {
    RuntimeSetting.getInstance().setRuntimeEnvironment(guessStrategyForRuntime());
    await RuntimeSetting.getInstance().promptUserInputs();
    await writeXlsxFile([ExcelDocumentSchema, await new LogglyFetcher().runFetcher()] as any, {
        filePath: __dirname + `/output/report-${Date.now()}.xlsx`
    });
}

run().catch(console.error);