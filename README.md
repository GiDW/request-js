# RequestJs
HTTP request helper for the browser.

[![NPM version](https://img.shields.io/npm/v/@gidw/request-js.svg)](https://www.npmjs.com/package/@gidw/request-js)
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)
[![License](https://img.shields.io/github/license/GiDW/request-js.svg)](https://github.com/GiDW/request-js/blob/master/LICENSE)

## Usage

```js
var request = RequestJs(
    {
        url: 'https://api.example.com/resource'
    },
    function (error, result) {
        if (error) {
            console.log('REQUEST STATUS', error.requestStatus)
            console.log('STATUS CODE', error.status)
            console.log('STATUS TEXT', error.statusText)
            if (error.requestStatus === RequestJS.ERROR) {
                // ...
            } else if (error.requestStatus === RequestJS.TIMEOUT) {
                // ...
            }
        } else {
            console.log('DATA', result.data)
        }
    }
)

if (STOP_REQUEST) request.abort()
```

```js
RequestJs(
    {
        url: 'https://api.example.com/resource',
        method: 'POST',
        data: JSON.stringify({
            item: 23,
            content: 'abc'
        })
    }
)
```
