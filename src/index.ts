export interface RequestJsConfig {
  url: string
  method?: string
  params?: {
    [propName: string]: any
  }
  headers?: {
    [propName: string]: string | number | boolean | null
  }
  timeout?: number
  data?: any
  json?: boolean
}

export interface RequestJsCallback {
  (
    error: RequestJsResult | null,
    result?: RequestJsResult
  ): void
}

export interface RequestJsResult {
  data: string
  config: RequestJsConfig
  status: number
  statusText: string
  headers: string
  requestStatus: string
}

export interface RequestJsRequest {
  abort: () => void
}

const H_ACCEPT = 'accept'
const H_CONTENT_TYPE = 'content-type'

const ua = window.navigator.userAgent
const msie = getMsie()
const aNode = document.createElement('a')

export default function RequestJs (
  config: string | RequestJsConfig,
  callback: RequestJsCallback
): RequestJsRequest {
  let status, response
  let cbCalled = false
  let timeoutId = 0
  let timedOut = false
  let acceptFound = false
  let contentFound = false

  let req: XMLHttpRequest | null = null

  const result: RequestJsRequest = {
    abort: abort
  }

  const configOrNull: RequestJsConfig | null = isNEString(config)
    ? {
      url: config
    }
    : (isObject(config) && isNEString(config.url))
      ? config
      : null

  if (!configOrNull) {
    // eslint-disable-next-line standard/no-callback-literal
    cb({
      data: '',
      config: {
        url: ''
      },
      status: 0,
      statusText: 'Invalid config',
      headers: '',
      requestStatus: RequestJs.ERROR
    })
    return result
  }

  const _config: RequestJsConfig = configOrNull

  let url = _config.url

  if (typeof _config.timeout === 'number' && _config.timeout > 0) {
    timeoutId = setTimeout(onTimeout, _config.timeout)
  }

  req = new window.XMLHttpRequest()
  req.onreadystatechange = onReadyStateChange

  const params = paramSerializer(_config.params)

  if (params) {
    url += url.indexOf('?') > 0 ? '&' : '?'
    url += params
  }

  const method = _config.method ? _config.method.toUpperCase() : 'GET'

  req.open(
    method,
    url,
    true
  )

  if (isObject(_config.headers)) {
    const keys = Object.keys(_config.headers)
    const length = keys.length
    for (let i = 0; i < length; i++) {
      const key = keys[i]
      const lkey = key.toLowerCase()
      const value = '' + _config.headers[key]
      if (!acceptFound && lkey === H_ACCEPT) acceptFound = true
      if (!contentFound && lkey === H_CONTENT_TYPE) contentFound = true
      if (typeof value !== 'undefined') req.setRequestHeader(key, value)
    }
  }

  if (!acceptFound) {
    req.setRequestHeader(H_ACCEPT, 'application/json, text/plain, */*')
  }

  if (method === 'POST' || method === 'PUT' || method === 'PATCH') {
    if (!contentFound) {
      req.setRequestHeader(H_CONTENT_TYPE, 'application/json;charset=utf-8')
    }
  }

  req.send(typeof _config.data !== 'undefined' ? _config.data : null)

  return {
    abort: abort
  }

  function abort (): void {
    if (req) req.abort()
  }

  function onReadyStateChange (): void {
    if (req && req.readyState === 4) {
      // Handle IE9 bug
      status = req.status === 1223 ? 204 : req.status

      // Handle IE9
      response = ('response' in req)
        ? req.response
        : (req as any).responseText

      // Handle Android 4.1 for file:// requests
      if (status === 0) {
        status = response
          ? 200
          : parseUrl(_config.url).protocol === 'file:' ? 404 : 0
      }

      const result: RequestJsResult = {
        data: response,
        config: _config,
        status: status,
        statusText: req.statusText || '',
        headers: req.getAllResponseHeaders(),
        requestStatus: ''
      }

      if (status >= 200 && status < 300) {
        if (_config.json === true && isNEString(response)) {
          try {
            result.data = JSON.parse(response)
            result.requestStatus = RequestJs.COMPLETED
            cb(null, result)
          } catch (e) {
            result.requestStatus = RequestJs.ERROR
            cb(result)
          }
        } else {
          result.requestStatus = RequestJs.COMPLETED
          cb(null, result)
        }
      } else {
        result.requestStatus = timedOut ? RequestJs.TIMEOUT : RequestJs.ERROR
        cb(result)
      }
    }
  }

  function onTimeout (): void {
    if (!cbCalled) {
      timedOut = true
      if (req) req.abort()
      // eslint-disable-next-line standard/no-callback-literal
      cb({
        data: '',
        config: _config,
        status: 0,
        statusText: '',
        headers: '',
        requestStatus: RequestJs.TIMEOUT
      })
    }
  }

  function cb (
    error: null | RequestJsResult,
    result?: RequestJsResult
  ): void {
    if (!cbCalled) {
      cbCalled = true
      clearTimeout(timeoutId)
      clear()
      if (typeof callback === 'function') callback(error, result)
    }
  }

  function clear (): void {
    if (req) req.onreadystatechange = null
    req = null
  }
}

