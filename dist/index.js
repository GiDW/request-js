!function(t,e){"object"==typeof exports&&"undefined"!=typeof module?module.exports=e():"function"==typeof define&&define.amd?define(e):(t=t||self).RequestJs=e()}(this,function(){"use strict";var x="accept",S="content-type",e=window.navigator.userAgent,q=function(){var t;if(0<(t=e.indexOf("MSIE ")))return parseInt(e.substring(t+5,e.indexOf(".",t)),10);if(0<(t=e.indexOf("Trident/")))return t=e.indexOf("rv:"),parseInt(e.substring(t+3,e.indexOf(".",t)),10);return 0}(),j=document.createElement("a");function C(t,r){var n,o,s=!1,a=0,u=!1,e=!1,i=!1,f=null,c={abort:b},d=w(t)?{url:t}:I(t)&&w(t.url)?t:null;if(!d)return E({data:"",config:{url:""},status:0,statusText:"Invalid config",headers:"",requestStatus:C.ERROR}),c;var l=d,p=l.url;"number"==typeof l.timeout&&0<l.timeout&&(a=setTimeout(function(){s||(u=!0,f&&f.abort(),E({data:"",config:l,status:0,statusText:"",headers:"",requestStatus:C.TIMEOUT}))},l.timeout)),(f=new window.XMLHttpRequest).onreadystatechange=function(){if(f&&4===f.readyState){n=1223===f.status?204:f.status,o="response"in f?f.response:f.responseText,0===n&&(n=o?200:"file:"===function(t){var e=t;q&&(j.setAttribute("href",e),e=j.href);return j.setAttribute("href",e),{href:j.href,protocol:j.protocol,host:j.host,search:j.search,hash:j.hash,hostname:j.hostname,port:j.port,pathname:j.pathname}}(l.url).protocol?404:0);var e={data:o,config:l,status:n,statusText:f.statusText||"",headers:f.getAllResponseHeaders(),requestStatus:""};if(200<=n&&n<300)if(!0===l.json&&w(o))try{e.data=JSON.parse(o),e.requestStatus=C.COMPLETED,E(null,e)}catch(t){e.requestStatus=C.ERROR,E(e)}else e.requestStatus=C.COMPLETED,E(null,e);else e.requestStatus=u?C.TIMEOUT:C.ERROR,E(e)}};var h=function(t){if(!I(t))return"";for(var e=[],r=Object.keys(t),n=r.length,o=0;o<n;o++){var s=encodeURIComponent(r[o]),a=t[s];"function"!=typeof a&&(Array.isArray(a)?U(e,s,a):e.push(s+"="+encodeURIComponent(M(a))))}return e.join("&")}(l.params);h&&(p+=0<p.indexOf("?")?"&":"?",p+=h);var m=l.method?l.method.toUpperCase():"GET";if(f.open(m,p,!0),I(l.headers))for(var O=Object.keys(l.headers),v=O.length,g=0;g<v;g++){var y=O[g],R=y.toLowerCase(),T=""+l.headers[y];e||R!==x||(e=!0),i||R!==S||(i=!0),void 0!==T&&f.setRequestHeader(y,T)}return e||f.setRequestHeader(x,"application/json, text/plain, */*"),"POST"!==m&&"PUT"!==m&&"PATCH"!==m||i||f.setRequestHeader(S,"application/json;charset=utf-8"),f.send(void 0!==l.data?l.data:null),{abort:b};function b(){f&&f.abort()}function E(t,e){s||(s=!0,clearTimeout(a),function(){f&&(f.onreadystatechange=null);f=null}(),"function"==typeof r&&r(t,e))}}function I(t){return"object"==typeof t&&null!==t}function w(t){return"string"==typeof t&&0<t.length}function M(t){return I(t)?"[object Date]"===Object.prototype.toString.call(t)?t.toISOString():JSON.stringify(t):t}function i(t,e,r){e&&(t[e]=t[e]?t[e]+", "+r:r)}function U(t,e,r){for(var n=r.length,o=0;o<n;o++){var s=r[o];"function"!=typeof s&&t.push(e+"="+encodeURIComponent(M(s)))}}return C.parseHeaders=function(t){var e={};if(w(t))for(var r=(s=t.trim().split("\n")).length,n=0;n<r;n++){var o=(u=s[n]).indexOf(":");i(e,u.substr(0,o).trim().toLowerCase(),u.substr(o+1).trim())}else if(I(t)){var s,a=(s=Object.keys(t)).length;for(n=0;n<a;n++){var u;i(e,(u=s[n]).toLowerCase(),t[u].trim())}}return e},C.ERROR="error",C.TIMEOUT="timeout",C.COMPLETED="completed",C});