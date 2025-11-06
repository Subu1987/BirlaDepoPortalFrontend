import moment from "moment";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { connect } from "react-redux";
import { useHistory, useLocation, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import { loading } from "../../actions/loadingAction";
import http from "../../services/apicall";
import { getUrlParams } from "../../services/utils";
import ApproveReject from "./ApproveReject";
import ClaimIntimation from "./ClaimIntimation";

export const RakeInsuranceData = (props) => {
  const [alreadySaved, setAlreadySaved] = useState(false);
  const [savedData, setSavedData] = useState({});
  const [calculateData, setCalculateData] = useState({
    DMG_PER: 0,
  });
  const [disabledInput, setDisabledInput] = useState(false);
  const [claimModel, setClaimModel] = useState(false);

  const { register, setValue, handleSubmit } = useForm({
    mode: "onSubmit",
    reValidateMode: "onChange",
  });

  const history = useHistory();

  const { id } = useParams();

  useEffect(() => {
    if (id) {
      getRakeDetails(id);
    } else {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Please select a Rake",
      }).then(() => {
        history.goBack();
      });
    }
  }, [id]);

  const getRakeDetails = (RR_NO) => {
    let url = "/get-rake-data/" + RR_NO;
    props.loading(true);

    http
      .get(url)
      .then((res) => {
        if (res.data.code === 0) {
          setAlreadySaved(true);
          setSavedData(res.data.data);

          let data = res.data.data;

          // total dispatch qty from data.document
          let totalDispatchQty = data.DOCUMENT.reduce(
            (acc, curr) => acc + +curr.GR_QTY,
            0
          );

          totalDispatchQty = totalDispatchQty.toFixed(2);

          setValue("GR_QTY", totalDispatchQty);

          setValue("RR_QTY", Number(data.RR_QTY).toFixed(2));
          setValue("RR_NO", data.RR_NO);
          setValue("RR_DATE", moment(data.RR_DATE).format("YYYY-MM-DD"));

          if (!+data.RR_QTY) {
            Swal.fire({
              icon: "error",
              title: "Oops...",
              text: "RR_QTY is not available for this material document!",
            }).then(() => {
              history.goBack();
            });
          }

          // calculate TOTAL_DMG and RR_QTY
          // if TOTAL_DMG is more than 2% of RR_QTY, then proceed

          // total damage qty from data.document
          let totalDamageQty = data.DOCUMENT.reduce(
            (acc, curr) => acc + +curr.TOTAL_DMG,
            0
          );

          let DMG_PER = (totalDamageQty / data.RR_QTY) * 100;

          setValue("CLAIM_PER", DMG_PER.toFixed(2));

          setCalculateData({
            ...calculateData,
            DMG_PER,
          });

          if (DMG_PER > 2) {
          } else {
         
          }

          if (data.DAMAGE_DATA.length > 0) {
          } else {
            Swal.fire({
              icon: "error",
              title: "Oops...",
              text: "Please enter damage details for the RR then claim insurance!",
            }).then(() => {
              history.goBack();
            });
          }

          setValue("CLAIM_STATUS", data.CLAIM_STATUS);
          if (data.CLAIM_DATE) setValue("CLAIM_DATE", data.CLAIM_DATE);
          setValue("CLAIM_AMOUNT", data.CLAIM_AMOUNT);
          setValue("CLAIM_NO", data.CLAIM_NO);
          setValue("CLAIM_QTY", data.CLAIM_QTY);
        }
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        props.loading(false);
      });
  };

  const onSubmit = (data) => {
    let postData = {
      ...data,
      sendMail: true,
      CLAIMED: true,
    };

    props.loading(true);

    let url = "update-rake-data/" + id;

    http
      .post(url, postData)
      .then((res) => {
        Swal.fire({
          icon: "success",
          title: "Success",
          text: alreadySaved
            ? "Data Updated Successfully"
            : "Data Saved Successfully",
        }).then(() => {
          history.goBack();
        });
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        props.loading(false);
      });
  };

  // detect the query string
  const useQuery = () => {
    return new URLSearchParams(useLocation().search);
  };

  const query = useQuery();

  useEffect(() => {
    // string to boolean

    setDisabledInput(!!query.get("editOnly"));
  }, []);

  return (
    <div
      style={{
        padding: "20px 20px 40px 20px",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          padding: "20px 20px 40px 20px",
        }}
      >
        <button
          style={{
            border: "none",
            backgroundColor: "transparent",
            color: "green",
            outline: "none",
            fontSize: "1.4rem",
          }}
          onClick={() => {
            history.goBack();
          }}
        >
          <b>&lt;- Back</b>
        </button>
        <h5
          style={{
            textAlign: "center",
            marginBottom: "0px",
          }}
        >
          Claim Insurance
        </h5>
        <div></div>
      </div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div
          style={{
            border: "1px solid #ccc",
            padding: "20px 2px",
            borderRadius: "5px",
            position: "relative",
            background: "#c9c9c9",
          }}
        >
          <p
            style={{
              textAlign: "center",
              position: "absolute",
              marginBottom: "0px",
              top: "-12px",
              left: "10px",
              background: "rgb(155, 155, 155)",
              borderRadius: "5px",
              padding: "0px 10px",
            }}
          >
            Headers
          </p>
          <div className="row">
            <div className="col-12 col-md-2">
              <div className="row">
                <div className="col-12">
                  <label>RR Number</label>
                </div>
                <div className="col-12 depot-select">
                  <input disabled ref={register} name="RR_NO" type="text" />
                </div>
              </div>
            </div>
            <div className="col-12 col-md-3">
              <div className="row">
                <div className="col-12">
                  <label>Total Dispatch Quantity</label>
                </div>
                <div className="col-12 depot-select">
                  <input disabled ref={register} name="GR_QTY" type="number" />
                </div>
              </div>
            </div>
            <div className="col-12 col-md-2">
              <div className="row">
                <div className="col-12">
                  <label>RR QTY</label>
                </div>
                <div className="col-12 depot-select">
                  <input
                    disabled
                    ref={register}
                    name="RR_QTY"
                    type="number"
                    step={".01"}
                  />
                </div>
              </div>
            </div>
            <div className="col-12 col-md-2">
              <div className="row">
                <div className="col-12">
                  <label>RR Date</label>
                </div>
                <div className="col-12 depot-select">
                  <input disabled ref={register} name="RR_DATE" type="date" />
                </div>
              </div>
            </div>
            {/* <div className="col-12 col-md-2">
              <div className="row">
                <div className="col-12">
                  <label>Claim %</label>
                </div>
                <div className="col-12 depot-select">
                  <input disabled ref={register} name="CLAIM_PER" type="text" />
                </div>
              </div>
            </div> */}
          </div>
        </div>
        <br />
        <br />
        <div className="row">
          <div className="col-12 col-md-4">
            <div className="row">
              <div className="col-12">
                <label>Claim Intimation Date</label>
              </div>
              <div className="col-12 depot-select">
                <input
                  ref={register}
                  name="CLAIM_DATE"
                  type="date"
                  defaultValue={moment().format("YYYY-MM-DD")}
                  disabled={disabledInput}
                />
              </div>
            </div>
          </div>
          <div className="col-12 col-md-4">
            <div className="row">
              <div className="col-12">
                <label>Claim Qty.</label>
              </div>
              <div className="col-12 depot-select">
                <input
                  ref={register}
                  name="CLAIM_QTY"
                  type="number"
                  disabled={disabledInput}
                  step={".01"}
                />
              </div>
            </div>
          </div>
          <div className="col-12 col-md-4">
            <div className="row">
              <div className="col-12">
                <label>Claim No</label>
              </div>
              <div className="col-12 depot-select">
                <input
                  ref={register}
                  name="CLAIM_NO"
                  type="text"
                  disabled={disabledInput}
                />
              </div>
            </div>
          </div>
          <div className="col-12 col-md-4">
            <div className="row">
              <div className="col-12">
                <label>Claim Amount</label>
              </div>
              <div className="col-12 depot-select">
                <input
                  ref={register}
                  name="CLAIM_AMOUNT"
                  type="number"
                  disabled={disabledInput}
                  step={".01"}
                />
              </div>
            </div>
          </div>
          <div className="col-12 col-md-4">
            <div className="row">
              <div className="col-12">
                <label>Claim Status</label>
              </div>
              <div className="col-12 depot-select">
                <select ref={register} name="CLAIM_STATUS">
                  <option value="Open">Open</option>
                  <option value="Close">Close</option>
                  <option value="Under Process">Under Process</option>
                  <option value="Claim Not Lodged">Claim Not Lodged</option>?
                </select>
              </div>
            </div>
          </div>
        </div>
        {!getUrlParams("view") && (
          <div className="row">
            <div className="col-12 col-md-12">
              <div className="row">
                <div className="col-12">
                  <button
                    className="goods-button"
                    style={{
                      background: "rgb(15, 111, 162)",
                    }}
                    type="submit"
                  >
                    Update
                  </button>
                  <button
                    className="goods-button"
                    style={{
                      background: "rgb(15, 111, 162)",
                    }}
                    onClick={() => {
                      if (savedData.CLAIM_INTIMATION_STATUS !== "YES") {
                        setClaimModel(true);
                      }
                    }}
                    type="button"
                  >
                    {savedData.CLAIM_INTIMATION_STATUS === "YES"
                      ? "Claim Intimation Already Sent"
                      : "Send Claim Intimation"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </form>
      {getUrlParams("view") && (
        <div className="row">
          <div className="col-12 col-md-12">
            <div className="row">
              <div
                className="col-12"
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                }}
              >
                <ApproveReject id={id} nextPage={false} />
              </div>
            </div>
          </div>
        </div>
      )}
      <ClaimIntimation
        show={claimModel}
        hideIt={() => setClaimModel(!claimModel)}
        data={savedData}
      />
    </div>
  );
};

const mapStateToProps = (state) => ({});

const mapDispatchToProps = {
  loading,
};

export default connect(mapStateToProps, mapDispatchToProps)(RakeInsuranceData);
