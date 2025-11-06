import React from "react";
import store from "../../store";

export default function Navbar(props) {
  return (
    <div className="container-fluid">
      <div
        className="row header"
        style={{ display: "flex", alignItems: "center" }}
      >
        <div className="desktop col-sm-3 col-md-2 col-lg-2 col-xl-2"></div>
        <div className="col-9 col-sm-6 col-md-6 col-lg-6 col-xl-6">
          <div style={{ display: "flex", alignItems: "center" }}>
            <div
              className="svg-div mobile"
              onClick={() => {
                store.dispatch({ type: "TOGGLE_SIDEBAR", payload: true });
              }}
              style={{ top: 0, left: 10 }}
            ></div>
            <h2 style={{ margin: 0 }} className="header-name">
              {props.title}
            </h2>
          </div>
        </div>
        <div className="col-3 col-sm-3 col-md-4 col-lg-4 col-xl-4">
          <button
            className="header-search search-button float-right"
            onClick={props.logout}
          >
            <i className="fas fa-sign-out-alt icons-button"></i>
          </button>
          {/* <button className="header-search search-button float-right"><i className="fas fa-search icons-button"></i></button> */}
          <p className="badge float-right date-name desktop">{props.date}</p>
        </div>
      </div>
    </div>
  );
}
