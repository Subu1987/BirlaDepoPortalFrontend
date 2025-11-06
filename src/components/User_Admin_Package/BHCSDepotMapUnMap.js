import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import { loading } from "../../actions/loadingAction";
import http from "../../services/apicall";
import { RAKE_USERS, getUserType } from "../../data/RAKE_USER_TYPES";
import apis from "../../services/apis";
import Swal from "sweetalert2";
import Select from "react-select";

function BHCSDepotMapUnMap(props) {
  const [fetchUsers, setFetchUsers] = React.useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [allData, setAllData] = useState([]);
  const [addData, setAddData] = useState({
    user_code: "",
    plant: "",
    user_type: 0,
  });
  const [groupView, setGroupView] = useState(true);
  const [searchValue, setSearchValue] = useState("");

  var getUserDeatils = () => {
    props.loading(true);
    http.get("/login/allUser", {}).then((res) => {
      let users = res.data.result;
      if (users?.length > 0) {
        let filteredUser = users.filter((ele) =>
          [...RAKE_USERS, 8].includes(ele.user_type)
        );
        setFetchUsers(filteredUser);
      }
    });
    props.loading(false);
  };

  useEffect(() => {
    getUserDeatils();
    getAllData();
  }, []);

  const getAllData = async () => {
    try {
      props.loading(true);
      const res = await http.post(apis.COMMON_POST_WITH_TABLE_NAME, {
        TABLE: "USER_DEPOT_MAP",
        params: {},
      });
      if (res.data.code === 0) {
        setAllData(res.data.result);
        setFilteredData(res.data.result);
        makeGroupView(res.data.result);
      }
    } catch (error) {
    } finally {
      props.loading(false);
    }
  };

  const deleteRow = async (id, index) => {
    try {
      props.loading(true);

      const res = await http.post("/rfc/delete_user_depot_map_by_id", { id });
      if (res.data.code === 0) {
        Swal.fire({
          title: "Success",
          text: "Entry deleted Successfully",
          icon: "success",
          timer: 500,
        }).then(() => {
          let temp = [...filteredData];
          temp.splice(index, 1);
          setFilteredData(temp);
        });
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

  const deleteMultipleRow = async (ids) => {
    // call multiple times by promise all
    props.loading(true);
    const allDelete = ids.map((id) =>
      http.post("/rfc/delete_user_depot_map_by_id", { id })
    );

    await Promise.all(allDelete);

    Swal.fire({
      title: "Success",
      text: "All Entry deleted Successfully",
      icon: "success",
    }).then((res) => {
      if (res.value) {
        window.location.reload();
      }
    });

    props.loading(false);
  };

  const dataValidation = () => {
    let plants = addData.plant.split(",");
    let isPlantValid = plants.every((ele) => ele.length === 4);
    plants = plants.map((ele) => ele.trim());
    if (!isPlantValid) {
      alert("Plant code is not valid");
      return false;
    }

    let rows = plants.map((ele) => ({
      user_code: addData.user_code,
      plant: ele,
    }));

    let dataHtml = `<div class="bh-cs-map-div">
        <div col="3"><b>USER CODE</b></div><div><b>DEPOT</b></div>
    </div>`;

    rows.forEach((ele) => {
      dataHtml += `<div class="bh-cs-map-div">
        <div col="3">${ele.user_code}</div><div>${ele.plant.toUpperCase()}</div>
      </div>`;
    });

    dataHtml = `<div class="bh-cs-add-container">${dataHtml}</div>`;

    Swal.fire({
      title: "Are you sure?",
      html: `<p>You want to add this entry!</p> ${dataHtml}`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, add it!",
    }).then(async () => {
      const allAdd = rows.map((ele) => addRow(ele));
      await Promise.all(allAdd);
    });
  };

  const addRow = async (addData) => {
    if (addData.plant.length !== 4) {
      alert("Plant code is not valid");
      return;
    }

    let isPresent = filteredData.filter(
      (ele) =>
        ele.USER_CODE === addData.user_code &&
        ele.DEPOT === addData.plant.toUpperCase()
    );

    if (isPresent.length > 0) {
      alert("Data is already present");
      return;
    }

    try {
      props.loading(true);
      const res = await http.post("/rfc/add_user_depot_map", {
        USER_CODE: addData.user_code,
        DEPOT: addData.plant.toUpperCase(),
        USER_TYPE: addData.user_type,
      });
      if (res.data.code === 0) {
        Swal.fire({
          title: "Success",
          text: "Entry added Successfully",
          icon: "success",
        }).then(() => {
          window.location.reload();
        });
      }
    } catch (error) {
    } finally {
      props.loading(false);
    }
  };

  const searchRow = (e) => {
    if (e) {
      let filterUsers = allData.filter((ele) =>
        ele.USER_CODE.includes(e.toUpperCase())
      );
      if (groupView) {
        makeGroupView(filterUsers);
      } else {
        setFilteredData(filterUsers);
      }
    } else {
      if (groupView) {
        makeGroupView(allData);
      } else {
        setFilteredData(allData);
      }
    }
  };

  useEffect(() => {
    console.log(searchValue, groupView);
    searchRow(searchValue);
  }, [searchValue, groupView]);


  const makeGroupView = (filteredData) => {
    if (groupView) {
      let temp = [];
      filteredData.forEach((ele) => {
        let isPresent = temp.filter((item) => item.USER_CODE === ele.USER_CODE);
        if (isPresent.length > 0) {
          isPresent[0].DEPOTS.push(ele.DEPOT);
          isPresent[0].IDs.push(ele.ID);
        } else {
          temp.push({
            USER_CODE: ele.USER_CODE,
            DEPOTS: [ele.DEPOT],
            IDs: [ele.ID],
          });
        }
      });
      setFilteredData(temp);
    } else {
      setFilteredData(allData);
    }
  };


  useEffect(() => {
    makeGroupView(filteredData);
  }, [groupView, allData]);

  return (
    <div style={{ padding: "30px" }}>
      <div
        style={{
          border: "1px solid #ccc",
          padding: "15px",
          borderRadius: 10,
        }}
      >
        <div className="row">
          <div className="col-4">
            <label>User Code</label>
            <div style={{ margin: "10px 0px" }}>
              <Select
                classNamePrefix="report-select"
                options={fetchUsers.map((ele) => {
                  return {
                    value: ele.user_code,
                    label:
                      ele.user_code +
                      " - " +
                      ele.name +
                      " - " +
                      getUserType(ele.user_type).name,
                  };
                })}
                onChange={(e) => {
                  setAddData({
                    ...addData,
                    user_code: e.value,
                    user_code_value: e,
                    user_type: fetchUsers.find(
                      (ele) => e.value === ele.user_code
                    ).user_type,
                  });
                }}
                value={addData.user_code_value}
                placeholder="Select User Code"
              />
            </div>
          </div>
          <div
            style={{
              padding: "10px",
            }}
          ></div>
          <div className="col-6">
            <label>Plant</label>
            <input
              type="text"
              placeholder="Enter Plant Codes by comma"
              style={{ margin: "10px 0px", textTransform: "capitalize" }}
              onChange={(e) =>
                setAddData({ ...addData, plant: e.target.value })
              }
              value={addData.plant}
            />
          </div>
          <div className="col-1">
            <button
              className="goods-button"
              style={{
                background: "#0F6FA2",
                marginTop: "40px",
              }}
              onClick={() => dataValidation()}
              disabled={
                addData.user_code === "" || addData.plant === "" ? true : false
              }
            >
              Add
            </button>
          </div>
        </div>
      </div>
      <br />
      <div
        style={{
          border: "1px solid #ccc",
          padding: "15px",
          borderRadius: 10,
        }}
      >
        <div>
          <input
            type="text"
            placeholder="Search by user_code"
            onChange={(e) => {
              setSearchValue(e.target.value);
            }}
            style={{
              textTransform: "capitalize",
            }}
            value={searchValue}
          />
        </div>
        <div
          style={{ background: "#fff", maxHeight: "700px", overflow: "auto" }}
        >
          <div
            style={{
              padding: "20px",
            }}
          >
            <p>Viewing Option</p>
            <div
              style={{
                display: "flex",
                width: "30%",
              }}
            >
              {" "}
              <input
                type="radio"
                name="APPROVE"
                onChange={() => setGroupView(true)}
                id="group"
                style={{ width: "40px", height: "20px", marginBottom: "0px" }}
                defaultChecked
              />
              <label
                style={{ padding: "0px", margin: "0px" }}
                htmlFor={"group"}
              >
                Group View
              </label>
              &emsp;
              <input
                type="radio"
                name="APPROVE"
                onChange={() => setGroupView(false)}
                style={{ width: "40px", height: "20px", marginBottom: "0px" }}
                id="detailed"
              />
              <label
                style={{ padding: "0px", margin: "0px" }}
                htmlFor={"detailed"}
              >
                Row View
              </label>
            </div>
          </div>
          <table className="table" style={{ margin: 0 }}>
            <thead>
              <tr>
                <th
                  style={{
                    position: "sticky",
                    top: "0px",
                    background: "white",
                  }}
                >
                  {/* <input type="checkbox" /> */}
                </th>
                <th
                  style={{
                    position: "sticky",
                    top: "0px",
                    background: "white",
                  }}
                  scope="col"
                >
                  User Code
                </th>
                <th
                  style={{
                    position: "sticky",
                    top: "0px",
                    background: "white",
                  }}
                  scope="col"
                >
                  Plant
                </th>
                <th
                  style={{
                    position: "sticky",
                    top: "0px",
                    background: "white",
                  }}
                  scope="col"
                >
                  Delete
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((user, index) => (
                <tr
                  key={index}
                  style={{
                    padding: "00px",
                  }}
                >
                  <td></td>
                  <td
                    style={{
                      minWidth: "250px",
                    }}
                  >
                    <p
                      style={{
                        marginBottom: "0px",
                      }}
                    >
                      {user.USER_CODE}
                    </p>
                  </td>

                  <td>
                    {groupView ? (
                      user.DEPOTS?.map((ele, i) => (
                        <div
                          style={{
                            display: "inline-block",
                            margin: "2px 3px",
                            border: "1px solid #a78bfa",
                            padding: "1px 2px",
                            borderRadius: "5px",
                            color: "#4c1d95",
                          }}
                          key={ele + user.USER_CODE + i}
                        >
                          <p style={{ marginBottom: "0px", fontSize: 11 }}>
                            {ele}
                          </p>
                        </div>
                      ))
                    ) : (
                      <div
                        style={{
                          display: "inline-block",
                          margin: "4px 6px",
                          border: "1px solid #a78bfa",
                          padding: "2px 4px",
                          borderRadius: "5px",
                          color: "#4c1d95",
                        }}
                      >
                        {user.DEPOT}
                      </div>
                    )}
                  </td>
                  <td>
                    <img
                      src="/images/delete.png"
                      alt="delete"
                      style={{ width: "20px", cursor: "pointer" }}
                      onClick={() => {
                        groupView
                          ? Swal.fire({
                            title: "Are you sure?",
                            html: `<label>
                                  You want to delete all the mapping?
                                  <br /> You won't be able to revert this!"
                                </label>
                              `,
                            icon: "warning",
                            showCancelButton: true,
                            confirmButtonColor: "#3085d6",
                            cancelButtonColor: "#d33",
                            confirmButtonText: "Yes, delete it!",
                          }).then((result) => {
                            if (result.value) {
                              deleteMultipleRow(user.IDs);
                            }
                          })
                          : Swal.fire({
                            title: "Are you sure?",
                            text: "You won't be able to revert this!",
                            icon: "warning",
                            showCancelButton: true,
                            confirmButtonColor: "#3085d6",
                            cancelButtonColor: "#d33",
                            confirmButtonText: "Yes, delete it!",
                          }).then((result) => {
                            if (result.value) {
                              deleteRow(user.ID, index);
                            }
                          });
                      }}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

const mapStateToProps = (state) => ({
  Auth: state.Auth,
});

export default connect(mapStateToProps, { loading })(BHCSDepotMapUnMap);
