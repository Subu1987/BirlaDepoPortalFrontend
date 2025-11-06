const getLocalData = (key) => {
  let data = JSON.parse(localStorage.getItem(key));
  if (data) {
    return data;
  } else {
    return [];
  }
};

const setLocalData = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value));
};

export { getLocalData, setLocalData };
