import React, { useState } from "react";
import { connect } from "react-redux";
import Swal from "sweetalert2";
import { loading } from "../../actions/loadingAction";
import http from "../../services/apicall";
import apis from "../../services/apis";

export const CFADepotUnMap = (props) => {
  const [codes, setCodes] = useState({
    DEPOT_CODE: "",
    CFA_CODE: "",
  });

  const validateDepotCode = (e) => {
    let DEPOT_CODE = e.target.value;
    DEPOT_CODE = DEPOT_CODE.toUpperCase().trim();
    if (DEPOT_CODE.length === 4) {
      props.loading(true);
      setCodes({ ...codes, DEPOT_CODE });
      http
        .post(apis.COMMON_POST_WITH_FM_NAME, {
          fm_name: "ZRFC_VALIDATE_DEPOT",
          params: {
            DEPOT_CODE,
          },
        })
        .then((res) => {
          if (res.data.result.EX_MESSAGE.TYPE === "E") {
            Swal.fire({
              title: "Oops...",
              icon: "error",
              text: res.data.result.EX_MESSAGE.MESSAGE,
            }).then(() => {
              setCodes({ ...codes, CFA_CODE: "" });
            });
          }
        })
        .catch((err) => {
          console.log(err);
        })
        .finally(() => {
          props.loading(false);
        });
    }
  };

  const validateCFACode = (e) => {
    let CFA_CODE = e.target.value;
    CFA_CODE = CFA_CODE.toUpperCase().trim();
    if (CFA_CODE.length === 8) {
      props.loading(true);
      setCodes({ ...codes, CFA_CODE });
      http
        .post(apis.COMMON_POST_WITH_FM_NAME, {
          fm_name: "ZRFC_VALIDATE_CFA",
          params: {
            CFA_CODE,
          },
        })
        .then((res) => {
          if (res.data.result.EX_MESSAGE.TYPE === "E") {
            Swal.fire({
              title: "Oops...",
              icon: "error",
              text: res.data.result.EX_MESSAGE.MESSAGE,
            }).then(() => {
              setCodes({ ...codes, CFA_CODE: "" });
            });
          }
        })
        .catch((err) => {
          console.log(err);
        })
        .finally(() => {
          props.loading(false);
        });
    }
  };

  const mapDepotCFA = (data) => {
    if (data.DEPOT_CODE === "" || data.CFA_CODE === "") {
      Swal.fire({
        title: "Oops...",
        icon: "error",
        text: "Please enter valid Depot Code and CFA Code",
      });
    } else {
      props.loading(true);
      http
        .post(apis.COMMON_POST_WITH_FM_NAME, {
          fm_name: "ZRFC_CFA_DELINK",
          params: { ...data },
        })
        .then((res) => {
          if (res.data.result.EX_MESSAGE.TYPE === "S") {
            Swal.fire({
              title: "Success",
              icon: "success",
              text: res.data.result.EX_MESSAGE.MESSAGE,
            })
              .then(() => {
                setCodes({ DEPOT_CODE: "", CFA_CODE: "" });
              })
              .then(() => {
                window.location.reload();
              });
          } else {
            Swal.fire({
              title: "Oops...",
              icon: "error",
              text: res.data.result.EX_MESSAGE.MESSAGE,
            });
          }
        })
        .catch((err) => {
          console.log(err);
        })
        .finally(() => {
          props.loading(false);
        });
    }
  };

  return (
    <div className="filter-section">
      <div className="row">
        <div className="col-12 col-md-6">
          <div className="row">
            <div className="col-12">
              <label className="filter-label">Depot Code</label>
              <input
                type="text"
                onChange={(e) => validateDepotCode(e)}
                style={{ textTransform: "uppercase" }}
              />
            </div>
          </div>
        </div>
        <div className="col-12 col-md-6">
          <div className="row">
            <div className="col-12">
              <label className="filter-label">CFA Code</label>
              <input
                type="text"
                onChange={(e) => validateCFACode(e)}
                style={{ textTransform: "uppercase" }}
              />
            </div>
          </div>
        </div>
        <div className="col-12 col-md-6">
          <div className="row">
            <div className="col-12">
              <button
                className="button goods-button"
                style={{ margin: "0", marginTop: "20px" }}
                onClick={() => mapDepotCFA(codes)}
              >
               Un Map
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const mapStateToProps = (state) => ({});

const mapDispatchToProps = {
  loading,
};

export default connect(mapStateToProps, mapDispatchToProps)(CFADepotUnMap);
