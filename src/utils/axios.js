import 'unfetch/polyfill';
import redaxios from 'redaxios';

const createURL = (path, base) => {
  path = path ? String(path) : '/';
  return base ? base + path : path;
};

const enchanceMethod = (method, defaults) => {
  return (url, data, config) => {
    if (!config) {
      data = data || {};
      config = data;
    }

    const parsedURL = createURL(url, config.baseURL || defaults.baseURL);

    return new Promise((resolve, reject) => {
      const parse = (result) => {
        try {
          result.data = JSON.parse(result.data);
        } catch {
          result.data = Object(result.data);
        }
        resolve(result);
      };

      const request = () => {
        return method(parsedURL, data, config).then(parse);
      };

      let promise = request();
      let count = 2;

      while (count > 0) {
        promise = promise.catch(request);
        --count;
      }

      promise.catch(reject);
    });
  };
};

const enchanceInstance = (instance, defaults) => {
  ['get', 'delete', 'options', 'post', 'put', 'patch'].forEach((method) => {
    instance[method] = enchanceMethod(instance[method], defaults);
  });
};

const create = redaxios.create.bind(redaxios);
redaxios.create = (config = {}) => {
  const instance = create(config);
  enchanceInstance(instance, config);
  return instance;
};

export default redaxios;
