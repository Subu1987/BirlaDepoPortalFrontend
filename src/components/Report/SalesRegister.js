import React, { useEffect, useState } from "react";
import { loading } from "../../actions/loadingAction";
import { connect } from "react-redux";
import { useForm, Controller } from "react-hook-form";
import Select from "react-select";
import Swal from "sweetalert2";
import Modal from "react-bootstrap/Modal";
import moment from "moment";
import ReactExport from "react-export-excel";
import headers from "./salesRegisterHeaders";
import ModalSalesRegister from "./Modal";
import http from "../../services/apicall";
import apis from "../../services/apis";
import SalesRegisterTable from "./SalesRegisterTable";
import filterDataReport from "../../Functions/filterDataReport";
import isNumber from "is-number";
import { getLocalData, setLocalData } from "../../services/localStorage";
import { emptyResult } from "../../services/EmptyResult";
import removeDuplicatesByKey from "../utils/removeDuplicateByKey";
import usePlant from "../../hook/usePlant";
import useComp from "../../hook/useComp";

const ExcelFile = ReactExport.ExcelFile;
const ExcelSheet = ReactExport.ExcelFile.ExcelSheet;
const ExcelColumn = ReactExport.ExcelFile.ExcelColumn;

let today = moment();
let twodaysback = moment().subtract(2, "day");

