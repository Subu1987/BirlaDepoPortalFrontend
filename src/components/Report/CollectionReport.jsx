import React, { useState } from "react";
import { connect } from "react-redux";
import http from "../../services/apicall";
import { loading } from "../../actions/loadingAction";
import ExcelReport from "../../Functions/ExcelReport";
import moment from "moment";
import { useForm } from "react-hook-form";
import apis from "../../services/apis";
import CustomTable from "../shared/ReactTable";
import Select from "react-select";
import AsyncSelect from "react-select/async";
import useComp from "../../hook/useComp";
import useRegion from "../../hook/useRegion";
import useSalesGrp from "../../hook/useSalesGrp";
import useSalesDist from "../../hook/useSalesDist";
import useDistChan from "../../hook/useDistChan";
import store from "../../store";
import Swal from "sweetalert2";
import fetchCustomerNumber from "../../Functions/fetchCustomer";

export const CollectionReport = (props) => {
  const [allData, setAllData] = useState([]);

  const { register, handleSubmit, errors, watch, setValue } = useForm();

  const companyCode = useComp();
  const region = useRegion();
  const salesGrp = useSalesGrp();
  const salesDist = useSalesDist();
  const distChan = useDistChan();
  const watchAllFields = watch();

  const formatDate = (date) => {
    return moment(date, "YYYY-MM-DD").format("YYYYMMDD");
  };

  let columnsView = [
    { title: "Company Code", key: "BUKRS" },
    { title: "Rname", key: "BEZEI" },
    { title: "Region", key: "REGIO" },
    { title: "Collection center description", key: "ZZCOL_DESC" },
    {
      title: "Deposit Date",
      key: "BUDAT",
      render: (text) => moment(text, "YYYYMMDD").format("DD/MM/YYYY"),
    },
    { title: "Drawee Bank Name", key: "BKTXT" },
    { title: "Document Num", key: "BELNR" },
    { title: "Customer", key: "KUNNR" },
    { title: "Customer Name", key: "NAME1" },
    { title: "Amount", key: "DMBTRT" },
    { title: "Collection Center", key: "ZZCOL_CEN" },
    { title: "Instrument Number", key: "XBLNR" },
    { title: "Sales Group", key: "VKGRP" },
    { title: "Sales Group Name", key: "BEZEI1" },
    { title: "Payment Method", key: "ZLSCH" },
    { title: "Item Text", key: "SGTXT" },
    { title: "Document Type", key: "BLART" },
    { title: "Sales district", key: "BZIRK" },
    { title: "Sales district Name", key: "BZTXT" },
    { title: "Sales Office", key: "VKBUR" },
    { title: "Sales Office Name", key: "SOFFNME" },
    { title: "Distribution Channel", key: "VTWEG" },
    { title: "Distribution Channel Name", key: "DVCHNME" },
    { title: "Business Place", key: "BUPLA" },
    { title: "Profit Center", key: "PRCTR" },
  ];

  // Sold TO Party
  const loadOptions = async (inputValue) => {
    if (inputValue !== "" && inputValue.length > 4) {
      return await fetchCustomerNumber(inputValue, "KUNNR", "NAME1");
    }
  };

  const handleInputChange = (newValue) => {
    const inputValue = newValue.replace(/\W/g, "");
    return inputValue;
  };

  const getCollectionReport = async (data) => {
    let postData = {
      ...data,
      DATE_TO: formatDate(data.DATE_TO),
      DATE_FROM: formatDate(data.DATE_FROM),
      PA_FDATE: formatDate(data.DATE_FROM),
      PA_TDATE: formatDate(data.DATE_TO),
      IM_LOGIN_ID: localStorage.getItem("user_code"),
    };

    console.log(postData);

    try {
      store.dispatch({ type: "LOADING", payload: true });
      const res = await http.post(apis.COMMON_POST_WITH_FM_NAME, {
        fm_name: "ZRFC_DAILY_COLLECTION_REPORT",
        params: {
          ...postData,
        },
      });

      if (res.data.code === 0) {
        setAllData(res.data.result.IT_FINAL);
      } else {
        Swal.fire({
          title: "Error",
          text: "Something went wrong",
          icon: "error",
        });
      }
    } catch (error) {
    } finally {
      store.dispatch({ type: "LOADING", payload: false });
    }
  };

  return (
    <div className="filter-section">
      <form onSubmit={handleSubmit((data) => getCollectionReport(data))}>
        <div className="row">
          <div className="col-12 col-md-3">
            <div className="row">
              <div className="col-12">
                <label>
                  Company Code From<span>*</span>
                </label>
                <input
                  name="BUKRS_FROM"
                  ref={register({
                    required: "Company Code is mandatory",
                  })}
                  hidden
                />
                <Select
                  classNamePrefix="report-select"
                  options={companyCode.map((ele) => {
                    return {
                      value: ele.COMP_CODE,
                      label: ele.COMP_CODE + " - " + ele.COMP_NAME,
                    };
                  })}
                  onChange={(e) => setValue("BUKRS_FROM", e.value)}
                  placeholder="Select Company Code"
                />
                {errors.BUKRS_FROM && (
                  <span style={{ color: "red" }}>This field is required</span>
                )}
              </div>
            </div>
          </div>
          <div className="col-12 col-md-3">
            <div className="row">
              <div className="col-12">
                <label>Company Code To</label>
                <input name="BUKRS_TO" ref={register} hidden />

                <Select
                  classNamePrefix="report-select"
                  options={companyCode.map((ele) => {
                    return {
                      value: ele.COMP_CODE,
                      label: ele.COMP_CODE + " - " + ele.COMP_NAME,
                    };
                  })}
                  onChange={(e) => setValue("BUKRS_TO", e.value)}
                  placeholder="Select Company Code"
                />
              </div>
            </div>
          </div>
          {/* region */}
          <div className="col-12 col-md-3">
            <div className="row">
              <div className="col-12">
                <label>
                  Region From<span>*</span>
                </label>
                <input
                  name="REGIO_FROM"
                  ref={register({
                    required: "Company Code is mandatory",
                  })}
                  hidden
                />

                <Select
                  classNamePrefix="report-select"
                  options={region.map((ele) => {
                    return {
                      value: ele.REGION,
                      label: ele.REGION + " - " + ele.REGION_DESC,
                    };
                  })}
                  onChange={(e) => setValue("REGIO_FROM", e.value)}
                  placeholder="Select Region"
                />
                {errors.REGIO_FROM && (
                  <span style={{ color: "red" }}>This field is required</span>
                )}
              </div>
            </div>
          </div>
          <div className="col-12 col-md-3">
            {/* <div className="row">
              <div className="col-12">
                <label>Region To</label>
                <input name="REGIO_TO" ref={register} hidden />
                <Select
                  classNamePrefix="report-select"
                  options={region.map((ele) => {
                    return {
                      value: ele.REGION,
                      label: ele.REGION + " - " + ele.REGION_DESC,
                    };
                  })}
                  onChange={(e) => setValue("REGIO_TO", e.value)}
                  placeholder="Select Region"
                />
              </div>
            </div> */}
          </div>

          {/* customer */}
          <div className="col-12 col-md-3">
            <div className="row">
              <div className="col-12">
                <label>Customer From</label>
                <input name="KUNNR_FROM" ref={register} hidden />
                <AsyncSelect
                  classNamePrefix="report-select"
                  cacheOptions
                  loadOptions={loadOptions}
                  defaultOptions
                  onInputChange={handleInputChange}
                  placeholder={"Enter Customer Code From"}
                  onChange={(e) => setValue("KUNNR_FROM", e.value)}
                />
              </div>
            </div>
          </div>
          <div className="col-12 col-md-3">
            <div className="row">
              <div className="col-12">
                <label>Customer To</label>
                <input name="KUNNR_TO" ref={register} hidden />
                <AsyncSelect
                  classNamePrefix="report-select"
                  cacheOptions
                  loadOptions={loadOptions}
                  defaultOptions
                  onInputChange={handleInputChange}
                  placeholder={"Enter Customer Code To"}
                  onChange={(e) => setValue("KUNNR_TO", e.value)}
                />
              </div>
            </div>
          </div>

          {/* sales group */}
          <div className="col-12 col-md-3">
            <div className="row">
              <div className="col-12">
                <label>Sales Group From</label>
                <input name="VKGRP_FROM" ref={register} hidden />

                <Select
                  classNamePrefix="report-select"
                  options={salesGrp.map((ele) => {
                    return {
                      value: ele.VKGRP,
                      label: ele.VKGRP + " - " + ele.BEZEI,
                    };
                  })}
                  onChange={(e) => setValue("VKGRP_FROM", e.value)}
                  placeholder="Select Sales Group"
                />
              </div>
            </div>
          </div>
          <div className="col-12 col-md-3">
            <div className="row">
              <div className="col-12">
                <label>Sales Group To</label>
                <input name="VKGRP_TO" ref={register} hidden />

                <Select
                  classNamePrefix="report-select"
                  options={salesGrp.map((ele) => {
                    return {
                      value: ele.VKGRP,
                      label: ele.VKGRP + " - " + ele.BEZEI,
                    };
                  })}
                  onChange={(e) => setValue("VKGRP_TO", e.value)}
                  placeholder="Select Sales Group"
                />
              </div>
            </div>
          </div>

          {/* sales district */}
          <div className="col-12 col-md-3">
            <div className="row">
              <div className="col-12">
                <label>Sales District From</label>
                <input name="BZIRK_FROM" ref={register} hidden />

                <Select
                  classNamePrefix="report-select"
                  options={salesDist.map((ele) => {
                    return {
                      value: ele.BZIRK,
                      label: ele.BZIRK + " - " + ele.BZTXT,
                    };
                  })}
                  onChange={(e) => setValue("BZIRK_FROM", e.value)}
                  placeholder="Select Sales District From"
                />
              </div>
            </div>
          </div>
          <div className="col-12 col-md-3">
            <div className="row">
              <div className="col-12">
                <label>Sales District To</label>
                <input name="BZIRK_TO" ref={register} hidden />

                <Select
                  classNamePrefix="report-select"
                  options={salesDist.map((ele) => {
                    return {
                      value: ele.BZIRK,
                      label: ele.BZIRK + " - " + ele.BZTXT,
                    };
                  })}
                  onChange={(e) => setValue("BZIRK_TO", e.value)}
                  placeholder="Select Sales District To"
                />
              </div>
            </div>
          </div>

          {/* distribution channel */}
          <div className="col-12 col-md-3">
            <div className="row">
              <div className="col-12">
                <label>Distribution Channel From</label>
                <input name="VTWEG_FROM" ref={register} hidden />

                <Select
                  classNamePrefix="report-select"
                  options={distChan.map((ele) => {
                    return {
                      value: ele.DIST_CHANNEL,
                      label: ele.DIST_CHANNEL + " - " + ele.DIST_CHAN_DESC,
                    };
                  })}
                  onChange={(e) => setValue("VTWEG_FROM", e.value)}
                  placeholder="Select Distribution Channel From"
                />
              </div>
            </div>
          </div>
          <div className="col-12 col-md-3">
            <div className="row">
              <div className="col-12">
                <label>Distribution Channel To</label>
                <input name="VTWEG_TO" ref={register} hidden />

                <Select
                  classNamePrefix="report-select"
                  options={distChan.map((ele) => {
                    return {
                      value: ele.DIST_CHANNEL,
                      label: ele.DIST_CHANNEL + " - " + ele.DIST_CHAN_DESC,
                    };
                  })}
                  onChange={(e) => setValue("VTWEG_TO", e.value)}
                  placeholder="Select Distribution Channel To"
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
                  name="DATE_FROM"
                  ref={register({
                    validate: (value) => {
                      let ans = false;
                      if (watchAllFields.DATE_TO) {
                        if (
                          moment(watchAllFields.DATE_FROM).isBefore(
                            moment(watchAllFields.DATE_TO)
                          ) ||
                          (moment(watchAllFields.DATE_FROM).isSame(
                            moment(watchAllFields.DATE_TO)
                          ) &&
                            moment(watchAllFields.DATE_TO).diff(
                              moment(watchAllFields.DATE_FROM),
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
                    .subtract(30, "day")
                    .format("YYYY-MM-DD")}
                />
                {errors.DATE_FROM && (
                  <p className="form-error">Date should be within 31 days</p>
                )}
              </div>
            </div>
          </div>

          <div className="col-12 col-md-2">
            <div className="row">
              <div className="col-12">
                <label>Date To</label>
              </div>
              <div className="col-12 depot-select">
                <input
                  type="date"
                  name="DATE_TO"
                  ref={register({
                    validate: (value) => {
                      let ans = false;
                      if (watchAllFields.DATE_FROM) {
                        if (
                          (moment(watchAllFields.DATE_FROM).isBefore(
                            moment(watchAllFields.DATE_TO)
                          ) ||
                            moment(watchAllFields.DATE_FROM).isSame(
                              moment(watchAllFields.DATE_TO)
                            )) &&
                          moment(watchAllFields.DATE_TO).diff(
                            moment(watchAllFields.DATE_FROM),
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
                {errors.DATE_TO && (
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
              <div
                className="col-12"
                style={{
                  paddingTop: "5px",
                }}
              >
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
              <div
                className="col-12"
                style={{
                  paddingTop: "5px",
                }}
              >
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
      <br />
      <div className="background" style={{ margin: 0, padding: "10px" }}>
        <div className="table-filter">
          <div className="row">
            <div className="col-12">
              <ExcelReport
                data={allData.map((ele) => {
                  return {
                    ...ele,
                    BUDAT: moment(ele.BUDAT, "YYYYMMDD").format("DD/MM/YYYY"),
                    BUDAT1: moment(ele.BUDAT1, "YYYYMMDD").format("DD/MM/YYYY"),
                    BUDATA: moment(ele.BUDATA, "YYYYMMDD").format("DD/MM/YYYY"),
                  };
                })}
                columns={columnsView}
                fileName={`Collection Report ${moment().format()}`}
              />
            </div>
          </div>
          <div className="filter-div">
            <div className="row">
              <div className="table-div" style={{ width: "100%" }}>
                <CustomTable columns={columnsView} data={allData} />
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

export default connect(mapStateToProps, mapDispatchToProps)(CollectionReport);