RequestJs.parseHeaders = function (
  headers: string | { [key: string]: any }
): { [key: string]: string } {
  const parsed = {}

  if (isNEString(headers)) {
    const parts = headers.trim().split('\n')
    const length = parts.length
    for (let i = 0; i < length; i++) {
      const line = parts[i]
      const idx = line.indexOf(':')
      addHeader(
        parsed,
        line.substr(0, idx).trim().toLowerCase(),
        line.substr(idx + 1).trim()
      )
    }
  } else if (isObject(headers)) {
    const parts = Object.keys(headers)
    const length = parts.length
    for (let i = 0; i < length; i++) {
      const line = parts[i]
      addHeader(parsed, line.toLowerCase(), headers[line].trim())
    }
  }

  return parsed
}

RequestJs.ERROR = 'error'
RequestJs.TIMEOUT = 'timeout'
RequestJs.COMPLETED = 'completed'

function isObject (value: any): value is { [key: string]: any } {
  return typeof value === 'object' && value !== null
}

function isNEString (value: any): value is string {
  return typeof value === 'string' && value.length > 0
}

function serializeValue (value: any) {
  return isObject(value)
    ? Object.prototype.toString.call(value) === '[object Date]'
      ? value.toISOString()
      : JSON.stringify(value)
    : value
}

function addHeader (
  obj: { [key: string]: string },
  key: string,
  value: string
): void {
  if (key) {
    obj[key] = obj[key] ? obj[key] + ', ' + value : value
  }
}

function paramSerializer (params?: { [key: string]: any }): string {
  if (!isObject(params)) return ''

  const parts = []

  const keys = Object.keys(params)
  const length = keys.length
  for (let i = 0; i < length; i++) {
    const key = encodeURIComponent(keys[i])
    const value = params[key]

    if (typeof value !== 'function') {
      if (Array.isArray(value)) {
        serializeArray(parts, key, value)
      } else {
        parts.push(key + '=' + encodeURIComponent(serializeValue(value)))
      }
    }
  }

  return parts.join('&')
}

function serializeArray (parts: string[], key: string, arr: string[]) {
  const length = arr.length
  for (let i = 0; i < length; i++) {
    const item = arr[i]
    if (typeof item !== 'function') {
      parts.push(key + '=' + encodeURIComponent(serializeValue(item)))
    }
  }
}

function parseUrl (url: string) {
  let href = url

  if (msie) {
    aNode.setAttribute('href', href)
    href = aNode.href
  }

  aNode.setAttribute('href', href)

  return {
    href: aNode.href,
    protocol: aNode.protocol,
    host: aNode.host,
    search: aNode.search,
    hash: aNode.hash,
    hostname: aNode.hostname,
    port: aNode.port,
    pathname: aNode.pathname
  }
}

function getMsie (): number {
  let idx

  // IE 10 or older
  idx = ua.indexOf('MSIE ')
  if (idx > 0) {
    return parseInt(ua.substring(idx + 5, ua.indexOf('.', idx)), 10)
  }

  // IE 11
  idx = ua.indexOf('Trident/')
  if (idx > 0) {
    idx = ua.indexOf('rv:')
    return parseInt(ua.substring(idx + 3, ua.indexOf('.', idx)), 10)
  }

  return 0
}
