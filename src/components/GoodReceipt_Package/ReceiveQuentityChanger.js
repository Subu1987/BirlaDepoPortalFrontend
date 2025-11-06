import React, { useRef, useState } from "react";
import Swal from "sweetalert2";

export default function ReceiveQuentityChanger(props) {
  const [mode, setMode] = useState("disabled");
  const quentityChanger = useRef(null);

  let update = () => {
    let updatedReceivedQuantity = Number(quentityChanger.current.value);
    // updatedReceivedQuantity = Number(
    //   updatedReceivedQuantity - quentityChanger.current.value
    // );
    let initialDispatchedQuantity = Number(props.initialDispatchedQuantity);
    let initialBalancedQuantity = Number(props.initialBalancedQuantity);
    console.log(
      updatedReceivedQuantity,
      initialDispatchedQuantity,
      quentityChanger.current.value,
      quentityChanger,
      "Hello"
    );
    if (Number(props.shippingType) === 3 || Number(props.shippingType) === 4) {
      if (updatedReceivedQuantity <= initialBalancedQuantity) {
        //balance =balance- received
        props.updatedBalanceQuantity(
          updatedReceivedQuantity,
          initialBalancedQuantity - updatedReceivedQuantity,
          props.deliveryNumber
        );
        setMode("disabled");
      } else {
        Swal.fire({
          title: "Error!",
          text: "Received quantity should be less than or equal to Balanced quantity",
          icon: "error",
          confirmButtonText: "Ok",
        });
      }
    } else {
      if (updatedReceivedQuantity === initialDispatchedQuantity) {
        props.updatedBalanceQuantity(
          updatedReceivedQuantity,
          initialBalancedQuantity - updatedReceivedQuantity,
          props.deliveryNumber
        );
        setMode("disabled");
      } else {
        Swal.fire({
          title: "Error!",
          text: "Received quantity should be equal to Dispatched quantity",
          icon: "error",
          confirmButtonText: "Ok",
        });
      }
    }
  };

  return (
    <div className="receivedQuantityAreaWrapper" style={{ margin: "auto" }}>
      <div
        className="row"
        style={{ display: "grid", gridTemplateColumns: "2fr 1fr" }}
      >
        {/* <div className="col-md-8"> */}
        {mode === "disabled" ? (
          <div className="receivedQuantityArea" onClick={() => setMode("edit")}>
            {props.initialReceivedQuantity}
          </div>
        ) : (
          <input
            defaultValue={props.initialReceivedQuantity}
            style={{ width: "100px" }}
            type="number"
            className="form-control input-changer"
            ref={quentityChanger}
            // value={props.initialBalancedQuantity}
          />
        )}
        {/* </div>
                <div className="col-md-2"> */}
        {mode === "disabled" ? null : (
          <div className="row">
            <div className="col">
              <button
                className="btn goods-button"
                style={{
                  backgroundColor: "rgb(15, 111, 162)",
                  fontSize: "13px",
                  padding: "10px",
                }}
                onClick={update}
              >
                Save
              </button>
            </div>
            <div className="col">
              <button
                className="btn goods-button"
                style={{
                  backgroundColor: "red",
                  fontSize: "13px",
                  padding: "10px",
                }}
                onClick={() => setMode("disabled")}
              >
                Close
              </button>
            </div>
          </div>
        )}
        {/* </div> */}
      </div>
    </div>
  );
}
