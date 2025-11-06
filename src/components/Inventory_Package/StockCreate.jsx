import React, { useEffect, useState } from "react";
import { connect } from "react-redux";

import Camera, { FACING_MODES } from "react-html5-camera-photo";
import "react-html5-camera-photo/build/css/index.css";
import Modal from "react-bootstrap/Modal";
import http from "../../services/apicall";
import apis from "../../services/apis";
import { useForm } from "react-hook-form";
import moment from "moment";
import { loading } from "../../actions/loadingAction";
import Swal from "sweetalert2";
import { useHistory } from "react-router-dom";
import Select from "react-select";
import allMaterials from "./allMaterials";
const { customAlphabet } = require("nanoid");
const alphabet = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const nanoid = customAlphabet(alphabet, 12);

const StockCreate = (props) => {
  let materialStructure = {
    IM_MATERIAL: "",
    IM_MATERIAL_DESC: "",
    IM_FRESH: "",
    IM_DAMAGE: "",
    IM_CUT_TORN: "",
    IM_IMAGE: "",
  };

  const history = useHistory();

  const [createdData, setCreatedData] = useState([
    {
      ...materialStructure,
    },
  ]);
  const [takePhoto, setTakePhoto] = useState(false);
  const [photoData, setPhotoData] = useState(null);
  const [allDepot, setAllDepot] = useState([]);
  const [depot, setDepot] = useState(null);
  const [approve, setApprove] = useState(false);
  const [view, setView] = useState(false);
  const [selectedDepot, setSelectedDepot] = useState([]);
  const [compReg, setCompReg] = useState({});

  const { register, errors, setValue, watch, triggerValidation } = useForm({
    mode: "onSubmit",
    reValidateMode: "onChange",
  });

  const watchAllFields = watch();

  function handleTakePhoto(dataUri) {
    // Do stuff with the photo...
    console.log("takePhoto", dataUri);
    setPhotoData(dataUri);
  }

  const handleSubmitImage = () => {
    let temp = [...createdData];
    let data = temp[temp.length - 1];
    http
      .post(apis.IMAGE_UPLOAD, {
        image: photoData,
        imageFormat: "PNG",
        material_code: data.IM_MATERIAL,
        cfa_code: localStorage.getItem("user_code"),
        depot_code: depot,
      })
      .then((res) => {
        console.log(res.data.id);
        setTakePhoto(false);
        temp[temp.length - 1].IM_IMAGE = res.data.id;
        setCreatedData(temp);
        setPhotoData(null);
      });
  };

  const getInitialData = (initial, params) => {
    props.loading(true);
    if (initial) {
      // http
      //   .post(apis.COMMON_POST_WITH_FM_NAME, {
      //     fm_name: "ZRFC_GET_DEPO",
      //     params: {
      //       IM_CFA_CODE: localStorage.getItem("user_code"),
      //     },
      //   })

      http
        .post("/rfc-reducer/get-cfa-user", {
          IM_CFA_CODE: localStorage.getItem("user_code"),
        })
        .then((res) => {
          if (res.data.code === 0) {
            if (res.data.code === 0) {
              // let data = res.data.result;
              let data = res.data.data;
              let depotData = [];
              data.EX_DEPO.forEach((item) => {
                depotData.push({
                  value: item.DEPOT,
                  label: item.DEPOT + " - " + item.DEPOT_NAME,
                });
              });

              setAllDepot(depotData);
              setSelectedDepot(depotData);

              setValue(
                "CFA_CODE",
                props.Auth.userdetails.user_code +
                  " - " +
                  props.Auth.userdetails.name
              );
            }
          }
        })
        .catch((err) => {})
        .finally(() => {
          props.loading(false);
        });
    } else {
      http
        .get(`/get-physical-inventory/${params.PHY_ID}`)
        .then((res) => {
          if (res.data.code === 0) {
            let data = res.data.data;
            let depotData = data.DEPOTS;
            console.log(depotData);

            setValue(
              "EX_DATE",
              moment(data.PHY_DATE, "YYYYMMDD").format("YYYY-MM-DD")
            );
            setValue(
              "EX_TIME",
              moment(data.PHY_TIME, "HHmmss").format("HH:mm")
            );
            setValue("EX_CFA", data.CFA_CODE + " - " + data.CFA_NAME);
            setValue("CFA_CODE", data.CFA_CODE + " - " + data.CFA_NAME);
            setAllDepot(depotData);
            setSelectedDepot(depotData);

            if (initial) {
            } else {
              setCreatedData(data.PHY_INVT);
              setApprove(true);
            }
          }
        })
        .catch((err) => {})
        .finally(() => {
          props.loading(false);
        });
    }
  };

  useEffect(() => {
    if (approve) {
      props.setInventoryName("Update");
    }
    if (view) {
      props.setInventoryName("View");
    }
  }, [approve, view]);

  useEffect(() => {
    // extract search params from url
    const searchParams = new URLSearchParams(window.location.search);

    let PHY_ID = searchParams.get("PHY_ID");
    let VIEW = searchParams.get("VIEW");

    if (PHY_ID) {
      getInitialData(false, {
        PHY_ID,
      });
    } else {
      getInitialData(true, {});
    }

    if (VIEW) {
      setView(true);
    }
  }, [window.location]);

  const createInventoryData = async (approve = false) => {
    try {
      props.loading(true);

      let PHY_TIME = moment(watch("EX_TIME"), "HH:mm").format("HHmmss");
      let PHY_DATE = moment(watch("EX_DATE"), "YYYY-MM-DD").format("YYYYMMDD");

      if (approve) {
        const searchParams = new URLSearchParams(window.location.search);

        let PHY_ID = searchParams.get("PHY_ID");

        // check selectedDepot is empty or not
        if (selectedDepot.length === 0) {
          Swal.fire({
            icon: "error",
            title: "Oops...",
            text: "Please select depot",
          });
          return;
        }

        const book_stock = await http.post(apis.COMMON_POST_WITH_FM_NAME, {
          fm_name: "ZRFC_GET_MAT_STK",
          params: {
            IM_DATA: selectedDepot.map((item) => {
              return {
                DEPOT: item.value,
                INVT_DATE: moment(watch("EX_DATE"), "YYYY-MM-DD").format(
                  "YYYYMMDD"
                ),
                INVT_TIME: moment(watch("EX_TIME"), "HH:mm").format("HHmmss"),
              };
            }),
          },
        });

        if (book_stock.data.code === 0) {
          let dataFormat = {
            PHY_INVT: createdData,
            BOOK_STOCK: book_stock.data.result.IT_DATA,
            DEPOTS: selectedDepot,
          };

          const physical_stock = await http.put(
            `/update-physical-inventory/${PHY_ID}`,
            {
              ...dataFormat,
            }
          );

          if (physical_stock.data.code === 0) {
            Swal.fire({
              icon: "success",
              title: "Success",
              text: "Inventory update successfully",
            }).then((res) => {
              history.push("/dashboard/physical-inventory/approve-inventory");
            });
          } else {
            Swal.fire({
              icon: "error",
              title: "Oops...",
              text: "Something went wrong!",
            });
          }

          console.log(dataFormat);
        } else {
          Swal.fire({
            icon: "error",
            title: "Oops...",
            text: "Something went wrong!",
          });
        }
      } else {
        // check date today or today - 1 or return
        if (
          moment(PHY_DATE, "YYYYMMDD").isBefore(moment().subtract(2, "days")) ||
          moment(PHY_DATE, "YYYYMMDD").isSame(moment().subtract(2, "days")) ||
          moment(PHY_DATE, "YYYYMMDD").isSame(moment()) ||
          moment(PHY_DATE, "YYYYMMDD").isAfter(moment())
        ) {
          Swal.fire({
            icon: "error",
            title: "Oops...",
            text: "Date must be today or T-1 day",
          });

          return;
        }

        // check selectedDepot is empty or not
        if (selectedDepot.length === 0) {
          Swal.fire({
            icon: "error",
            title: "Oops...",
            text: "Please select depot",
          });
          return;
        }

        let PHY_ID = nanoid();
        const book_stock = await http.post(apis.COMMON_POST_WITH_FM_NAME, {
          fm_name: moment(PHY_DATE, "YYYYMMDD").isSame(
            moment().format("YYYYMMDD")
          )
            ? "ZRFC_GET_MAT_STK"
            : "ZRFC_GET_MAT_STK_B",
          params: {
            IM_DATA: selectedDepot.map((item) => {
              return {
                DEPOT: item.value,
                INVT_DATE: PHY_DATE,
                INVT_TIME: moment(PHY_DATE, "YYYYMMDD").isSame(moment())
                  ? PHY_TIME
                  : "000000",
              };
            }),
          },
        });

        if (book_stock.data.code === 0) {
          let dataFormat = {
            PHY_ID,
            PHY_TIME,
            PHY_DATE,
            CFA_CODE: localStorage.getItem("user_code"),
            CFA_NAME: props.Auth.userdetails.name,
            COMP_CODE: compReg.BUKRS,
            COMP_NAME: compReg.COMP_NAME,
            REGION_CODE: compReg.REGION,
            REGION_NAME: compReg.REGIO_DESC,
            PHY_INVT: createdData,
            BOOK_STOCK: book_stock.data.result.IT_DATA,
            DEPOTS: selectedDepot,
          };

          const physical_stock = await http.post("/create-physical-inventory", {
            ...dataFormat,
          });

          if (physical_stock.data.code === 0) {
            Swal.fire({
              icon: "success",
              title: "Success",
              text: "Inventory created successfully",
            }).then((res) => {
              history.push("/dashboard/physical-inventory/display-inventory");
            });
          } else {
            Swal.fire({
              icon: "error",
              title: "Oops...",
              text: "Something went wrong!",
            });
          }

          console.log(dataFormat);
        } else {
          Swal.fire({
            icon: "error",
            title: "Oops...",
            text: "Something went wrong!",
          });
        }
      }
    } catch (error) {
      console.log(error);
    } finally {
      props.loading(false);
    }
  };

  const checkOneValueNotZero = (index) => {
    console.log(index);
    let temp = [...createdData];
    let data = temp[index];
    console.log(data);
    if (
      data.IM_FRESH ||
      data.IM_DAMAGE ||
      data.IM_CUT_TORN ||
      data.IM_MATERIAL
    ) {
      return true;
    }
    return false;
  };

  const changeValue = (e, index) => {
    let temp = [...createdData];

    // checking if any value is not negative
    if (e.target.value >= 0) {
      temp[index][e.target.name] = e.target.value;
      setCreatedData(temp);
    }
  };

  const openImage = (id) => {
    http.get(`${apis.GET_IMAGE}/${id}`).then((res) => {
      // open res in a new tab with img tag
      let imageWindow = window.open("");
      // title of the new tab
      imageWindow.document.write(`<title>Image</title>`);
      // turn of the loading
      imageWindow.document.write(
        `<style>body{margin:0;padding:0;}img{margin:auto;display:block}</style>`
      );

      imageWindow.document.write(`<img src='${res.data.image}' />`);
    });
  };

  const getCompReg = async () => {
    try {
      props.loading(true);
      // const res = await http.post(apis.COMMON_POST_WITH_FM_NAME, {
      //   fm_name: "ZRFC_GET_CFA_COMPREG",
      //   params: {
      //     CFA_CODE: localStorage.getItem("user_code"),
      //   },
      // });
      // if (res.data.code === 0) {
      //   setCompReg(res.data.result);
      // }
      const res = await http.post("/rfc-reducer/get-company-cfa-reg", {
        CFA_CODE: localStorage.getItem("user_code"),
      });
      if (res.data.code === 0) {
        setCompReg(res.data.data);
      }
    } catch (error) {
      console.log(error);
      getCompReg();
    } finally {
      props.loading(false);
    }
  };

  useEffect(() => {
    getCompReg();
  }, []);

  useEffect(() => {
    // trigger validation when date is changed
    // validation will be not excessed t-1 date selected
    watchAllFields.EX_DATE && triggerValidation("EX_DATE");
  }, [watchAllFields.EX_DATE]);

  return (
    <div className="filter-section">
      <div className="row">
        {(view || approve) && (
          <div className="col-12 col-md-12">
            <div className="row">
              <div className="col-12">
                <button
                  style={{
                    border: "none",
                    backgroundColor: "transparent",
                    color: "green",
                    outline: "none",
                    fontSize: "1.4rem",
                  }}
                  onClick={() => {
                    // props.history.push("/dashboard/physical-inventory");
                    history.goBack();
                  }}
                >
                  <b>{"<-  Back"}</b>
                </button>
              </div>
            </div>
          </div>
        )}
        <div className="col-12 col-md-12">
          <div className="row">
            <div className="col-12">
              <label>
                Depot Code and Name<span>*</span>
              </label>
            </div>
            <div className="col-12 depot-select">
              <Select
                className="basic-multi-select"
                classNamePrefix="select"
                isMulti
                options={allDepot}
                defaultValue={allDepot}
                key={allDepot}
                onChange={(e) => {
                  setSelectedDepot(e);
                }}
                isDisabled={view}
              />
            </div>
          </div>
        </div>

        <div className="col-12 col-md-4">
          <div className="row">
            <div className="col-12">
              <label>
                CFA<span>*</span>
              </label>
            </div>
            <div className="col-12">
              <input
                type="text"
                disabled
                ref={register({
                  required: true,
                })}
                name="CFA_CODE"
              />
            </div>
          </div>
        </div>
        <div className="col-12 col-md-4">
          <div className="row">
            <div className="col-12">
              <label>
                Date<span>*</span>
              </label>
            </div>
            <div className="col-12">
              <input
                type="date"
                ref={register({
                  validate: (value) => {
                    // checking if date is not less than t-1 date
                    if (
                      moment(value).isBefore(moment().subtract(2, "days")) ||
                      moment(value).isSame(moment().subtract(2, "days")) ||
                      moment(value).isSame(moment()) ||
                      moment(value).isAfter(moment())
                    ) {
                      return false;
                    } else {
                      return true;
                    }
                  },
                })}
                defaultValue={moment().format("YYYY-MM-DD")}
                name="EX_DATE"
                // disable future date
                max={moment().format("YYYY-MM-DD")}
                min={moment().subtract(1, "days").format("YYYY-MM-DD")}
                // error message
                disabled={view || approve}
              />
              {errors.EX_DATE && !view && (
                <p style={{ color: "red" }}>
                  Date should not be less than T-1 date and not greater
                </p>
              )}

              <input
                type="time"
                ref={register({
                  required: true,
                  max: moment().format("HH:mm"),
                })}
                defaultValue={moment().format("HH:mm")}
                name="EX_TIME"
                // disable future date
                hidden
              />
            </div>
          </div>
        </div>
      </div>
      <br />

      <div className="row">
        <div className="col-12">
          <div className="background" style={{ margin: 0 }}>
            <div
              className="table-div stock-create"
              style={{ minHeight: "auto" }}
            >
              <table className="table" style={{ margin: "10px 0" }}>
                <thead>
                  <tr>
                    <th>Material Group</th>
                    <th>Fresh (T)</th>
                    <th>Damage (T)</th>
                    <th>Cut and Torn (T)</th>
                    <th>Image</th>
                    {createdData.length > 1 && !view && <th>Delete</th>}
                  </tr>
                </thead>
                <tbody>
                  {createdData.map((ele, i) => (
                    <React.Fragment key={i}>
                      <tr key={i}>
                        <td>
                          <div style={{ position: "relative" }}>
                            <i className="fas fa-angle-down icons"></i>
                            <select
                              key={`material-${i}`}
                              onChange={(e) => {
                                let temp = [...createdData];
                                temp[i].IM_MATERIAL = e.target.value;
                                temp[i].IM_MATERIAL_DESC = e.target.options[
                                  e.target.selectedIndex
                                ].text
                                  ?.split("-")[1]
                                  ?.trim();

                                setCreatedData(temp);
                              }}
                              value={ele.IM_MATERIAL ? ele.IM_MATERIAL : 0}
                              disabled={view}
                            >
                              <option value="-1">Select Material Group</option>
                              {allMaterials.map((ele, i) => (
                                <option
                                  value={ele.MATNR}
                                  key={i}
                                  disabled={createdData
                                    .map((ele) => ele.IM_MATERIAL)
                                    .includes(ele.MATNR)}
                                >
                                  {ele.MATNR?.replace(/^0+/, "")} - {ele.MAKTX}
                                </option>
                              ))}
                            </select>
                          </div>
                        </td>
                        <td>
                          <input
                            type="number"
                            value={ele.IM_FRESH ? ele.IM_FRESH : 0}
                            name="IM_FRESH"
                            onFocus={(e) => e.target.select()}
                            onChange={(e) => changeValue(e, i)}
                            disabled={view}
                          />
                        </td>

                        <td>
                          <input
                            type="number"
                            value={ele.IM_DAMAGE ? ele.IM_DAMAGE : 0}
                            name="IM_DAMAGE"
                            onFocus={(e) => e.target.select()}
                            onChange={(e) => changeValue(e, i)}
                            disabled={view}
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            value={ele.IM_CUT_TORN ? ele.IM_CUT_TORN : 0}
                            name="IM_CUT_TORN"
                            onFocus={(e) => e.target.select()}
                            onChange={(e) => changeValue(e, i)}
                            disabled={view}
                          />
                        </td>
                        <td>
                          {takePhoto ? (
                            <Modal
                              show={true}
                              centered
                              onHide={() => setTakePhoto(!takePhoto)}
                            >
                              <Modal.Header closeButton>
                                <Modal.Title>Take Photo</Modal.Title>
                              </Modal.Header>
                              {photoData ? (
                                <img src={photoData} alt="img" />
                              ) : (
                                <Camera
                                  onTakePhoto={(dataUri) => {
                                    handleTakePhoto(dataUri);
                                  }}
                                  imageType="jpg"
                                  idealFacingMode={FACING_MODES.ENVIRONMENT}
                                />
                              )}
                              <Modal.Footer>
                                {photoData ? (
                                  <>
                                    <div
                                      style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                      }}
                                    >
                                      <button
                                        className="button button-foreword"
                                        style={{
                                          marginRight: "0px",
                                          padding: "10px",
                                        }}
                                        onClick={() => handleSubmitImage()}
                                      >
                                        Save
                                      </button>
                                      <button
                                        className="button button-foreword"
                                        style={{
                                          marginRight: "0px",
                                          padding: "10px",
                                        }}
                                        onClick={() => setPhotoData(null)}
                                      >
                                        Retake
                                      </button>
                                    </div>
                                  </>
                                ) : (
                                  <button
                                    className="button button-foreword"
                                    onClick={() => setTakePhoto(!takePhoto)}
                                  >
                                    Close
                                  </button>
                                )}
                              </Modal.Footer>
                            </Modal>
                          ) : ele.IM_IMAGE ? (
                            <button
                              className="button"
                              style={{
                                margin: "0 auto",
                                padding: "7px 10px",
                                background: "transparent",
                              }}
                              onClick={() => openImage(ele.IM_IMAGE)}
                            >
                              {/* view icon */}
                              <i
                                className="fas fa-eye"
                                style={{ color: "black" }}
                              ></i>
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                if (createdData[i].IM_MATERIAL) {
                                  setTakePhoto(!takePhoto);
                                } else {
                                  Swal.fire({
                                    icon: "error",
                                    title: "Oops...",
                                    text: "Please select material first!",
                                  });
                                }
                              }}
                              disabled={view}
                              className="button"
                              style={{
                                margin: "0 auto",
                                padding: "7px 10px",
                                background: "transparent",
                              }}
                            >
                              <i
                                className="fas fa-camera"
                                style={{ color: "black" }}
                              ></i>
                            </button>
                          )}
                        </td>
                        {createdData.length > 1 && !view && (
                          <td>
                            <button
                              className="button button-foreword"
                              style={{
                                margin: "0 auto",
                                padding: "7px 10px",
                                background: "transparent",
                              }}
                              onClick={() => {
                                Swal.fire({
                                  title: "Are you sure?",
                                  text: "You won't be able to revert this!",
                                  icon: "warning",
                                  showCancelButton: true,
                                  confirmButtonColor: "#3085d6",
                                  cancelButtonColor: "#d33",
                                  confirmButtonText: "Yes, delete it!",
                                }).then((result) => {
                                  if (result.value) {
                                    let temp = [...createdData];
                                    temp.splice(i, 1);
                                    setCreatedData(temp);
                                  }
                                });
                              }}
                            >
                              <i
                                className="fas fa-trash"
                                style={{ color: "black" }}
                              ></i>
                            </button>
                          </td>
                        )}
                      </tr>
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
              {!view && (
                <div className="row">
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      width: "100%",
                      margin: "10px 10px",
                    }}
                  >
                    <button
                      className="button button-foreword"
                      style={{
                        margin: "0 0px",
                        padding: "7px 10px",
                        fontSize: "15px",
                      }}
                      onClick={() => {
                        if (
                          !createdData[createdData.length - 1].IM_MATERIAL ||
                          !checkOneValueNotZero(createdData.length - 1)
                        ) {
                          Swal.fire({
                            icon: "error",
                            title: "Oops...",
                            text: "Please fill all the fields",
                          });
                        } else {
                          if (approve) {
                            setCreatedData([
                              ...createdData,
                              { ...materialStructure, addedOnApprove: true },
                            ]);
                          } else {
                            setCreatedData([
                              ...createdData,
                              { ...materialStructure },
                            ]);
                          }
                        }
                      }}
                    >
                      Add Row
                    </button>
                  </div>
                </div>
              )}
            </div>
            <div className="row">
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  width: "100%",
                  margin: "10px 10px",
                }}
              >
                {!view && (
                  <button
                    className="button button-foreword"
                    onClick={() => {
                      if (!checkOneValueNotZero(createdData.length - 1)) {
                        Swal.fire({
                          icon: "error",
                          title: "Oops...",
                          text: "Please fill all the fields",
                        });
                      } else {
                        Swal.fire({
                          title: "Are you sure?",
                          text: `Do you want to ${
                            approve ? "update" : "add"
                          } the data`,
                          icon: "warning",
                          showCancelButton: true,
                          confirmButtonColor: "#3085d6",
                          cancelButtonColor: "#d33",
                          confirmButtonText: "Yes",
                        }).then((result) => {
                          if (result.value) {
                            if (approve) {
                              createInventoryData(true);
                            } else {
                              createInventoryData(false);
                            }
                          }
                        });
                      }
                    }}
                  >
                    {approve ? "Update" : "Save"}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const mapStateToProps = (state) => ({
  Auth: state.Auth,
});

const mapDispatchToProps = {
  loading,
};

export default connect(mapStateToProps, mapDispatchToProps)(StockCreate);
