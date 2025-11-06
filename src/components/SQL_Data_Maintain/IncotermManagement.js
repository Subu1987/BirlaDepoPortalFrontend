import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import http from "../../services/apicall";
import apis from "../../services/apis";
import Swal from "sweetalert2";
import { Modal } from "react-bootstrap";
import { loading } from "../../actions/loadingAction";
import store from "../../store";

export const IncotermsManagement = (props) => {
  const [allData, setAllData] = useState([]);
  const [filterData, setFilterData] = useState([]);
  const [openmodal, setOpenmodal] = useState(false);
  const [postData, setPostData] = useState({});

  let columns = [
    { header: "Mandt", key: "MANDT" },
    { header: "Sales Organization", key: "VKORG" },
    { header: "Incoterm 1", key: "INCO1" },
    { header: "Incoterm 2", key: "INCO2" },
    { header: "Delete", key: "id" },
  ];

  const searchData = (value) => {
    if (value) {
      var regex = /[a-zA-Z]/;
      if (regex.test(value)) {
        let temp = allData.filter((ele) => {
          return ele.PLANT.toLowerCase().includes(value.toLowerCase());
        });
        setFilterData(temp);
      } else {
        let temp = allData.filter((ele) => {
          return ele.MATERIAL.toLowerCase().includes(value.toLowerCase());
        });
        setFilterData(temp);
      }
    } else {
      setFilterData(allData);
    }
  };

  const deleteRow = (id) => {
    console.log(id);
    // take a confirmation
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
      preConfirm: () => {
        console.log("Confirmed");
        deleteShipping(id);
      },
    });
  };

  const getIncoterms = async () => {
    const res = await http.post(apis.COMMON_POST_WITH_TABLE_NAME, {
      TABLE: "INCOTERMS",
      params: {},
    });

    if (res.data.code === 0) {
      setAllData(res.data.result);
      setFilterData(res.data.result);
    }
  };

  useEffect(() => {
    getIncoterms();
  }, []);

  const deleteShipping = async (id) => {
    try {
      store.dispatch(loading(true));
      const res = await http.post("/rfc/delete_incoterms_by_id", {
        id,
      });

      if (res.data.code === 0) {
        Swal.fire({
          title: "Success",
          text: "Deleted Successfully",
          icon: "success",
        }).then(() => getIncoterms());
      } else {
        Swal.fire({
          title: "Error",
          text: "Something went wrong",
          icon: "error",
        });
      }
    } catch (error) {
    } finally {
      store.dispatch(loading(false));
    }
  };

  const addNewRow = async () => {
    console.log(postData);
    if (postData.INCO1 && postData.MANDT && postData.VKORG && postData.INCO2) {
      try {
        store.dispatch(loading(true));
        const res = await http.post("/rfc/add_incoterms", {
          ...postData,
        });

        if (res.data.code === 0) {
          Swal.fire({
            title: "Success",
            text: "Added Successfully",
            icon: "success",
          }).then(() => {
            getIncoterms();
            setOpenmodal(false);
          });
        }
      } catch (error) {
      } finally {
        store.dispatch(loading(false));
      }
    } else {
      Swal.fire({
        title: "Please fill all the fields",
        icon: "warning",
      });
    }
  };

  return (
    <div
      className="container row data-management user-edit"
      style={{
        margin: "60px auto",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "20px",
        }}
      >
        {/* <input
          type="text"
          placeholder="Search Plant or Material"
          style={{ margin: 0 }}
          onChange={(e) => searchData(e.target.value)}
        /> */}
        <div
          style={{
            marginLeft: "10px",
          }}
        >
          Incoterms
        </div>
        <button
          className="goods-button"
          style={{
            background: "green",
          }}
          onClick={() => {
            setOpenmodal(true);
          }}
        >
          Add
        </button>
      </div>
      <div
        style={{ height: 700, overflow: "auto", width: "100%" }}
        className="table-div"
      >
        <div>
          <table
            className="table"
            style={{
              width: "100%",
              maxHeight: 700,
              margin: "0px",
            }}
          >
            <thead>
              <tr>
                {columns.map((column) => (
                  <th
                    style={{
                      position: "sticky",
                      top: "0px",
                      background: "white",
                      minWidth: "70px",
                      maxWidth: "70px",
                    }}
                    scope="col"
                    key={column.key}
                  >
                    {column.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filterData.map((ele) => {
                return (
                  <tr key={ele.id}>
                    {columns.map((column) =>
                      column.key === "id" ? (
                        <td key={"id"}>
                          <img
                            src="/images/delete.png"
                            alt="delete"
                            style={{
                              width: "30px",
                              cursor: "pointer",
                            }}
                            onClick={() => deleteRow(ele[column.key])}
                          />
                        </td>
                      ) : (
                        <td key={column.key}>{ele[column.key]}</td>
                      )
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      <Modal show={openmodal} onHide={() => setOpenmodal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Add Incoterms</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="row">
            <div className="col-md-12">
              <div className="form-group">
                <label>
                  MANDT<span>*</span>
                </label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="MANDT"
                  value={postData.MANDT}
                  onChange={(e) =>
                    setPostData({
                      ...postData,
                      MANDT: e.target.value,
                    })
                  }
                />
              </div>
            </div>
            <div className="col-md-12">
              <div className="form-group">
                <label>
                  Sales Organization<span>*</span>
                </label>
                <select
                  className="form-control"
                  value={postData.VKORG}
                  onChange={(e) =>
                    setPostData({ ...postData, VKORG: e.target.value })
                  }
                >
                  <option value="">Select</option>
                  <option value="BC01">BC01</option>
                  <option value="RECL">RECL</option>
                </select>
              </div>
            </div>
            <div className="col-md-12">
              <div className="form-group">
                <label>
                  Incoterm 1<span>*</span>
                </label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Incoterm 1"
                  value={postData.INCO1}
                  onChange={(e) => {
                    setPostData({ ...postData, INCO1: e.target.value });
                  }}
                />
              </div>
            </div>
            <div className="col-md-12">
              <div className="form-group">
                <label>
                  Incoterm 2<span>*</span>
                </label>
                <input
                  type="text"
                  placeholder="Incoterm 2"
                  className="form-control"
                  value={postData.INCO2}
                  onChange={(e) => {
                    setPostData({ ...postData, INCO2: e.target.value });
                  }}
                />
              </div>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <button
            className="goods-button"
            style={{
              background: "green",
            }}
            onClick={() => {
              addNewRow();
            }}
          >
            Add New Incoterm
          </button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

const mapStateToProps = (state) => ({});

const mapDispatchToProps = {
  loading,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(IncotermsManagement);
