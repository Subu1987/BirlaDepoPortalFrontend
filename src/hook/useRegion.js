import store from "../store";
import { useEffect, useState } from "react";
import http from "../services/apicall";
import apis from "../services/apis";
import { useSelector } from "react-redux";

const useRegion = () => {
  const [region, setRegion] = useState([]);
  const cfa = useSelector((state) => state.Auth.cfa);
  const userDetails = useSelector((state) => state.Auth.userdetails);

  useEffect(() => {
    const getRegion = async () => {
      // if (localStorage.getItem("allRegion") === null) {
      // store.dispatch({ type: "LOADING", payload: true });
      if (userDetails.user_type === 1 || userDetails.user_type === 2) {
        store.dispatch({ type: "LOADING", payload: true });
        http
          .post(apis.COMMON_POST_WITH_TABLE_NAME, {
            TABLE: "REGION",
            params: {},
          })
          .then((res) => {
            if (res.data.code === 0) {
              setRegion(res.data.result);
              localStorage.setItem(
                "allRegion",
                JSON.stringify(res.data.result)
              );
            }
          })
          .catch((err) => {
            console.log(err);
            getRegion();
          })
          .finally(() => {
            store.dispatch({ type: "LOADING", payload: false });
          });
      } else {
        if (cfa.USER_CATEGORY === "CFA") {
          store.dispatch({ type: "LOADING", payload: true });
          http
            .post(apis.COMMON_POST_WITH_TABLE_NAME, {
              TABLE: "REGION",
              params: {},
            })
            .then((res) => {
              if (res.data.code === 0) {
                setRegion(res.data.result);
                localStorage.setItem(
                  "allRegion",
                  JSON.stringify(res.data.result)
                );
              }
            })
            .catch((err) => {
              console.log(err);
              getRegion();
            })
            .finally(() => {
              store.dispatch({ type: "LOADING", payload: false });
            });
        } else {
          store.dispatch({ type: "LOADING", payload: true });
          http
            .post(apis.COMMON_POST_WITH_FM_NAME, {
              fm_name: "ZRFC_GET_REGHEAD_DEPOT",
              params: {
                IM_USERID: localStorage.getItem("user_code"),
              },
            })
            .then((res) => {
              if (res.data.code === 0) {
                let region = res.data.result.IT_USER;
                // unique region
                region = region.map((item) => {
                  return {
                    ...item,
                    PLANT: item.DEPOT,
                    REGION: item.REGION,
                    PLANT_NAME: item.DEPOT_NAME,
                    REGION_DESC: item.REGIO_DESC,
                  };
                });

                setRegion(region);
                localStorage.setItem("allRegion", JSON.stringify(region));
              }
            })
            .catch((err) => {
              getRegion();
              console.log(err);
            })
            .finally(() => {
              store.dispatch({ type: "LOADING", payload: false });
            });
        }
      }
      // } else {
      //   setRegion(JSON.parse(localStorage.getItem("allRegion")));
      // }
    };
    getRegion();
  }, [cfa]);

  return region;
};

export default useRegion;
