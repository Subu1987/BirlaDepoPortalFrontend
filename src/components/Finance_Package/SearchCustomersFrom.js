import React, { useEffect, useRef, useState } from "react";
import Button from "react-bootstrap/Button";
import InputGroup from "react-bootstrap/InputGroup";
import Modal from "react-bootstrap/Modal";
import Table from "react-bootstrap/Table";
import http from "../../services/apicall";
import apis from "../../services/apis";

var timeout; // default set

const SearchCustomerFrom = (props) => {
  const [searchBy, setSearchBy] = useState("cust_no");
  const [searchKey, setSearchKey] = useState("");
  const [searchKeyNo, setSearchKeyNo] = useState("");
  const [searchedData, setSearchedData] = useState([]);
  const inputRef = useRef(null);
  const inputRefNumber = useRef(null);

  const fetchData = (key, value, callback) => {
    console.log("searching..");
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
          console.log(err);
          fetchData(searchBy, searchKey.replace, callback);
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
        .catch(() => {
          fetchCustomerNumber("", searchKeyNo, callback);
        });
    }, 500);
  };
  useEffect(() => {
    inputRefNumber.current.focus();
  }, []);

  useEffect(() => {
    if (searchKey && searchKey !== "") {
      fetchData(searchBy, searchKey, setSearchedData);
    }
  }, [searchKey]);

  useEffect(() => {
    if (searchKeyNo && searchKeyNo !== "") {
      fetchCustomerNumber(searchBy, searchKeyNo, setSearchedData);
    }
  }, [searchKeyNo]);

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
            <InputGroup size="sm" className="mb-3">
              <InputGroup.Prepend>
                <InputGroup.Text
                  id="inputGroup-sizing-sm"
                  className="model-label"
                >
                  Customer Number
                </InputGroup.Text>
              </InputGroup.Prepend>
              <input
                type="text"
                className="model-input"
                onFocus={(e) => setSearchBy("cust_no")}
                onChange={(e) => {
                  setSearchKeyNo(e.target.value);
                }}
                value={searchKeyNo}
                ref={inputRefNumber}
              />
            </InputGroup>
            <InputGroup size="sm" className="mb-3">
              <InputGroup.Prepend>
                <InputGroup.Text
                  id="inputGroup-sizing-sm"
                  className="model-label"
                >
                  Customer Name
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
                ref={inputRef}
              />
            </InputGroup>

            <button
              className="button reset-button"
              onClick={() => {
                setSearchKey("");
                setSearchKeyNo("");
              }}
            >
              Reset
            </button>
          </div>
          <br />
          <br />
          <div className="modal-div">
            <Table size="sm" className="modal-table">
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
                  <th className="modal-table-th table-sticky-vertical">City</th>
                  <th className="modal-table-th table-sticky-vertical">
                    District
                  </th>
                  <th className="modal-table-th table-sticky-vertical">
                    Region
                  </th>
                  <th className="modal-table-th float-center">Select</th>
                </tr>
              </thead>
              <tbody className="modal-table-tbody">
                {searchedData?.map((row, i) => (
                  <tr
                    className="modal-table-tr"
                    key={i}
                    onClick={() => {
                      if (props.setStateFunction) {
                        props.setStateFunction(row);
                      }
                      props.setSearchedValue(row.KUNNR, row.NAME1);
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
                    <td className="modal-table-td">
                      <button
                        className="button search-button"
                        onClick={() => {
                          if (props.setStateFunction) {
                            props.setStateFunction(row);
                          }
                          props.setSearchedValue(row.KUNNR, row.NAME1);
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

export default SearchCustomerFrom;
