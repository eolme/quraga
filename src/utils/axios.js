const isAbsoluteURL = (url) => {
  return /^([a-z][a-z\d+\-.]*:)?\/\//i.test(url);
};

const combineURLs = (baseURL, relativeURL) => {
  return relativeURL ?
    baseURL.replace(/\/+$/, '') + '/' + relativeURL.replace(/^\/+/, '') :
    baseURL;
};

const buildFullPath = (baseURL, requestedURL = '') => {
  if (baseURL && !isAbsoluteURL(requestedURL)) {
    return combineURLs(baseURL, requestedURL);
  }
  return requestedURL;
};

const unaxios = (options) => {
  return new Promise((resolve, reject) => {
    const request = new XMLHttpRequest();
    request.responseType = 'json';
    request.open(options.method || 'get', buildFullPath(unaxios.defaults.baseURL, options.url), true);
    const abort = () => {
      const error = new Error('NetworkError');
      error.request = request;
      error.response = request.response;
      reject(error);
    };
    request.onload = () => {
      if (request.status >= 200 && request.status < 300) {
        resolve({
          data: request.response,
          status: request.status,
          request
        });
      } else {
        abort();
      }
    };
    request.onerror = abort;
    request.onabort = abort;
    request.ontimeout = abort;
    const headers = { ...unaxios.defaults.headers, ...options.headers };
    for (const i in headers) {
      request.setRequestHeader(i, headers[i]);
    }
    request.send(options.data || null);
  });
};

['get', 'post'].forEach((method) => {
  unaxios[method] = (url, data) => unaxios({ url, data: JSON.stringify(data), method });
});

unaxios.create = (config) => {
  unaxios.defaults = {
    ...unaxios.defaults,
    ...config
  };
  return unaxios;
};

export default unaxios;
