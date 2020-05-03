export const interpretResponse = (response) => {
  while (response.data) {
    response = response.data;
  }
  return response;
};

export const shuffle = (arr) => {
  const array = Array.from(arr);
  let counter = array.length;
  let index;
  let temp;

  while (counter > 0) {
    index = Math.floor(Math.random() * counter);
    counter--;
    temp = array[counter];
    array[counter] = array[index];
    array[index] = temp;
  }

  return array;
};

export const declOfNum = (n, titles) => {
  return titles[(n % 10 === 1 && n % 100 !== 11) ? 0 : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20) ? 1 : 2];
};
