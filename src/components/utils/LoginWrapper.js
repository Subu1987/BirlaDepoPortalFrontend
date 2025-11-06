import React from "react";
import { Route, Redirect } from "react-router-dom";
import { connect } from "react-redux";

function LoginWrapper({ children, ...rest }) {
  return (
    <Route
      {...rest}
      render={({ location }) =>
        !rest.Auth.isLoggedIn ? (
          children
        ) : (
          <Redirect
            to={{
              pathname: "/dashboard/root",
              state: { from: location },
            }}
          />
        )
      }
    />
  );
}

const mapStateToProps = (state) => ({
  Auth: state.Auth,
});

export default connect(mapStateToProps, {})(LoginWrapper);
