import moment from "moment";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { connect } from "react-redux";
import Select from "react-select";
import { loading } from "../../actions/loadingAction";
import ExcelReport from "../../Functions/ExcelReport";
import ViewDepotsByComma from "../../Functions/ViewDepotsByComma";
import http from "../../services/apicall";
import apis from "../../services/apis";
import salesHead from "../Inventory_Package/salesHead";

export const ColsolidatedReportException = (props) => {
  const { register, handleSubmit, watch, errors, setValue } = useForm();
  const [allDepot, setAllDepot] = useState([]);
  const [allData, setAllData] = useState([]);

  const watchAllFields = watch();

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

  useEffect(() => {
    getDepot();
  }, []);

  const onSubmit = async (data) => {
    let IM_DATE_FROM = moment(data.IM_DATE_FROM).format("YYYYMMDD");
    let IM_DATE_TO = moment(data.IM_DATE_TO).format("YYYYMMDD");

    if (!data.DEPOT) {
      data.DEPOT = allDepot.map((item) => {
        return { DEPOT: item.DEPOT };
      });
    } else {
      data.DEPOT = [{ DEPOT: data.DEPOT }];
    }

    props.loading(true);
    http
      .post(apis.COMMON_POST_WITH_FM_NAME, {
        fm_name: "ZRFC_RAKE_GRN_REP",
        params: {
          IM_DEPOT: data.DEPOT,
          IM_DATE_FROM,
          IM_DATE_TO,
        },
      })
      .then((res) => {
        let returnData = res.data.result.IT_DATA;
        checkDeliveryMappedWithRR(returnData, data.IM_DEFAULTR);
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        props.loading(false);
      });
  };

  const checkDeliveryMappedWithRR = async (data, status) => {
    props.loading(true);

    try {
      const res = await http.post(
        "/check-delivery-number-mapped-with-rr",
        data
      );

      if (res.data.code === 0) {
        let updatedData = res.data.result;

        // get all unique depot from data
        let allDepot = [...new Set(updatedData.map((item) => item.DEPOT))];

        let cfaDetails = await getDepotDetails(allDepot);

        // add cfa to updatedData
        updatedData = updatedData.map((item) => {
          return {
            ...item,
            ALL_CFA: cfaDetails
              .filter((cfa) => cfa.DEPOT === item.DEPOT)
              .filter((ele) => !salesHead.includes(ele.CFA_CODE)),
          };
        });

        if (status === "all") {
        } else if (status === "yes") {
          updatedData = updatedData.filter((item) => item.RR_NO);
        } else if (status === "no") {
          updatedData = updatedData.filter((item) => !item.RR_NO);
        }

        setAllData(updatedData);
      } else {
      }
    } catch (err) {
      console.log(err);
    } finally {
      props.loading(false);
    }
  };

  let columns = [
    { title: "Status", key: "STATUS", width: "50px" },
    { title: "Rake No", key: "RAKE_NO", width: "200px" },
    { title: "Dist Channel", key: "DIST_CHANNEL" },
    { title: "Material Code", key: "MATERIAL" },
    { title: "Material Name", key: "MATERIAL_DESC", width: "300px" },
    { title: "Delivery Qty", key: "GR_QTY" },
    { title: "DO Number", key: "DELIVERY_NO", width: "120px" },
    { title: "MAT Doc Number", key: "MAT_DOC" },
    { title: "GRN Date", key: "GRN_DATE" },
    { title: "Suppply Plant", key: "MFG_PLANT" },
    { title: "Rec. Plant", key: "DEPOT", width: "300px" },
    { title: "Region", key: "REGION" },
    { title: "Location", key: "DEPOT_LOCATION" },
    { title: "CFA Name", key: "ALL_CFA" },
    { title: "RR Number", key: "RR_NO" },
  ];

  const dataFormat = (value, key, row) => {
    if (key === "GRN_DATE") {
      return moment(value, "YYYYMMDD").format("DD/MM/YYYY");
    } else if (key === "MFG_PLANT") {
      return row.MFG_PLANT + " - " + row.MFG_PLANT_NAME;
    } else if (key === "DEPOT") {
      return row.DEPOT + " - " + row.DEPOT_NAME;
    } else if (key === "STATUS") {
      if (row.RR_NO) return <button className="badge-button success"></button>;
      return <button className="badge-button danger"></button>;
    } else if (key === "ALL_CFA") {
      return (
        <ViewDepotsByComma
          data={value.map((item) => {
            return {
              label: item.CFA_CODE.replace(/^0+/, "") + " - " + item.CFA_NAME,
              value: item.CFA_CODE.replace(/^0+/, ""),
            };
          })}
        />
      );
    } else if (key === "REGION") {
      return row.DEPOT_REG + " - " + row.DEPOT_REG_DESC;
    } else if (key === "MATERIAL") {
      return row.MATERIAL.replace(/^0+/, "");
    } else {
      return value ? value : "-";
    }
  };

  const getDepotDetails = async (data) => {
    try {
      props.loading(true);
      if (data.length === 0) {
        return {};
      }

      let IM_DEPOT = data.map((item) => {
        return { DEPOT: item };
      });

      let depotDetails = await http.post(apis.COMMON_POST_WITH_FM_NAME, {
        fm_name: "ZRFC_GET_DEPOT_CFA",
        params: {
          IM_DEPOT,
        },
      });

      if (depotDetails.data.result.IM_DATA.length === 0) {
        return [];
      }

      return depotDetails.data.result.IM_DATA;
    } catch (err) {
      getDepotDetails(data);
    } finally {
      props.loading(false);
    }
  };

  return (
    <div className="filter-div">
      <div className="filter-section">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="row">
            <div className="col-12 col-md-4">
              <input name="DEPOT" ref={register} hidden />
              <div className="row">
                <div className="col-12">
                  <label>Depot</label>
                </div>
                <div className="col-12 depot-select">
                  {/* <select
                    className="basic-multi-select"
                    placeholder="Select Depot"
                    ref={register}
                    name="DEPOT"
                  >
                    <option value="">Select</option>
                    {allDepot.map((depot) => (
                      <option key={depot.DEPOT} value={depot.DEPOT}>
                        {depot.DEPOT} - {depot.DEPOT_NAME}
                      </option>
                    ))}
                  </select> */}
                  <Select
                    classNamePrefix="report-select"
                    options={allDepot.map((ele) => {
                      return {
                        value: ele.DEPOT,
                        label: ele.DEPOT + " - " + ele.DEPOT_NAME,
                      };
                    })}
                    onChange={(e) => {
                      setValue("DEPOT", e?.value);
                    }}
                    placeholder={"Select Depot"}
                    isClearable={true}
                  />
                </div>
              </div>
            </div>
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
                      .subtract(15, "day")
                      .format("YYYY-MM-DD")}
                  />
                  {errors.IM_DATE_FROM && (
                    <p className="form-error">Date should be within 31 days</p>
                  )}
                </div>
              </div>
            </div>

            <div className="col-12 col-md-2">
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
                  <label>Status</label>
                </div>
                <div className="col-12 depot-select">
                  <select
                    placeholder="Select"
                    ref={register}
                    name="IM_DEFAULTR"
                  >
                    <option value="all">All</option>
                    <option value="no">Defaulter</option>
                    <option value="yes">Completed</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="col-6 col-md-1">
              <div className="row">
                <div className="col-12">
                  <label> </label>
                </div>
                <div className="col-12">
                  <button className="search-button">
                    <i className="fas fa-search icons-button"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </form>
        <br />
        <div className="table-filter">
          <div className="row">
            <div className="col-12">
              {allData?.length > 0 && (
                <ExcelReport
                  // data={allData.map((row) =>
                  //   columns.map((column) =>
                  //     dataFormat(row[column.key], column.key, row)
                  //   )
                  // )}
                  data={allData.map((row) => {
                    return {
                      ...row,
                      STATUS: row.RR_NO ? "Rake Data Entered" : "Not Entered",
                      ALL_CFA: row.ALL_CFA.map((item) => {
                        return (
                          item.CFA_CODE.replace(/^0+/, "") +
                          " - " +
                          item.CFA_NAME
                        );
                      }).join(", "),
                      REGION: row.DEPOT_REG + " - " + row.DEPOT_REG_DESC,
                      MFG_PLANT: row.MFG_PLANT + " - " + row.MFG_PLANT_NAME,
                      DEPOT: row.DEPOT + " - " + row.DEPOT_NAME,
                      GRN_DATE: moment(row.GRN_DATE, "YYYYMMDD").format(
                        "MM/DD/YYYY"
                      ),
                    };
                  })}
                  columns={columns}
                  fileName={`Consolidated Exception Report ${moment().format()}`}
                />
              )}
            </div>
          </div>
        </div>
        <div className="filter-div">
          <div className="table-div">
            <table className="table">
              <thead>
                <tr>
                  {columns.map((column) => (
                    <th
                      key={column.key}
                      style={{
                        minWidth: column.width || "180px",
                      }}
                    >
                      {column.title}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {allData.map((row) => (
                  <tr key={row.MAT_DOC}>
                    {columns.map((column) => (
                      <td key={column.key}>
                        {dataFormat(row[column.key], column.key, row)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="row">
          <div
            className="col badge-div"
            style={{
              padding: "10px",
            }}
          >
            <label className="badge float-right">
              <button className="badge-button success"></button>Rake Data
              Entered
            </label>
            <label className="badge float-right">
              <button className="badge-button danger"></button>Rake Data Not
              Entered
            </label>
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

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ColsolidatedReportException);
