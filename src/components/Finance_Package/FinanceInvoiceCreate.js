import moment from "moment";
import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import { useHistory, useLocation } from "react-router";
import CreatableSelect from "react-select/creatable";
import Swal from "sweetalert2";
import { loading } from "../../actions/loadingAction";
import http from "../../services/apicall";
import apis from "../../services/apis";

const queryString = require("query-string");
let today = moment();

const promiseOptions = (inputValue) => {
  return new Promise((resolve) => {
    resolve([]);
  });
};

function FinanceInvoiceCreate(props) {
  const [currentState, setCurrentState] = useState("1");
  const [selectedDeliveryIds, setSelectedSeliveryIds] = useState([]);
  const [orderDetailsForPreview, setOrderDetailsForPreview] = useState([]);
  const [notPossibleInvoice, setNotPossibleInvoice] = useState([]);
  const [possibleInvoice, setPossibleInvoice] = useState([]);
  const [isFinalSubmitVisible, setIsFinalSubmitVisble] = useState(false);
  let location = useLocation();
  let history = useHistory();

  //getting any predefined order ids
  useEffect(() => {
    const parsed = queryString.parse(location.search);
    if (parsed.deliveryIds) {
      try {
        let arr = parsed.deliveryIds.split(",");
        arr = arr.map((ele, i) => {
          return {
            value: ele,
            label: ele,
          };
        });
        setSelectedSeliveryIds(arr);
      } catch {
        let newUrl =
          window.location.protocol +
          "//" +
          window.location.hostname +
          (window.location.port ? ":" + window.location.port : "") +
          location.pathname;
        window.location.href = newUrl;
      }
    }
  }, []);

  //++++++++++++++++++++++++++++++++++++++++++searching delivery id and setting its value+++++++++++++++++++++++++++++++++++++++++++++++++
  //searching
  let searchOptions = (ele) => {};

  //setting value
  let setSelectedValue = (ele) => {
    setSelectedSeliveryIds(ele);
  };

  let loginMatrixCheckForDelivery = () => {
    props.loading(true);
    http
      .post(apis.COMMON_POST_WITH_FM_NAME, {
        fm_name: "ZRFC_INV_CREATE_LOGIN_MTX_CHK",
        params: {
          IM_DELIVERY: selectedDeliveryIds.map((ele) => {
            return { DELIVERY: ele.value };
          }),
          IM_LOGIN_ID: localStorage.getItem("user_code"),
        },
      })
      .then((result) => {
        console.log(result.data);
        if (result.data.code === 0) {
          fetchDetails();
        } else {
          let msg = result;
        }
      })
      .catch((err) => {
        loginMatrixCheckForDelivery();
      })
      .finally(() => {
        props.loading(false);
      });
  };

  //++++++++++++++++++++++++++++++++++++++++++searching delivery id and setting its value+++++++++++++++++++++++++++++++++++++++++++++++++
  //+++++++++++++++++++++++++++++++++++++++++++fetch details of selected items++++++++++++++++++++++++++++++++++++++++++++++++++
  let fetchDetails = () => {
    if (selectedDeliveryIds && selectedDeliveryIds.length > 0) {
      props.loading(true);
      let np = [];
      let p = [];
      let deliveryIds = selectedDeliveryIds.map((ele) => ele.value);
      http
        .post(apis.GET_DELIVERY_DETAILS, { delivery_no: deliveryIds })
        .then((result) => {
          console.log(result.data);
          if (result.data.status) {
            result.data.result.forEach((ele, i) => {
              if (ele.CHALLAN_DATE !== today.format("YYYYMMDD")) {
                np.push({
                  delivery_no: selectedDeliveryIds[i].value,
                  msg: "Invoice can't be created for back date.",
                });
              } else if (
                parseFloat(ele.NETWR) === 0 ||
                parseFloat(ele.NETWR) <= 0 ||
                ele.NETWR === 0 ||
                ele.NETWR === "0"
              ) {
                np.push({
                  delivery_no: selectedDeliveryIds[i].value,
                  msg: "Invoice can't be created if net value 0 or less than 0",
                });
              } else if (
                parseFloat(ele.MWSBP) === 0 ||
                parseFloat(ele.MWSBP) <= 0 ||
                ele.MWSBP === 0 ||
                ele.MWSBP === "0"
              ) {
                np.push({
                  delivery_no: selectedDeliveryIds[i].value,
                  msg: "Invoice can't be created if tax value 0 or less than 0",
                });
              } else {
                p.push({
                  delivery_no: selectedDeliveryIds[i].value,
                });
              }
            });
            setIsFinalSubmitVisble(true);
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

          console.log("seccess_resp", "p", p, "np", np, "1.................");
          setOrderDetailsForPreview(result.data.result);
          setPossibleInvoice(p);
          setNotPossibleInvoice(np);
          setCurrentState("2");
        })
        .catch((err) => {
          console.log(err);
          fetchDetails();
         
        })
        .finally(() => {
          props.loading(false);
        });
    } else {
      Swal.fire({
        title: "Error!",
        text: "You must select at least one delivery id",
        icon: "error",
        confirmButtonText: "Ok",
      });
    }
  };

  //+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

  //+++++++++++++++++++++++++++++++++++++++++++creating invoice++++++++++++++++++++++++++++++++++++++++++++++++++++++
  let createInvoice = () => {
    console.log("done");
    props.loading(true);
    let np = [...notPossibleInvoice];
    let p = [];
    if (possibleInvoice.length == 0) {
      setPossibleInvoice(p);
      setNotPossibleInvoice(np);
      setCurrentState("3");
      props.loading(false);
      return;
    }
    let deliveryIdsToSend = possibleInvoice.map((ele) => ele.delivery_no);
    http
      .post(apis.CREATE_INVOICE, {
        IM_LOGIN_ID: localStorage.getItem("user_code"),
        delivery_no: deliveryIdsToSend,
      })
      .then((result) => {
        console.log(result.data);
        if (result.data.status) {
          p = result.data.result.map((ele, i) => {
            return {
              delivery_no: possibleInvoice[i].delivery_no,
              invoice_number: ele.INVOICE,
            };
          });
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
        console.log(p, np, "2.................");
        setPossibleInvoice(p);
        setNotPossibleInvoice(np);
        setCurrentState("3");
      })
      .catch((err) => {
        console.log(err);
       
      })
      .finally(() => {
        props.loading(false);
        console.log("Finally");
      });
  };
  //++++++++++++++++++++++++++++++++++++++++++++creating invoice ends++++++++++++++++++++++++++++++++++++++++++++

  let newInvoice = () => {
    history.push("/dashboard/delivery/list");
  };

  useEffect(() => {
    console.log(selectedDeliveryIds);
  }, [selectedDeliveryIds]);

  useEffect(() => {
    console.log(possibleInvoice, notPossibleInvoice);
  }, [possibleInvoice, notPossibleInvoice]);

  useEffect(() => {
    console.log("order details", orderDetailsForPreview);
  }, [orderDetailsForPreview]);

  let printInvoice = (selectedInvoice, IM_DS_FLAG = "D") => {
    console.log("printing");
    props.loading(true);
    http
      .post(apis.PRINT_INVOICE, {
        invoice_number: selectedInvoice,
        IM_DS_FLAG: IM_DS_FLAG,
        IM_LOGIN_ID: localStorage.getItem("user_code"),
      })
      .then((response) => {
        console.log(response);

        if (response.data.status === false) {
          Swal.fire({
            title: "Error!",
            text: response.data.data.ET_RETURN[0].MESSAGE,
            icon: "error",
            confirmButtonText: "Ok",
          });
        } else {
          //setPdfString(response.data.data)
          let pdfWindow = window.open("");
          pdfWindow.document.write(
            "<html><body><center>" +
              '<a title="Download File" style="font-family: \'Verdana\';color: #333;text-decoration: none;font-weight: 600;" download="File.PDF" href="data:application/pdf;base64,' +
              encodeURI(response.data.data) +
              '">Download File</a>' +
              "</center><br>" +
              '<object width=100% height=100% type="application/pdf" data="data:application/pdf;base64,' +
              encodeURI(response.data.data) +
              '">' +
              '<embed type="application/pdf" src="data:application/pdf;base64,' +
              encodeURI(response.data.data) +
              '" id="embed_pdf"></embed>' +
              "</object></body></html>"
          );
        }
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        props.loading(false);
      });
  };

  let downloadInvoice = (selectedInvoice) => {
    props.loading(true);
    http
      .post(apis.PRINT_INVOICE, { invoice_number: selectedInvoice })
      .then((response) => {
        console.log(response);
        if (response.data.status === false) {
          Swal.fire({
            title: "Error!",
            text: response.data.data.ET_RETURN[0].MESSAGE,
            icon: "error",
            confirmButtonText: "Ok",
          });
        } else {
          const downloadLink = document.createElement("a");
          const fileName = `invoice-${selectedInvoice}.pdf`;
          downloadLink.href = `data:application/pdf;base64, ${encodeURI(
            response.data.data
          )}`;
          downloadLink.download = fileName;
          downloadLink.click();
          downloadLink.remove();
        }
      })
      .catch((err) => {
        console.log(err);
        downloadInvoice();
       
      })
      .finally(() => {
        props.loading(false);
      });
  };

  return (
    <div>
      <div className="col process-div">
        <div
          id="step-1"
          className={
            "process-button" + (currentState === "1" ? " process-active" : "")
          }
        >
          <span>1</span>
          <span className="process-text">Create</span>
        </div>
        <div className="line-div"></div>
        <div
          id="step-2"
          className={
            "process-button" + (currentState === "2" ? " process-active" : "")
          }
        >
          <span>2</span>
          <span className="process-text">Review</span>
        </div>
        <div className="line-div-2"></div>
        <div
          id="step-3"
          className={
            "process-button" + (currentState === "3" ? " process-active" : "")
          }
        >
          <span>3</span>
          <span className="process-text">Complete</span>
        </div>
      </div>

      <div className="row input-area">
        {/* <div>Delivery No.</div> */}
        {currentState === "1" ? (
          <div className="row">
            <div className="col">
              {/* <AsyncSelect
                                key={selectedDeliveryIds}
                                isMulti
                                // cacheOptions
                                // defaultOptions
                                loadOptions={promiseOptions}
                                defaultValue={selectedDeliveryIds}
                                onChange={setSelectedValue}
                            /> */}
              <CreatableSelect
                isMulti
                onChange={setSelectedValue}
                defaultValue={selectedDeliveryIds}
                key={selectedDeliveryIds}
                options={[]}
              />
            </div>
          </div>
        ) : null}

        {currentState === "2" ? (
          <div className="table-div">
            <div className="row">
              <table className="table">
                <thead>
                  <tr>
                    <th
                      style={{ minWidth: "110px", left: "0px", zIndex: "10" }}
                      scope="col"
                      className="table-sticky-horizontal"
                    >
                      Item #
                    </th>
                    <th
                      style={{ minWidth: "140px", left: "110px", zIndex: "10" }}
                      scope="col"
                      className="table-sticky-horizontal"
                    >
                      Delivery #
                    </th>

                    <th style={{ minWidth: "110px" }} scope="col">
                      Payer
                    </th>
                    <th style={{ minWidth: "155px" }} scope="col">
                      Payer Name
                    </th>

                    <th style={{ minWidth: "150px" }} scope="col">
                      Material #
                    </th>
                    <th style={{ minWidth: "310px" }} scope="col-3">
                      Material Description
                    </th>
                    <th style={{ minWidth: "210px" }} scope="col-3">
                      Actual PGI Date
                    </th>
                    {/* <th style={{minWidth:"110px"}} scope="col-3">Challan No</th> */}
                    <th style={{ minWidth: "110px" }} scope="col">
                      Plant
                    </th>
                    <th style={{ minWidth: "210px" }} scope="col">
                      Billing Qty(Mt)
                    </th>
                    <th style={{ minWidth: "110px" }} scope="col">
                      UOM
                    </th>
                    <th style={{ minWidth: "145px" }} scope="col">
                      Billing Date
                    </th>
                    <th style={{ minWidth: "145px" }} scope="col">
                      Billing Type
                    </th>
                    <th style={{ minWidth: "140px" }} scope="col">
                      Net Value
                    </th>
                    <th style={{ minWidth: "145px" }} scope="col">
                      Tax Amount
                    </th>
                    <th style={{ minWidth: "110px" }} scope="col">
                      Currency
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {orderDetailsForPreview.map((ele, i) => (
                    <tr key={ele.VBELN}>
                      <td
                        style={{ left: "0px", zIndex: "10" }}
                        className="table-sticky-horizontal"
                      >
                        {ele.POSNR}
                      </td>
                      <td
                        style={{ left: "110px", zIndex: "10" }}
                        className="table-sticky-horizontal"
                      >
                        {ele.VBELN}
                      </td>

                      <td>{ele.KUNNR}</td>
                      <td>{ele.KUNNR_NAME}</td>

                      <td>{ele.MATNR ? ele.MATNR.replace(/^0+/, "") : ""}</td>
                      <td>{ele.MAKTX}</td>
                      <td>
                        {moment(ele.CHALLAN_DATE, "YYYYMMDD").format(
                          "DD-MM-YYYY"
                        )}
                      </td>
                      {/* <td>{ele.CHALLAN_NO}</td> */}
                      <td>{ele.WERKS}</td>

                      <td>{ele.FKIMG}</td>
                      <td>{ele.MEINS}</td>
                      <td>
                        {moment(ele.FKDAT, "YYYYMMDD").format("DD-MM-YYYY")}
                      </td>
                      <td>{ele.FKART}</td>
                      <td>{ele.NETWR}</td>
                      <td>{ele.MWSBP}</td>
                      <td>{ele.WAERK}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : null}

        {currentState === "3" ? (
          <React.Fragment>
            <div>
              {possibleInvoice.map((ele, i) => {
                if (ele.invoice_number === "") {
                  return (
                    <div key={i} className={"row input-area"}>
                      <img
                        className="success-img"
                        src="/images/error.png"
                        alt="error"
                      />
                      <span className="success-msg">
                        &nbsp;&nbsp; Invoice is not generated for the Delivery
                        no. :{ele ? ele.delivery_no : ""}.
                      </span>
                    </div>
                  );
                } else {
                  return (
                    <div key={i} className={"row input-area"}>
                      <img
                        className="success-img"
                        src="/images/success_tick.jpeg"
                        alt="tick"
                      />
                      <span className="success-msg">
                        &nbsp;&nbsp; Invoice created for delivery no{" "}
                        {ele ? ele.delivery_no : ""}. Invoice number :{" "}
                        {ele ? ele.invoice_number : ""}
                      </span>
                      <button
                        style={{ position: "absolute", right: "0", top: "9px" }}
                        className="button button-foreword"
                        onClick={() => printInvoice(ele.invoice_number, "D")}
                      >
                        View
                      </button>
                      {/* &nbsp; &nbsp;
                      <button
                        style={{
                          position: "absolute",
                          right: "175px",
                          lineHeight: "30px",
                          top: "9px",
                        }}
                        className="button goods-button"
                        onClick={() => downloadInvoice(ele.invoice_number)}
                      >
                        Print
                      </button> */}
                    </div>
                  );
                }
              })}
            </div>

            <div>
              {notPossibleInvoice.map((ele, i) => {
                return (
                  <div key={i} className={"row input-area"}>
                    <img className="success-img" src="/images/error.png" />
                    <span className="success-msg">
                      &nbsp;&nbsp; Invoice creation not possible for{" "}
                      {ele ? ele.delivery_no : ""}. Reason: {ele.msg}
                    </span>
                  </div>
                );
              })}
            </div>
          </React.Fragment>
        ) : null}

        <div className="button-div">
          {currentState === "2" ? (
            <React.Fragment>
              <button
                type="button"
                className="button button-back"
                onClick={(e) => setCurrentState("1")}
              >
                Back
              </button>
              {isFinalSubmitVisible ? (
                <button
                  type="button"
                  className="button button-foreword"
                  onClick={createInvoice}
                >
                  Save
                </button>
              ) : null}
            </React.Fragment>
          ) : null}
          {currentState === "1" ? (
            <button
              className="button button-foreword"
              type="button"
              onClick={fetchDetails}
            >
              Next
            </button>
          ) : null}
          {currentState === "3" ? (
            <button
              className="button button-foreword"
              type="button"
              onClick={newInvoice}
            >
              Generate new Invoice
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

const mapStateToProps = (state) => ({
  Auth: state.Auth,
});

export default connect(mapStateToProps, { loading })(FinanceInvoiceCreate);
