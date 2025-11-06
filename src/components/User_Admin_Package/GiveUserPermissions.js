import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import Select from "react-select";
import http from "../../services/apicall";
import apis from "../../services/apis";
import store from "../../store";

export default function GiveUserPermissions() {
  const [users, setUsers] = useState([]);
  const [newUserName, setNewUserName] = useState(null);
  const [category, setCategory] = useState("");
  const [fetchUsers, setFetchUsers] = useState([]);

  const handleAddUser = () => {
    if (newUserName.value) {
      setUsers([...users, newUserName]);
      setNewUserName(null);
    }
  };

  const handleInputChange = (event) => {
    setNewUserName(event.target.value.trim());
  };

  const handleCategoryChange = (event) => {
    setCategory(event.target.value);
  };

  const givePermission = async () => {
    if (!category || !users.length) {
      Swal.fire({
        title: "Error",
        text: "Please select a category or add some users.",
        icon: "error",
      });
      return;
    }

    let IT_USER = users.map((ele) => {
      return {
        USERID: ele.value,
        CAP_INVT: "X",
        APP_INVT: "X",
        DIS_INVT: "X",
        REP_INVT: "X",
        USER_CATEGORY: category,
      };
    });

    let postData = {
      fm_name: "ZRFC_SET_USER_AUTH",
      params: {
        IT_USER,
      },
    };

    const res = await http.post(apis.COMMON_POST_WITH_FM_NAME, postData);

    if (res.data.code === 0) {
      Swal.fire({
        title: "Success",
        html: generateMsg(res.data.result.IT_USER),
        icon: "success",
      }).then(() => window.location.reload());
    } else {
      Swal.fire({
        title: "Error",
        text: "Something went wrong.",
        icon: "error",
      });
    }
  };

  const generateMsg = (data) => {
    let msg = "";
    data.forEach((ele) => {
      if (ele.MESSAGE) {
        msg += `<p>${ele.MESSAGE}.</p>`;
      } else {
        msg += `<p>Permissions given to the user ${ele.USERID}.</p>`;
      }
    });
    return msg;
  };

  useEffect(() => {
    getUserDetails();
  }, []);

  const getUserDetails = () => {
    store.dispatch({
      type: "LOADING",
      payload: true,
    });
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
        store.dispatch({
          type: "LOADING",
          payload: false,
        });
      });
  };

  console.log(newUserName);

  const handleRefresh = async () => {
    const postData = {
      fm_name: "ZRFC_GET_REGHEAD_DEPOT",
      params: {
        IM_USERID: "BCWSA027",
      },
    };
    const data = await http.post(apis.COMMON_POST_WITH_FM_NAME, postData);

    if (data.data.result.IT_USER.length > 0) {
      const updateMap = await http.post(
        "/update-region-depot-map",
        data.data.result.IT_USER
      );
      if (updateMap.data.code === 0) {
        Swal.fire({
          title: "Success",
          text: "User permissions updated successfully",
          icon: "success",
          showConfirmButton: false,
          timer: 1000,
        });
      }
    }

    console.log(data);
  };

  return (
    <div className="filter-section">
      <div className="row">
        <div className="col-5">
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
              gridTemplateColumns: users.length ? "1fr" : "1fr",
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
                {user.label}
              </li>
            ))}
          </ul>
          <div>
            <label style={{ display: "flex" }}>
              <div
                style={{
                  width: "100%",
                }}
              >
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
                {/* <input
                  type="text"
                  placeholder="Enter a new user name"
                  value={newUserName}
                  onChange={handleInputChange}
                  style={{
                    margin: "0px",
                  }}
                  onKeyDown={(e) => {
                    // on enter add users
                    if (e.key === "Enter") {
                      handleAddUser();
                    }
                  }}
                /> */}
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
          <label
            style={{
              width: "100%",
            }}
          >
            Category:
            <div
              style={{
                position: "relative",
              }}
            >
              <i className="fas fa-angle-down icons"></i>
              <select value={category} onChange={handleCategoryChange}>
                <option value={""}>Select Category</option>
                <option value="CFA">CFA</option>
                <option value="REGH">REGH</option>
              </select>
            </div>
          </label>
          <div>
            <button
              className="goods-button"
              onClick={givePermission}
              style={{
                background: "green",
                margin: "22px 10px 0px 10px",
                height: "35px",
                width: "100%",
              }}
            >
              Give Permissions
            </button>
          </div>
        </div>

        <div className="col-1"></div>
        <div className="col-5">
          <button
            className="goods-button"
            onClick={handleRefresh}
            style={{
              background: "green",
              margin: "22px 10px 0px 10px",
            }}
          >
            Refresh RR dashboard data map
          </button>
        </div>
      </div>
    </div>
  );
}
