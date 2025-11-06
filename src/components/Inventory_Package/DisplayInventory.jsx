import moment from "moment";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { connect, useSelector } from "react-redux";
import useRegion from "../../hook/useRegion";
import http from "../../services/apicall";

import { useHistory } from "react-router-dom";
import { loading } from "../../actions/loadingAction";

import ExcelReport from "../../Functions/ExcelReport";

import ViewDepotsByComma from "../../Functions/ViewDepotsByComma";
import { removeZero } from "../../services/utils";
import { ExportDataFormat, columnsDownload } from "./ExportToExcel";
import salesHead from "./salesHead";
import Swal from "sweetalert2";

export const DisplayInventory = (props) => {
  let columns = [
    { title: "Depots Code", key: "DEPOTS" },
    { title: "CFA Code", key: "CFA_CODE" },
    { title: "CFA Name", key: "CFA_NAME" },
    { title: "Region Code", key: "REGION_CODE" },
    { title: "Region Name", key: "REGION_NAME" },
    { title: "Date", key: "PHY_DATE" },
    { title: "Time", key: "PHY_TIME" },
    { title: "View", key: "" },
    { title: "Action", key: "" },
  ];

  const cfa = useSelector((state) => state.Auth.mappedCFA);

  const cfaUser = useSelector((state) => state.Auth.cfa);

  const [allData, setAllData] = useState([]);

  const history = useHistory();

  const region = useRegion();

  const { register, setValue, handleSubmit, watch, errors, triggerValidation } =
    useForm({
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
  // remove zero from start of string

  const fetchInventory = (data) => {
    props.loading(true);

    let params = data;
    params.IM_DATE_FROM = data.IM_DATE_FROM.split("-").join("");
    params.IM_DATE_TO = data.IM_DATE_TO.split("-").join("");

    localStorage.setItem("displayInventory", JSON.stringify(params));

    let postData = {
      IM_DATE_FROM: data.IM_DATE_FROM,
      IM_DATE_TO: data.IM_DATE_TO,
    };

    if (salesHead.includes(localStorage.getItem("user_code"))) {
      let selectedRegions = data.IM_REGION
        ? data.IM_REGION
        : [...new Set(region?.map((ele) => ele.REGION))];

      postData.REGION = selectedRegions;
    } else {
      postData.CFA_CODE = cfa.map((ele) => ele.CFA_CODE.replace(/^0+/, ""));
    }

    if (data.IM_CFA) {
      postData.CFA_CODE = data.IM_CFA.replace(/^0+/, "");
    }

    http
      .post("/get-all-physical-inventory", postData)
      .then((res) => {
        if (res.data.code === 0) {
          setAllData(res.data.data);
        }
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        props.loading(false);
      });
  };

  const viewInventory = (data) => {
    let params = {
      PHY_ID: data.PHY_ID,
      VIEW: true,
    };

    history.push({
      pathname: "/dashboard/physical-inventory/create-inventory",
      search: `?${new URLSearchParams(params).toString()}`,
    });
  };

  const deleteInventory = (id) => {
    props.loading(true);

    http
      .post(`/delete-physical-inventory/${id}`, {})
      .then((res) => {
        if (res.data.code === 0) {
          props.loading(false);
          setAllData(allData.filter((ele) => ele.PHY_ID !== id));
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const dateTimeFormat = (data, key) => {
    if (key === "PHY_DATE") {
      return moment(data, "YYYYMMDD").format("DD/MM/YYYY");
    } else if (key === "PHY_TIME") {
      return moment(data, "HHmmss").format("HH:mm");
    } else if (key === "DEPOTS") {
      return <ViewDepotsByComma data={data} />;
    } else {
      return data;
    }
  };

  useEffect(() => {
    let params = JSON.parse(localStorage.getItem("displayInventory"));
    if (params && cfa?.length > 0 && region?.length > 0) {
      Object.keys(params).forEach((key) => {
        if (key === "IM_DATE_FROM" || key === "IM_DATE_TO") {
          setValue(key, moment(params[key], "YYYYMMDD").format("YYYY-MM-DD"));
        } else {
          console.log(key, params[key]);
          setValue(key, params[key]);
        }
      });
      fetchInventory(params);
    }
  }, [cfa]);

  return (
    <div className="filter-section">
      <form onSubmit={handleSubmit(fetchInventory)}>
        {/* display
         */}
        <input type="hidden" ref={register} name="IM_APP_FLAG" value="" />
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
                  ref={register}
                  name="IM_CFA"
                >
                  <option value={""}>Select CFA</option>
                  {cfa?.map((item, index) => (
                    <option key={index} value={item.CFA_CODE}>
                      {removeZero(item.CFA_CODE)} - {item.CFA_NAME}
                    </option>
                  ))}
                </select>
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
                    {allData.length > 0 && (
                      <ExcelReport
                        data={ExportDataFormat(allData)}
                        columns={columnsDownload}
                      />
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
                      <th className="table-sticky-vertical" key={index}>
                        {column.title}
                      </th>
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
                                onClick={() => viewInventory(ele)}
                                className="fas fa-eye"
                                style={{ color: "black", cursor: "pointer" }}
                              ></i>
                            </td>
                          );
                        } else if (column.title === "Select") {
                          return (
                            <td key={index}>
                              <input type="checkbox" />{" "}
                            </td>
                          );
                        } else if (column.title === "Action") {
                          return (
                            <>
                              {cfaUser?.USER_CATEGORY === "REGH" && (
                                <td key={index}>
                                  <i
                                    onClick={() => {
                                      Swal.fire({
                                        title: "Are you sure?",
                                        text: "You will not be able to recover this inventory after deletion",
                                        icon: "warning",
                                        showCancelButton: true,
                                        confirmButtonColor: "#3085d6",
                                        cancelButtonColor: "#d33",
                                        confirmButtonText: "Yes, delete it!",
                                      }).then((result) => {
                                        console.log(result);
                                        if (result.value) {
                                          deleteInventory(ele.PHY_ID);
                                        } else {
                                          Swal.fire(
                                            "Cancelled",
                                            "Your file is safe :)",
                                            "error"
                                          );
                                        }
                                      });
                                    }}
                                    className="fas fa-trash"
                                    style={{ color: "red", cursor: "pointer" }}
                                  ></i>
                                </td>
                              )}
                            </>
                          );
                        } else {
                          return (
                            <td key={index}>
                              {dateTimeFormat(ele[column.key], column.key)}
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

export default connect(mapStateToProps, mapDispatchToProps)(DisplayInventory);
