export interface IRequestJsConfig {
    url: string;
    method?: string;
    params?: {
        [propName: string]: any;
    };
    headers?: {
        [propName: string]: string | number | boolean | null;
    };
    timeout?: number;
    data?: any;
    json?: boolean;
}
export interface IRequestJsCallback {
    (error: IRequestJsResultType | string | null, result?: IRequestJsResultType): void;
}
export interface IRequestJsResultType {
    data: string;
    config: IRequestJsConfig;
    status: number;
    statusText: string;
    headers: string;
    requestStatus: string;
}
export interface IRequestJsReturnType {
    abort: () => void;
}
declare function RequestJs(config: string | IRequestJsConfig, callback: IRequestJsCallback): {
    abort: () => void;
} | undefined;
declare namespace RequestJs {
    var parseHeaders: (headers: string | {
        [key: string]: any;
    }) => {};
    var ERR_INVALID_CONFIG: string;
    var ERROR: string;
    var ABORTED: string;
    var TIMEOUT: string;
    var COMPLETED: string;
}
export default RequestJs;
