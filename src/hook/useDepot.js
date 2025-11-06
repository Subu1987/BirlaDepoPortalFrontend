import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import http from "../services/apicall";
import apis from "../services/apis";
import store from "../store";

const useDepot = () => {
  const [depot, setDepot] = useState([]);

  const cfa = useSelector((state) => state.Auth.cfa);

  useEffect(() => {
    const getDepot = async () => {
      // if (localStorage.getItem("allDepot") !== null) {
      //   setDepot(JSON.parse(localStorage.getItem("allDepot")));
      // } else {
      store.dispatch({ type: "LOADING", payload: true });
      http
        .post(apis.COMMON_POST_WITH_FM_NAME, {
          fm_name: "ZRFC_GET_PLANTS",
          params: {},
        })
        .then((res) => {
          if (res.data.code === 0) {
            setDepot(res.data.result.IT_PLANT);
            localStorage.setItem(
              "allDepot",
              JSON.stringify(res.data.result.IT_PLANT)
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
    };
    // };

    getDepot();
  }, []);

  return depot;
};

export default useDepot;
