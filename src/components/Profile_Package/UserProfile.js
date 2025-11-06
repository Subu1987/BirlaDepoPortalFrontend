import React, { useEffect, useState } from "react";
import { loading } from "../../actions/loadingAction";
import apis from "../../services/apis";
import { connect } from "react-redux";
import { useForm } from "react-hook-form";
import http from "../../services/apicall";
import Swal from "sweetalert2";

function UserProfile(props) {
  const { register, handleSubmit, reset, errors } = useForm({
    mode: "onSubmit",
    reValidateMode: "onChange",
  });

  const [newFirstName, setnewFirstName] = useState([{ first_name: "" }]);
  const [newLastName, setnewLastName] = useState([{ last_name: "" }]);
  const [newUserCode, setnewUserCode] = useState([{ user_code: "" }]);
  const [newEmail, setnewEmail] = useState([{ email: "" }]);
  const [newMobile, setnewMobile] = useState([{ mobile: "" }]);
  let user = null;

  //   useEffect(() => {
  //     getUserDeatils();
  //   }, []);

  //   var getUserDeatils = () => {
  //     http.get(apis.ALLUSER).then((res) => {
  //       user = res.data.result;
  //     });
  //   };

  let saveFormData = (data) => {
    // console.log(data);
    reset();
    let body = {
      //   name: data.firstName + " " + data.lastName,
      //   user_code: data.userCode,
      //   email: data.email,
      id: props.Auth.userdetails.id,
      old_password: data.old_password,
      password: data.password,
    };
    console.log(body);

    // console.log(props.Auth.userdetails);

    http
      .post(apis.UPDATE_PWD, body)
      .then((res) => {
        // console.log(res.data.message);
        Swal.fire({
          // title: 'Error!',
          text: res.data.message,
          // icon: 'error',
          confirmButtonText: "Ok",
        });
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const onSubmit = (data) => {
    // console.log(data);
    if (data.password != data.confpassword) {
      Swal.fire({
        title: "Error!",
        text: "The Password did not Match..!!!",
        icon: "error",
        confirmButtonText: "Ok",
      });
    } else {
      saveFormData(data);
    }
  };

  //   let data_from_userList = () => {
  //     setnewFirstName({
  //       first_name: temp.name.split(" ")[0],
  //     });
  //     setnewLastName({
  //       last_name: temp.name.split(" ")[1],
  //     });
  //     setnewUserCode({
  //       user_code: temp.user_code,
  //     });
  //     setnewEmail({
  //       email: temp.email,
  //     });
  //     setnewMobile({
  //       mobile: temp.mobile,
  //     });
  //   };

  return (
    <div className="row input-area user-create-div">
      <div className="col">
        {/* <h2>Create User</h2> */}
        <form onSubmit={handleSubmit(onSubmit)}>
          {/* <div className="row">
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
                  required: "Required",
                })}
                onChange={(e) => {
                  setnewEmail({ email: e.target.value });
                }}
              ></input>
              {errors.email && <p>{errors.email.message}</p>}
            </div>
          </div>
          <div className="mobile"> 
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
              ></input>
              {errors.mobile && <p>{errors.mobile.message}</p>}
            </div>
          </div>*/}
          <div className="old_password">
            <label htmlFor="old_password">Enter Current Password</label>
            <div className="col" style={{ padding: "0px" }}>
              <i className="fas fa-key icons"></i>
              <input
                type="password"
                className=""
                placeholder="Enter Current Password"
                name="old_password"
                ref={register({
                  required: "Required",
                  minLength: {
                    value: 6,
                    message: "Password Should be Greater than 6",
                  },
                })}
              ></input>

              {errors.old_password && <p>{errors.old_password.message}</p>}
            </div>
          </div>
          <div className="password">
            <label htmlFor="password">Enter New Password</label>
            <div className="col" style={{ padding: "0px" }}>
              <i className="fas fa-key icons"></i>
              <input
                type="password"
                className=""
                placeholder="Enter New Password"
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
            <label htmlFor="password">Confirm New Password</label>
            <div className="col" style={{ padding: "0px" }}>
              <i className="fas fa-key icons"></i>
              <input
                type="password"
                className=""
                placeholder="Confirm New Password"
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
          <div className="createUser">
            <button className="button button-foreword" type="submit">
              Update
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

export default connect(mapStateToProps, { loading })(UserProfile);
