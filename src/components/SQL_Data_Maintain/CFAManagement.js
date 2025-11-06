import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import http from "../../services/apicall";
import apis from "../../services/apis";
import { loading } from "../../actions/loadingAction";
import Select from "react-select";
import Swal from "sweetalert2";
import store from "../../store";

export const CFAManagement = (props) => {
  const [allUsers, setAllUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [plantByUser, setPlantByUser] = useState([]);

  const getSelectedUser = async () => {
    const res = await http.post("/rfc-reducer/get-cfa-user", {
      IM_CFA_CODE: selectedUser.value,
    });
    if (res.data.status) {
      let plant = res.data.data.EX_DEPO;
      console.log(plant);
      setPlantByUser(plant);
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

      user = user.filter((item) => item.user_type === 3);

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

  const updateIndividualPlantsMap = async () => {
    try {
      store.dispatch(loading(true));
      const resDEP = await http.post(apis.COMMON_POST_WITH_FM_NAME, {
        fm_name: "ZRFC_GET_DEPO",
        params: {
          IM_CFA_CODE: selectedUser.value,
        },
      });

      const resCOM = await http.post(apis.COMMON_POST_WITH_FM_NAME, {
        fm_name: "ZRFC_GET_CFA_COMPREG",
        params: {
          CFA_CODE: selectedUser.value,
        },
      });

      const resAuth = await http.post(apis.COMMON_POST_WITH_FM_NAME, {
        fm_name: "ZRFC_GET_USER_AUTH",
        params: {
          IM_USERID: selectedUser.value,
        },
      });
      if (
        resDEP.data.code === 0 &&
        resCOM.data.code === 0 &&
        resAuth.data.code === 0
      ) {
        const dataDEP = resDEP.data.result;
        const dataCOM = resCOM.data.result;
        const dataAuth = resAuth.data.result;
        const createResCfa = await http.post(
          "/rfc-reducer/upsert-cfa-depot-map",
          {
            ...dataDEP,
          }
        );
        const createResComp = await http.post(
          "/rfc-reducer/upsert-company-cfa-reg",
          {
            ...dataCOM,
          }
        );
        const createResAuth = await http.post(
          "/rfc-reducer/upsert-user-permission",
          {
            ...dataAuth,
          }
        );
        if (
          createResComp.data.status &&
          createResCfa.data.status &&
          createResAuth.data.status
        ) {
          Swal.fire({
            icon: "success",
            title: "Success",
            text: "CFA Plants Updated",
          });
        }
      }
    } catch (error) {
    } finally {
      store.dispatch(loading(false));
    }
  };

  const updateAllCFAUserPlants = async () => {
    updateCFAUserPlants(0);
  };

  const updateCFAUserPlants = async (i) => {
    if (i === allUsers.length - 1) {
      return;
    }
    console.log(allUsers[i].value);

    try {
      store.dispatch(loading(true));
      const resDEP = await http.post(apis.COMMON_POST_WITH_FM_NAME, {
        fm_name: "ZRFC_GET_DEPO",
        params: {
          IM_CFA_CODE: allUsers[i].value,
        },
      });

      const resCOM = await http.post(apis.COMMON_POST_WITH_FM_NAME, {
        fm_name: "ZRFC_GET_CFA_COMPREG",
        params: {
          CFA_CODE: allUsers[i].value,
        },
      });

      const resAuth = await http.post(apis.COMMON_POST_WITH_FM_NAME, {
        fm_name: "ZRFC_GET_USER_AUTH",
        params: {
          IM_USERID: allUsers[i].value,
        },
      });
      if (
        resDEP.data.code === 0 &&
        resCOM.data.code === 0 &&
        resAuth.data.code === 0
      ) {
        // await createPlantUserData(i, res);
        await updatePlantUserData(i, resDEP, resCOM, resAuth);
      } else {
        updateCFAUserPlants(i);
      }
    } catch (error) {
      updateCFAUserPlants(i);
    } finally {
      store.dispatch(loading(false));
    }
  };

  const updatePlantUserData = async (i, resDEP, resCOM, resAuth) => {
    try {
      const dataDEP = resDEP.data.result;
      const dataCOM = resCOM.data.result;
      const dataAuth = resAuth.data.result;

      const createResCfa = await http.post(
        "/rfc-reducer/upsert-cfa-depot-map",
        {
          ...dataDEP,
        }
      );
      const createResComp = await http.post(
        "/rfc-reducer/upsert-company-cfa-reg",
        {
          ...dataCOM,
        }
      );
      if (dataAuth.EX_USER.USERID) {
        const createResAuth = await http.post(
          "/rfc-reducer/upsert-user-permission",
          {
            ...dataAuth,
          }
        );
      }

      if (createResComp.data.status && createResCfa.data.status) {
        updateCFAUserPlants(i + 1);
      } else {
        updateCFAUserPlants(i);
      }
    } catch (error) {
      updateCFAUserPlants(i + 1);
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
          CFA PLANTS Management
        </p>
        <br />
        <div className="row">
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
                    updateAllCFAUserPlants(0);
                  }
                });
              }}
            >
              Update All CFA Plants
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
                          <td>{item.DEPOT}</td>
                          <td>{item.DEPOT_NAME}</td>
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

export default connect(mapStateToProps, mapDispatchToProps)(CFAManagement);
