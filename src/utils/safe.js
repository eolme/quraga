import { AUX_EVENTS, DEV_EVENTS, PARAM_ACTIVE, forcePrevent } from './events';

if (process.env.NODE_ENV === 'production') {
  AUX_EVENTS.forEach((event) => {
    document.addEventListener(event, forcePrevent, PARAM_ACTIVE);
  });

  DEV_EVENTS.forEach((event) => {
    document.addEventListener(event, (event) => {
      if (event.keyCode === 123 || ((event.ctrlKey || event.shiftKey) && event.keyCode === 73)) {
        return forcePrevent(event);
      }
    }, PARAM_ACTIVE);
  });
}
