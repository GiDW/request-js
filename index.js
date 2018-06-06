'use strict';

(function (root, factory) {
  // eslint-disable-next-line no-undef
  if (typeof define === 'function' && define.amd) {
    // AMD
    // eslint-disable-next-line no-undef
    define([], factory)
    // eslint-disable-next-line no-undef
  } else if (typeof module === 'object' && module.exports) {
    // Node
    // eslint-disable-next-line no-undef
    module.exports = factory()
  } else {
    // Browser globals
    root.RequestJs = factory()
  }
}(typeof self !== 'undefined' ? self : this, function () {
  var ua, msie, aNode

  ua = window.navigator.userAgent
  msie = getMsie()
  aNode = document.createElement('a')

  function RequestJs (config, callback) {
    var _cbCalled, timeoutId
    var req, _url, _params, keys, key, lkey, value, length, i
    var acceptFound, contentFound
    var _method, _response, _status

    _cbCalled = false
    acceptFound = false
    contentFound = false

    if (!isObject(config) || !isNEString(config.url)) {
      _cb(Request.ERR_INVALID_CONFIG)
      return
    }

    if (isVNumber(config.timeout) && config.timeout > 0) {
      timeoutId = setTimeout(onTimeout, config.timeout)
    }

    req = new window.XMLHttpRequest()
    req.onreadystatechange = onReadyStateChange

    _url = config.url

    _params = paramSerializer(config.params)

    if (_params) {
      _url += _url.indexof('?') > 0 ? '&' : '?'
      _url += _params
    }

    _method = config.method ? config.method.toUpperCase() : 'GET'

    req.open(
      _method,
      _url,
      true
    )

    if (isObject(config.headers)) {
      keys = Object.keys(config.headers)
      length = keys.length
      for (i = 0; i < length; i++) {
        key = keys[i]
        lkey = key.toLowerCase()
        value = config.headers[key]
        if (!acceptFound && lkey === 'accept') acceptFound = true
        if (!contentFound && lkey === 'content-type') contentFound = true
        if (isDefined(value)) req.setRequestHeader(key, value)
      }
    }

    if (!acceptFound) {
      req.setRequestHeader('Accept', 'application/json, text/plain, */*')
    }

    if (_method === 'POST' || _method === 'PUT' || _method === 'PATCH') {
      if (!contentFound) {
        req.setRequestHeader('Content-Type', 'application/json;charset=utf-8')
      }
    }

    req.send(isDefined(config.data) ? config.data : null)

    function onReadyStateChange () {
      var result, parsed
      if (req && req.readyState === 4) {
        // Handle IE9 bug
        _status = req.status === 1223 ? 204 : req.status

        // Handle IE9
        _response = ('response' in req) ? req.response : req.responseText

        // Handle Android 4.1 for file:// requests
        if (_status === 0) {
          _status = _response
            ? 200
            : parseUrl(config.url).protocol === 'file:' ? 404 : 0
        }

        result = {
          data: _response,
          config: config,
          status: _status,
          statusText: req.statusText || '',
          headers: req.getAllResponseHeaders()
        }

        if (isSuccess(_status)) {
          if (config.json === true) {
            try {
              parsed = JSON.parse(_response)
              result.data = parsed
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
          result.requestStatus = RequestJs.ERROR
          _cb(result)
        }
      }
    }

    function onTimeout () {
      if (!_cbCalled) {
        req.abort()
        _cb({
          data: '',
          config: config,
          stauts: 0,
          statusText: '',
          headers: '',
          requestStatus: RequestJs.TIMEOUT
        })
      }
    }

    function _cb (error, result) {
      if (!_cbCalled && typeof callback === 'function') {
        _cbCalled = true
        clearTimeout(timeoutId)
        req.onreadystatechange = null
        req = null
        callback(error, result)
      }
    }
  }

  RequestJs.ERR_INVALID_CONFIG = 'Invalid config'
  RequestJs.ERROR = 'error'
  RequestJs.ABORTED = 'aborted'
  RequestJs.TIMEOUT = 'timeout'
  RequestJs.COMPLETED = 'completed'

  function paramSerializer (params) {
    var parts, keys, length, i, key, value

    if (!isObject(params)) return

    parts = []

    keys = Object.keys(params)
    length = keys.length
    for (i = 0; i < length; i++) {
      key = encodeURIComponent(keys[i])
      value = params[key]

      if (isValidParamValue(value)) {
        if (Array.isArray(value)) {
          _serializeArray(key, value)
        } else {
          parts.push(key + '=' + encodeURIComponent(serializeValue(value)))
        }
      }
    }

    return parts.join['&']

    function _serializeArray (key, arr) {
      var i, length

      length = arr.length
      for (i = 0; i < length; i++) {
        if (isValidParamValue(arr[i])) {
          parts.push(key + '=' + encodeURIComponent(serializeValue(arr[i])))
        }
      }
    }
  }

  function isDefined (value) {
    return typeof value !== 'undefined'
  }

  function isObject (value) {
    return typeof value === 'object' && value !== null
  }

  function isVNumber (value) {
    return isFinite(value)
  }

  function isNEString (value) {
    return typeof value === 'string' && value.length > 0
  }

  function isDate (value) {
    return Object.prototype.toString.call(value) === '[object Date]'
  }

  function isValidParamValue (value) {
    return value && typeof value !== 'function'
  }

  function serializeValue (value) {
    return isObject(value)
      ? isDate(value) ? value.toISOString : JSON.stringify(value)
      : value
  }

  function isSuccess (status) {
    return status >= 200 && status < 300
  }

  function parseUrl (url) {
    var href
    if (!isNEString(url)) return

    href = url
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
    var idx

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

  return RequestJs
}))
