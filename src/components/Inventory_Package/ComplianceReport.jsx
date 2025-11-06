import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import useRegion from "../../hook/useRegion";
import useDepot from "../../hook/useDepot";
import { useForm } from "react-hook-form";
import moment from "moment";
import Select from "react-select";
import http from "../../services/apicall";
import { loading } from "../../actions/loadingAction";
import { useHistory } from "react-router-dom";

import useComp from "../../hook/useComp";
import apis from "../../services/apis";
import * as XLSX from "xlsx";
import ViewDepotsByComma from "../../Functions/ViewDepotsByComma";
import salesHead from "./salesHead";
import { removeZero } from "../../services/utils";

export const ComplianceReport = (props) => {
  const region = useRegion();
  const depot = useDepot();
  const cfa = props.Auth.mappedCFA;
  const comp = useComp();

  const [reportData, setReportData] = useState([]);
  const [allData, setAllData] = useState([]);
  const [allDepots, setAllDepots] = useState([]);
  const [view, setView] = useState(false);

  const history = useHistory();

  let columns = [
    { title: "Depots Code", key: "DEPOTS" },
    { title: "CFA Code", key: "CFA_CODE" },
    { title: "CFA Name", key: "CFA_NAME" },
    { title: "Region Code", key: "REGION_CODE" },
    { title: "Region Name", key: "REGION_NAME" },
    { title: "Company Code", key: "COMP_CODE" },
    { title: "Company Name", key: "COMP_NAME" },
    { title: "Date", key: "PHY_DATE" },
    { title: "Time", key: "PHY_TIME" },
    { title: "View", key: "" },
  ];

  const [params, setParams] = useState({});

  const { register, handleSubmit, errors, watch, triggerValidation, setValue } =
    useForm({
      mode: "onSubmit",
      reValidateMode: "onChange",
    });

  const watchAllFields = watch();

  const getReport = (data) => {
    props.loading(true);

    data.IM_DATE_FROM = data.IM_DATE_FROM.split("-").join("");
    data.IM_DATE_TO = data.IM_DATE_TO.split("-").join("");

    if (data.CFA_CODE) {
      data.CFA_CODE = [data.CFA_CODE];
    } else {
      data.CFA_CODE = cfa.map((item) => removeZero(item.CFA_CODE));
    }

    console.log(allDepots, "Data");

    if (data.DEPOT) {
      data.DEPOT = [data.DEPOT];
    } else {
      data.DEPOT = allDepots?.map((item) => removeZero(item.PLANT));
    }

    setParams(data);

    http
      .post("/get-compliance-report", data)
      .then((res) => {
        if (res.data.status) {
          setReportData(res.data.data);
          createComplianceReport(
            res.data.data,
            data.CFA_CODE.map((ele) => {
              return { CFA_CODE: ele };
            })
          );
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
    triggerValidation("IM_DATE_TO");
  }, [watchAllFields.IM_DATE_FROM]);

  useEffect(() => {
    triggerValidation("IM_DATE_FROM");
  }, [watchAllFields.IM_DATE_TO]);

  // useEffect(() => {
  //   // extract search params from url
  //   const searchParams = new URLSearchParams(window.location.search);
  //   let VIEW = searchParams.get("VIEW");
  //   let IM_DATE_FROM = searchParams.get("IM_DATE_FROM");
  //   let IM_DATE_TO = searchParams.get("IM_DATE_TO");
  //   let COMP_CODE = searchParams.get("COMP_CODE");
  //   let REGION_CODE = searchParams.get("REGION_CODE");
  //   let CFA_CODE = searchParams.get("CFA_CODE");
  //   let DEPOT = searchParams.get("DEPOT");

  //   if (VIEW) {
  //     let data = {
  //       IM_DATE_FROM,
  //       IM_DATE_TO,
  //       COMP_CODE,
  //       REGION_CODE,
  //       CFA_CODE,
  //       DEPOT,
  //     };

  //     getReport(data);
  //   }

  //   setView(VIEW);
  // }, [window.location]);

  const viewEntry = (data) => {
    let param = {
      ...params,
      VIEW: true,
    };

    window.open(
      `/dashboard/stock-report/compliance-reports?VIEW=true&IM_DATE_FROM=${param.IM_DATE_FROM}&IM_DATE_TO=${param.IM_DATE_TO}&COMP_CODE=${param.COMP_CODE}&REGION_CODE=${param.REGION_CODE}&CFA_CODE=${param.CFA_CODE}&DEPOT=${params.DEPOT}`,
      "_blank"
    );
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

  const extractDepots = (total = [], submit = []) => {
    return total.filter((n) => !submit.includes(n));
  };

  const getTotalDepotsByCFA = async (data) => {
    try {
      props.loading(true);
      const IM_CFA = data.map((item) => {
        return { CFA_CODE: "00" + item };
      });

      let totalDepotByCFA = await http.post(apis.COMMON_POST_WITH_FM_NAME, {
        fm_name: "ZRFC_GET_CFA_DEPOT",
        params: {
          IM_CFA,
        },
      });

      let result = totalDepotByCFA.data.result.IM_DATA;

      if (result.length === 0) {
        return {};
      }

      let returnData = result.reduce((acc, item) => {
        (acc[removeZero(item.CFA_CODE)] =
          acc[removeZero(item.CFA_CODE)] || []).push(item);
        return acc;
      }, {});

      return returnData;
    } catch (err) {
      await getTotalDepotsByCFA(data);
    } finally {
      props.loading(false);
    }
  };

  const getCFADetails = async (data) => {
    try {
      props.loading(true);
      if (data.length === 0) {
        return {};
      }

      let cfaDetails = await http.post("/login/get_mulple_users", {
        user_codes: data,
      });

      if (cfaDetails.data.result.length === 0) {
        return {};
      }

      let returnData = cfaDetails.data.result.reduce((acc, item) => {
        acc[item.user_code] = item;
        return acc;
      }, {});

      return returnData;
    } catch (err) {
      getCFADetails(data);
    } finally {
      props.loading(false);
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

  const calculateUniqueDepots = (data) => {
    let depots = data.map((item) => {
      return item.DEPOTS.map((depot) => depot.value);
    });
    depots = depots.flat();
    let uniqueDepots = [...new Set(depots)];
    return {
      count: uniqueDepots.length,
      depots: uniqueDepots,
    };
  };

  const createComplianceReport = async (data, cfaData) => {
    // Group data by CFA_CODE by reducing the array

    const groupedData = data.reduce((acc, item) => {
      (acc[item.CFA_CODE] = acc[item.CFA_CODE] || []).push(item);
      return acc;
    }, {});

    const groupedDataCFA = cfaData.reduce((acc, item) => {
      let CFA = removeZero(item.CFA_CODE);
      acc[CFA] = acc[CFA] || [];
      return acc;
    }, {});

    console.log(groupedDataCFA, cfa);

    // merge groupedData and groupedDataCFA
    const mergeGroupData = Object.assign(groupedDataCFA, groupedData);

    console.log(mergeGroupData);
    let TOTAL_DEPOT = await getTotalDepotsByCFA(Object.keys(mergeGroupData));

    let tableData = Object.entries(mergeGroupData).map((item, index) => {
      let COM_DEPOT = calculateUniqueDepots(item[1]);

      let CFA_CODE = item[0];

      let CFA_NAME = cfa.find(
        (item) => removeZero(item.CFA_CODE) === CFA_CODE
      )?.CFA_NAME;

      return {
        CFA_CODE,
        CFA: CFA_CODE + " - " + CFA_NAME,
        COM_DEC: item[1].length,
        COM_DEPOT: COM_DEPOT.count,
        TOTAL_DEPOT: TOTAL_DEPOT[CFA_CODE]?.length || 0,
        NON_COM_DEC: TOTAL_DEPOT[CFA_CODE]?.length - COM_DEPOT?.count,
        NON_COM_DEC_DEPOTS: extractDepots(
          TOTAL_DEPOT[CFA_CODE]?.map((item) => item.DEPOT) || [],
          COM_DEPOT.depots
        ),
        COMPLIANCE_PERCENTAGE: `${(
          (COM_DEPOT?.count / TOTAL_DEPOT[CFA_CODE]?.length) *
          100
        ).toFixed(1)}%`,
      };
    });

    let totalRow = {
      CFA_CODE: "total",
      CFA: "TOTAL DATA",
      COM_DEC: tableData.reduce((acc, item) => acc + item.COM_DEC, 0),
      COM_DEPOT: tableData.reduce((acc, item) => acc + item.COM_DEPOT, 0),
      TOTAL_DEPOT: tableData.reduce((acc, item) => acc + item.TOTAL_DEPOT, 0),
      NON_COM_DEC: tableData.reduce((acc, item) => acc + item.NON_COM_DEC, 0),
      NON_COM_DEC_DEPOTS: tableData
        .reduce((acc, item) => acc.concat(item.NON_COM_DEC_DEPOTS), [])
        .flat(),
      COMPLIANCE_PERCENTAGE: `${(
        (tableData.reduce((acc, item) => acc + item.COM_DEPOT, 0) /
          tableData.reduce((acc, item) => acc + item.TOTAL_DEPOT, 0)) *
        100
      ).toFixed(1)}%`,
    };

    console.log([...tableData, totalRow]);

    setAllData([...tableData, totalRow]);
  };

  useEffect(() => {
    if (props.Auth.cfa.USER_CATEGORY === "REGH") {
      setAllDepots(region);
    } else {
      setAllDepots(depot);
    }
  }, [props.Auth.cfa, region, depot]);

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

  const createNonComplianceReport = async (data, fileName) => {
    let depotData = await getDepotDetails(data.NON_COM_DEC_DEPOTS);

    let cfa = depotData.map((item) => removeZero(item.CFA_CODE));

    let cfaDetails = await getCFADetails(cfa);

    let depotLocation = await getDepotLocation(data.NON_COM_DEC_DEPOTS);

    console.log(depotLocation);

    let finalData = depotData.map((item) => {
      return {
        ...item,
        ...cfaDetails[removeZero(item.CFA_CODE)],
      };
    });

    let columns = [
      "CFA Code",
      "CFA Name",
      "Depot",
      "Depot Name",
      "Region",
      "Region Name",
      "Location",
      "Email",
      "Mobile",
    ];
    let salesHeadData = salesHead;

    finalData = finalData.map((item) => {
      return {
        CFA_CODE: item.CFA_CODE,
        CFA_NAME: item.CFA_NAME,
        DEPOT: item.DEPOT,
        DEPOT_NAME: item.DEPOT_NAME,
        REGION: item.REGION,
        REGIO_DESC: item.REGIO_DESC,
        LOCATION: depotLocation[item.DEPOT] || "",
        email: item.email,
        mobile: item.mobile,
      };
    });

    // remove sales head data
    finalData = finalData.filter((item) => {
      return !salesHeadData.includes(item.CFA_CODE);
    });

    finalData = finalData.map((item) => {
      return Object.values(item);
    });

    // add columns add first
    finalData.unshift(columns);

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.aoa_to_sheet(finalData);

    XLSX.utils.book_append_sheet(workbook, worksheet, "Comparative Report");
    XLSX.writeFile(workbook, `${fileName}.xlsx`);
  };

  return (
    <>
      {view ? (
        <div
          className="filter-section comparative-report"
          style={{
            padding: "20px",
          }}
        >
          <br />
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
                {reportData.map((ele, i) => (
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
      ) : (
        <div className="filter-section comparative-report">
          <form onSubmit={handleSubmit((data) => getReport(data))}>
            <div className="row">
              {props.Auth.cfa.USER_CATEGORY !== "REGH" && (
                <>
                  <div className="col-12 col-md-4">
                    <div className="row">
                      <div className="col-12">
                        <label>Company Code</label>
                      </div>
                      <div className="col-12 depot-select">
                        <i className="fas fa-angle-down icons"></i>
                        <select
                          style={{ margin: "0px !important" }}
                          name="COMP_CODE"
                          ref={register}
                        >
                          <option value="">Select Company Code</option>
                          {comp?.map((item, index) => (
                            <option key={index} value={item.COMP_CODE}>
                              {removeZero(item.COMP_CODE)} - {item.COMP_NAME}
                            </option>
                          ))}
                        </select>
                        {errors.COMP_CODE && (
                          <span className="error">This field is required</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="col-12 col-md-4">
                    <div className="row">
                      <div className="col-12">
                        <label>Region</label>
                      </div>
                      <div className="col-12 depot-select">
                        <i className="fas fa-angle-down icons"></i>
                        <select
                          style={{ margin: "0px !important" }}
                          name="REGION_CODE"
                          ref={register}
                        >
                          <option value="">Select Region</option>
                          {/* remove duplicate region */}
                          {region
                            ?.filter(
                              (item, index, self) =>
                                index ===
                                self.findIndex((t) => t.REGION === item.REGION)
                            )
                            ?.map((item, index) => (
                              <option key={index} value={item.REGION}>
                                {removeZero(item.REGION)} - {item.REGION_DESC}
                              </option>
                            ))}
                        </select>
                        {errors.REGION_CODE && (
                          <span className="error">This field is required</span>
                        )}
                      </div>
                    </div>
                  </div>
                </>
              )}

              <div className="col-12 col-md-4">
                <div className="row">
                  <div className="col-12">
                    <label>CFA</label>
                  </div>
                  <div className="col-12 depot-select">
                    <i className="fas fa-angle-down icons"></i>

                    <Select
                      options={cfa?.map((item) => {
                        return {
                          value: removeZero(item.CFA_CODE),
                          label: `${removeZero(item.CFA_CODE)} - ${
                            item.CFA_NAME
                          }`,
                        };
                      })}
                      onChange={(e) => {
                        setValue("CFA_CODE", e.value);
                      }}
                      classNamePrefix="react-select"
                      placeholder="Select CFA"
                    />

                    <input type="text" name="CFA_CODE" ref={register} hidden />
                    {errors.CFA_CODE && (
                      <span className="error">This field is required</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="col-12 col-md-4">
                <div className="row">
                  <div className="col-12">
                    <label>Depot</label>
                  </div>
                  <div className="col-12 depot-select">
                    <i className="fas fa-angle-down icons"></i>

                    <Select
                      options={allDepots?.map((item) => {
                        return {
                          value: item.PLANT,
                          label: `${item.PLANT} - ${item.PLANT_NAME}`,
                        };
                      })}
                      onChange={(e) => {
                        setValue("DEPOT", e.value);
                      }}
                      placeholder="Select Depot"
                      classNamePrefix="react-select"
                    />

                    <input type="text" name="DEPOT" ref={register} hidden />
                    {errors.DEPOT && (
                      <span className="error">This field is required</span>
                    )}
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
                        .subtract(2, "days")
                        .format("YYYY-MM-DD")}
                    />
                    {errors.IM_DATE_FROM && (
                      <p className="form-error">
                        Date should be within 31 days
                      </p>
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
                      <p className="form-error">
                        Date should be within 31 days
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="col-12 col-md-1">
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
                        localStorage.removeItem("complianceReport");
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
          <br />
          <br />

          <div className="background" style={{ margin: 0 }}>
            <div className="table-filter">
              <div className="filter-div">
                <div className="row">
                  <div className="table-div" style={{ width: "100%" }}>
                    <table className="table">
                      <thead>
                        <tr>
                          <th className="table-sticky-vertical">
                            CFA Code and Name
                          </th>
                          <th className="table-sticky-vertical">
                            Total Depots
                          </th>
                          <th className="table-sticky-vertical">
                            Depots Complied
                          </th>
                          <th className="table-sticky-vertical">
                            Complied Declaration
                          </th>
                          <th className="table-sticky-vertical">
                            Depots Non Complied
                          </th>
                          <th className="table-sticky-vertical">
                            Compliance %
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {allData?.map((item, index) => {
                          return (
                            <tr key={item.CFA_CODE}>
                              <td>{item.CFA}</td>
                              <td>{item.TOTAL_DEPOT}</td>
                              <td>{item.COM_DEPOT}</td>
                              <td>{item.COM_DEC}</td>
                              <td
                                style={{
                                  cursor: item.NON_COM_DEC && "pointer",
                                  color: item.NON_COM_DEC && "blue",
                                  fontWeight: item.NON_COM_DEC && "bold",
                                }}
                                onClick={() =>
                                  createNonComplianceReport(
                                    item,
                                    `Non Compliance Report ${item.CFA}`
                                  )
                                }
                              >
                                {item.NON_COM_DEC}
                              </td>
                              <td>{item.COMPLIANCE_PERCENTAGE}</td>
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
      )}
    </>
  );
};

const mapStateToProps = (state) => ({
  Auth: state.Auth,
});

const mapDispatchToProps = {
  loading,
};

export default connect(mapStateToProps, mapDispatchToProps)(ComplianceReport);
