let filterOptionsMaterial = (data, valueKey, keyName, UOM) => {
  let selectData = [];
  for (let i = 0; i < data.length; i++) {
    let value = {
      value: data[i][valueKey],
      label: data[i][valueKey]?.replace(/^0+/, "") + " - " + data[i][keyName],
      UOM: data[i][UOM],
    };
    selectData.push(value);
  }
  return selectData;
};

export default filterOptionsMaterial;
