import $ from "jquery";
import React, { useEffect, useRef, useState } from "react";
import Button from "react-bootstrap/Button";
import InputGroup from "react-bootstrap/InputGroup";
import Modal from "react-bootstrap/Modal";
import Table from "react-bootstrap/Table";
import Loader from "react-loader-spinner";
import http from "../../services/apicall";
import apis from "../../services/apis";
import Swal from "sweetalert2";
import GSTCheck from "./GSTCheck";

var timeout; // default set
// let isFetched = false;

const SearchSoldToParty = (props) => {
  const [searchBy, setSearchBy] = useState("cust_no");
  const [searchKey, setSearchKey] = useState("");
  const [searchKeyNo, setSearchKeyNo] = useState("");
  const [searchedData, setSearchedData] = useState([]);
  const inputRef = useRef(null);
  const inputRefName = useRef(null);
  const [enter, setEnter] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchData = (key, value, callback) => {
    console.log(
      "searching..",
      key,
      value.length,
      key === "cust_no" && value.length > 5,
    );

    clearTimeout(timeout);

    timeout = setTimeout(function () {
      http
        .post(apis.GET_SOLD_TO_PARTY, {
          [key]: value,
          login_id: localStorage.getItem("user_code"),
        })
        .then((res) => {
          console.log("sold to party", res.data);
          if (res.data.status) {
            console.log(res.data.result);
            callback(res.data.result);
          }
        })
        .catch((err) => {
          fetchData(searchBy, searchKey, callback);
        });
    }, 500);
  };

  const fetchCustomerNumber = (key, value, callback) => {
    clearTimeout(timeout);
    timeout = setTimeout(function () {
      http
        .post(apis.COMMON_POST_WITH_FM_NAME, {
          fm_name: "ZFM_SOLDTOPARTY_NEW",
          params: {
            VBELN: "",
            IM_LOGIN_ID: localStorage.getItem("user_code"),
            IM_SEARCH: value,
          },
        })
        .then((res) => {
          if (res.data.status) {
            console.log(res.data.result);
            callback(res.data.result.IT_FINAL);
          }
        })
        .catch((e) => fetchCustomerNumber("", searchKeyNo, callback));
      // .finally(() => );
    }, 1000);
  };

  $(".model-input").on("keyup", function (event) {
    if (event.key === "Enter" && inputRef?.current?.name === "number") {
      if (searchKeyNo.length > 6) {
        console.log("Enter key pressed!!!!!");
        setEnter(true);
      }
    }
  });

  useEffect(() => {
    if (searchKey && searchKey !== "") {
      fetchData(searchBy, searchKey, setSearchedData);
    }
  }, [searchKey]);

  useEffect(() => {
    if (searchKeyNo && searchKeyNo !== "") {
      setSearchedData([]);
      setEnter(false);
      setLoading(true);
      fetchCustomerNumber(searchBy, searchKeyNo, setSearchedData);
    }
  }, [searchKeyNo]);

  useEffect(() => {
    inputRef.current.focus();
  }, []);

  // useEffect(() => {
  //   if (enter === true && searchedData.length > 0) {
  //     GSTCheck(searchedData[0].KUNNR).then((res) => console.log(res));

  //     if (props.setStateFunction) {
  //       props.setStateFunction(searchedData[0]);
  //     }
  //     props.setSearchedValue(
  //       props.mainKey,
  //       `${searchedData[0].KUNNR}-${searchedData[0].NAME1}`,
  //     );
  //     props.hideIt();
  //   }
  // }, [enter, searchedData, props]);

  const reset = () => {
    setSearchKey("");
    setSearchKeyNo("");
  };

  return (
    <Modal
      show={props.show}
      size="lg"
      centered
      className="modal"
      onHide={props.hideIt}
    >
      <Modal.Header className="modal-header" closeButton>
        <Modal.Title id="contained-modal-title-vcenter" className="modal-title">
          Select Sold to party
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="model-body">
        <>
          <div className="input-area-modal text-center">
            {/* <ButtonGroup>
              <Button
                onClick={() => {
                  setSearchBy("cust_name");
                  setSearchKey("");
                }}
              >
                Search by customer Name
              </Button>
              <Button
                onClick={() => {
                  setSearchBy("cust_no");
                  setSearchKey("");
                }}
              >
                Search by customer Number
              </Button>
            </ButtonGroup> */}

            <InputGroup size="sm" className="mb-3">
              <p>Customer Number</p>
              <InputGroup.Prepend>
                <InputGroup.Text
                  id="inputGroup-sizing-sm"
                  className="model-label"
                >
                  {searchBy === "Customer Number"}
                </InputGroup.Text>
              </InputGroup.Prepend>
              <input
                name="number"
                type="text"
                className="model-input"
                onFocus={(e) => setSearchBy("cust_no")}
                onChange={(e) => {
                  setSearchKeyNo(e.target.value);
                }}
                value={searchKeyNo}
                ref={inputRef}
              />
            </InputGroup>

            <InputGroup size="sm" className="mb-3">
              <p>Customer Name</p>
              <br />
              <InputGroup.Prepend>
                <InputGroup.Text
                  id="inputGroup-sizing-sm"
                  className="model-label"
                >
                  {searchBy === "Customer Name"}
                </InputGroup.Text>
              </InputGroup.Prepend>
              <input
                type="text"
                className="model-input"
                onFocus={(e) => setSearchBy("cust_name")}
                onChange={(e) => {
                  setSearchKey(e.target.value);
                }}
                value={searchKey}
                ref={inputRefName}
              />
            </InputGroup>

            <button
              className="button reset-button"
              onClick={() => {
                reset();
              }}
            >
              Reset
            </button>
          </div>
          <div className="modal-div">
            {searchedData.length > 0 || loading === false ? (
              <Table
                size="sm"
                className="modal-table"
                style={{ margin: "3rem 2rem" }}
              >
                <thead className="modal-thead">
                  <tr className="modal-table-tr">
                    <th className="modal-table-th table-sticky-vertical">
                      Customer Number
                    </th>
                    <th className="modal-table-th table-sticky-vertical">
                      Customer Name
                    </th>
                    <th className="modal-table-th table-sticky-vertical">
                      Sales Group
                    </th>
                    <th className="modal-table-th table-sticky-vertical">
                      Sales Group Description
                    </th>
                    <th className="modal-table-th table-sticky-vertical">
                      Transportation Zone
                    </th>
                    <th className="modal-table-th table-sticky-vertical">
                      Transportation Zone Desc.
                    </th>
                    <th className="modal-table-th table-sticky-vertical">
                      City
                    </th>
                    <th className="modal-table-th table-sticky-vertical">
                      District
                    </th>
                    <th className="modal-table-th table-sticky-vertical">
                      Region
                    </th>
                    <th className="modal-table-th table-sticky-vertical float-center">
                      Select
                    </th>
                  </tr>
                </thead>
                <tbody className="modal-table-tbody">
                  {searchedData?.map((row, i) => (
                    <tr
                      className="modal-table-tr"
                      key={i}
                      onClick={async () => {
                        if (!(await GSTCheck(row.KUNNR))) {
                          Swal.fire({
                            title: "Error",
                            text: "Invalid/Inactive GSTIN NO of Customer",
                            icon: "error",
                          });
                          return;
                        }
                        if (props.setStateFunction) {
                          props.setStateFunction(row);
                        }
                        props.setSearchedValue(
                          props.mainKey,
                          `${row.KUNNR}-${row.NAME1}`,
                          row.KUNNR,
                        );
                        props.hideIt();
                      }}
                    >
                      <td>{row.KUNNR}</td>
                      <td>{row.NAME1}</td>
                      <td>{row.VKGRP}</td>
                      <td>{row.VKGRP_DESC}</td>
                      <td>{row.LZONE}</td>
                      <td>{row.LZONE_DESC}</td>
                      <td>{row.ORT01}</td>
                      <td>{row.ORT02}</td>
                      <td>{row.REGIO_DESC}</td>
                      {/* <td>{row.REGIO}</td> */}
                      <td className="modal-table-td">
                        <button
                          className="button search-button"
                          onClick={async () => {
                            if (!(await GSTCheck(row.KUNNR))) {
                              Swal.fire({
                                title: "Error",
                                text: "Invalid/Inactive GSTIN NO of Customer",
                                icon: "error",
                              });
                              return;
                            }

                            if (props.setStateFunction) {
                              props.setStateFunction(row);
                            }
                            props.setSearchedValue(
                              props.mainKey,
                              `${row.KUNNR}-${row.NAME1}`,
                              row.KUNNR,
                            );
                            props.hideIt();
                          }}
                        >
                          Select
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            ) : (
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  height: "350px",
                }}
              >
                <Loader type="Oval" color="#00BFFF" height={60} width={60} />
              </div>
            )}
          </div>
        </>
      </Modal.Body>
      <Modal.Footer className="modal-footer">
        <Button className="button modal-button" onClick={props.hideIt}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default SearchSoldToParty;
