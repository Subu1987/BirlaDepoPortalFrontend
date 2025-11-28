import http from "../../services/apicall";
import apis from "../../services/apis";

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ⚡ Optimized timeout: 3 polls × 3 sec = 9 seconds total
const MAX_POLLS = 3;
const POLL_INTERVAL_MS = 3000;

// MAIN RFC CALL
const SONewRFC = async (body) => {
  try {
    const res = await http.post(apis.COMMON_POST_WITH_FM_NAME, {
      fm_name: "ZSALES_ORDER_CREATE_N",
      params: body,
    });

    console.log("[RFC_RAW_RESPONSE]", res.data.result);

    // Always poll status (SAP async behavior)
    return await fetchStatus();

  } catch (err) {
    console.log("[RFC_EXCEPTION] – fallback to poll");
    return await fetchStatus();
  }
};

// STATUS POLLING
let fetchStatus = async () => {
  try {
    let pollCount = 0;
    const guid = localStorage.getItem("salesOrderUUID");

    if (!guid) {
      console.warn("[STATUS_POLL] No GUID found, aborting");
      return makeFinalResponseError("Missing GUID. Order creation aborted.");
    }

    while (pollCount < MAX_POLLS) {
      const data = await http.post(apis.COMMON_POST_WITH_FM_NAME, {
        fm_name: "ZSALES_ORDER_STATUS",
        params: { IM_GUID: guid },
      });

      const resData = data?.data?.result || {};

      console.log("[STATUS_POLL]", pollCount + 1, "/", MAX_POLLS, resData);

      const status = resData.EX_STATUS || "";
      const vbeln = resData.EX_VBELN || "";

      // SUCCESS (Status S or VBELN returned)
      if (status === "S" || vbeln !== "") {
        return makeFinalResponse(resData);
      }

      // ERROR (Status E)
      if (status === "E") {
        return makeFinalResponse(resData);
      }

      // If blank or pending → continue polling
      pollCount++;
      await sleep(POLL_INTERVAL_MS);
    }

    // ❌ Timeout (no result even after 9 seconds)
    return makeFinalResponseError(
      "SAP did not return any final response. Please try again."
    );

  } catch (error) {
    console.log("[STATUS_POLL_ERROR] Retrying…");

    // Retry once, but do not loop infinitely
    return makeFinalResponseError(
      "Network or SAP timeout occurred. Please try again."
    );
  }
};

// FORMAT FINAL RESPONSE
const makeFinalResponse = (data) => {
  let list = [];

  Object.entries(data).forEach(([key, value]) => {
    if (key.includes("MESSAGE") && value) {
      list.push({
        TYPE: data.EX_STATUS || "E",
        MESSAGE: value,
      });
    }
  });

  if (!list.length && !data.EX_VBELN) {
    list.push({
      TYPE: "E",
      MESSAGE: "Order creation failed. No response received.",
    });
  }

  return {
    SO_NUMBER: data.EX_VBELN || "",
    DATA: list,
  };
};

// FORMAT ERROR RESPONSE
const makeFinalResponseError = (msg) => {
  return {
    SO_NUMBER: "",
    DATA: [
      {
        TYPE: "E",
        MESSAGE: msg,
      },
    ],
  };
};

export default SONewRFC;
