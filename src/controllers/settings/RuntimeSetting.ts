import { AbstractExecutionSettingStrategy, ExecutionSetting } from "./ExecutionSetting";

export class RuntimeSetting {
    private static instance: RuntimeSetting;

    private setting: ExecutionSetting;

    public setRuntimeEnvironment(strategy: AbstractExecutionSettingStrategy) {
        this.setting = new ExecutionSetting(strategy);
    }

    public static getInstance() {
        if (this.instance == null) {
            this.instance = new RuntimeSetting();
        }
        return this.instance;
    }

    public getSettings() {
        return this.setting.getStrategy().getSettings();
    }

    public promptUserInputs() {
        return this.setting.getStrategy().promptDataFromUser();
    }
}