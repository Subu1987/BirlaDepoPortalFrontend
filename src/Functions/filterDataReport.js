let filterDataReport = (data, valueKey, keyName) => {
  let selectData = [];
  for (let i = 0; i < data.length; i++) {
    let value = {
      value: data[i][valueKey],
      desc: data[i][keyName],
      label: data[i][valueKey]?.replace(/^0+/, "") + " - " + data[i][keyName],
    };
    selectData.push(value);
  }
  return selectData;
};

export default filterDataReport;
