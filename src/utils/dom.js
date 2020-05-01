export const getClosestBody = (el) => {
  if (!el) {
    return null;
  } else if (el.tagName === 'BODY') {
    return el;
  } else if (el.tagName === 'IFRAME') {
    const document = el.contentDocument;
    return document ? document.body : null;
  } else if (!el.offsetParent) {
    return null;
  }

  return getClosestBody(el.offsetParent);
};
