import moment from "moment";

export const getUrlParams = (view) => {
  const query = new URLSearchParams(window.location.search);
  const params = query.get(view);
  if (params) {
    return params;
  } else {
    return params;
  }
};

export const removeZero = (value) => {
  if (value) {
    return value.replace(/^0+/, "");
  }
  return value;
};

export const globalDate = (date) => {
  if (!date) {
    return "NA";
  }
  console.log(date);
  return moment(date, "YYYYMMDD").format("DD/MM/YYYY");
};

export const approvedStatus = (data) => {
  if (data.APPROVED_SA) {
    return "Approved by SA";
  }

  if (data.APPROVED_LG) {
    return "Approved by LG";
  }
  if (data.APPROVED_BH) return "Approved by BH";

  if (data.APPROVED_CS) return "Approved by CS";
};

export const mergeDamageData = (data, RR_QTY) => {
  let mergeData = {
    CUT_TORN: 0,
    WATER_DMG: 0,
    HANDING_DMG: 0,
    BRUST_BAG: 0,
    NEW_BURST: 0,
    TOTAL_DMG: 0,
    CUT_TORN_PER: 0,
    WATER_DMG_PER: 0,
    HANDING_DMG_PER: 0,
    BRUST_BAG_PER: 0,
    NEW_BURST_PER: 0,
    TOTAL_DMG_PER: 0,
    DEM_RS: 0,
    WHR_RS: 0,
  };

  data.forEach((item) => {
    mergeData.CUT_TORN += +item.CUT_TORN || 0;
    mergeData.WATER_DMG += +item.WATER_DMG || 0;
    mergeData.HANDING_DMG += +item.HANDING_DMG || 0;
    mergeData.BRUST_BAG += +item.BRUST_BAG || 0;
    mergeData.NEW_BURST += +item.NEW_BURST || 0;
    mergeData.TOTAL_DMG += +item.TOTAL_DMG || 0;
    mergeData.DEM_RS += +item.DEM_RS || 0;
    mergeData.WHR_RS += +item.WHR_RS || 0;
  });

  let qty = Number(RR_QTY);
  if (!qty || isNaN(qty) || qty <= 0) {
    qty = 1;
  }

  // Helper to avoid floating-point errors, always returns a Number
  function round2(val) {
    return Number(Number(val).toFixed(2));
  }

  mergeData.CUT_TORN = round2(mergeData.CUT_TORN);
  mergeData.WATER_DMG = round2(mergeData.WATER_DMG);
  mergeData.HANDING_DMG = round2(mergeData.HANDING_DMG);
  mergeData.BRUST_BAG = round2(mergeData.BRUST_BAG);
  mergeData.NEW_BURST = round2(mergeData.NEW_BURST);
  mergeData.TOTAL_DMG = round2(mergeData.TOTAL_DMG);

  mergeData.CUT_TORN_PER = round2((mergeData.CUT_TORN / qty) * 100);
  mergeData.WATER_DMG_PER = round2((mergeData.WATER_DMG / qty) * 100);
  mergeData.HANDING_DMG_PER = round2((mergeData.HANDING_DMG / qty) * 100);
  mergeData.BRUST_BAG_PER = round2((mergeData.BRUST_BAG / qty) * 100);
  mergeData.NEW_BURST_PER = round2((mergeData.NEW_BURST / qty) * 100);
  mergeData.TOTAL_DMG_PER = round2((mergeData.TOTAL_DMG / qty) * 100) + "%";

  mergeData.DEM_RS = round2(mergeData.DEM_RS);
  mergeData.WHR_RS = round2(mergeData.WHR_RS);

  return mergeData;
};
