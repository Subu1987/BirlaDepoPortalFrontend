import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import http from "../services/apicall";
import apis from "../services/apis";
import store from "../store";

const useComp = () => {
  const [depot, setDepot] = useState([]);

  const cfa = useSelector((state) => state.Auth.cfa);

  useEffect(() => {
    const getComp = async () => {
      // if (localStorage.getItem("comp_code") !== null) {
      //   setDepot(JSON.parse(localStorage.getItem("comp_code")));
      // } else {
      store.dispatch({ type: "LOADING", payload: true });
      http
        .post(apis.COMMON_POST_WITH_TABLE_NAME, {
          TABLE: "COMPANY_CODE",
          params: {},
        })
        .then((res) => {
          if (res.data.code === 0) {
            setDepot(res.data.result);
            localStorage.setItem("comp_code", JSON.stringify(res.data.result));
          }
        })
        .catch((err) => {
          console.log(err);
          getComp();
        })
        .finally(() => {
          store.dispatch({ type: "LOADING", payload: false });
        });

      store.dispatch({ type: "LOADING", payload: false });
      // }
    };

    getComp();
  }, []);

  return depot;
};

export default useComp;
