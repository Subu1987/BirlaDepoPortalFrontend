import React, { useState, useEffect } from "react";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import Table from "react-bootstrap/Table";
import http from "../../services/apicall";
import apis from "../../services/apis";
import Swal from "sweetalert2";

export default function StorageLocationSelector(props) {
  const [createdData, setCreatedData] = useState(
    props.activeGoodReceipt.storageLocationArray
      ? [...props.activeGoodReceipt.storageLocationArray, {}]
      : [{}]
  );
  const [isDigitMaterial, setIsDigitMaterial] = useState(false);

  useEffect(() => {
    console.log("active", props);
  }, []);

  let fetchStorageLocation = (cond, i) => {
    if (cond !== "undefined") {
      props.loading(true);

      http
        .post(apis.CONDITION_BASED_STORAGE_LOACTION, {
          condition_type: cond,
          plant: props.recPlant,
          IM_VKORG: props.vkorg,
          IM_SHIP_TYPE: props.shippingType,
        })
        .then((result) => {
          console.log(result.data);
          if (result.data.status) {
            let a = [...createdData];
            a[i]["selected_condition"] = cond;
            a[i]["storage_locations"] = result.data.data;
            a[i]["selected_storage_location"] =
              result.data.data.length > 0
                ? result.data.data[0].LGORT
                : undefined;
            console.log(a[i]["selected_storage_location"]);
            if (a[i]["selected_storage_location"]) {
              a[i]["selected_quantity"] = 0;
            }
            setCreatedData(a);
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
          fetchStorageLocation();
        })
        .finally(() => {
          props.loading(false);
        });
    }
  };

  let setStorageLocation = (val, i) => {
    let a = [...createdData];
    a[i]["selected_storage_location"] = val;
    setCreatedData(a);
  };

  const getMaterials = async () => {
    const data = await http.post(apis.COMMON_POST_WITH_TABLE_NAME, {
      TABLE: "GR_MATERIALS",
      params: {
        MATERIAL: props.activeGoodReceipt.MATERIAL.replace(/^0+/, ""),
      },
    });

    if (data.data.result.length > 0) {
      setIsDigitMaterial(true);
    } else {
      setIsDigitMaterial(false);
    }
  };

  useEffect(() => {
    getMaterials();
  }, [props.activeGoodReceipt.MATERIAL]);

  let setQuantity = (val, i) => {
    console.log(i);
    console.log(val);
    if (isDigitMaterial) {
      let a = [...createdData];
      a[i]["selected_quantity"] = val;
      if (val && val !== 0 && a.length - i === 1) {
        a.push({});
      }
      setCreatedData(a);
    } else {
      if (val) {
        val = Number(val);
        if (
          val === 0 ||
          val % 1 === 0 ||
          val % 1 === 0.05 ||
          Math.round((val % 0.05) * 100) / 100 === 0.05 ||
          Math.round((val % 0.05) * 100) / 100 === 0
        ) {
          let a = [...createdData];
          a[i]["selected_quantity"] = val;
          console.log("Assign", (a[i]["selected_quantity"] = val));
          if (val && val !== 0 && a.length - i === 1) {
            a.push({});
          }
          setCreatedData(a);
        }
      } else {
        let a = [...createdData];
        a[i]["selected_quantity"] = val;
        setCreatedData(a);
      }
    }
  };

  let saveData = () => {
    let a = [...createdData];
    a.pop();
    let sum = 0;
    let flag = true;
    console.log(a);
    a.forEach((e) => {
      if (
        e.selected_condition === "undefined" ||
        !e.selected_storage_location ||
        !e.selected_quantity
      ) {
        flag = false;
      }
      sum += e.selected_quantity ? Number(e.selected_quantity) : 0;
    });

    console.log(
      flag,
      a,
      sum.toFixed(3),
      props.activeGoodReceipt.RECEIVED_QTY.toFixed(3)
    );
    if (
      flag &&
      Number(sum.toFixed(3)) === Number(props.activeGoodReceipt.RECEIVED_QTY)
    ) {
      props.saveStorageLocation(a, props.activeGoodReceipt.DELV_NO);
      props.setIsStorageLocationModalVisible(false);
    } else {
      Swal.fire({
        title: "Error!",
        text: "Sum of all quantity should be equal to the received quantity",
        icon: "error",
        confirmButtonText: "Ok",
      });
    }
  };

  return (
    <Modal
      show={props.isStorageLocationModalVisible}
      dialogClassName="modal-90w"
      centered
      onHide={() => props.setIsStorageLocationModalVisible(false)}
    >
      <Modal.Header closeButton>
        <Modal.Title>Select storage location</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Table striped bordered hover size="sm" style={{ margin: 0 }}>
          <thead>
            <tr>
              <th>Condition</th>
              <th>Storage Location</th>
              <th>Quantity</th>
            </tr>
          </thead>
          <tbody>
            {console.log("Hello", createdData)}
            {createdData.map((ele, i) => (
              <React.Fragment key={i}>
                {i <= 0 &&
                ["03", "04"].includes(props.activeGoodReceipt.VSART) ? (
                  <tr key={i}>
                    <td>
                      <select
                        onChange={(e) =>
                          fetchStorageLocation(e.target.value, i)
                        }
                        defaultValue={ele.selected_condition}
                      >
                        <option key={-1} value="undefined">
                          Select a value
                        </option>

                        <>
                          {props.allConditions
                            .filter((item) => item.COND_TYPE === "Z001")
                            .map((d, j) => (
                              <option key={j} value={d.COND_TYPE}>
                                {d.COND_TYPE} - {d.TEXT}
                              </option>
                            ))}
                        </>
                      </select>
                    </td>
                    <td>
                      {ele.storage_locations ? (
                        <select
                          onChange={(e) =>
                            setStorageLocation(e.target.value, i)
                          }
                          defaultValue={ele.selected_storage_location}
                        >
                          {ele.storage_locations.map((d, j) => (
                            <option key={j} value={d.LGORT}>
                              {d.LGORT} - {d.LGOBE}
                            </option>
                          ))}
                        </select>
                      ) : null}
                    </td>
                    <td>
                      {ele.selected_storage_location ? (
                        <input
                          value={ele.selected_quantity}
                          type="number"
                          step="any"
                          onChange={(e) => setQuantity(e.target.value, i)}
                        />
                      ) : null}
                    </td>
                  </tr>
                ) : null}

                {i <= 3 &&
                !["03", "04"].includes(props.activeGoodReceipt.VSART) ? (
                  <tr key={i}>
                    <td>
                      <select
                        onChange={(e) =>
                          fetchStorageLocation(e.target.value, i)
                        }
                        defaultValue={ele.selected_condition}
                      >
                        <option key={-1} value="undefined">
                          Select a value
                        </option>
                        {["03", "04"].includes(
                          props.activeGoodReceipt.VSART
                        ) ? (
                          <>
                            {props.allConditions
                              .filter((item) => item.COND_TYPE === "Z001")
                              .map((d, j) => (
                                <option key={j} value={d.COND_TYPE}>
                                  {d.COND_TYPE} - {d.TEXT}
                                </option>
                              ))}
                          </>
                        ) : (
                          <>
                            {props.allConditions.map((d, j) => (
                              <option key={j} value={d.COND_TYPE}>
                                {d.COND_TYPE} - {d.TEXT}
                              </option>
                            ))}
                          </>
                        )}
                      </select>
                    </td>
                    <td>
                      {ele.storage_locations ? (
                        <select
                          onChange={(e) =>
                            setStorageLocation(e.target.value, i)
                          }
                          defaultValue={ele.selected_storage_location}
                        >
                          {ele.storage_locations.map((d, j) => (
                            <option key={j} value={d.LGORT}>
                              {d.LGORT} - {d.LGOBE}
                            </option>
                          ))}
                        </select>
                      ) : null}
                    </td>
                    <td>
                      {ele.selected_storage_location ? (
                        <input
                          value={ele.selected_quantity}
                          type="number"
                          step="any"
                          onChange={(e) => setQuantity(e.target.value, i)}
                        />
                      ) : null}
                    </td>
                  </tr>
                ) : null}
              </React.Fragment>
            ))}
          </tbody>
        </Table>
      </Modal.Body>
      <Modal.Footer className="modal-footer">
        <Button className="button modal-button" onClick={saveData}>
          Save
        </Button>
        <Button
          className="button modal-button"
          onClick={() => props.setIsStorageLocationModalVisible(false)}
        >
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
