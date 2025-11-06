import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import Swal from "sweetalert2";
import { loading } from "../../actions/loadingAction";

import http from "../../services/apicall";
import apis from "../../services/apis";
import Select from "react-select";
import useAllPlant from "../../hook/useAllPlants";

export const CFADepotMap = (props) => {
  const [codesMap, setCodesMap] = useState({
    DEPOT_CODE: "",
    CFA_CODE: "",
  });

  const [fetchUsers, setFetchUsers] = useState([]);
  const [users, setUsers] = useState([]);
  const [depots, setDepots] = useState([]);
  const [newDepot, setNewDepot] = useState(null);
  const [newUserName, setNewUserName] = useState(null);

  const allPlant = useAllPlant();

  const validateDepotCodeMap = (e) => {
    let DEPOT_CODE = e.target.value;
    DEPOT_CODE = DEPOT_CODE.toUpperCase().trim();
    if (DEPOT_CODE.length === 4) {
      props.loading(true);
      setCodesMap({ ...codesMap, DEPOT_CODE });
      http
        .post(apis.COMMON_POST_WITH_FM_NAME, {
          fm_name: "ZRFC_VALIDATE_DEPOT",
          params: {
            DEPOT_CODE,
          },
        })
        .then((res) => {
          if (res.data.result.EX_MESSAGE.TYPE === "E") {
            Swal.fire({
              title: "Oops...",
              icon: "error",
              text: res.data.result.EX_MESSAGE.MESSAGE,
            }).then(() => {
              setCodesMap({ ...codesMap, CFA_CODE: "" });
            });
          }
        })
        .catch((err) => {
          console.log(err);
        })
        .finally(() => {
          props.loading(false);
        });
    }
  };

  const validateCFACodeMap = (e) => {
    let CFA_CODE = e.target.value;
    CFA_CODE = CFA_CODE.toUpperCase().trim();
    if (CFA_CODE.length === 8) {
      props.loading(true);
      setCodesMap({ ...codesMap, CFA_CODE });
      http
        .post(apis.COMMON_POST_WITH_FM_NAME, {
          fm_name: "ZRFC_VALIDATE_CFA",
          params: {
            CFA_CODE,
          },
        })
        .then((res) => {
          if (res.data.result.EX_MESSAGE.TYPE === "E") {
            Swal.fire({
              title: "Oops...",
              icon: "error",
              text: res.data.result.EX_MESSAGE.MESSAGE,
            }).then(() => {
              console.log(CFA_CODE);
              setCodesMap({ ...codesUnMap, CFA_CODE: "" });
            });
          }
        })
        .catch((err) => {
          console.log(err);
        })
        .finally(() => {
          props.loading(false);
        });
    }
  };

  const mapDepotCFAMap = (data) => {
    if (data.DEPOT_CODE === "" || data.CFA_CODE === "") {
      Swal.fire({
        title: "Oops...",
        icon: "error",
        text: "Please enter valid Depot Code and CFA Code",
      });
    } else {
      props.loading(true);
      http
        .post(apis.COMMON_POST_WITH_FM_NAME, {
          fm_name: "ZRFC_CFA_LINKAGE",
          params: { ...data },
        })
        .then((res) => {
          if (res.data.result.EX_MESSAGE.TYPE === "S") {
            Swal.fire({
              title: "Success",
              icon: "success",
              text: res.data.result.EX_MESSAGE.MESSAGE,
            })
              .then(() => {
                setCodesUnMap({ DEPOT_CODE: "", CFA_CODE: "" });
              })
              .then(() => {
                window.location.reload();
              });
          } else {
            Swal.fire({
              title: "Oops...",
              icon: "error",
              text: res.data.result.EX_MESSAGE.MESSAGE,
            });
          }
        })
        .catch((err) => {
          console.log(err);
        })
        .finally(() => {
          props.loading(false);
        });
    }
  };

  // unmap depot cfa
  const [codesUnMap, setCodesUnMap] = useState({
    DEPOT_CODE: "",
    CFA_CODE: "",
  });

  const validateDepotCodeUnMap = (e) => {
    let DEPOT_CODE = e.target.value;
    DEPOT_CODE = DEPOT_CODE.toUpperCase().trim();
    if (DEPOT_CODE.length === 4) {
      props.loading(true);
      setCodesUnMap({ ...codesUnMap, DEPOT_CODE });
      http
        .post(apis.COMMON_POST_WITH_FM_NAME, {
          fm_name: "ZRFC_VALIDATE_DEPOT",
          params: {
            DEPOT_CODE,
          },
        })
        .then((res) => {
          if (res.data.result.EX_MESSAGE.TYPE === "E") {
            Swal.fire({
              title: "Oops...",
              icon: "error",
              text: res.data.result.EX_MESSAGE.MESSAGE,
            }).then(() => {
              setCodesUnMap({ ...codesUnMap, CFA_CODE: "" });
            });
          }
        })
        .catch((err) => {
          console.log(err);
        })
        .finally(() => {
          props.loading(false);
        });
    }
  };

  const validateCFACodeUnMap = (e) => {
    let CFA_CODE = e.target.value;
    CFA_CODE = CFA_CODE.toUpperCase().trim();
    if (CFA_CODE.length === 8) {
      props.loading(true);
      setCodesUnMap({ ...codesUnMap, CFA_CODE });
      http
        .post(apis.COMMON_POST_WITH_FM_NAME, {
          fm_name: "ZRFC_VALIDATE_CFA",
          params: {
            CFA_CODE,
          },
        })
        .then((res) => {
          if (res.data.result.EX_MESSAGE.TYPE === "E") {
            Swal.fire({
              title: "Oops...",
              icon: "error",
              text: res.data.result.EX_MESSAGE.MESSAGE,
            }).then(() => {
              setCodesUnMap({ ...codesUnMap, CFA_CODE: "" });
            });
          }
        })
        .catch((err) => {
          console.log(err);
        })
        .finally(() => {
          props.loading(false);
        });
    }
  };

  const mapDepotCFAUnMap = (data) => {
    if (data.DEPOT_CODE === "" || data.CFA_CODE === "") {
      Swal.fire({
        title: "Oops...",
        icon: "error",
        text: "Please enter valid Depot Code and CFA Code",
      });
    } else {
      props.loading(true);
      http
        .post(apis.COMMON_POST_WITH_FM_NAME, {
          fm_name: "ZRFC_CFA_DELINK",
          params: { ...data },
        })
        .then((res) => {
          if (res.data.result.EX_MESSAGE.TYPE === "S") {
            Swal.fire({
              title: "Success",
              icon: "success",
              text: res.data.result.EX_MESSAGE.MESSAGE,
            })
              .then(() => {
                setCodesUnMap({ DEPOT_CODE: "", CFA_CODE: "" });
              })
              .then(() => {
                window.location.reload();
              });
          } else {
            Swal.fire({
              title: "Oops...",
              icon: "error",
              text: res.data.result.EX_MESSAGE.MESSAGE,
            });
          }
        })
        .catch((err) => {
          console.log(err);
        })
        .finally(() => {
          props.loading(false);
        });
    }
  };

  // bulk user depot update
  useEffect(() => {
    getUserDetails();
  }, []);

  var getUserDetails = () => {
    props.loading(true);
    http
      .get(apis.ALLUSER)
      .then((res) => {
        let users = res.data.result;
        if (users?.length > 0) {
          setFetchUsers(users);
        }
      })
      .catch((ele) => console.log(ele))
      .finally(() => {
        props.loading(false);
      });
  };

  const handleAddUser = () => {
    if (users.includes(newUserName?.value)) {
      Swal.fire({
        title: "Oops...",
        icon: "error",
        text: "User already added",
      });
      return;
    }

    if (newUserName?.value.trim() !== "") {
      setUsers([...users, newUserName?.value]);
      setNewUserName("");
    }
  };
  const handleAddDepot = () => {
    if (depots.includes(newDepot?.value)) {
      Swal.fire({
        title: "Oops...",
        icon: "error",
        text: "Depot already added",
      });
      return;
    }

    if (newDepot?.value.trim() !== "") {
      setDepots([...depots, newDepot?.value]);
      setNewDepot("");
    }
  };

  const bulkUpload = async () => {
    if (users.length === 0 || depots.length === 0) {
      Swal.fire({
        title: "Oops...",
        icon: "error",
        text: "Please add users and depots",
      });
      return;
    }

    let combinations = generateCombinations(depots, users);

    console.log(combinations);

    try {
      props.loading(true);
      let requests = combinations.map((ele) =>
        http.post(apis.COMMON_POST_WITH_FM_NAME, {
          fm_name: "ZRFC_CFA_LINKAGE",
          params: { ...ele },
        })
      );

      const response = await Promise.all(requests);
      console.log(response);
      if (response) {
        Swal.fire({
          title: "Success",
          icon: "success",
          text: "Users and Depots mapped successfully",
        }).then(() => {
          setUsers([]);
          setDepots([]);
        });
      }
    } catch {
      Swal.fire({
        title: "Oops...",
        icon: "error",
        text: "Something went wrong",
      });
    } finally {
      props.loading(false);
    }
  };

  function generateCombinations(depotCodes, userCodes) {
    const combinations = [];

    depotCodes.forEach((depotCode) => {
      userCodes.forEach((userCode) => {
        combinations.push({ CFA_CODE: userCode, DEPOT_CODE: depotCode });
      });
    });

    return combinations;
  }

  return (
    <>
      {/* bulk depot map */}
      <div
        style={{
          border: "1px solid #ccc",
          margin: 20,
          padding: 10,
          borderRadius: 10,
        }}
      >
        <div className="filter-section">
          <div className="row" style={{ gap: "10px" }}>
            <div className="col-5" style={{}}>
              <h6
                style={{
                  fontWeight: 600,
                }}
              >
                User List App
              </h6>
              <ul
                style={{
                  alignItems: "start",
                  letterSpacing: "1px",
                  border: "1px solid #ccc",
                  borderRadius: 10,
                  padding: 0,
                  display: "grid",
                  gridTemplateColumns: users.length ? "1fr 1fr" : "1fr",
                }}
              >
                {users.length === 0 && (
                  <div
                    style={{
                      margin: "auto",
                      padding: "20px",
                    }}
                  >
                    Add some users to Map
                  </div>
                )}
                {users.map((user, index) => (
                  <li
                    style={{
                      padding: "5px 20px",
                      textAlign: "left",
                      borderRadius: "10px",
                      border: "1px solid #cccc",
                      margin: "5px",
                    }}
                    key={index}
                  >
                    {user}
                  </li>
                ))}
              </ul>
              <label style={{ display: "flex" }}>
                <div style={{ width: "100%" }}>
                  User Code:
                  <Select
                    classNamePrefix="report-select"
                    options={fetchUsers
                      .filter((ele) => ele.user_type === 3)
                      .map((ele) => {
                        return {
                          value: ele.user_code,
                          label: ele.user_code + " - " + ele.name,
                        };
                      })}
                    onChange={(e) => {
                      // setValue("IM_CFA", e?.value);
                      setNewUserName(e);
                    }}
                    value={newUserName}
                    placeholder={"Select CFA"}
                    isClearable={true}
                    styles={{
                      width: "500px",
                    }}
                  />
                </div>
                <button
                  className="goods-button"
                  onClick={handleAddUser}
                  style={{
                    background: "green",
                    margin: "22px 10px 0px 10px",
                    height: "35px",
                  }}
                >
                  Add_User
                </button>
              </label>
            </div>
            <div className="col-5" style={{}}>
              <h6
                style={{
                  fontWeight: 600,
                }}
              >
                Depot List
              </h6>
              <ul
                style={{
                  alignItems: "start",
                  letterSpacing: "1px",
                  border: "1px solid #ccc",
                  borderRadius: 10,
                  padding: 0,
                  display: "grid",
                  gridTemplateColumns: depots.length ? "1fr 1fr 1fr" : "1fr",
                }}
              >
                {depots.length === 0 && (
                  <div
                    style={{
                      margin: "auto",
                      padding: "20px",
                    }}
                  >
                    Add some depot to Map
                  </div>
                )}
                {depots.map((user, index) => (
                  <li
                    style={{
                      padding: "5px 20px",
                      textAlign: "left",
                      borderRadius: "10px",
                      border: "1px solid #cccc",
                      margin: "5px",
                    }}
                    key={index}
                  >
                    {user}
                  </li>
                ))}
              </ul>
              <label style={{ display: "flex" }}>
                <div style={{ width: "100%" }}>
                  Depot Code:
                  <Select
                    classNamePrefix="report-select"
                    options={allPlant.map((ele) => {
                      return {
                        value: ele.PLANT,
                        label: ele.PLANT + " - " + ele.PLANT_NAME,
                      };
                    })}
                    onChange={(e) => {
                      // setValue("IM_CFA", e?.value);
                      setNewDepot(e);
                    }}
                    value={newDepot}
                    placeholder={"Select Depot"}
                    isClearable={true}
                    styles={{}}
                  />
                </div>
                <button
                  className="goods-button"
                  onClick={handleAddDepot}
                  style={{
                    background: "green",
                    margin: "22px 10px 0px 10px",
                    height: "35px",
                  }}
                >
                  Add_Depot
                </button>
              </label>
            </div>
            <div className="col-6">
              <button
                className="goods-button"
                onClick={bulkUpload}
                style={{
                  background: "green",
                  height: "35px",
                }}
              >
                BULK DEPOT USER MAP
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* map depot */}
      <div
        style={{
          border: "1px solid #ccc",
          margin: 20,
          padding: 10,
          borderRadius: 10,
        }}
      >
        <div className="filter-section">
          <div className="row">
            <div className="col-12 col-md-6">
              <div className="row">
                <div className="col-12">
                  <label className="filter-label">Depot Code</label>
                  <input
                    type="text"
                    onChange={(e) => validateDepotCodeMap(e)}
                    style={{ textTransform: "uppercase" }}
                  />
                </div>
              </div>
            </div>
            <div className="col-12 col-md-6">
              <div className="row">
                <div className="col-12">
                  <label className="filter-label">CFA Code</label>
                  <input
                    type="text"
                    onChange={(e) => validateCFACodeMap(e)}
                    style={{ textTransform: "uppercase" }}
                  />
                </div>
              </div>
            </div>
            <div className="col-12 col-md-6">
              <div className="row">
                <div className="col-12">
                  <button
                    className="button goods-button"
                    style={{ margin: "0", marginTop: "20px" }}
                    onClick={() => mapDepotCFAMap(codesMap)}
                  >
                    Map
                  </button>
                </div>
              </div>
            </div>
          </div>
          {/* <div className="row">
        <div className="col-12">
          <button
            className="button goods-button"
            onClick={() => makeApiCall(0)}
          >
            BULK UPLOAD
          </button>
        </div>
      </div> */}
        </div>
      </div>

      {/* unmap depot */}
      <div
        style={{
          border: "1px solid #ccc",
          margin: 20,
          padding: 10,
          borderRadius: 10,
        }}
      >
        <div className="filter-section">
          <div className="row">
            <div className="col-12 col-md-6">
              <div className="row">
                <div className="col-12">
                  <label className="filter-label">Depot Code</label>
                  <input
                    type="text"
                    onChange={(e) => validateDepotCodeUnMap(e)}
                    style={{ textTransform: "uppercase" }}
                  />
                </div>
              </div>
            </div>
            <div className="col-12 col-md-6">
              <div className="row">
                <div className="col-12">
                  <label className="filter-label">CFA Code</label>
                  <input
                    type="text"
                    onChange={(e) => validateCFACodeUnMap(e)}
                    style={{ textTransform: "uppercase" }}
                  />
                </div>
              </div>
            </div>
            <div className="col-12 col-md-6">
              <div className="row">
                <div className="col-12">
                  <button
                    className="button goods-button"
                    style={{ margin: "0", marginTop: "20px" }}
                    onClick={() => mapDepotCFAUnMap(codesUnMap)}
                  >
                    Un Map
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

const mapStateToProps = (state) => ({});

const mapDispatchToProps = {
  loading,
};

export default connect(mapStateToProps, mapDispatchToProps)(CFADepotMap);
