import React, { useState, useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import moment from "moment";
import http from "../../services/apicall";
import apis from "../../services/apis";
import Swal from "sweetalert2";
import { loading } from "../../actions/loadingAction";
import { connect } from "react-redux";
import Modal from "react-bootstrap/Modal";
import ReactPaginate from "react-paginate";
import isNumber from "is-number";
import { getLocalData, setLocalData } from "../../services/localStorage";

import ReactExport from "react-export-excel";
import Loader from "react-loader-spinner";
import { emptyResult } from "../../services/EmptyResult";
import Select from "react-select";
import filterDataReport from "../../Functions/filterDataReport";
import ModalSalesRegister from "./Modal";
import useComp from "../../hook/useComp";
import useRegion from "../../hook/useRegion";
import AsyncSelect from "react-select/async";
import fetchCustomerNumber from "../../Functions/fetchCustomer";
import usePlant from "../../hook/usePlant";

const ExcelFile = ReactExport.ExcelFile;
const ExcelSheet = ReactExport.ExcelFile.ExcelSheet;
const ExcelColumn = ReactExport.ExcelFile.ExcelColumn;

let today = moment();
let twodaysback = moment().subtract(2, "day");
let nullDate = moment(null);

function DebitAndCredit(props) {
  const [allCompanyCode, setAllCompanyCode] = useState([]);

  const [allRegion, setAllRegion] = useState([]);
  const [allOrderReceivingPlant, setAllOrderReceivingPlant] = useState([]);

  const [debitCreditReport, setDebitCreditReport] = useState([]);
  const [perPage, setPerPage] = useState(10);
  const [paginatedDebitCreditData, setPaginatedDebitCreditData] = useState([]);
  const [pageDebitAndCredit, setPageDebitAndCredit] = useState({
    CUMU_ORDER_QUAN: 0,
    NET_VALUE_DOCU_CUR: 0,
  });

  const [salesDocument, setSalesDocument] = useState([]);

  const [companyCode, setCompanyCode] = useState({});
  const [region, setRegion] = useState({});
  const [docType, setDocType] = useState({});
  const [cusgrp, setCusgrp] = useState({});
  const [salesGrpFrom, setSalesGrpFrom] = useState({});
  const [salesGrpTo, setSalesGrpTo] = useState({});
  const [customerFrom, setCustomerFrom] = useState({});
  const [customerTo, setCustomerTo] = useState({});

  const [plant, setPlant] = useState({});
  const [modalVisible, setModalVisible] = useState(false);
  const [modalData, setModalData] = useState([]);
  const [name, setName] = useState("");
  const [header, setHeader] = useState({});

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
      dr_cr_req_on_from: nullDate.format("YYYY-MM-DD"),
      dr_cr_req_on_to: nullDate.format("YYYY-MM-DD"),
      dr_cr_bil_on_from: twodaysback.format("YYYY-MM-DD"),
      dr_cr_bil_on_to: today.format("YYYY-MM-DD"),
    },
  });
  const watchAllFields = watch();

  //+++++++++++++++++++++++++++++++++++++++++++++fetch company code distribution channel division Region++++++++++++++++++++++++

  const comp_code = useComp();
  const region_hook = useRegion();

  useEffect(() => {
    setAllCompanyCode(filterDataReport(comp_code, "COMP_CODE", "COMP_NAME"));
  }, [comp_code]);

  useEffect(() => {
    if (region_hook)
      setAllRegion(filterDataReport(region_hook, "REGION", "REGION_DESC"));
  }, [region_hook]);

  // let fetchReceivingPlant = () => {
  //   props.loading(true);
  //   http
  //     .post(apis.FETCH_RECEIVING_PLANT_FOR_GR, {})
  //     .then((result) => {
  //       if (result.data.status) {
  //         setAllOrderReceivingPlant(result.data.data);
  //         setLocalData("gr-plants", result.data.data);
  //       } else {
  //         let msg = result.data.msg;
  //         if (msg.toLowerCase().startsWith("server")) {
  //           return null;
  //         } else {
  //           Swal.fire({
  //             title: "Error!",
  //             text: result.data.msg,
  //             icon: "error",
  //             confirmButtonText: "Ok",
  //           });
  //         }
  //       }
  //     })
  //     .catch((err) => {
  //       console.log(err);
  //     })
  //     .finally(() => {
  //       props.loading(false);
  //     });
  // };

  const plants = usePlant();

  useEffect(() => {
    console.log(plants);
    if (plants.length > 0) {
      setAllOrderReceivingPlant(
        plants.map((plant) => ({
          value: plant.WERKS,
          label: plant.WERKS + " - " + plant.NAME1,
        }))
      );
    }
  }, [plants]);

  useEffect(() => {
    // if (getLocalData("gr-plants")?.length > 0) {
    //   setAllOrderReceivingPlant(
    //     filterDataReport(getLocalData("gr-plants"), "PLANT", "PLANT_NAME")
    //   );
    // } else {
    //   fetchReceivingPlant();
    // }
    if (getLocalData("sales-group")?.length > 0) {
      setAllSalesgroup(
        filterDataReport(getLocalData("sales-group"), "VKGRP", "BEZEI")
      );
    } else {
      fetchSalesGroup();
    }
  }, []);

  //++++++++++++++++++++++++++++++++++++++++++++++searchSysytem plant+++++++++++++++++++++++++++++++++++++++++++++++++++

  //++++++++++++++++++++++++++++++++++++++++++++++searchSysytem+++++++++++++++++++++++++++++++++++++++++++++++++++

  //++++++++++++++++++++++++++++++++++++++++++++++Sales Group+++++++++++++++++++++++++++++++++++++++++++++++++++//

  const [allSalesGroup, setAllSalesgroup] = useState([]);

  let fetchSalesGroup = () => {
    props.loading(true);
    http
      .post(apis.REPORT_FETCH_SALES_GROUP, {
        IM_LOGIN_ID: localStorage.getItem("user_code"),
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
      })
      .finally(() => {
        props.loading(false);
      });
  };

  // Customer Grp

  const [allCusGrp, setAllCusGrp] = useState([]);

  const fetchCustomerGrp = () => {
    // http
    //   .post(apis.COMMON_POST_WITH_FM_NAME, {
    //     fm_name: "ZRFC_ZSD047N_CUST_GRP",
    //     params: { IM_KDGRP: "" },
    //   })
    //   .then((res) => {
    //     if (res.data.status) {
    //       setAllCusGrp(
    //         filterDataReport(res.data?.result?.IT_KDGRP, "KDGRP", "KTEXT")
    //       );
    //       setLocalData("cus-grp", res.data?.result?.IT_KDGRP);
    //     }
    //   });
    http
      .post(apis.COMMON_POST_WITH_TABLE_NAME, {
        TABLE: "CUSTOMER_GRP",
        params: {},
      })
      .then((res) => {
        if (res.data.status) {
          setAllCusGrp(filterDataReport(res.data?.result, "KDGRP", "KTEXT"));
          setLocalData("cus-grp", res.data?.result);
        }
      });
  };

  useEffect(() => {
    if (getLocalData("cus-grp")?.length > 0) {
      setAllCusGrp(filterDataReport(getLocalData("cus-grp"), "KDGRP", "KTEXT"));
    } else {
      fetchCustomerGrp();
    }
  }, []);

  //+++++++++++++++++++++++++++++++++++Page changer++++++++++++++++++++++===//
  let pageChange = ({ selected }) => {
    setPaginatedDebitCreditData(
      debitCreditReport.slice(selected * perPage, perPage * (selected + 1))
    );

    let x = debitCreditReport.slice(
      selected * perPage,
      perPage * (selected + 1)
    );

    let CUMU_ORDER_QUAN = 0;
    let NET_VALUE_DOCU_CUR = 0;

    x.forEach((resp) => {
      CUMU_ORDER_QUAN += +resp.QUANTITY_MT;
      NET_VALUE_DOCU_CUR += +resp.CRDR_AMOUNT;
    });
    setPageDebitAndCredit({
      CUMU_ORDER_QUAN: CUMU_ORDER_QUAN,
      NET_VALUE_DOCU_CUR: NET_VALUE_DOCU_CUR,
    });
  };

  useEffect(() => {
    pageChange({ selected: 0 });
  }, [perPage, debitCreditReport]);

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
    data.SO_DATE_HIGH =
      moment(watchAllFields.dr_cr_req_on_to).format("YYYYMMDD") ===
      "Invalid date"
        ? "00000000"
        : moment(watchAllFields.dr_cr_req_on_to).format("YYYYMMDD");
    data.SO_DATE_LOW =
      moment(watchAllFields.dr_cr_req_on_from).format("YYYYMMDD") ===
      "Invalid date"
        ? "00000000"
        : moment(watchAllFields.dr_cr_req_on_from).format("YYYYMMDD");
    data.IM_LOGIN_ID = localStorage.getItem("user_code");

    data["SO_FKDAT_LOW"] = moment(watchAllFields.dr_cr_bil_on_from).format(
      "YYYYMMDD"
    );
    data["SO_FKDAT_HIGH"] = moment(watchAllFields.dr_cr_bil_on_to).format(
      "YYYYMMDD"
    );

    data["KUNNR_FROM"] = customerFrom.value;
    data["KUNNR_TO"] = customerTo.value;

    delete data.dr_cr_req_on_from;
    delete data.dr_cr_req_on_to;
    delete data.dr_cr_bil_on_from;
    delete data.dr_cr_bil_on_to;

    props.loading(true);
    http
      .post(apis.COMMON_POST_WITH_FM_NAME, {
        fm_name: "ZRFC_ZSD047N_DRCR_NOTELIST",
        params: data,
      })
      .then((result) => {
        if (result.data.status) {
          emptyResult(result.data?.result?.IT_FINAL, setDebitCreditReport);

          let data = result.data.data;

          if (data?.length > 0) {
            let x = data.slice(0, perPage);

            let CUMU_ORDER_QUAN = 0;
            let NET_VALUE_DOCU_CUR = 0;

            x.forEach((resp) => {
              CUMU_ORDER_QUAN += +resp.QUANTITY_MT;
              NET_VALUE_DOCU_CUR += +resp.CRDR_AMOUNT;
            });
            setPageDebitAndCredit({
              CUMU_ORDER_QUAN: CUMU_ORDER_QUAN,
              NET_VALUE_DOCU_CUR: NET_VALUE_DOCU_CUR,
            });
          }
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

  const fetchDocType = () => {
    http
      .post(apis.COMMON_POST_WITH_FM_NAME, {
        fm_name: "ZRFC_ZSD047N_DOCUMENT_TYPE",
        params: {},
      })
      .then((res) => {
        if (res.data.status) {
          setSalesDocument(
            filterDataReport(res.data.result.IT_AUART, "AUART", "BEZEI")
          );
          setLocalData("doc-type", res.data.result.IT_AUART);
        }
      })
      .catch((err) => {
        fetchDocType();
        console.log(err);
      });
  };

  useEffect(() => {
    if (getLocalData("doc-type")?.length > 0) {
      setSalesDocument(
        filterDataReport(getLocalData("doc-type"), "AUART", "BEZEI")
      );
    } else {
      fetchDocType();
    }
  }, []);

  let setWithValidationTrigger = (key, value) => {
    setValue(key, value);
    triggerValidation(key);
  };

  // ++++++++++++++++++++++++++++++++++++++++++++Data Managing of Le register Data++++++++++++++++++++++++++

  useEffect(() => {
    let data = debitCreditReport;
    for (let i = 0; i < data.length; i++) {
      data[i].AUDAT = moment(data[i].AUDAT, "YYYYMMDD").format("DD-MM-YYYY");
      data[i].CRDRDT = moment(data[i].CRDRDT, "YYYYMMDD").format("DD-MM-YYYY");
      data[i].FKDAT = moment(data[i].FKDAT, "YYYYMMDD").format("DD-MM-YYYY");
    }
  }, [debitCreditReport]);

  // Data of Excel File
  let headers = [
    { label: "Sales Document", key: "VBELN" },
    { label: "Document Date", key: "AUDAT" },
    { label: "Item Number", key: "POSNR" },
    { label: "Material", key: "MATNR" },
    { label: "Billing date", key: "FKDAT" },
    { label: "Profit Center", key: "PRCTR" },
    { label: "Profit Center Description", key: "PRCTR_DESC" },
    { label: "Order Reason", key: "AUGRU" },
    { label: "Document Type", key: "AUART" },
    { label: "Document Description", key: "AUART_DESC" },
    { label: "Credit/Debit No", key: "CRDRNO" },
    { label: "Credit/Debit Date", key: "CRDRDT" },
    { label: "Preceding sales and distribution document", key: "VBELV" },
    // { label: "Billing date for billing index and printout", key: "REF_DT" },
    { label: "Billing Type", key: "FKART" },
    { label: "Billing Type Description", key: "FKART_DESC" },
    { label: "Discount Description", key: "DISC_DESC" },
    { label: "Plant", key: "WERKS" },
    { label: "Plant Description", key: "WERKS_DESC" },
    // { label: "Material Description", key: "MAKTX" },
    { label: "Customer Code", key: "KUNNR" },
    { label: "Customer Name", key: "KUNNR_NAME" },
    { label: "Customer Address", key: "KUNNR_ADDRESS" },
    { label: "Sales Group", key: "VKGRP" },
    { label: "Sales Group Description", key: "VKGRP_DESC" },
    { label: "Customer Group", key: "KDGRP" },
    { label: "Customer Group Description", key: "KDGRP_DESC" },
    { label: "Sales District", key: "BZIRK" },
    { label: "Sales District Description", key: "BZIRK_DESC" },
    { label: "Region", key: "REGIO" },
    { label: "Region Description", key: "REGIO_DESC" },
    { label: "Legal Text", key: "LEGAL_STAT" },
    { label: "County Code", key: "COUNC" },
    { label: "County Code Description", key: "COUNC_DESC" },
    { label: "Customer Tin No", key: "STCEG" },
    { label: "T-Zone", key: "LZONE" },
    { label: "T-Zone Description", key: "LZONE_DESC" },
    { label: "Distribution Channel", key: "VTWEG" },
    { label: "Quantity in MT", key: "QUANTITY_MT" },
    { label: "Quantity in Bags", key: "QUANTITY_BAG" },
    { label: "Cr Dr request Amount", key: "CRDR_AMOUNT" },
    { label: "Discount(MT)", key: "DISCOUNT_MT" },
    { label: "Discount(BAGS)", key: "DISCOUNT_BAG" },
    { label: "Base Value", key: "BASE_VALUE" },
    // { label: "Vat Percentage", key: "VAT_PER" },
    // { label: "Vat Amount", key: "VAT_VALUE" },
    // { label: "Add. Vat Percentage", key: "ADD_VAT_PER" },
    // { label: "Add. Vat Amount", key: "ADD_VAT_VALUE" },
    // { label: "Surcharge on Vat Percentage", key: "SUR_VAT_PER" },
    // { label: "Surcharge on Vat Amount", key: "SUR_VAT_VALUE" },
    // { label: "Total Vat", key: "TOTAL_VAT" },
    // { label: "CST Percentage", key: "CST_PER" },
    // { label: "CST Amount", key: "CST_VALUE" },
    { label: "DR/CR Amount to Customer", key: "DRCR_CUST_AMT" },
    { label: "CGSTIN no", key: "GSTIN" },
    { label: "CGST Amount", key: "CGST_V" },
    { label: "SGST Amount", key: "SGST_V" },
    { label: "IGST Amount", key: "IGST_V" },
  ];

  // +++++++++++++++++Data Fixing+++++++++++++++++++++++++++++++++++++++++//
  useEffect(() => {
    let data = debitCreditReport;

    let objectKeys = [];
    if (debitCreditReport.length !== 0) {
      objectKeys = Object.keys(data[0]);
    }

    for (let i = 0; i < data.length; i++) {
      for (let j = 0; j < objectKeys.length; j++) {
        if (isNumber(data[i][objectKeys[j]])) {
          data[i][objectKeys[j]] = Number(data[i][objectKeys[j]]);
        }
      }
    }
  }, [debitCreditReport]);

  // Common Handle Change
  const handleChange = (value, key) => {
    switch (key) {
      case "IM_BUKRS":
        setCompanyCode(value);
        setValue(key, value?.value);
        break;
      case "IM_REGIO":
        setRegion(value);
        setValue(key, value?.value);
        break;
      case "IM_AUART":
        setDocType(value);
        setValue(key, value?.value);
        break;
      case "IM_KDGRP":
        setCusgrp(value);
        setValue(key, value?.value);
        break;
      case "IM_PLANT":
        setPlant(value);
        setValue(key, value?.value);
        break;

      case "SO_VKGRP_HIGH":
        setSalesGrpTo(value);
        setValue(key, value?.value);
        break;
      case "SO_VKGRP_LOW":
        setSalesGrpFrom(value);
        setValue(key, value?.value);
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    if (Object.keys(errors).length > 0) {
      let msg = "";
      Object.keys(errors).forEach((keys, i) => {
        msg += `<p>${i + 1}. ${errors[keys]?.message}</p>`;
      });
      Swal.fire({ title: "Error", html: msg, icon: "error" });
    }
  }, [errors]);

  const handleChangeAsyncFrom = (value) => {
    console.log(value);
    setCustomerFrom({ value: value?.value, label: value?.label });
  };

  const handleChangeAsyncTo = (value) => {
    console.log(value);
    setCustomerTo({ value: value?.value, label: value?.label });
  };

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
                    setName("IM_BUKRS");
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
                      onChange={(event) => handleChange(event, "IM_BUKRS")}
                      options={allCompanyCode}
                      placeholder=""
                    />
                  )}
                  defaultValue=""
                  control={control}
                  name="IM_BUKRS"
                  rules={{
                    required: "Company code is required",
                  }}
                />
              </div>
            </div>
          </div>
          <div className="col-4">
            <div className="row">
              <div className="col-offset-1 col-6">
                <label>DR/CR Req. Doc. Date From</label>
              </div>
              <div className="col-5">
                <input
                  type="date"
                  placeholder="From"
                  name="dr_cr_req_on_from"
                  ref={register({
                    validate: (value) => {
                      let ans = false;
                      if (watchAllFields.dr_cr_req_on_to) {
                        if (
                          (moment(watchAllFields.dr_cr_req_on_from).isBefore(
                            moment(watchAllFields.dr_cr_req_on_to)
                          ) ||
                            moment(watchAllFields.dr_cr_req_on_from).isSame(
                              moment(watchAllFields.dr_cr_req_on_to)
                            )) &&
                          moment(watchAllFields.dr_cr_req_on_to).diff(
                            moment(watchAllFields.dr_cr_req_on_from),
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
                />
                {errors.dr_cr_req_on_from && (
                  <p className="form-error">Date should be within 31 days</p>
                )}
              </div>
            </div>
          </div>
          <div className="col-4">
            <div className="row">
              <div className="col-6">
                <label>DR/CR Req. Doc. Date To</label>
              </div>
              <div className="col-6">
                <input
                  type="date"
                  placeholder="From"
                  name="dr_cr_req_on_to"
                  ref={register({
                    validate: (value) => {
                      let ans = false;
                      if (watchAllFields.dr_cr_req_on_to) {
                        if (
                          (moment(watchAllFields.dr_cr_req_on_from).isBefore(
                            moment(watchAllFields.dr_cr_req_on_to)
                          ) ||
                            moment(watchAllFields.dr_cr_req_on_from).isSame(
                              moment(watchAllFields.dr_cr_req_on_to)
                            )) &&
                          moment(watchAllFields.dr_cr_req_on_to).diff(
                            moment(watchAllFields.dr_cr_req_on_from),
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
                />
                {errors.dr_cr_req_on_to && (
                  <p className="form-error">Date should be within 31 days</p>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="row">
          <div className="col">
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
                    setName("IM_REGIO");
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
                      onChange={(event) => handleChange(event, "IM_REGIO")}
                      options={allRegion}
                      placeholder=""
                    />
                  )}
                  defaultValue=""
                  control={control}
                  name="IM_REGIO"
                  rules={{
                    required: "Region is required",
                  }}
                />
                {/* <i
                  className="far fa-clone click-icons"
                  onClick={() => {
                    openRegionSearchModal();
                  }}
                ></i>
                <input
                  type="text"
                  ref={register}
                  name="region"
                  onChange={(e) => {
                    setSelectedRegion({
                      REGION: e.target.value,
                    });
                    setWithValidationTrigger("region", e.target.value);
                  }}
                  // readOnly
                />

                {errors.region && (
                  <p className="form-error">This field is required</p>
                )} */}
              </div>
            </div>
          </div>
          <div className="col-4">
            <div className="row">
              <div className="col-6">
                <label>
                  DR/CR Billing Date From<span>*</span>
                </label>
              </div>
              <div className="col-5">
                <input
                  type="date"
                  placeholder="From"
                  name="dr_cr_bil_on_from"
                  ref={register({
                    validate: (value) => {
                      let ans = false;
                      if (watchAllFields.dr_cr_bil_on_to) {
                        if (
                          (moment(watchAllFields.dr_cr_bil_on_from).isBefore(
                            moment(watchAllFields.dr_cr_bil_on_to)
                          ) ||
                            moment(watchAllFields.dr_cr_bil_on_from).isSame(
                              moment(watchAllFields.dr_cr_bil_on_to)
                            )) &&
                          moment(watchAllFields.dr_cr_bil_on_to).diff(
                            moment(watchAllFields.dr_cr_bil_on_from),
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
                />
                {errors.dr_cr_bil_on_from && (
                  <p className="form-error">Date should be within 31 days</p>
                )}
              </div>
            </div>
          </div>
          <div className="col-4">
            <div className="row">
              <div className="col-6">
                <label>
                  DR/CR Billing Date To<span>*</span>
                </label>
              </div>
              <div className="col-6">
                <input
                  type="date"
                  placeholder="From"
                  name="dr_cr_bil_on_to"
                  ref={register({
                    validate: (value) => {
                      let ans = false;
                      if (watchAllFields.dr_cr_bil_on_to) {
                        if (
                          (moment(watchAllFields.dr_cr_bil_on_from).isBefore(
                            moment(watchAllFields.dr_cr_bil_on_to)
                          ) ||
                            moment(watchAllFields.dr_cr_bil_on_from).isSame(
                              moment(watchAllFields.dr_cr_bil_on_to)
                            )) &&
                          moment(watchAllFields.dr_cr_bil_on_to).diff(
                            moment(watchAllFields.dr_cr_bil_on_from),
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
                />
                {errors.dr_cr_bil_on_to && (
                  <p className="form-error">Date should be within 31 days</p>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="row">
          <div className="col">
            <div className="row">
              <div className="col-2">
                <label>
                  Plant <span>*</span>
                </label>
              </div>
              <div className="col-9">
                <i
                  className="far fa-clone click-icons"
                  onClick={() => {
                    setModalVisible(true);
                    setModalData(allOrderReceivingPlant);
                    setName("IM_PLANT");
                    setHeader({
                      title: "Plant",
                      name: "Plant Code",
                      desc: "Plant Name",
                    });
                  }}
                ></i>
                <Controller
                  as={({ onChange, value }) => (
                    <Select
                      classNamePrefix="react-select"
                      value={plant}
                      onChange={(event) => handleChange(event, "IM_PLANT")}
                      options={allOrderReceivingPlant}
                      placeholder=""
                    />
                  )}
                  rules={{
                    required: "Plant is required",
                  }}
                  defaultValue=""
                  control={control}
                  name="IM_PLANT"
                />
                {/* <i
                  className="far fa-clone click-icons"
                  onClick={() => {
                    openPlantSearchModal();
                  }}
                ></i>
                <input
                  type="text"
                  ref={register}
                  name="plant"
                  onChange={(e) => {
                    setSelectedPlant({
                      PLANT: e.target.value,
                    });
                    setWithValidationTrigger("plant", e.target.value);
                  }}
                />
                {errors.plant && (
                  <p className="form-error">Please select an option</p>
                )} */}
              </div>
            </div>
          </div>
          <div className="col">
            <div className="row">
              <div className="col-4">
                <label>Sales Doc Type</label>
              </div>
              <div className="col-8">
                <i
                  className="far fa-clone click-icons"
                  onClick={() => {
                    setModalVisible(true);
                    setModalData(salesDocument);
                    setName("IM_AUART");
                    setHeader({
                      title: "Sales Document",
                      name: "Sales Doc. Code",
                      desc: "Sales Doc. Name",
                    });
                  }}
                ></i>
                <Controller
                  as={({ onChange, value }) => (
                    <Select
                      classNamePrefix="react-select"
                      value={docType}
                      onChange={(event) => handleChange(event, "IM_AUART")}
                      options={salesDocument}
                      placeholder=""
                    />
                  )}
                  defaultValue=""
                  control={control}
                  name="IM_AUART"
                />
                {/* <i
                  className="far fa-clone click-icons"
                  onClick={() => setIsSalesDocumentModal(true)}
                ></i>
                <input
                  type="text"
                  name="document_type"
                  ref={register}
                  onChange={(e) => setSelectedSales(e.target.value)}
                /> */}
              </div>
            </div>
          </div>
          <div className="col">
            <div className="row">
              <div className="col-4">
                <label>Customer group From</label>
              </div>
              <div className="col-8">
                <i
                  className="far fa-clone click-icons"
                  onClick={() => {
                    setModalVisible(true);
                    setModalData(allCusGrp);
                    setName("IM_KDGRP");
                    setHeader({
                      title: "Customer Group",
                      name: "Customer Group Code",
                      desc: "Customer Group Name",
                    });
                  }}
                ></i>
                <Controller
                  as={({ onChange, value }) => (
                    <Select
                      classNamePrefix="react-select"
                      value={cusgrp}
                      onChange={(event) => handleChange(event, "IM_KDGRP")}
                      options={allCusGrp}
                      placeholder=""
                    />
                  )}
                  defaultValue=""
                  control={control}
                  name="IM_KDGRP"
                />
                {/* <i
                  className="far fa-clone click-icons"
                  onClick={() => {
                    setFilteredCusGrp(allCusGrp);
                    setIsCusGrp(true);
                  }}
                ></i>
                <input
                  type="text"
                  onChange={(e) => setSelectedCusGrp(e.target.value)}
                  value={selectedCusGrp}
                /> */}
              </div>
            </div>
          </div>
        </div>
        <div className="row">
          <div className="col-6">
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
          <div className="col-6">
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
          <div className="col">
            <div className="row">
              <div className="col-4">
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
                    setName("SO_VKGRP_LOW");
                    setHeader({
                      title: "Sales Group From",
                      name: "Sales Group From Code",
                      desc: "Sales Group From Name",
                    });
                  }}
                ></i>
                <Controller
                  as={({ onChange, value }) => (
                    <Select
                      classNamePrefix="react-select"
                      value={salesGrpFrom}
                      onChange={(event) => handleChange(event, "SO_VKGRP_LOW")}
                      options={allSalesGroup}
                      placeholder=""
                    />
                  )}
                  defaultValue=""
                  control={control}
                  name="SO_VKGRP_LOW"
                  rules={{
                    required: "Sales Group From is required",
                  }}
                />
              </div>
            </div>
          </div>
          <div className="col">
            <div className="row">
              <div className="col-4">
                <label>Sales Group To</label>
              </div>
              <div className="col-8">
                <i
                  className="far fa-clone click-icons"
                  onClick={() => {
                    setModalVisible(true);
                    setModalData(allSalesGroup);
                    setName("SO_VKGRP_HIGH");
                    setHeader({
                      title: "Sales Group To",
                      name: "Sales Group To Code",
                      desc: "Sales Group To Name",
                    });
                  }}
                ></i>
                <Controller
                  as={({ onChange, value }) => (
                    <Select
                      classNamePrefix="react-select"
                      value={salesGrpTo}
                      onChange={(event) => handleChange(event, "SO_VKGRP_HIGH")}
                      options={allSalesGroup}
                      placeholder=""
                    />
                  )}
                  defaultValue=""
                  control={control}
                  name="SO_VKGRP_HIGH"
                />
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

      <div className="background">
        <div className="table-filter">
          <div className="filter-div">
            <div className="row">
              <div className="col">
                <div className="row">
                  <div className="col">
                    {debitCreditReport ? (
                      <ExcelFile
                        filename={`Debit and Credit Report: Companycode-${getValues(
                          "IM_BUKRS"
                        )}--Region:${getValues(
                          "IM_REGIO"
                        )}--Dr Cr bill:${getValues(
                          "dr_cr_bil_on_from"
                        )} to ${getValues("dr_cr_bil_on_to")}`}
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
                          data={debitCreditReport}
                          name="FI Register Report"
                        >
                          {headers?.map((value, i) => (
                            <ExcelColumn
                              key={value}
                              label={value.label}
                              value={value.key}
                            />
                          ))}
                        </ExcelSheet>
                      </ExcelFile>
                    ) : null}
                    {/* {debitCreditReport ? (
                      <CSVLink
                        className="goods-button float-right"
                        style={{ backgroundColor: "#0F6FA2" }}
                        data={debitCreditReport}
                        // headers={headers}
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
                    {headers.map((header, i) => (
                      <th
                        key={i}
                        className="table-sticky-vertical"
                        style={{
                          minWidth: "200px",
                        }}
                        scope="col"
                      >
                        {header.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {props.loader.loading_state.length > 0 ? (
                    <div className="loader-div ">
                      <Loader
                        type="Oval"
                        color="#00BFFF"
                        height={60}
                        width={60}
                      />
                    </div>
                  ) : (
                    paginatedDebitCreditData.map((ele, i) => (
                      <tr key={i}>
                        {headers.map((body, i) => (
                          <td key={i}>{ele[body.key]}</td>
                        ))}
                      </tr>
                    ))
                  )}
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
          pageCount={debitCreditReport.length / perPage}
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
              setPerPage(e.target.value);
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

      <div
        className="agregatePageTable"
        style={{
          marginLeft: "30px",
        }}
      >
        {" "}
        Cumulative Order Quantity in Sales Units:{" "}
        <span>{pageDebitAndCredit.CUMU_ORDER_QUAN}</span> &emsp; &emsp; Net
        value of the order item in document currency:{" "}
        <span>{pageDebitAndCredit.NET_VALUE_DOCU_CUR}</span>
        <br />
        <br />
      </div>

      {/* Sales Document Type Modal Close */}

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
    </div>
  );
}

const mapStateToProps = (state) => ({
  Auth: state.Auth,
  loader: state.Loader,
});

export default connect(mapStateToProps, { loading })(DebitAndCredit);
