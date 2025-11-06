import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import Select from "react-select";
import { loading } from "../../actions/loadingAction";
import http from "../../services/apicall";

import moment from "moment";
import Swal from "sweetalert2";
import ExcelReport from "../../Functions/ExcelReport";
import apis from "../../services/apis";
import store from "../../store";

export const RRSummaryReport = (props) => {
  const [allRegion, setAllRegion] = useState([]);
  const [allCfa, setAllCfa] = useState([]);
  const [cfaDepotMap, setCfaDepotMap] = useState([]);
  const [allData, setAllData] = useState([]);
  const [deliveryPlants, setDeliveryPlants] = useState([]);
  const [recPlants, setRecPlants] = useState([]);
  const [plantDetails, setPlantDetails] = useState([]);
  const [inputData, setInputData] = useState({
    REGION_CODE: [
      {
        value: "All",
        label: "All Regions",
      },
    ],
    IM_DATE_FROM: "2023-09-01",
    IM_DATE_TO: "2024-08-30",
    CFA: [],
    REC_PLANT: [],
    DELIVERY_PLANT: [],
  });
  const [view, setView] = useState(["ALL"]);

  useEffect(() => {
    if (inputData.CFA.length > 0) {
      setView(["CFA", "REC_PLANT", "ALL"]);
    } else if (inputData.REC_PLANT.length > 0) {
      setView(["REC_PLANT", "ALL"]);
    } else {
      setView(["ALL"]);
    }
  }, [inputData]);

  const getAllRegion = async () => {
    http
      .post(apis.COMMON_POST_WITH_TABLE_NAME, {
        TABLE: "REGION",
        params: {},
      })
      .then((res) => {
        let regions = res.data.result;

        regions = [{ REGION: "All", REGION_DESC: "All Regions" }, ...regions];

        setAllRegion(regions);
      });
  };

  const getCfa = async () => {
    try {
      const res = await http.get(apis.ALLUSER);

      if (res.data.result.length > 0) {
        const cfaData = res.data.result
          .filter((item) => item.user_type === 3)
          .map((item) => {
            return {
              value: item.user_code,
              label: item.user_code + " - " + item.name,
            };
          });

        setAllCfa(cfaData);
      }
    } catch (err) {
      console.log(err);
    }
  };

  const getAllPlants = async () => {
    try {
      const res = await http.post("/rfc-reducer/get-all-plants");

      if (res.data.data.length > 0) {
        const allPlants = res.data.data.map((item) => {
          return {
            value: item.PLANT,
            label: item.PLANT + " - " + item.PLANT_NAME,
          };
        });

        setPlantDetails(res.data.data);
        setRecPlants([
          {
            value: "All",
            label: "All Plants",
          },
          ...allPlants,
        ]);
        setDeliveryPlants([
          { value: "All", label: "All Plants" },
          ...allPlants,
        ]);
      }
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    getAllRegion();
    getAllPlants();
    getCfa();
  }, []);

  const getCFAtoDEPOT = async (CFA) => {
    try {
      if (CFA.length === 0) return [];

      console.log(CFA);

      const allCFAData = CFA.map((item) => {
        return http.post("/rfc-reducer/get-cfa-user", {
          IM_CFA_CODE: item,
        });
      });

      const returnData = await Promise.all(allCFAData);

      const allDepot = returnData.map((item) => {
        console.log(item.data.data);
        return {
          CFA: item.data.data.IM_CFA_CODE,
          DEPOT: item.data.data.EX_DEPO,
        };
      });

      console.log(allDepot);
      return allDepot;
    } catch (err) {
      console.log(err);
      getCFAtoDEPOT(CFA);
    }
  };

  const handleCFAChange = async (CFA) => {
    const cfaToDepot = await getCFAtoDEPOT(CFA.map((item) => item.value));

    let extractData = [];

    for (let i = 0; i < cfaToDepot.length; i++) {
      let data = cfaToDepot[i];
      let depots = data.DEPOT.map((item) => ({
        value: item.DEPOT,
        label: item.DEPOT + " - " + item.DEPOT_NAME,
        cfa: data.CFA,
      }));
      extractData.push(...depots);
    }

    extractData = extractData.filter(
      (item, index) =>
        extractData.findIndex((i) => i.value === item.value) === index
    );

    setCfaDepotMap(extractData);

    setInputData({
      ...inputData,
      REGION_CODE: [],
      CFA: CFA,
      REC_PLANT: extractData,
    });
  };

  const getReport = async () => {
    if (
      inputData.REGION_CODE.length === 0 &&
      inputData.REC_PLANT.length === 0
    ) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Please select Region or Rec Plant",
        confirmButtonText: "OK",
      });
      return;
    }

    try {
      const postData = {
        IM_DATE_FROM: moment(inputData.IM_DATE_FROM, "YYYY-MM-DD").format(
          "YYYYMMDD"
        ),
        IM_DATE_TO: moment(inputData.IM_DATE_TO, "YYYY-MM-DD").format(
          "YYYYMMDD"
        ),
        IM_REGIO: inputData.REGION_CODE.find((item) => item.value === "All")
          ? allRegion
              .map((item) => item.REGION)
              .filter((item) => item !== "All")
          : inputData.REGION_CODE.map((item) => item.value),

        IM_WHOUSE: inputData.REC_PLANT.map((item) => item.value).find(
          (item) => item === "All"
        )
          ? recPlants.map((item) => item.value).filter((item) => item !== "All")
          : inputData.REC_PLANT.map((item) => item.value),
      };

      store.dispatch(loading(true));
      const dataMongo = await http.post("get-damage-summary-report", postData);

      // store.dispatch(loading(true));
      const data = await http.post(apis.COMMON_POST_WITH_FM_NAME, {
        fm_name: "ZRFC_RAKE_DASHBOARDD",
        params: {
          ...postData,
        },
      });

      store.dispatch(loading(false));

      // merge two data from data and dataMongo

      let summaryReport = [];
      // if (
      //   data.data.result.IT_DATA.length > 0 &&
      //   dataMongo.data.result.length > 0
      // ) {
      const rfcData = data.data.result.IT_DATA;
      const mongoData = dataMongo.data.result;

      if (postData.IM_REGIO.length > 0) {
        let newData = mongoData.map((item) => {
          return {
            ...item,
            ...allRegion.find((ele) => ele.REGION === item._id),
          };
        });
        summaryReport = rfcData.map((item) => {
          let findRegion = newData.find(
            (ele) => ele.REGION_DESC === item.REGION
          );

          return {
            ...item,

            REGION_DESC: item.REGION,
            ...newData.find((ele) => ele.REGION_DESC === item.REGION),
            total_RR_QTY: findRegion?.total_RR_QTY?.toFixed(3),
            REGION_CODE:
              findRegion?.REGION ??
              allRegion.find((ele) => ele.REGION_DESC === item.REGION).REGION,
            PENDING_RR_QTY: Number(
              Number(item.TOTAL_GR_QTY) - Number(findRegion?.total_RR_QTY ?? 0)
            ).toFixed(3),
          };
        });
      } else {
        summaryReport = rfcData.map((item) => {
          let cfaDetails = {};
          if (inputData.CFA.length > 0) {
            cfaDetails = cfaDepotMap.find((ele) => ele.DEPOT === item.value);
          }

          let findData = mongoData.find(
            (ele) => ele.ID === `${item.RECIEVING_PLANT}_${item.DELIVERY_PLANT}`
          );

          return {
            ...item,
            ...findData,
            total_RR_QTY: findData?.total_RR_QTY?.toFixed(3) ?? 0,
            CFA: allCfa.find((ele) => ele.value === cfaDetails.cfa)?.label,
            REGION_CODE: allRegion.find(
              (ele) => ele.REGION_DESC === item.REGION
            ).REGION,
            PENDING_RR_QTY: Number(
              Number(item.TOTAL_GR_QTY) - Number(findData?.total_RR_QTY ?? 0)
            ).toFixed(3),
            REGION_DESC: item.REGION,
            RECEIVING_PLANT: item.RECIEVING_PLANT,
            RECEIVING_PLANT_NAME: plantDetails.find(
              (ele) => ele.PLANT === item.RECIEVING_PLANT
            )?.PLANT_NAME,
            DELIVERY_PLANT_NAME: plantDetails.find(
              (ele) => ele.PLANT === item.DELIVERY_PLANT
            )?.PLANT_NAME,
          };
        });
      }

      // sort by total_DAMAGE_QTY
      summaryReport.sort((a, b) => {
        return b.total_DAMAGE_QTY - a.total_DAMAGE_QTY;
      });

      setAllData(summaryReport);
      // } else {
      //   Swal.fire({
      //     icon: "error",
      //     title: "Oops...",
      //     text: "Something went wrong! Try again!",
      //     confirmButtonText: "OK",
      //   });
      // }
    } catch (error) {
      console.log(error);
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Something went wrong!",
        confirmButtonText: "OK",
      });
    } finally {
      store.dispatch(loading(false));
    }
  };

  const getRRRow = (data) => {};

  return (
    <>
      <div
        className="filter-section comparative-report"
        style={{
          padding: "20px",
        }}
      >
        <div className="row">
          <div className="col-12 col-md-4">
            <div className="row">
              <div className="col-12">
                <label>Region</label>
              </div>
              <div className="col-12 depot-select">
                <i className="fas fa-angle-down icons"></i>
                <Select
                  options={allRegion?.map((item) => {
                    return {
                      value: item.REGION,
                      label: `${item.REGION} - ${item.REGION_DESC}`,
                    };
                  })}
                  isMulti
                  onChange={(e) => {
                    setInputData({
                      ...inputData,
                      REGION_CODE: e ? e : [],
                    });
                  }}
                  value={inputData.REGION_CODE}
                  placeholder="Select Region"
                  classNamePrefix="react-select"
                />
              </div>
            </div>
          </div>

          <div className="col-12 col-md-8">
            <div className="row">
              <div className="col-12">
                <label>CFA</label>
              </div>
              <div className="col-12 depot-select">
                <i className="fas fa-angle-down icons"></i>
                <Select
                  options={allCfa}
                  isMulti
                  onChange={(e) => {
                    handleCFAChange(e ? e : []);
                    setInputData({
                      ...inputData,
                      CFA: e ? e : [],
                    });
                  }}
                  value={inputData.CFA}
                  placeholder="Select CFA"
                  classNamePrefix="react-select"
                />
              </div>
            </div>
          </div>

          <div className="col-12 col-md-8">
            <div className="row">
              <div className="col-12">
                <label>Rec. Plant</label>
              </div>
              <div className="col-12 depot-select">
                <i className="fas fa-angle-down icons"></i>
                <Select
                  isMulti
                  options={recPlants}
                  onChange={(e) => {
                    setInputData({
                      ...inputData,
                      CFA: [],
                      REC_PLANT: e ? e : [],
                    });
                  }}
                  value={inputData.REC_PLANT}
                  placeholder="Select Rec Plant"
                  classNamePrefix="react-select"
                />
              </div>
            </div>
          </div>

          {/* <div className="col-12 col-md-4">
            <div className="row">
              <div className="col-12">
                <label>Delivery Plant</label>
              </div>
              <div className="col-12 depot-select">
                <i className="fas fa-angle-down icons"></i>
                <Select
                  isMulti
                  options={deliveryPlants}
                  onChange={(e) => {
                    setInputData({
                      ...inputData,
                      DELIVERY_PLANT: e ? e : [],
                    });
                  }}
                  placeholder="Select Delivery Plant"
                  classNamePrefix="react-select"
                />
              </div>
            </div>
          </div> */}

          <div className="col-12 col-md-2">
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
                  value={inputData.IM_DATE_FROM}
                  onChange={(e) =>
                    setInputData({
                      ...inputData,
                      IM_DATE_FROM: e.target.value,
                    })
                  }
                />
              </div>
            </div>
          </div>

          <div className="col-12 col-md-2">
            <div className="row">
              <div className="col-12">
                <label>
                  Date to<span>*</span>
                </label>
              </div>
              <div className="col-12 depot-select">
                <input
                  type="date"
                  name="IM_DATE_TO"
                  value={inputData.IM_DATE_TO}
                  onChange={(e) =>
                    setInputData({
                      ...inputData,
                      IM_DATE_TO: e.target.value,
                    })
                  }
                />
              </div>
            </div>
          </div>
          <div className="col-12 col-md-1">
            <div className="row">
              <div className="col-12">
                <label> </label>
              </div>
              <div className="col-12">
                <button className="search-button" onClick={getReport}>
                  <i className="fas fa-search icons-button"></i>
                </button>
              </div>
            </div>
          </div>
          <div className="col-6 col-md-1">
            <div className="row">
              <div className="col-12">
                <label> </label>
              </div>
              <div className="col-12">
                <button
                  className="search-button"
                  onClick={() => {
                    setInputData({
                      ...inputData,
                      REGION_CODE: [],
                      FISCAL_YEAR: "",
                    });
                  }}
                  type="button"
                  style={{ color: "white", background: "red" }}
                >
                  Reset
                </button>
              </div>
            </div>
          </div>
        </div>

        <br />
        <br />

        <div className="background" style={{ margin: 0 }}>
          <div className="table-filter">
            <div className="filter-div">
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                }}
              >
                <ExcelReport
                  columns={[
                    { title: "CFA", key: "CFA", view: "CFA" },
                    {
                      title: "Receiving Plant",
                      key: "RECEIVING_PLANT",
                      view: "REC_PLANT",
                    },
                    {
                      title: "Receiving Plant Name",
                      key: "RECEIVING_PLANT_NAME",
                      view: "REC_PLANT",
                    },
                    {
                      title: "Delivery Plant",
                      key: "DELIVERY_PLANT",
                      view: "REC_PLANT",
                    },
                    {
                      title: "Delivery Plant Name",
                      key: "DELIVERY_PLANT_NAME",
                      view: "REC_PLANT",
                    },
                    { title: "Region Code", key: "REGION_CODE", view: "ALL" },
                    { title: "Region Name", key: "REGION_DESC", view: "ALL" },
                    {
                      title: "Total Dispatch Qty",
                      key: "TOTAL_DESP_QTY",
                      view: "ALL",
                    },
                    { title: "Total GR Qty", key: "TOTAL_GR_QTY", view: "ALL" },
                    {
                      title: "Total Pending GRN Qty",
                      key: "PENDING_GR_QTY",
                      view: "ALL",
                    },
                    { title: "Total RR Qty", key: "total_RR_QTY", view: "ALL" },
                    {
                      title: "Pending RR Qty",
                      key: "PENDING_RR_QTY",
                      view: "ALL",
                    },
                    {
                      title: "Total DMG Qty",
                      key: "total_DAMAGE_QTY",
                      view: "ALL",
                    },
                    { title: "Claim Qty", key: "total_CLAIM_QTY", view: "ALL" },
                    {
                      title: "Non Claim Qty",
                      key: "total_NON_CLAIM_QTY",
                      view: "ALL",
                    },
                  ]}
                  data={allData}
                />
              </div>
              <div className="row">
                <div className="table-div" style={{ width: "100%" }}>
                  <table className="table">
                    <thead>
                      <tr>
                        {inputData.CFA.length > 0 && (
                          <th
                            className="table-sticky-vertical"
                            style={{
                              minWidth: "200px",
                            }}
                          >
                            CFA
                          </th>
                        )}
                        {inputData.REC_PLANT.length > 0 && (
                          <>
                            <th className="table-sticky-vertical">
                              Receiving Plant
                            </th>
                            <th className="table-sticky-vertical">
                              Receiving Plant Name
                            </th>
                            <th className="table-sticky-vertical">
                              Delivery Plant
                            </th>
                            <th className="table-sticky-vertical">
                              Delivery Plant Name
                            </th>
                          </>
                        )}
                        <th className="table-sticky-vertical">Region Code</th>
                        <th className="table-sticky-vertical">Region Name</th>
                        <th className="table-sticky-vertical">
                          Total Dispatch Qty
                        </th>
                        <th className="table-sticky-vertical">Total GR Qty</th>
                        <th className="table-sticky-vertical">
                          Total Pending GRN Qty
                        </th>
                        <th className="table-sticky-vertical">Total RR Qty</th>
                        <th className="table-sticky-vertical">
                          Pending RR Qty
                        </th>
                        <th className="table-sticky-vertical">Total DMG Qty</th>
                        <th className="table-sticky-vertical">Claim Qty</th>
                        <th className="table-sticky-vertical">Non Claim Qty</th>
                      </tr>
                    </thead>
                    <tbody>
                      {allData?.map((item, index) => {
                        return (
                          <tr key={index}>
                            {inputData.CFA.length > 0 && <td>{item.CFA}</td>}
                            {inputData.REC_PLANT.length > 0 && (
                              <>
                                <td
                                  style={{
                                    minWidth: "200px",
                                  }}
                                >
                                  {item.RECEIVING_PLANT}
                                </td>
                                <td
                                  style={{
                                    minWidth: "200px",
                                  }}
                                >
                                  {item.RECEIVING_PLANT_NAME}
                                </td>
                                <td
                                  style={{
                                    minWidth: "200px",
                                  }}
                                >
                                  {item.DELIVERY_PLANT}
                                </td>
                                <td
                                  style={{
                                    minWidth: "200px",
                                  }}
                                >
                                  {item.DELIVERY_PLANT_NAME}
                                </td>
                              </>
                            )}
                            <td
                              style={{
                                minWidth: "150px",
                              }}
                            >
                              {item.REGION_CODE}
                            </td>
                            <td
                              style={{
                                minWidth: "150px",
                              }}
                            >
                              {item.REGION_DESC}
                            </td>
                            <td
                              style={{
                                minWidth: "150px",
                              }}
                            >
                              {item.TOTAL_DESP_QTY}
                            </td>
                            <td
                              style={{
                                minWidth: "150px",
                              }}
                            >
                              {item.TOTAL_GR_QTY}
                            </td>
                            <td
                              style={{
                                minWidth: "150px",
                              }}
                            >
                              {item.PENDING_GR_QTY}
                            </td>
                            <td
                              style={{
                                minWidth: "150px",
                              }}
                            >
                              {item.total_RR_QTY}
                            </td>
                            <td
                              style={{
                                minWidth: "150px",
                              }}
                            >
                              {item.PENDING_RR_QTY}
                            </td>
                            <td
                              style={{
                                minWidth: "150px",
                              }}
                            >
                              {item.total_DAMAGE_QTY}
                            </td>
                            <td
                              style={{
                                minWidth: "150px",
                              }}
                            >
                              {item.total_CLAIM_QTY}
                            </td>
                            <td
                              style={{
                                minWidth: "150px",
                              }}
                            >
                              {item.total_NON_CLAIM_QTY}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

const mapStateToProps = (state) => ({
  Auth: state.Auth,
});

const mapDispatchToProps = {
  loading,
};

export default connect(mapStateToProps, mapDispatchToProps)(RRSummaryReport);
