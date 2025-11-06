import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import http from "../../services/apicall";
import apis from "../../services/apis";
import { loading } from "../../actions/loadingAction";
import Select from "react-select";
import Swal from "sweetalert2";
import store from "../../store";

export const PlantManagement = (props) => {
  const [allUsers, setAllUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [plantByUser, setPlantByUser] = useState([]);

  const getSelectedUser = async () => {
    try {
      const res = await http.post("/rfc-reducer/get-user-plant", {
        LV_USER: selectedUser.value,
      });
      if (res.data.status) {
        let plant = res.data.data.IT_FINAL.sort((a, b) =>
          a.WERKS.localeCompare(b.WERKS)
        );
        console.log(plant);
        setPlantByUser(plant);
      }
    } catch (error) {
      console.log(error);
    } finally {
      store.dispatch(loading(false));
    }
  };

  useEffect(() => {
    if (selectedUser) {
      getSelectedUser();
    }
  }, [selectedUser]);

  const getUserDetails = async () => {
    const res = await http.get(apis.ALLUSER);

    if (res.data.code === 0) {
      let user = res.data.result;

      user = user.map((item) => {
        return {
          value: item.user_code,
          label: item.name + " - " + item.user_code,
        };
      });

      setAllUsers(user);
    }
  };

  useEffect(() => {
    getUserDetails();
  }, []);

  const updateAllPlants = async () => {
    const res = await http.post(apis.COMMON_POST_WITH_FM_NAME, {
      fm_name: "ZRFC_GET_PLANTS",
      params: {},
    });

    if (res.data.code === 0) {
      const allPlants = res.data.result.IT_PLANT;

      const updateAllPlants = await http.post(
        "/rfc-reducer/refresh-plant-data",
        {
          plants: allPlants,
        }
      );

      if (updateAllPlants.data.status) {
        Swal.fire({
          icon: "success",
          title: "Success",
          text: "Plants Updated",
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: "Plants Not Updated",
        });
      }
    }
  };

  const updateIndividualPlantsMap = async () => {
    const res = await http.post(apis.COMMON_POST_WITH_FM_NAME, {
      fm_name: "ZFM_PLANT",
      params: {
        LV_USER: selectedUser.value,
      },
    });
    if (res.data.code === 0) {
      let plants = res.data.result.IT_FINAL.sort((a, b) =>
        a.WERKS.localeCompare(b.WERKS)
      );

      const updatePlantsMap = await http.post(
        "/rfc-reducer/upsert-user-plant",
        {
          LV_USER: selectedUser.value,
          IT_FINAL: plants,
        }
      );

      if (updatePlantsMap.data.status) {
        Swal.fire({
          icon: "success",
          title: "Success",
          text: "Plants Updated",
        }).then(() => {
          setSelectedUser(null);
          setPlantByUser([]);
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: "Plants Not Updated",
        });
      }
    }
  };

  const updateAllUserPlants = async () => {
    updateUserPlants(0);
  };

  const updateUserPlants = async (i) => {
    if (i === allUsers.length - 1) {
      return;
    }
    console.log(allUsers[i].value);

    try {
      store.dispatch(loading(true));
      const res = await http.post(apis.COMMON_POST_WITH_FM_NAME, {
        fm_name: "ZFM_PLANT",
        params: {
          LV_USER: allUsers[i].value,
        },
      });
      if (res.data.code === 0) {
        await createOrUpdatePlantUserData(i, res);
      }
    } catch (error) {
      updateUserPlants(i);
    } finally {
      store.dispatch(loading(false));
    }
  };

  const createOrUpdatePlantUserData = async (i, res) => {
    try {
      const data = res.data.result;
      const createRes = await http.post("/rfc-reducer/upsert-user-plant", {
        ...data,
      });
      if (createRes.data.status) {
        updateUserPlants(i + 1);
      }
    } catch (error) {
      updateUserPlants(i + 1);
    }
  };

  return (
    <div>
      <div className="filter-section">
        <p
          style={{
            fontSize: "20px",
          }}
        >
          USER PLANTS Management
        </p>
        <br />
        <div className="row">
          <div className="col-md-2">
            <button
              style={{
                display: "block",
                margin: "20px auto",
              }}
              className="button goods-button"
              onClick={() => updateAllPlants()}
            >
              Update Plants
            </button>
          </div>
          <div className="col-md-2">
            <button
              className="button goods-button"
              style={{
                display: "block",
                margin: "20px auto",
              }}
              onClick={() => {
                Swal.fire({
                  title: "Are you sure?",
                  text: `This will create ${
                    allUsers.length * 6
                  } new sessions. which lead to server slow down. Else you can update individual CFA Plants.`,
                  icon: "warning",
                  showCancelButton: true,
                  confirmButtonColor: "#3085d6",
                  cancelButtonColor: "#d33",
                  confirmButtonText: "Yes, Update All CFA Plants",
                  cancelButtonText: "No, Cancel",
                }).then((result) => {
                  if (result.value) {
                    updateAllUserPlants(0);
                  }
                });
              }}                                                                                                                        
            >
              Update Users Plants
            </button>
          </div>
          <div className="col-md-3">
            <div style={{ margin: "20px auto", padding: "0px 20px" }}>
              <Select
                options={allUsers}
                onChange={(e) => setSelectedUser(e)}
                classNamePrefix="report-select"
                placeholder="Select User"
                value={selectedUser}
              />
              <button
                className="button goods-button"
                onClick={() => updateIndividualPlantsMap()}
              >
                Update
              </button>
            </div>
          </div>
          {selectedUser && plantByUser && (
            <div className="col-md-5">
              <div>
                <div className="table-div">
                  <table className="table">
                    <thead>
                      <tr
                        style={{
                          position: "sticky",
                          top: "0px",
                          background: "white",
                        }}
                      >
                        <th>{selectedUser.value}</th>
                        <th>{selectedUser.label.split(" - ")[0]}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {plantByUser?.map((item, index) => (
                        <tr key={index}>
                          <td>{item.WERKS}</td>
                          <td>{item.NAME1}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="col-md-12"></div>
    </div>
  );
};

const mapStateToProps = (state) => ({});

const mapDispatchToProps = {
  loading,
};

export default connect(mapStateToProps, mapDispatchToProps)(PlantManagement);
