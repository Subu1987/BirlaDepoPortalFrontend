import http from "../../services/apicall";
import apis from "../../services/apis";

const GSTCheck = async (KUNNR) => {
  try {
    const res = await http.post(apis.COMMON_POST_WITH_FM_NAME, {
      fm_name: "ZFM_SOLDTOPARTY_GST_CHK",
      params: {
        IM_KUNNR: KUNNR,
      },
    });
    console.log(res.data.result.GST_STATUS);
    if (res.data.result.GST_STATUS === "Not Found") {
      return false;
    } else {
      return true;
    }
  } catch (error) {
    GSTCheck(KUNNR);
  }
};

export default GSTCheck;
