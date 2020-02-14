export as namespace RequestJs

export = RequestJs

declare function RequestJs(
  config: RequestJs.RequestJsConfig | string,
  callback?: RequestJs.RequestJsCallback
): RequestJs.RequestJsReturnType | undefined

declare namespace RequestJs {
  export interface RequestJsConfig {
    url: string
    method?: string
    params?: {
      [propName: string]: string | number | boolean | null | undefined
    },
    headers?: {
      [propName: string]: string | number | boolean | null
    },
    timeout?: number
    data?: any
  }
  export interface RequestJsResultType {
    data: string
    config: RequestJsConfig
    status: number
    statusTest: string
    headers: string
    requestStatus: string
  }
  export interface RequestJsReturnType {
    abort: () => void
  }
  export interface RequestJsCallback {
    (error: RequestJsResultType | null, result?: RequestJsResultType): void
  }
  export function get(
    url: string,
    callback?: RequestJsCallback,
    config?: RequestJsConfig,
  ): RequestJsReturnType
  export function post(
    url: string,
    data: any,
    callback?: RequestJsCallback,
    config?: RequestJsConfig,
  ): RequestJsReturnType
  export function parseHeaders (
    headers: string | { [key: string]: any }
  ): { [key: string]: any }
}
