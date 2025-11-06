let filterOptions = (data, valueKey, keyName) => {
  let selectData = [];
  for (let i = 0; i < data.length; i++) {
    let value = {
      value: data[i][valueKey],
      label: data[i][valueKey]?.replace(/^0+/, "") + " - " + data[i][keyName],
      message: data[i].MESSAGE,
    };
    selectData.push(value);
  }
  return selectData;
};

export default filterOptions;
