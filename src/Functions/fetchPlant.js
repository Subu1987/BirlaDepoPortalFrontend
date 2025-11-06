import http from "../services/apicall";
import apis from "../services/apis";
import filterOptions from "./filterData";

const fetchPlant = async (input, value, keyName) => {
  // if (getLocalData("plants")?.length>0) {
  //   return filterOptions(getLocalData("plants"));
  // } else {
  if (value !== "") {
    console.log("Called Plant Service");
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
          // setLocalData("plants", res.data.result.IT_FINAL);
          return filterOptions(res.data.result.IT_FINAL, value, keyName);
        }
      })
      .catch((e) => fetchPlant(input, value, keyName));
  }
  // }
};

export default fetchPlant;
