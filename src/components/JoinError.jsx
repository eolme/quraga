import React from 'react';
import { Group, Header, Cell } from '@vkontakte/vkui';

const JoinError = () => {
  return (
    <Group header={<Header mode="secondary">Что-то пошло не так</Header>}>
      <Cell multiline={true}>
        По отсканированному коду нельзя подключиться к игре.
      </Cell>
    </Group>
  );
};

export default JoinError;
