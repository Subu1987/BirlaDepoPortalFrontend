import moment from "moment";
import React, { useEffect, useRef, useState } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Table from "react-bootstrap/Table";
import { useForm } from "react-hook-form";
import Loader from "react-loader-spinner";
import ReactPaginate from "react-paginate";
import { connect } from "react-redux";
import { Link, useHistory } from "react-router-dom";
import Swal from "sweetalert2";
import { loading } from "../../actions/loadingAction";
import http from "../../services/apicall";
import apis from "../../services/apis";

import { CSVLink } from "react-csv";
import Select from "react-select";
import { v4 as uuidv4 } from "uuid";
import filterOptions from "../../Functions/filterData";
import usePlant from "../../hook/usePlant";

let today = moment();
let twodaysback = moment().subtract(2, "day");

function DeliveryList(props) {
  const [deliveryData, setDeliveryData] = useState([]);
  const [allOrderSupplyingPlants, setAllOrderSupplyingPlants] = useState([]);
  const [isPlantModalVisible, setIsPlantModalVisible] = useState(false);
  const [selectedPlant, setSelectedPlant] = useState(undefined);
  const [paginatedDeliveryData, setPaginatedDeliverydata] = useState([]);
  const [perPage, setPerpage] = useState(10);
  const [selectedDelivery, setSelectedDelivery] = useState([]);
  const [currentState, setCurrentState] = useState("1");

  const [pageDeliveryList, setPageDeliveryList] = useState({
    ISSUE_QTY: 0,
    FREIGHT: 0,
  });

  const [pgiResponse, setPgiResponse] = useState([]);
  const [activePgi, setActivePgi] = useState("before");
  const [loadingTable, setLoadingTable] = useState(true);
  const [pgi, setPGI] = useState("");

  const {
    register,
    handleSubmit,
    watch,
    errors,
    setValue,
    triggerValidation,
    reset,
    getValues,
  } = useForm({
    mode: "onSubmit",
    reValidateMode: "onChange",
    defaultValues: {
      delivery_date_from: twodaysback.format("YYYY-MM-DD"),
      delivery_date_to: today.format("YYYY-MM-DD"),
      pgi: "before",
    },
  });

  let history = useHistory();
  const watchAllFields = watch();

  const plant = usePlant();

  useEffect(() => {
    if (plant.length > 0) {
      setAllOrderSupplyingPlants(plant);
    }
  }, [plant]);

  //++++++++++++++++++++++++++++++++++++++++++++++searchSysytem plant+++++++++++++++++++++++++++++++++++++++++++++++++++
  const [plantSearch1, setplantSearch1] = useState("");
  const [plantSearch2, setplantSearch2] = useState("");
  const [plantSearchedfiltered, setplantSearchedfiltered] = useState([]);
  const plantSearchRef = useRef(null);

  useEffect(() => {
    if (plantSearch1 !== "" || plantSearch2 !== "") {
      let new_data = allOrderSupplyingPlants;
      new_data = new_data.filter((ele, j) => {
        if (
          (plantSearch1 !== "" &&
            ele["WERKS"].toLowerCase().includes(plantSearch1)) ||
          (plantSearch2 !== "" &&
            ele["NAME1"].toLowerCase().includes(plantSearch2))
        ) {
          return ele;
        }
      });
      setplantSearchedfiltered(new_data);
    }
  }, [plantSearch1, plantSearch2]);

  let openPlantSearchModal = () => {
    setIsPlantModalVisible(true);
    setplantSearch1("");
    setplantSearch2("");
    setplantSearchedfiltered(allOrderSupplyingPlants);
  };

  useEffect(() => {
    if (isPlantModalVisible) {
      plantSearchRef.current.focus();
    }
  }, [isPlantModalVisible]);

  //++++++++++++++++++++++++++++++++++++++++++++++searchSysytem+++++++++++++++++++++++++++++++++++++++++++++++++++

  //++++++++++++++++++++++++++++++++++++++++++++++++++++++++++fetching delivery list++++++++++++++++++++++++++++++++++++++
  let fetchDeliveryList = () => {
    if (
      moment(watchAllFields.delivery_date_to).diff(
        watchAllFields.delivery_date_from,
        "days"
      ) > 31
    ) {
      Swal.fire({
        title: "Error",
        text: "Date should be within 31 days",
        icon: "error",
      });
    } else if (
      moment(watchAllFields.delivery_date_to).diff(
        watchAllFields.delivery_date_from,
        "days"
      ) < 0
    ) {
      Swal.fire({
        title: "Error",
        text: "Date should be within 31 days",
        icon: "error",
      });
    } else {
      setLoadingTable(false);
      props.loading(true);
      let body = {
        lv_user: localStorage.getItem("user_code"),
      };
      if (watchAllFields.delivery_from) {
        body["delivery_from"] = watchAllFields.delivery_from;
        body["delivery_to"] = watchAllFields.delivery_from;
      }
      if (watchAllFields.delivery_to && watchAllFields.delivery_from) {
        body["delivery_from"] = watchAllFields.delivery_from;
        body["delivery_to"] = watchAllFields.delivery_to;
      }
      if (
        watchAllFields.delivery_date_from &&
        watchAllFields.delivery_date_to
      ) {
        body["delivery_date_from"] = moment(
          watchAllFields.delivery_date_from
        ).format("YYYYMMDD");
        body["delivery_date_to"] = moment(
          watchAllFields.delivery_date_to
        ).format("YYYYMMDD");
      }
      if (Object.keys(plantValue).length > 0) {
        body["plant"] = plantValue?.value;
      }
      body["pgi"] = watchAllFields.pgi;
      setPGI(watchAllFields.pgi);
      console.log(body);
      http
        .post(apis.FETCH_DELIVERY, body)
        .then((result) => {
          if (result.data.status) {
            let data = result.data.result;

            if (data?.length > 0) {
              let x = data.slice(0, perPage);

              let ISSUE_QTY = 0;
              let Freight = 0;

              x.forEach((resp) => {
                ISSUE_QTY += +resp.ISSUE_QTY;
                Freight += +resp.FREIGHT;
              });

              setPageDeliveryList({
                ISSUE_QTY: ISSUE_QTY,
                FREIGHT: Freight,
              });
            }

            setDeliveryData(result.data.result);
            setSelectedDelivery([]);
            setActivePgi(watchAllFields.pgi);
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
          fetchDeliveryList();
         
        })
        .finally(() => {
          props.loading(false);
          setLoadingTable(true);
        });
    }
  };

  var pageChange = ({ selected }) => {
    setPaginatedDeliverydata(
      deliveryData.slice(selected * perPage, perPage * (selected + 1))
    );

    // console.log(deliveryData.slice(selected * perPage, perPage * (selected + 1)));

    let x = deliveryData.slice(selected * perPage, perPage * (selected + 1));

    let ISSUE_QTY = 0;
    let Freight = 0;

    x.forEach((resp) => {
      ISSUE_QTY += +resp.ISSUE_QTY;
      Freight += +resp.FREIGHT;
    });

    setPageDeliveryList({
      ISSUE_QTY: ISSUE_QTY,
      FREIGHT: Freight,
    });
  };

  useEffect(() => {
    pageChange({ selected: 0 });
  }, [perPage, deliveryData]);
  //++++++++++++++++++++++++++++++++++++++++++++++++++++++++++fetching delivery list end++++++++++++++++++++++++++++++++++++++

  let onSubmit = (data) => {
    fetchDeliveryList();
  };

  //+++++++++++++++++++++++++++++++++++++++++++++++++++++++++other handlers++++++++++++++++++++++++++++++++++++++++++++++
  useEffect(() => {
    if (watchAllFields.delivery_to) {
      triggerValidation("delivery_to");
    }
  }, [watchAllFields.delivery_from]);

  useEffect(() => {
    if (watchAllFields.delivery_from) {
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

  //+++++++++++++++++++++++++++++++++++++++++++++++++++++++++select delivery++++++++++++++++++++++++++++++++++++++++++++++++

  let insertIntoSelectedDelivery = (row) => {
    if (activePgi === "before") {
      //before pgi
      if (row.DELIVERY_DATE === today.format("DD-MM-YYYY")) {
        let arr = [...selectedDelivery];
        for (let i = 0; i < arr.length; i++) {
          if (arr[i] === row.DELIVERY_NO) {
            arr.splice(i, 1);
            setSelectedDelivery(arr);
            return;
          }
        }
        arr.push(row.DELIVERY_NO);
        setSelectedDelivery(arr);
      } else {
        Swal.fire({
          title: "Error!",
          text: "PGI can not be created for previous date.",
          icon: "error",
          confirmButtonText: "Ok",
        });
      }
    } else {
      //for after pgi
      let arr = [...selectedDelivery];
      for (let i = 0; i < arr.length; i++) {
        if (arr[i] === row.DELIVERY_NO) {
          arr.splice(i, 1);
          setSelectedDelivery(arr);
          return;
        }
      }
      arr.push(row.DELIVERY_NO);
      setSelectedDelivery(arr);
    }
  };

  let createPGIResponseData = (data) => {
    let deliveryData = data.EX_PGI_RETURN;
    let shipmentData = data.EX_SHIPMENT_RETURN;
    let invoiceData = data?.EX_INVOICE_RETURN;
    let arr = [];

    for (let i = 0; i < deliveryData.length; i++) {
      let deliveryMessage =
        deliveryData.length !== 0 ? deliveryData[i].MESSAGE : "";
      let shipmentMessage =
        shipmentData.length !== 0 ? shipmentData[i].MESSAGE : "";
      let invoiceMessage = invoiceData?.length ? invoiceData[i].MESSAGE : "";
      arr.push({ deliveryMessage, shipmentMessage, invoiceMessage });
    }

    console.log(arr, "Hello");
    setPgiResponse(arr);
  };

  const checkStatusPGI = async () => {
    // check multiple pgi status here
    try {
      props.loading(true);
      const FRONT_GUID = JSON.parse(localStorage.getItem("FRONT_GUID"))
        ? JSON.parse(localStorage.getItem("FRONT_GUID"))
        : [];

      const request = FRONT_GUID.map((resp) => {
        return http.post(apis.COMMON_POST_WITH_FM_NAME, {
          fm_name: "ZRFC_PGI_STATUS",
          params: {
            IM_GUID: resp,
          },
        });
      });

      const response = await Promise.all(request);
      // set empty the request variable
      request.length = 0;

      let arr = [];

      response.forEach(async (resp) => {
        if (resp.data.result.EX_STATUS !== "P") {
          arr.push(resp.data.result);
        }
      });

      let pgiResponse = [];

      if (arr.length === response.length) {
        // create pgi response
        for (let i = 0; i < arr.length; i++) {
          if (arr[i].EX_PGI_STATUS !== "P") {
            let deliveryMessage = arr[i].EX_MESSAGE1;
            let shipmentMessage = arr[i].EX_MESSAGE2;
            let invoiceMessage = arr[i].EX_MESSAGE3;

            let obj = { deliveryMessage, shipmentMessage, invoiceMessage };
            pgiResponse.push(obj);
          }
        }
        setPgiResponse(pgiResponse);
        setCurrentState("2");
      } else {
        await sleep(3000);
        checkStatusPGI();
      }
    } catch (error) {
      checkStatusPGI();
    } finally {
      props.loading(false);
    }
  };

  // Sleep function
  function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  let createPGI = () => {
    props.loading(true);

    let FRONT_GUID = selectedDelivery.map((resp) => {
      return uuidv4();
    });

    localStorage.setItem("FRONT_GUID", JSON.stringify(FRONT_GUID));

    http
      .post(apis.COMMON_POST_WITH_FM_NAME, {
        fm_name: "ZRFC_CREATE_PGI",
        params: {
          IM_VBELN: selectedDelivery.map((ele, i) => {
            return {
              VBELN: ele,
              FRONT_GUID: FRONT_GUID[i],
            };
          }),
          IM_LOGIN_ID: localStorage.getItem("user_code"),
        },
      })
      .then((result) => {
        if (result.data.status) {
          setPgiResponse(result.data.result);
          createPGIResponseData(result.data.result);
          setCurrentState("2");
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
        checkStatusPGI();
      })
      .finally(() => {
        props.loading(false);
      });
  };

  let createInvoice = () => {
    let st = "";
    for (let i = 0; i < selectedDelivery.length; i++) {
      st = st + selectedDelivery[i] + ",";
    }
    st = st.slice(0, -1);
    history.push("/dashboard/finance/invoice-create?deliveryIds=" + st);
  };

  //++++++++++++++++++++++++++++++++++++++++++++++++++select delivery end++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

  // Header
  let headers = [
    { label: "Sales Organization", key: "VKORG" },
    { label: "Delivery", key: "DELIVERY_NO" },
    { label: "Delivery Date", key: "DELIVERY_DATE" },
    { label: "Customer", key: "CUSTOMER" },
    { label: "Customer Name", key: "CUSTOMER_NAME" },
    { label: "Material", key: "MATERIAL" },
    { label: "Material Description", key: "MATERIAL_DESC" },
    { label: "Qty(Mt.)", key: "ISSUE_QTY" },
    { label: "Sold to Party T Zone", key: "SOLD_TO_ZONEDESC" },
    { label: "Ship to Party", key: "SHIP_TO_PARTY" },
    { label: "Ship to Name", key: "SHIP_TO_NAME" },
    { label: "Ship to Party T Zone", key: "SHIP_TO_ZONEDESC" },
    { label: "Transporter Zone", key: "TRANSPORTER_NAME" },
    { label: "Actual PGI Date", key: "CHALLAN_DATE" },
    { label: "Shipping Point", key: "SHIPPING_POINT" },
    { label: "Invoice No", key: "INVOICE_NO" },
    { label: "LR", key: "LR" },
    { label: "Freight", key: "FREIGHT" },
    { label: "Inco1", key: "INCO1" },
    { label: "Loading Point", key: "LSTEL_DESC" },
    { label: "Shipping Type", key: "SHIP_TYPE" },
    { label: "Shipment Number", key: "TKNUM" },
    { label: "Shipping Type Description", key: "SHIP_TYPE_DESC" },
    { label: "Vehicle Number", key: "TRUCK_NO" },
  ];

  // Fix Date Format//
  useEffect(() => {
    let data = deliveryData;
    for (let i = 0; i < data.length; i++) {
      data[i].DELIVERY_DATE = moment(data[i].DELIVERY_DATE, "YYYYMMDD").format(
        "DD-MM-YYYY"
      );
      data[i].MATERIAL = data[i].MATERIAL.replace(/^0+/, "");
      data[i].CHALLAN_DATE = moment(data[i].CHALLAN_DATE, "YYYYMMDD").format(
        "DD-MM-YYYY"
      );
    }
  }, [deliveryData]);

  // Plant

  const [plantOptions, setPlantOptions] = useState([]);
  const [plantValue, setPlantValue] = useState([]);

  useEffect(() => {
    setPlantOptions(filterOptions(allOrderSupplyingPlants, "WERKS", "NAME1"));
  }, [allOrderSupplyingPlants]);

  // Common Handle Change
  const commonHandleChange = (data, filedName) => {
    console.log(data, filedName);
    if (filedName === "PLANT") {
      setPlantValue(data);
    }
  };

  return (
    <>
      {currentState === "1" ? (
        <div>
          {/* <div className="row" style={{ backgroundColor: "green" }}>
                        <span style={{ color: "#fff", padding: "5px 40px", fontSize: "10px" }}>Goods Received date should not be less than 7 days from the current date- ZPD_MSG-050</span>
                    </div> */}

          {/* Filter Section Open */}

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
                          //triggerValidation("delivery_to");
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
                          let ans = true;
                          if (watchAllFields.delivery_from) {
                            if (
                              parseInt(value) >=
                              parseInt(watchAllFields.delivery_from)
                            ) {
                              ans = true;
                            }
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
                      placeholder="From"
                      name="delivery_date_from"
                      ref={register({
                        validate: (value) => {
                          let ans = false;
                          if (watchAllFields.delivery_date_to) {
                            if (
                              moment(
                                watchAllFields.delivery_date_from
                              ).isBefore(
                                moment(watchAllFields.delivery_date_to)
                              ) ||
                              moment(watchAllFields.delivery_date_from).isSame(
                                moment(watchAllFields.delivery_date_to)
                              )
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
                      <p className="form-error">Please put a valid value</p>
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
                              moment(
                                watchAllFields.delivery_date_from
                              ).isBefore(
                                moment(watchAllFields.delivery_date_to)
                              ) ||
                              moment(watchAllFields.delivery_date_from).isSame(
                                moment(watchAllFields.delivery_date_to)
                              )
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
                      <p className="form-error">Please put a valid value</p>
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
                      Plant<span>*</span>
                    </label>
                  </div>
                  <div className="col-9">
                    <i
                      className="far fa-clone click-icons"
                      onClick={() => {
                        openPlantSearchModal();
                      }}
                    ></i>

                    <Select
                      classNamePrefix="react-select"
                      value={
                        Object.keys(plantValue).length > 0 ? plantValue : []
                      }
                      options={plantOptions}
                      name="PLANT"
                      ref={register}
                      cacheOptions
                      defaultOptions
                      placeholder={"Plant"}
                      onChange={(e) => commonHandleChange(e, "PLANT")}
                    />

                    {errors.plant && (
                      <p className="form-error">This field is required</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="col">
                <div className="row">
                  <div className="col-1">
                    <div className="center">
                      <label className="label">
                        <input
                          className="label__checkbox"
                          type="radio"
                          name="pgi"
                          value="before"
                          ref={register({
                            required: true,
                          })}
                        />
                        <span className="label__text">
                          <span className="label__check">
                            <i className="fa fa-check icon"></i>
                          </span>
                        </span>
                      </label>
                    </div>
                  </div>
                  <div className="col-2">
                    <label className="">
                      Before PGI<span>*</span>
                    </label>
                  </div>

                  <div className="col-1">
                    <div className="center">
                      <label className="label">
                        <input
                          className="label__checkbox"
                          type="radio"
                          name="pgi"
                          value="after"
                          ref={register({
                            required: true,
                          })}
                        />
                        <span className="label__text">
                          <span className="label__check">
                            <i className="fa fa-check icon"></i>
                          </span>
                        </span>
                      </label>
                    </div>
                  </div>
                  <div className="col-2">
                    <label className="">
                      After PGI<span>*</span>
                    </label>
                  </div>
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
                      <button
                        type="submit"
                        className="search-button float-right"
                      >
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
                      <div className="col">
                        {selectedDelivery.length > 0 ? (
                          activePgi === "before" ? (
                            <Button
                              onClick={createPGI}
                              className="goods-button float-right"
                              style={{ backgroundColor: "#0F6FA2" }}
                              to="#"
                            >
                              PGI
                            </Button>
                          ) : (
                            <Button
                              onClick={createInvoice}
                              className="goods-button float-right"
                              style={{ backgroundColor: "#0F6FA2" }}
                              to="#"
                            >
                              Generate Invoice
                            </Button>
                          )
                        ) : null}

                        {/* {selectedDelivery.length === 1 ? (
                          <Link
                            className="goods-button float-right"
                            style={{ backgroundColor: "#0F6FA2" }}
                            to={`/dashboard/delivery/edit/${selectedDelivery.}`}
                          >
                            Edit
                          </Link>
                        ) : null} */}

                        {deliveryData.length > 0 ? (
                          <CSVLink
                            className="goods-button float-right"
                            style={{ backgroundColor: "#0F6FA2" }}
                            data={deliveryData}
                            headers={headers}
                            filename={`Delivery List -${getValues(
                              "plant"
                            )}-- ${pgi} PGI -From - ${getValues(
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
                        <th className="table-sticky-vertical">
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
                            left: "0px",
                            zIndex: "15",
                          }}
                          scope="col"
                        >
                          Sales Organization
                        </th>

                        <th
                          style={{
                            minWidth: "110px",
                            left: "160px",
                            zIndex: "10",
                          }}
                          scope="col"
                          className="table-th table-sticky-horizontal table-sticky-vertical"
                        >
                          Delivery #
                        </th>

                        <th
                          style={{
                            minWidth: "160px",
                            left: "272px",
                            zIndex: "10",
                          }}
                          scope="col"
                          className="table-th table-sticky-horizontal table-sticky-vertical"
                        >
                          Delivery Date
                        </th>

                        <th
                          style={{ minWidth: "110px" }}
                          scope="col"
                          className="table-sticky-vertical"
                        >
                          Customer #
                        </th>
                        <th
                          style={{ minWidth: "210px" }}
                          scope="col"
                          className="table-sticky-vertical"
                        >
                          Customer Name
                        </th>
                        <th
                          style={{ minWidth: "110px" }}
                          scope="col"
                          className="table-sticky-vertical"
                        >
                          Material #
                        </th>
                        <th
                          style={{ minWidth: "210px" }}
                          scope="col-3"
                          className="table-sticky-vertical"
                        >
                          Material Description
                        </th>
                        <th
                          style={{ minWidth: "110px" }}
                          scope="col"
                          className="table-sticky-vertical"
                        >
                          Qty(Mt)
                        </th>

                        <th
                          style={{ minWidth: "210px" }}
                          scope="col"
                          className="table-sticky-vertical"
                        >
                          SOLD TO PARTY T ZONE
                        </th>
                        <th
                          style={{ minWidth: "110px" }}
                          scope="col"
                          className="table-sticky-vertical"
                        >
                          SHIP TO PARTY
                        </th>
                        <th
                          style={{ minWidth: "210px" }}
                          scope="col"
                          className="table-sticky-vertical"
                        >
                          SHIP TO NAME
                        </th>

                        <th
                          style={{ minWidth: "210px" }}
                          scope="col"
                          className="table-sticky-vertical"
                        >
                          SHIP TO PARTY T ZONE
                        </th>
                        <th
                          style={{ minWidth: "110px" }}
                          scope="col"
                          className="table-sticky-vertical"
                        >
                          TRANSPORTER NAME
                        </th>
                        <th
                          style={{ minWidth: "160px" }}
                          scope="col-3"
                          className="table-sticky-vertical"
                        >
                          ACTUAL PGI DATE
                        </th>
                        <th
                          style={{ minWidth: "110px" }}
                          scope="col"
                          className="table-sticky-vertical"
                        >
                          SHIPPING POINT
                        </th>

                        <th
                          style={{ minWidth: "110px" }}
                          scope="col"
                          className="table-sticky-vertical"
                        >
                          INVOICE NO
                        </th>
                        <th
                          style={{ minWidth: "110px" }}
                          scope="col"
                          className="table-sticky-vertical"
                        >
                          LR
                        </th>
                        <th
                          style={{ minWidth: "110px" }}
                          scope="col-3"
                          className="table-sticky-vertical"
                        >
                          FREIGHT
                        </th>
                        <th
                          style={{ minWidth: "110px" }}
                          scope="col"
                          className="table-sticky-vertical"
                        >
                          INCO1
                        </th>
                        <th
                          style={{ minWidth: "150px" }}
                          scope="col"
                          className="table-sticky-vertical"
                        >
                          LOADING POINT
                        </th>
                        <th
                          style={{ minWidth: "150px" }}
                          scope="col"
                          className="table-sticky-vertical"
                        >
                          SHIPPING TYPE
                        </th>
                        <th
                          style={{ minWidth: "210px" }}
                          scope="col"
                          className="table-sticky-vertical"
                        >
                          SHIPPING TYPE DESCRIPTION
                        </th>
                        {pgi === "after" ? (
                          <th
                            style={{
                              minWidth: "110px",
                              left: "0px",
                              zIndex: "10",
                            }}
                            scope="col"
                            className="table-sticky-vertical"
                          >
                            Shipment Number
                          </th>
                        ) : null}
                        <th
                          style={{ minWidth: "210px" }}
                          scope="col"
                          className="table-sticky-vertical"
                        >
                          VEHICLE NUMBER
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {!loadingTable ? (
                        <div className="loader-div">
                          <Loader
                            type="Oval"
                            color="#00BFFF"
                            height={60}
                            width={60}
                            // timeout={3000} //3 secs
                          />
                        </div>
                      ) : (
                        paginatedDeliveryData.map((ele, i) => (
                          <tr
                            key={ele.DELIVERY_NO}
                            className={
                              ele.INVOICE_FLAG === "X" ? "gray-tr" : ""
                            }
                          >
                            <td>
                              {ele.INVOICE_FLAG !== "X" ? (
                                <label className="label table-checkbox">
                                  <input
                                    className="table__checkbox"
                                    type="checkbox"
                                    name={`check${i}`}
                                    onChange={(e) =>
                                      insertIntoSelectedDelivery(ele)
                                    }
                                    checked={selectedDelivery.includes(
                                      ele.DELIVERY_NO
                                    )}
                                    disabled={ele.INVOICE_FLAG === "X"}
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
                              style={{
                                zIndex: "8",
                                left: "0px",
                                minWidth: "160px",
                              }}
                              className="table-sticky-horizontal"
                            >
                              {ele.VKORG}
                            </td>
                            <td
                              style={
                                ele.INVOICE_FLAG === "X"
                                  ? {
                                      backgroundColor: "rgb(236,236,236)",
                                      zIndex: "8",
                                      left: "160px",
                                    }
                                  : { zIndex: "8", left: "160px" }
                              }
                              className="table-sticky-horizontal"
                            >
                              {pgi === "before" ? (
                                <Link
                                  to={`/dashboard/delivery/edit/${ele.DELIVERY_NO}`}
                                  target="_blank"
                                >
                                  {ele.DELIVERY_NO}
                                </Link>
                              ) : (
                                <p>{ele.DELIVERY_NO}</p>
                              )}
                            </td>
                            <td
                              style={
                                ele.INVOICE_FLAG === "X"
                                  ? {
                                      backgroundColor: "rgb(236,236,236)",
                                      zIndex: "8",
                                      left: "272px",
                                    }
                                  : { zIndex: "8", left: "272px" }
                              }
                              className="table-sticky-horizontal"
                            >
                              {ele.DELIVERY_DATE}
                            </td>
                            <td>{ele.CUSTOMER}</td>
                            <td>{ele.CUSTOMER_NAME}</td>
                            <td>{ele.MATERIAL.replace(/^0+/, "")}</td>
                            <td>{ele.MATERIAL_DESC}</td>
                            <td>{ele.ISSUE_QTY}</td>
                            <td>{ele.SOLD_TO_ZONEDESC}</td>
                            <td>{ele.SHIP_TO_PARTY}</td>
                            <td>{ele.SHIP_TO_NAME}</td>
                            <td>{ele.SHIP_TO_ZONEDESC}</td>
                            <td>{ele.TRANSPORTER_NAME}</td>
                            <td>{ele.CHALLAN_DATE}</td>
                            <td>{ele.SHIPPING_POINT}</td>
                            <td>{ele.INVOICE_NO}</td>
                            <td>{ele.LR}</td>
                            <td>{ele.FREIGHT}</td>
                            <td>{ele.INCO1}</td>
                            <td>{ele.LSTEL_DESC}</td>
                            <td>{ele.SHIP_TYPE}</td>
                            <td>{ele.SHIP_TYPE_DESC}</td>
                            {pgi === "after" ? <td>{ele.TKNUM}</td> : null}
                            <td>{ele.TRUCK_NO}</td>
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
              pageCount={deliveryData.length / perPage}
              marginPagesDisplayed={2}
              pageRangeDisplayed={5}
              onPageChange={pageChange}
              containerClassName={"pagination"}
              subContainerClassName={"pages pagination"}
              activeClassName={"active"}
              initialPage={0}
            />

            <div className="col-1">
              <label className="float-left" style={{ paddingTop: "12px" }}>
                Visible Rows
              </label>
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
            Qty(Mt): <span>{pageDeliveryList.ISSUE_QTY.toFixed(2)}</span>&emsp;
            &emsp; Freight: <span>{pageDeliveryList.FREIGHT.toFixed(2)}</span>
          </div>

          {/* plant modal */}
          <Modal
            show={isPlantModalVisible}
            size="lg"
            centered
            className="modal"
            onHide={() => setIsPlantModalVisible(false)}
          >
            <Modal.Header closeButton>
              <Modal.Title>Select Plant</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <div className="input-area-modal">
                Plant Number
                <input
                  type="text"
                  className="model-input"
                  onChange={(e) => {
                    setplantSearch1(e.target.value.toLowerCase());
                  }}
                  value={plantSearch1}
                  ref={plantSearchRef}
                />
                <br />
                Plant Name
                <input
                  type="text"
                  className="model-input"
                  onChange={(e) => {
                    setplantSearch2(e.target.value.toLowerCase());
                  }}
                  value={plantSearch2}
                />
              </div>
              <div className="modal-div">
                <Table size="sm" className="modal-table">
                  <thead className="modal-thead">
                    <tr className="modal-table-tr">
                      <th className="modal-table-th float-center">
                        Plant Number
                      </th>
                      <th className="modal-table-th float-center">
                        Plant Name
                      </th>
                      <th className="modal-table-th float-center">Select</th>
                    </tr>
                  </thead>
                  <tbody className="modal-table-tbody">
                    {plantSearchedfiltered?.map((row, i) => (
                      <tr className="modal-table-tr" key={i}>
                        <td>{row["WERKS"].replace(/^0+/, "")}</td>
                        <td>{row["NAME1"]}</td>
                        <td className="modal-table-td">
                          <button
                            className="button search-button"
                            onClick={() => {
                              setSelectedPlant(row);
                              setWithValidationTrigger(
                                "plant",
                                row["WERKS"].replace(/^0+/, "") +
                                  "-" +
                                  row["NAME1"]
                              );
                              setIsPlantModalVisible(false);
                              setPlantValue({
                                value: row?.WERKS,
                                label: row?.WERKS + "-" + row?.NAME1,
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
                onClick={() => setIsPlantModalVisible(false)}
              >
                Close
              </Button>
            </Modal.Footer>
          </Modal>
          {/* plant modal close*/}
        </div>
      ) : (
        <div style={{ marginTop: "50px" }}>
          {pgiResponse.map((ele, i) => {
            return (
              <div key={i}>
                <div className={"row input-area"} key={i}>
                  {ele.deliveryMessage === "" ? null : (
                    <>
                      <img
                        className="success-img"
                        src="/images/success_tick.jpeg"
                        alt="Delivery"
                      />
                      &nbsp;&nbsp;
                      <span className="success-msg">
                        {/*  PGI is done for delivery number{" "} */}
                        {/* {selectedDelivery[i]} */}
                        {ele.deliveryMessage}
                      </span>
                    </>
                  )}
                </div>

                <div className={"row input-area"} key={i}>
                  {ele.shipmentMessage === "" ? null : (
                    <>
                      <img
                        className="success-img"
                        src="/images/success_tick.jpeg"
                        alt="Shipment"
                      />
                      &nbsp;&nbsp;
                      <span className="success-msg">
                        {/* &nbsp;&nbsp; PGI is done for delivery number{" "} */}
                        {ele.shipmentMessage}
                      </span>
                    </>
                  )}
                </div>

                <div className={"row input-area"} key={i}>
                  {ele?.invoiceMessage && (
                    <>
                      <img
                        className="success-img"
                        src="/images/success_tick.jpeg"
                        alt="Shipment"
                      />
                      &nbsp;&nbsp;
                      <span className="success-msg">
                        {/* &nbsp;&nbsp; PGI is done for delivery number{" "} */}
                        {ele.invoiceMessage}
                      </span>
                    </>
                  )}
                </div>
                <br />
                <br />
              </div>
            );
          })}

          <button
            style={{ position: "absolute", right: "50px", marginTop: "-60px" }}
            className="button button-foreword float-right"
            onClick={() => {
              window.location.reload();
            }}
          >
            Delivery List
          </button>
        </div>
      )}
    </>
  );
}

const mapStateToProps = (state) => ({
  Auth: state.Auth,
});

export default connect(mapStateToProps, { loading })(DeliveryList);
