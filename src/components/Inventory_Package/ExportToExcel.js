const ExportDataFormat = (data = []) => {
  let finalData = data?.map((item) =>
    item.PHY_INVT.map((phy) => {
      return {
        DEPOTS: item.DEPOTS.map((depot) => depot.value).join(", "),
        CFA_NAME: item.CFA_NAME,
        CFA_CODE: item.CFA_CODE,
        REGION: item.REGION_CODE?.toString(),
        REGION_NAME: item.REGION_NAME,
        PHY_DATE: item.PHY_DATE,
        PHY_TIME: item.PHY_TIME,
        MAT_GRP: phy.IM_MATERIAL,
        MAT_GRP_DESC: phy.IM_MATERIAL_DESC,
        IM_FRESH: phy.IM_FRESH,
        IM_DAMAGE: phy.IM_DAMAGE,
        IM_CUT_TORN: phy.IM_CUT_TORN,
      };
    })
  );

  return finalData.flat();
};

let columnsDownload = [
  { title: "Depots Code", key: "DEPOTS" },
  { title: "CFA Code", key: "CFA_CODE" },
  { title: "CFA Name", key: "CFA_NAME" },
  { title: "Region", key: "REGION" },
  { title: "Region Name", key: "REGION_NAME" },
  { title: "Date", key: "PHY_DATE" },
  { title: "Time", key: "PHY_TIME" },
  { title: "Material Group", key: "MAT_GRP" },
  { title: "Material Group Description", key: "MAT_GRP_DESC" },
  { title: "Fresh", key: "IM_FRESH" },
  { title: "Damage", key: "IM_DAMAGE" },
  { title: "Cut & Torn", key: "IM_CUT_TORN" },
];

export { ExportDataFormat, columnsDownload };
