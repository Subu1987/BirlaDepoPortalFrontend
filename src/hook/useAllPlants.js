// ZRFC_GET_PLANTS

import { useEffect, useState } from "react";

import http from "../services/apicall";
import apis from "../services/apis";
import store from "../store";

const useAllPlant = () => {
  const [plant, setPlant] = useState([]);

  useEffect(() => {
    const getAllPlant = async () => {
      if (localStorage.getItem("all-plants") !== null) {
        setPlant(JSON.parse(localStorage.getItem("all-plants")));
      } else {
        store.dispatch({ type: "LOADING", payload: true });
        http
          .post(apis.COMMON_POST_WITH_FM_NAME, {
            fm_name: "ZRFC_GET_PLANTS",
            params: {},
          })
          .then((res) => {
            if (res.data.code === 0) {
              let data = res.data.result.IT_PLANT;

              console.log(data);
              localStorage.setItem("all-plants", JSON.stringify(data));
              setPlant(data);
            }
          })
          .catch((err) => {
            getAllPlant();
          })
          .finally(() => {
            store.dispatch({ type: "LOADING", payload: false });
          });
      }
    };

    getAllPlant();
  }, []);

  return plant;
};

export default useAllPlant;