function SalesRegister(props) {
  const [salesReport, setSalesReport] = useState([]);
  const [salesTable, setSalesTable] = useState([]);

  // States of Modal
  const [modalVisible, setModalVisible] = useState(false);
  const [modalData, setModalData] = useState([]);
  const [name, setName] = useState("");
  const [header, setHeader] = useState({
    title: "Demo Title",
    name: "Demo Name",
    desc: "Demo Desc",
  });

  //   States of Data
  // const [allOrderSupplyingPlants, setAllOrderSupplyingPlants] = useState([]);
  const [plantOptions, setPlantOptions] = useState([]);
  const [plantValueFrom, setPlantValueFrom] = useState([]);
  const [plantValueTo, setPlantValueTo] = useState([]);

  // const [allDistributionChannel, setAllDistributionChannel] = useState([]);
  const [distributionOption, setDistributionOption] = useState([]);
  const [distributionFrom, setDistributionFrom] = useState([]);
  const [distributionTo, setDistributionTo] = useState([]);

  // const [allDivision, setAllDivision] = useState([]);
  const [divisionOptions, setDivisionOptions] = useState([]);
  const [divisionFrom, setDivisionFrom] = useState([]);
  const [divisionTo, setDivisionTo] = useState([]);

  // const [allSalesOffice, setAllSalesOffice] = useState([]);
  const [salesOfficeOptions, setSalesOfficeOptions] = useState([]);
  const [salesOfficeFrom, setSalesOfficeFrom] = useState([]);
  const [salesOfficeTo, setSalesOfficeTo] = useState([]);

  // const [allCompanyCode, setAllCompanyCode] = useState([]);
  const [companyCodeOptions, setCompanyOptions] = useState([]);
  const [companyCodeFrom, setCompanyCodeFrom] = useState([]);
  const [companyCodeTo, setCompanyCodeTo] = useState([]);

  // const [allSalesDistrict, setAllSalesDistrict] = useState([]);
  const [salesDistrictOptions, setSalesDistrictOptions] = useState([]);
  const [salesDistrictFrom, setSalesDistrictFrom] = useState([]);
  const [salesDistrictTo, setSalesDistrictTo] = useState([]);

  // const [allRegion, setAllRegion] = useState([]);
  const [regionOptions, setRegionOptions] = useState([]);
  const [regionFrom, setRegionFrom] = useState([]);
  const [regionTo, setRegionTo] = useState([]);

  // const [allSalesDocument, setAllSalesDocument] = useState([]);
  const [salesDocumentOptions, setSalesDocumentOptions] = useState([]);
  const [salesDocumentFrom, setSalesDocumentFrom] = useState([]);
  const [salesDocumentTo, setSalesDocumentTo] = useState([]);

  // const [allMaterial, setAllMaterial] = useState([]);
  const [materialOptions, setMaterialOptions] = useState([]);
  const [materialOptionsTo, setMaterialOptionsTo] = useState([]);
  const [materialFrom, setMaterialFrom] = useState([]);
  const [materialTo, setMaterialTo] = useState([]);

  const [salesGrpFrom, setSalesGrpFrom] = useState([]);
  const [salesGrpTo, setSalesGrpTo] = useState([]);

  const {
    handleSubmit,
    control,
    setValue,
    errors,
    register,
    watch,
    getValues,
  } = useForm({
    defaultValues: {
      IM_DATE_FROM: twodaysback.format("YYYY-MM-DD"),
      IM_DATE_TO: today.format("YYYY-MM-DD"),
    },
  });
  const watchAllFields = watch();

  //   ++++++++++++++++++++++Form Submit +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++//
  const formSubmit = (data) => {
    // console.log(data);
    // console.log(Object.keys(data).length);
    data.IM_DATE_FROM = moment(data.IM_DATE_FROM).format("YYYYMMDD");
    data.IM_DATE_TO = moment(data.IM_DATE_TO).format("YYYYMMDD");
    data.IM_LOGIN_ID = localStorage.getItem("user_code");

    fetchSalesRegister(data);
  };

  //   +++++++++++++++++++++++++++++++++++Fetch Sales Register+++++++++++++++++++++++++++++++++++++++++++   //
  const fetchSalesRegister = (data) => {
    props.loading(true);
    http
      .post(apis.COMMON_POST_WITH_FM_NAME, {
        fm_name: "ZRFC_ZSD01_SALES_REGISTER",
        params: data,
      })
      .then((res) => {
        if (res.data.status) {
          emptyResult(res.data.result?.IT_FINAL, setSalesReport);
          // setSalesReport(res.data.result?.IT_FINAL);
        }
      })
      .catch((err) => console.log(err))
      .finally(() => props.loading(false));
  };

  // +++++++++++++++++++++++++++++++++Plant++++++++++++++++++++++++++++++++++++++++++++++++++++//
  const plant = usePlant();

  useEffect(() => {
    if (plant.length > 0) {
      setPlantOptions(filterDataReport(plant, "WERKS", "NAME1"));
    }
  }, [plant]);

  //   ++++++++++++++++++++++++++++++++Distribution channel +++++++++++++++++++++++++++++++//
  let fetchDistributionChannel = () => {
    props.loading(true);
    http
      .post(apis.LE_REGISTER_FETCH_DISTRIBUTION_CHANNEL, {})
      .then((result) => {
        if (result.data.status) {
          // setAllDistributionChannel(result.data.data);
          setDistributionOption(
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
        console.log(err);
      })
      .finally(() => {
        props.loading(false);
      });
  };

  //+++++++++++++++++++++++++++++++++Division Channel ++++++++++++++++++++++++++++++++++++++//
  let fetchDivision = () => {
    props.loading(true);
    http
      .post(apis.LE_REGION_FETCH_DIVISION, {})
      .then((result) => {
        if (result.data.status) {
          // setAllDivision(result.data.data);
          setDivisionOptions(
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

  //++++++++++++++++++++++++++++ Sales Office ++++++++++++++++++++++++++++++++++++++++++++//

  let fetchSalesOffice = () => {
    props.loading(true);
    http
      .post(apis.REPORT_FETCH_OFFICE, {
        IM_LOGIN_ID: localStorage.getItem("user_code"),
      })
      .then((result) => {
        if (result.data.status) {
          // setAllSalesOffice(result.data.data);
          setSalesOfficeOptions(
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

  //+++++++++++++++++++++++++++++Sales Organization  ++++++++++++++++++++++++++++++++++++++++//

  const comp_code = useComp();

  useEffect(() => {
    setCompanyOptions(filterDataReport(comp_code, "COMP_CODE", "COMP_NAME"));
  }, [comp_code]);

  //+++++++++++++++++++++++++Sales Office +++++++++++++++++++++++++++++++++++++++++++++++++//
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
          // setAllSalesDistrict(result.data.data);

          let data = result.data.result.EX_DISTRICT;
          let uniqueData = removeDuplicatesByKey(data, "BZIRK");

          setSalesDistrictOptions(
            filterDataReport(uniqueData, "BZIRK", "BZTXT")
          );
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

  //++++++++++++++++++++++++++++Region ++++++++++++++++++++++++++++++++++++++++++++++++++++++++//
  let fetchRegion = () => {
    props.loading(true);
    http
      .post(apis.LE_REGISTER_FETCH_REGION, {})
      .then((result) => {
        if (result.data.status) {
          // setAllRegion(result.data.data);
          setRegionOptions(
            filterDataReport(result.data.data, "REGION", "REGION_DESC")
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

  //+++++++++++++++++++++++++++++++++++++Sales Document+++++++++++++++++++++++++++++++//
  let fetchSalesDocument = () => {
    props.loading(true);
    http
      .post(apis.COMMON_POST_WITH_FM_NAME, {
        fm_name: "ZRFC_ZSD047N_DOCUMENT_TYPE",
        params: {},
      })
      .then((res) => {
        // setAllSalesDocument(res.data.result.IT_AUART);
        setSalesDocumentOptions(
          filterDataReport(res.data.result.IT_AUART, "AUART", "BEZEI")
        );
        setLocalData("doc-type", res.data.result.IT_AUART);
      })
      .catch((err) => {
        console.log(err);
        fetchSalesDocument();
      })
      .finally(() => props.loading(false));
  };

  //+++++++++++++++++++++++++++++++++++++All Material+++++++++++++++++++++++++++++++//
  let fetchMaterial = () => {
    props.loading(true);
    http
      .post(apis.GET_ORDER_MATERIAL_OF_PLANT, {
        lv_plant: plantValueFrom?.value,
      })
      .then((result) => {
        if (result.data.status) {
          // setAllMaterial(result.data.result.IT_FINAL);
          setMaterialOptions(
            filterDataReport(result.data.result.IT_FINAL, "MATNR", "MAKTX")
          );
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
        fetchMaterial();
      })
      .finally(() => {
        props.loading(false);
      });
  };

  let fetchMaterialTo = () => {
    props.loading(true);
    http
      .post(apis.GET_ORDER_MATERIAL_OF_PLANT, {
        lv_plant: plantValueTo?.value,
      })
      .then((result) => {
        if (result.data.status) {
          // setAllMaterial(result.data.result.IT_FINAL);
          setMaterialOptionsTo(
            filterDataReport(result.data.result.IT_FINAL, "MATNR", "MAKTX")
          );
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
        fetchMaterialTo();
      })
      .finally(() => {
        props.loading(false);
      });
  };

  useEffect(() => {
    if (getLocalData("dist-chan")?.length > 0) {
      setDistributionOption(
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
      setDivisionOptions(
        filterDataReport(getLocalData("division"), "DIVISION", "DIVISION_DESC")
      );
    } else {
      fetchDivision();
    }
    if (getLocalData("sales-office")?.length > 0) {
      setSalesOfficeOptions(
        filterDataReport(getLocalData("sales-office"), "VKBUR", "BEZEI")
      );
    } else {
      fetchSalesOffice();
    }

    if (getLocalData("sales-district")?.length > 0) {
      setSalesDistrictOptions(
        filterDataReport(getLocalData("sales-district"), "BZIRK", "BZTXT")
      );
    } else {
      fetchSalesDistrict();
    }

    if (getLocalData("regions")?.length > 0) {
      setRegionOptions(
        filterDataReport(getLocalData("regions"), "REGION", "REGION_DESC")
      );
    } else {
      fetchRegion();
    }

    if (getLocalData("doc-type")?.length > 0) {
      setSalesDocumentOptions(
        filterDataReport(getLocalData("doc-type"), "AUART", "BEZEI")
      );
    } else {
      fetchSalesDocument();
    }
  }, []);

  useEffect(() => {
    if (Object.keys(plantValueFrom).length > 0) {
      fetchMaterial();
    }
  }, [plantValueFrom]);

  useEffect(() => {
    if (Object.keys(plantValueTo).length > 0) {
      fetchMaterialTo();
    }
  }, [plantValueTo]);

  // Errors
  useEffect(() => {
    // console.log(errors);
    if (Object.keys(errors).length > 0) {
      let msg = "";
      Object.keys(errors).forEach((keys, i) => {
        msg += `<p>${i + 1}. ${errors[keys]?.message}</p>`;
      });
      Swal.fire({ title: "Error", html: msg, icon: "error" });
    }
  }, [errors]);

  //+++++++++++++++++++++Filter Options+++++++++++++++++++++++++++//
  // useEffect(() => {
  //   setPlantOptions(
  //     filterDataReport(allOrderSupplyingPlants, "WERKS", "NAME1")
  //   );
  // }, [allOrderSupplyingPlants]);

  // useEffect(() => {
  //   setDistributionOption(
  //     filterDataReport(allDistributionChannel, "DIST_CHANNEL", "DIST_CHAN_DESC")
  //   );
  // }, [allDistributionChannel]);

  // useEffect(() => {
  //   setDivisionOptions(
  //     filterDataReport(allDivision, "DIVISION", "DIVISION_DESC")
  //   );
  // }, [allDivision]);

  // useEffect(() => {
  //   setSalesOfficeOptions(filterDataReport(allSalesOffice, "VKBUR", "BEZEI"));
  // }, [allSalesOffice]);

  // useEffect(() => {
  //   setCompanyOptions(
  //     filterDataReport(allCompanyCode, "COMP_CODE", "COMP_NAME")
  //   );
  // }, [allCompanyCode]);

  // useEffect(() => {
  //   setSalesDistrictOptions(
  //     filterDataReport(allSalesDistrict, "BZIRK", "BZTXT")
  //   );
  // }, [allSalesDistrict]);

  // useEffect(() => {
  //   setRegionOptions(filterDataReport(allRegion, "REGION", "REGION_DESC"));
  // }, [allRegion]);

  // useEffect(() => {
  //   setSalesDocumentOptions(
  //     filterDataReport(allSalesDocument, "REGION", "REGION_DESC")
  //   );
  // }, [allSalesDocument]);

  // useEffect(() => {
  //   setMaterialOptions(filterDataReport(allMaterial, "MATNR", "MAKTX"));
  // }, [allMaterial]);

  // Common Handle Change
  const handleChange = (value, key) => {
    switch (key) {
      case "IM_WERKS_FROM":
        setPlantValueFrom(value);
        setValue(key, value?.value);
        break;
      case "IM_WERKS_TO":
        setPlantValueTo(value);
        setValue(key, value?.value);
        break;
      case "IM_VTWEG_FROM":
        setDistributionFrom(value);
        setValue(key, value?.value);
        break;
      case "IM_VTWEG_TO":
        setDistributionTo(value);
        setValue(key, value?.value);
        break;
      case "IM_VKORG_FROM":
        setCompanyCodeFrom(value);
        setValue(key, value?.value);
        break;
      case "IM_VKORG_TO":
        setCompanyCodeTo(value);
        setValue(key, value?.value);
        break;
      case "IM_SPART_FROM":
        setDivisionFrom(value);
        setValue(key, value?.value);
        break;
      case "IM_SPART_TO":
        setDivisionTo(value);
        setValue(key, value?.value);
        break;
      case "IM_VKBUR_FROM":
        setSalesOfficeFrom(value);
        setValue(key, value?.value);
        break;
      case "IM_VKBUR_TO":
        setSalesOfficeTo(value);
        setValue(key, value?.value);
        break;
      case "IM_BZIRK_FROM":
        setSalesDistrictFrom(value);
        setValue(key, value?.value);
        break;
      case "IM_BZIRK_TO":
        setSalesDistrictTo(value);
        setValue(key, value?.value);
        break;
      case "IM_REGIO_FROM":
        setRegionFrom(value);
        setValue(key, value?.value);
        break;
      case "IM_REGIO_TO":
        setRegionTo(value);
        setValue(key, value?.value);
        break;
      case "IM_AUBEL_FROM":
        setSalesDocumentFrom(value);
        setValue(key, value?.value);
        break;
      case "IM_AUBEL_TO":
        setSalesDocumentTo(value);
        setValue(key, value?.value);
        break;
      case "IM_MATNR_FROM":
        setMaterialFrom(value);
        setValue(key, value?.value);
        break;
      case "IM_MATNR_TO":
        setMaterialTo(value);
        setValue(key, value?.value);
        break;
      case "IM_VKGRP_FROM":
        setSalesGrpFrom(value);
        setValue(key, value?.value);
        break;
      case "IM_VKGRP_TO":
        setSalesGrpTo(value);
        setValue(key, value?.value);
        break;
      default:
        break;
    }
  };

  const minMaxValidate = (value, key, message) => {
    if (getValues(key) !== "") {
      if (Number(value) && Number(getValues(key))) {
        if (Number(value) > Number(getValues(key))) {
          return message;
        }
      } else {
        if (moment(getValues(key)).diff(value, "days") > 31) {
          return "Date should be within 31 days";
        }
        if (value > getValues(key)) {
          return message;
        }
      }
      return true;
    }
  };

  // Fix Date Format//
  useEffect(() => {
    let data = salesReport;

    for (let i = 0; i < data.length; i++) {
      data[i].FKDAT = isNumber(data[i]?.FKDAT)
        ? moment(data[i]?.FKDAT, "YYYYMMDD").format("DD.MM.YYYY")
        : "";

      data[i].PGI_DT = isNumber(data[i].PGI_DT)
        ? moment(data[i]?.PGI_DT, "YYYYMMDD").format("DD.MM.YYYY")
        : "";
      data[i].EX_DT =
        isNumber(data[i].EX_DT) && Number(data[i].EX_DT) !== 0
          ? moment(data[i]?.EX_DT, "YYYYMMDD").format("DD.MM.YYYY")
          : "";
      data[i].ERDAT = isNumber(data[i].ERDAT)
        ? moment(data[i]?.ERDAT, "YYYYMMDD").format("DD.MM.YYYY")
        : "";
      data[i].EX_TIME =
        isNumber(data[i].EX_TIME) && Number(data[i].EX_TIME) !== 0
          ? moment(data[i]?.EX_TIME, "HHMMSS").format("hh:mm")
          : "";
    }
    setSalesTable(data);
  }, [salesReport]);

  //   Number Correction
  useEffect(() => {
    let data = salesReport;
    let objectKeys = [];
    if (salesReport.length !== 0) {
      objectKeys = Object.keys(data[0]);
    }

    for (let i = 0; i < data.length; i++) {
      for (let j = 0; j < objectKeys.length; j++) {
        if (isNumber(data[i][objectKeys[j]])) {
          data[i][objectKeys[j]] = Number(data[i][objectKeys[j]]);
        }
      }
    }
  }, [salesReport]);

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

  useEffect(() => {
    fetchSalesGroup();
  }, []);

  return (
    <div>
      <div className="container-fluid">
        <form
          className="filter-section"
          onSubmit={handleSubmit((data) => formSubmit(data))}
        >
          <div className="row">
            <div className="col-3">
              <div className="row">
                <div className="col-6">
                  <label className="">Billing Date From</label>
                </div>
                <div className="col-5">
                  <input
                    type="date"
                    placeholder="From"
                    name="IM_DATE_FROM"
                    ref={register({
                      validate: (value) =>
                        minMaxValidate(
                          value,
                          "IM_DATE_TO",
                          "Billing Date from should less than billing date to"
                        ),
                    })}
                  />
                </div>
              </div>
            </div>
            <div className="col-3">
              <div className="row">
                <div className="col-6">
                  <label className="float-right">Billing Date To</label>
                </div>
                <div className="col-5">
                  <input
                    type="date"
                    name="IM_DATE_TO"
                    ref={register({
                      required: "Billing date to is required",
                      // validate: (value) =>
                      //   minMaxValidate(
                      //     value,
                      //     "IM_DATE_TO",
                      //     "Plant from should less than Plant to"
                      //   ),

                      // (value) => {
                      //   let ans = false;
                      //   if (watchAllFields.IM_DATE_FROM) {
                      //     if (
                      //       moment(watchAllFields.IM_DATE_FROM).isBefore(
                      //         moment(watchAllFields.IM_DATE_TO)
                      //       ) ||
                      //       moment(watchAllFields.IM_DATE_FROM).isSame(
                      //         moment(watchAllFields.IM_DATE_TO)
                      //       )
                      //     ) {
                      //       ans = true;
                      //     }
                      //   } else {
                      //     ans = true;
                      //   }
                      //   return ans;
                      // },
                    })}
                  />
                  {/* {errors.IM_DATE_TO && (
                    <p className="form-error">Please put a valid date</p>
                  )} */}
                </div>
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-5">
              <div className="row">
                <div className="col-3">
                  <label>
                    Plant From<span>*</span>
                  </label>
                </div>
                <div className="col-8">
                  <i
                    className="far fa-clone click-icons"
                    onClick={() => {
                      setModalVisible(true);
                      setModalData(plantOptions);
                      setName("IM_WERKS_FROM");
                      setHeader({
                        title: "Plant From",
                        name: "Plant Code",
                        desc: "Plant Name",
                      });
                    }}
                  ></i>
                  <Controller
                    as={({ onChange, value }) => (
                      <Select
                        classNamePrefix="react-select"
                        value={plantValueFrom}
                        onChange={(event) =>
                          handleChange(event, "IM_WERKS_FROM")
                        }
                        options={plantOptions}
                        placeholder=""
                      />
                    )}
                    defaultValue=""
                    control={control}
                    name="IM_WERKS_FROM"
                    rules={{
                      required: "Plant From is required",
                      validate: (value) =>
                        minMaxValidate(
                          value,
                          "IM_WERKS_TO",
                          "Plant from should less than Plant to"
                        ),
                    }}
                  />
                </div>
              </div>
            </div>
            <div className="col-5">
              <div className="row">
                <div className="col-3">
                  <label>Plant To</label>
                </div>
                <div className="col-8">
                  <i
                    className="far fa-clone click-icons"
                    onClick={() => {
                      setModalVisible(watchAllFields.IM_WERKS_FROM !== "");
                      setModalData(plantOptions);
                      setName("IM_WERKS_TO");
                      setHeader({
                        title: "Plant To",
                        name: "Plant Code",
                        desc: "Plant Name",
                      });
                    }}
                  ></i>
                  <Controller
                    as={({ onChange, value }) => (
                      <Select
                        classNamePrefix="react-select"
                        value={plantValueTo}
                        onChange={(event) => handleChange(event, "IM_WERKS_TO")}
                        options={plantOptions}
                        placeholder=""
                        isDisabled={watchAllFields.IM_WERKS_FROM === ""}
                      />
                    )}
                    defaultValue=""
                    control={control}
                    name="IM_WERKS_TO"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-5">
              <div className="row">
                <div className="col-3">
                  <label>Sales Org. From</label>
                  <span>*</span>
                </div>
                <div className="col-8">
                  <i
                    className="far fa-clone click-icons"
                    onClick={() => {
                      setModalVisible(true);
                      setModalData(companyCodeOptions);
                      setName("IM_VKORG_FROM");
                      setHeader({
                        title: "Sales Org. From",
                        name: "Company Code",
                        desc: "Company Name",
                      });
                    }}
                  ></i>
                  <Controller
                    as={({ onChange, value }) => (
                      <Select
                        classNamePrefix="react-select"
                        value={companyCodeFrom}
                        onChange={(event) =>
                          handleChange(event, "IM_VKORG_FROM")
                        }
                        options={companyCodeOptions}
                        placeholder=""
                      />
                    )}
                    rules={{
                      required: "Sales Organization From is required",
                      validate: (value) =>
                        minMaxValidate(
                          value,
                          "IM_VKORG_TO",
                          "Sales Organization from should less than Sales Organization to"
                        ),
                    }}
                    defaultValue=""
                    control={control}
                    name="IM_VKORG_FROM"
                  />
                </div>
              </div>
            </div>
            <div className="col-5">
              <div className="row">
                <div className="col-3">
                  <label>Sales Org. To</label>
                </div>
                <div className="col-8">
                  <i
                    className="far fa-clone click-icons"
                    onClick={() => {
                      setModalVisible(true);
                      setModalData(companyCodeOptions);
                      setName("IM_VKORG_TO");
                      setHeader({
                        title: "Sales Org. From",
                        name: "Company Code",
                        desc: "Company Name",
                      });
                    }}
                  ></i>
                  <Controller
                    as={({ onChange, value }) => (
                      <Select
                        classNamePrefix="react-select"
                        value={companyCodeTo}
                        onChange={(event) => handleChange(event, "IM_VKORG_TO")}
                        options={companyCodeOptions}
                        placeholder=""
                        isDisabled={watchAllFields.IM_VKORG_FROM === ""}
                      />
                    )}
                    defaultValue=""
                    control={control}
                    name="IM_VKORG_TO"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-5">
              <div className="row">
                <div className="col-3">
                  <label>
                    Distr. Chan. From<span>*</span>
                  </label>
                </div>
                <div className="col-8">
                  <i
                    className="far fa-clone click-icons"
                    onClick={() => {
                      setModalVisible(true);
                      setModalData(distributionOption);
                      setName("IM_VTWEG_FROM");
                      setHeader({
                        title: "Distribution Channel From",
                        name: "Channel Code",
                        desc: "Channel Name",
                      });
                    }}
                  ></i>
                  <Controller
                    as={({ onChange, value }) => (
                      <Select
                        classNamePrefix="react-select"
                        value={distributionFrom}
                        onChange={(event) =>
                          handleChange(event, "IM_VTWEG_FROM")
                        }
                        options={distributionOption}
                        placeholder=""
                      />
                    )}
                    defaultValue=""
                    control={control}
                    name="IM_VTWEG_FROM"
                    rules={{
                      validate: (value) =>
                        minMaxValidate(
                          value,
                          "IM_VTWEG_TO",
                          "Distribution channel from should less than Distribution channel to"
                        ),
                      required: {
                        required: "Division is required",
                      },
                    }}
                  />
                </div>
              </div>
            </div>
            <div className="col-5">
              <div className="row">
                <div className="col-3">
                  <label>Distr. Chan. To</label>
                </div>
                <div className="col-8">
                  <i
                    className="far fa-clone click-icons"
                    onClick={() => {
                      setModalVisible(watchAllFields.IM_VTWEG_FROM !== "");
                      setModalData(distributionOption);
                      setName("IM_VTWEG_TO");
                      setHeader({
                        title: "Distribution Channel To",
                        name: "Channel Code",
                        desc: "Channel Name",
                      });
                    }}
                  ></i>
                  <Controller
                    as={({ onChange, value }) => (
                      <Select
                        classNamePrefix="react-select"
                        value={distributionTo}
                        onChange={(event) => handleChange(event, "IM_VTWEG_TO")}
                        options={distributionOption}
                        placeholder=""
                        isDisabled={true}
                      />
                    )}
                    defaultValue=""
                    control={control}
                    name="IM_VTWEG_TO"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-5">
              <div className="row">
                <div className="col-3">
                  <label>
                    Division From<span>*</span>
                  </label>
                </div>
                <div className="col-8">
                  <i
                    className="far fa-clone click-icons"
                    onClick={() => {
                      setModalVisible(true);
                      setModalData(divisionOptions);
                      setName("IM_SPART_FROM");
                      setHeader({
                        title: "Division From",
                        name: "Division Code",
                        desc: "Division Name",
                      });
                    }}
                  ></i>
                  <Controller
                    as={({ onChange, value }) => (
                      <Select
                        classNamePrefix="react-select"
                        value={divisionFrom}
                        onChange={(event) =>
                          handleChange(event, "IM_SPART_FROM")
                        }
                        options={divisionOptions}
                        placeholder=""
                      />
                    )}
                    defaultValue=""
                    control={control}
                    name="IM_SPART_FROM"
                    rules={{
                      validate: (value) =>
                        minMaxValidate(
                          value,
                          "IM_SPART_TO",
                          "Division from should less than Division to"
                        ),
                    }}
                  />
                </div>
              </div>
            </div>
            <div className="col-5">
              <div className="row">
                <div className="col-3">
                  <label>Division To</label>
                </div>
                <div className="col-8">
                  <i
                    className="far fa-clone click-icons"
                    onClick={() => {
                      setModalVisible(true);
                      setModalData(divisionOptions);
                      setName("IM_SPART_TO");
                      setHeader({
                        title: "Division To",
                        name: "Division Code",
                        desc: "Division Name",
                      });
                    }}
                  ></i>
                  <Controller
                    as={({ onChange, value }) => (
                      <Select
                        classNamePrefix="react-select"
                        value={divisionTo}
                        onChange={(event) => handleChange(event, "IM_SPART_TO")}
                        options={divisionOptions}
                        placeholder=""
                        isDisabled={true}
                      />
                    )}
                    defaultValue=""
                    control={control}
                    name="IM_SPART_TO"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-5">
              <div className="row">
                <div className="col-3">
                  <label>Sales Ofc. From</label>
                  <span>*</span>
                </div>
                <div className="col-8">
                  <i
                    className="far fa-clone click-icons"
                    onClick={() => {
                      setModalVisible(true);
                      setModalData(salesOfficeOptions);
                      setName("IM_VKBUR_FROM");
                      setHeader({
                        title: "Sales Office From",
                        name: "Sales Office Code",
                        desc: "Sales Office Name",
                      });
                    }}
                  ></i>
                  <Controller
                    as={({ onChange, value }) => (
                      <Select
                        classNamePrefix="react-select"
                        value={salesOfficeFrom}
                        onChange={(event) =>
                          handleChange(event, "IM_VKBUR_FROM")
                        }
                        options={salesOfficeOptions}
                        placeholder=""
                      />
                    )}
                    rules={{
                      required: "Sales Office From is required",
                      validate: (value) =>
                        minMaxValidate(
                          value,
                          "IM_VKBUR_TO",
                          "Sales District from should less than Sales District to"
                        ),
                    }}
                    defaultValue=""
                    control={control}
                    name="IM_VKBUR_FROM"
                  />
                </div>
              </div>
            </div>
            <div className="col-5">
              <div className="row">
                <div className="col-3">
                  <label>Sales Office To</label>
                </div>
                <div className="col-8">
                  <i
                    className="far fa-clone click-icons"
                    onClick={() => {
                      setModalVisible(true);
                      setModalData(salesOfficeOptions);
                      setName("IM_VKBUR_TO");
                      setHeader({
                        title: "Sales Office To",
                        name: "Sales Office Code",
                        desc: "Sales Office Name",
                      });
                    }}
                  ></i>
                  <Controller
                    as={({ onChange, value }) => (
                      <Select
                        classNamePrefix="react-select"
                        value={salesOfficeTo}
                        onChange={(event) => handleChange(event, "IM_VKBUR_TO")}
                        options={salesOfficeOptions}
                        placeholder=""
                        isDisabled={watchAllFields.IM_VKBUR_FROM === ""}
                      />
                    )}
                    defaultValue=""
                    control={control}
                    name="IM_VKBUR_TO"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-5">
              <div className="row">
                <div className="col-3">
                  <label>Sales Dist. From</label>
                  <span>*</span>
                </div>
                <div className="col-8">
                  <i
                    className="far fa-clone click-icons"
                    onClick={() => {
                      setModalVisible(true);
                      setModalData(salesDistrictOptions);
                      setName("IM_BZIRK_FROM");
                      setHeader({
                        title: "Sales District From",
                        name: "Sales District Code",
                        desc: "Sales District Name",
                      });
                    }}
                  ></i>
                  <Controller
                    as={({ onChange, value }) => (
                      <Select
                        classNamePrefix="react-select"
                        value={salesDistrictFrom}
                        onChange={(event) =>
                          handleChange(event, "IM_BZIRK_FROM")
                        }
                        options={salesDistrictOptions}
                        placeholder=""
                      />
                    )}
                    defaultValue=""
                    rules={{
                      required: "Sales District From is required",
                      validate: (value) =>
                        minMaxValidate(
                          value,
                          "IM_BZIRK_TO",
                          "Sales District from should less than sales district to"
                        ),
                    }}
                    control={control}
                    name="IM_BZIRK_FROM"
                  />
                </div>
              </div>
            </div>
            <div className="col-5">
              <div className="row">
                <div className="col-3">
                  <label>Sales Dist. To</label>
                </div>
                <div className="col-8">
                  <i
                    className="far fa-clone click-icons"
                    onClick={() => {
                      setModalVisible(watchAllFields.IM_BZIRK_FROM !== "");
                      setModalData(salesDistrictOptions);
                      setName("IM_BZIRK_TO");
                      setHeader({
                        title: "Sales District To",
                        name: "Sales District Code",
                        desc: "Sales District Name",
                      });
                    }}
                  ></i>
                  <Controller
                    as={({ onChange, value }) => (
                      <Select
                        classNamePrefix="react-select"
                        value={salesDistrictTo}
                        onChange={(event) => handleChange(event, "IM_BZIRK_TO")}
                        options={salesDistrictOptions}
                        placeholder=""
                        isDisabled={watchAllFields.IM_BZIRK_FROM === ""}
                      />
                    )}
                    defaultValue=""
                    control={control}
                    name="IM_BZIRK_TO"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-5">
              <div className="row">
                <div className="col-3">
                  <label>Region From</label>
                </div>
                <div className="col-8">
                  <i
                    className="far fa-clone click-icons"
                    onClick={() => {
                      setModalVisible(true);
                      setModalData(regionOptions);
                      setName("IM_REGIO_FROM");
                      setHeader({
                        title: "Region From",
                        name: "Region Code",
                        desc: "Region Name",
                      });
                    }}
                  ></i>
                  <Controller
                    as={({ onChange, value }) => (
                      <Select
                        classNamePrefix="react-select"
                        value={regionFrom}
                        onChange={(event) =>
                          handleChange(event, "IM_REGIO_FROM")
                        }
                        options={regionOptions}
                        placeholder=""
                      />
                    )}
                    defaultValue=""
                    control={control}
                    name="IM_REGIO_FROM"
                    rules={{
                      validate: (value) =>
                        minMaxValidate(
                          value,
                          "IM_REGIO_TO",
                          "Region from should less than Region to"
                        ),
                    }}
                  />
                </div>
              </div>
            </div>
            <div className="col-5">
              <div className="row">
                <div className="col-3">
                  <label>Region To</label>
                </div>
                <div className="col-8">
                  <i
                    className="far fa-clone click-icons"
                    onClick={() => {
                      setModalVisible(watchAllFields.IM_REGIO_FROM !== "");
                      setModalData(regionOptions);
                      setName("IM_REGIO_TO");
                      setHeader({
                        title: "Region To",
                        name: "Region Code",
                        desc: "Region Name",
                      });
                    }}
                  ></i>
                  <Controller
                    as={({ onChange, value }) => (
                      <Select
                        classNamePrefix="react-select"
                        value={regionTo}
                        onChange={(event) => handleChange(event, "IM_REGIO_TO")}
                        options={regionOptions}
                        placeholder=""
                        isDisabled={watchAllFields.IM_REGIO_FROM === ""}
                      />
                    )}
                    defaultValue=""
                    control={control}
                    name="IM_REGIO_TO"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-5">
              <div className="row">
                <div className="col-3">
                  <label>Sales Doc. From</label>
                </div>
                <div className="col-8">
                  <input
                    type="number"
                    style={{ marginLeft: "0px" }}
                    ref={register({
                      validate: (value) =>
                        minMaxValidate(
                          value,
                          "IM_AUBEL_TO",
                          "Sales doc. from should less than sales doc. to"
                        ),
                    })}
                    name="IM_AUBEL_FROM"
                  />

                  {/* <i
                    className="far fa-clone click-icons"
                    onClick={() => {
                      setModalVisible(true);
                      setModalData(salesDocumentOptions);
                      setName("IM_AUBEL_FROM");
                      setHeader({
                        title: "Sales Document From",
                        name: "Sales Document Code",
                        desc: "Sales Document Name",
                      });
                    }}
                  ></i>
                  <Controller
                    as={({ onChange, value }) => (
                      <Select
                        classNamePrefix="react-select"
                        value={salesDocumentFrom}
                        onChange={(event) =>
                          handleChange(event, "IM_AUBEL_FROM")
                        }
                        options={salesDocumentOptions}
                        placeholder=""
                      />
                    )}
                    defaultValue=""
                    control={control}
                    name="IM_AUBEL_FROM"
                    rules={{
                      validate: (value) =>
                        minMaxValidate(
                          value,
                          "IM_AUBEL_TO",
                          "Sales Document from should less than sales document to"
                        ),
                    }}
                  /> */}
                </div>
              </div>
            </div>
            <div className="col-5">
              <div className="row">
                <div className="col-3">
                  <label>Sales Doc. To</label>
                </div>
                <div className="col-8">
                  <input
                    type="number"
                    style={{ marginLeft: "0px" }}
                    ref={register({
                      validate: (value) =>
                        minMaxValidate(
                          value,
                          "IM_AUBEL_FROM",
                          "Sales doc. from should less than sales doc. to"
                        ),
                    })}
                    name="IM_AUBEL_TO"
                    disabled={watchAllFields.IM_AUBEL_FROM === ""}
                  />
                  {/* <i
                    className="far fa-clone click-icons"
                    onClick={() => {
                      setModalVisible(watchAllFields.IM_AUBEL_FROM !== "");
                      setModalData(salesDocumentOptions);
                      setName("IM_AUBEL_TO");
                      setHeader({
                        title: "Sales Document To",
                        name: "Sales Document Code",
                        desc: "Sales Document Name",
                      });
                    }}
                  ></i>
                  <Controller
                    as={({ onChange, value }) => (
                      <Select
                        classNamePrefix="react-select"
                        value={salesDocumentTo}
                        onChange={(event) => handleChange(event, "IM_AUBEL_TO")}
                        options={salesDocumentOptions}
                        placeholder=""
                        isDisabled={watchAllFields.IM_AUBEL_FROM === ""}
                      />
                    )}
                    defaultValue=""
                    control={control}
                    name="IM_AUBEL_TO"
                  /> */}
                </div>
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-5">
              <div className="row">
                <div className="col-3">
                  <label>Delivery From</label>
                </div>
                <div className="col-8">
                  <input
                    type="number"
                    style={{ marginLeft: "0px" }}
                    ref={register({
                      validate: (value) =>
                        minMaxValidate(
                          value,
                          "IM_VGBEL_TO",
                          "Delivery from should less than Delivery to"
                        ),
                    })}
                    name="IM_VGBEL_FROM"
                  />
                </div>
              </div>
            </div>
            <div className="col-5">
              <div className="row">
                <div className="col-3">
                  <label>Delivery To</label>
                </div>
                <div className="col-8">
                  <input
                    type="number"
                    style={{ marginLeft: "0px" }}
                    ref={register}
                    name="IM_VGBEL_TO"
                    disabled={watchAllFields.IM_VGBEL_FROM === ""}
                  />
                </div>
              </div>
            </div>
            <div className="col-2">
              <div className="row">
                <div className="col-4">
                  <input
                    type="radio"
                    ref={register}
                    name="IM_INV"
                    value="I"
                    defaultChecked
                  />
                </div>
                <div className="col-8">
                  <label>Invoice</label>
                </div>
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-5">
              <div className="row">
                <div className="col-3">
                  <label>Invoice From</label>
                </div>
                <div className="col-8">
                  <input
                    type="number"
                    style={{ marginLeft: "0px" }}
                    ref={register({
                      validate: (value) =>
                        minMaxValidate(
                          value,
                          "IM_VBELN_TO",
                          "Invoice from should less than invoice to"
                        ),
                    })}
                    name="IM_VBELN_FROM"
                  />
                </div>
              </div>
            </div>
            <div className="col-5">
              <div className="row">
                <div className="col-3">
                  <label>Invoice To</label>
                </div>
                <div className="col-8">
                  <input
                    type="number"
                    style={{ marginLeft: "0px" }}
                    ref={register}
                    disabled={watchAllFields.IM_VBELN_FROM === ""}
                    name="IM_VBELN_TO"
                  />
                </div>
              </div>
            </div>
            <div className="col-2">
              <div className="row">
                <div className="col-4">
                  <input type="radio" ref={register} name="IM_INV" value="C" />
                </div>
                <div className="col-8">
                  <label>Cancel Invoice</label>
                </div>
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-5">
              <div className="row">
                <div className="col-3">
                  <label>Material From</label>
                </div>
                <div className="col-8">
                  <i
                    className="far fa-clone click-icons"
                    onClick={() => {
                      setModalVisible(true);
                      setModalData(materialOptions);
                      setName("IM_MATNR_FROM");
                      setHeader({
                        title: "Material From",
                        name: "Material Code",
                        desc: "Material Name",
                      });
                    }}
                  ></i>
                  <Controller
                    as={({ onChange, value }) => (
                      <Select
                        classNamePrefix="react-select"
                        value={materialFrom}
                        onChange={(event) =>
                          handleChange(event, "IM_MATNR_FROM")
                        }
                        options={materialOptions}
                        placeholder=""
                      />
                    )}
                    defaultValue=""
                    control={control}
                    name="IM_MATNR_FROM"
                    rules={{
                      validate: (value) =>
                        minMaxValidate(
                          value,
                          "IM_MATNR_TO",
                          "Material from should less than Material to"
                        ),
                    }}
                  />
                </div>
              </div>
            </div>
            <div className="col-5">
              <div className="row">
                <div className="col-3">
                  <label>Material To</label>
                </div>
                <div className="col-8">
                  <i
                    className="far fa-clone click-icons"
                    onClick={() => {
                      setModalVisible(true);
                      setModalData(materialOptionsTo);
                      setName("IM_MATNR_TO");
                      setHeader({
                        title: "Material From",
                        name: "Material Code",
                        desc: "Material Name",
                      });
                    }}
                  ></i>
                  <Controller
                    as={({ onChange, value }) => (
                      <Select
                        classNamePrefix="react-select"
                        value={materialTo}
                        onChange={(event) => handleChange(event, "IM_MATNR_TO")}
                        options={materialOptionsTo}
                        placeholder=""
                        isDisabled={watchAllFields.IM_MATNR_FROM === ""}
                      />
                    )}
                    //
                    defaultValue=""
                    control={control}
                    name="IM_MATNR_TO"
                  />
                </div>
              </div>
            </div>
            <div className="col-2">
              <div className="row">
                <div className="col">
                  <button type="submit" className="search-button float-right">
                    <i className="fas fa-search icons-button"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-5">
              <div className="row">
                <div className="col-3">
                  <label>
                    Sales Group From<span>*</span>
                  </label>
                </div>
                <div className="col-8">
                  <i
                    className="far fa-clone click-icons"
                    onClick={() => {
                      setModalVisible(true);
                      setModalData(allSalesGroup);
                      setName("IM_VKGRP_FROM");
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
                          handleChange(event, "IM_VKGRP_FROM")
                        }
                        options={allSalesGroup}
                        placeholder=""
                      />
                    )}
                    defaultValue=""
                    control={control}
                    name="IM_VKGRP_FROM"
                    rules={{
                      required: "Sales Group From is required",
                      validate: (value) =>
                        minMaxValidate(
                          value,
                          "IM_VKGRP_TO",
                          "Sales Group from should less than Sales Group to"
                        ),
                    }}
                  />
                </div>
              </div>
            </div>
            <div className="col-5">
              <div className="row">
                <div className="col-3">
                  <label>Sales Group To</label>
                </div>
                <div className="col-8">
                  <i
                    className="far fa-clone click-icons"
                    onClick={() => {
                      setModalVisible(true);
                      setModalData(allSalesGroup);
                      setName("IM_VKGRP_TO");
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
                        onChange={(event) => handleChange(event, "IM_VKGRP_TO")}
                        options={allSalesGroup}
                        placeholder=""
                        isDisabled={watchAllFields.IM_VKGRP_FROM === ""}
                      />
                    )}
                    defaultValue=""
                    control={control}
                    name="IM_VKGRP_TO"
                    rules={{}}
                  />
                </div>
              </div>
            </div>
          </div>
        </form>

        <div className="background">
          <div className="table-filter">
            <div className="filter-div">
              <div className="row">
                <div className="col">
                  {salesReport ? (
                    <ExcelFile
                      filename={`Sales Register: Date:-${getValues(
                        "IM_DATE_FROM"
                      )}-${getValues("IM_DATE_TO")}--${getValues(
                        "IM_WERKS_FROM"
                      )}-${getValues("IM_VKORG_FROM")}-Time-${moment().format(
                        "DD-MM-YYYY HH:mm"
                      )}`}
                      element={
                        <button
                          className="goods-button float-right"
                          style={{ backgroundColor: "#0F6FA2" }}
                        >
                          Export to Excel
                        </button>
                      }
                    >
                      <ExcelSheet data={salesReport} name="FI Register Report">
                        {headers?.map((value, i) => (
                          <ExcelColumn
                            key={i}
                            label={value.label}
                            value={value.value}
                          />
                        ))}
                      </ExcelSheet>
                    </ExcelFile>
                  ) : null}
                </div>
              </div>
            </div>
            <SalesRegisterTable data={salesTable} />
          </div>
        </div>
      </div>

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
});

export default connect(mapStateToProps, { loading })(SalesRegister);
