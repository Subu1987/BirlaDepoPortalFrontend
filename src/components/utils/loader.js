import React from "react";
import "./loader.css";
import { connect } from "react-redux";

function LOADER(props) {
  return (
    <div
      className={
        props.loader.loading_state.length > 0
          ? "loader-wrapper vsbl"
          : "loader-wrapper nt-vsbl"
      }
    >
      <div id="loader_bar">
        <b></b>
        <i></i>
      </div>
    </div>
  );
}

const mapStateToProps = (state) => ({
  loader: state.Loader,
});

export default connect(mapStateToProps, {})(LOADER);
