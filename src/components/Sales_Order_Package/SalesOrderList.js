import React, { useState, useEffect } from "react";
import { connect } from "react-redux";
import { useHistory, Link } from "react-router-dom";
import { loading } from "../../actions/loadingAction";
import moment from "moment";
import _ from "lodash";
import apis from "../../services/apis";
import http from "../../services/apicall";
import SearchDialog from "./SearchDialogue";
import ReactPaginate from "react-paginate";
import SearchSoldToParty from "./soldToPart";
import Swal from "sweetalert2";
import Loader from "react-loader-spinner";
import { deliveryData } from "../../actions/deliveryAction";
import * as reactCsv from "react-csv";
import filterOptions from "../../Functions/filterData";
import Select from "react-select";
import AsyncSelect from "react-select/async";
import fetchCustomerNumber from "../../Functions/fetchCustomer";
import usePlant from "../../hook/usePlant";

let today = moment();
let twodaysback = moment().subtract(2, "day");

let default_config = {
  show: false,
  title: "",
  keys: [],
  labels: [],
  labelindex: [],
  field: "",
  data: [],
  keylabels: [],
  return_field_value: "",
  return_field_key: "",
};
function SalesOrderList(props) {
  const [selectedSoldtoParty, setSelectedSoldtoParty] = useState({});
  const [MATERIAL, setMATERIAL] = useState({});
  const [allMaterials, setAllMaterials] = useState([]);
  const [DOCUMENT_DATE, setDOCUMENT_DATE] = useState(
    twodaysback.format("YYYY-MM-DD")
  );
  const [DOCUMENT_DATE_TO, setDOCUMENT_DATE_TO] = useState(
    today.format("YYYY-MM-DD")
  );
  const [STATUS, setSTATUS] = useState("X");
  const [applyFilter, setApplyFilter] = useState(0);
  const [soldToPartyModalVisble, setsoldToPartyModalVisble] = useState(false);
  const [searchModalConfig, setSearchModalConfig] = useState({
    ...default_config,
  });
  const [currentState, setCurrentState] = useState("1");
  const [perPage, setPerpage] = useState(10);
  const [pageCount, setPageCount] = useState(10);
  const [page, setPage] = useState(0);
  const [salesOrders, setSaleOrders] = useState([]);
  const [pageSalesOrders, setPageSaleOrders] = useState({
    ORD_QTY: 0,
    PGI_DUE_QTY: 0,
    PGI_DONE_QTY: 0,
    BAL_QTY: 0,
  });
  const [paginatedSalesOrders, setPaginatedSalesOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState();
  const [allplants, setAllPlants] = useState([]);
  const [selectedPlant, setSelectedPlant] = useState({});
  const [loadingTable, setLoadingTable] = useState(true);
  const [status, setStatus] = useState("");
  const [orderType, setOrderType] = useState("");
  const [plantOptions, setPlantOptions] = useState([]);
  const [plantValue, setPlantValue] = useState([]);
  const [materialOptions, setMaterialOptions] = useState([]);
  const [materialValue, setMaterialValue] = useState([]);
  const [value, setval] = useState([]);

  let history = useHistory();

  useEffect(() => {
    if (Object.keys(plantValue).length > 0) {
      getMaterial();
    }
  }, [plantValue]);

  // ++++++++++++++++++++ plant +++++++++++++++++++//
  const plantHook = usePlant();

  useEffect(() => {
    if (plantHook.length > 0) {
      setAllPlants(plantHook);
    }
  }, [plantHook]);

  var getMaterial = () => {
    props.loading(true);
    http
      .post(apis.GET_ORDER_MATERIAL_OF_PLANT, { lv_plant: plantValue?.value })
      .then((resp) => {
        setAllMaterials(resp.data.result.IT_FINAL);
      })
      .catch(() => getMaterial())
      .finally(() => {
        props.loading(false);
      });
  };

  var pageChange = ({ selected }) => {
    setPage(selected * perPage);

    let x = salesOrders.slice(
      selected * perPage,
      perPage * selected + 1 * perPage
    );
    setPaginatedSalesOrders(x);

    // console.log(salesOrders.slice(selected * perPage, perPage * selected + 1 * perPage));
    let ORD_QTY = 0;
    let PGI_DUE_QTY = 0;
    let PGI_DONE_QTY = 0;
    let BAL_QTY = 0;
    x.forEach((resp) => {
      ORD_QTY += +resp.ORD_QTY;
      PGI_DUE_QTY += +resp.PGI_DUE_QTY;
      PGI_DONE_QTY += +resp.PGI_DONE_QTY;
      BAL_QTY += +resp.BAL_QTY;
    });

    setPageSaleOrders({
      ORD_QTY: ORD_QTY,
      PGI_DUE_QTY: PGI_DUE_QTY,
      PGI_DONE_QTY: PGI_DONE_QTY,
      BAL_QTY: BAL_QTY,
    });

    // console.log(paginatedSalesOrders);
  };

  let setSearchedValue = () => {
    //setMATERIAL(value);
  };
  var createDelivery = (e) => {
    e.preventDefault();
    history.push("/dashboard/delivery/create?orderid=" + selectedOrder);
    console.log("eeeeee");
  };
  const getSalesorders = () => {
    var body = {
      CUSTOMER_NUMBER: selectedSoldtoParty.KUNNR,
      MATERIAL: materialValue?.value,
      PLANT: plantValue?.value,
      DOCUMENT_DATE: moment(DOCUMENT_DATE).format("YYYYMMDD"),
      DOCUMENT_DATE_TO: moment(DOCUMENT_DATE_TO).format("YYYYMMDD"),
      STATUS,
    };

    var newObj = _.omitBy(
      body,
      (value) =>
        _.isNull(value) ||
        isUndefined(value) ||
        isEmpty1(value) ||
        (_.isString(value) && _.isEmpty(value)) ||
        (_.isArray(value) && _.isEmpty(value))
    );

    if (moment(DOCUMENT_DATE_TO).diff(DOCUMENT_DATE, "days") > 31) {
      Swal.fire({
        title: "Error",
        text: "Date should be within 31 days",
        icon: "error",
      });
    } else if (moment(DOCUMENT_DATE_TO).diff(DOCUMENT_DATE, "days") < 0) {
      Swal.fire({
        title: "Error",
        text: "Date should be within 31 days",
        icon: "error",
      });
    } else {
      setLoadingTable(false);
      props.loading(true);
      http
        .post(`rfc/get_sales_order_list`, {
          ...newObj,
          lv_user: localStorage.getItem("user_code"),
        })
        .then((res) => {
          let data = res.data?.result?.IT_ORDER;
          setSaleOrders(data);
          setPageCount(data?.length / perPage);
          if (data?.length > 0) {
            let x = data.slice(0, perPage);
            setPaginatedSalesOrders(data.slice(0, perPage));

            let ORD_QTY = 0;
            let PGI_DUE_QTY = 0;
            let PGI_DONE_QTY = 0;
            let BAL_QTY = 0;
            x.forEach((resp) => {
              ORD_QTY += +resp.ORD_QTY;
              PGI_DUE_QTY += +resp.PGI_DUE_QTY;
              PGI_DONE_QTY += +resp.PGI_DONE_QTY;
              BAL_QTY += +resp.BAL_QTY;
            });

            setPageSaleOrders({
              ORD_QTY: ORD_QTY,
              PGI_DUE_QTY: PGI_DUE_QTY,
              PGI_DONE_QTY: PGI_DONE_QTY,
              BAL_QTY: BAL_QTY,
            });
          } else {
            setPaginatedSalesOrders([]);
          }
        })
        .catch(() => {
          getSalesorders();
        })
        .finally(() => {
          setLoadingTable(true);
          props.loading(false);
        });
    }
  };

  var isUndefined = (value) => {
    if (value === undefined) {
      return true;
    } else {
      return false;
    }
  };
  var isEmpty1 = (value) => {
    if (Object.keys(value).length <= 0) {
      return true;
    } else {
      return false;
    }
  };
  const handleSearch = () => {
    if (Object.keys(plantValue).length === 0) {
      Swal.fire({
        title: "Select Supplying Plant",
        icon: "error",
      });
    } else {
      // setLoadingTable(false);
      getSalesorders();
      setApplyFilter(applyFilter + 1);
    }
  };

  const validationInDeliveryCreate = (
    Order_Type,
    Sales_Order,
    Status,
    Vkorg
  ) => {
    if (Order_Type === "ZN02") {
      // document.getElementById("orderSelect").checked = false;
      Swal.fire({
        title: "Error",
        text: "Delivery Can not be Created in OrderType ZN02",
        icon: "error",
      });
      setSelectedOrder(Sales_Order);
      setStatus(Status);
      setOrderType(Order_Type);
    } else {
      console.log("Hello", Vkorg, Sales_Order);
      setSelectedOrder(Sales_Order);
      setStatus(Status);
      setOrderType(Order_Type);
    }
    props.deliveryData(Vkorg);
  };

  const generateRow = (
    key,
    Status,
    Sales_Org,
    Sales_Order,
    Sales_Order_date,
    Order_Type,
    DMS_REQID,
    PO,
    Sold_to_party_cd,
    Sold_to_party_name,
    Sold_to_Trans_zone,
    Sold_to_Trans_zone_desc,
    Sold_to_Dist,
    Ship_to_party,
    Ship_to_party_name,
    Ship_to_trans_zone,
    Ship_to_Trans_zone_description,
    Supplying_Plant_code,
    Plant_description,
    Ship_Point_Code,
    Material,
    Material_Description,
    Order_quan,
    PGI_due_qty,
    PGI_done_qty,
    Balanced_Order_qty,
    UOM,
    IncoTerms,
    Inco_Terms_desc,
    Contract
  ) => {
    return (
      <tr key={key}>
        <th scope="row">
          <label className="label table-checkbox">
            <input
              id="orderSelect"
              className=" label__checkbox"
              type="radio"
              name="orderlist"
              onChange={() =>
                validationInDeliveryCreate(
                  Order_Type,
                  Sales_Order,
                  Status,
                  Sales_Org
                )
              }
              // disabled={Order_Type === "ZN02"}
            />
            {/* <span className="table__text table-span-text">
              <span className="table__check table-span-check">
                <i className="fa fa-check table-icon"></i>
              </span>
            </span> */}

            <span className="label__text">
              <span className="label__check">
                <i className="fa fa-check icon"></i>
              </span>
            </span>
          </label>
        </th>
        {Status === "A" ? (
          <td
            style={{ minWidth: "70px", left: "0px", zIndex: "6" }}
            className="table-sticky-horizontal table-sticky-vertical"
          >
            <button className="badge-button danger"></button>
          </td>
        ) : null}
        {Status === "B" ? (
          <td
            style={{ minWidth: "70px", left: "0px", zIndex: "6" }}
            className="table-sticky-horizontal table-sticky-vertical"
          >
            <button className="badge-button warning"></button>
          </td>
        ) : null}
        {Status === "C" ? (
          <td
            style={{ minWidth: "70px", left: "0px", zIndex: "6" }}
            className="table-sticky-horizontal table-sticky-vertical"
          >
            <button className="badge-button success"></button>
          </td>
        ) : null}
        {Status === "" ? (
          <td
            style={{ minWidth: "70px", left: "0px", zIndex: "6" }}
            className="table-sticky-horizontal table-sticky-vertical"
          >
            <button
              style={{ backgroundColor: "white" }}
              className="badge-button"
            ></button>
          </td>
        ) : null}

        <td
          style={{ minWidth: "145px", left: "80px", zIndex: "10" }}
          className="table-sticky-horizontal table-sticky-vertical"
        >
          {Sales_Org}
        </td>
        <td
          style={{ minWidth: "145px", left: "240px", zIndex: "6" }}
          className="table-sticky-horizontal table-sticky-vertical"
        >
          {Sales_Order}
        </td>
        <td
          style={{ minWidth: "144px", left: "386px", zIndex: "6" }}
          className="table-sticky-horizontal table-sticky-vertical"
        >
          {Sales_Order_date}
        </td>
        <td>{Order_Type}</td>
        <td>{DMS_REQID}</td>
        <td>{PO}</td>
        <td>{parseInt(Sold_to_party_cd)}</td>
        <td>{Sold_to_party_name}</td>
        <td>{Sold_to_Trans_zone}</td>
        <td>{Sold_to_Trans_zone_desc}</td>
        <td>{Sold_to_Dist}</td>
        <td>{parseInt(Ship_to_party)}</td>
        <td>{Ship_to_party_name}</td>
        <td>{Ship_to_trans_zone}</td>
        <td>{Ship_to_Trans_zone_description}</td>
        <td>{Supplying_Plant_code}</td>
        <td>{Plant_description}</td>
        <td>{Ship_Point_Code}</td>
        <td>{Material}</td>
        <td>{Material_Description}</td>
        <td>{Order_quan}</td>
        <td>{PGI_due_qty}</td>
        <td>{PGI_done_qty}</td>
        <td>{Balanced_Order_qty}</td>
        <td>{UOM}</td>
        <td>{IncoTerms}</td>
        <td>{Inco_Terms_desc}</td>
        <td>{Contract}</td>
        <td></td>
        {/* <td>{Vkorg}</td> */}
        <td></td>
        {/* <td>
          <Link to={`/dashboard/sales-order/edit/${Sales_Order}`}>
            <button className="btn">Edit</button>
          </Link>
        </td> */}
      </tr>
    );
  };

  // Headers
  let headers = [
    { label: "Status", key: "GBSTA" },
    { label: "Sales Organization", key: "VKORG" },
    { label: "Sales Order", key: "VBELN" },
    { label: "Sales Order Date", key: "AUDAT" },
    { label: "Order Type", key: "AUART" },
    { label: "DMS Req ID", key: "DMS_REQID" },
    { label: "PO", key: "EBELN" },
    { label: "Sold To Party Code", key: "SOLD_TO" },
    { label: "Sold to Party Name", key: "SOLD_TO_NAME" },
    { label: "Sold to Trans. Zone", key: "SOLD_TO_ZONE" },
    { label: "Sold to Trans. Zone Desc", key: "SOLD_TO_ZONE_DESC" },
    { label: "Sold to Dist", key: "SOLD_TO_DIST" },
    { label: "Ship to Party", key: "SHIP_TO" },
    { label: "Ship to Party Name", key: "SHIP_TO_NAME" },
    { label: "Ship to Trans. zone", key: "SHIP_TO_ZONE" },
    { label: "Ship to Trans. zone Description", key: "SHIP_TO_ZONE_DESC" },
    { label: "Ship to Dist", key: "SHIP_TO_DIST" },
    { label: "Supplying Plant Code", key: "WERKS" },
    { label: "Plant Description", key: "WERKS_DESC" },
    { label: "Ship Point Code", key: "SHIP_POINT" },
    { label: "Material", key: "MATNR" },
    { label: "Material Description", key: "MAKTX" },
    { label: "Order Quantity", key: "ORD_QTY" },
    { label: "PGI due Qty", key: "PGI_DUE_QTY" },
    { label: "PGI done Qty", key: "PGI_DONE_QTY" },
    { label: "Balanced Order Qty", key: "BAL_QTY" },
    { label: "UOM", key: "UOM" },
    { label: "IncoTerms", key: "INCO" },
    { label: "IncoTerms Description", key: "INCO_DESC" },
    { label: "Contract", key: "CONTRACT" },
  ];

  // Fix Date Format//
  useEffect(() => {
    let data = salesOrders;
    for (let i = 0; i < data.length; i++) {
      data[i].AUDAT = moment(data[i].AUDAT, "YYYYMMDD").format("DD-MM-YYYY");
    }
  }, [salesOrders]);

  // Plant

  useEffect(() => {
    setPlantOptions(filterOptions(allplants, "WERKS", "NAME1"));
  }, [allplants]);

  // Material
  useEffect(() => {
    setMaterialOptions(filterOptions(allMaterials, "MATNR", "MAKTX"));
  }, [allMaterials]);

  // Common Handle Change
  const commonHandleChange = (data, filedName) => {
    if (filedName === "PLANT") {
      setPlantValue(data);
    } else if (filedName === "MATERIAL") {
      setMaterialValue(data);
    }
  };

  useEffect(() => {
    if (
      selectedPlant?.WERKS !== undefined &&
      selectedPlant?.NAME1 !== undefined
    ) {
      setPlantValue({
        value: selectedPlant?.WERKS,
        label: selectedPlant?.WERKS + "-" + selectedPlant?.NAME1,
      });
    }
  }, [selectedPlant?.KUNNR, selectedPlant?.NAME1]);

  useEffect(() => {
    if (MATERIAL?.MATNR !== undefined && MATERIAL?.MAKTX !== undefined) {
      setMaterialValue({
        value: MATERIAL?.MATNR,
        label: MATERIAL?.MATNR.replace(/^0+/, "") + "-" + MATERIAL?.MAKTX,
      });
    }
  }, [MATERIAL?.MATNR, MATERIAL?.MAKTX]);

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

  useEffect(() => {
    if (
      selectedSoldtoParty?.KUNNR !== undefined &&
      selectedSoldtoParty?.NAME1 !== undefined
    ) {
      setval({
        value: selectedSoldtoParty?.KUNNR,
        label: selectedSoldtoParty?.KUNNR + "-" + selectedSoldtoParty?.NAME1,
      });
    }
  }, [selectedSoldtoParty?.KUNNR, selectedSoldtoParty?.NAME1]);

  const handleChange = (value2) => {
    setSelectedSoldtoParty({ KUNNR: value2?.value });
    setval({ value: value2?.value, label: value2?.label });
  };

  return (
    <div>
      <div className="filter-section">
        <div className="row">
          <div className="col-6">
            <div className="row">
              <div className="col-3">
                <label>
                  Supplying Plant<span>*</span>
                </label>
              </div>
              <div className="col-7">
                <i
                  className="far fa-clone click-icons"
                  onClick={() => {
                    if (currentState === "1") {
                      setSearchModalConfig({
                        show: true,
                        title: "Supplying plant",
                        keys: ["WERKS", "NAME1"],
                        keylabels: ["Plant Number", "Plant Name"],
                        labels: ["Plant Number", "Plant Name"],
                        labelindex: ["WERKS", "NAME1"],
                        return_field_key: "PLANT",
                        return_field_value: ["WERKS", "NAME1"],
                        data: allplants,
                        setStateFunction: setSelectedPlant,
                      });
                    }
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
                  className="mat-input"
                  name="PLANT"
                  value={
                    Object.keys(selectedPlant).length > 0
                      ? `${selectedPlant.WERKS}-${selectedPlant.NAME1}`
                      : ""
                  }
                  onFocus={() => {
                    if (currentState === "1") {
                      setSearchModalConfig({
                        show: true,
                        title: "Supplying plant",
                        keys: ["WERKS", "NAME1"],
                        keylabels: ["Plant Number", "Plant Name"],
                        labels: ["Plant Number", "Plant Name"],
                        labelindex: ["WERKS", "NAME1"],
                        return_field_key: "PLANT",
                        return_field_value: ["WERKS", "NAME1"],
                        data: allplants,
                        setStateFunction: setSelectedPlant,
                      });
                    }
                  }}
                  readOnly
                /> */}
              </div>
              <div className="col-1">
                <button
                  className="search-button float-right"
                  style={{
                    backgroundColor: "red",
                    width: "30px",
                    padding: "5px",
                  }}
                >
                  <i
                    className="fa fa-times icons-button"
                    onClick={() => setPlantValue({})}
                  ></i>
                </button>
              </div>
            </div>
          </div>
          <div className="col-6">
            <div className="row">
              <div className="col-2">
                <label>Customer#</label>
              </div>
              <div className="col-9">
                {/* <input
                  type="text"
                  disabled={true}
                  value={
                    Object.keys(selectedSoldtoParty).length > 0
                      ? `${selectedSoldtoParty.KUNNR.replace(/^0+/, "")}-${
                          selectedSoldtoParty.NAME1
                        }`
                      : ""
                  }
                  // onChange={e => setCUSTOMER_NUMBER(e.target.value)}
                /> */}

                <AsyncSelect
                  classNamePrefix="react-select"
                  cacheOptions
                  loadOptions={loadOptions}
                  defaultOptions
                  onInputChange={handleInputChange}
                  value={value}
                  placeholder={""}
                  name={"SOLD_TO_PARTY"}
                  onChange={handleChange}
                  isDisabled={currentState === "2"}
                />
                <i
                  className="far fa-clone click-icons"
                  onClick={() => {
                    setsoldToPartyModalVisble(true);
                  }}
                ></i>
              </div>
            </div>
          </div>
        </div>
        <div className="row">
          <div className="col-6"></div>
          <div className="col-6">
            {/* <div className="row">
              <div className="column-divider"></div>
              <div className="col-3">
                <label>
                  Date<span>*</span>
                </label>
              </div>

              <div className="col-4">
                <input
                  defaultValue={DOCUMENT_DATE}
                  type="date"
                  onChange={e => { setDOCUMENT_DATE(e.target.value) }}
                />
              </div>
              <div className="column-divider"></div>
              <div className="col-4">
                <input
                  type="date"
                  defaultValue={DOCUMENT_DATE_TO}
                  onChange={e => { setDOCUMENT_DATE_TO(e.target.value) }}

                />
              </div>
            </div> */}
          </div>
        </div>

        <div className="row">
          <div className="col-4">
            <div className="row">
              <div className="col-3">
                <label>Material #</label>
              </div>
              <div className="col-8">
                <Select
                  classNamePrefix="react-select"
                  cacheOptions
                  defaultOptions
                  value={
                    Object.keys(materialValue).length > 0 ? materialValue : []
                  }
                  options={materialOptions}
                  onChange={(e) => commonHandleChange(e, "MATERIAL")}
                  // ref={register({ required: true })}
                  name="MATERIAL"
                  placeholder={""}
                  isDisabled={currentState === "2"}
                />
                <i
                  className="far fa-clone click-icons"
                  onClick={() => {
                    if (Object.keys(plantValue).length > 0) {
                      setSearchModalConfig({
                        show: true,
                        title: "Material",
                        keys: ["MATNR", "MAKTX"],
                        keylabels: ["Material Number", "Material Name"],
                        labels: ["Material Number", "Material Name"],
                        labelindex: ["MATNR", "MAKTX"],
                        return_field_key: "MATERIAL",
                        return_field_value: "MATNR",
                        data: allMaterials,
                        setStateFunction: setMATERIAL,
                      });
                    } else {
                      Swal.fire({
                        title: "Error!",
                        text: "please select supplying plant",
                        icon: "error",
                        confirmButtonText: "Ok",
                      });
                    }
                  }}
                ></i>
              </div>

              <div className="col-1">
                <button
                  className="search-button float-right"
                  style={{
                    backgroundColor: "red",
                    width: "30px",
                    padding: "5px",
                  }}
                >
                  <i
                    className="fa fa-times icons-button"
                    onClick={() => setMaterialValue({})}
                  ></i>
                </button>
              </div>
            </div>
          </div>
          <div className="col-4">
            <div className="row">
              <div className="column-divider"></div>
              <div className="col-2">
                <label className="float-right">
                  Date<span>*</span>
                </label>
              </div>

              <div className="col-4">
                <input
                  defaultValue={DOCUMENT_DATE}
                  type="date"
                  onChange={(e) => {
                    setDOCUMENT_DATE(e.target.value);
                  }}
                />
              </div>
              <div className="column-divider"></div>
              <div className="col-4">
                <input
                  type="date"
                  defaultValue={DOCUMENT_DATE_TO}
                  onChange={(e) => {
                    setDOCUMENT_DATE_TO(e.target.value);
                  }}
                />
              </div>
            </div>
          </div>

          <div className="col-2">
            <div className="row">
              <div className="col-3">
                <label className="float-right">
                  Status<span>*</span>
                </label>
              </div>
              <div className="col-8">
                {/* <input
                        type="text"
                        value={STATUS}
                        onChange={e => setSTATUS(e.target.value)}
                      // onBlur={formik.handleBlur}
                      /> */}
                <select
                  onChange={(e) => {
                    setSTATUS(e.target.value);
                  }}
                >
                  <option value="X">All</option>
                  <option value="A">Open</option>
                  <option value="C">Closed</option>
                  <option value="B">Partially processed</option>
                </select>
              </div>
            </div>
          </div>

          <div className="col-2 float-right">
            <button className="search-button " onClick={() => handleSearch()}>
              <i className="fas fa-search icons-button"></i>
            </button>
            <button
              className="search-button "
              style={{ backgroundColor: "red" }}
            >
              <i
                className="fa fa-times icons-button"
                onClick={() => window.location.reload()}
              ></i>
            </button>
          </div>
        </div>
      </div>

      <div className="background">
        <div className="table-filter">
          <div className="filter-div">
            <div className="row">
              {/* <div className="col">
                      <div className="row">
                        <div className="col-2">
                          <label className="float-right">Filter By</label>
                        </div>
                        <div className="col-2">
                          <select>
                            <option>All</option>
                          </select>
                          <i className="fas fa-ellipsis-v icons"></i>
                        </div>
                        <div className="column-divider"></div>
                        <div className="col-7">
                          <input type="text" name="" />
                          <i className="fas fa-search icons"></i>
                        </div>
                      </div>
                    </div> */}

              <div className="col">
                <div className="row">
                  <div className="col">
                    {["A", "B"].includes(status) &&
                    selectedOrder &&
                    orderType ? (
                      <Link to={`/dashboard/sales-order/edit/${selectedOrder}`}>
                        <button
                          className="goods-button float-right"
                          style={{ backgroundColor: "#0F6FA2" }}
                        >
                          Edit
                        </button>
                      </Link>
                    ) : null}
                    {(status === "B" || status === "A") &&
                    selectedOrder &&
                    orderType !== "ZN02" ? (
                      <button
                        className="goods-button float-right"
                        style={{ backgroundColor: "#59A948" }}
                        onClick={(e) => createDelivery(e)}
                      >
                        Create Delivery
                      </button>
                    ) : null}
                    {salesOrders.length > 0 ? (
                      <reactCsv.CSVLink
                        className="goods-button float-right"
                        style={{ backgroundColor: "#0F6FA2" }}
                        data={salesOrders}
                        headers={headers}
                        filename={`Sales Order List: Plant:${selectedPlant.WERKS}-${selectedPlant.NAME1} From-${DOCUMENT_DATE} to ${DOCUMENT_DATE_TO}.csv`}
                      >
                        Export to CSV
                      </reactCsv.CSVLink>
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
        </div>

        {/* Table Div Open */}

        <div className="">
          <div className="table-div" style={{ height: "490px" }}>
            <div className="row">
              <table className="table">
                <thead>
                  <tr>
                    <th
                      scope="col"
                      className="table-th table-sticky-horizontal table-sticky-vertical"
                      style={{ border: "none", minWidth: "40px", left: "0px" }}
                    >
                      {/* <label className="label table-checkbox">
                            <input className="table__checkbox" type="checkbox" />
                            <span className="table__text table-span-text">
                              <span className="table__check table-span-check">
                                <i className="fa fa-check table-icon"></i>
                              </span>
                            </span>
                          </label> */}
                    </th>
                    <th
                      scope="col"
                      style={{ minWidth: "70px", left: "0px", zIndex: "10" }}
                      className="table-sticky-horizontal table-sticky-vertical"
                    >
                      Status
                    </th>
                    <th
                      scope="col"
                      style={{ minWidth: "160px", left: "80px", zIndex: "11" }}
                      className="table-sticky-horizontal table-sticky-vertical"
                    >
                      Sales Organization
                    </th>
                    <th
                      scope="col"
                      style={{ minWidth: "145px", left: "240px", zIndex: "10" }}
                      className="table-sticky-horizontal table-sticky-vertical"
                    >
                      Sales Order
                    </th>
                    <th
                      scope="col"
                      style={{ minWidth: "144px", left: "386px", zIndex: "10" }}
                      className="table-sticky-horizontal table-sticky-vertical"
                    >
                      Sales Order date
                    </th>
                    <th
                      scope="col"
                      style={{ minWidth: "145px" }}
                      className="table-sticky-vertical"
                    >
                      Order Type
                    </th>
                    <th
                      scope="col"
                      style={{ minWidth: "200px" }}
                      className="table-sticky-vertical"
                    >
                      DMS Req ID
                    </th>
                    <th
                      scope="col"
                      style={{ minWidth: "500px" }}
                      className="table-sticky-vertical"
                    >
                      PO
                    </th>
                    <th
                      scope="col"
                      style={{ minWidth: "130px" }}
                      className="table-sticky-vertical"
                    >
                      Sold to party cd
                    </th>
                    <th
                      scope="col"
                      style={{ minWidth: "220px" }}
                      className="table-sticky-vertical"
                    >
                      Sold to party name
                    </th>
                    <th
                      scope="col"
                      style={{ minWidth: "140px" }}
                      className="table-sticky-vertical"
                    >
                      Sold to Trans zone
                    </th>
                    <th
                      scope="col"
                      style={{ minWidth: "160px" }}
                      className="table-sticky-vertical"
                    >
                      Sold to Trans zone desc
                    </th>
                    <th
                      scope="col"
                      style={{ minWidth: "130px" }}
                      className="table-sticky-vertical"
                    >
                      Sold to Dist
                    </th>
                    <th
                      scope="col"
                      style={{ minWidth: "130px" }}
                      className="table-sticky-vertical"
                    >
                      Ship to party
                    </th>
                    <th
                      scope="col"
                      style={{ minWidth: "220px" }}
                      className="table-sticky-vertical"
                    >
                      Ship to party name
                    </th>
                    <th
                      scope="col"
                      style={{ minWidth: "135px" }}
                      className="table-sticky-vertical"
                    >
                      Ship to trans zone
                    </th>
                    <th
                      scope="col"
                      style={{ minWidth: "200px" }}
                      className="table-sticky-vertical"
                    >
                      Ship to Trans zone description
                    </th>
                    <th
                      scope="col"
                      style={{ minWidth: "130px" }}
                      className="table-sticky-vertical"
                    >
                      Ship to Dist
                    </th>
                    <th
                      scope="col"
                      style={{ minWidth: "136px" }}
                      className="table-sticky-vertical"
                    >
                      Supplying Plant code
                    </th>
                    <th
                      scope="col"
                      style={{ minWidth: "250px" }}
                      className="table-sticky-vertical"
                    >
                      Plant description
                    </th>
                    <th
                      scope="col"
                      style={{ minWidth: "130px" }}
                      className="table-sticky-vertical"
                    >
                      Ship Point Code
                    </th>
                    <th
                      scope="col"
                      style={{ minWidth: "130px" }}
                      className="table-sticky-vertical"
                    >
                      Material
                    </th>
                    <th
                      scope="col"
                      style={{ minWidth: "345px" }}
                      className="table-sticky-vertical"
                    >
                      Material Description
                    </th>
                    <th
                      scope="col"
                      style={{ minWidth: "130px" }}
                      className="table-sticky-vertical"
                    >
                      Order quan
                    </th>
                    <th
                      scope="col"
                      style={{ minWidth: "130px" }}
                      className="table-sticky-vertical"
                    >
                      PGI due qty
                    </th>
                    <th
                      scope="col"
                      style={{ minWidth: "130px" }}
                      className="table-sticky-vertical"
                    >
                      PGI done qty
                    </th>
                    <th
                      scope="col"
                      style={{ minWidth: "130px" }}
                      className="table-sticky-vertical"
                    >
                      Balanced Order qty
                    </th>
                    <th
                      scope="col"
                      style={{ minWidth: "130px" }}
                      className="table-sticky-vertical"
                    >
                      UOM
                    </th>
                    <th
                      scope="col"
                      style={{ minWidth: "130px" }}
                      className="table-sticky-vertical"
                    >
                      IncoTerms
                    </th>
                    <th
                      scope="col"
                      style={{ minWidth: "210px" }}
                      className="table-sticky-vertical"
                    >
                      Inco Terms desc
                    </th>
                    <th
                      scope="col"
                      style={{ minWidth: "130px" }}
                      className="table-sticky-vertical"
                    >
                      Contract
                    </th>
                    {/* <th>Vkorg</th> */}
                    {/* <th
                      scope="col"
                      style={{ minWidth: "130px" }}
                      className="table-sticky-vertical"
                    >
                      Operations
                    </th> */}
                  </tr>
                </thead>
                <tbody style={{ height: "auto", textAlign: "center" }}>
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
                    <>
                      {paginatedSalesOrders?.map((row, key) => {
                        return generateRow(
                          key,
                          row.GBSTA,
                          row.VKORG,
                          row.VBELN,
                          row.AUDAT,
                          row.AUART,
                          row.DMS_REQID,
                          row.EBELN,
                          row.SOLD_TO,
                          row.SOLD_TO_NAME,
                          row.SOLD_TO_ZONE,
                          row.SOLD_TO_ZONE_DESC,
                          row.SOLD_TO_DIST,
                          row.SHIP_TO,
                          row.SHIP_TO_NAME,
                          row.SHIP_TO_ZONE,
                          row.SHIP_TO_ZONE_DESC,
                          row.SHIP_TO_DIST,
                          row.WERKS,
                          row.WERKS_DESC,
                          row.SHIP_POINT,
                          row.MATNR,
                          row.MAKTX,
                          row.ORD_QTY,
                          row.PGI_DUE_QTY,
                          row.PGI_DONE_QTY,
                          row.BAL_QTY,
                          row.UOM,
                          row.INCO,
                          row.INCO_DESC,
                          row.CONTRACT
                          // row.VKORG
                        );
                      })}
                    </>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="row">
            <ReactPaginate
              previousLabel={"prev"}
              nextLabel={"next"}
              breakLabel={"..."}
              breakClassName={"break-me"}
              pageCount={pageCount}
              marginPagesDisplayed={2}
              pageRangeDisplayed={5}
              onPageChange={pageChange}
              containerClassName={"pagination"}
              subContainerClassName={"pages pagination"}
              activeClassName={"active"}
            />

            <div className="col-3">
              <label className="float-right" style={{ lineHeight: "50px" }}>
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
            <div className="col badge-div">
              <label className="badge float-right">
                <button className="badge-button primary"></button>
                Cancelled
              </label>
              <label className="badge float-right">
                <button className="badge-button warning"></button>
                Partially Processed
              </label>
              <label className="badge float-right">
                <button className="badge-button success"></button>
                Closed
              </label>
              <label className="badge float-right">
                <button className="badge-button danger"></button>
                Open
              </label>
            </div>
          </div>
        </div>
        <div className="agregatePageTable">
          {" "}
          Order quantity: <span>{pageSalesOrders.ORD_QTY.toFixed(2)}</span>{" "}
          &emsp; &emsp; PGI Due quantity:{" "}
          <span>{pageSalesOrders.PGI_DUE_QTY.toFixed(2)}</span> &emsp; &emsp;
          PGI Done quantity:{" "}
          <span>{pageSalesOrders.PGI_DONE_QTY.toFixed(2)}</span> &emsp; &emsp;
          Balanced Order quantity:{" "}
          <span>{pageSalesOrders.BAL_QTY.toFixed(2)}</span> &emsp; &emsp;
        </div>
      </div>
      {soldToPartyModalVisble ? (
        <SearchSoldToParty
          show={soldToPartyModalVisble}
          setSearchedValue={setSearchedValue}
          hideIt={() => setsoldToPartyModalVisble(false)}
          mainKey="SOLD_TO_PARTY"
          setStateFunction={setSelectedSoldtoParty}
        />
      ) : null}

      {searchModalConfig.show ? (
        <SearchDialog
          {...searchModalConfig}
          setSearchedValue={setSearchedValue}
          hideIt={() => setSearchModalConfig({ ...default_config })}
        />
      ) : null}
    </div>
  );
}

const mapStateToProps = (state) => ({
  Auth: state.Auth,
  Delivery: state.Delivery,
  // console.log(Delivery);
});

export default connect(mapStateToProps, { loading, deliveryData })(
  SalesOrderList
);
