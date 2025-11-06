import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";

import Modal from "react-bootstrap/Modal";
import Table from "react-bootstrap/Table";
import Button from "react-bootstrap/Button";
import { Fragment } from "react";

function ModalSalesRegister({
  header,
  label,
  data,
  handleChange,
  closeModal,
  visible,
  name,
  ...props
}) {
  const [inputName, setInputName] = useState("");
  const [inputDesc, setInputDesc] = useState("");
  const [filteredData, setFilteredData] = useState([]);

  const searchDataByName = (value) => {
    if (value !== "") {
      let newData = data;
      newData = newData.filter((ele, i) => {
        return ele?.value.toLowerCase().includes(value.toLowerCase());
      });
      setFilteredData(newData);
    } else {
      setFilteredData(data);
    }
  };

  const searchDataByDesc = (value) => {
    if (value !== "") {
      let newData = data;
      newData = newData.filter((ele, i) => {
        return ele?.desc.toLowerCase().includes(value.toLowerCase());
      });
      setFilteredData(newData);
    } else {
      setFilteredData(data);
    }
  };

  useEffect(() => {
    setFilteredData(data);
  }, [data]);

  return (
    <Fragment>
      {/* Dynamic Modal */}
      <Modal.Header closeButton>
        <Modal.Title>Select {header?.title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="input-area-modal">
          <p style={{ marginBottom: "0px" }}>{header?.name}</p>
          <input
            type="text"
            className="model-input"
            onChange={(e) => {
              searchDataByName(e.target.value);
              setInputName(e.target.value);
            }}
            value={inputName}
          />
          <br />
          <p style={{ marginBottom: "0px" }}>{header?.desc}</p>
          <input
            type="text"
            className="model-input"
            onChange={(e) => {
              searchDataByDesc(e.target.value);
              setInputDesc(e.target.value);
            }}
            value={inputDesc}
          />
        </div>
        <div className="modal-div">
          <Table size="sm" className="modal-table">
            <thead className="modal-thead">
              <tr className="modal-table-tr">
                <th className="modal-table-th float-center">{header?.name}</th>
                <th className="modal-table-th float-center">{header?.desc}</th>
                <th className="modal-table-th float-center">Select</th>
              </tr>
            </thead>
            <tbody className="modal-table-tbody">
              {filteredData?.map((row, i) => (
                <tr className="modal-table-tr" key={i}>
                  <td>{row?.value?.replace(/^0+/, "")}</td>
                  <td>{row?.desc}</td>
                  <td className="modal-table-td">
                    <button
                      className="button search-button"
                      onClick={() => {
                        handleChange(row, name);
                        closeModal(false);
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
      </Modal.Body>
      <Modal.Footer className="modal-footer">
        <Button
          className="button modal-button"
          onClick={() => closeModal(false)}
        >
          Close
        </Button>
      </Modal.Footer>
    </Fragment>
  );
}

ModalSalesRegister.propTypes = {
  name: PropTypes.string,
};

export default ModalSalesRegister;
