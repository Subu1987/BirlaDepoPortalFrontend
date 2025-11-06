import http from "../../services/apicall";
import apis from "../../services/apis";

// Sleep function
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const SONewRFC = async (body) => {
  try {
    const res = await http.post(apis.COMMON_POST_WITH_FM_NAME, {
      fm_name: "ZSALES_ORDER_CREATE_N",
      params: body,
    });

    if (res.data.result.REQUEST_CONFIRM === "X") {
      await sleep(5000);
      return await fetchStatus();
    } else {
      return {
        SO_NUMBER: "",
        DATA: [
          {
            TYPE: "E",
            MESSAGE: "Request not submitted",
          },
        ],
      };
    }
  } catch {
    return await fetchStatus();
  }
};

let fetchStatus = async () => {
  try {
    while (true) {
      const data = await http.post(apis.COMMON_POST_WITH_FM_NAME, {
        fm_name: "ZSALES_ORDER_STATUS",
        params: { IM_GUID: localStorage.getItem("salesOrderUUID") },
      });

      let resData = data.data.result;

      if (resData?.EX_STATUS !== "P") {
        console.log(resData);
        return SOResMaker(resData);
      }

      await sleep(5000);
    }
  } catch (error) {
    await fetchStatus();
  } finally {
  }
};

const SOResMaker = (data) => {
  let res = [];

  Object.entries(data).forEach(([key, value]) => {
    if (key.includes("MESSAGE")) {
      if (value)
        res.push({
          TYPE: data.EX_STATUS,
          MESSAGE: value,
        });
    }
  });

  return { SO_NUMBER: data.EX_VBELN, DATA: res };
};

export default SONewRFC;
