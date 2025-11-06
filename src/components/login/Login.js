import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import apis from "../../services/apis";
import http from "../../services/apicall";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { loading } from "../../actions/loadingAction";
import { login } from "../../actions/authAction";
import Swal from "sweetalert2";
import supabase from "../../Functions/SupaBase";

function LoginComponent(props) {
  const { register, handleSubmit, errors } = useForm();
  const [mobile, setMobile] = useState(false);

  let onSubmit = async (data) => {
    console.log(data);
    try {
      props.loading(true);
      const res = await http.post(apis.LOGIN, data);

      if (res.data.status) {
        props.loading(false);

        localStorage.setItem("user_code", res.data.result[0].user_code);
        localStorage.setItem(
          "bcl-depot-user",
          JSON.stringify(res.data.result[0])
        );

        let data = res.data.result[0];

        let postData = {
          origin: window.location.origin,
          user_code: data.user_code,
          user_name: data.name,
          user_type: data.user_type,
        };

        supabase
          .from("log-table")
          .insert([postData])
          .select()
          .then((data) => {
            console.log(data);
          });

        // if (await checkRFCPassword(res.data.token)) {
        localStorage.setItem("Token", res.data.token);
        props.login(res.data.token);
        // }
      } else {
        Swal.fire({
          title: "Error!",
          text: res.data.message,
          icon: "error",
          confirmButtonText: "Ok",
        });
      }
    } catch (error) {
    } finally {
      props.loading(false);
    }
  };

  useEffect(() => {
    // check mobile or desktop
    if (window.innerWidth < 768) {
      setMobile(true);
    } else {
      setMobile(false);
    }
  }, []);

  return (
    <>
      {!mobile ? (
        <div className="container-fluid login-container desktop">
          <div className="mask-img">
            <div className="mask-gradient">
              <div className="wrapper">
                <div className="logo-box">
                  <div className="logo">
                    <img
                      className="img-fluid logo-img"
                      alt="Logo"
                      src="images/mp-birla-logo.jpeg"
                    />
                  </div>
                </div>
                <div className="row">
                  <div className="col-md-1 col-lg-1"></div>
                  <div className="col-md-auto text-div">
                    <h1 className="text-slogan">
                      Building a Stronger <span className="in">In</span>
                      <span className="d" style={{ color: "#fff" }}>
                        d
                      </span>
                      <span className="ia">
                        ia
                        <img src="/images/Group-916.png" alt="Victor" />
                      </span>
                    </h1>
                    <p className="text">
                      Birla Group is amongst the largest industrial <br />{" "}
                      houses in india
                    </p>
                  </div>
                  <div className="col-md-3 col-lg-3"></div>
                  <div className="col input-outer">
                    <form
                      className="input-inner"
                      onSubmit={handleSubmit(onSubmit)}
                    >
                      {/* <h4 className="user">Hello, <span className="user name"> Kumar Aman!</span></h4> */}
                      <div className="user-input-wrp">
                        <input
                          className="input-field"
                          type="text"
                          name="user_code"
                          ref={register({ required: true })}
                          autoComplete="off"
                          style={{ color: "#000", textTransform: "uppercase" }}
                          required
                        />
                        <span className="floating-label">Username</span>
                        {errors.user_code && (
                          <p className="form-error">User code is required</p>
                        )}
                      </div>
                      <div className="user-input-wrp">
                        <input
                          className="input-field"
                          type="password"
                          name="password"
                          ref={register({ required: true })}
                          autoComplete="off"
                          style={{ color: "#000" }}
                          required
                        />
                        <span className="floating-label">Password</span>
                        {errors.password && (
                          <p className="form-error">Password is required</p>
                        )}
                      </div>
                      <div className="submit">
                        {/* <Link className="link-text" to="">
                      Forget Password?
                    </Link> */}
                        <button className="button login" type="submit">
                          Login
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
                {/* <Modal /> */}
              </div>
            </div>
          </div>
          <div className="footer">
            <Link to="#">
              <span style={{ color: "#1772A3" }}>
                2020 Birla Corporation Ltd
              </span>
              <br />
              <span style={{ color: "#1772A3" }} className="copyright">
                All right reserved
              </span>
            </Link>
            <Link to="#">www.birlacorporation.com</Link>
          </div>
        </div>
      ) : (
        <div className="container-fluid mobile">
          <div className="mobile-container">
            <form
              className="input-inner-mobile"
              onSubmit={handleSubmit(onSubmit)}
            >
              <h2
                style={{
                  textAlign: "center",
                  color: "#fff",
                }}
              >
                MP Birla Cement
              </h2>
              <h3
                style={{
                  textAlign: "center",
                  color: "#fff",
                }}
              >
                Login
              </h3>
              <div className="user-input-wrp">
                <input
                  className="input-field-mobile"
                  type="text"
                  name="user_code"
                  ref={register({ required: true })}
                  autoComplete="off"
                  style={{ color: "#fff" }}
                  required
                />
                <span className="floating-label">Username</span>
                {errors.user_code && (
                  <p className="form-error">User code is required</p>
                )}
              </div>
              <div className="user-input-wrp">
                <input
                  className="input-field-mobile"
                  type="password"
                  name="password"
                  ref={register({ required: true })}
                  autoComplete="off"
                  style={{ color: "#fff" }}
                  required
                />
                <span className="floating-label">Password</span>
                {errors.password && (
                  <p className="form-error">Password is required</p>
                )}
              </div>
              <div className="submit">
                <button
                  className="button login"
                  style={{ margin: "0 auto" }}
                  type="submit"
                >
                  Login
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

const mapStateToProps = (state) => ({
  Auth: state.Auth,
});

export default connect(mapStateToProps, { loading, login })(LoginComponent);
