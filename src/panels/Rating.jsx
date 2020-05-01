import React, { useEffect, useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { Panel, Div, Tabs, TabsItem, Gallery } from '@vkontakte/vkui';

import Header from '../components/Header';
import Button from '../components/Button';
import RatingTable from '../components/RatingTable';
import RatingRules from '../components/RatingRules';

import useGlobal from '../hooks/use-global';

const Rating = ({ id, callback }) => {
  const global = useGlobal();
  const [tab, setTab] = useState(0);

  useEffect(() => {
    global.store.modal = (<RatingRules />);
    global.bus.emit('modal:update');
  }, []);

  const tabOnClick = useCallback((index) => {
    window.requestAnimationFrame(() => {
      setTab(index);
    });
  }, []);

  const showModal = useCallback(() => {
    global.bus.emit('modal:show');
  }, []);

  return (
    <Panel id={id} separator={false} className="Panel--flex">
      <Header title="Рейтинг" onBack={callback}/>
      <Div>
        <h1 className="PanelTitle">ТОП-10 <Button className="PanelTitle--after" onClick={showModal}>Подробнее</Button></h1>
        <Tabs>
          <TabsItem
            onClick={tabOnClick.bind(null, 0)}
            selected={tab === 0}
          >
            Общий
          </TabsItem>
          <TabsItem
            onClick={tabOnClick.bind(null, 1)}
            selected={tab === 1}
          >
            Друзья
          </TabsItem>
        </Tabs>
        <Gallery
          slideWidth="100%"
          align="right"
          slideIndex={tab}
          onChange={tabOnClick}
        >
          <RatingTable mode="all" />
          <RatingTable mode="friends" />
        </Gallery>
      </Div>
    </Panel>
  );
};

Rating.propTypes = {
  id: PropTypes.string.isRequired,
  callback: PropTypes.func.isRequired
};

export default Rating;
