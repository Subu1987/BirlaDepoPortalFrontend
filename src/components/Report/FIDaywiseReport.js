import React, { useState, useEffect, useRef } from "react";

import { loading } from "../../actions/loadingAction";
import { connect } from "react-redux";
import http from "../../services/apicall";
import apis from "../../services/apis";
import Swal from "sweetalert2";
import moment from "moment";
import { Controller, useForm } from "react-hook-form";
import Modal from "react-bootstrap/Modal";
import ReactPaginate from "react-paginate";
import isNumber from "is-number";
import ReactExport from "react-export-excel";
import { getLocalData, setLocalData } from "../../services/localStorage";
import { emptyResult } from "../../services/EmptyResult";
import ModalSalesRegister from "./Modal";
import Select from "react-select";
import AsyncSelect from "react-select/async";
import filterDataReport from "../../Functions/filterDataReport";
import fetchCustomerNumber from "../../Functions/fetchCustomer";
import SearchSoldToParty from "../Sales_Order_Package/soldToPart";
import removeDuplicatesByKey from "../utils/removeDuplicateByKey";
import useComp from "../../hook/useComp";

const ExcelFile = ReactExport.ExcelFile;
const ExcelSheet = ReactExport.ExcelFile.ExcelSheet;
const ExcelColumn = ReactExport.ExcelFile.ExcelColumn;

let today = moment();
let twodaysback = moment().subtract(7, "day");

