import React from "react";
import { connect } from "react-redux";

function Root(props) {
  return (
    <div className="row">
      <div className="col-12 col-lg-7">
        <div className="welcome-div">
          <h2>Welcome back</h2>
          <h1>{props.Auth.userdetails.name}</h1>
        </div>
      </div>
    </div>
  );
}

const mapStateToProps = (state) => ({
  Auth: state.Auth,
});

export default connect(mapStateToProps, {})(Root);
