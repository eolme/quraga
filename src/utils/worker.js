/* eslint-disable */
export default `!function(n){var e={};function t(r){if(e[r])return e[r].exports;var o=e[r]={i:r,l:!1,exports:{}};return n[r].call(o.exports,o,o.exports,t),o.l=!0,o.exports}t.m=n,t.c=e,t.d=function(n,e,r){t.o(n,e)||Object.defineProperty(n,e,{enumerable:!0,get:r})},t.r=function(n){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(n,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(n,"__esModule",{value:!0})},t.t=function(n,e){if(1&e&&(n=t(n)),8&e)return n;if(4&e&&"object"==typeof n&&n&&n.__esModule)return n;var r=Object.create(null);if(t.r(r),Object.defineProperty(r,"default",{enumerable:!0,value:n}),2&e&&"string"!=typeof n)for(var o in n)t.d(r,o,function(e){return n[e]}.bind(null,o));return r},t.n=function(n){var e=n&&n.__esModule?function(){return n.default}:function(){return n};return t.d(e,"a",e),e},t.o=function(n,e){return Object.prototype.hasOwnProperty.call(n,e)},t.p="",t(t.s=14)}([function(n,e,t){t.d(e,"a",(function(){return u})),t.d(e,"b",(function(){return i})),t.d(e,"c",(function(){return c})),t.d(e,"d",(function(){return d}));var r=new Map,o=new Map,u=function(n){var e=r.get(n);void 0!==e&&(clearTimeout(e),r.delete(n))},i=function(n){var e=o.get(n);void 0!==e&&(clearTimeout(e),o.delete(n))},f=function(n,e){var t,r;if("performance"in self){var o=performance.now();t=o,r=n-Math.max(0,o-e)}else t=Date.now(),r=n;return{expected:t+r,remainingDelay:r}},a=function n(e,t,r,o){var u="performance"in self?performance.now():Date.now();u>r?postMessage({id:null,method:"call",params:{timerId:t,timerType:o}}):e.set(t,setTimeout(n,r-u,e,t,r,o))},c=function(n,e,t){var o=f(n,t);r.set(e,setTimeout(a,o.remainingDelay,r,e,o.expected,"interval"))},d=function(n,e,t){var r=f(n,t);o.set(e,setTimeout(a,r.remainingDelay,o,e,r.expected,"timeout"))}},function(n,e,t){t.r(e);var r=t(2);for(var o in r)"default"!==o&&function(n){t.d(e,n,(function(){return r[n]}))}(o);var u=t(3);for(var o in u)"default"!==o&&function(n){t.d(e,n,(function(){return u[n]}))}(o);var i=t(4);for(var o in i)"default"!==o&&function(n){t.d(e,n,(function(){return i[n]}))}(o);var f=t(5);for(var o in f)"default"!==o&&function(n){t.d(e,n,(function(){return f[n]}))}(o);var a=t(6);for(var o in a)"default"!==o&&function(n){t.d(e,n,(function(){return a[n]}))}(o);var c=t(7);for(var o in c)"default"!==o&&function(n){t.d(e,n,(function(){return c[n]}))}(o);var d=t(8);for(var o in d)"default"!==o&&function(n){t.d(e,n,(function(){return d[n]}))}(o);var l=t(9);for(var o in l)"default"!==o&&function(n){t.d(e,n,(function(){return l[n]}))}(o)},function(n,e){},function(n,e){},function(n,e){},function(n,e){},function(n,e){},function(n,e){},function(n,e){},function(n,e){},function(n,e,t){t.r(e);var r=t(11);for(var o in r)"default"!==o&&function(n){t.d(e,n,(function(){return r[n]}))}(o);var u=t(12);for(var o in u)"default"!==o&&function(n){t.d(e,n,(function(){return u[n]}))}(o);var i=t(13);for(var o in i)"default"!==o&&function(n){t.d(e,n,(function(){return i[n]}))}(o)},function(n,e){},function(n,e){},function(n,e){},function(n,e,t){t.r(e);var r=t(0),o=t(1);for(var u in o)"default"!==u&&function(n){t.d(e,n,(function(){return o[n]}))}(u);var i=t(10);for(var u in i)"default"!==u&&function(n){t.d(e,n,(function(){return i[n]}))}(u);addEventListener("message",(function(n){var e=n.data;try{if("clear"===e.method){var t=e.id,o=e.params,u=o.timerId,i=o.timerType;if("interval"===i)Object(r.a)(u),postMessage({error:null,id:t});else{if("timeout"!==i)return;Object(r.b)(u),postMessage({error:null,id:t})}}else{if("set"!==e.method)return;var f=e.params,a=f.delay,c=f.now,d=f.timerId,l=f.timerType;if("interval"===l)Object(r.c)(a,d,c);else{if("timeout"!==l)return;Object(r.d)(a,d,c)}}}catch(n){postMessage({error:{message:n.message},id:e.id,result:null})}}))}])`;
