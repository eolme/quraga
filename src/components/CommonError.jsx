import React from 'react';
import { Group, Header, Cell } from '@vkontakte/vkui';
import Button from '../components/Button';

import { APP_SUPPORT } from '../utils/constants';

const CommonError = () => {
  return (
    <Group header={<Header mode="secondary">Что-то пошло не так</Header>}>
      <Cell multiline={true}>
        Произошла неизвестная ошибка.
      </Cell>
      <Cell>
        <Button href={APP_SUPPORT} target="_blank" className="Button--blue">Написать в поддержку</Button>
      </Cell>
    </Group>
  );
};

export default CommonError;
