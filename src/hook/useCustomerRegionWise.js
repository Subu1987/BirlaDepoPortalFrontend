// ZRFC_GET_PLANTS

import { useEffect, useState } from "react";

import http from "../services/apicall";
import apis from "../services/apis";
import store from "../store";

const useCustomer = ({ REGIO_FROM }) => {
  const [customer, setCustomer] = useState([]);

  useEffect(() => {
    if (REGIO_FROM) {
      const getCustomerRegionWise = async () => {
        store.dispatch({ type: "LOADING", payload: true });
        http
          .post(apis.COMMON_POST_WITH_FM_NAME, {
            fm_name: "ZRFC_CUSTOMER_LIST",
            params: {
              REGIO_FROM,
            },
          })
          .then((res) => {
            if (res.data.code === 0) {
              let data = res.data.result.IT_FINAL;
              setCustomer(data);
            }
          })
          .catch((err) => {
            getCustomerRegionWise();
          })
          .finally(() => {
            store.dispatch({ type: "LOADING", payload: false });
          });
      };

      getCustomerRegionWise();
    } else {
      console.log("No Region Selected");
    }
  }, [REGIO_FROM]);

  return customer;
};

export default useCustomer;
