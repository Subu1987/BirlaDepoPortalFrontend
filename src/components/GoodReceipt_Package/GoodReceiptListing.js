import React, { useEffect, useRef, useState } from "react";

import moment from "moment";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Table from "react-bootstrap/Table";
import { CSVLink } from "react-csv";
import { useForm } from "react-hook-form";
import ReactPaginate from "react-paginate";
import { connect } from "react-redux";
import Select from "react-select";
import Swal from "sweetalert2";
import { loading } from "../../actions/loadingAction";
import filterOptions from "../../Functions/filterData";
import usePlant from "../../hook/usePlant";
import http from "../../services/apicall";
import apis from "../../services/apis";
import { getLocalData } from "../../services/localStorage";

let today = moment();
let twodaysback = moment().subtract(2, "day");

function GoodReceiptList(props) {
  const [goodReceiptData, setGoodReceiptData] = useState([]);
  const [paginatedGoodReceiptData, setPaginatedGoodReceiptData] = useState([]);
  const [perPage, setPerpage] = useState(10);
  const [allOrderReceivingPlant, setAllOrderReceivingPlant] = useState([]);
  const [allShipType, setAllShipType] = useState([]);

  const [pageGoodReceipt, setPageGoodReceipt] = useState({
    GOOD: 0,
    CUT_TORN: 0,
    DAMAGED: 0,
    SHORTAGE: 0,
    TRANSIT: 0,
  });

  const [selectedPlant, setSelectedPlant] = useState(undefined);
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
      gr_date_from: twodaysback.format("YYYY-MM-DD"),
      gr_date_to: today.format("YYYY-MM-DD"),
    },
  });
  const watchAllFields = watch();

  //++++++++++++++++++++++++++++++++++++++++++++++searchSysytem plant+++++++++++++++++++++++++++++++++++++++++++++++++++
  const [plantSearch1, setplantSearch1] = useState("");
  const [plantSearch2, setplantSearch2] = useState("");
  const [plantSearchedfiltered, setplantSearchedfiltered] = useState([]);
  const [isPlantModalVisible, setIsPlantModalVisible] = useState(false);
  const plant = useRef(null);

  useEffect(() => {
    if (plantSearch1 !== "" || plantSearch2 !== "") {
      let new_data = allOrderReceivingPlant;
      new_data = new_data.filter((ele, j) => {
        if (
          (plantSearch1 !== "" &&
            ele["PLANT"].toLowerCase().includes(plantSearch1)) ||
          (plantSearch2 !== "" &&
            ele["PLANT_NAME"].toLowerCase().includes(plantSearch2))
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
    setplantSearchedfiltered(allOrderReceivingPlant);
  };

  //++++++++++++++++++++++++++++++++++++++++++++++searchSysytem+++++++++++++++++++++++++++++++++++++++++++++++++++

  //+++++++++++++++++++++++++++++++++++++++++++++fetch ship type and receiving plant++++++++++++++++++++++++
  let fetchShipType = () => {
    props.loading(true);
    http
      // .post(apis.FETCH_SHIP_TYPE_FOR_GR, {})

      .post(apis.SHIPPING_TYPE_MAINTAINED_TABLE, {
        // TABLE: "SHIPPING_TYPE",
        params: {
          PLANT: "0000",
          MATERIAL: "00000",
        },
      })
      .then((result) => {
        if (result.data.status) {
          // setAllShipType(result.data.data);
          // setLocalData("ship-type", result.data.data);
          console.log(result.data.result);
          let data = result.data.result;
          data = data.map((ele) => {
            return {
              SHIP_TYPE: ele.VSART,
              SHIP_TYPE_DESCT: ele.BEZEI,
            };
          });
          setAllShipType(data);
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
        fetchShipType();
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
  //       fetchReceivingPlant();
  //     })
  //     .finally(() => {
  //       props.loading(false);
  //     });
  // };

  useEffect(() => {
    if (getLocalData("ship-type").length > 0) {
      setAllShipType(getLocalData("ship-type"));
    } else {
      fetchShipType();
    }

    // if (getLocalData("gr-plants")?.length > 0) {
    //   setAllOrderReceivingPlant(getLocalData("gr-plants"));
    // } else {
    //   fetchReceivingPlant();
    // }
  }, []);

  const plants = usePlant();

  useEffect(() => {
    if (plants.length > 0) {
      setAllOrderReceivingPlant(
        plants.map((ele) => {
          return {
            PLANT: ele.WERKS,
            PLANT_NAME: ele.NAME1,
          };
        })
      );
    }
  }, [plants]);

  //+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

  //+++++++++++++++++++++++++++++++++++++fetch GR list++++++++++++++++++++++++
  let onSubmit = (data) => {
    fetchGrList();
  };

  let fetchGrList = () => {
    props.loading(true);
    let body = {};

    body["gr_date_from"] = moment(watchAllFields.gr_date_from).format(
      "YYYYMMDD"
    );
    body["gr_date_to"] = moment(watchAllFields.gr_date_to).format("YYYYMMDD");
    body["receiving_plant"] = plantValue?.value;
    if (watchAllFields.ship_type && watchAllFields.ship_type !== "select") {
      body["ship_type"] = watchAllFields.ship_type;
    }
    http
      .post(apis.FETCH_GR_LISTING, body)
      .then((result) => {
        if (result.data.status) {
          console.log(result.data.data);
          setGoodReceiptData(result.data.data);

          let data = result.data.data;

          if (data?.length > 0) {
            let x = data.slice(0, perPage);

            let GOOD = 0;
            let CUT_TORN = 0;
            let DAMAGED = 0;
            let SHORTAGE = 0;
            let TRANSIT = 0;

            x.forEach((resp) => {
              GOOD += +resp.GOOD;
              CUT_TORN += +resp.CUT_TORN;
              DAMAGED += +resp.DAMAGED;
              SHORTAGE += +resp.SHORTAGE;
              TRANSIT += +resp.TRANSIT;
            });

            setPageGoodReceipt({
              GOOD: GOOD,
              CUT_TORN: CUT_TORN,
              DAMAGED: DAMAGED,
              SHORTAGE: SHORTAGE,
              TRANSIT: TRANSIT,
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
        fetchGrList();
      })
      .finally(() => {
        props.loading(false);
      });
  };
  //++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

  //++++++++++++++++++++++++++page changer+++++++++++++++++++++++++++++++++++++++++++++++
  let pageChange = ({ selected }) => {
    console.log(selected);
    setPaginatedGoodReceiptData(
      goodReceiptData.slice(selected * perPage, perPage * (selected + 1))
    );

    let x = goodReceiptData.slice(selected * perPage, perPage * (selected + 1));

    let GOOD = 0;
    let CUT_TORN = 0;
    let DAMAGED = 0;
    let SHORTAGE = 0;
    let TRANSIT = 0;

    x.forEach((resp) => {
      GOOD += +resp.GOOD;
      CUT_TORN += +resp.CUT_TORN;
      DAMAGED += +resp.DAMAGED;
      SHORTAGE += +resp.SHORTAGE;
      TRANSIT += +resp.TRANSIT;
    });

    setPageGoodReceipt({
      GOOD: GOOD,
      CUT_TORN: CUT_TORN,
      DAMAGED: DAMAGED,
      SHORTAGE: SHORTAGE,
      TRANSIT: TRANSIT,
    });
  };
  useEffect(() => {
    pageChange({ selected: 0 });
  }, [perPage, goodReceiptData]);
  //+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

  //++++++++++++++++++++++++++++++++++++++++custom validation trigger++++++++++++++
  useEffect(() => {
    triggerValidation("gr_date_to");
  }, [watchAllFields.gr_date_from]);

  useEffect(() => {
    triggerValidation("gr_date_from");
  }, [watchAllFields.gr_date_to]);

  let setWithValidationTrigger = (key, value) => {
    setValue(key, value);
    triggerValidation(key);
  };
  //+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

  // Headers
  let headers = [
    { label: "Sales Organization", key: "VKORG" },
    { label: "Receiving Date", key: "RECEIVING_DATE" },
    { label: "Delivery", key: "DELIVERY" },
    { label: "Delivery Date", key: "DELIVERY_DATE" },
    { label: "Material", key: "MATERIAL" },
    { label: "Material Description", key: "MATERIAL_DESC" },
    { label: "Shipped Qty.", key: "SHIPPED_QTY" },
    { label: "Good (MT)", key: "GOOD" },
    { label: "Cut and Torn (MT)", key: "CUT_TORN" },
    { label: "Damaged (MT)", key: "DAMAGED" },
    { label: "Shortage (MT)", key: "SHORTAGE" },
    { label: "Transit (MT)", key: "TRANSIT" },
    { label: "Ship. Type", key: "SHIP_TYPE_DESC" },
    { label: "Wagon/Truck", key: "WAGON_TRUCK" },
    { label: "Issuing Plant", key: "ISSUING_PLANT" },
    { label: "Transporter Name", key: "TRANSPORTER_NAME" },
    { label: "Bill of Lading", key: "BILL_OF_LADING" },
  ];

  // Fix Date Format//
  useEffect(() => {
    let data = goodReceiptData;
    for (let i = 0; i < data.length; i++) {
      data[i].RECEIVING_DATE = moment(
        data[i].RECEIVING_DATE,
        "YYYYMMDD"
      ).format("DD-MM-YYYY");
      data[i].MATERIAL = data[i].MATERIAL.replace(/^0+/, "");
      data[i].DELIVERY_DATE = moment(data[i].DELIVERY_DATE, "YYYYMMDD").format(
        "DD-MM-YYYY"
      );
    }
  }, [goodReceiptData]);

  // Plant

  const [plantOptions, setPlantOptions] = useState([]);
  const [plantValue, setPlantValue] = useState([]);

  useEffect(() => {
    setPlantOptions(
      filterOptions(allOrderReceivingPlant, "PLANT", "PLANT_NAME")
    );
  }, [allOrderReceivingPlant]);

  // Common Handle Change
  const commonHandleChange = (data, filedName) => {
    console.log(data, filedName);
    if (filedName === "PLANT") {
      setPlantValue(data);
    }
  };

  return (
    <div>
      <form className="filter-section" onSubmit={handleSubmit(onSubmit)}>
        <div className="row">
          <div className="col">
            <div className="row">
              <div className="col-3">
                <label>Ship Type</label>
              </div>
              <div className="col-9">
                <i className="fas fa-angle-down icons"></i>
                <select
                  key={allShipType}
                  className="order-select"
                  name="ship_type"
                  ref={register({
                    required: true,
                  })}
                >
                  <option key="0" value="select">
                    select an option
                  </option>
                  {allShipType.map((ele, i) => (
                    <option key={i} value={ele.SHIP_TYPE}>
                      {ele.SHIP_TYPE} - {ele.SHIP_TYPE_DESCT}
                    </option>
                  ))}
                </select>
                {errors.ship_type && (
                  <p className="form-error">This field is required</p>
                )}
              </div>
            </div>
          </div>

          <div className="col">
            <div className="row">
              <div className="col-3">
                <label className="float-right">
                  GR Date From<span>*</span>
                </label>
              </div>
              <div className="col-3">
                <input
                  type="date"
                  placeholder="From"
                  name="gr_date_from"
                  ref={register({
                    validate: (value) => {
                      let ans = false;
                      if (watchAllFields.gr_date_to) {
                        if (
                          (moment(watchAllFields.gr_date_from).isBefore(
                            moment(watchAllFields.gr_date_to)
                          ) ||
                            moment(watchAllFields.gr_date_from).isSame(
                              moment(watchAllFields.gr_date_to)
                            )) &&
                          moment(watchAllFields.gr_date_to).diff(
                            moment(watchAllFields.gr_date_from),
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
                {errors.gr_date_from && (
                  <p className="form-error">Date should be within 31 days</p>
                )}
              </div>
              <div className="col-3">
                <label className="float-right">
                  GR Date To<span>*</span>
                </label>
              </div>
              <div className="col-3">
                <input
                  type="date"
                  name="gr_date_to"
                  ref={register({
                    validate: (value) => {
                      let ans = false;
                      if (watchAllFields.gr_date_from) {
                        if (
                          (moment(watchAllFields.gr_date_from).isBefore(
                            moment(watchAllFields.gr_date_to)
                          ) ||
                            moment(watchAllFields.gr_date_from).isSame(
                              moment(watchAllFields.gr_date_to)
                            )) &&
                          moment(watchAllFields.gr_date_to).diff(
                            moment(watchAllFields.gr_date_from),
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
                {/* <input
                  type="text"
                  ref={register({
                    required: true,
                  })}
                  name="receiving_plant"
                  onChange={(e) => {
                    setSelectedPlant({
                      PLANT: e.target.value,
                    });
                    setWithValidationTrigger("receiving_plant", e.target.value);
                  }}
                /> */}
                {/* <Controller
                  as={ */}
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
              </div>
            </div>
          </div>
          <div className="col">
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
                    {/* <Link
                      className="goods-button float-right"
                      style={{ backgroundColor: "#59A948" }}
                      to="/dashboard/goods-receipt/create"
                    >
                      Form Entry
                    </Link> */}

                    {goodReceiptData.length > 0 ? (
                      <CSVLink
                        className="goods-button float-right"
                        style={{ backgroundColor: "#0F6FA2" }}
                        data={goodReceiptData}
                        headers={headers}
                        filename={`Good Receipt Listing- Plant-${getValues(
                          "receiving_plant"
                        )} From-${getValues("gr_date_from")} to ${getValues(
                          "gr_date_to"
                        )}.csv`}
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
                      className="table-sticky-vertical"
                      style={{ minWidth: "150px" }}
                      scope="col"
                    >
                      Receiving Date
                    </th>
                    <th
                      className="table-sticky-vertical table-sticky-horizontal"
                      style={{ minWidth: "110px", left: "160px", zIndex: "15" }}
                      scope="col"
                    >
                      Delivery
                    </th>
                    <th
                      className="table-sticky-vertical"
                      style={{ minWidth: "150px" }}
                      scope="col"
                    >
                      Delivery Date
                    </th>
                    <th
                      className="table-sticky-vertical"
                      style={{ minWidth: "110px" }}
                      scope="col"
                    >
                      Material
                    </th>
                    <th
                      className="table-sticky-vertical"
                      style={{ minWidth: "310px" }}
                      scope="col-3"
                    >
                      Material Description
                    </th>
                    <th
                      className="table-sticky-vertical"
                      style={{ minWidth: "110px" }}
                      scope="col"
                    >
                      Shipped QTY
                    </th>
                    <th
                      className="table-sticky-vertical"
                      style={{ minWidth: "150px" }}
                      scope="col"
                    >
                      Good (MT)
                    </th>
                    <th
                      className="table-sticky-vertical"
                      style={{ minWidth: "210px" }}
                      scope="col"
                    >
                      Cut and Torn (MT)
                    </th>
                    <th
                      className="table-sticky-vertical"
                      style={{ minWidth: "150px" }}
                      scope="col"
                    >
                      Damaged (MT)
                    </th>
                    <th
                      className="table-sticky-vertical"
                      style={{ minWidth: "150px" }}
                      scope="col"
                    >
                      Shortage (MT)
                    </th>
                    <th
                      className="table-sticky-vertical"
                      style={{ minWidth: "150px" }}
                      scope="col"
                    >
                      Transit (MT)
                    </th>
                    <th
                      className="table-sticky-vertical"
                      style={{ minWidth: "150px" }}
                      scope="col-3"
                    >
                      Ship. Type
                    </th>
                    <th
                      className="table-sticky-vertical"
                      style={{ minWidth: "150px" }}
                      scope="col"
                    >
                      Wagon/ Truck
                    </th>
                    <th
                      className="table-sticky-vertical"
                      style={{ minWidth: "110px" }}
                      scope="col"
                    >
                      Issuing Plant
                    </th>
                    <th
                      className="table-sticky-vertical"
                      style={{ minWidth: "210px" }}
                      scope="col"
                    >
                      Transporter Name
                    </th>
                    <th
                      className="table-sticky-vertical"
                      style={{ minWidth: "110px" }}
                      scope="col-3"
                    >
                      Bill Of Lading
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedGoodReceiptData.map((ele, i) => (
                    <tr key={ele.DELIVERY}>
                      <td
                        className={"table-sticky-horizontal"}
                        style={{ minWidth: "160px", left: "0px", zIndex: "10" }}
                      >
                        {ele.VKORG}
                      </td>
                      <td>{ele.RECEIVING_DATE}</td>
                      <td
                        className="table-sticky-horizontal"
                        style={{
                          minWidth: "110px",
                          left: "160px",
                          zIndex: "10",
                        }}
                      >
                        {ele.DELIVERY}
                      </td>
                      <td>{ele.DELIVERY_DATE}</td>
                      <td>{ele.MATERIAL}</td>
                      <td>{ele.MATERIAL_DESC}</td>
                      <td>{ele.SHIPPED_QTY}</td>
                      <td>{ele.GOOD}</td>
                      <td>{ele.CUT_TORN}</td>
                      <td>{ele.DAMAGED}</td>
                      <td>{ele.SHORTAGE}</td>
                      <td>{ele.TRANSIT}</td>
                      <td>{ele.SHIP_TYPE_DESC}</td>
                      <td>{ele.WAGON_TRUCK}</td>
                      <td>{ele.ISSUING_PLANT}</td>
                      <td>{ele.TRANSPORTER_NAME}</td>
                      <td>{ele.BILL_OF_LADING}</td>
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
          pageCount={goodReceiptData.length / perPage}
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
        Good (MT): <span>{pageGoodReceipt.GOOD.toFixed(2)}</span> &emsp; &emsp;
        Cut and Torn (MT): <span>{pageGoodReceipt.CUT_TORN.toFixed(2)}</span>{" "}
        &emsp; &emsp; Damaged (MT):{" "}
        <span>{pageGoodReceipt.DAMAGED.toFixed(2)}</span> &emsp; &emsp; Shortage
        (MT): <span>{pageGoodReceipt.SHORTAGE.toFixed(2)}</span> &emsp;
        &emsp;Transit (MT): <span>{pageGoodReceipt.TRANSIT.toFixed(2)}</span>{" "}
        &emsp; &emsp;
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
          <Modal.Title>Select Receiving Plant</Modal.Title>
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
                  <th className="modal-table-th float-center">Plant Number</th>
                  <th className="modal-table-th float-center">Plant Name</th>
                  <th className="modal-table-th float-center">Select</th>
                </tr>
              </thead>
              <tbody className="modal-table-tbody">
                {plantSearchedfiltered?.map((row, i) => (
                  <tr className="modal-table-tr" key={i}>
                    <td>{row["PLANT"].replace(/^0+/, "")}</td>
                    <td>{row["PLANT_NAME"]}</td>
                    <td className="modal-table-td">
                      <button
                        className="button search-button"
                        onClick={() => {
                          setSelectedPlant(row);
                          setWithValidationTrigger(
                            "receiving_plant",
                            row["PLANT"].replace(/^0+/, "") +
                              "-" +
                              row["PLANT_NAME"]
                          );
                          setIsPlantModalVisible(false);
                          setPlantValue({
                            value: row?.PLANT,
                            label: row?.PLANT + "-" + row?.PLANT_NAME,
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
  );
}

const mapStateToProps = (state) => ({
  Auth: state.Auth,
});

export default connect(mapStateToProps, { loading })(GoodReceiptList);
