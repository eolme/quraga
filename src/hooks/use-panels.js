import { useState, useCallback, useEffect } from 'react';
import { swipe } from '../utils/events';

export default function usePanels(initialActivePanel) {
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

        return nextActivePanel;
      });
    });
  }, [setActivePanel]);

  const goForward = useCallback((e) => {
    if (!(e.currentTarget instanceof HTMLElement)) {
      return;
    }

    const nextPanel = e.currentTarget.dataset.to;
    followActivePanel(nextPanel);

    setHistory(history => [...history, nextPanel]);
    window.history.pushState({ panel: nextPanel }, nextPanel);
  }, [initialActivePanel]);

  const goBack = useCallback(() => window.history.back(), []);

  const back = useCallback(() => {
    setHistory(history => {
      if (history.length === 1) {
        followActivePanel(nextHistory[0], true);

        return history;
      }

      const nextHistory = [...history].slice(0, history.length - 1);
      const nextPanel = nextHistory[nextHistory.length - 1];
      followActivePanel(nextPanel);

      return nextHistory;
    });
  }, []);

  useEffect(() => {
    window.addEventListener('popstate', (e) => {
      e.preventDefault();
      back();
    });
  }, [back]);

  return {
    activePanel,
    setActivePanel: followActivePanel,
    history,
    setHistory,
    goForward,
    goBack
  };
}
