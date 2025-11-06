import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import http from "../../services/apicall";
import apis from "../../services/apis";
import Swal from "sweetalert2";
import { Modal } from "react-bootstrap";
import { loading } from "../../actions/loadingAction";

export const SQLData = (props) => {
  const [allData, setAllData] = useState([]);
  const [filterData, setFilterData] = useState([]);
  const [shippingData, setShippingData] = useState([]);
  const [openmodal, setOpenmodal] = useState(false);
  const [postData, setPostData] = useState({});

  let columns = [
    { header: "Plant", key: "PLANT" },
    { header: "Material", key: "MATERIAL" },
    { header: "Shipping Type", key: "VSART" },
    { header: "Shipping Type Desc", key: "BEZEI" },
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

  const getShippingMaintainedData = async () => {
    const res = await http.post(apis.COMMON_POST_WITH_TABLE_NAME, {
      TABLE: "SHIPPING_TYPE_MAINTAINED",
      params: {},
    });

    if (res.data.code === 0) {
      setAllData(res.data.result);
      setFilterData(res.data.result);
    }
  };

  useEffect(() => {
    getShippingMaintainedData();
  }, []);

  const getShippingData = async () => {
    const res = await http.post(apis.COMMON_POST_WITH_TABLE_NAME, {
      TABLE: "SHIPPING_TYPE",
      params: {},
    });

    if (res.data.code === 0) {
      setShippingData(res.data.result);
    }
  };

  useEffect(() => {
    getShippingData();
  }, []);

  const deleteShipping = async (id) => {
    try {
      props.loading(true);
      const res = await http.post(
        "/rfc/delete_shipping_type_maintained_by_id",
        {
          id,
        }
      );

      if (res.data.code === 0) {
        Swal.fire({
          title: "Success",
          text: "Deleted Successfully",
          icon: "success",
        }).then(() => getShippingData());
      } else {
        Swal.fire({
          title: "Error",
          text: "Something went wrong",
          icon: "error",
        });
      }
    } catch (error) {
    } finally {
      props.loading(false);
    }
  };

  const addNewRow = async () => {
    console.log(postData);
    if (postData.VSART && postData.PLANT && postData.MATERIAL) {
      try {
        props.loading(true);
        const res = await http.post("/rfc/add_shipping_type_maintained", {
          ...postData,
        });

        if (res.data.code === 0) {
          Swal.fire({
            title: "Success",
            text: "Added Successfully",
            icon: "success",
          }).then(() => {
            getShippingMaintainedData();
            setOpenmodal(false);
          });
        }
      } catch (error) {
      } finally {
        props.loading(false);
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
      <div style={{ display: "flex", alignItems: "center" }}>
        <input
          type="text"
          placeholder="Search Plant or Material"
          style={{ margin: 0 }}
          onChange={(e) => searchData(e.target.value)}
        />
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
          <Modal.Title>Add Shipping Type</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="row">
            <div className="col-md-12">
              <div className="form-group">
                <label>
                  Plant<span>*</span>
                </label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Plant"
                  style={{
                    textTransform: "uppercase",
                  }}
                  value={postData.PLANT}
                  onChange={(e) =>
                    setPostData({
                      ...postData,
                      PLANT: e.target.value.toUpperCase(),
                    })
                  }
                />
              </div>
            </div>
            <div className="col-md-12">
              <div className="form-group">
                <label>
                  Material<span>*</span>
                </label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Material"
                  value={postData.MATERIAL}
                  onChange={(e) =>
                    setPostData({ ...postData, MATERIAL: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="col-md-12">
              <div className="form-group">
                <label>
                  Shipping Type<span>*</span>
                </label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Shipping Type"
                  value={postData.VSART}
                  onChange={(e) => {
                    let temp = {};
                    if (e.target.value.length === 2) {
                      temp = shippingData.find(
                        (ele) => ele.VSART === e.target.value
                      );
                    }
                    setPostData({
                      ...postData,
                      VSART: e.target.value,
                      BEZEI: temp.BEZEI ? temp.BEZEI : "",
                    });
                  }}
                />
              </div>
            </div>
            <div className="col-md-12">
              <div className="form-group">
                <label>
                  Shipping Type Desc<span>*</span>
                </label>
                <input
                  type="text"
                  className="form-control"
                  disabled
                  value={postData.BEZEI}
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
            Add New Shipping Type
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

export default connect(mapStateToProps, mapDispatchToProps)(SQLData);
