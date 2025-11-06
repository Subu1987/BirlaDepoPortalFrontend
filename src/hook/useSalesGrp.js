import { useEffect, useState } from "react";
import store from "../store";
import Swal from "sweetalert2";
import http from "../services/apicall";
import apis from "../services/apis";
import { setLocalData } from "../services/localStorage";

const useSalesGrp = () => {
  const [allSalesGroup, setAllSalesgroup] = useState([]);

  useEffect(() => {
    let fetchSalesGroup = () => {
      if (localStorage.getItem("sales-group") !== null) {
        setAllSalesgroup(JSON.parse(localStorage.getItem("sales-group")));
      } else {
        store.dispatch({ type: "LOADING", payload: true });
        http
          .post(apis.REPORT_FETCH_SALES_GROUP, {
            IM_LOGIN_ID: localStorage.getItem("user_code"),
          })
          .then((result) => {
            if (result.data.status) {
              setAllSalesgroup(result.data.data);
              setLocalData("sales-group", result.data.data);
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

  return allSalesGroup;
};

export default useSalesGrp;
