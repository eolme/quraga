import { useState, useCallback, useEffect } from 'react';
import { swipe } from '../utils/events';
import useGlobal from '../hooks/use-global';
import useRouter from '../hooks/use-router';

export default function usePanels(initialActivePanel) {
  const global = useGlobal();
  const router = useRouter();
  const [activePanel, setActivePanel] = useState(initialActivePanel);
  const [history, setHistory] = useState([initialActivePanel]);

  const followActivePanel = useCallback((nextActivePanel, needFlush) => {
    window.requestAnimationFrame(() => {
      setActivePanel(() => {
        if (needFlush || nextActivePanel === initialActivePanel) {
          swipe.disable();
        } else {
          swipe.enable();
        }

        return nextActivePanel ?? initialActivePanel;
      });
    });
  }, [setActivePanel]);

  const goForward = useCallback((nextPanel) => {
    followActivePanel(nextPanel);
    setHistory(history => [...history, nextPanel]);
    router.push(nextPanel);
  }, [setHistory, followActivePanel]);

  const goBack = useCallback(() => router.back(), []);

  const back = useCallback(() => {
    setHistory(history => {
      const nextHistory = history.slice(0, history.length - 1);

      if (history.length === 1) {
        followActivePanel(nextHistory[0], true);

        return history;
      }

      const nextPanel = nextHistory[nextHistory.length - 1];
      followActivePanel(nextPanel);

      return nextHistory;
    });
  }, []);

  useEffect(() => {
    const followState = (name) => {
      if (name === 'modal' || name === 'popout' || name === null) {
        return;
      }
      back();
    };

    global.bus.on('router:popstate', followState);
    return () => {
      global.bus.detach('router:popstate', followState);
    };
  }, []);

  return {
    activePanel,
    setActivePanel: followActivePanel,
    history,
    setHistory,
    goForward,
    goBack
  };
}
