import { useEffect, useState } from "react";

import http from "../services/apicall";
import apis from "../services/apis";
import store from "../store";
import removeDuplicatesByKey from "../components/utils/removeDuplicateByKey";

const usePlant = () => {
  const [plant, setPlant] = useState([]);

  useEffect(() => {
    const getPlant = async () => {
      if (localStorage.getItem("plants") !== null) {
        setPlant(JSON.parse(localStorage.getItem("plants")));
      } else {
        store.dispatch({ type: "LOADING", payload: true });
        // http
        //   .post(apis.COMMON_POST_WITH_FM_NAME, {
        //     fm_name: "ZFM_PLANT",
        //     params: {
        //       LV_USER: localStorage.getItem("user_code"),
        //     },
        //   })
        //   .then((res) => {
        //     if (res.data.code === 0) {
        //       let data = res.data.result.IT_FINAL;
        //       data = removeDuplicatesByKey(data, "WERKS");

        //       console.log(data);
        //       localStorage.setItem("plants", JSON.stringify(data));
        //       setPlant(data);
        //     }
        //   })
        //   .catch((err) => {
        //     console.log(err);
        //     getPlant();
        //   })
        //   .finally(() => {
        //     store.dispatch({ type: "LOADING", payload: false });
        //   });

        http
          .post("/rfc-reducer/get-user-plant", {
            LV_USER: localStorage.getItem("user_code"),
          })
          .then((res) => {
            if (res.data.status) {
              let data = res.data.data.IT_FINAL;
              data = removeDuplicatesByKey(data, "WERKS");

              console.log(data);
              localStorage.setItem("plants", JSON.stringify(data));
              setPlant(data);
            }
          })
          .catch((err) => {
            console.log(err);
            getPlant();
          })
          .finally(() => {
            store.dispatch({ type: "LOADING", payload: false });
          });
      }
    };

    getPlant();
  }, []);

  return plant;
};

export default usePlant;
