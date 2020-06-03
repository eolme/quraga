import React, { useState, useCallback } from 'react';
import { CSSTransition } from 'react-transition-group';
import useGlobal from '../hooks/use-global';
import { Tappable, usePlatform, ANDROID } from '@vkontakte/vkui';

import { APP_GROUP } from '../utils/constants';

const Subscribe = () => {
  const global = useGlobal();
  const platform = usePlatform();
  const [follower, setFollower] = useState(global.store.user?.is_follower || !global.bridge.supports('VKWebAppJoinGroup'));

  const follow = useCallback(() => {
    if (!follower) {
      global.bridge.send('VKWebAppJoinGroup', {
        'group_id': APP_GROUP
      }).then((data) => {
        global.store.user.is_follower = data && data.result;
        setFollower(global.store.user.is_follower);
      }).catch(() => {
        setFollower(false);
      });
    }
  }, [follower]);

  return (
    <CSSTransition in={Boolean(!follower)} appear={true} classNames="fade" timeout={platform === ANDROID ? 300 : 600}>
      {
        !follower ? (
          <Tappable className="Subscribe Subscribe-stub" onClick={follow}>
            <div className="Subscribe-in">
              <div className="Subscribe__caption">
                Подпишись на нас
              </div>
              <div className="Subscribe__content">
                Новости, конкурсы и единороги
              </div>
              <div className="Subscribe__badge">VK</div>
              <img
                src={require(/* webpackPreload: true */ '../assets/unicorn.png')}
                alt="Единорог"
                className="Subscribe__image"
              />
            </div>
          </Tappable>
        ) : (
          <div className="Subscribe-stub" />
        )
      }
    </CSSTransition>
  );
};

export default Subscribe;
