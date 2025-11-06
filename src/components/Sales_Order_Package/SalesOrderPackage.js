import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import { Link, useLocation, Switch, Route } from "react-router-dom";
import { decideSubRoute } from "../../services/decideRoute";
import SalesOrderList from "./SalesOrderList";
import SalesOrderForm from "./SalesOrderForm";
import SalesOrderEdit from "./SalesOrderEdit";

function SalesOrderPackage() {
  let location = useLocation();
  let [activeOption, setactiveOption] = useState();
  useEffect(() => {
    setactiveOption(decideSubRoute(location.pathname));
  }, [location.pathname]);

  return (
    <div>
      <div className="row" style={{ backgroundColor: "#0F6FA2" }}>
        <div className="col-6">
          <div className="tab-div">
            {/* <Link
              className={
                "tab-button" +
                (activeOption === "Overview" ? " tab-active" : "")
              }
              to="/dashboard/sales-order/overview"
            >
              Overview
            </Link> */}
            <Link
              className={
                "tab-button" + (activeOption === "Create" ? " tab-active" : "")
              }
              to="/dashboard/sales-order/create"
            >
              Sales Order Create
            </Link>
            <Link
              className={
                "tab-button" + (activeOption === "List" ? " tab-active" : "")
              }
              to="/dashboard/sales-order/list"
            >
              Sales Order List
            </Link>
          </div>
        </div>
      </div>
      <Switch>
        {/* <Route path="/dashboard/sales-order/overview">No overview</Route> */}
        <Route path="/dashboard/sales-order/create">
          <SalesOrderForm />
        </Route>
        <Route path="/dashboard/sales-order/list">
          <SalesOrderList />
        </Route>
        <Route path="/dashboard/sales-order/edit/:id">
          <SalesOrderEdit />
        </Route>
      </Switch>
    </div>
  );
}

const mapStateToProps = (state) => ({
  Auth: state.Auth,
});

export default connect(mapStateToProps, {})(SalesOrderPackage);
