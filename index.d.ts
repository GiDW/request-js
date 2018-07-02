export as namespace RequestJs;

export = RequestJs;

declare function RequestJs(
  config: RequestJs.RequestJsConfig,
  callback: RequestJs.RequestJsCallback
): RequestJs.RequestJsReturnType;

declare namespace RequestJs {
  export interface RequestJsConfig {
    url: string;
    method?: string;
    params?: {
      [propName: string]: any;
    },
    headers?: {
      [propName: string]: string;
    },
    timeout?: number;
    data?: any;
  }
  export interface RequestJsResultType {
    data: string;
    config: RequestJsConfig;
    status: number;
    statusTest: string;
    headers: string;
    requestStatus: string;
  }
  export interface RequestJsReturnType {
    abort: function;
  }
  export interface RequestJsCallback {
    (error: RequestJsResultType, result: RequestJsResultType): void;
  }
  export function get(
    url: string,
    callback: RequestJsCallback,
    config?: RequestJsConfig,
  ): RequestJsReturnType;
  export function post(
    url: string,
    data: any,
    callback: RequestJsCallback,
    config?: RequestJsConfig,
  ): RequestJsReturnType;
  export function parseHeaders (
    headers: string | object
  ): object
}
