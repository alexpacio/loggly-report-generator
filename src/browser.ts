import { isBrowser } from "browser-or-node";
import writeXlsxFile from "write-excel-file";
import { Debugger } from "./controllers/debugging/Debugger";
import { LogglyFetcher } from "./controllers/fetchers/LogglyFetcher";
import { RuntimeSetting } from "./controllers/settings/RuntimeSetting";
import { BrowserExecutionSettingStrategy } from "./controllers/settings/strategies/BrowserStrategy";
import ExcelDocumentSchema from "./schemas/ExcelDocumentSchema";
import { excelFileColumns } from "./Settings";

console.log("Loggly Fetcher webpack bundle loaded!");

let isRunning = false;

function saveFile(blob: Blob, filename: string) {
    const a = document.createElement('a');
    document.body.appendChild(a);
    const url = window.URL.createObjectURL(blob);
    a.href = url;
    a.download = filename;
    a.click();
    setTimeout(() => {
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    }, 0)
}

document.getElementById('start-process').onclick = async () => {
    if(isRunning === true) {
        Debugger.getInstance().debugLog("error", "Fetching process is already running, ignoring another execution");
        return;
    }
    isRunning = true;
    const debugSelect = document.getElementById("debug-level-select");
    Debugger.getInstance().changeDebugLevel(debugSelect["options"][debugSelect["selectedIndex"]].value);
    document.getElementById("execution-logs").childNodes.forEach(node => node.remove());
    document.getElementById("execution-logs").classList.remove("d-none");
    if (isBrowser) {
        RuntimeSetting.getInstance().setRuntimeEnvironment(new BrowserExecutionSettingStrategy());
    } else {
        throw new Error("Couldn't find a way to obtain settings, this mode is not supported.");
    }
    try {
        await RuntimeSetting.getInstance().promptUserInputs();
        Debugger.getInstance().debugLog("verbose", "Input validation passed!");
        document.getElementById("spinner").classList.remove("d-none");
        const dataForExcel = [ExcelDocumentSchema, ...await new LogglyFetcher().runFetcher()];
        const blob = await writeXlsxFile(dataForExcel, {
            columns: excelFileColumns,
            fileName: null
        }) as unknown as Blob;
        const filename = `report-${Date.now()}.xlsx`;
        saveFile(blob, filename);
        document.getElementById("spinner").classList.add("d-none");
        document.getElementById("execution-logs").classList.add("d-none");
    } catch (err) {
        Debugger.getInstance().debugLog("error", err.message);
    }
    isRunning = false;
}