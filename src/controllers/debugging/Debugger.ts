import { isBrowser } from "browser-or-node";

type SupportedDebugLevel = "verbose" | "warning" | "error";

export class Debugger {
    private static instance: Debugger;
    private debugLevel: SupportedDebugLevel;

    private constructor() {
        this.debugLevel = "error";
    }

    public static getInstance() {
        if (this.instance == null) {
            this.instance = new Debugger();
        }
        return this.instance;
    }

    public get getDebugLevel() {
        return this.debugLevel;
    }

    public changeDebugLevel(level: SupportedDebugLevel) {
        console.log("Debug level: " + level);
        this.debugLevel = level;
    }

    public debugLog(level: SupportedDebugLevel, message: string) {
        let color: "text-danger" | "text-warning" | "text-white"; // red, dark yellow, dark grey
        switch (level) {
            case "verbose":
                if(this.debugLevel !== "verbose") {
                    return;
                }
                console.info(message);
                color = "text-white";
                break;
            case "warning":
                if(this.debugLevel === "error") {
                    return;
                } 
                console.warn(message);
                color = "text-warning";
                break;
            case "error":
                console.error(message);
                color = "text-danger";
                break;
        }
        if (isBrowser) {
            const p = document.createElement("p");
            p.textContent = message;
            p.classList.add(color);
            p.classList.add("px-3");
            p.classList.add("text-break");
            p.classList.add("mt-3");
            document.getElementById("execution-logs").append(p);
        }
    }
}