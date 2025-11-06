import React, { useState, useEffect, useRef } from "react";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import Table from "react-bootstrap/Table";
import InputGroup from "react-bootstrap/InputGroup";

const SearchField = ({ label, handleChange, value, searchKey, key1 }) => {
  const inputRef = useRef(null);
  useEffect(() => {
    if (key1 === 0) {
      inputRef.current.focus();
    }
  }, []);
  return (
    <div>
      <InputGroup size="sm" className="mb-3">
        <InputGroup.Prepend>
          <InputGroup.Text id="inputGroup-sizing-sm" className="model-label">
            {label}
          </InputGroup.Text>
        </InputGroup.Prepend>
        <input
          type="text"
          className="model-input"
          onChange={(e) => handleChange(e.target.value, searchKey)}
          value={value.toUpperCase()}
          ref={inputRef}
        />
      </InputGroup>
    </div>
  );
};

const SearchDialog = (props) => {
  console.log(props);
  const {
    title,
    keys,
    keylabels,
    labels,
    labelindex,
    return_field_key,
    return_field_value,
    data,
  } = props;
  const [filteredData, setFilteredData] = useState(data);
  const [searchKeys, setSearchKeys] = useState([]);

  let initialiseSearchKeys = () => {
    let arr = keys.map((ele, i) => {
      return {
        key: ele,
        value: "",
        keyLabel: keylabels[i],
      };
    });
    //console.log(arr)
    setSearchKeys(arr);
  };

  useEffect(() => {
    console.log(props);
    initialiseSearchKeys();
  }, []);

  let handleSearchChange = (value, key) => {
    let arr = searchKeys.map((ele, i) => {
      if (ele.key === key) {
        console.log(key);
        console.log("Value", value);
        ele.value = value.toLowerCase();
      }
      return ele;
    });
    setSearchKeys(arr);
  };

  useEffect(() => {
    let sk = searchKeys;
    let new_sks = searchKeys.filter((ele) => {
      return ele.value !== "";
    });
    let l = new_sks.length;
    //console.log(data.length,l,new_sks);
    let new_data = data;
    if (new_sks.length > 0) {
      for (let i = 0; i < l; i++) {
        new_data = new_data.filter((ele, j) => {
          if (ele[new_sks[i].key].toLowerCase().includes(new_sks[i].value)) {
            return ele;
          }
        });
      }
    }

    if (sk === searchKeys) {
      setFilteredData(new_data);
    }
  }, [searchKeys]);

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
          {title}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="model-body">
        <>
          <div className="input-area-modal">
            {searchKeys?.map((ele, i) => (
              <SearchField
                key={i}
                className="search-field"
                label={ele.keyLabel}
                searchKey={ele.key}
                handleChange={handleSearchChange}
                value={ele.value}
                key1={i}
              />
            ))}
            <button
              className="button reset-button"
              onClick={() => {
                initialiseSearchKeys();
                setFilteredData(data);
              }}
            >
              Reset
            </button>
          </div>
          <div className="modal-div">
            <Table
              size="sm"
              className="modal-table"
              style={{ margin: "3rem 2rem" }}
            >
              <thead className="modal-thead">
                <tr className="modal-table-tr">
                  {labels?.map((ele, i) => (
                    <th
                      className="modal-table-th table-sticky-vertical"
                      key={i}
                    >
                      {ele}
                    </th>
                  ))}
                  <th className="modal-table-th float-center">Select</th>
                </tr>
              </thead>
              <tbody className="modal-table-tbody">
                {console.log(filteredData, "Modal")}
                {filteredData?.map((row, i) => (
                  <tr
                    className="modal-table-tr"
                    key={i}
                    onClick={() => {
                      if (props.setStateFunction) {
                        props.setStateFunction(row);
                      }
                      props.setSearchedValue(
                        return_field_key,
                        `${row[return_field_value[0]]}-${
                          row[return_field_value[1]]
                        }`,
                        row[return_field_value[0]]
                      );
                      props.hideIt();
                    }}
                  >
                    {labelindex?.map((key, j) => {
                      if (j === 0) {
                        return <td key={j}>{row[key].replace(/^0+/, "")}</td>;
                      } else {
                        return <td key={j}>{row[key]}</td>;
                      }
                    })}
                    <td className="modal-table-td">
                      <button
                        className="button search-button"
                        onClick={() => {
                          if (props.setStateFunction) {
                            props.setStateFunction(row);
                          }
                          props.setSearchedValue(
                            return_field_key,
                            `${row[return_field_value[0]]}-${
                              row[return_field_value[1]]
                            }`,
                            row[return_field_value[0]]
                          );
                          props.hideIt();
                        }}
                      >
                        select
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

export default SearchDialog;
