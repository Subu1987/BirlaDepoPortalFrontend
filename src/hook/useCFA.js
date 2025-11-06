import store from "../store";
import { useEffect, useState } from "react";
import http from "../services/apicall";
import apis from "../services/apis";

const useCFA = () => {
  const [cfa, setCFA] = useState(null);

  useEffect(() => {
    const getCFA = async () => {
      if (localStorage.getItem("allCFA") === null) {
        store.dispatch({ type: "LOADING", payload: true });
        http
          .post(apis.COMMON_POST_WITH_FM_NAME, {
            fm_name: "ZRFC_GET_CFA",
            params: {},
          })
          .then((res) => {
            if (res.data.code === 0) {
              setCFA(res.data.result.CFA_CODE);
              localStorage.setItem(
                "allCFA",
                JSON.stringify(res.data.result.CFA_CODE)
              );
            }
          })
          .catch((err) => {
            console.log(err);
          })
          .finally(() => {
            store.dispatch({ type: "LOADING", payload: false });
          });

        store.dispatch({ type: "LOADING", payload: false });
      } else {
        setCFA(JSON.parse(localStorage.getItem("allCFA")));
      }
    };
    getCFA();
  }, []);

  return cfa;
};

export default useCFA;
