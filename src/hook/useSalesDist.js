import { useEffect, useState } from "react";
import store from "../store";
import Swal from "sweetalert2";
import http from "../services/apicall";
import apis from "../services/apis";
import { setLocalData } from "../services/localStorage";

const useSalesDist = () => {
  const [allSalesDist, setAllSalesDist] = useState([]);

  useEffect(() => {
    let fetchSalesGroup = () => {
      if (localStorage.getItem("sales-district") !== null) {
        setAllSalesDist(JSON.parse(localStorage.getItem("sales-district")));
      } else {
        store.dispatch({ type: "LOADING", payload: true });
        http
          .post(apis.COMMON_POST_WITH_FM_NAME, {
            fm_name: "ZRFC_SALES_DISTRICT",
            params: {
              IM_LOGIN_ID: localStorage.getItem("user_code"),
            },
          })
          .then((result) => {
            if (result.data.status) {
              console.log(result);
              setAllSalesDist(result.data.result.EX_DISTRICT);
              setLocalData("sales-district", result.data.result.EX_DISTRICT);
            } else {
              let msg = result.data.msg;
              if (msg.toLowerCase().startsWith("server")) {
                return null;
              } else {
                Swal.fire({
                  title: "Error!",
                  text: result.data.msg,
                  icon: "error",
                  confirmButtonText: "Ok",
                });
              }
            }
          })
          .catch((err) => {
            console.log(err);
          })
          .finally(() => {
            store.dispatch({ type: "LOADING", payload: false });
          });
      }
    };
    fetchSalesGroup();
  }, []);

  return allSalesDist;
};

export default useSalesDist;
