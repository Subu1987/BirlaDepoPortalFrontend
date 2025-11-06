import React, { useState, useEffect, useRef } from "react";

import { loading } from "../../actions/loadingAction";
import { connect } from "react-redux";
import http from "../../services/apicall";
import apis from "../../services/apis";
import Swal from "sweetalert2";

import { Controller, useForm } from "react-hook-form";
import Modal from "react-bootstrap/Modal";
import ReactPaginate from "react-paginate";
import ReactExport from "react-export-excel";
import isNumber from "is-number";
import { emptyResult } from "../../services/EmptyResult";
import filterDataReport from "../../Functions/filterDataReport";
import Select from "react-select";
import ModalSalesRegister from "./Modal";
import usePlant from "../../hook/usePlant";

const ExcelFile = ReactExport.ExcelFile;
const ExcelSheet = ReactExport.ExcelFile.ExcelSheet;
const ExcelColumn = ReactExport.ExcelFile.ExcelColumn;

function StockOverViewReport(props) {
  const [stockData, setStockData] = useState([]);
  const [paginatedStockData, setPaginatedStockData] = useState([]);
  const [perPage, setPerpage] = useState(10);

  const [allPlant, setAllPlant] = useState([]);

  const [allMaterial, setAllMaterial] = useState([]);

  const [allStorageLocation, setAllStorageLocation] = useState([]);

  const [plant, setPlant] = useState({});
  const [material, setMaterial] = useState({});
  const [storageFrom, setStorageFrom] = useState({});
  const [storageTo, setStorageTo] = useState({});

  const [modalVisible, setModalVisible] = useState(false);
  const [modalData, setModalData] = useState([]);
  const [name, setName] = useState("");
  const [header, setHeader] = useState({});

  const { handleSubmit, errors, setValue, control, getValues } = useForm({
    mode: "onSubmit",
    reValidateMode: "onChange",
  });

  //++++++++++++++++++++++++++++++++++++++++++++++searchSysytem plant+++++++++++++++++++++++++++++++++++++++++++++++++++
  const [plantSearch1, setplantSearch1] = useState("");
  const [plantSearch2, setplantSearch2] = useState("");
  const [plantSearchedfiltered, setplantSearchedfiltered] = useState([]);
  const [isPlantModalVisible, setIsPlantModalVisible] = useState(false);
  const plantref = useRef(null);
  useEffect(() => {
    if (plantSearch1 !== "" || plantSearch2 !== "") {
      let new_data = allPlant;
      new_data = new_data.filter((ele) => {
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

  useEffect(() => {
    if (isPlantModalVisible) {
      plantref.current.focus();
    }
  }, [isPlantModalVisible]);
  //++++++++++++++++++++++++++++++++++++++++++++++searchSysytem+++++++++++++++++++++++++++++++++++++++++++++++++++

  //++++++++++++++++++++++++++++++++++++++++++++++searchSysytem material+++++++++++++++++++++++++++++++++++++++++++++++++++
  const [materialSearch, setMaterialSearch] = useState("");
  const [materialSearchFiltered, setMaterialSearchFiltered] = useState([]);
  const [isMaterialSearchModalvisible, setIsMaterialSearchModalVisible] =
    useState(false);
  const materialRef = useRef(null);
  useEffect(() => {
    if (materialSearch !== "") {
      let new_data = allMaterial;
      new_data = new_data.filter(
        (ele) =>
          ele.MATNR.toLowerCase().includes(materialSearch) ||
          ele.MAKTX.toLowerCase().includes(materialSearch),
      );
      setMaterialSearchFiltered(new_data);
    }
  }, [materialSearch]);

  useEffect(() => {
    if (isMaterialSearchModalvisible) {
      materialRef.current.focus();
    }
  }, [isMaterialSearchModalvisible]);
  //++++++++++++++++++++++++++++++++++++++++++++++searchSysytem+++++++++++++++++++++++++++++++++++++++++++++++++++

  //++++++++++++++++++++++++++++++++++++++++++++++searchSysytem storage location from+++++++++++++++++++++++++++++++++++++++++++++++++++
  const [storageLocationFromSearch, setStorageLocationFromSearch] =
    useState("");
  const [storageLocationFromFiltered, setStorageLocationFromFiltered] =
    useState([]);
  const [isStorageLocationFromVisible, setIsStorageLocationFromVisible] =
    useState(false);
  const storageLocationFromRef = useRef(null);
  useEffect(() => {
    if (storageLocationFromSearch !== "") {
      let new_data = allStorageLocation;
      new_data = new_data.filter(
        (ele) =>
          ele.LGORT.toLowerCase().includes(storageLocationFromSearch) ||
          ele.LGOBE.toLowerCase().includes(storageLocationFromSearch),
      );
      setStorageLocationFromFiltered(new_data);
    }
  }, [storageLocationFromSearch]);

  useEffect(() => {
    if (isStorageLocationFromVisible) {
      storageLocationFromRef.current.focus();
    }
  }, [isStorageLocationFromVisible]);
  //++++++++++++++++++++++++++++++++++++++++++++++searchSysytem+++++++++++++++++++++++++++++++++++++++++++++++++++

  //++++++++++++++++++++++++++++++++++++++++++++++searchSysytem storage location to+++++++++++++++++++++++++++++++++++++++++++++++++++
  const [storageLocationToSearch, setStorageLocationToSearch] = useState("");
  const [storageLocationToFiltered, setStorageLocationToFiltered] = useState(
    [],
  );
  const [isStorageLocationToVisible, setIsStorageLocationToVisible] =
    useState(false);
  const storageLocationToRef = useRef(null);
  useEffect(() => {
    if (storageLocationToSearch !== "") {
      let new_data = allStorageLocation;
      new_data = new_data.filter(
        (ele) =>
          ele.LGORT.toLowerCase().includes(storageLocationToSearch) ||
          ele.LGOBE.toLowerCase().includes(storageLocationToSearch),
      );
      setStorageLocationFromFiltered(new_data);
    }
  }, [storageLocationToSearch]);

  useEffect(() => {
    if (isStorageLocationToVisible) {
      storageLocationToRef.current.focus();
    }
  }, [isStorageLocationToVisible]);
  //++++++++++++++++++++++++++++++++++++++++++++++searchSysytem+++++++++++++++++++++++++++++++++++++++++++++++++++

  //+++++++++++++++++++++++++++++++++++++++++++++fetch plant++++++++++++++++++++++++

  const plantHook = usePlant();

  useEffect(() => {
    if (plantHook.length > 0) {
      setAllPlant(filterDataReport(plantHook, "WERKS", "NAME1"));
    }
  }, [plantHook]);

  //+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

  //++++++++++++++++++++++++++++++++++++++++++++++++fetch material+++++++++++++++++++++++++++++++++++++++
  let fetchMaterial = () => {
    props.loading(true);
    http
      .post(apis.GET_ORDER_MATERIAL_OF_PLANT, {
        lv_plant: plant.value,
      })
      .then((result) => {
        if (result.data.status) {
          console.log(result.data.result.IT_FINAL);
          setAllMaterial(
            filterDataReport(result.data.result.IT_FINAL, "MATNR", "MAKTX"),
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
      })
      .finally(() => {
        props.loading(false);
      });
  };

  let fetchStorageLocation = () => {
    props.loading(true);
    http
      .post(apis.GET_STORAGE_LOCATIONS, {
        plant: plant.value,
      })
      .then((result) => {
        if (result.data.status) {
          console.log(result.data.result);
          setAllStorageLocation(
            filterDataReport(result.data.result, "LGORT", "LGOBE"),
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
      })
      .finally(() => {
        props.loading(false);
      });
  };

  useEffect(() => {
    if (Object.keys(plant).length > 0) {
      fetchMaterial();
      fetchStorageLocation();
    }
  }, [plant]);

  //+++++++++++++++++++++++++++++++++++++fetch  list++++++++++++++++++++++++
  let onSubmit = (data) => {
    console.log(data);

    fetchReport(data);
  };

  let fetchReport = (data) => {
    props.loading(true);
    data.lv_user = localStorage.getItem("user_code");
    http
      .post(apis.FETCH_STOCK_OVERVIEW_REPORT, data)
      .then((result) => {
        if (result.data.status) {
          emptyResult(result.data.data, setStockData);
          // setStockData(result.data.data);
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
  //++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

  //++++++++++++++++++++++++++page changer+++++++++++++++++++++++++++++++++++++++++++++++
  let pageChange = ({ selected }) => {
    console.log(selected);
    setPaginatedStockData(
      stockData.slice(selected * perPage, perPage * (selected + 1)),
    );
  };
  useEffect(() => {
    pageChange({ selected: 0 });
  }, [perPage, stockData]);
  //+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

  //++++++++++++++++++++++++++++++++++++++++custom validation trigger++++++++++++++

  //+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

  // +++++++++++++++++Data Fixing+++++++++++++++++++++++++++++++++++++++++//
  useEffect(() => {
    let data = stockData;
    console.log(data);
    let objectKeys = [];
    if (stockData.length !== 0) {
      objectKeys = Object.keys(data[0]);
    }
    console.log(objectKeys);

    for (let i = 0; i < data.length; i++) {
      for (let j = 0; j < objectKeys.length; j++) {
        if (isNumber(data[i][objectKeys[j]])) {
          data[i][objectKeys[j]] = Number(data[i][objectKeys[j]]);
        }
      }
    }
  }, [stockData]);

  useEffect(() => {
    if (Object.keys(errors).length > 0) {
      let msg = "";
      Object.keys(errors).forEach((keys, i) => {
        msg += `<p>${i + 1}. ${errors[keys]?.message}</p>`;
      });
      Swal.fire({ title: "Error", html: msg, icon: "error" });
    }
  }, [errors]);

  // Common Handle Change
  const handleChange = (value, key) => {
    switch (key) {
      case "IM_WERKS":
        setPlant(value);
        setValue(key, value?.value);
        break;
      case "IM_MATNR":
        setMaterial(value);
        setValue(key, value?.value);
        break;
      case "IM_LGORT_FROM":
        setStorageFrom(value);
        setValue(key, value?.value);
        break;
      case "IM_LGORT_TO":
        setStorageTo(value);
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
                    setModalData(allPlant);
                    setName("IM_WERKS");
                    setHeader({
                      title: "Plant",
                      name: "Plant Code",
                      desc: "Plant Name",
                    });
                  }}
                ></i>
                <Controller
                  as={() => (
                    <Select
                      classNamePrefix="react-select"
                      value={plant}
                      onChange={(event) => handleChange(event, "IM_WERKS")}
                      options={allPlant}
                      placeholder=""
                    />
                  )}
                  defaultValue=""
                  control={control}
                  name="IM_WERKS"
                  rules={{
                    required: "Plant code is required",
                  }}
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
              <div className="col-2">
                <label>Material</label>
              </div>
              <div className="col-9">
                <i
                  className="far fa-clone click-icons"
                  onClick={() => {
                    setModalVisible(true);
                    setModalData(allMaterial);
                    setName("IM_MATNR");
                    setHeader({
                      title: "Material",
                      name: "Material Code",
                      desc: "Material Name",
                    });
                  }}
                ></i>
                <Controller
                  as={() => (
                    <Select
                      classNamePrefix="react-select"
                      value={material}
                      onChange={(event) => handleChange(event, "IM_MATNR")}
                      options={allMaterial}
                      placeholder=""
                    />
                  )}
                  defaultValue=""
                  control={control}
                  name="IM_MATNR"
                />
                {/* <i
                  className="far fa-clone click-icons"
                  onClick={() => {
                    openMaterialSearchModal();
                  }}
                ></i>
                <input
                  type="text"
                  ref={register}
                  name="material"
                  onChange={(e) => {
                    setSelectedMaterial({
                      MATNR: e.target.value,
                    });
                    setWithValidationTrigger("material", e.target.value);
                  }}
                />
                {errors.material && (
                  <p className="form-error">Please select an option</p>
                )} */}
              </div>
            </div>
          </div>
          <div className="col">
            <button type="submit" className="search-button float-right">
              <i className="fas fa-search icons-button"></i>
            </button>
          </div>
        </div>

        <div className="row">
          <div className="col">
            <div className="row">
              <div className="col-2">
                <label>Storage Location from</label>
              </div>
              <div className="col-9">
                <i
                  className="far fa-clone click-icons"
                  onClick={() => {
                    setModalVisible(true);
                    setModalData(allStorageLocation);
                    setName("IM_LGORT_FROM");
                    setHeader({
                      title: "Storage Location From",
                      name: "Storage Location Code",
                      desc: "Storage Location Name",
                    });
                  }}
                ></i>
                <Controller
                  as={() => (
                    <Select
                      classNamePrefix="react-select"
                      value={storageFrom}
                      onChange={(event) => handleChange(event, "IM_LGORT_FROM")}
                      options={allStorageLocation}
                      placeholder=""
                    />
                  )}
                  defaultValue=""
                  control={control}
                  name="IM_LGORT_FROM"
                />
                {/* <i
                  className="far fa-clone click-icons"
                  onClick={() => {
                    openStorageLocationFromModal();
                  }}
                ></i>
                <input
                  type="text"
                  ref={register({
                    // required: true,
                  })}
                  name="storage_location_from"
                  onChange={(e) => {
                    setSelectedStorageLocationFrom({
                      LGORT: e.target.value,
                    });
                    setWithValidationTrigger(
                      "storage_location_from",
                      e.target.value
                    );
                  }}
                />
                {errors.storage_location_from && (
                  <p className="form-error">Please select an option</p>
                )} */}
              </div>
            </div>
          </div>
          <div className="col">
            <div className="row">
              <div className="col-2">
                <label>Storage Location to</label>
              </div>
              <div className="col-9">
                <i
                  className="far fa-clone click-icons"
                  onClick={() => {
                    setModalVisible(true);
                    setModalData(allStorageLocation);
                    setName("IM_LGORT_TO");
                    setHeader({
                      title: "Storage Location To",
                      name: "Storage Location Code",
                      desc: "Storage Location Name",
                    });
                  }}
                ></i>
                <Controller
                  as={() => (
                    <Select
                      classNamePrefix="react-select"
                      value={storageTo}
                      onChange={(event) => handleChange(event, "IM_LGORT_TO")}
                      options={allStorageLocation}
                      placeholder=""
                    />
                  )}
                  defaultValue=""
                  control={control}
                  name="IM_LGORT_TO"
                />
                {/* <i
                  className="far fa-clone click-icons"
                  onClick={() => {
                    openStorageLocationToModal();
                  }}
                ></i>
                <input
                  type="text"
                  ref={register({
                    // required: true,
                  })}
                  name="storage_location_to"
                  onChange={(e) => {
                    setSelectedStorageLocationTo({
                      LGORT: e.target.value,
                    });
                    setWithValidationTrigger(
                      "storage_location_to",
                      e.target.value
                    );
                  }}
                />
                {errors.storage_location_to && (
                  <p className="form-error">Please select an option</p>
                )} */}
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
                    {stockData ? (
                      <ExcelFile
                        filename={`Stock Overview Report: Plant: ${getValues(
                          "IM_WERKS",
                        )}--Material:${getValues("IM_MATNR")}`}
                        element={
                          <button
                            className="goods-button float-right"
                            style={{ backgroundColor: "#0F6FA2" }}
                          >
                            Export to Excel
                          </button>
                        }
                      >
                        <ExcelSheet data={stockData} name="Stock Data">
                          <ExcelColumn label="Plant" value="PLANT" />
                          <ExcelColumn
                            label="Plant Description"
                            value="PLANT_DESC"
                          />
                          <ExcelColumn
                            label="Storage Location"
                            value="STORAGE_LOC"
                          />
                          <ExcelColumn
                            label="Storage Location Description"
                            value="STROAGE_DESC"
                          />
                          <ExcelColumn label="Batch" value="BATCH" />
                          <ExcelColumn label="Material" value="MATERIAL" />
                          <ExcelColumn
                            label="Material Description"
                            value="MATERIAL_DESC"
                          />
                          <ExcelColumn
                            label="Unrestricted Quantity"
                            value="UNRESTRICTED"
                          />
                          {/* <ExcelColumn
                            label="In-Quality Inspection Quantity"
                            value="IN_QUAL_INSP"
                          />
                          <ExcelColumn
                            label="Restricted Quantity"
                            value="RESTICTED_USE"
                          />
                          <ExcelColumn
                            label="Blocked Quantity"
                            value="BLOCKED"
                          /> */}
                          <ExcelColumn label="Unit of Measure" value="UOM" />
                        </ExcelSheet>
                      </ExcelFile>
                    ) : null}
                    {/* {stockData ? (
                      <CSVLink
                        className="goods-button float-right"
                        style={{ backgroundColor: "#0F6FA2" }}
                        data={stockData}
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
                      Plant
                    </th>
                    <th
                      className="table-sticky-vertical"
                      style={{ minWidth: "150px" }}
                      scope="col"
                    >
                      Plant Description
                    </th>
                    <th
                      className="table-sticky-vertical"
                      style={{ minWidth: "100px" }}
                      scope="col"
                    >
                      Storage Location
                    </th>
                    <th
                      className="table-sticky-vertical"
                      style={{ minWidth: "130px" }}
                      scope="col"
                    >
                      Storage Location Description
                    </th>
                    <th
                      className="table-sticky-vertical"
                      style={{ minWidth: "150px" }}
                      scope="col-3"
                    >
                      Batch
                    </th>
                    <th
                      className="table-sticky-vertical"
                      style={{ minWidth: "150px" }}
                      scope="col"
                    >
                      Material #
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
                      style={{ minWidth: "140px" }}
                      scope="col"
                    >
                      Unrestricted Quantity
                    </th>
                    {/* <th
                      className="table-sticky-vertical"
                      style={{ minWidth: "170px" }}
                      scope="col"
                    >
                      In-Quality Inspection Quantity
                    </th>
                    <th
                      className="table-sticky-vertical"
                      style={{ minWidth: "180px" }}
                      scope="col"
                    >
                      Restricted Quantity
                    </th>
                    <th
                      className="table-sticky-vertical"
                      style={{ minWidth: "180px" }}
                      scope="col"
                    >
                      Blocked Quantity
                    </th> */}
                    <th
                      className="table-sticky-vertical"
                      style={{ minWidth: "180px" }}
                      scope="col-3"
                    >
                      Unit of Measure
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedStockData.map((ele, i) => (
                    <tr key={i}>
                      <td>{ele.PLANT}</td>
                      <td>{ele.PLANT_DESC}</td>
                      <td>{ele.STORAGE_LOC}</td>
                      <td>{ele.STROAGE_DESC}</td>
                      <td>{ele.BATCH}</td>

                      <td>{ele.MATERIAL}</td>
                      <td>{ele.MATERIAL_DESC}</td>
                      <td>{ele.UNRESTRICTED}</td>
                      {/* <td>{ele.IN_QUAL_INSP}</td>
                      <td>{ele.RESTICTED_USE}</td>
                      <td>{ele.BLOCKED}</td> */}
                      <td>{ele.UOM}</td>
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
          pageCount={stockData.length / perPage}
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
    </div>
  );
}

const mapStateToProps = (state) => ({
  Auth: state.Auth,
});

export default connect(mapStateToProps, { loading })(StockOverViewReport);
