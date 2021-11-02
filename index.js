/* eslint-env browser */
/* global module */
(function (root) {
  var H_ACCEPT, H_CONTENT_TYPE, msie, aNode

  H_ACCEPT = 'accept'
  H_CONTENT_TYPE = 'content-type'

  msie = getMsie()

  function RequestJs (config, callback) {
    var status, response, timeoutId, timedOut, acceptFound, contentFound
    var req, result, configOrNull, _config, url, params, method
    var keys, length, i, key, lkey, value
    var cbCalled

    cbCalled = false
    timeoutId = 0
    timedOut = false
    acceptFound = false
    contentFound = false

    req = null

    result = {
      abort: abort
    }

    configOrNull = isNEString(config)
      ? {
          url: config
        }
      : (config && isNEString(config.url))
          ? config
          : null

    if (!configOrNull) {
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

    _config = configOrNull

    url = _config.url

    if (typeof _config.timeout === 'number' && _config.timeout > 0) {
      timeoutId = setTimeout(onTimeout, _config.timeout)
    }

    req = new XMLHttpRequest()
    req.onreadystatechange = onReadyStateChange

    params = paramSerializer(_config.params)

    if (params) {
      url += url.indexOf('?') > 0 ? '&' : '?'
      url += params
    }

    method = _config.method ? _config.method.toUpperCase() : 'GET'

    req.open(
      method,
      url,
      true
    )

    if (isObject(_config.headers)) {
      keys = Object.keys(_config.headers)
      length = keys.length
      for (i = 0; i < length; i++) {
        key = keys[i]
        lkey = key.toLowerCase()
        value = '' + _config.headers[key]
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

    function abort () {
      if (req) req.abort()
    }

    function onReadyStateChange () {
      var result

      if (req && req.readyState === 4) {
        // Handle IE9 bug
        status = req.status === 1223 ? 204 : req.status

        // Handle IE9
        response = ('response' in req)
          ? req.response
          : req.responseText

        // Handle Android 4.1 for file:// requests
        if (status === 0) {
          status = response
            ? 200
            : parseUrl(_config.url).protocol === 'file:' ? 404 : 0
        }

        result = {
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

    function onTimeout () {
      if (!cbCalled) {
        timedOut = true
        if (req) req.abort()
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

    function cb (error, result) {
      if (!cbCalled) {
        cbCalled = true
        clearTimeout(timeoutId)
        clear()
        if (isFunction(callback)) callback(error, result)
      }
    }

    function clear () {
      if (req) req.onreadystatechange = null
      req = null
    }
  }

  RequestJs.parseHeaders = function (headers) {
    var parsed, parts, length, i, line, idx

    parsed = {}

    if (isNEString(headers)) {
      parts = headers.trim().split('\n')
      length = parts.length
      for (i = 0; i < length; i++) {
        line = parts[i]
        idx = line.indexOf(':')
        addHeader(
          parsed,
          line.substr(0, idx).trim().toLowerCase(),
          line.substr(idx + 1).trim()
        )
      }
    } else if (isObject(headers)) {
      parts = Object.keys(headers)
      length = parts.length
      for (i = 0; i < length; i++) {
        line = parts[i]
        addHeader(parsed, line.toLowerCase(), headers[line].trim())
      }
    }

    return parsed
  }

  RequestJs.ERROR = 'error'
  RequestJs.TIMEOUT = 'timeout'
  RequestJs.COMPLETED = 'completed'

  if (typeof module === 'object' && module.exports) {
    // Node. Does not work with strict CommonJS, but
    // only CommonJS-like environments that support module.exports,
    // like Node.
    module.exports = RequestJs
  } else {
    // Browser globals (root is window)
    root.RequestJs = RequestJs
  }

  function isObject (value) {
    return typeof value === 'object' && value !== null
  }

  function isNEString (value) {
    return typeof value === 'string' && value.length > 0
  }

  function isFunction (value) {
    return typeof value === 'function'
  }

  function serializeValue (value) {
    return isObject(value)
      ? Object.prototype.toString.call(value) === '[object Date]'
        ? value.toISOString()
        : JSON.stringify(value)
      : value
  }

  function addHeader (obj, key, value) {
    if (key) {
      obj[key] = obj[key] ? obj[key] + ', ' + value : value
    }
  }

  function paramSerializer (params) {
    var parts, keys, length, i, key, value

    if (!isObject(params)) return ''

    parts = []

    keys = Object.keys(params)
    length = keys.length
    for (i = 0; i < length; i++) {
      key = encodeURIComponent(keys[i])
      value = params[key]

      if (!isFunction(value)) {
        if (Array.isArray(value)) {
          serializeArray(parts, key, value)
        } else {
          parts.push(key + '=' + encodeURIComponent(serializeValue(value)))
        }
      }
    }

    return parts.join('&')
  }

  function serializeArray (parts, key, arr) {
    var length, i, item

    length = arr.length
    for (i = 0; i < length; i++) {
      item = arr[i]
      if (!isFunction(item)) {
        parts.push(key + '=' + encodeURIComponent(serializeValue(item)))
      }
    }
  }

  function parseUrl (url) {
    var _url, href

    if (typeof URL === 'function') {
      _url = new URL(url)
    } else {
      if (!aNode) {
        if (
          typeof document === 'object' &&
          document &&
          typeof document.createElement === 'function'
        ) {
          aNode = document.createElement('a')
        }
      }

      href = url

      if (msie) {
        aNode.setAttribute('href', href)
        href = aNode.href
      }

      aNode.setAttribute('href', href)

      _url = aNode
    }

    return {
      href: _url.href,
      protocol: _url.protocol,
      host: _url.host,
      search: _url.search,
      hash: _url.hash,
      hostname: _url.hostname,
      port: _url.port,
      pathname: _url.pathname
    }
  }

  function getMsie () {
    var ua, idx

    if (typeof window === 'object' && window && window.navigator) {
      ua = window.navigator.userAgent

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
    }

    return 0
  }
}(typeof self !== 'undefined' ? self : this))
