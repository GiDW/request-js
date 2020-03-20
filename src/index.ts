export interface IRequestJsConfig {
  url: string
  method?: string
  params?: {
    [propName: string]: any
  },
  headers?: {
    [propName: string]: string | number | boolean | null
  },
  timeout?: number
  data?: any
  json?: boolean
}

export interface IRequestJsCallback {
  (
    error: IRequestJsResultType | string | null,
    result?: IRequestJsResultType
  ): void
}

export interface IRequestJsResultType {
  data: string
  config: IRequestJsConfig
  status: number
  statusText: string
  headers: string
  requestStatus: string
}

export interface IRequestJsReturnType {
  abort: () => void
}

const H_ACCEPT = 'accept'
const H_CONTENT_TYPE = 'content-type'

const ua = window.navigator.userAgent
const msie = getMsie()
const aNode = document.createElement('a')

export default function RequestJs (
  config: string | IRequestJsConfig,
  callback: IRequestJsCallback
) {
  let _status, _response
  let _timeoutId = 0
  let _cbCalled = false
  let _acceptFound = false
  let _contentFound = false
  let _timedOut = false

  const __config: IRequestJsConfig | null = isNEString(config)
    ? {
      url: config
    }
    : (isObject(config) && isNEString(config.url))
      ? config
      : null

  if (!__config) {
    _cb(RequestJs.ERR_INVALID_CONFIG)
    return
  }

  const _config: IRequestJsConfig = __config

  let _url = _config.url

  if (typeof _config.timeout === 'number' && _config.timeout > 0) {
    _timeoutId = setTimeout(_onTimeout, _config.timeout)
  }

  let req: XMLHttpRequest | null = new window.XMLHttpRequest()
  req.onreadystatechange = _onReadyStateChange

  const _params = paramSerializer(_config.params)

  if (_params) {
    _url += _url.indexOf('?') > 0 ? '&' : '?'
    _url += _params
  }

  const _method = _config.method ? _config.method.toUpperCase() : 'GET'

  req.open(
    _method,
    _url,
    true
  )

  if (isObject(_config.headers)) {
    const keys = Object.keys(_config.headers)
    const length = keys.length
    for (let i = 0; i < length; i++) {
      const key = keys[i]
      const lkey = key.toLowerCase()
      const value = '' + _config.headers[key]
      if (!_acceptFound && lkey === H_ACCEPT) _acceptFound = true
      if (!_contentFound && lkey === H_CONTENT_TYPE) _contentFound = true
      if (typeof value !== 'undefined') req.setRequestHeader(key, value)
    }
  }

  if (!_acceptFound) {
    req.setRequestHeader(H_ACCEPT, 'application/json, text/plain, */*')
  }

  if (_method === 'POST' || _method === 'PUT' || _method === 'PATCH') {
    if (!_contentFound) {
      req.setRequestHeader(H_CONTENT_TYPE, 'application/json;charset=utf-8')
    }
  }

  req.send(typeof _config.data !== 'undefined' ? _config.data : null)

  return {
    abort: _abort
  }

  function _abort () {
    if (req) req.abort()
  }

  function _onReadyStateChange () {
    if (req && req.readyState === 4) {
      // Handle IE9 bug
      _status = req.status === 1223 ? 204 : req.status

      // Handle IE9
      _response = ('response' in req)
        ? req.response
        : (req as any).responseText

      // Handle Android 4.1 for file:// requests
      if (_status === 0) {
        _status = _response
          ? 200
          : parseUrl(_config.url).protocol === 'file:' ? 404 : 0
      }

      const result: IRequestJsResultType = {
        data: _response,
        config: _config,
        status: _status,
        statusText: req.statusText || '',
        headers: req.getAllResponseHeaders(),
        requestStatus: ''
      }

      if (_status >= 200 && _status < 300) {
        if (_config.json === true && isNEString(_response)) {
          try {
            result.data = JSON.parse(_response)
            result.requestStatus = RequestJs.COMPLETED
            _cb(null, result)
          } catch (e) {
            result.requestStatus = RequestJs.ERROR
            _cb(result)
          }
        } else {
          result.requestStatus = RequestJs.COMPLETED
          _cb(null, result)
        }
      } else {
        result.requestStatus = _timedOut ? RequestJs.TIMEOUT : RequestJs.ERROR
        _cb(result)
      }
    }
  }

  function _onTimeout () {
    if (!_cbCalled) {
      _timedOut = true
      if (req) req.abort()
      _cb({
        data: '',
        config: _config,
        status: 0,
        statusText: '',
        headers: '',
        requestStatus: RequestJs.TIMEOUT
      })
    }
  }

  function _cb (
    error: null | string | IRequestJsResultType,
    result?: IRequestJsResultType
  ) {
    if (!_cbCalled) {
      _cbCalled = true
      clearTimeout(_timeoutId)
      _clear()
      if (typeof callback === 'function') callback(error, result)
    }
  }

  function _clear () {
    if (req) req.onreadystatechange = null
    req = null
  }
}

RequestJs.parseHeaders = function (headers: string | { [key: string]: any }) {
  const parsed = {}

  if (isNEString(headers)) {
    const parts = headers.trim().split('\n')
    const length = parts.length
    for (let i = 0; i < length; i++) {
      const line = parts[i]
      const idx = line.indexOf(':')
      _addHeader(
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
      _addHeader(parsed, line.toLowerCase(), headers[line].trim())
    }
  }

  return parsed
}

RequestJs.ERR_INVALID_CONFIG = 'Invalid config'
RequestJs.ERROR = 'error'
RequestJs.ABORTED = 'aborted'
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

function _addHeader (
  obj: { [key: string]: string },
  key: string,
  value: string
) {
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
        _serializeArray(parts, key, value)
      } else {
        parts.push(key + '=' + encodeURIComponent(serializeValue(value)))
      }
    }
  }

  return parts.join('&')
}

function _serializeArray (parts: string[], key: string, arr: string[]) {
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

function getMsie () {
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
