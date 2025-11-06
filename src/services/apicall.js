import axios from "axios";
import apis from "./apis";

import { Service } from "axios-middleware";
import removeLocalItem from "./removeLocalStorage";
import store from "../store";
import { logout } from "../actions/authAction";
import moment from "moment";
import logService from "./logService";

const service = new Service(axios);

service.register({
  onRequest(config) {
    const portal = config.baseURL;
    const page = window.location.pathname?.replace(/\d+/g, "ID_REMOVED");
    const end_point_name = config.url?.replace(/\d+/g, "ID_REMOVED");

    const postData = {
      date: moment().format("YYYY-MM-DD"),
      portal: portal,
      page: page,
      // calls_count: 1,
      end_point_name: end_point_name,
      external_or_rfc: "", // external or rfc
    };

    if (
      end_point_name.includes("rfc-reducer") ||
      end_point_name.includes("/login/") ||
      end_point_name.includes("incoterms") ||
      end_point_name.includes("from_table") ||
      end_point_name.includes("table_name") ||
      end_point_name.includes("/image/") ||
      end_point_name.includes("rake-data")
    ) {
      postData.external_or_rfc = "external";
    } else {
      postData.external_or_rfc = "rfc";
    }

    if (
      postData.end_point_name.includes("/update_so_requests_with_login_id") ||
      postData.end_point_name.includes("/image/") ||
      postData.end_point_name.includes("/login/")
    ) {
      console.log("Bypassing logService");
    } else {
      // logService(postData);
    }

    return config;
  },
  // onResponse(response) {
  //   let data = JSON.parse(response.data);
  //   if (
  //     data.code === 100 &&
  //     data.status === false &&
  //     data.message === "Auth failed"
  //   ) {
  //     console.log("Auth failed");
  //     localStorage.removeItem("Token");
  //     localStorage.removeItem("user_code");
  //     removeLocalItem();
  //     store.dispatch(logout());
  //   } else {
  //     console.log("Auth Success");
  //   }
  //   return response;
  // },
});

const http = axios.create({
  baseURL: apis.BASE,
});

export default http;
