import React, { useEffect, useState, useMemo } from 'react';
import { CSSTransition } from 'react-transition-group';
import useGlobal from '../hooks/use-global';
import { usePlatform, ANDROID } from '@vkontakte/vkui';

const Social = () => {
  const [friends, updateFriends] = useState(null);
  const global = useGlobal();
  const platform = usePlatform();

  useEffect(() => {
    const prettyUpdateFriends = () => {
      window.requestAnimationFrame(() => {
        updateFriends(global.store.user.friends);
      });
    };

    if (global.store.user && global.store.user.friends) {
      prettyUpdateFriends();
    } else {
      global.bus.once('app:auth', prettyUpdateFriends);
    }

    return () => {
      global.bus.detach('app:auth', prettyUpdateFriends);
    };
  }, []);

  const avatars = useMemo(() => {
    if (friends && friends.length) {
      return friends.slice(0, 3).map((friend) => {
        return (<img key={friend.id} src={friend.avatar} alt={friend.id} />);
      });
    } else {
      return [];
    }
  }, [friends]);

  return (
    <CSSTransition in={Boolean(friends)} appear={true} classNames="fade" timeout={platform === ANDROID ? 300 : 600}>
      {
        friends && friends.length ? (
          <div className="Social">
            <div className="Social-in">
              <div className="Social__caption">
                Твои друзья уже тут!
              </div>
              <div className="Social__content">
                {avatars}
              </div>
            </div>
          </div>
        ) : (
          <div className="Fact" />
        )
      }
    </CSSTransition>
  );
};

export default Social;
