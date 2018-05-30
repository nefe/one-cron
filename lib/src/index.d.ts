/// <reference types="react" />
import * as React from "react";
import "./index.css";
import { AllCron } from "./cronUtils";
export declare class OneCronProps {
    cronExpression: string;
    onChange?: (cron: AllCron) => any;
}
export default class OneCron extends React.Component<OneCronProps, any> {
    render(): JSX.Element;
}
