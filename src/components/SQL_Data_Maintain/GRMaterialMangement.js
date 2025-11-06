import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import http from "../../services/apicall";
import apis from "../../services/apis";
import Swal from "sweetalert2";
import { Modal } from "react-bootstrap";
import { loading } from "../../actions/loadingAction";
import store from "../../store";

export const GRMaterialManagement = (props) => {
  const [allData, setAllData] = useState([]);
  const [filterData, setFilterData] = useState([]);
  const [openmodal, setOpenmodal] = useState(false);
  const [postData, setPostData] = useState({});

  let columns = [
    { header: "" },
    { header: "Material No.", key: "MATERIAL" },
    { header: "Delete", key: "id" },
  ];

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
        deleteMaterial(id);
      },
    });
  };

  const getMaterials = async () => {
    const res = await http.post(apis.COMMON_POST_WITH_TABLE_NAME, {
      TABLE: "GR_MATERIALS",
      params: {},
    });

    if (res.data.code === 0) {
      setAllData(res.data.result);
      setFilterData(res.data.result);
    }
  };

  useEffect(() => {
    getMaterials();
  }, []);

  const deleteMaterial = async (id) => {
    try {
      store.dispatch(loading(true));
      const res = await http.post("/rfc/delete_gr_materials_by_id", {
        id,
      });

      if (res.data.code === 0) {
        Swal.fire({
          title: "Success",
          text: "Deleted Successfully",
          icon: "success",
        }).then(() => getMaterials());
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
    if (postData.MATERIAL) {
      try {
        store.dispatch(loading(true));
        const res = await http.post("/rfc/add_gr_materials", {
          ...postData,
        });

        if (res.data.code === 0) {
          Swal.fire({
            title: "Success",
            text: "Added Successfully",
            icon: "success",
          }).then(() => {
            getMaterials();
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
          GR Materials Management
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
          <Modal.Title>Add Material</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="row">
            <div className="col-md-12">
              <div className="form-group">
                <label>
                  MATERIAL<span>*</span>
                </label>
                <input
                  className="form-control"
                  value={postData.MATERIAL}
                  onChange={(e) =>
                    setPostData({ ...postData, MATERIAL: e.target.value })
                  }
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
            Add New Material
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
)(GRMaterialManagement);
