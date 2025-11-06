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
import ReactExport from "react-export-excel";
import isNumber from "is-number";
import Select from "react-select";
import { getLocalData, setLocalData } from "../../services/localStorage";
import { emptyResult } from "../../services/EmptyResult";
import filterDataReport from "../../Functions/filterDataReport";
import ModalSalesRegister from "./Modal";
import useComp from "../../hook/useComp";
import usePlant from "../../hook/usePlant";

const ExcelFile = ReactExport.ExcelFile;
const ExcelSheet = ReactExport.ExcelFile.ExcelSheet;
const ExcelColumn = ReactExport.ExcelFile.ExcelColumn;

let today = moment();
let twodaysback = moment().subtract(7, "day");

function LeRegister(props) {
  const [leRegisterData, setLeRegisterData] = useState([]);
  const [paginatedleRegisterData, setPaginatedLeRegisterData] = useState([]);
  const [perPage, setPerpage] = useState(10);

  const [allCompanyCode, setAllCompanyCode] = useState([]);
  const [allRegion, setAllRegion] = useState([]);
  const [allDistributionChannel, setAllDistributionChannel] = useState([]);
  const [allDivision, setAllDivision] = useState([]);
  const [allOrderReceivingPlant, setAllOrderReceivingPlant] = useState([]);

  const [pageLeRegister, setPageLeRegister] = useState({
    DISPATCH_QTY_RAIL: 0,
    DISPATCH_QTY_ROAD: 0,
    DISPATCHED_QTY_TOTAL: 0,
    DISTANCE: 0,
    SHPFR_RAIL_TOT: 0,
    FR_RAIL: 0,
    SHPFR_ROAD_TOT: 0,
    FR_ROAD: 0,
    APPROX_VAL: 0,
    ROAD_FR: 0,
  });

  const [companyCode, setCompanyCode] = useState({});
  const [region, setRegion] = useState({});
  const [distri, setDistri] = useState({});
  const [division, setDivision] = useState({});
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

    control,
    getValues,
  } = useForm({
    mode: "onSubmit",
    reValidateMode: "onChange",
    defaultValues: {
      created_on_from: twodaysback.format("YYYY-MM-DD"),
      created_on_to: today.format("YYYY-MM-DD"),
    },
  });
  const watchAllFields = watch();

  //++++++++++++++++++++++++++++++++++++++++++++++searchSysytem+++++++++++++++++++++++++++++++++++++++++++++++++++

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
          console.log(result.data.data);
          setAllRegion(
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
          console.log(result.data.data);
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
        console.log(err);
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
          console.log(result.data.data);
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
      })
      .finally(() => {
        props.loading(false);
      });
  };

  // let fetchReceivingPlant = () => {
  //   props.loading(true);
  //   http
  //     .post(apis.FETCH_RECEIVING_PLANT_FOR_GR, {})
  //     .then((result) => {
  //       if (result.data.status) {
  //         setAllOrderReceivingPlant(
  //           filterDataReport(result.data.data, "PLANT", "PLANT_NAME")
  //         );
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
    // if (getLocalData("gr-plants")?.length > 0) {
    //   setAllOrderReceivingPlant(
    //     filterDataReport(getLocalData("gr-plants"), "PLANT", "PLANT_NAME")
    //   );
    // } else {
    //   fetchReceivingPlant();
    // }
  }, []);

  const plants = usePlant();

  useEffect(() => {
    if (plants.length > 0) {
      setAllOrderReceivingPlant(
        plants.map((plant) => ({
          value: plant.WERKS,
          label: plant.WERKS + " - " + plant.NAME1,
        }))
      );
    }
  }, [plants]);

  //+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

  //+++++++++++++++++++++++++++++++++++++fetch GR list++++++++++++++++++++++++
  let onSubmit = (data) => {
    data.created_on_from = moment(data.created_on_from).format("YYYYMMDD");
    data.created_on_to = moment(data.created_on_to).format("YYYYMMDD");
    fetchReport(data);
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

  let fetchReport = (data) => {
    props.loading(true);
    // let body = {
    //   company_code: selectedCompanyCode ? selectedCompanyCode.COMP_CODE : null,
    //   lv_user: localStorage.getItem("user_code"),
    // };
    let body = data;
    body["lv_user"] = localStorage.getItem("user_code");
    // body["region"] = selectedRegion ? selectedRegion.REGION : null;
    // body["created_on_from"] = moment(watchAllFields.created_on_from).format(
    //   "YYYYMMDD"
    // );
    // body["created_on_to"] = moment(watchAllFields.created_on_to).format(
    //   "YYYYMMDD"
    // );
    // body["distribution_channel"] = selectedDistributionChannel
    //   ? selectedDistributionChannel.DIST_CHANNEL
    //   : null;
    // body["division"] = selectedDivision ? selectedDivision.DIVISION : null;
    // body["plant"] = selectedPlant ? selectedPlant.PLANT : null;
    http
      .post(apis.LE_REGISTER_FETCH_LIST, body)
      .then((result) => {
        if (result.data.status) {
          emptyResult(result.data.data, setLeRegisterData);
          // if (result.data.data?.length > 0) {
          //   setFidaywisereportData(result.data.data);
          // } else {
          //   Swal.fire("Error!", "No Data Found!", "error");
          // }
          setLeRegisterData(result.data.data);
          let data = result.data.data;

          if (data?.length > 0) {
            let x = data.slice(0, perPage);

            let DISPATCH_QTY_RAIL = 0;
            let DISPATCH_QTY_ROAD = 0;
            let DISPATCHED_QTY_TOTAL = 0;
            let DISTANCE = 0;
            let SHPFR_RAIL_TOT = 0;
            let FR_RAIL = 0;
            let SHPFR_ROAD_TOT = 0;
            let FR_ROAD = 0;
            let APPROX_VAL = 0;
            let ROAD_FR = 0;

            x.forEach((resp) => {
              DISPATCH_QTY_RAIL += +resp.DISP_RAIL;
              DISPATCH_QTY_ROAD += +resp.DISP_ROAD;
              DISPATCHED_QTY_TOTAL += +resp.DISP_QTY;
              DISTANCE += +resp.DISTANCE;
              SHPFR_RAIL_TOT += +resp.SHPFR_RAIL_TOT;
              FR_RAIL += +resp.FR_RAIL;
              SHPFR_ROAD_TOT += +resp.SHPFR_ROAD_TOT;
              FR_ROAD += +resp.FR_ROAD;
              APPROX_VAL += +resp.APPROX_VAL;
              ROAD_FR += +resp.ROAD_FR;
            });

            setPageLeRegister({
              DISPATCHED_QTY_TOTAL: DISPATCHED_QTY_TOTAL,
              DISPATCH_QTY_RAIL: DISPATCH_QTY_RAIL,
              DISPATCH_QTY_ROAD: DISPATCH_QTY_ROAD,
              DISTANCE: DISTANCE,
              SHPFR_RAIL_TOT: SHPFR_RAIL_TOT,
              FR_RAIL: FR_RAIL,
              SHPFR_ROAD_TOT: SHPFR_ROAD_TOT,
              FR_ROAD: FR_ROAD,
              APPROX_VAL: APPROX_VAL,
              ROAD_FR: ROAD_FR,
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
      })
      .finally(() => {
        props.loading(false);
      });
  };
  //++++++++++++++++++++++++++++++++++++++++++ Headers ++++++++++++++++++++++++++++++++++++++++++

  let headers = [
    { label: "Supplying Plant", key: "SUPPL_PLANT" },
    { label: "Supplying Plant Name", key: "SUPPL_PLANT_NAME" },
    { label: "Delivery No", key: "DEL_NO" },
    { label: "Dispatch  Category", key: "DISPATCH_CAT" },
    { label: "Dispatch Qty.(Rail)", key: "DISP_RAIL" },
    { label: "Dispatch Qty.(Road)", key: "DISP_ROAD" },
    { label: "Dispatch Qty.(Total)", key: "DISP_QTY" },
    { label: "Distance(in KM)", key: "DISTANCE" },
    { label: "Distribution Channel", key: "DISTRIB" },
    { label: "Forwarding Agent Code", key: "FWD_AG" },
    { label: "Forwarding Agent Code", key: "FWD_AG_NAME" },
    { label: "Freight Rail(XF/XXD/FF)", key: "SHPFR_RAIL_TOT" },
    { label: "Freight Rail(XX/FX)", key: "FR_RAIL" },
    { label: "Freight Road(XF/XXD/FF)", key: "SHPFR_ROAD_TOT" },
    { label: "Freight Road(XX/FX)", key: "FR_ROAD" },
    { label: "Incoterm", key: "INCOTERM" },
    { label: "Material Code", key: "MATNR" },
    { label: "Material Description", key: "ARKTX" },
    { label: "PGI Date", key: "PGI_DT" },
    { label: "PGI Time", key: "PGI_TIME" },
    { label: "Region", key: "REGION" },
    { label: "Region(SH)", key: "BEZEI" },
    { label: "Road Freight(Frt. Master Data)", key: "ROAD_FR" },
    { label: "Route Code", key: "ROUTE" },
    { label: "Route Description", key: "ROUTE_DESC" },
    { label: "Sales District(SH)", key: "SALES_DIST" },
    { label: "Sales Group", key: "SALE_GRP" },
    { label: "Sales Group Desc.", key: "SALE_GRP_DS" },
    { label: "Ship to Party", key: "SHIP_PARTY" },
    { label: "Ship to Party Name", key: "SHIP_NAME" },
    { label: "Ship to Party T-Zone", key: "DESTINATION" },
    { label: "Shipping Point", key: "VSTEL" },
    { label: "Shipping Type Desc.", key: "SHIP_TYPE" },
    { label: "Sold To Party", key: "SOLD_PARTY" },
    { label: "Sold To Party Name", key: "PARTY_NAME" },
    { label: "Truck No", key: "TRUCK_NO" },
    { label: "Approx. Value", key: "APPROX_VAL" },
    { label: "LR Number", key: "LR_NO" },
    { label: "Shipment Number", key: "TKNUM" },
  ];

  //++++++++++++++++++++++++++page changer+++++++++++++++++++++++++++++++++++++++++++++++
  let pageChange = ({ selected }) => {
    console.log(selected);
    setPaginatedLeRegisterData(
      leRegisterData.slice(selected * perPage, perPage * (selected + 1))
    );

    let x = leRegisterData.slice(selected * perPage, perPage * (selected + 1));

    let DISPATCH_QTY_RAIL = 0;
    let DISPATCH_QTY_ROAD = 0;
    let DISPATCHED_QTY_TOTAL = 0;
    let DISTANCE = 0;
    let SHPFR_RAIL_TOT = 0;
    let FR_RAIL = 0;
    let SHPFR_ROAD_TOT = 0;
    let FR_ROAD = 0;
    let APPROX_VAL = 0;
    let ROAD_FR = 0;

    x.forEach((resp) => {
      DISPATCH_QTY_RAIL += +resp.DISP_RAIL;
      DISPATCH_QTY_ROAD += +resp.DISP_ROAD;
      DISPATCHED_QTY_TOTAL += +resp.DISP_QTY;
      DISTANCE += +resp.DISTANCE;
      SHPFR_RAIL_TOT += +resp.SHPFR_RAIL_TOT;
      FR_RAIL += +resp.FR_RAIL;
      SHPFR_ROAD_TOT += +resp.SHPFR_ROAD_TOT;
      FR_ROAD += +resp.FR_ROAD;
      APPROX_VAL += +resp.APPROX_VAL;
      ROAD_FR += +resp.ROAD_FR;
    });

    setPageLeRegister({
      DISPATCHED_QTY_TOTAL: DISPATCHED_QTY_TOTAL,
      DISPATCH_QTY_RAIL: DISPATCH_QTY_RAIL,
      DISPATCH_QTY_ROAD: DISPATCH_QTY_ROAD,
      DISTANCE: DISTANCE,
      SHPFR_RAIL_TOT: SHPFR_RAIL_TOT,
      FR_RAIL: FR_RAIL,
      SHPFR_ROAD_TOT: SHPFR_ROAD_TOT,
      FR_ROAD: FR_ROAD,
      APPROX_VAL: APPROX_VAL,
      ROAD_FR: ROAD_FR,
    });
  };

  useEffect(() => {
    pageChange({ selected: 0 });
  }, [perPage, leRegisterData]);
  //+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

  //++++++++++++++++++++++++++++++++++++++++custom validation trigger++++++++++++++
  useEffect(() => {
    triggerValidation("created_on_to");
  }, [watchAllFields.created_on_from]);

  useEffect(() => {
    triggerValidation("created_on_from");
  }, [watchAllFields.created_on_to]);

  let setWithValidationTrigger = (key, value) => {
    setValue(key, value);
    triggerValidation(key);
  };
  //+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

  // ++++++++++++++++++++++++++++++++++++++++++++Data Managing of Le register Data++++++++++++++++++++++++++

  useEffect(() => {
    let data = leRegisterData;
    for (let i = 0; i < data.length; i++) {
      data[i].PGI_DT = moment(data[i].PGI_DT, "YYYYMMDD").format("DD-MM-YYYY");
      data[i].PGI_TIME = moment(data[i].PGI_TIME, "HHmmss").format("HH:mm:ss");
    }
  }, [leRegisterData]);

  // +++++++++++++++++Data Fixing+++++++++++++++++++++++++++++++++++++++++//
  useEffect(() => {
    let data = leRegisterData;
    console.log(data);
    let objectKeys = [];
    if (leRegisterData.length !== 0) {
      objectKeys = Object.keys(data[0]);
    }

    for (let i = 0; i < data.length; i++) {
      for (let j = 0; j < objectKeys.length; j++) {
        if (isNumber(data[i][objectKeys[j]])) {
          data[i][objectKeys[j]] = Number(data[i][objectKeys[j]]);
        }
      }
    }
  }, [leRegisterData]);

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
      case "distribution_channel":
        setDistri(value);
        setValue(key, value?.value);
        break;
      case "division":
        setDivision(value);
        setValue(key, value?.value);
        break;
      case "plant":
        setPlant(value);
        setValue(key, value?.value);
        break;
      default:
        break;
    }
  };

  return (
    <div>
      <form className="filter-section" onSubmit={handleSubmit(onSubmit)}>
        <div className="row">
          <div className="col">
            <div className="row">
              <div className="col-3">
                <label>
                  Company code<span>*</span>
                </label>
              </div>
              <div className="col-9">
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

          <div className="col">
            <div className="row">
              <div className="col-3">
                <label className="float-right">
                  Created Date From<span>*</span>
                </label>
              </div>
              <div className="col-3">
                <input
                  type="date"
                  placeholder="From"
                  name="created_on_from"
                  ref={register({
                    validate: (value) => {
                      let ans = false;
                      if (watchAllFields.created_on_to) {
                        if (
                          (moment(watchAllFields.created_on_from).isBefore(
                            moment(watchAllFields.created_on_to)
                          ) ||
                            moment(watchAllFields.created_on_from).isSame(
                              moment(watchAllFields.created_on_to)
                            )) &&
                          moment(watchAllFields.created_on_to).diff(
                            moment(watchAllFields.created_on_from),
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
                {errors.created_on_from && (
                  <p className="form-error">Date should be within 31 days</p>
                )}
              </div>
              <div className="col-3">
                <label className="float-right">
                  Created Date To<span>*</span>
                </label>
              </div>
              <div className="col-3">
                <input
                  type="date"
                  name="created_on_to"
                  ref={register({
                    validate: (value) => {
                      let ans = false;
                      if (watchAllFields.created_on_from) {
                        if (
                          (moment(watchAllFields.created_on_from).isBefore(
                            moment(watchAllFields.created_on_to)
                          ) ||
                            moment(watchAllFields.created_on_from).isSame(
                              moment(watchAllFields.created_on_to)
                            )) &&
                          moment(watchAllFields.created_on_to).diff(
                            moment(watchAllFields.created_on_from),
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
                {errors.gr_date_to && (
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
                <label>Region</label>
              </div>
              <div className="col-9">
                <i
                  className="far fa-clone click-icons"
                  onClick={() => {
                    setModalVisible(true);
                    setModalData(allRegion);
                    setName("region");
                    setHeader({
                      title: "Region",
                      name: "Region",
                      desc: "Description",
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
                />
              </div>
            </div>
          </div>

          <div className="col">
            <div className="row">
              <div className="col-3">
                <label>
                  Distribution Channel<span>*</span>
                </label>
              </div>
              <div className="col-9">
                <i
                  className="far fa-clone click-icons"
                  onClick={() => {
                    setModalVisible(true);
                    setModalData(allDistributionChannel);
                    setName("distribution_channel");
                    setHeader({
                      title: "Distribution channel",
                      name: "Dist Channel",
                      desc: "Dist Description",
                    });
                  }}
                ></i>
                <Controller
                  as={({ onChange, value }) => (
                    <Select
                      classNamePrefix="react-select"
                      value={distri}
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
        </div>
        <div className="row">
          <div className="col">
            <div className="row">
              <div className="col-3">
                <label>
                  Division<span>*</span>
                </label>
              </div>
              <div className="col-9">
                <i
                  className="far fa-clone click-icons"
                  onClick={() => {
                    setModalVisible(true);
                    setModalData(allDivision);
                    setName("division");
                    setHeader({
                      title: "Division",
                      name: "Division",
                      desc: "Division Description",
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
          <div className="col">
            <div className="row">
              <div className="col-2">
                <label>
                  Plant<span>*</span>
                </label>
              </div>
              <div className="col-9">
                <i
                  className="far fa-clone click-icons"
                  onClick={() => {
                    setModalVisible(true);
                    setModalData(allOrderReceivingPlant);
                    setName("plant");
                    setHeader({
                      title: "Plant",
                      name: "Plant",
                      desc: "Plant Description",
                    });
                  }}
                ></i>
                <Controller
                  as={({ onChange, value }) => (
                    <Select
                      classNamePrefix="react-select"
                      value={plant}
                      onChange={(event) => handleChange(event, "plant")}
                      options={allOrderReceivingPlant}
                      placeholder=""
                    />
                  )}
                  defaultValue=""
                  control={control}
                  name="plant"
                  rules={{
                    required: "Plant is required",
                  }}
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

      {/* Filter Section Close */}

      {/* Table Filter Open */}

      <div className="background">
        <div className="table-filter">
          <div className="filter-div">
            <div className="row">
              <div className="col">
                <div className="row">
                  <div className="col">
                    {leRegisterData ? (
                      <ExcelFile
                        filename={`LeRegister Report: Company Code:${getValues(
                          "company_code"
                        )} - Created on from:${getValues(
                          "created_on_from"
                        )} to ${getValues("created_on_to")}`}
                        element={
                          <button
                            className="goods-button float-right"
                            style={{ backgroundColor: "#0F6FA2" }}
                          >
                            Export to Excel
                          </button>
                        }
                      >
                        <ExcelSheet data={leRegisterData} name="Le Register">
                          {headers?.map((value, i) => (
                            <ExcelColumn
                              key={`column${i}`}
                              label={value.label}
                              value={value.key}
                            />
                          ))}
                        </ExcelSheet>
                      </ExcelFile>
                    ) : null}

                    {/* {leRegisterData ? (
                      <CSVLink
                        className="goods-button float-right"
                        style={{ backgroundColor: "#0F6FA2" }}
                        data={leRegisterData}
                        headers={headers}
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
                    <th
                      className="table-sticky-vertical"
                      style={{ minWidth: "100px" }}
                      scope="col"
                    >
                      Supplying Plant
                    </th>
                    <th
                      className="table-sticky-vertical"
                      style={{ minWidth: "150px" }}
                      scope="col"
                    >
                      Supplying Plant Name
                    </th>
                    <th
                      className="table-sticky-vertical"
                      style={{ minWidth: "100px" }}
                      scope="col"
                    >
                      Delivery No
                    </th>
                    <th
                      className="table-sticky-vertical"
                      style={{ minWidth: "130px" }}
                      scope="col"
                    >
                      Dispatch Category
                    </th>
                    <th
                      className="table-sticky-vertical"
                      style={{ minWidth: "150px" }}
                      scope="col-3"
                    >
                      Dispatch Qty. (Rail)
                    </th>
                    <th
                      className="table-sticky-vertical"
                      style={{ minWidth: "150px" }}
                      scope="col"
                    >
                      Dispatch Qty. (Road)
                    </th>
                    <th
                      className="table-sticky-vertical"
                      style={{ minWidth: "150px" }}
                      scope="col"
                    >
                      Dispatch Qty. (Total)
                    </th>
                    <th
                      className="table-sticky-vertical"
                      style={{ minWidth: "140px" }}
                      scope="col"
                    >
                      Distance (in Km)
                    </th>
                    <th
                      className="table-sticky-vertical"
                      style={{ minWidth: "170px" }}
                      scope="col"
                    >
                      Distribution Channel
                    </th>
                    <th
                      className="table-sticky-vertical"
                      style={{ minWidth: "180px" }}
                      scope="col"
                    >
                      Forwarding Agent Code
                    </th>
                    <th
                      className="table-sticky-vertical"
                      style={{ minWidth: "180px" }}
                      scope="col"
                    >
                      Forwarding Agent Name
                    </th>
                    <th
                      className="table-sticky-vertical"
                      style={{ minWidth: "180px" }}
                      scope="col-3"
                    >
                      Freight Rail (XF/XXD/FF)
                    </th>
                    <th
                      className="table-sticky-vertical"
                      style={{ minWidth: "170px" }}
                      scope="col"
                    >
                      Freight Rail (XX/FX)
                    </th>
                    <th
                      className="table-sticky-vertical"
                      style={{ minWidth: "160px" }}
                      scope="col"
                    >
                      Freight Road (XF/XXD/FF)
                    </th>
                    <th
                      className="table-sticky-vertical"
                      style={{ minWidth: "190px" }}
                      scope="col"
                    >
                      Freight Road (XX/FX)
                    </th>
                    <th
                      className="table-sticky-vertical"
                      style={{ minWidth: "100px" }}
                      scope="col-3"
                    >
                      Incoterm
                    </th>
                    <th
                      className="table-sticky-vertical"
                      style={{ minWidth: "100px" }}
                      scope="col"
                    >
                      Material Code
                    </th>
                    <th
                      className="table-sticky-vertical"
                      style={{ minWidth: "150px" }}
                      scope="col"
                    >
                      Material Description
                    </th>
                    <th
                      className="table-sticky-vertical"
                      style={{ minWidth: "100px" }}
                      scope="col"
                    >
                      PGI Date
                    </th>
                    <th
                      className="table-sticky-vertical"
                      style={{ minWidth: "100px" }}
                      scope="col"
                    >
                      PGI TIME
                    </th>
                    <th
                      className="table-sticky-vertical"
                      style={{ minWidth: "100px" }}
                      scope="col-3"
                    >
                      Region
                    </th>
                    <th
                      className="table-sticky-vertical"
                      style={{ minWidth: "100px" }}
                      scope="col"
                    >
                      Region (SH)
                    </th>
                    <th
                      className="table-sticky-vertical"
                      style={{ minWidth: "300px" }}
                      scope="col"
                    >
                      Road Freight(Frt. Master Data)
                    </th>
                    <th
                      className="table-sticky-vertical"
                      style={{ minWidth: "120px" }}
                      scope="col"
                    >
                      Route Code
                    </th>
                    <th
                      className="table-sticky-vertical"
                      style={{ minWidth: "150px" }}
                      scope="col"
                    >
                      Route Description
                    </th>
                    <th
                      className="table-sticky-vertical"
                      style={{ minWidth: "170px" }}
                      scope="col"
                    >
                      Sales District (SH)
                    </th>
                    <th
                      className="table-sticky-vertical"
                      style={{ minWidth: "120px" }}
                      scope="col"
                    >
                      Sales Group
                    </th>
                    <th
                      className="table-sticky-vertical"
                      style={{ minWidth: "150px" }}
                      scope="col-3"
                    >
                      Sales Group Desc.
                    </th>
                    <th
                      className="table-sticky-vertical"
                      style={{ minWidth: "120px" }}
                      scope="col"
                    >
                      Ship To Party
                    </th>
                    <th
                      className="table-sticky-vertical"
                      style={{ minWidth: "150px" }}
                      scope="col"
                    >
                      Ship To Party Name
                    </th>
                    <th
                      className="table-sticky-vertical"
                      style={{ minWidth: "180px" }}
                      scope="col"
                    >
                      Ship To Party T-Zone
                    </th>
                    <th
                      className="table-sticky-vertical"
                      style={{ minWidth: "140px" }}
                      scope="col-3"
                    >
                      Shipping Point
                    </th>
                    <th
                      className="table-sticky-vertical"
                      style={{ minWidth: "170px" }}
                      scope="col-3"
                    >
                      Shipping Type Desc.
                    </th>
                    <th
                      className="table-sticky-vertical"
                      style={{ minWidth: "150px" }}
                      scope="col"
                    >
                      Sold To Party
                    </th>
                    <th
                      className="table-sticky-vertical"
                      style={{ minWidth: "170px" }}
                      scope="col"
                    >
                      Sold To Party Name
                    </th>
                    <th
                      className="table-sticky-vertical"
                      style={{ minWidth: "100px" }}
                      scope="col"
                    >
                      Truck No.
                    </th>
                    <th
                      className="table-sticky-vertical"
                      style={{ minWidth: "100px" }}
                      scope="col-3"
                    >
                      Approx. Value
                    </th>
                    <th
                      className="table-sticky-vertical"
                      style={{ minWidth: "100px" }}
                      scope="col-3"
                    >
                      LR Number
                    </th>
                    <th
                      className="table-sticky-vertical"
                      style={{ minWidth: "100px" }}
                      scope="col-3"
                    >
                      Shipment Number
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedleRegisterData.map((ele, i) => (
                    <tr key={ele.DEL_NO}>
                      <td>{ele.SUPPL_PLANT}</td>
                      <td>{ele.SUPPL_PLANT_NAME}</td>
                      <td>{ele.DEL_NO}</td>
                      <td>{ele.DISPATCH_CAT}</td>
                      <td>{ele.DISP_RAIL}</td>

                      <td>{ele.DISP_ROAD}</td>
                      <td>{ele.DISP_QTY}</td>
                      <td>{ele.DISTANCE}</td>
                      <td>{ele.DISTRIB}</td>
                      <td>{ele.FWD_AG}</td>
                      <td>{ele.FWD_AG_NAME}</td>
                      <td>{ele.SHPFR_RAIL_TOT}</td>
                      <td>{ele.FR_RAIL}</td>
                      <td>{ele.SHPFR_ROAD_TOT}</td>
                      <td>{ele.FR_ROAD}</td>

                      <td>{ele.INCOTERM}</td>
                      <td>{ele.MATNR}</td>
                      <td>{ele.ARKTX}</td>
                      <td>
                        {ele.PGI_DT}
                        {/* {moment(ele.PGI_DT, "YYYYMMDD").format("DD-MM-YYYY")} */}
                      </td>
                      <td>
                        {ele.PGI_TIME}
                        {/* {moment(ele.PGI_TIME, "HHmmss").format("HH:mm:ss")} */}
                      </td>

                      <td>{ele.REGION}</td>
                      <td>{ele.BEZEI}</td>
                      <td>{ele.ROAD_FR}</td>
                      <td>{ele.ROUTE}</td>
                      <td>{ele.ROUTE_DESC}</td>
                      <td>{ele.SALES_DIST}</td>
                      <td>{ele.SALE_GRP}</td>
                      <td>{ele.SALE_GRP_DS}</td>
                      <td>{ele.SHIP_PARTY}</td>
                      <td>{ele.SHIP_NAME}</td>

                      <td>{ele.DESTINATION}</td>

                      <td>{ele.VSTEL}</td>
                      <td>{ele.SHIP_TYPE}</td>
                      <td>{ele.SOLD_PARTY}</td>
                      <td>{ele.PARTY_NAME}</td>
                      <td>{ele.TRUCK_NO}</td>
                      <td>{ele.APPROX_VAL}</td>
                      <td>{ele.LR_NO}</td>
                      <td>{ele.TKNUM}</td>
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
          pageCount={leRegisterData.length / perPage}
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
      <div
        className="agregatePageTable"
        style={{
          marginLeft: "30px",
        }}
      >
        {" "}
        Dispatched Qty (Total):{" "}
        <span>{pageLeRegister.DISPATCHED_QTY_TOTAL.toFixed(2)}</span> &emsp;
        &emsp;Dispatched Qty (Rail):{" "}
        <span>{pageLeRegister.DISPATCH_QTY_RAIL.toFixed(2)}</span> &emsp; &emsp;
        Dispatched Qty (Road):{" "}
        <span>{pageLeRegister.DISPATCH_QTY_ROAD.toFixed(2)}</span>
        &emsp; &emsp; Distance:{" "}
        <span>{pageLeRegister.DISTANCE.toFixed(2)}</span>
        &emsp; &emsp; Freight Rail (XF/XXD/FF):{" "}
        <span>{pageLeRegister.SHPFR_RAIL_TOT.toFixed(2)}</span>
        &emsp; &emsp; Freight Rail (XX/FX):{" "}
        <span>{pageLeRegister.FR_RAIL.toFixed(2)}</span>
        &emsp; &emsp; Freight Road (XF/XXD/FF):{" "}
        <span>{pageLeRegister.SHPFR_ROAD_TOT.toFixed(2)}</span>
        &emsp; &emsp; Freight Road (XX/FX):{" "}
        <span>{pageLeRegister.FR_ROAD.toFixed(2)}</span>
        &emsp; &emsp; Road Freight(Frt. Master Data):{" "}
        <span>{pageLeRegister.ROAD_FR.toFixed(2)}</span>
        &emsp; &emsp; Approx. Value:{" "}
        <span>{pageLeRegister.APPROX_VAL.toFixed(2)}</span>
        <br />
        <br />
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
    </div>
  );
}

const mapStateToProps = (state) => ({
  Auth: state.Auth,
});

export default connect(mapStateToProps, { loading })(LeRegister);
