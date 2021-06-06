import React, { useEffect, useState, useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import { CSSTransition } from 'react-transition-group';
import useGlobal from '../hooks/use-global';
import { Tappable, usePlatform, ANDROID } from '@vkontakte/vkui';
import { Photo } from './Photo';

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
        return (<Photo key={friend.id} src={friend.avatar} />);
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
          <div className="Social Social-stub">
            <Tappable className="Social-in" id="social" onClick={open}>
              <div className="Social__caption">
                Твои друзья уже тут!
              </div>
              <div className="Social__content">
                {avatars}
              </div>
            </Tappable>
          </div>
        ) : (
          <div className="Social-stub" />
        )
      }
    </CSSTransition>
  );
};

Social.propTypes = {
  callback: PropTypes.func.isRequired
};

export default Social;
