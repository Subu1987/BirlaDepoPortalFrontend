import React, { useEffect, useState } from "react";
import Modal from "react-bootstrap/Modal";
import { Controller, useForm } from "react-hook-form";
import { connect } from "react-redux";
import { useHistory } from "react-router";
import Select from "react-select";
import Swal from "sweetalert2";
import { loading } from "../../actions/loadingAction";
import filterDataReport from "../../Functions/filterDataReport";
import http from "../../services/apicall";
import apis from "../../services/apis";
import ModalSalesRegister from "../Report/Modal";

function Diversion(props) {
  const [VBELN, setVBELN] = useState("");
  const [soldToParty, setSoldToParty] = useState("");
  const [quantity, setQuantity] = useState(0);
  const [disabled, setDisabled] = useState(false);
  const [remain, setRemain] = useState(0);
  const [UOM, setUOM] = useState("");
  const [shipToPartyOptions, setShipToPartyOptions] = useState([]);
  const [shipToPartyOne, setShipToPartyOne] = useState([]);
  const [shipToPartyTwo, setShipToPartyTwo] = useState([]);
  const [shipToPartyThree, setShipToPartyThree] = useState([]);
  const [allShipToParty, setAllShipToParty] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [name, setName] = useState("");
  const [header, setHeader] = useState({
    title: "Demo Title",
    name: "Demo Name",
    desc: "Demo Desc",
  });
  const [modalData, setModalData] = useState([]);
  const [status, setStatus] = useState(false);
  let helo = "2319135459";
  const {
    handleSubmit,
    register,
    control,
    errors,
    getValues,
    setValue,
    watch,
  } = useForm();

  const history = useHistory();
  const watchAllFields = watch();

  useEffect(() => {
    console.log("Diversion Click a rfc called");
    diversionAuth();
  }, []);

  const diversionAuth = () => {
    props.loading(true);
    http
      .post(apis.COMMON_POST_WITH_FM_NAME, {
        fm_name: "ZRFC_SHP_DIVERSION_AUTH",
        params: { IM_LOGIN_ID: localStorage.getItem("user_code") },
      })
      .then((res) => {
        if (res.data.result?.EX_RETURN[0]?.TYPE === "E") {
          let errmsg = res.data.result?.EX_RETURN.filter(
            (e) => e.TYPE === "E" || e.TYPE === "I"
          );
          let msg = "";
          errmsg.forEach((element, i) => {
            msg += `<p> ${element.MESSAGE} </p>`;
          });
          Swal.fire({
            title: "Error!",
            html: msg,
            icon: "error",
            confirmButtonText: "Ok",
          }).then(() => {
            history.replace("/dashboard/root");
          });
        } else {
          console.log("No Error Found");
        }
      })
      .catch((err) => diversionAuth())
      .finally(() => props.loading(false));
  };

  const formSubmit = () => {
    props.loading(true);
    http
      .post(apis.COMMON_POST_WITH_FM_NAME, {
        fm_name: "ZRFC_SHP_DIV_DELV_DET_FETCH",
        params: {
          IM_VBELN: VBELN,
          IM_LOGIN_ID: localStorage.getItem("user_code"),
        },
      })
      .then((res) => {
        if (res.data.result?.EX_FINAL.length !== 0) {
          diversionSetValue(res.data.result?.EX_FINAL[0]);
          setStatus(true);
        } else {
          setStatus(false);
          errorFinding(res.data.result?.EX_RETURN);
        }
      })
      .catch((err) => console.log(err))
      .finally(() => {
        props.loading(false);
      });
  };

  const fetchUpdateData = () => {
    props.loading(true);
    http
      .post(apis.COMMON_POST_WITH_FM_NAME, {
        fm_name: "ZRFC_SHP_DIVERSION_FETCH",
        params: {
          IM_VBELN: VBELN,
          // IM_LOGIN_ID: localStorage.getItem("user_code"),
        },
      })
      .then((res) => {
        if (Object.keys(res.data.result).length > 0) {
          let value = res.data.result;
          updateValue("IM_SHIP1", value?.EX_SHIP1);
          updateValue("IM_SHIP2", value?.EX_SHIP2);
          updateValue("IM_SHIP3", value?.EX_SHIP3);

          setValue("IM_QTY1", value?.EX_QTY1);
          setValue("IM_QTY2", value?.EX_QTY2);
          setValue("IM_QTY3", value?.EX_QTY3);
        }
      })
      .catch((err) => console.log(err))
      .finally(() => {
        props.loading(false);
        setStatus(false);
      });
  };

  const saveDiversion = (data) => {
    let totalQuantity = Number(quantity);
    let qty1 = Number(watchAllFields.IM_QTY1);
    let qty2 = Number(watchAllFields.IM_QTY2);
    let qty3 = Number(watchAllFields.IM_QTY3);
    let party1 = watchAllFields.IM_SHIP1;
    let party2 = watchAllFields.IM_SHIP2;
    let party3 = watchAllFields.IM_SHIP3;

    if (totalQuantity >= qty1 + qty2 + qty3) {
      if (
        (party1 !== party2 && party2 !== party3 && party3 !== party1) ||
        (party2 === "" && party3 === "")
      ) {
        props.loading(true);
        let payload = data;
        payload.IM_QTY1 = Number(payload.IM_QTY1);
        payload.IM_QTY2 = Number(payload.IM_QTY2);
        payload.IM_QTY3 = Number(payload.IM_QTY3);
        http
          .post(apis.COMMON_POST_WITH_FM_NAME, {
            fm_name: "ZRFC_SHP_DIVERSION_SAVE",
            params: payload,
          })
          .then((res) => {
            console.log(res.data.result?.EX_RETURN);
            let errmsg = res.data.result?.EX_RETURN.filter(
              (e) => e.TYPE === "S"
            );
            let msg = "";
            errmsg.forEach((element, i) => {
              msg += `<p>${element.MESSAGE} </p>`;
            });
            Swal.fire("Success", msg, "success").then(() =>
              window.location.reload()
            );
          })
          .catch((err) => {
            console.log(err);
            saveDiversion(data);
          })
          .finally(() => props.loading(false));
        console.log(data);
        // }
      } else {
        Swal.fire("Error", "Ship to party should not be same", "error");
      }
    } else {
      Swal.fire(
        "Error",
        "Quantity should not exceed total delivery quantity",
        "error"
      );
    }
  };

  const diversionSetValue = (value) => {
    setSoldToParty(value?.KUNAG);
    setQuantity(value?.LFIMG);
    setRemain(value?.LFIMG);
    setValue("IM_VBELN", value?.VBELN);
    setValue("IM_UOM", value?.VRKME);
    setUOM(value?.VRKME);
  };

  const fetchShipToParty = () => {
    props.loading(true);
    http
      .post(apis.GET_SHIP_TO_PARTY, {
        lv_customer: soldToParty,
      })
      .then((res) => setAllShipToParty(res.data.result.IT_FINAL))
      .catch((err) => console.log(err))
      .finally(() => props.loading(false));
  };

  useEffect(() => {
    setShipToPartyOptions(filterDataReport(allShipToParty, "KUNNR", "NAME1"));
  }, [allShipToParty]);

  useEffect(() => {
    if (soldToParty !== "") {
      fetchShipToParty();
    }
  }, [soldToParty]);

  useEffect(() => {
    if (shipToPartyOptions.length > 0 && VBELN !== "" && status) {
      fetchUpdateData();
    }
  }, [shipToPartyOptions, VBELN, status]);

  useEffect(() => {
    let totalQuantity = Number(quantity);
    let qty1 = Number(watchAllFields.IM_QTY1);
    let qty2 = Number(watchAllFields.IM_QTY2);
    let qty3 = Number(watchAllFields.IM_QTY2);

    if (
      totalQuantity.toFixed(2) < (qty1 + qty2 + qty3).toFixed(2) &&
      totalQuantity !== 0
    ) {
      setDisabled(true);
    } else if (totalQuantity.toFixed(2) <= qty1.toFixed(2)) {
      setDisabled(true);
    } else {
      setDisabled(false);
    }
  }, [watchAllFields, quantity, remain]);

  const errorFinding = (data) => {
    let errmsg = data.filter((e) => e.TYPE === "E" || e.TYPE === "I");
    let msg = "";
    errmsg.forEach((element, i) => {
      msg += `<p> ${element.MESSAGE} </p>`;
    });
    Swal.fire({
      title: "Error!",
      html: msg,
      icon: "error",
      confirmButtonText: "Ok",
    }).then(() => window.location.reload());
  };

  const handleChange = (value, key) => {
    setValue(key, value?.value);
    if (key === "IM_SHIP1") {
      setShipToPartyOne(value);
    } else if (key === "IM_SHIP2") {
      setShipToPartyTwo(value);
    } else {
      setShipToPartyThree(value);
    }
  };

  const updateValue = (key, value) => {
    setValue(key, value);
    if (value !== "") {
      if (key === "IM_SHIP1") {
        setShipToPartyOne(updateShipToParty(value));
      } else if (key === "IM_SHIP2") {
        setShipToPartyTwo(updateShipToParty(value));
      } else {
        setShipToPartyThree(updateShipToParty(value));
      }
    } else {
      if (key === "IM_SHIP1") {
        setShipToPartyOne([]);
      } else if (key === "IM_SHIP2") {
        setShipToPartyTwo([]);
      } else {
        setShipToPartyThree([]);
      }
    }
  };

  const updateShipToParty = (value) => {
    let data = shipToPartyOptions.filter((ele) => ele.value === value);
    return data[0];
  };

  return (
    <div className="container-fluid">
      <div className="filter-section" style={{ marginTop: "0px" }}>
        <div>
          <div className="row">
            <div className="col">
              <div className="row">
                <div className="col-3">
                  <label>
                    Delivery Number
                    <span>*</span>
                  </label>
                </div>
                <div className="col-9">
                  <input
                    ref={register}
                    value={VBELN}
                    placeholder="Delivery Number"
                    type="number"
                    onChange={(e) => setVBELN(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.keyCode === 13) {
                        formSubmit();
                      }
                    }}
                  />
                </div>
              </div>
              <div className="row">
                {soldToParty !== "" && (
                  <>
                    <p>
                      Sold to party: {soldToParty}
                      <br />
                      Delivered Quantity: {quantity}
                    </p>
                  </>
                )}
              </div>
            </div>
            <div className="col">
              <div className="row">
                <div className="col">
                  <button
                    className="search-button float-right"
                    onClick={formSubmit}
                    disabled={VBELN === ""}
                  >
                    <i className="fas fa-search icons-button"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div
        className="filter-section"
        style={{ backgroundColor: "#fff", borderRadius: "2pc" }}
      >
        <form
          onSubmit={handleSubmit((data) => saveDiversion(data))}
          className="filter-div"
        >
          <div className="" style={{ margin: "0px 20px" }}>
            <label>Ship to Party 1</label>
            <hr
              className="blue"
              style={{ border: "1px solid #0099ff", margin: "0px" }}
            />
            <div className="row">
              <div className="col-6">
                <div className="row">
                  <input type="hidden" ref={register} name="IM_VBELN" />
                  <div className="col-3 ">
                    <label className="">Party Name 1</label>
                  </div>
                  <div className="col-8">
                    <i
                      className="far fa-clone click-icons"
                      onClick={() => {
                        setModalVisible(true);
                        setModalData(shipToPartyOptions);
                        setName("IM_SHIP1");
                        setHeader({
                          title: "Part Name 1",
                          name: "Ship to party code",
                          desc: "Ship to party description",
                        });
                      }}
                    ></i>
                    <Controller
                      as={({ onChange, value }) => (
                        <Select
                          classNamePrefix="react-select"
                          value={shipToPartyOne}
                          onChange={(event) => handleChange(event, "IM_SHIP1")}
                          options={shipToPartyOptions}
                          placeholder="Ship to party"
                          isClearable
                        />
                      )}
                      defaultValue=""
                      control={control}
                      rules={{ required: "Party 1 is Required" }}
                      name="IM_SHIP1"
                    />
                    <p style={{ color: "red", marginBottom: "0px" }}>
                      {errors.IM_SHIP1 && errors.IM_SHIP1?.message}
                    </p>
                  </div>
                </div>
                <div className="row">
                  <div className="col-3 ">
                    <label className="">Quantity 1</label>
                  </div>
                  <div className="col-2">
                    <input
                      type="number"
                      step="any"
                      placeholder="Quantity"
                      // defaultValue="0"
                      ref={register({
                        required: "Quantity 1 is required",
                        max: {
                          value: quantity,
                          message:
                            "Quantity should not exceed total delivery quantity",
                        },
                      })}
                      style={{ margin: "10px 0px" }}
                      name="IM_QTY1"
                    />
                  </div>
                </div>
                <div className="row">
                  <div className="offset-3">
                    <p style={{ color: "red", marginBottom: "0px" }}>
                      {errors.IM_QTY1 && errors.IM_QTY1?.message}
                    </p>
                  </div>
                </div>
                <div className="row">
                  <div className="col-3 ">
                    <label className="">UOM 1</label>
                  </div>
                  <div className="col-2">
                    <input
                      type="text"
                      disabled
                      style={{ margin: "10px 0px" }}
                      defaultValue={UOM}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="" style={{ margin: "0px 20px" }}>
            <label>Ship to Party 2</label>
            <hr
              className="blue"
              style={{ border: "1px solid #0099ff", margin: "0px" }}
            />
            <div className="row">
              <div className="col-6">
                <div className="row">
                  <div className="col-3 ">
                    <label className="">Party Name 2</label>
                  </div>
                  <div className="col-8">
                    <i
                      className="far fa-clone click-icons"
                      onClick={() => {
                        setModalVisible(true);
                        setModalData(shipToPartyOptions);
                        setName("IM_SHIP2");
                        setHeader({
                          title: "Part Name 2",
                          name: "Ship to party code",
                          desc: "Ship to party description",
                        });
                      }}
                    ></i>
                    <Controller
                      as={({ onChange, value }) => (
                        <Select
                          classNamePrefix="react-select"
                          value={shipToPartyTwo}
                          onChange={(event) => handleChange(event, "IM_SHIP2")}
                          options={shipToPartyOptions}
                          isDisabled={Number(watchAllFields.IM_QTY1) === 0}
                          placeholder="Ship to party"
                        />
                      )}
                      disabled={true}
                      defaultValue=""
                      control={control}
                      name="IM_SHIP2"
                    />
                  </div>
                </div>
                <div className="row">
                  <div className="col-3 ">
                    <label className="">Quantity 2</label>
                  </div>
                  <div className="col-2">
                    <input
                      type="number"
                      step="any"
                      placeholder="Quantity"
                      ref={register({})}
                      disabled={Number(watchAllFields.IM_QTY1) === 0}
                      style={{ margin: "10px 0px" }}
                      name="IM_QTY2"
                    />
                  </div>
                </div>
                <div className="row">
                  <div className="col-3 ">
                    <label className="">UOM 2</label>
                  </div>
                  <div className="col-2">
                    <input
                      type="text"
                      disabled
                      style={{ margin: "10px 0px" }}
                      //   name="IM_UOM"
                      defaultValue={UOM}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="" style={{ margin: "0px 20px" }}>
            <label>Ship to Party 3</label>
            <hr
              className="blue"
              style={{ border: "1px solid #0099ff", margin: "0px" }}
            />
            <div className="row">
              <div className="col-6">
                <div className="row">
                  <div className="col-3 ">
                    <label className="">Party Name 3</label>
                  </div>
                  <div className="col-8">
                    <i
                      className="far fa-clone click-icons"
                      onClick={() => {
                        setModalVisible(true);
                        setModalData(shipToPartyOptions);
                        setName("IM_SHIP3");
                        setHeader({
                          title: "Part Name 3",
                          name: "Ship to party code",
                          desc: "Ship to party description",
                        });
                      }}
                    ></i>
                    <Controller
                      as={({ onChange, value }) => (
                        <Select
                          classNamePrefix="react-select"
                          value={shipToPartyThree}
                          onChange={(event) => handleChange(event, "IM_SHIP3")}
                          options={shipToPartyOptions}
                          placeholder="Ship to party"
                          isDisabled={
                            Number(watchAllFields.IM_QTY1) === 0 ||
                            Number(watchAllFields.IM_QTY2) === 0
                          }
                        />
                      )}
                      defaultValue=""
                      control={control}
                      name="IM_SHIP3"
                    />
                  </div>
                </div>
                <div className="row">
                  <div className="col-3 ">
                    <label className="">Quantity 3</label>
                  </div>
                  <div className="col-2">
                    <input
                      step="any"
                      type="number"
                      ref={register({})}
                      style={{ margin: "10px 0px" }}
                      name="IM_QTY3"
                      placeholder="Quantity"
                      disabled={
                        Number(watchAllFields.IM_QTY1) === 0 ||
                        Number(watchAllFields.IM_QTY2) === 0
                      }
                    />
                  </div>
                </div>
                <div className="row">
                  <div className="col-3 ">
                    <label className="">UOM 3</label>
                  </div>
                  <div className="col-2">
                    <input
                      type="text"
                      disabled
                      ref={register}
                      style={{ margin: "10px 0px" }}
                      name="IM_UOM"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col">
              <button
                type="submit"
                className="button-foreword  button float-right"
              >
                Save
              </button>
            </div>
          </div>
        </form>
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

export default connect(mapStateToProps, { loading })(Diversion);
