import React, { useEffect, useState } from "react";
import { loading } from "../../actions/loadingAction";
import { useLocation } from "react-router";
import apis from "../../services/apis";
import { connect } from "react-redux";
import { useForm } from "react-hook-form";
import http from "../../services/apicall";
import Swal from "sweetalert2";
import { useHistory } from "react-router-dom";

const queryString = require("query-string");

function UserCreateForm(props) {
  const { register, handleSubmit, reset, errors } = useForm({
    mode: "onSubmit",
    reValidateMode: "onChange",
  });

  const [newFirstName, setnewFirstName] = useState([{ first_name: "" }]);
  const [newLastName, setnewLastName] = useState([{ last_name: "" }]);
  const [newUserCode, setnewUserCode] = useState([{ user_code: "" }]);
  const [newEmail, setnewEmail] = useState([{ email: "" }]);
  const [newMobile, setnewMobile] = useState([{ mobile: "" }]);
  const [userType, setUserType] = useState([{ user_type: "" }]);
  let location = useLocation();
  let history = useHistory();
  useEffect(() => {
    const parsed = queryString.parse(location.search);
    // console.log(parsed.user_id);
    if (parsed.user_id != undefined) {
      fetchUserDetails(parsed.user_id);
      console.log(parsed.user_id);
    }
    // console.log(location);
  }, []);

  let fetchUserDetails = (id) => {
    props.loading(true);
    http
      .post(apis.USER, { id: id })
      .then((res) => {
        // console.log(res.data.result[0]);
        setnewFirstName({
          first_name: res.data.result[0].name.split(" ")[0],
        });
        setnewLastName({
          last_name: res.data.result[0].name.split(" ")[1],
        });
        setnewUserCode({
          user_code: res.data.result[0].user_code,
        });
        setnewEmail({
          email: res.data.result[0].email,
        });
        setnewMobile({
          mobile: res.data.result[0].mobile,
        });
        setUserType({
          user_type: res.data.result[0].user_type,
        });
      })
      .catch((err) => {
        console.log(err);
        //handle error

      })
      .finally(() => {
        props.loading(false);
      });
  };

  let saveFormData = (data) => {
    // console.log(data);
    reset();
    let body = {
      name: data.firstName + " " + data.lastName,
      user_code: data.userCode,
      email: data.email,
      mobile: data.mobile,
      password: data.password,
      user_type: data.userType,
      rfc_password: data.rfcPassword,
    };
    // console.log(body);
    http
      .post(apis.CREATE_USER, body)
      .then((res) => {
        // console.log(res.data.message);
        Swal.fire({
          // title: 'Error!',
          text: res.data.message,
          // icon: 'error',
          confirmButtonText: "Ok",
        }).then(function () {
          history.push("/dashboard/user-admin/user-create");
          window.location.reload();
        });
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const onSubmit = (data) => {
    console.log(data);
    if (data.password != data.confpassword) {
      Swal.fire({
        title: "Error!",
        text: "The Password did not Match..!!!",
        icon: "error",
        confirmButtonText: "Ok",
      });
    } else if (data.rfcPassword != data.rfcConf) {
      console.log("Hello");
    } else {
      // console.log(data);
      saveFormData(data);
    }
  };

  return (
    <div className="row input-area user-create-div">
      <div className="col" style={{ padding: "0px 100px" }}>
        {/* <h2>Create User</h2> */}
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="row">
            <div className="firstName col">
              <label htmlFor="firstName">First Name</label>
              <div className="col" style={{ padding: "0px" }}>
                <i className="fas fa-user-circle icons"></i>
                <input
                  type="text"
                  className=""
                  placeholder="First Name"
                  name="firstName"
                  ref={register({
                    required: "Required",
                  })}
                  value={newFirstName.first_name}
                  onChange={(e) => {
                    setnewFirstName({ first_name: e.target.value });
                  }}
                ></input>
                {errors.firstName && <p>{errors.firstName.message}</p>}
              </div>
            </div>
            <div style={{ margin: "10px" }}></div>
            <div className="lastName col">
              <label htmlFor="lastName">Last Name</label>
              <div className="col" style={{ padding: "0px" }}>
                <i className="fas fa-user-circle icons"></i>
                <input
                  type="text"
                  className=""
                  placeholder="Last Name"
                  name="lastName"
                  ref={register({
                    required: "Required",
                  })}
                  value={newLastName.last_name}
                  onChange={(e) => {
                    setnewLastName({ last_name: e.target.value });
                  }}
                ></input>
                {errors.lastName && <p>{errors.lastName.message}</p>}
              </div>
            </div>
          </div>
          <div className="userCode">
            <label htmlFor="userCode">User Code</label>
            <div className="col" style={{ padding: "0px" }}>
              <i className="fas fa-user icons"></i>
              <input
                type="text"
                className=""
                placeholder="User Code"
                name="userCode"
                ref={register({
                  required: "Required",
                })}
                value={newUserCode.user_code}
                onChange={(e) => {
                  setnewUserCode({ user_code: e.target.value });
                }}
              ></input>
              {errors.userCode && <p>{errors.userCode.message}</p>}
            </div>
          </div>
          <div className="email">
            <label htmlFor="email">Email</label>
            <div className="col" style={{ padding: "0px" }}>
              <i className="fas fa-envelope icons"></i>
              <input
                type="email"
                className=""
                value={newEmail.email}
                placeholder="Email"
                name="email"
                ref={register({
                  // required: "Required",
                })}
                onChange={(e) => {
                  setnewEmail({ email: e.target.value });
                }}
              ></input>
              {errors.email && <p>{errors.email.message}</p>}
            </div>
          </div>
          <div className="mobile-">
            <label htmlFor="mobile">Mobile</label>
            <div className="col" style={{ padding: "0px" }}>
              <i className="fas fa-mobile-alt icons"></i>
              <input
                type="text"
                className=""
                placeholder="Mobile"
                name="mobile"
                ref={register({
                  required: "Required",
                  maxLength: {
                    value: 10,
                    message: "Require 10 Digits",
                  },
                })}
                onChange={(e) => {
                  setnewMobile({ mobile: e.target.value });
                  if (isNaN(e.target.value)) {
                    Swal.fire({
                      title: "Error!",
                      text: "Enter A Number",
                      icon: "error",
                      confirmButtonText: "Ok",
                    });
                  }
                }}
                value={newMobile.mobile}
              />
              {errors.mobile && <p>{errors.mobile.message}</p>}
            </div>
          </div>
          <div className="password">
            <label htmlFor="password">Enter User Type</label>
            <div className="col" style={{ padding: "0px" }}>
              <i className="fas fa-user icons" style={{ top: 10 }}></i>
              <select
                className="form-control"
                name="userType"
                ref={register({
                  required: "Required",
                })}
              >
                <option value={2}>USER</option>
                <option value={3}>CFA</option>
                <option value={4}>Branch Head</option>
                <option value={5}>CS Officer</option>
                <option value={6}>Logistics Head</option>
                <option value={7}>Logistics Head (Read)</option>
                <option value={9}>Sales Account Manager</option>
                <option value={8}>Secondary Distribution Manager</option>
              </select>

              {errors.password && <p>{errors.password.message}</p>}
            </div>
          </div>
          <div className="password">
            <label htmlFor="password">Enter Password</label>
            <div className="col" style={{ padding: "0px" }}>
              <i className="fas fa-key icons"></i>
              <input
                type="password"
                className=""
                placeholder="Enter Password"
                name="password"
                ref={register({
                  required: "Required",
                  minLength: {
                    value: 6,
                    message: "Password Should be Greater than 6",
                  },
                })}
              ></input>

              {errors.password && <p>{errors.password.message}</p>}
            </div>
          </div>
          <div className="confpassword">
            <label htmlFor="password">Confirm Password</label>
            <div className="col" style={{ padding: "0px" }}>
              <i className="fas fa-key icons"></i>
              <input
                type="password"
                className=""
                placeholder="Enter Password"
                name="confpassword"
                ref={register({
                  required: "Required",
                  minLength: {
                    value: 6,
                    message: "Password Should be Greater than 6",
                  },
                })}
              ></input>

              {errors.confpassword && <p>{errors.confpassword.message}</p>}
            </div>
          </div>
          <div className="password">
            <label htmlFor="password">Enter RFC Password</label>
            <div className="col" style={{ padding: "0px" }}>
              <i className="fas fa-key icons"></i>
              <input
                type="password"
                className=""
                placeholder="Enter RFC Password"
                name="rfcPassword"
                ref={register({
                  required: "Required",
                  minLength: {
                    value: 6,
                    message: "Password Should be Greater than 6",
                  },
                })}
              ></input>

              {errors.password && <p>{errors.rfcPassword.message}</p>}
            </div>
          </div>
          <div className="confpassword">
            <label htmlFor="password">Confirm RFC Password</label>
            <div className="col" style={{ padding: "0px" }}>
              <i className="fas fa-key icons"></i>
              <input
                type="password"
                className=""
                placeholder="Confirm RFC Password"
                name="rfcConf"
                ref={register({
                  required: "Required",
                  minLength: {
                    value: 6,
                    message: "Password Should be Greater than 6",
                  },
                })}
              ></input>

              {errors.confpassword && <p>{errors.rfcConf.message}</p>}
            </div>
          </div>
          <div className="createUser">
            <button className="button button-foreword" type="submit">
              Register
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const mapStateToProps = (state) => ({
  Auth: state.Auth,
});

export default connect(mapStateToProps, { loading })(UserCreateForm);
