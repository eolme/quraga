export const parseQuery = (query) => {
  return query.slice(1).split('&').reduce((model, param) => {
    const [key, value] = param.split('=');
    model[key] = value;
    return model;
  }, {});
};
