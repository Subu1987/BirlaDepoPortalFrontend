import http from "../services/apicall";
import apis from "../services/apis";
import filterOptions from "./filterData";
let timeout;
const fetchCustomerNumber = async (input, value, keyName) => {
//   clearTimeout(timeout);
//   timeout = setTimeout(() => {
    if (value !== "") {
      return http
        .post(apis.COMMON_POST_WITH_FM_NAME, {
          fm_name: "ZFM_SOLDTOPARTY_TYPE",
          params: {
            IM_LOGIN_ID: localStorage.getItem("user_code"),
            IM_SEARCH: input,
          },
        })
        .then((res) => {
          if (res.data.status) {
            return filterOptions(res.data.result.IT_FINAL, value, keyName);
          }
        })
        .catch((e) => fetchCustomerNumber(input, value, keyName));
    }
//   }, 1000);
};

export default fetchCustomerNumber;
