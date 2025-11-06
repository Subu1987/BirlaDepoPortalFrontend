import { useEffect, useState } from "react";
import store from "../store";
import Swal from "sweetalert2";
import http from "../services/apicall";
import apis from "../services/apis";
import { setLocalData } from "../services/localStorage";

const useDistChan = () => {
  const [allDistChan, setAllDistChan] = useState([]);

  useEffect(() => {
    let fetchDistChan = () => {
      if (localStorage.getItem("dist-chan") !== null) {
        setAllDistChan(JSON.parse(localStorage.getItem("dist-chan")));
      } else {
        let data = [{ DIST_CHANNEL: "TR", DIST_CHAN_DESC: "Trade" }];
        setAllDistChan(data);
        setLocalData("dist-chan", data);

        // store.dispatch({ type: "LOADING", payload: true });
        // http
        //   .post(apis.LE_REGISTER_FETCH_DISTRIBUTION_CHANNEL, {})
        //   .then((result) => {
        //     if (result.data.status) {
        //       setAllDistChan(result.data.data);
        //       localStorage.setItem("dist-chan", result.data.data);
        //     } else {
        //       let msg = result.data.msg;
        //       if (msg.toLowerCase().startsWith("server")) {
        //         return null;
        //       } else {
        //         Swal.fire({
        //           title: "Error!",
        //           text: result.data.msg,
        //           icon: "error",
        //           confirmButtonText: "Ok",
        //         });
        //       }
        //     }
        //   })
        //   .catch((err) => {
        //     console.log(err);
        //   })
        //   .finally(() => {
        //     store.dispatch({ type: "LOADING", payload: false });
        //   });
      }
    };
    fetchDistChan();
  }, []);

  return allDistChan;
};

export default useDistChan;
