import React, { useEffect, useState, useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import { CSSTransition } from 'react-transition-group';
import useGlobal from '../hooks/use-global';
import { Tappable, usePlatform, ANDROID } from '@vkontakte/vkui';

const Social = ({ callback }) => {
  const [friends, updateFriends] = useState(null);
  const global = useGlobal();
  const platform = usePlatform();

  useEffect(() => {
    // history may be loaded or not (like side effect) so we need this check
    let safeToUpdate = true;

    const prettyUpdateFriends = () => {
      window.requestAnimationFrame(() => {
        if (safeToUpdate) {
          updateFriends(global.store.user.friends);
        }
      });
    };

    if (global.store.user && global.store.user.friends) {
      prettyUpdateFriends();
    } else {
      global.bus.on('app:auth', prettyUpdateFriends);
    }

    return () => {
      safeToUpdate = false;
      global.bus.detach('app:auth', prettyUpdateFriends);
    };
  }, []);

  const avatars = useMemo(() => {
    if (friends && friends.length) {
      return friends.slice(0, 3).map((friend) => {
        return (<img key={friend.id} src={friend.avatar} alt={friend.id} />);
      });
    } else {
      return null;
    }
  }, [friends]);

  const open = useCallback(() => {
    global.store.tab = 1;
    callback('rating');
  }, [callback]);

  return (
    <CSSTransition in={Boolean(friends)} appear={true} classNames="fade" timeout={platform === ANDROID ? 300 : 600}>
      {
        friends && friends.length ? (
          <Tappable className="Social" onClick={open}>
            <div className="Social-in">
              <div className="Social__caption">
                Твои друзья уже тут!
              </div>
              <div className="Social__content">
                {avatars}
              </div>
            </div>
          </Tappable>
        ) : (
          <div className="Social" />
        )
      }
    </CSSTransition>
  );
};

Social.propTypes = {
  callback: PropTypes.func.isRequired
};

export default Social;
