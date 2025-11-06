import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { connect, useSelector } from "react-redux";
import moment from "moment";
import { loading } from "../../actions/loadingAction";
import http from "../../services/apicall";
import generateXLSX from "../../Functions/XLSXExport";
import salesHead from "./salesHead";
import useRegion from "../../hook/useRegion";
import ViewDepotsByComma from "../../Functions/ViewDepotsByComma";
import apis from "../../services/apis";
import { removeZero } from "../../services/utils";

export const Report = (props) => {
  const [reportData, setReportData] = useState([]);
  const [comparativeReport, setComparativeReport] = useState(false);
  const [approveSelected, setApproveSelected] = useState([]);
  const [uniqueColor, setUniqueColor] = useState([{ color: "white" }]);
  const [compareReport, setCompareReport] = useState([]);

  const cfa = useSelector((state) => state.Auth.mappedCFA);

  const region = useRegion();

  const { register, handleSubmit, errors, watch, triggerValidation } = useForm({
    mode: "onSubmit",
    reValidateMode: "onChange",
  });

  const watchAllFields = watch();

  useEffect(() => {
    triggerValidation("IM_DATE_TO");
  }, [watchAllFields.IM_DATE_FROM]);

  useEffect(() => {
    triggerValidation("IM_DATE_FROM");
  }, [watchAllFields.IM_DATE_TO]);

  let headers = [
    {
      title: "Select",
      key: "",
    },
    { title: "Depots", key: "DEPOTS" },

    {
      title: "CFA",
      key: "CFA_CODE",
    },
    {
      title: "Region",
      key: "REGION_CODE",
    },
    {
      title: "Region Name",
      key: "REGION_NAME",
    },
    {
      title: "Date",
      key: "PHY_DATE",
    },
    {
      title: "Time",
      key: "PHY_TIME",
    },
    {
      title: "View",
      key: "",
    },
  ];

  let compareTableView = [
    // { title: "PHY ID", key: "PHY_ID" },
    { title: "Depot", key: "DEPOTs" },
    { title: "CFA", key: "CFA" },
    { title: "Region", key: "REGION_CODE" },
    { title: "Region Name", key: "REGION_NAME" },
    { title: "Location", key: "LOCATION", download: true },
    { title: "Date", key: "PHY_DATE" },
    { title: "Material Group", key: "IM_MATERIAL" },
    { title: "Fresh", key: "IM_FRESH" },
    { title: "Damage", key: "IM_DAMAGE" },
    { title: "Cut and Torn", key: "IM_CUT_TORN" },
    { title: "Total", key: "TOTAL_PHY" },
    { title: "FRESH", key: "IM_FRESH_BK" },
    { title: "Damage", key: "IM_DAMAGE_BK" },
    { title: "Cut and Torn", key: "IM_CUT_TORN_BK" },
    { title: "Total", key: "TOTAL_SAP" },
    { title: "In Transit", key: "TRANSIT" },
    { title: "Block", key: "BLOCK" },
  ];

  const getReport = (data) => {
    props.loading(true);

    data.IM_DATE_FROM = data.IM_DATE_FROM.split("-").join("");
    data.IM_DATE_TO = data.IM_DATE_TO.split("-").join("");

    let CFA_CODE;

    console.log(data);
    if (data.IM_CFA) {
      CFA_CODE = [removeZero(data.IM_CFA)];
    } else {
      CFA_CODE = cfa.map((item) => removeZero(item.CFA_CODE));
    }

    if (data.IM_REGION) {
      data.REGION = [data.IM_REGION];
    } else {
      data.REGION = [...new Set(region?.map((item) => item.REGION))];
    }

    http
      .post("/get-all-physical-inventory", {
        CFA_CODE,
        IM_DATE_FROM: data.IM_DATE_FROM,
        IM_DATE_TO: data.IM_DATE_TO,
        REGION: data.REGION,
      })
      .then((res) => {
        if (res.data.code === 0) {
          setReportData(res.data.data);
        }
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        props.loading(false);
      });
  };

  const getDiff = (data, key, diff, allData) => {
    if (key === "IM_FRESH" || key === "IM_FRESH_BK") {
      if (
        +diff < Math.abs(+data.IM_FRESH - +data.IM_FRESH_BK) &&
        data.IM_FRESH &&
        data.IM_FRESH_BK
      ) {
        return { background: "#eeff62", weight: "bold" };
      }
    } else if (key === "IM_DAMAGE" || key === "IM_DAMAGE_BK") {
      if (
        +diff < Math.abs(+data.IM_DAMAGE - +data.IM_DAMAGE_BK) &&
        data.IM_DAMAGE &&
        data.IM_DAMAGE_BK
      ) {
        return { background: "#eeff62", weight: "bold" };
      }
    } else if (key === "IM_CUT_TORN" || key === "IM_CUT_TORN_BK") {
      if (
        +diff < Math.abs(+data.IM_CUT_TORN - +data.IM_CUT_TORN_BK) &&
        data.IM_CUT_TORN &&
        data.IM_CUT_TORN_BK
      ) {
        return { background: "#eeff62", weight: "bold" };
      }
    } else if (key === "TOTAL_PHY" || key === "TOTAL_SAP") {
      let totalPhy =
        +allData.IM_FRESH + +allData.IM_DAMAGE + +allData.IM_CUT_TORN;
      let totalSap =
        +allData.IM_FRESH_BK +
        +allData.IM_DAMAGE_BK +
        +allData.IM_CUT_TORN_BK +
        +allData.IM_OTHER_BK;

      if (+diff < Math.abs(+totalPhy - +totalSap)) {
        return { background: "orange", weight: "bold" };
      }
    } else {
      return {
        background: uniqueColor.find((item) => item.PHY_ID === data.PHY_ID)
          ?.color,
        weight: "normal",
      };
    }
  };

  const approveSelectDeselect = (value, isChecked) => {
    if (isChecked) {
      setApproveSelected([...approveSelected, value]);
    } else {
      setApproveSelected(
        approveSelected.filter((item) => item.PHY_ID !== value.PHY_ID)
      );
    }
  };

  const dateTimeFormat = (data, key, allData, view = false) => {
    if (key === "PHY_DATE" && view) {
      return moment(data, "YYYYMMDD").format("DD/MM/YYYY");
    } else if (key === "PHY_DATE" && !view) {
      return moment(data, "YYYYMMDD - HHmmss").format("DD/MM/YYYY HH:mm");
    } else if (key === "PHY_TIME") {
      return moment(data, "HHmmss").format("hh:mm a");
    } else if (key === "TOTAL_PHY") {
      return isNA(
        +allData.IM_FRESH + +allData.IM_DAMAGE + +allData.IM_CUT_TORN
      );
    } else if (key === "TOTAL_SAP") {
      return isNA(
        (
          +allData.IM_FRESH_BK +
          allData.IM_DAMAGE_BK +
          +allData.IM_CUT_TORN_BK +
          +allData.IM_OTHER_BK
        ).toFixed(2)
      );
    } else if (key === "DEPOTS") {
      return <ViewDepotsByComma data={data} />;
    } else if (key === "IM_MATERIAL") {
      return data
        ? allData.IM_MATERIAL + " - " + allData.IM_MATERIAL_DESC
        : "Others";
    } else if (key === "CFA") {
      return allData.CFA_CODE + " - " + allData.CFA_NAME;
    } else {
      return isNA(data);
    }
  };

  const isNA = (data) => {
    return data ? data : "NA";
  };

  const SLToPL = (data, prev, i) => {
    let OBJ = {
      IM_FRESH_BK: ["ROAD", "RAIL", "G001"],
      IM_CUT_TORN_BK: ["G005"],
      IM_DAMAGE_BK: ["DMG", "G006"],
      IM_OTHER_BK: ["G002", "SHTG"],
    };

    let returnObj = {
      IM_FRESH_BK: 0,
      IM_DAMAGE_BK: 0,
      IM_CUT_TORN_BK: 0,
      IM_OTHER_BK: 0,
    };

    Object.entries(data).forEach((item) => {
      if (OBJ.IM_FRESH_BK.includes(item[0])) {
        returnObj.IM_FRESH_BK += +item[1];
      } else if (OBJ.IM_DAMAGE_BK.includes(item[0])) {
        returnObj.IM_DAMAGE_BK += +item[1];
      } else if (OBJ.IM_CUT_TORN_BK.includes(item[0])) {
        returnObj.IM_CUT_TORN_BK += +item[1];
      } else if (OBJ.IM_OTHER_BK.includes(item[0])) {
        returnObj.IM_OTHER_BK += +item[1];
      }
    });
    return returnObj;
  };

  const getDepotLocation = async (data) => {
    props.loading(true);
    try {
      const depotLocation = await http.post(apis.COMMON_POST_WITH_FM_NAME, {
        fm_name: "ZRFC_DEPOT_LOCATION",
        params: {
          IM_DATA: data.map((ele) => {
            return {
              DEPOT: ele,
            };
          }),
        },
      });
      if (depotLocation.data.code === 0) {
        let locationByDepot = depotLocation.data.result.IM_DATA.reduce(
          (acc, cur) => {
            acc[cur.DEPOT] = cur.LOCATION;
            return acc;
          },
          {}
        );

        console.log(locationByDepot);

        return locationByDepot;
      } else {
        return {};
      }
    } catch (error) {
      getDepotLocation(data);
    } finally {
      props.loading(false);
    }
  };

  const createCompareReport = async (data) => {
    if (data.length > 0) {
      let mergeBookStock = [];

      console.log(data);

      let uniqueDepots = data.map((item) =>
        item.DEPOTS.map((ele) => ele.value)
      );

      uniqueDepots = [...new Set(uniqueDepots.flat())];

      const depotWithLocation = await getDepotLocation(uniqueDepots);

      mergeBookStock = data.map((ele) =>
        ele.BOOK_STOCK.reduce((acc, current) => {
          const x = acc.find(
            (item) => item.MATGRP_CODE === current.MATGRP_CODE
          );
          if (!x) {
            return acc.concat([current]);
          } else {
            return acc.map((item) =>
              item.MATGRP_CODE === current.MATGRP_CODE
                ? {
                    ...item,
                    PHY_ID: ele.PHY_ID,
                    ROAD: +item.ROAD + +current.ROAD,
                    RAIL: +item.RAIL + +current.RAIL,
                    G001: +item.G001 + +current.G001,
                    SHTG: +item.SHTG + +current.SHTG,
                    G005: +item.G005 + +current.G005,
                    DMG: +item.DMG + +current.DMG,
                    G006: +item.G006 + +current.G006,
                    G002: +item.G002 + +current.G002,
                    G003: +item.G003 + +current.G003,
                    G004: +item.G004 + +current.G004,
                  }
                : item
            );
          }
        }, [])
      );

      mergeBookStock = mergeBookStock.map((item) => {
        return item.map((ele) => {
          let obj = SLToPL(ele, item, item.indexOf(ele));
          return {
            IM_MATERIAL: ele.MATGRP_CODE,
            IM_MATERIAL_DESC: ele.MATGRP_DESC,
            ...obj,
          };
        });
      });

      let mergePhysicalStockAndBookStock = [];

      // create a unique  object by IM_MATERIAL by reduce function
      mergePhysicalStockAndBookStock = data.map((item, i) =>
        [...item.PHY_INVT, ...mergeBookStock[i]].reduce((acc, current) => {
          if (acc[current.IM_MATERIAL]) {
            return {
              ...acc,
              [current.IM_MATERIAL]: {
                ...acc[current.IM_MATERIAL],
                ...current,
                PHY_ID: item.PHY_ID,
                PHY_DATE: item.PHY_DATE + " - " + item.PHY_TIME,
                CFA_CODE: item.CFA_CODE,
                CFA_NAME: item.CFA_NAME,
                REGION_CODE: item.REGION_CODE,
                REGION_NAME: item.REGION_NAME,
                DEPOTs: item.DEPOTS.map((item) => item.value).join(", "),
                LOCATION: item.DEPOTS.map(
                  (item) => depotWithLocation[item.value]
                ).join(", "),
              },
            };
          } else {
            return {
              ...acc,
              [current.IM_MATERIAL]: {
                ...current,
                PHY_ID: item.PHY_ID,
                PHY_DATE: item.PHY_DATE + " - " + item.PHY_TIME,
                CFA_CODE: item.CFA_CODE,
                CFA_NAME: item.CFA_NAME,
                REGION_CODE: item.REGION_CODE,
                REGION_NAME: item.REGION_NAME,
                DEPOTs: item.DEPOTS.map((item) => item.value).join(", "),
                LOCATION: item.DEPOTS.map(
                  (item) => depotWithLocation[item.value]
                ).join(", "),
              },
            };
          }
        }, {})
      );

      // convert the object to array
      mergePhysicalStockAndBookStock = mergePhysicalStockAndBookStock.map(
        (item) => Object.values(item)
      );

      mergePhysicalStockAndBookStock = mergePhysicalStockAndBookStock.flat();

      // sort the array by IM_MATERIAL
      mergePhysicalStockAndBookStock = mergePhysicalStockAndBookStock.sort(
        (a, b) => a.IM_MATERIAL - b.IM_MATERIAL
      );

      let phyId = data.map((item) => item.PHY_ID);
      phyId = [...new Set(phyId)];
      let color = [];
      for (let i = 0; i < phyId.length; i++) {
        color.push({
          PHY_ID: phyId[i],
          color: randomColor(),
        });
      }

      setUniqueColor(color);

      return mergePhysicalStockAndBookStock;
    } else {
      return [];
    }
  };

  const randomColor = () => {
    let color = "#";
    for (let i = 0; i < 6; i++) {
      color += Math.floor(Math.random() * 10);
    }
    return color + "44";
  };

  return (
    <div className="filter-section comparative-report">
      <div style={{ display: !comparativeReport ? "block" : "none" }}>
        <form onSubmit={handleSubmit((data) => getReport(data))}>
          <div className="row">
            {salesHead.includes(localStorage.getItem("user_code")) && (
              <div className="col-12 col-md-6">
                <div className="row">
                  <div className="col-12">
                    <label>REGION</label>
                  </div>
                  <div className="col-12 depot-select">
                    <i className="fas fa-angle-down icons"></i>
                    <select
                      style={{ margin: "0px !important" }}
                      ref={register}
                      name="IM_REGION"
                    >
                      <option value={""}>Select Region</option>

                      {/* remove duplicate region */}

                      {region
                        ?.filter((item, index, self) => {
                          return (
                            index ===
                            self.findIndex((t) => t.REGION === item.REGION)
                          );
                        })
                        ?.map((item, index) => (
                          <option key={index} value={item.REGION}>
                            {item.REGION} - {item.REGIO_DESC}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>
              </div>
            )}
            <div className="col-12 col-md-6">
              <div className="row">
                <div className="col-12">
                  <label>CFA</label>
                </div>
                <div className="col-12 depot-select">
                  <i className="fas fa-angle-down icons"></i>
                  <select
                    style={{ margin: "0px !important" }}
                    name="IM_CFA"
                    ref={register}
                  >
                    <option value="">Select CFA</option>
                    {cfa?.map((item, index) => (
                      <option key={index} value={item.CFA_CODE}>
                        {removeZero(item.CFA_CODE)} - {item.CFA_NAME}
                      </option>
                    ))}
                  </select>
                  {errors.IM_CFA && (
                    <span className="error">This field is required</span>
                  )}
                </div>
              </div>
            </div>

            <div className="col-12 col-md-3">
              <div className="row">
                <div className="col-12">
                  <label>
                    Date From<span>*</span>
                  </label>
                </div>
                <div className="col-12 depot-select">
                  <input
                    type="date"
                    name="IM_DATE_FROM"
                    ref={register({
                      validate: (value) => {
                        let ans = false;
                        if (watchAllFields.IM_DATE_TO) {
                          if (
                            moment(watchAllFields.IM_DATE_FROM).isBefore(
                              moment(watchAllFields.IM_DATE_TO)
                            ) ||
                            (moment(watchAllFields.IM_DATE_FROM).isSame(
                              moment(watchAllFields.IM_DATE_TO)
                            ) &&
                              moment(watchAllFields.IM_DATE_TO).diff(
                                moment(watchAllFields.IM_DATE_FROM),
                                "days"
                              ) <= 31)
                          ) {
                            ans = true;
                          }
                        } else {
                          ans = true;
                        }
                        return ans;
                      },
                    })}
                    defaultValue={moment()
                      .subtract(2, "day")
                      .format("YYYY-MM-DD")}
                  />
                  {errors.IM_DATE_FROM && (
                    <p className="form-error">Date should be within 31 days</p>
                  )}
                </div>
              </div>
            </div>

            <div className="col-12 col-md-3">
              <div className="row">
                <div className="col-12">
                  <label>
                    Date To<span>*</span>
                  </label>
                </div>
                <div className="col-12 depot-select">
                  <input
                    type="date"
                    name="IM_DATE_TO"
                    ref={register({
                      validate: (value) => {
                        let ans = false;
                        if (watchAllFields.IM_DATE_FROM) {
                          if (
                            (moment(watchAllFields.IM_DATE_FROM).isBefore(
                              moment(watchAllFields.IM_DATE_TO)
                            ) ||
                              moment(watchAllFields.IM_DATE_FROM).isSame(
                                moment(watchAllFields.IM_DATE_TO)
                              )) &&
                            moment(watchAllFields.IM_DATE_TO).diff(
                              moment(watchAllFields.IM_DATE_FROM),
                              "days"
                            ) <= 31
                          ) {
                            ans = true;
                          }
                        } else {
                          ans = true;
                        }
                        return ans;
                      },
                    })}
                    defaultValue={moment().format("YYYY-MM-DD")}
                  />
                  {errors.IM_DATE_TO && (
                    <p className="form-error">Date should be within 31 days</p>
                  )}
                </div>
              </div>
            </div>

            <div className="col-12 col-md-2">
              <div className="row">
                <div className="col-12">
                  <label> </label>
                </div>
                <div className="col-12">
                  <button className="search-button" type="submit">
                    <i className="fas fa-search icons-button"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </form>
        <br />
        <div className="background" style={{ margin: 0 }}>
          <div className="table-filter">
            <div className="filter-div">
              <div className="row">
                <div className="col-12">
                  {approveSelected.length > 0 && (
                    <button
                      className="goods-button float-right"
                      style={{ backgroundColor: "#0F6FA2" }}
                      onClick={async () => {
                        setCompareReport(
                          await createCompareReport(approveSelected)
                        );
                        setComparativeReport(true);
                      }}
                    >
                      Compare
                    </button>
                  )}
                </div>
              </div>
            </div>
            <div className="table-div" style={{ maxHeight: "1000px" }}>
              <div className="row">
                <table className="table">
                  <thead>
                    <tr>
                      {headers.map((header, index) =>
                        header.title === "Select" ? (
                          <th className="table-sticky-vertical" key={index}>
                            <input
                              type="checkbox"
                              onChange={(e) => {
                                if (e.target.checked) {
                                  // check all the checkboxes in the table
                                  document
                                    .querySelectorAll(".select-checkbox")
                                    .forEach((ele) => {
                                      ele.checked = true;
                                    });

                                  setApproveSelected(reportData);
                                } else {
                                  document
                                    .querySelectorAll(".select-checkbox")
                                    .forEach((ele) => {
                                      ele.checked = false;
                                    });

                                  setApproveSelected([]);
                                }
                              }}
                              disabled={reportData.length === 0}
                            />
                          </th>
                        ) : (
                          <th className="table-sticky-vertical" key={index}>
                            {header.title}
                          </th>
                        )
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.map((ele, i) => (
                      <tr key={i}>
                        {headers.map((header, index) => {
                          if (header.title === "View") {
                            return (
                              <td key={index}>
                                <i
                                  onClick={async () => {
                                    setCompareReport(
                                      await createCompareReport([ele])
                                    );
                                    setComparativeReport(true);
                                  }}
                                  className="fas fa-eye"
                                  style={{
                                    color: "black",
                                    cursor: "pointer",
                                  }}
                                ></i>
                              </td>
                            );
                          } else if (header.title === "Select") {
                            return (
                              <td key={index}>
                                <input
                                  type="checkbox"
                                  className="select-checkbox"
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      approveSelectDeselect(ele, true);
                                    } else {
                                      approveSelectDeselect(ele, false);
                                    }
                                  }}
                                />{" "}
                              </td>
                            );
                          } else {
                            return (
                              <td key={index}>
                                {dateTimeFormat(
                                  ele[header.key],
                                  header.key,
                                  ele,
                                  true
                                )}
                              </td>
                            );
                          }
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div style={{ display: comparativeReport ? "block" : "none" }}>
        <div className="row">
          <div className="col-12">
            <div className="row">
              <div className="col-12"></div>
            </div>
            <br />

            <div className="row">
              <div className="col-12">
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <button
                    className="button goods-button"
                    style={{ margin: "0", padding: "10px 15px" }}
                    onClick={() => {
                      setComparativeReport(false);
                    }}
                  >
                    Back
                  </button>
                  <h3 style={{ textAlign: "center" }}>Comparative Report</h3>
                  <div></div>
                </div>
              </div>
            </div>
            <br />
            <div className="background" style={{ margin: 0 }}>
              <div className="table-filter">
                <div className="filter-div">
                  <div className="row">
                    <div className="col-12">
                      <button
                        className="goods-button float-right"
                        style={{ backgroundColor: "#0F6FA2" }}
                        onClick={() => {
                          let data = compareReport.map((ele, i) =>
                            compareTableView.map((item) => {
                              return dateTimeFormat(
                                ele[item.key],
                                item.key,
                                ele
                              );
                            })
                          );

                          data.unshift(
                            compareTableView.map((item) => item.title)
                          );

                          data.unshift([
                            "",
                            "",
                            "",
                            "Phy. Invt.",
                            "Phy. Invt.",
                            "Phy. Invt.",
                            "Phy. Invt.",
                            "Book Stock",
                            "Book Stock",
                            "Book Stock",
                            "Book Stock",
                          ]);

                          generateXLSX(
                            data,
                            `Comparative Report ${moment().format(
                              "DD-MM-YYYY HH:mm:ss"
                            )}`
                          );
                        }}
                      >
                        Export to Excel
                      </button>
                    </div>
                  </div>
                </div>
                <div className="table-div">
                  <div className="row">
                    <table className="table compare-table">
                      <thead>
                        <tr>
                          <th
                            colSpan="6"
                            className="table-sticky-vertical"
                          ></th>
                          <th
                            colSpan="4"
                            style={{ textAlign: "center" }}
                            className="table-sticky-vertical"
                          >
                            Physical Inventory
                          </th>
                          <th
                            colSpan="8"
                            style={{ textAlign: "center" }}
                            className="table-sticky-vertical"
                          >
                            Book Stock
                          </th>
                        </tr>
                        <tr>
                          {compareTableView
                            .filter((ele) => !ele.download)
                            .map((item, index) => (
                              <th
                                className="table-sticky-vertical"
                                scope="col"
                                style={{ minWidth: "70px" }}
                                key={index}
                              >
                                {item.title}
                              </th>
                            ))}
                        </tr>
                      </thead>
                      <tbody>
                        {compareReport.map((ele, i) => (
                          <tr key={i}>
                            {compareTableView
                              .filter((ele) => !ele.download)
                              .map((item, index) => (
                                <td
                                  key={index}
                                  style={{
                                    fontWeight: getDiff(ele, item.key, 0, ele)
                                      ?.weight,
                                    backgroundColor: getDiff(
                                      ele,
                                      item.key,
                                      0,
                                      ele
                                    )?.background,
                                  }}
                                >
                                  {dateTimeFormat(ele[item.key], item.key, ele)}
                                </td>
                              ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const mapStateToProps = (state) => ({});

const mapDispatchToProps = {
  loading,
};

export default connect(mapStateToProps, mapDispatchToProps)(Report);
