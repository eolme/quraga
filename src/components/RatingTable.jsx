import React, {useEffect, useMemo, useState} from 'react';
import PropTypes from 'prop-types';
import useGlobal from '../hooks/use-global';
import { interpretResponse } from '../utils/data';
import { Photo } from './Photo';

const RatingTable = ({ mode }) => {
  const global = useGlobal();
  const [rating, updateRating] = useState(null);
  const [modePlace, setModePlace] = useState(null);

  const me = global.store.user;

  useEffect(() => {
    global.axios.get(`/vk-user/rating?${mode}=1`).then((response) => {
      window.requestAnimationFrame(() => {
        updateRating(interpretResponse(response));
      });
    });

    if (mode === 'friends') {
      setModePlace(me.friend_place);
    } else {
      setModePlace(me.global_place);
    }
  }, [mode]);

  const selfPlace = useMemo(() => {
    return (
      <div className="Rating__item" key="self">
        <div className="Rating__item-place">{modePlace}</div>
        <a target="_blank" rel="noreferrer" href={`https://vk.com/id${me.vk_user_id}`} className="Rating__item-link">
          <Photo className="Rating__item-avatar" importance="low" src={me.avatar} />
        </a>
        <div className="Rating__item-caption">{me.first_name}</div>
        <div className="Rating__item-content">{me.rating}</div>
      </div>
    );
  }, [modePlace]);

  const list = useMemo(() => {
    if (rating) {
      return rating.map((item, index) => {
        return (
          <div className="Rating__item" key={item.id}>
            <div className="Rating__item-place">{index + 1}</div>
            <a target="_blank" rel="noreferrer" href={`https://vk.com/id${item.vk_user_id}`} className="Rating__item-link">
              <Photo className="Rating__item-avatar" importance="low" src={item.avatar} />
            </a>
            <div className="Rating__item-caption">{item.first_name}</div>
            <div className="Rating__item-content">{item.rating}</div>
          </div>
        );
      });
    }
    return null;
  }, [rating]);

  return (
    <div className="Rating">
      <div className="Rating-in">
        <div className="Rating__content">
          {list}
          {rating && modePlace > rating.length && selfPlace}
        </div>
      </div>
    </div>
  );
};

RatingTable.propTypes = {
  mode: PropTypes.oneOf(['all', 'friends'])
};

export default RatingTable;
