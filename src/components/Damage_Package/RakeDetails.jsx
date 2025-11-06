import moment from "moment";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { connect } from "react-redux";
import { useHistory } from "react-router-dom";
import Select from "react-select";
import Swal from "sweetalert2";
import { loading } from "../../actions/loadingAction";
import ExcelReport from "../../Functions/ExcelReport";
import http from "../../services/apicall";
import apis from "../../services/apis";

export const RakeDetails = (props) => {
  const { handleSubmit, register, watch, errors } = useForm();
  const watchAllFields = watch();

  const [allDepot, setAllDepot] = useState([]);
  const [selectedDepot, setSelectedDepot] = useState([]);
  const [allData, setAllData] = useState([]);
  const [selectedRake, setSelectedRake] = useState("");
  const [selectedRakeData, setSelectedRakeData] = useState({});

  const history = useHistory();

  const getDepot = async () => {
    try {
      props.loading(true);
      // const res = await http.post(apis.COMMON_POST_WITH_FM_NAME, {
      //   fm_name: "ZRFC_GET_DEPO",
      //   params: {
      //     IM_CFA_CODE: localStorage.getItem("user_code"),
      //     IM_FLAG: salesHead.includes(localStorage.getItem("user_code"))
      //       ? "X"
      //       : "",
      //   },
      // });

      const res = await http.post("/rfc-reducer/get-cfa-user", {
        IM_CFA_CODE: localStorage.getItem("user_code"),
      });

      if (res.data.code === 0) {
        setAllDepot(res.data.data.EX_DEPO);
      }
    } catch (err) {
      console.log(err);
    } finally {
      props.loading(false);
    }
  };

  const fetchRakeDetails = (data) => {
    console.log("Fetching rake details");
    props.loading(true);

    let IM_DATE_FROM = moment(data.IM_DATE_FROM).format("YYYYMMDD");
    let IM_DATE_TO = moment(data.IM_DATE_TO).format("YYYYMMDD");

    if (selectedDepot.length === 0) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Please select atleast one depot",
      });

      props.loading(false);
      return;
    }

    http
      .post(apis.COMMON_POST_WITH_FM_NAME, {
        fm_name: "ZRFC_RAKE_GRN_REP",
        params: {
          IM_DEPOT: selectedDepot.map((ele) => {
            return {
              DEPOT: ele.value,
            };
          }),
          IM_DATE_FROM,
          IM_DATE_TO,
        },
      })
      .then((res) => {
        if (res.data.code === 0) {
          console.log(res.data.result.IT_DATA);
          setAllData(res.data.result.IT_DATA);
        }
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        props.loading(false);
      });
  };

  useEffect(() => {
    getDepot();
  }, []);

  let columns = [
    {
      title: "",
      key: "MAT_DOC",
    },
    { key: "DEPOT", title: "Depot" },
    { key: "DEPOT_NAME", title: "Depot Name" },
    { key: "GRN_DATE", title: "Dispatch Date" },
    { key: "GR_QTY", title: "Dispatch Qty" },
    { key: "MATERIAL", title: "Material" },
    { key: "MATERIAL_DESC", title: "Material Desc" },
    { key: "MAT_DOC", title: "Mat Doc" },
  ];

  const dateFormat = (data, key) => {
    if (key === "GRN_DATE") return moment(data).format("DD-MM-YYYY");
    if (key === "MATERIAL") return data.replace(/^0+/, "");
    return data;
  };

  const openLink = (link, data) => {
    // open the link on same tab and pass the data as query params
    let url = link + "?";
    for (let key in data) {
      url += key + "=" + data[key] + "&";
    }
    history.push(url);
  };

  //++ DATA_HEADER ++//
  // MAT_DOC
  // GR_QTY
  // DEPOT
  // DEPOT_NAME
  // MATERIAL
  // MATERIAL_DESC

  //++ DATA_INPUT ++//
  // COMPLETION_TIME
  // DATE_OF_RAKE_COMPLETION
  // DATE_OF_RAKE_RECEIVED
  // DIRECT_SALE_FROM_SIDING
  // HANDLING_PARTY
  // QTY_SHIFTED_TO_GODOWN
  // RECEIVE_TIME
  // RR_DATE
  // RR_NO
  // RR_QTY
  // RR_TYPE
  // WAGON_TRANSIT
  // WAGON_TYPE
  // BRUST_BAG
  // CUT_TORN
  // DAMAGE_PER
  // DIRECT_FIR_PER
  // HANDING_DMG
  // SHTG
  // SHTG_PER
  // TOTAL_DMG
  // WATER_DMG
  // DEM_RS
  // DEPOT
  // GR_QTY
  // MATERIAL
  // MAT_DOC
  // REASON
  // REMARKS_DC_WF
  // WHR_RS

  return (
    <div className="filter-section">
      <form onSubmit={handleSubmit(fetchRakeDetails)}>
        <div className="row">
          <div className="col-12 col-md-6">
            <div className="row">
              <div className="col-12">
                <label>
                  Depot<span>*</span>
                </label>
              </div>
              <div className="col-12 depot-select">
                <Select
                  className="basic-multi-select"
                  classNamePrefix="select"
                  options={allDepot.map((ele) => {
                    return {
                      value: ele.DEPOT,
                      label: ele.DEPOT + " - " + ele.DEPOT_NAME,
                    };
                  })}
                  isMulti
                  onChange={(e) => {
                    setSelectedDepot(e);
                  }}
                  placeholder="Select Depot"
                />
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
                  // defaultValue={moment()
                  //   .subtract(2, "day")
                  //   .format("YYYY-MM-DD")}
                  defaultValue={"2021-09-01"}
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
                  // defaultValue={moment().format("YYYY-MM-DD")}
                  defaultValue={"2021-09-30"}
                />
                {errors.IM_DATE_TO && (
                  <p className="form-error">Date should be within 31 days</p>
                )}
              </div>
            </div>
          </div>

          <div className="col-6 col-md-1">
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
          <div className="col-6 col-md-1">
            <div className="row">
              <div className="col-12">
                <label> </label>
              </div>
              <div className="col-12">
                <button
                  className="search-button"
                  onClick={() => {
                    localStorage.removeItem("displayInventory");
                    window.location.reload();
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
      </form>

      {/* table */}

      <br />
      <br />
      <div className="row">
        <div className="col-12">
          <div className="background" style={{ margin: 0 }}>
            <div className="table-filter">
              <div className="filter-div">
                <div className="row">
                  <div className="col-12 col-md-12">
                    {allData.length > 0 && <ExcelReport data={allData} />}
                    {selectedRake.length > 0 && (
                      <>
                        <button
                          className="goods-button"
                          type="button"
                          style={{
                            float: "right",
                            backgroundColor: "rgb(15, 111, 162)",
                          }}
                          onClick={() =>
                            openLink(
                              "/dashboard/damage-data-entry/claim-insurance",
                              selectedRakeData
                            )
                          }
                        >
                          Claim Insurance
                        </button>
                        <button
                          className="goods-button"
                          type="button"
                          style={{
                            float: "right",
                            backgroundColor: "rgb(15, 111, 162)",
                          }}
                          onClick={() =>
                            openLink(
                              "/dashboard/damage-data-entry/rake-damage-data",
                              selectedRakeData
                            )
                          }
                        >
                          Rake Damage
                        </button>
                        <button
                          className="goods-button"
                          onClick={() =>
                            openLink(
                              "/dashboard/damage-data-entry/rake-handling-data",
                              selectedRakeData
                            )
                          }
                          type="button"
                          style={{
                            float: "right",
                            backgroundColor: "rgb(15, 111, 162)",
                          }}
                        >
                          Rake Handling
                        </button>

                        {/* <button
                          className="goods-button"
                          type="button"
                          style={{
                            float: "right",
                            backgroundColor: "rgb(15, 111, 162)",
                          }}
                          onClick={() =>
                            openLink(
                              "/dashboard/damage-data-entry/demmurage-data",
                              selectedRakeData
                            )
                          }
                        >
                          Demmurage Data
                        </button> */}
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="table-div" style={{ minHeight: "auto" }}>
              <table className="table" style={{ margin: "10px 0" }}>
                <thead>
                  <tr>
                    {columns.map((column, index) => (
                      <th key={index}>{column.title}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {allData.map((ele, i) => (
                    <tr key={i}>
                      {columns.map((column, index) => {
                        if (column.title === "View") {
                          return (
                            <td key={index}>
                              <i
                                className="fas fa-eye"
                                style={{ color: "black", cursor: "pointer" }}
                              ></i>
                            </td>
                          );
                        } else if (column.title === "") {
                          return (
                            <td key={index}>
                              <input
                                type="radio"
                                onChange={() => {
                                  setSelectedRake(ele[column.key]);
                                  setSelectedRakeData(ele);
                                }}
                                value={ele[column.key]}
                                name="selectRake"
                              />{" "}
                            </td>
                          );
                        } else {
                          return (
                            <td key={index}>
                              {dateFormat(ele[column.key], column.key)}
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
  );
};

const mapStateToProps = (state) => ({});

const mapDispatchToProps = {
  loading,
};

export default connect(mapStateToProps, mapDispatchToProps)(RakeDetails);