function FIDaywiseReport(props) {
  const [fidaywisereportData, setFidaywisereportData] = useState([]);
  const [paginatedFIdaywiseReportData, setPaginatedFIdaywiseReportData] =
    useState([]);
  const [perPage, setPerpage] = useState(10);

  const [allCompanyCode, setAllCompanyCode] = useState([]);
  const [allRegion, setAllRegion] = useState([]);
  const [allSalesOffice, setAllSalesOffice] = useState([]);
  const [allSalesGroup, setAllSalesgroup] = useState([]);
  const [allSalesdistrict, setAllSalesDistrict] = useState([]);
  const [allDistributionChannel, setAllDistributionChannel] = useState([]);
  const [allDivision, setAllDivision] = useState([]);

  const [companyCode, setCompanyCode] = useState({});
  const [region, setRegion] = useState({});

  const [salesOffice, setSalesOffice] = useState({});

  const [salesGrpFrom, setSalesGrpFrom] = useState({});
  const [salesGrpTo, setSalesGrpTo] = useState({});
  const [customerFrom, setCustomerFrom] = useState({});
  const [customerTo, setCustomerTo] = useState({});
  const [division, setDivision] = useState({});
  const [salesDistFrom, setSalesDistFrom] = useState({});
  const [salesDistTo, setSalesDistTo] = useState({});
  const [distChan, setDistChan] = useState({});

  const [modalVisible, setModalVisible] = useState(false);
  const [modalData, setModalData] = useState([]);
  const [name, setName] = useState("");
  const [header, setHeader] = useState({});
  const [selectedFrom, setSelectedFrom] = useState("");
  const [selectedTo, setSelectedTo] = useState("");
  const [soldToPartyModalVisble, setsoldToPartyModalVisble] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    errors,
    setValue,
    triggerValidation,
    getValues,
    control,
  } = useForm({
    mode: "onSubmit",
    reValidateMode: "onChange",
    defaultValues: {
      till_date: today.format("YYYY-MM-DD"),
    },
  });
  const watchAllFields = watch();

  const [customerData, setCustomerdData] = useState([]);

  //+++++++++++++++++++++++++++++++++++++++++++++fetch company code distribution channel division Region++++++++++++++++++++++++

  const comp_code = useComp();

  useEffect(() => {
    setAllCompanyCode(filterDataReport(comp_code, "COMP_CODE", "COMP_NAME"));
  }, [comp_code]);

  let fetchRegion = () => {
    props.loading(true);
    http
      .post(apis.LE_REGISTER_FETCH_REGION, {})
      .then((result) => {
        if (result.data.status) {
          setAllRegion(
            filterDataReport(result.data.data, "DIVISION", "DIVISION_DESC")
          );
          setLocalData("regions", result.data.data);
        } else {
          let msg = result.data.msg;
          if (msg.toLowerCase().startsWith("server")) {
            return null;
          } else {
            Swal.fire({
              title: "Error!",
              text: result.data.msg,
              icon: "error",
              confirmButtonText: "Ok",
            });
          }
        }
      })
      .catch((err) => {
        console.log(err);
        fetchRegion();
      })
      .finally(() => {
        props.loading(false);
      });
  };

  let fetchDistributionChannel = () => {
    props.loading(true);
    http
      .post(apis.LE_REGISTER_FETCH_DISTRIBUTION_CHANNEL, {})
      .then((result) => {
        if (result.data.status) {
          setAllDistributionChannel(
            filterDataReport(
              [{ DIST_CHANNEL: "TR", DIST_CHAN_DESC: "Trade" }],
              "DIST_CHANNEL",
              "DIST_CHAN_DESC"
            )
          );
          setLocalData("dist-chan", [
            { DIST_CHANNEL: "TR", DIST_CHAN_DESC: "Trade" },
          ]);
        } else {
          let msg = result.data.msg;
          if (msg.toLowerCase().startsWith("server")) {
            return null;
          } else {
            Swal.fire({
              title: "Error!",
              text: result.data.msg,
              icon: "error",
              confirmButtonText: "Ok",
            });
          }
        }
      })
      .catch((err) => {
        fetchDistributionChannel();
      })
      .finally(() => {
        props.loading(false);
      });
  };

  let fetchDivision = () => {
    props.loading(true);
    http
      .post(apis.LE_REGION_FETCH_DIVISION, {})
      .then((result) => {
        if (result.data.status) {
          setAllDivision(
            filterDataReport(
              [{ DIVISION: "CM", DIVISION_DESC: "Cement" }],
              "DIVISION",
              "DIVISION_DESC"
            )
          );
          setLocalData("division", [
            { DIVISION: "CM", DIVISION_DESC: "Cement" },
          ]);
        } else {
          let msg = result.data.msg;
          if (msg.toLowerCase().startsWith("server")) {
            return null;
          } else {
            Swal.fire({
              title: "Error!",
              text: result.data.msg,
              icon: "error",
              confirmButtonText: "Ok",
            });
          }
        }
      })
      .catch((err) => {
        console.log(err);
        fetchDivision();
      })
      .finally(() => {
        props.loading(false);
      });
  };

  let fetchSalesOffice = () => {
    props.loading(true);
    http
      .post(apis.REPORT_FETCH_OFFICE, {
        IM_LOGIN_ID: localStorage.getItem("user_code"),
        // IM_VKBUR: "",
      })
      .then((result) => {
        if (result.data.status) {
          setAllSalesOffice(
            filterDataReport(result.data.data, "VKBUR", "BEZEI")
          );
          setLocalData("sales-office", result.data.data);
        } else {
          let msg = result.data.msg;
          if (msg.toLowerCase().startsWith("server")) {
            return null;
          } else {
            Swal.fire({
              title: "Error!",
              text: result.data.msg,
              icon: "error",
              confirmButtonText: "Ok",
            });
          }
        }
      })
      .catch((err) => {
        console.log(err);
        fetchSalesOffice();
      })
      .finally(() => {
        props.loading(false);
      });
  };

  let fetchSalesGroup = () => {
    props.loading(true);
    http
      .post(apis.REPORT_FETCH_SALES_GROUP, {
        IM_LOGIN_ID: localStorage.getItem("user_code"),
        // IM_VRGRP: "",
      })
      .then((result) => {
        if (result.data.status) {
          setAllSalesgroup(
            filterDataReport(result.data.data, "VKGRP", "BEZEI")
          );
          setLocalData("sales-group", result.data.data);
        } else {
          let msg = result.data.msg;
          if (msg.toLowerCase().startsWith("server")) {
            return null;
          } else {
            Swal.fire({
              title: "Error!",
              text: result.data.msg,
              icon: "error",
              confirmButtonText: "Ok",
            });
          }
        }
      })
      .catch((err) => {
        console.log(err);
        fetchSalesGroup();
      })
      .finally(() => {
        props.loading(false);
      });
  };

  let fetchSalesDistrict = () => {
    props.loading(true);
    http
      .post(apis.COMMON_POST_WITH_FM_NAME, {
        fm_name: "ZRFC_SALES_DISTRICT",
        params: {
          IM_LOGIN_ID: localStorage.getItem("user_code"),
        },
        // IM_BZRIK: "",
      })
      .then((result) => {
        if (result.data.status) {
          let data = result.data.result.EX_DISTRICT;
          let uniqueData = removeDuplicatesByKey(data, "BZIRK");

          setAllSalesDistrict(filterDataReport(uniqueData, "BZIRK", "BZTXT"));
          setLocalData("sales-district", uniqueData);
        } else {
          let msg = result.data.msg;
          if (msg.toLowerCase().startsWith("server")) {
            return null;
          } else {
            Swal.fire({
              title: "Error!",
              text: result.data.msg,
              icon: "error",
              confirmButtonText: "Ok",
            });
          }
        }
      })
      .catch((err) => {
        console.log(err);
        fetchSalesDistrict();
      })
      .finally(() => {
        props.loading(false);
      });
  };

  let fetchSalesCustomer = () => {
    http
      .post(apis.COMMON_POST_WITH_FM_NAME, {
        fm_name: "ZRFC_R015_CUSTOMER",
        params: {
          IM_LOGIN_ID: localStorage.getItem("user_code"),
          // IM_KUNNR: "",
        },
      })
      .then((res) => {
        setCustomerdData(
          filterDataReport(res.data.result.IT_KNA1, "KUNNR", "NAME1")
        );
        setLocalData("sales-customer", res.data.result.IT_KNA1);
      })
      .catch((err) => console.log(err));
  };

  useEffect(() => {
    if (getLocalData("regions")?.length > 0) {
      setAllRegion(
        filterDataReport(getLocalData("regions"), "REGION", "REGION_DESC")
      );
    } else {
      fetchRegion();
    }

    if (getLocalData("dist-chan")?.length > 0) {
      setAllDistributionChannel(
        filterDataReport(
          getLocalData("dist-chan"),
          "DIST_CHANNEL",
          "DIST_CHAN_DESC"
        )
      );
    } else {
      fetchDistributionChannel();
    }
    if (getLocalData("division")?.length > 0) {
      setAllDivision(
        filterDataReport(getLocalData("division"), "DIVISION", "DIVISION_DESC")
      );
    } else {
      fetchDivision();
    }
    if (getLocalData("sales-office")?.length > 0) {
      setAllSalesOffice(
        filterDataReport(getLocalData("sales-office"), "VKBUR", "BEZEI")
      );
    } else {
      fetchSalesOffice();
    }
    // if (getLocalData("sales-customer")?.length > 0) {
    //   setCustomerdData(
    //     filterDataReport(getLocalData("sales-customer"), "KUNNR", "NAME1")
    //   );
    // } else {
    fetchSalesCustomer();
    // }
    // if (getLocalData("sales-district")?.length > 0) {
    //   setAllSalesDistrict(
    //     filterDataReport(getLocalData("sales-district"), "BZIRK", "BZTXT")
    //   );
    // } else {
    fetchSalesDistrict();
    // }

    if (getLocalData("sales-group")?.length > 0) {
      setAllSalesgroup(
        filterDataReport(getLocalData("sales-group"), "VKGRP", "BEZEI")
      );
    } else {
      fetchSalesGroup();
    }
  }, []);

  //+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

  useEffect(() => {
    if (Object.keys(errors).length > 0) {
      let msg = "";
      Object.keys(errors).forEach((keys, i) => {
        msg += `<p>${i + 1}. ${errors[keys]?.message}</p>`;
      });
      Swal.fire({ title: "Error", html: msg, icon: "error" });
    }
  }, [errors]);

  //+++++++++++++++++++++++++++++++++++++fetch GR list++++++++++++++++++++++++
  let onSubmit = (data) => {
    console.log(data);
    fetchReport(data);
  };

  let fetchReport = (data) => {
    props.loading(true);
    data.till_date = moment(data.till_date).format("YYYYMMDD");
    data.IM_DRCR_FLAG = watchAllFields?.IM_DRCR_FLAG;
    data.lv_user = localStorage.getItem("user_code");
    data.customer_from = selectedFrom;
    data.customer_to = selectedTo;
    // let body = {
    //   ...watchAllFields,
    //   sales_office: selectedSalesOffice ? selectedSalesOffice.VKBUR : "",

    //   customer_from: selectedCustomerFrom ? selectedCustomerFrom.KUNNR : "",
    //   customer_to: selectedCustomerTo ? selectedCustomerTo.KUNNR : "",
    //   sales_district_from: selectedSalesDistrictFrom
    //     ? selectedSalesDistrictFrom.BZIRK
    //     : "",
    //   sales_district_to: selectedSalesDistrictTo
    //     ? selectedSalesDistrictTo.BZIRK
    //     : "",
    //   sales_group_from: selectedSalesGroupFrom
    //     ? selectedSalesGroupFrom?.VKGRP?.toUpperCase()
    //     : "",
    //   sales_group_to: selectedSalesGroupTo
    //     ? selectedSalesGroupTo?.VKGRP?.toUpperCase()
    //     : "",
    //   till_date: moment(watchAllFields.till_date).format("YYYYMMDD"),
    //   company_code: companyCode.value,
    //   region: selectedRegion.REGION,
    //   division: selectedDivision ? selectedDivision.DIVISION : "",
    //   distribution_channel: selectedDistributionChannel
    //     ? selectedDistributionChannel.DIST_CHANNEL
    //     : "",
    //   lv_user: localStorage.getItem("user_code"),
    //   IM_DRCR_FLAG: watchAllFields?.IM_DRCR_FLAG,
    // };
    console.log(data);
    http
      .post(apis.FETCH_FI_DAYWISE_REPORT, data)
      .then((result) => {
        if (result.data.status) {
          emptyResult(result.data.data, setFidaywisereportData);
        } else {
          let msg = result.data.msg;
          if (msg.toLowerCase().startsWith("server")) {
            return null;
          } else {
            Swal.fire({
              title: "Error!",
              text: result.data.msg,
              icon: "error",
              confirmButtonText: "Ok",
            });
          }
        }
      })
      .catch((err) => {
        console.log(err);
        fetchReport(data);
      })
      .finally(() => {
        props.loading(false);
      });
  };
  //++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

  //++++++++++++++++++++++++++page changer+++++++++++++++++++++++++++++++++++++++++++++++
  let pageChange = ({ selected }) => {
    setPaginatedFIdaywiseReportData(
      fidaywisereportData.slice(selected * perPage, perPage * (selected + 1))
    );
  };
  useEffect(() => {
    pageChange({ selected: 0 });
  }, [perPage, fidaywisereportData]);
  //+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

  //++++++++++++++++++++++++++++++++++++++++custom validation trigger++++++++++++++

  let setWithValidationTrigger = (key, value) => {
    setValue(key, value);
    triggerValidation(key);
  };
  //+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

  // +++++++++++++++++Data Fixing+++++++++++++++++++++++++++++++++++++++++//
  useEffect(() => {
    let data = fidaywisereportData;

    let objectKeys = [];
    if (fidaywisereportData.length !== 0) {
      objectKeys = Object.keys(data[0]);
    }

    for (let i = 0; i < data.length; i++) {
      for (let j = 0; j < objectKeys.length; j++) {
        if (isNumber(data[i][objectKeys[j]])) {
          data[i][objectKeys[j]] = Number(data[i][objectKeys[j]]);
        }
      }
    }
  }, [fidaywisereportData]);

  // Common Handle Change
  const handleChange = (value, key) => {
    switch (key) {
      case "company_code":
        setCompanyCode(value);
        setValue(key, value?.value);
        break;
      case "region":
        setRegion(value);
        setValue(key, value?.value);
        break;
      case "sales_office":
        setSalesOffice(value);
        setValue(key, value?.value);
        break;
      case "sales_group_from":
        setSalesGrpFrom(value);
        setValue(key, value?.value);
        break;
      case "sales_group_to":
        setSalesGrpTo(value);
        setValue(key, value?.value);
        break;
      case "customer_from":
        setCustomerFrom(value);
        setValue(key, value?.value);
        break;
      case "customer_tp":
        setCustomerTo(value);
        setValue(key, value?.value);
        break;

      case "sales_district_from":
        setSalesDistFrom(value);
        setValue(key, value?.value);
        break;
      case "sales_district_to":
        setSalesDistTo(value);
        setValue(key, value?.value);
        break;
      case "distribution_channel":
        setDistChan(value);
        setValue(key, value?.value);
        break;
      case "division":
        setDivision(value);
        setValue(key, value?.value);
        break;

      default:
        break;
    }
  };

  const handleChangeAsyncFrom = (value) => {
    setSelectedFrom(value?.value);
    setCustomerFrom({ value: value?.value, label: value?.label });
  };

  const handleChangeAsyncTo = (value) => {
    setSelectedTo(value?.value);
    setCustomerTo({ value: value?.value, label: value?.label });
  };

  // Data of Excel File
  let headers = [
    { label: "Sold to Party Code", key: "KUNNR" },
    { label: "Sold to Party Description", key: "CUST_NAME" },
    { label: "Region Description", key: "VTEXT" },
    { label: "District Description", key: "BZTXT" },
    { label: "Sales Office Description", key: "SALES_OFFICE" },
    { label: "Sales Group Desc.", key: "SALES_GRP" },
    { label: "Transportation Zone Text", key: "ZONE_DESC" },
    { label: "Credit Limit", key: "CR_LIMIT" },
    { label: "Credit Limit Exceeded", key: "CR_LIMIT_EX" },
    { label: "Credit Expose Percentage", key: "CR_EXPS_PER" },
    { label: "Credit Expose Amount", key: "CR_EXPS_AMNT" },
    { label: "1st Period", key: "PERIOD1" },
    { label: "Percentage 1", key: "PERCENTAGE1" },
    { label: "2nd Period", key: "PERIOD2" },
    { label: "Percentage 2", key: "PERCENTAGE2" },
    { label: "3rd Period", key: "PERIOD3" },
    { label: "Percentage 3", key: "PERCENTAGE3" },
    { label: "4th Period", key: "PERIOD4" },
    { label: "Percentage 4", key: "PERCENTAGE4" },
    { label: "5th Period", key: "PERIOD5" },
    { label: "Percentage 5", key: "PERCENTAGE5" },
    { label: "6th Period", key: "PERIOD6" },
    { label: "Percentage 6", key: "PERCENTAGE6" },
    { label: "7th Period", key: "PERIOD7" },
    { label: "Percentage 7", key: "PERCENTAGE7" },
    { label: "8th Period", key: "PERIOD8" },
    { label: "Percentage 8", key: "PERCENTAGE8" },
    { label: "9th Period", key: "PERIOD9" },
    { label: "Percentage 9", key: "PERCENTAGE9" },
    { label: "10th Period", key: "PERIOD10" },
    { label: "Percentage 10", key: "PERCENTAGE10" },
    { label: "Last Period Above", key: "PERIODABV" },
    { label: "Percentage ABV", key: "PERCENTAGEABV" },
    { label: "Period wise Total", key: "PERIOD_TOT" },
    { label: "SD Amount in RECL", key: "RECL_SD" },
    { label: "SD Amount in BCL", key: "BCL_SD" },
    { label: "Security Amount", key: "SEC_AMT" },
    { label: "Vendor", key: "VENDR" },
    { label: "Vendor Name", key: "VEN_NAME" },
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

  return (
    <div>
      <form className="filter-section" onSubmit={handleSubmit(onSubmit)}>
        <div className="row">
          <div className="col-4">
            <div className="row">
              <div className="col-3">
                <label className="">
                  Till Date<span>*</span>
                </label>
              </div>
              <div className="col-8">
                <input
                  type="date"
                  placeholder="From"
                  name="till_date"
                  ref={register({
                    required: true,
                  })}
                />
                {errors.till_date && (
                  <p className="form-error">Please put a valid value</p>
                )}
              </div>
            </div>
          </div>
          <div className="col-4">
            <div className="row">
              <div className="col-3">
                <label>
                  Company Code<span>*</span>
                </label>
              </div>
              <div className="col-8">
                <i
                  className="far fa-clone click-icons"
                  onClick={() => {
                    setModalVisible(true);
                    setModalData(allCompanyCode);
                    setName("company_code");
                    setHeader({
                      title: "Company Code",
                      name: "Company Code",
                      desc: "Company Name",
                    });
                  }}
                ></i>
                <Controller
                  as={({ onChange, value }) => (
                    <Select
                      classNamePrefix="react-select"
                      value={companyCode}
                      onChange={(event) => handleChange(event, "company_code")}
                      options={allCompanyCode}
                      placeholder=""
                    />
                  )}
                  defaultValue=""
                  control={control}
                  name="company_code"
                  rules={{
                    required: "Company code is required",
                  }}
                />
              </div>
            </div>
          </div>
          <div className="col-4">
            <div className="row">
              <div className="col-3">
                <label>
                  Region<span>*</span>
                </label>
              </div>
              <div className="col-8">
                <i
                  className="far fa-clone click-icons"
                  onClick={() => {
                    setModalVisible(true);
                    setModalData(allRegion);
                    setName("region");
                    setHeader({
                      title: "Region",
                      name: "Region Code",
                      desc: "Region Name",
                    });
                  }}
                ></i>
                <Controller
                  as={({ onChange, value }) => (
                    <Select
                      classNamePrefix="react-select"
                      value={region}
                      onChange={(event) => handleChange(event, "region")}
                      options={allRegion}
                      placeholder=""
                    />
                  )}
                  defaultValue=""
                  control={control}
                  name="region"
                  rules={{
                    required: "Region is required",
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-4">
            <div className="row">
              <div className="col-3">
                <label>Sales Office</label>
              </div>
              <div className="col-8">
                <i
                  className="far fa-clone click-icons"
                  onClick={() => {
                    setModalVisible(true);
                    setModalData(allSalesOffice);
                    setName("sales_office");
                    setHeader({
                      title: "Sales Office",
                      name: "Sales Office Code",
                      desc: "Sales Office Name",
                    });
                  }}
                ></i>
                <Controller
                  as={({ onChange, value }) => (
                    <Select
                      classNamePrefix="react-select"
                      value={salesOffice}
                      onChange={(event) => handleChange(event, "sales_office")}
                      options={allSalesOffice}
                      placeholder=""
                    />
                  )}
                  defaultValue=""
                  control={control}
                  name="sales_office"
                />
              </div>
            </div>
          </div>

          <div className="col-4">
            <div className="row">
              <div className="col-3">
                <label>
                  Sales Group From <span>*</span>
                </label>
              </div>
              <div className="col-8">
                <i
                  className="far fa-clone click-icons"
                  onClick={() => {
                    setModalVisible(true);
                    setModalData(allSalesGroup);
                    setName("sales_group_from");
                    setHeader({
                      title: "Sales Group",
                      name: "Sales Group Code",
                      desc: "Sales Group Name",
                    });
                  }}
                ></i>
                <Controller
                  as={({ onChange, value }) => (
                    <Select
                      classNamePrefix="react-select"
                      value={salesGrpFrom}
                      onChange={(event) =>
                        handleChange(event, "sales_group_from")
                      }
                      options={allSalesGroup}
                      placeholder=""
                    />
                  )}
                  defaultValue=""
                  control={control}
                  name="sales_group_from"
                  rules={{
                    required: "Sales Group from is required",
                  }}
                />
              </div>
            </div>
          </div>

          <div className="col-4">
            <div className="row">
              <div className="col-3">
                <label>
                  Sales Group To<span>*</span>
                </label>
              </div>
              <div className="col-8">
                <i
                  className="far fa-clone click-icons"
                  onClick={() => {
                    setModalVisible(true);
                    setModalData(allSalesGroup);
                    setName("sales_group_to");
                    setHeader({
                      title: "Sales Group",
                      name: "Sales Group Code",
                      desc: "Sales Group Name",
                    });
                  }}
                ></i>
                <Controller
                  as={({ onChange, value }) => (
                    <Select
                      classNamePrefix="react-select"
                      value={salesGrpTo}
                      onChange={(event) =>
                        handleChange(event, "sales_group_to")
                      }
                      options={allSalesGroup}
                      placeholder=""
                    />
                  )}
                  defaultValue=""
                  control={control}
                  name="sales_group_to"
                  rules={{
                    required: "Sales Group to is required",
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-4">
            <div className="row">
              <div className="col-3">
                <label>Sales Customer From</label>
              </div>
              <div className="col-8">
                {/* <i
                  className="far fa-clone click-icons"
                  onClick={() => setsoldToPartyModalVisble(true)}
                ></i> */}

                <AsyncSelect
                  classNamePrefix="react-select"
                  cacheOptions
                  loadOptions={loadOptions}
                  defaultOptions
                  onInputChange={handleInputChange}
                  value={customerFrom}
                  placeholder={""}
                  onChange={handleChangeAsyncFrom}
                />
              </div>
            </div>
          </div>
          <div className="col-4">
            <div className="row">
              <div className="col-3">
                <label>Sales Customer To</label>
              </div>
              <div className="col-8">
                {/* <i
                  className="far fa-clone click-icons"
                  onClick={() => setsoldToPartyModalVisble(true)}
                ></i> */}
                <AsyncSelect
                  classNamePrefix="react-select"
                  cacheOptions
                  loadOptions={loadOptions}
                  defaultOptions
                  onInputChange={handleInputChange}
                  value={customerTo}
                  placeholder={""}
                  onChange={handleChangeAsyncTo}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-4">
            <div className="row">
              <div className="col-3">
                <label>Sales District From</label>
              </div>
              <div className="col-8">
                <i
                  className="far fa-clone click-icons"
                  onClick={() => {
                    setModalVisible(true);
                    setModalData(allSalesdistrict);
                    setName("sales_district_from");
                    setHeader({
                      title: "Sales District",
                      name: "Sales District Code",
                      desc: "Sales District Name",
                    });
                  }}
                ></i>
                <Controller
                  as={({ onChange, value }) => (
                    <Select
                      classNamePrefix="react-select"
                      value={salesDistFrom}
                      onChange={(event) =>
                        handleChange(event, "sales_district_from")
                      }
                      options={allSalesdistrict}
                      placeholder=""
                    />
                  )}
                  defaultValue=""
                  control={control}
                  name="sales_district_from"
                />
              </div>
            </div>
          </div>
          <div className="col-4">
            <div className="row">
              <div className="col-3">
                <label>Sales District To</label>
              </div>
              <div className="col-8">
                <i
                  className="far fa-clone click-icons"
                  onClick={() => {
                    setModalVisible(true);
                    setModalData(allSalesdistrict);
                    setName("sales_district_to");
                    setHeader({
                      title: "Sales District",
                      name: "Sales District Code",
                      desc: "Sales District Name",
                    });
                  }}
                ></i>
                <Controller
                  as={({ onChange, value }) => (
                    <Select
                      classNamePrefix="react-select"
                      value={salesDistTo}
                      onChange={(event) =>
                        handleChange(event, "sales_district_to")
                      }
                      options={allSalesdistrict}
                      placeholder=""
                    />
                  )}
                  defaultValue=""
                  control={control}
                  name="sales_district_to"
                />
              </div>
            </div>
          </div>
        </div>
        <div className="row">
          <div className="col-4">
            <div className="row">
              <div className="col-3">
                <label>
                  Distribution Channel<span>*</span>
                </label>
              </div>
              <div className="col-8">
                <i
                  className="far fa-clone click-icons"
                  onClick={() => {
                    setModalVisible(true);
                    setModalData(allDistributionChannel);
                    setName("distribution_channel");
                    setHeader({
                      title: "Distribution",
                      name: "Distribution Code",
                      desc: "Distribution Name",
                    });
                  }}
                ></i>
                <Controller
                  as={({ onChange, value }) => (
                    <Select
                      classNamePrefix="react-select"
                      value={distChan}
                      onChange={(event) =>
                        handleChange(event, "distribution_channel")
                      }
                      options={allDistributionChannel}
                      placeholder=""
                    />
                  )}
                  defaultValue=""
                  control={control}
                  name="distribution_channel"
                  rules={{
                    required: "Distribution channel is required",
                  }}
                />
              </div>
            </div>
          </div>
          <div className="col-4">
            <div className="row">
              <div className="col-3">
                <label>
                  Division<span>*</span>
                </label>
              </div>
              <div className="col-8">
                <i
                  className="far fa-clone click-icons"
                  onClick={() => {
                    setModalVisible(true);
                    setModalData(allDivision);
                    setName("division");
                    setHeader({
                      title: "Division",
                      name: "Division Code",
                      desc: "Division Name",
                    });
                  }}
                ></i>
                <Controller
                  as={({ onChange, value }) => (
                    <Select
                      classNamePrefix="react-select"
                      value={division}
                      onChange={(event) => handleChange(event, "division")}
                      options={allDivision}
                      placeholder=""
                    />
                  )}
                  defaultValue=""
                  control={control}
                  name="division"
                  rules={{
                    required: "Division is required",
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col">
            <div className="row">
              <div className="col-3">
                <label>
                  Period 1<span>*</span>
                </label>
              </div>
              <div className="col-8">
                <input
                  type="number"
                  ref={register({
                    required: "Period 1 is required",
                  })}
                  name="period1"
                />
              </div>
            </div>
          </div>
          <div className="col">
            <div className="row">
              <div className="col-3">
                <label>Period 2</label>
              </div>
              <div className="col-8">
                <input type="number" ref={register} name="period2" />

                {errors.period2 && (
                  <p className="form-error">This field is required</p>
                )}
              </div>
            </div>
          </div>
          <div className="col">
            <div className="row">
              <div className="col-3">
                <label>Period 3</label>
              </div>
              <div className="col-8">
                <input type="number" ref={register} name="period3" />

                {errors.period3 && (
                  <p className="form-error">This field is required</p>
                )}
              </div>
            </div>
          </div>
          <div className="col">
            <div className="row">
              <div className="col-3">
                <label>Period 4</label>
              </div>
              <div className="col-8">
                <input type="number" ref={register} name="period4" />

                {errors.period4 && (
                  <p className="form-error">This field is required</p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col">
            <div className="row">
              <div className="col-3">
                <label>Period 5</label>
              </div>
              <div className="col-8">
                <input type="number" ref={register} name="period5" />

                {errors.period5 && (
                  <p className="form-error">This field is required</p>
                )}
              </div>
            </div>
          </div>
          <div className="col">
            <div className="row">
              <div className="col-3">
                <label>Period 6</label>
              </div>
              <div className="col-8">
                <input type="number" ref={register} name="period6" />

                {errors.period6 && (
                  <p className="form-error">This field is required</p>
                )}
              </div>
            </div>
          </div>
          <div className="col">
            <div className="row">
              <div className="col-3">
                <label>Period 7</label>
              </div>
              <div className="col-8">
                <input type="number" ref={register} name="period7" />

                {errors.period7 && (
                  <p className="form-error">This field is required</p>
                )}
              </div>
            </div>
          </div>
          <div className="col">
            <div className="row">
              <div className="col-3">
                <label>Period 8</label>
              </div>
              <div className="col-8">
                <input type="number" ref={register} name="period8" />

                {errors.period8 && (
                  <p className="form-error">This field is required</p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col">
            <div className="row">
              <div className="col-3">
                <label>Period 9</label>
              </div>
              <div className="col-8">
                <input type="number" ref={register} name="period9" />

                {errors.period9 && (
                  <p className="form-error">This field is required</p>
                )}
              </div>
            </div>
          </div>
          <div className="col">
            <div className="row">
              <div className="col-3">
                <label>Period 10</label>
              </div>
              <div className="col-8">
                <input type="number" ref={register} name="period10" />

                {errors.period10 && (
                  <p className="form-error">This field is required</p>
                )}
              </div>
            </div>
          </div>
          <div className="col"></div>
        </div>
        <div className="row">
          <div className="col-5">
            <div className="row">
              <div className="col">
                <input
                  type="radio"
                  name="IM_DRCR_FLAG"
                  defaultChecked
                  value={"D"}
                  ref={register}
                />
              </div>
              <div className="col">
                <label htmlFor="C">Debit</label>
              </div>
              <div className="col">
                <input
                  type="radio"
                  name="IM_DRCR_FLAG"
                  value={"C"}
                  ref={register}
                />
              </div>
              <div className="col">
                <label>Credit</label>
              </div>
              <div className="col">
                <input
                  type="radio"
                  name="IM_DRCR_FLAG"
                  value={"B"}
                  ref={register}
                />
              </div>
              <div className="col-5">
                <label>Debit and Credit both</label>
              </div>
            </div>
          </div>
          <div className="col">
            <button type="submit" className="search-button float-right">
              <i className="fas fa-search icons-button"></i>
            </button>
          </div>
        </div>
      </form>

      {/* Filter Section Close */}

      {/* Table Filter Open */}

      <div className="background">
        <div className="table-filter">
          <div className="filter-div">
            <div className="row">
              <div className="col">
                <div className="row">
                  <div className="col">
                    {fidaywisereportData ? (
                      <ExcelFile
                        filename={`FIDay wise Report: Till Date: ${getValues(
                          "till_date"
                        )}-Company Code:${getValues(
                          "company_code"
                        )}-Region:${getValues(
                          "region"
                        )}-Sales Group from:${getValues(
                          "sales_group_from"
                        )} to ${getValues("sales_group_to")} `}
                        element={
                          <button
                            className="goods-button float-right"
                            style={{ backgroundColor: "#0F6FA2" }}
                          >
                            Export to Excel
                          </button>
                        }
                      >
                        <ExcelSheet
                          data={fidaywisereportData}
                          name="FI Register Report"
                        >
                          {headers?.map((value, i) => (
                            <ExcelColumn
                              key={i}
                              label={value.label}
                              value={value.key}
                            />
                          ))}
                        </ExcelSheet>
                      </ExcelFile>
                    ) : null}
                    {/* {fidaywisereportData ? (
                      <CSVLink
                        className="goods-button float-right"
                        style={{ backgroundColor: "#0F6FA2" }}
                        data={fidaywisereportData}
                      >
                        Export to csv
                      </CSVLink>
                    ) : null} */}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Table Div Open */}

          <div className="table-div">
            <div className="row">
              <table className="table">
                <thead>
                  <tr>
                    <th scope="col">Sold to Party Code</th>
                    <th scope="col">Sold to Party Desc.</th>
                    <th scope="col">Region Description</th>
                    <th scope="col">District Description</th>
                    <th scope="col-3">Sales Office Description</th>
                    <th scope="col">Sales Group Desc.</th>
                    <th scope="col">Transportation Zone Text</th>
                    <th scope="col">Credit Limit</th>
                    <th scope="col">Credit Limit Exceeded</th>
                    <th scope="col">Credit Expose Percentage</th>
                    <th scope="col">Credit Expose Amount</th>
                    <th scope="col-3">1st Period</th>
                    <th scope="col">Percentage 1</th>
                    <th scope="col">2nd Period</th>
                    <th scope="col">Percentage 2</th>
                    <th scope="col-3">3rd Period</th>
                    <th scope="col">Percentage 3</th>
                    <th scope="col">4th Period</th>
                    <th scope="col">Percentage 4</th>
                    <th scope="col">5th Period</th>
                    <th scope="col-3">Percentage 5</th>
                    <th scope="col">6th Period</th>
                    <th scope="col">Percentage 6</th>
                    <th scope="col">7th Period</th>
                    <th scope="col">Percentage 7</th>
                    <th scope="col">8th Period</th>
                    <th scope="col">Percentage 8</th>
                    <th scope="col-3">9th Period</th>
                    <th scope="col">Percentage 9</th>
                    <th scope="col">10th Period</th>
                    <th scope="col">Percentage 10</th>
                    <th scope="col-3">Last Period Above</th>
                    <th scope="col-3">Percentage ABV</th>
                    <th scope="col">Period Wise Total</th>
                    <th scope="col">SD Amount in RECL</th>
                    <th scope="col">SD Amount in BCL</th>
                    <th scope="col">Security Amount</th>
                    <th scope="col">Vendor</th>
                    <th scope="col">Vendor Name</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedFIdaywiseReportData.map((ele, i) => (
                    <tr key={i}>
                      <td>{ele.KUNNR}</td>
                      <td>{ele.CUST_NAME}</td>
                      <td>{ele.VTEXT}</td>
                      <td>{ele.BZTXT}</td>
                      <td>{ele.SALES_OFFICE}</td>

                      <td>{ele.SALES_GRP}</td>
                      <td>{ele.ZONE_DESC}</td>
                      <td>{ele.CR_LIMIT}</td>
                      <td>{ele.CR_LIMIT_EX}</td>
                      <td>{ele.CR_EXPS_PER}</td>
                      <td>{ele.CR_EXPS_AMNT}</td>
                      <td>{ele.PERIOD1}</td>
                      <td>{ele.PERCENTAGE1}</td>
                      <td>{ele.PERIOD2}</td>
                      <td>{ele.PERCENTAGE2}</td>

                      <td>{ele.PERIOD3}</td>
                      <td>{ele.PERCENTAGE3}</td>
                      <td>{ele.PERIOD4}</td>
                      <td>{ele.PERCENTAGE4}</td>
                      <td>{ele.PERIOD5}</td>

                      <td>{ele.PERCENTAGE5}</td>
                      <td>{ele.PERIOD6}</td>
                      <td>{ele.PERCENTAGE6}</td>
                      <td>{ele.PERIOD7}</td>
                      <td>{ele.PERCENTAGE7}</td>
                      <td>{ele.PERIOD8}</td>
                      <td>{ele.PERCENTAGE8}</td>
                      <td>{ele.PERIOD9}</td>
                      <td>{ele.PERCENTAGE9}</td>
                      <td>{ele.PERIOD10}</td>

                      <td>{ele.PERCENTAGE10}</td>

                      <td>{ele.PERIODABV}</td>
                      <td>{ele.PERCENTAGEABV}</td>
                      <td>{ele.PERIOD_TOT}</td>
                      <td>{ele.RECL_SD}</td>
                      <td>{ele.BCL_SD}</td>
                      <td>{ele.SEC_AMT}</td>
                      <td>{ele.VENDR}</td>
                      <td>{ele.VEN_NAME}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        <ReactPaginate
          previousLabel={"prev"}
          nextLabel={"next"}
          breakLabel={"..."}
          breakClassName={"break-me"}
          pageCount={fidaywisereportData.length / perPage}
          marginPagesDisplayed={2}
          pageRangeDisplayed={5}
          onPageChange={pageChange}
          containerClassName={"pagination"}
          subContainerClassName={"pages pagination"}
          activeClassName={"active"}
          initialPage={0}
        />

        <div className="col-2">
          <label className="float-left">Visible Rows</label>
        </div>
        <div className="col-1">
          <select
            onChange={(e) => {
              setPerpage(e.target.value);
            }}
            style={{ width: "50px" }}
          >
            <option>10</option>
            <option>20</option>
            <option>50</option>
            <option>100</option>
          </select>
        </div>
      </div>

      {/*  Dynamic Modal*/}
      <Modal
        show={modalVisible}
        size="lg"
        centered
        className="modal"
        onHide={() => setModalVisible(false)}
      >
        <ModalSalesRegister
          header={header}
          name={name}
          label={""}
          data={modalData}
          handleChange={(value, key) => handleChange(value, key)}
          closeModal={(e) => setModalVisible(e)}
        />
      </Modal>

      {soldToPartyModalVisble ? (
        <SearchSoldToParty
          show={soldToPartyModalVisble}
          setSearchedValue={console.log}
          hideIt={() => setsoldToPartyModalVisble(false)}
          mainKey="SOLD_TO_PARTY"
          setStateFunction={console.log}
          // commonValueUpdate={commonValueUpdate}
        />
      ) : null}
    </div>
  );
}

const mapStateToProps = (state) => ({
  Auth: state.Auth,
});

export default connect(mapStateToProps, { loading })(FIDaywiseReport);
