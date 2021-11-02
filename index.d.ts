export interface RequestJsConfig {
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
export interface RequestJsCallback {
    (error: RequestJsResult | null, result?: RequestJsResult): void;
}
export interface RequestJsResult {
    data: string;
    config: RequestJsConfig;
    status: number;
    statusText: string;
    headers: string;
    requestStatus: string;
}
export interface RequestJsRequest {
    abort: () => void;
}
declare function RequestJs(
  config: string | RequestJsConfig,
  callback: RequestJsCallback
): RequestJsRequest;
declare namespace RequestJs {
    var parseHeaders: (headers: string | {
        [key: string]: any;
    }) => {
        [key: string]: string;
    };
    var ERROR: string;
    var TIMEOUT: string;
    var COMPLETED: string;
}
export default RequestJs;
