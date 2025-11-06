import React, { Suspense, useEffect } from "react";
import { connect } from "react-redux";
import { BrowserRouter, Redirect, Route, Switch } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { login, logout } from "./actions/authAction";
import "./App.css";
import GlobalLoader from "./components/GlobalLoader/GlobalLoader";
import LOADER from "./components/utils/loader";
import removeLocalItem from "./services/removeLocalStorage";

// import LoginComponent from "./components/login/Login";
// import Wrapper from "./components/dashboard/wrapper";
// import PrivateRoute from "./components/utils/PrivateRoute";
// import LoginWrapper from "./components/utils/LoginWrapper";

const LoginComponent = React.lazy(() => import("./components/login/Login"));
const Wrapper = React.lazy(() => import("./components/dashboard/wrapper"));
const PrivateRoute = React.lazy(() =>
  import("./components/utils/PrivateRoute")
);
const LoginWrapper = React.lazy(() =>
  import("./components/utils/LoginWrapper")
);

function App(props) {
  //auth check if token exists
  let Token = localStorage.getItem("Token");
  if (
    Token &&
    Token !== null &&
    Token !== undefined &&
    Token !== "null" &&
    Token !== "undefined"
  ) {
    props.login(Token);
  }

  useEffect(() => {
    if (window.location.pathname === "/login") {
      removeLocalItem();
    }
  }, [window.location.pathname]);

  return (
    <div className="container-fluid">
      <LOADER />
      <ToastContainer />
      <Suspense fallback={<GlobalLoader />}>
        <BrowserRouter>
          <Switch>
            <Route exact path="/">
              <Redirect to={{ pathname: "/dashboard/root" }} />
            </Route>

            <LoginWrapper exact path="/login">
              <Suspense fallback={<GlobalLoader />}>
                <LoginComponent />
              </Suspense>
            </LoginWrapper>
            <PrivateRoute path="/dashboard">
              <Suspense fallback={<GlobalLoader />}>
                <Wrapper />
              </Suspense>
            </PrivateRoute>
            <Route>
              <Redirect to="/" />
            </Route>
          </Switch>
        </BrowserRouter>
      </Suspense>
    </div>
  );
}

const mapStateToProps = (state) => ({});

export default connect(mapStateToProps, { login, logout })(App);
