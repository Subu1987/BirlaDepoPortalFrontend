import React, { useState, useEffect, useRef } from "react";
import { loading } from "../../actions/loadingAction";
import { connect } from "react-redux";
import http from "../../services/apicall";
import apis from "../../services/apis";
import Swal from "sweetalert2";
import moment from "moment";
import { useForm } from "react-hook-form";
import Modal from "react-bootstrap/Modal";
import Table from "react-bootstrap/Table";
import Button from "react-bootstrap/Button";
import ReactPaginate from "react-paginate";
import { CSVLink } from "react-csv";
import ReceiveQuentityChanger from "./ReceiveQuentityChanger";
import StorageLocationSelector from "./StorageLocationSelector";
import _ from "lodash";
import filterOptions from "../../Functions/filterData";
import Select from "react-select";
import { getLocalData, setLocalData } from "../../services/localStorage";
import usePlant from "../../hook/usePlant";

let today = moment();
let twodaysback = moment().subtract(2, "day");
const dayDifference = 10;

function GoodReceiptCreate(props) {
  const [goodReceiptInitialData, setGoodReceiptInitialData] = useState([]);
  const [isCustomerModalVisible, setIsCustomerModalVisible] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(undefined);
  const [paginatedGoodReceiptInitialData, setPaginatedGoodReceiptInitialData] =
    useState([]);
  const [perPage, setPerpage] = useState(10);
  const [selectedGoodsReceipt, setSelectedGoodsReceipt] = useState([]);
  const [activeGoodReceipt, setActiveGoodReceipt] = useState(undefined);
  const [allConditions, setAllConditions] = useState([]);
  const [isStorageLocationModalVisible, setIsStorageLocationModalVisible] =
    useState(false);
  const [resultGoodReceiptCreated, setResultGoodReceiptCreated] = useState([]);
  const [isCreateGoods, setIsCreateGoods] = useState(false);
  const [excelData, setExcelData] = useState([]);
  const [savedGR, setSavedGR] = useState([]);

  const [pageGoodReceipt, setPageGoodReceipt] = useState({
    DISPATCHED_QTY: 0,
    BALANCE_QTY: 0,
    RECEIVED_QTY: 0,
  });

  const [filteredPlant, setFilteredPlant] = useState([]);

  const {
    register,
    handleSubmit,
    watch,
    errors,
    setValue,
    triggerValidation,
    getValues,
  } = useForm({
    mode: "onSubmit",
    reValidateMode: "onChange",
    defaultValues: {
      delivery_date_from: twodaysback.format("YYYY-MM-DD"),
      delivery_date_to: today.format("YYYY-MM-DD"),
    },
  });
  const watchAllFields = watch();

  //++++++++++++++++++++++++++++++++++++++++++++++searchSysytem Customer+++++++++++++++++++++++++++++++++++++++++++++++++++
  const [customerSearch, setCustomerSearch] = useState("");
  const [customerSearchedData, setCustomerSearchedData] = useState([]);

  const customerRef = useRef(null);

  useEffect(() => {
    if (customerSearch !== "") {
      let data = customerSearchedData.filter(
        (ele) =>
          ele.PLANT.includes(customerSearch.toUpperCase()) ||
          ele.PLANT_NAME.includes(customerSearch.toUpperCase())
      );
      console.log(data);
      setFilteredPlant(data);
    }
  }, [customerSearch]);

  // +++++++++++++++ plant +++++++++++++++//

  const plant = usePlant();

  useEffect(() => {
    if (plant.length > 0) {
      // extra condition only for this
      setCustomerSearchedData(
        plant.map((ele) => {
          return {
            PLANT: ele.WERKS,
            PLANT_NAME: ele.NAME1,
          };
        })
      );
    }
  }, [plant]);

  let openCustomerSearchModal = () => {
    setIsCustomerModalVisible(true);
  };

  useEffect(() => {
    if (isCustomerModalVisible) {
      customerRef.current.focus();
    }
  }, [isCustomerModalVisible]);

  //++++++++++++++++++++++++++++++++++++++++++++++searchSysytem+++++++++++++++++++++++++++++++++++++++++++++++++++

  var pageChange = ({ selected }) => {
    setPaginatedGoodReceiptInitialData(
      goodReceiptInitialData.slice(selected * perPage, perPage * (selected + 1))
    );

    let x = goodReceiptInitialData.slice(
      selected * perPage,
      perPage * (selected + 1)
    );

    let DISPATCHED_QTY = 0;
    let BALANCE_QTY = 0;
    let RECEIVED_QTY = 0;

    x.forEach((resp) => {
      DISPATCHED_QTY += +resp.DISPATCHED_QTY;
      BALANCE_QTY += +resp.BALANCE_QTY;
      RECEIVED_QTY += +resp.RECEIVED_QTY;
    });

    setPageGoodReceipt({
      DISPATCHED_QTY: DISPATCHED_QTY,
      BALANCE_QTY: BALANCE_QTY,
      RECEIVED_QTY: RECEIVED_QTY,
    });
  };

  useEffect(() => {
    // console.log(paginatedGoodReceiptInitialData);
  }, [paginatedGoodReceiptInitialData]);

  useEffect(() => {
    pageChange({ selected: 0 });
  }, [perPage, goodReceiptInitialData]);
  //++++++++++++++++++++++++++++++++++++++++++++++++++++++++++fetching delivery list end++++++++++++++++++++++++++++++++++++++

  let onSubmit = (data) => {
    fetchInitialgoodReceiptData();
  };

  //+++++++++++++++++++++++++++++++++++++++++++++++++++++++++other handlers++++++++++++++++++++++++++++++++++++++++++++++
  useEffect(() => {
    if (watchAllFields.delivery_to) {
      triggerValidation("delivery_to");
    }
  }, [watchAllFields.delivery_from]);

  useEffect(() => {
    if (watchAllFields.c) {
      triggerValidation("delivery_from");
    }
  }, [watchAllFields.delivery_to]);

  useEffect(() => {
    triggerValidation("delivery_date_to");
  }, [watchAllFields.delivery_date_from]);

  useEffect(() => {
    triggerValidation("delivery_date_from");
  }, [watchAllFields.delivery_date_to]);

  let setWithValidationTrigger = (key, value) => {
    setValue(key, value);
    triggerValidation(key);
  };
  //+++++++++++++++++++++++++++++++++++++++++++++++++++++++++other handlers end++++++++++++++++++++++++++++++++++++++++++++++

  //+++++++++++++++++++++++++++++++++++++++++++++++++++++++++fetch initial good receipt data++++++++++++++++++++++++++++++++++++++
  let fetchInitialgoodReceiptData = () => {
    props.loading(true);
    let body = {
      customer_number: plantValue?.value,
      delivery_date_from: moment(watchAllFields.delivery_date_from).format(
        "YYYYMMDD"
      ),
      delivery_date_to: moment(watchAllFields.delivery_date_to).format(
        "YYYYMMDD"
      ),
      delivery_number_from: watchAllFields.delivery_from,
      delivery_number_to: watchAllFields.delivery_to,
      IM_LOGIN_ID: localStorage.getItem("user_code"),
    };
    http
      .post(apis.INITIAL_GOOD_RECEIPT_LIST, body)
      .then((result) => {
        if (result.data.status) {
          setGoodReceiptInitialData(result.data.data);

          // setExcelData(result.data.data);
          fixDate(result.data.data);

          let data = result.data.data;

          if (data?.length > 0) {
            let x = data.slice(0, perPage);

            let DISPATCHED_QTY = 0;
            let BALANCE_QTY = 0;
            let RECEIVED_QTY = 0;

            x.forEach((resp) => {
              DISPATCHED_QTY += +resp.DISPATCHED_QTY;
              BALANCE_QTY += +resp.BALANCE_QTY;
              RECEIVED_QTY += +resp.RECEIVED_QTY;
            });

            setPageGoodReceipt({
              DISPATCHED_QTY: DISPATCHED_QTY,
              BALANCE_QTY: BALANCE_QTY,
              RECEIVED_QTY: RECEIVED_QTY,
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

        fetchInitialgoodReceiptData();
      })
      .finally(() => {
        props.loading(false);
      });
  };
  //+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++good receipt end+++++++++++++++++++++++++++++++++++++++=

  //+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++open storage location modal+++++++++++++++++++++++++++++++++++++++++
  let openSetStorageLocationModal = (data) => {
    if (data.RECEIVED_QTY && Number(data.RECEIVED_QTY) !== 0) {
      setActiveGoodReceipt(data);
      setIsStorageLocationModalVisible(true);
    } else {
      Swal.fire({
        title: "Error!",
        text: "Receive quantity should not be zero",
        icon: "error",
        confirmButtonText: "Ok",
      });
    }
  };
  //+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++storage location end++++++++++++++++++++++++++++++++++++++++++

  //+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++insert into selected goods receipt++++++++++++++++++++++
  let insertIntoSelectedGoodsReceipt = (row) => {
    if (selectedGoodsReceipt.includes(row.DELV_NO)) {
      let arr = selectedGoodsReceipt.filter((d) => d !== row.DELV_NO);
      setSelectedGoodsReceipt(arr);
    } else {
      // if (today.diff(moment(row.LFDAT, "YYYYMMDD"), "days") <= dayDifference) {
      if (selectedGoodsReceipt.length === 0) {
        setSelectedGoodsReceipt([row.DELV_NO]);
      } else {
        Swal.fire({
          title: "Error!",
          text: "You can not select more than one GR",
          icon: "error",
          confirmButtonText: "Ok",
        });
      }
      // } else {
      //   Swal.fire({
      //     title: "Error!",
      //     text: `Can not create good receipt for delivery older than ${dayDifference} days`,
      //     icon: "error",
      //     confirmButtonText: "Ok",
      //   });
      // }
    }
  };

  //++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

  //+++++++++++++++++++++++++++++++++++++++++++++++update balance quantity++++++++++++++++++++++++++++++
  let updatedBalanceQuantity = (receivedQty, balancedQty, num) => {
    let arr = goodReceiptInitialData.map((ele) => {
      if (ele.DELV_NO === num) {
        return {
          ...ele,
          BALANCE_QTY: balancedQty,
          RECEIVED_QTY: receivedQty,
        };
      } else {
        return ele;
      }
    });
    setGoodReceiptInitialData(arr);
  };

  //+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

  //++++++++++++++++++++++++++++++++++++++++++++++++++++++++update storage location ++++++++++++++++++++++++++
  let saveStorageLocation = (storageLocationArray, num) => {
    let arr = goodReceiptInitialData.map((ele) => {
      if (ele.DELV_NO === num) {
        return {
          ...ele,
          storageLocationArray: storageLocationArray,
        };
      } else {
        return ele;
      }
    });
    setGoodReceiptInitialData(arr);
  };

  //+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

  //++++++++++++++++++++++++++++++++++++++++++++++++++++++fetch all conditions++++++++++++++++++++++++++++++++
  let fetchAllConditions = () => {
    props.loading(true);
    http
      .post(apis.FETCH_CONDITION_TYPE)
      .then((result) => {
        if (result.data.status) {
          setAllConditions(result.data.data);
          setLocalData("con-type", result.data.data);
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
      .catch((err) => {})
      .finally(() => {
        props.loading(false);
      });
  };
  useEffect(() => {
    if (getLocalData("con-type")?.length > 0) {
      setAllConditions(getLocalData("con-type"));
    } else {
      fetchAllConditions();
    }
  }, []);
  //++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

  //+++++++++++++++++++++++++++++++++++++++++++++++++++++++create good receipt+++++++++++++++++++++++++++++++
  // let createGoodReceipt = ()=>{
  //   let arr = [];
  //   for(let i =0; i<goodReceiptInitialData.length;i++){
  //     if(selectedGoodsReceipt.includes(goodReceiptInitialData[i].DELV_NO)){
  //       let a = goodReceiptInitialData[i].storageLocationArray.map((ele)=>{
  //         let IT_GR_CREATE = goodReceiptInitialData[i];
  //         delete IT_GR_CREATE["storageLocationArray"];
  //         let IT_BATCH_DETAIL={
  //           DELV_NO : IT_GR_CREATE.DELV_NO,
  //           DELV_ITEM : IT_GR_CREATE.DELV_ITEM,
  //           BATCH : ele.selected_storage_location,
  //           QUANTITY : ele.selected_quantity,
  //           UOM : IT_GR_CREATE.UOM,
  //           YYCOND_TYPE : ele.selected_condition
  //         }
  //         console.log(IT_GR_CREATE,IT_BATCH_DETAIL)
  //         return http.post(apis.CREATE_GOODS_REPORT,{
  //           IT_GR_CREATE:[IT_GR_CREATE],
  //           IT_BATCH_DETAIL:[IT_BATCH_DETAIL]
  //         })
  //       })
  //       arr=arr.concat(a);
  //     }
  //   }
  //   Promise.all(arr).then((result)=>{
  //     console.log(result)
  //     let r = result.map((e,j)=>{
  //       console.log(e);
  //       if(e.data.status){
  //         return {
  //           status:true,
  //           msg : `GR cretaed with number ${e.data.data}`
  //         }
  //       }
  //       else{
  //         return {
  //           status:false,
  //           msg : e.data.msg
  //         }
  //       }
  //     })
  //     setResultGoodReceiptCreated(r);
  //     setCurrentState("2")
  //   }).catch((err)=>{
  //     console.log(err)
  //     Swal.fire({
  //       title: "Error!",
  //       text: 'server error.',
  //       icon: "error",
  //       confirmButtonText: "Ok",
  //     });
  //   })
  // }

  // useEffect(() => {
  //   console.log(
  //     $("input")
  //       .on("change", function () {
  //         this.setAttribute(
  //           "data-date",
  //           moment(this.value, "YYYY-MM-DD").format(
  //             this.getAttribute("data-date-format")
  //           )
  //         );
  //       })
  //       .trigger("change")
  //   );
  // }, []);

  let createdGR = [];
  let createGoodReceipt = () => {
    // window.open(,"_blank")
    createdGR = [...savedGR];
    let arr = [];
    for (let i = 0; i < goodReceiptInitialData.length; i++) {
      if (selectedGoodsReceipt.includes(goodReceiptInitialData[i].DELV_NO)) {
        if (!goodReceiptInitialData[i].storageLocationArray) {
          Swal.fire({
            title: "Error!",
            text: "Please fill the storage location table",
            icon: "error",
            confirmButtonText: "Ok",
          });
          console.log("fill storage location table");
        } else {
          let IT_GR_CREATE = { ...goodReceiptInitialData[i] };
          delete IT_GR_CREATE["storageLocationArray"];
          console.log(goodReceiptInitialData[i].storageLocationArray);
          createdGR.push(goodReceiptInitialData[i].DELV_NO);
          console.log(createdGR, "Created GR");
          setSavedGR(createdGR);
          let a = goodReceiptInitialData[i].storageLocationArray.map((ele) => {
            return {
              DELV_NO: IT_GR_CREATE.DELV_NO,
              DELV_ITEM: IT_GR_CREATE.DELV_ITEM,
              BATCH: ele.selected_storage_location,
              QUANTITY: ele.selected_quantity,
              UOM: IT_GR_CREATE.UOM,
              YYCOND_TYPE: ele.selected_condition,
            };
          });
          console.log(IT_GR_CREATE, a);
          let req = http.post(apis.CREATE_GOODS_REPORT, {
            IT_GR_CREATE: [IT_GR_CREATE],
            IT_BATCH_DETAIL: a,
            IM_LOGIN_ID: localStorage.getItem("user_code"),
          });
          arr.push(req);

          // setSavedGR.push(arr.IT_GR_CREATE.);
        }
      }
    }
    if (arr.length > 0) {
      props.loading(true);
      Promise.all(arr)
        .then((result) => {
          console.log(result);
          let r = result.map((e, j) => {
            console.log(e);
            if (e.data.status) {
              return {
                status: true,
                msg: e.data.data,
              };
            } else {
              return {
                status: false,
                msg: e.data.msg,
              };
            }
          });
          setResultGoodReceiptCreated(r);
          setIsCreateGoods(true);
          // setCurrentState("2");
          // fetchInitialgoodReceiptData();
        })
        .catch((err) => {
          console.log(err);

          fetchInitialgoodReceiptData();
        })
        .finally(() => {
          props.loading(false);
          // window.open("/dashboard/goods-receipt/create", "_blank");
          // fetchInitialgoodReceiptData();
          setSelectedGoodsReceipt([]);
        });
    }
  };

  let closeGoodsModal = () => {
    setIsCreateGoods(false);
    fetchInitialgoodReceiptData();
  };

  //++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

  // Headers
  let headers = [
    { label: "Sales Organization", key: "VKORG" },
    { label: "Issuing Plant", key: "ISSUE_PLANT" },
    { label: "Delivery Number", key: "DELV_NO" },
    { label: "Delivery Date", key: "LFDAT" },
    { label: "Stock Transfer Order Number", key: "STO_NO" },
    { label: "Material", key: "MATERIAL" },
    { label: "Material Description", key: "MAKTX" },
    { label: "Description of the Shipping Type", key: "BEZEI" },
    { label: "Dispatched Quantity", key: "DISPATCHED_QTY" },
    { label: "Balanced Quantity", key: "BALANCE_QTY" },
    { label: "Received Quantity", key: "RECEIVED_QTY" },
    { label: "Unit of Measure", key: "UOM" },
    { label: "Received Date", key: "RECEIPT_DATE" },
    { label: "Vehicle Number", key: "VEHICLE_NO" },
    { label: "Transporter Code", key: "TRANSPORTER" },
    { label: "Transporter Name", key: "TRANSP_NAME" },
  ];

  // ++++++++++ Fix Date Format +++++++++++++++++++++++++++ //

  // useEffect(() => {
  //   for (let i = 0; i < excelData.length; i++) {
  //     excelData[i].LFDAT = moment(excelData[i].LFDAT, "YYYYMMDD").format(
  //       "DD-MM-YYYY"
  //     );
  //   }
  // }, [excelData]);
  // let newData = [];
  let fixDate = (data) => {
    let newData = _.cloneDeep(data);
    for (let i = 0; i < newData.length; i++) {
      newData[i].LFDAT = moment(newData[i].LFDAT, "YYYYMMDD").format(
        "DD-MM-YYYY"
      );
      newData[i].RECEIPT_DATE = moment(
        newData[i].RECEIPT_DATE,
        "YYYYMMDD"
      ).format("DD-MM-YYYY");
    }
    setExcelData(newData);
    console.log(excelData, "Clone");
  };

  // Plant

  const [plantOptions, setPlantOptions] = useState([]);
  const [plantValue, setPlantValue] = useState([]);

  useEffect(() => {
    console.log(customerSearch);
    setPlantOptions(filterOptions(customerSearchedData, "PLANT", "PLANT_NAME"));
  }, [customerSearchedData]);

  // Common Handle Change
  const commonHandleChange = (data, filedName) => {
    console.log(data, filedName);
    if (filedName === "PLANT") {
      setPlantValue(data);
    }
  };

  return (
    <>
      {/* {currentState === "1" ? ( */}
      <div style={{ marginBottom: "30px" }}>
        {/* {console.log(goodReceiptInitialData, "Original")} */}
        <form className="filter-section" onSubmit={handleSubmit(onSubmit)}>
          <div className="row">
            <div className="col">
              <div className="row">
                <div className="col-3">
                  <label>Delivery#</label>
                </div>
                <div className="col-4">
                  <input
                    type="number"
                    placeholder="From"
                    ref={register({
                      validate: (value) => {
                        let ans = false;
                        if (watchAllFields.delivery_to) {
                          if (
                            parseInt(value) <=
                            parseInt(watchAllFields.delivery_to)
                          ) {
                            ans = true;
                          }
                        } else {
                          ans = true;
                        }
                        triggerValidation("delivery_to");
                        return ans;
                      },
                    })}
                    name="delivery_from"
                  />
                  {errors.delivery_from && (
                    <p className="form-error">Please put a valid value</p>
                  )}
                </div>
                <div className="column-divider"></div>
                <div className="col-4">
                  <input
                    type="number"
                    placeholder="To"
                    ref={register({
                      validate: (value) => {
                        let ans = false;
                        // if (watchAllFields.delivery_from) {
                        if (
                          parseInt(value) >=
                          parseInt(watchAllFields.delivery_from)
                        ) {
                          ans = true;
                          // }
                        } else {
                          ans = true;
                        }
                        //triggerValidation("delivery_from");
                        return ans;
                      },
                    })}
                    name="delivery_to"
                  />
                  {errors.delivery_to && (
                    <p className="form-error">Please put a valid value</p>
                  )}
                </div>
              </div>
            </div>
            <div className="col">
              <div className="row">
                <div className="col-3">
                  <label className="float-right">
                    Delivery Date From<span>*</span>
                  </label>
                </div>
                <div className="col-3">
                  <input
                    type="date"
                    //   id="demo"
                    //   data-date=""
                    //   data-date-format="MM DD YYYY"
                    //   value="2015-08-09"
                    // />
                    // <input
                    //   id="delivery_from"
                    //   type="date"
                    //   data-date=""
                    //   data-date-format="DD-MM-YYYY"
                    placeholder="From"
                    name="delivery_date_from"
                    ref={register({
                      validate: (value) => {
                        let ans = false;
                        if (watchAllFields.delivery_date_to) {
                          if (
                            moment(watchAllFields.delivery_date_from).isBefore(
                              moment(watchAllFields.delivery_date_to)
                            ) ||
                            (moment(watchAllFields.delivery_date_from).isSame(
                              moment(watchAllFields.delivery_date_to)
                            ) &&
                              moment(watchAllFields.delivery_date_to).diff(
                                moment(watchAllFields.delivery_date_from),
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
                  />
                  {errors.delivery_date_from && (
                    <p className="form-error">Date should be within 31 days</p>
                  )}
                </div>
                <div className="col-3">
                  <label className="float-right">
                    Delivery Date To<span>*</span>
                  </label>
                </div>
                <div className="col-3">
                  <input
                    type="date"
                    name="delivery_date_to"
                    ref={register({
                      validate: (value) => {
                        let ans = false;
                        if (watchAllFields.delivery_date_from) {
                          if (
                            (moment(watchAllFields.delivery_date_from).isBefore(
                              moment(watchAllFields.delivery_date_to)
                            ) ||
                              moment(watchAllFields.delivery_date_from).isSame(
                                moment(watchAllFields.delivery_date_to)
                              )) &&
                            moment(watchAllFields.delivery_date_to).diff(
                              moment(watchAllFields.delivery_date_from),
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
                  {errors.delivery_date_to && (
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
                    Receiving Plant<span>*</span>
                  </label>
                </div>
                <div className="col-9">
                  <i
                    className="far fa-clone click-icons"
                    onClick={() => {
                      openCustomerSearchModal();
                    }}
                  ></i>

                  <Select
                    classNamePrefix="react-select"
                    value={Object.keys(plantValue).length > 0 ? plantValue : []}
                    options={plantOptions}
                    name="PLANT"
                    cacheOptions
                    defaultOptions
                    placeholder={"Plant"}
                    onChange={(e) => commonHandleChange(e, "PLANT")}
                  />
                  {/* <input
                    type="text"
                    ref={register({
                      required: true,
                    })}
                    name="customer"
                    onChange={(e) => {
                      setSelectedCustomer({
                        KUNNR: e.target.value,
                      });
                      setWithValidationTrigger("customer", e.target.value);
                    }}
                  /> */}
                  {errors.customer && (
                    <p className="form-error">Please select a Plant</p>
                  )}
                </div>
              </div>
            </div>

            <div className="col">
              <div className="row">
                <div className="col-6">
                  <button
                    className="search-button float-right"
                    style={{ backgroundColor: "red" }}
                  >
                    <i
                      className="fa fa-times icons-button"
                      onClick={() => window.location.reload()}
                    ></i>
                  </button>
                  {!Object.keys(plantValue).length > 0 ? (
                    <div
                      style={{ cursor: "pointer" }}
                      className="search-button float-right"
                      onClick={() =>
                        Swal.fire({
                          title: "Fill all the mandatory fields",
                          icon: "error",
                        })
                      }
                    >
                      <i className="fas fa-search icons-button"></i>
                    </div>
                  ) : (
                    <button type="submit" className="search-button float-right">
                      <i className="fas fa-search icons-button"></i>
                    </button>
                  )}
                </div>
              </div>
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
                    <div className="col" style={{ height: "60px" }}>
                      {goodReceiptInitialData.length > 0 ? (
                        <CSVLink
                          className="goods-button float-right"
                          style={{ backgroundColor: "#0F6FA2" }}
                          data={excelData}
                          headers={headers}
                          filename={`Good-Receipt-Create- Plant-${getValues(
                            "customer"
                          )} -- ${getValues(
                            "delivery_date_from"
                          )} to ${getValues("delivery_date_to")}.csv`}
                        >
                          Export to CSV
                        </CSVLink>
                      ) : (
                        <button
                          className="goods-button float-right"
                          style={{ backgroundColor: "#0F6FA2" }}
                        >
                          Export to CSV
                        </button>
                      )}
                      {selectedGoodsReceipt.length > 0 ? (
                        <Button
                          onClick={createGoodReceipt}
                          // href="/dashboard/goods-receipt/create"
                          // target="_blank"
                          className="goods-button float-right"
                          style={{
                            backgroundColor: "#0F6FA2",
                            color: "#fff",
                            cursor: "pointer",
                          }}
                          to="#"
                        >
                          Create Good Receipt
                        </Button>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Table Div Open */}

            <div className="table-div" style={{ height: "500px" }}>
              <div className="row">
                <table className="table">
                  <thead>
                    <tr>
                      <th
                        className="table-sticky-horizontal table-sticky-vertical"
                        style={{ left: "0", zIndex: "15" }}
                      >
                        <label className="label table-checkbox">
                          <input
                            className="table__checkbox"
                            type="checkbox"
                            disabled={true}
                          />
                          <span className="table__text table-span-text">
                            <span className="table__check table-span-check">
                              <i className="fa fa-check table-icon"></i>
                            </span>
                          </span>
                        </label>
                      </th>
                      <th
                        className="table-sticky-horizontal table-sticky-vertical"
                        style={{
                          minWidth: "160px",
                          left: "70px",
                          zIndex: "15",
                        }}
                        scope="col"
                      >
                        Sales Organization
                      </th>
                      <th
                        className="table-sticky-horizontal table-sticky-vertical"
                        style={{
                          minWidth: "100px",
                          left: "230px",
                          zIndex: "15",
                        }}
                        scope="col"
                      >
                        Issuing Plant
                      </th>
                      <th
                        className="table-sticky-horizontal table-sticky-vertical"
                        style={{
                          minWidth: "100px",
                          left: "330px",
                          zIndex: "15",
                        }}
                        scope="col"
                      >
                        Delivery Number
                      </th>
                      {/* <th style={{minWidth:"100px"}} scope="col">Delivery Item</th> */}
                      <th
                        className="table-sticky-vertical"
                        style={{ minWidth: "150px" }}
                        scope="col"
                      >
                        Delivery date
                      </th>
                      <th
                        className="table-sticky-vertical"
                        style={{ minWidth: "201px" }}
                        scope="col"
                      >
                        Stock Transfer Order Number
                      </th>
                      <th
                        className="table-sticky-vertical"
                        style={{ minWidth: "134px" }}
                        scope="col-3"
                      >
                        Material #
                      </th>
                      <th
                        className="table-sticky-vertical"
                        style={{ minWidth: "275px" }}
                        scope="col"
                      >
                        Material Description (Short Text)
                      </th>

                      {/* <th className="table-sticky-vertical" style={{minWidth:"100px"}} scope="col">Shipping type</th> */}
                      <th
                        className="table-sticky-vertical"
                        style={{ minWidth: "210px" }}
                        scope="col"
                      >
                        Description of the Shipping Type
                      </th>
                      <th
                        className="table-sticky-vertical"
                        style={{ minWidth: "100px" }}
                        scope="col"
                      >
                        Dispatched Quantity
                      </th>

                      <th
                        className="table-sticky-vertical"
                        style={{ minWidth: "100px" }}
                        scope="col"
                      >
                        Balanced Quantity
                      </th>
                      <th
                        className="table-sticky-vertical"
                        style={{ minWidth: "200px" }}
                        scope="col"
                      >
                        Received Quantity
                      </th>
                      <th
                        className="table-sticky-vertical"
                        style={{ minWidth: "100px" }}
                        scope="col-3"
                      >
                        Unit of Measure
                      </th>
                      <th
                        className="table-sticky-vertical"
                        style={{ minWidth: "150px" }}
                        scope="col"
                      >
                        Received Date
                      </th>

                      {/* <th style={{minWidth:"100px"}} scope="col">Storage Location</th>
                        <th style={{minWidth:"100px"}} scope="col">Batch</th> */}
                      <th
                        className="table-sticky-vertical"
                        style={{ minWidth: "100px" }}
                        scope="col-3"
                      >
                        Vehicle Number
                      </th>
                      <th
                        className="table-sticky-vertical"
                        style={{ minWidth: "100px" }}
                        scope="col"
                      >
                        Transporter Code
                      </th>
                      <th
                        className="table-sticky-vertical"
                        style={{ minWidth: "220px" }}
                        scope="col"
                      >
                        Transporter Name
                      </th>
                      <th
                        className="table-sticky-vertical"
                        style={{ minWidth: "220px" }}
                        scope="col"
                      ></th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedGoodReceiptInitialData.map((ele, i) => (
                      <tr
                        key={ele.DELV_NO}
                        className={ele.INV_FLAG === "" ? "gray-tr" : ""}
                      >
                        <td
                          style={{ left: "0" }}
                          className={
                            ele.INV_FLAG === ""
                              ? "gray-tr table-sticky-horizontal"
                              : "table-sticky-horizontal"
                          }
                        >
                          {ele.INV_FLAG !== "" ? (
                            <label className="label table-checkbox">
                              <input
                                className="table__checkbox"
                                type="checkbox"
                                name={`check${i}`}
                                checked={selectedGoodsReceipt.includes(
                                  ele.DELV_NO
                                )}
                                onChange={(e) => {
                                  insertIntoSelectedGoodsReceipt(ele);
                                }}
                                disabled={ele.INV_FLAG === ""}
                                // style={ele.INV_FLAG === ""?{cursor:""}}
                              />
                              <span className="table__text table-span-text">
                                <span className="table__check table-span-check">
                                  <i className="fa fa-check table-icon"></i>
                                </span>
                              </span>
                            </label>
                          ) : (
                            <label></label>
                          )}
                        </td>
                        <td
                          className={
                            ele.INV_FLAG === ""
                              ? "gray-tr table-sticky-horizontal"
                              : "table-sticky-horizontal"
                          }
                          style={{ minWidth: "160px", left: "70px" }}
                        >
                          {ele.VKORG}
                        </td>
                        <td
                          className={
                            ele.INV_FLAG === ""
                              ? "gray-tr table-sticky-horizontal"
                              : "table-sticky-horizontal"
                          }
                          style={{ minWidth: "100px", left: "230px" }}
                        >
                          {ele.ISSUE_PLANT}
                        </td>
                        <td
                          className={
                            ele.INV_FLAG === ""
                              ? "gray-tr table-sticky-horizontal"
                              : "table-sticky-horizontal"
                          }
                          style={{ minWidth: "100px", left: "330px" }}
                        >
                          {ele.DELV_NO}
                        </td>
                        {/* <td>{ele.DELV_ITEM.replace(/^0+/, "")}</td> */}
                        <td>
                          {moment(ele.LFDAT, "YYYYMMDD").format("DD-MM-YYYY")}
                        </td>
                        <td>{ele.STO_NO}</td>
                        <td>{ele.MATERIAL.replace(/^0+/, "")}</td>
                        <td>{ele.MAKTX}</td>
                        {/* <td>{ele.VSART}</td> */}
                        <td>{ele.BEZEI}</td>
                        <td>{ele.DISPATCHED_QTY}</td>
                        <td>{ele.BALANCE_QTY}</td>
                        <td>
                          {/* {today.diff(moment(ele.LFDAT, "YYYYMMDD"), "days") <=
                          dayDifference ? ( */}
                          <ReceiveQuentityChanger
                            initialReceivedQuantity={ele.RECEIVED_QTY}
                            initialDispatchedQuantity={ele.DISPATCHED_QTY}
                            initialBalancedQuantity={ele.BALANCE_QTY}
                            deliveryNumber={ele.DELV_NO}
                            updatedBalanceQuantity={updatedBalanceQuantity}
                            loading={props.loading}
                            shippingType={ele.VSART}
                          />
                          {/* ) : (
                            ele.RECEIVED_QTY
                          )} */}
                        </td>
                        <td>{ele.UOM}</td>
                        <td>
                          {moment(ele.RECEIPT_DATE, "YYYYMMDD").format(
                            "DD-MM-YYYY"
                          )}
                        </td>
                        {/* <td>{ele.STORAGE_LOC}</td>
                          <td>{ele.BATCH}</td> */}
                        <td>{ele.VEHICLE_NO}</td>
                        <td>{ele.TRANSPORTER.replace(/^0+/, "")}</td>
                        <td>{ele.TRANSP_NAME}</td>
                        <td>
                          {/* {today.diff(moment(ele.LFDAT, "YYYYMMDD"), "days") <=
                          dayDifference ? ( */}
                          <button
                            className="btn goods-button"
                            style={{
                              backgroundColor: "rgb(15, 111, 162)",
                            }}
                            onClick={(e) => {
                              openSetStorageLocationModal(ele);
                            }}
                          >
                            Storage Location
                          </button>
                          {/* ) : null} */}
                        </td>
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
            pageCount={goodReceiptInitialData.length / perPage}
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
          Dispatched Quantity:{" "}
          <span>{pageGoodReceipt.DISPATCHED_QTY.toFixed(2)}</span> &emsp; &emsp;
          Balanced Quantity:{" "}
          <span>{pageGoodReceipt.BALANCE_QTY.toFixed(2)}</span> &emsp; &emsp;
          Received Quantity:{" "}
          <span>{pageGoodReceipt.RECEIVED_QTY.toFixed(2)}</span>
        </div>

        {/* customer modal */}
        <Modal
          show={isCustomerModalVisible}
          size="lg"
          centered
          className="modal"
          onHide={() => setIsCustomerModalVisible(false)}
        >
          <Modal.Header closeButton>
            <Modal.Title>Receiving Plant</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div className="input-area-modal">
              <input
                type="text"
                className="model-input"
                onChange={(e) => {
                  setCustomerSearch(e.target.value);
                }}
                value={customerSearch}
                ref={customerRef}
              />
            </div>
            <div className="modal-div">
              <Table size="sm" className="modal-table">
                <thead className="modal-thead">
                  <tr className="modal-table-tr">
                    <th className="modal-table-th float-center">
                      Plant Number
                    </th>
                    <th className="modal-table-th float-center">Plant Name</th>
                    <th className="modal-table-th float-center">Select</th>
                  </tr>
                </thead>
                <tbody className="modal-table-tbody">
                  {filteredPlant.map((row, i) => (
                    <tr className="modal-table-tr" key={i}>
                      <td>{row["PLANT"]}</td>
                      <td>{row["PLANT_NAME"]}</td>
                      <td className="modal-table-td">
                        <button
                          className="button search-button"
                          onClick={() => {
                            setSelectedCustomer(row);
                            setWithValidationTrigger(
                              "customer",
                              row["PLANT"] + "-" + row["PLANT_NAME"]
                            );
                            setIsCustomerModalVisible(false);
                            setPlantValue({
                              value: row.PLANT,
                              label: row.PLANT + "-" + row.PLANT_NAME,
                            });
                          }}
                        >
                          Select
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          </Modal.Body>
          <Modal.Footer className="modal-footer">
            <Button
              className="button modal-button"
              onClick={() => setIsCustomerModalVisible(false)}
            >
              Close
            </Button>
          </Modal.Footer>
        </Modal>
        {/* plant modal close*/}
      </div>

      {/* Goods Create Modal */}
      <Modal
        show={isCreateGoods}
        size="lg"
        centered
        className="modal"
        onHide={() => {
          fetchInitialgoodReceiptData();
          setIsCreateGoods(false);
        }}
      >
        <Modal.Header closeButton>
          <Modal.Title>Goods Receipt</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div>
            {resultGoodReceiptCreated.map((ele, i) => {
              return ele.status ? (
                <div key={i} className={"row input-area"}>
                  {ele.msg.map((e, i) => (
                    <>
                      <img
                        className="success-img"
                        src="/images/success_tick.jpeg"
                      />
                      <span className="success-msg">
                        &nbsp;&nbsp;{console.log("Msg", ele.msg)} {e}
                      </span>
                      <br />
                      <br />
                    </>
                  ))}
                </div>
              ) : (
                <div key={i} className={"row input-area"}>
                  <img
                    className="success-img"
                    src="/images/success_tick.jpeg"
                  />
                  <span className="success-msg">&nbsp;&nbsp; {ele.msg}</span>
                </div>
              );
            })}
            {/* <a
              className="button button-foreword"
              type="button"
              href="/dashboard/goods-receipt/create"
              // onClick={
              //   (() => fetchInitialgoodReceiptData(), () => window.close())
              // }
            >
              Create new GR
            </a> */}
          </div>
        </Modal.Body>
        <Modal.Footer className="modal-footer">
          <Button className="button modal-button" onClick={closeGoodsModal}>
            Create New GR
          </Button>
        </Modal.Footer>
      </Modal>
      {/* // )} */}

      {isStorageLocationModalVisible ? (
        <StorageLocationSelector
          isStorageLocationModalVisible={isStorageLocationModalVisible}
          setIsStorageLocationModalVisible={setIsStorageLocationModalVisible}
          allConditions={allConditions}
          activeGoodReceipt={activeGoodReceipt}
          loading={props.loading}
          saveStorageLocation={saveStorageLocation}
          recPlant={plantValue?.value}
          vkorg={activeGoodReceipt?.VKORG}
          shippingType={activeGoodReceipt.VSART}
        />
      ) : null}
    </>
  );
}

const mapStateToProps = (state) => ({
  Auth: state.Auth,
});

export default connect(mapStateToProps, { loading })(GoodReceiptCreate);
