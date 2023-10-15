import { AbstractExecutionSettingStrategy } from "../ExecutionSetting";

export class FileExecutionSettingStrategy extends AbstractExecutionSettingStrategy {
    constructor(){
        super();
        this.data.logglyApiKey = process.env.LOGGLY_API_KEY;
    }

    public async promptDataFromUser() {
        throw new Error("Method not implemented.");
    }
}