import { useRef, useEffect } from 'react';
import { platform, IOS } from '@vkontakte/vkui';
import { getClosestBody } from '../utils/dom';
import { forcePrevent, PARAM_ACTIVE } from '../utils/events';

const isIosDevice = platform() === IOS;
const bodies = new Map();

let documentListenerAdded = false;

export default function useLockBody(locked = true) {
  let element = useRef(document.body);

  useEffect(() => {
    const body = getClosestBody(element.current);
    if (!body) {
      return;
    }

    const bodyInfo = bodies.get(body);

    if (locked) {
      if (!bodyInfo) {
        bodies.set(body, { counter: 1, initialOverflow: body.style.overflow });
        if (isIosDevice) {
          if (!documentListenerAdded) {
            document.addEventListener('touchmove', forcePrevent, PARAM_ACTIVE);
            documentListenerAdded = true;
          }
        } else {
          body.style.overflow = 'hidden';
        }
      } else {
        bodies.set(body, { counter: bodyInfo.counter + 1, initialOverflow: bodyInfo.initialOverflow });
      }
    } else {
      if (bodyInfo) {
        if (bodyInfo.counter === 1) {
          bodies.delete(body);
          if (isIosDevice) {
            body.ontouchmove = null;

            if (documentListenerAdded) {
              document.removeEventListener('touchmove', forcePrevent, PARAM_ACTIVE);
              documentListenerAdded = false;
            }
          } else {
            body.style.overflow = bodyInfo.initialOverflow;
          }
        } else {
          bodies.set(body, { counter: bodyInfo.counter - 1, initialOverflow: bodyInfo.initialOverflow });
        }
      }
    }

    return () => {
      const bodyInfo = bodies.get(body);

      if (bodyInfo) {
        if (bodyInfo.counter === 1) {
          bodies.delete(body);

          document.removeEventListener('touchmove', forcePrevent, PARAM_ACTIVE);
          body.style.overflow = bodyInfo.initialOverflow;
        } else {
          bodies.set(body, { counter: bodyInfo.counter - 1, initialOverflow: bodyInfo.initialOverflow });
        }
      }
    };
  }, [locked, element]);
}
