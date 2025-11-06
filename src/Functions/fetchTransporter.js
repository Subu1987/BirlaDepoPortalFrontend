import http from "../services/apicall";
import apis from "../services/apis";
import filterOptions from "./filterData";
let timeout;
const fetchTransporter = async (input, value, keyName) => {
  //   clearTimeout(timeout);
  //   timeout = setTimeout(() => {
  if (value !== "") {
    return http
      .post(apis.GET_TRANSPORTERS, {
        search_key: input,
      })
      .then((res) => {
        if (res.data.status) {
          return filterOptions(res.data.result, value, keyName);
        }
      })
      .catch((e) => fetchTransporter(input, value, keyName));
  }
  //   }, 1000);
};

export default fetchTransporter;
