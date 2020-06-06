const mettEvents = new Map();
const onceEvents = new Map();

const mett = {
  on(eventName, callback) {
    const set = mettEvents.get(eventName);
    if (set) {
      set.add(callback);
    } else {
      mettEvents.set(eventName, new Set([callback]));
    }
  },
  once(eventName, callback) {
    const wrapper = (e, eventName) => {
      mett.detach(eventName, callback);
      callback(e, eventName);
    };
    onceEvents.set(callback, wrapper);
    const set = mettEvents.get(eventName);
    if (set) {
      set.add(wrapper);
    } else {
      mettEvents.set(eventName, new Set([wrapper]));
    }
  },
  detach(eventName, callback) {
    const once = onceEvents.get(callback);
    if (once) {
      onceEvents.delete(callback);
      callback = once;
    }
    const set = mettEvents.get(eventName);
    if (set) {
      set.delete(callback);
    }
  },
  emit(eventName, e) {
    const setName = mettEvents.get(eventName);
    if (setName) {
      setName.forEach((callback) => {
        callback(e, eventName);
      });
    }
  }
};

export default mett;
