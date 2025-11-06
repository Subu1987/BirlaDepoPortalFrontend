import React, { useState, useEffect } from "react";
import { Link, useLocation, Switch, Route } from "react-router-dom";
import { decideSubRoute } from "../../services/decideRoute";
import GoodReceiptCreate from "./GoodReceiptCreate";
import GoodReceiptList from "./GoodReceiptListing"

export default function GoodReceiptPackage() {
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
              to="/dashboard/goods-receipt/overview"
            >
              Overview
            </Link> */}
            <Link
              className={
                "tab-button" +
                (activeOption === "Create" ? " tab-active" : "")
              }
              to="/dashboard/goods-receipt/create"
            >
              GR Create
            </Link>
            <Link
              className={
                "tab-button" +
                (activeOption === "List" ? " tab-active" : "")
              }
              to="/dashboard/goods-receipt/list"
            >
              GR List
            </Link>
          </div>
        </div>
      </div>
      <Switch>
        {/* <Route path="/dashboard/goods-receipt/overview">No Overview</Route> */}
        <Route path="/dashboard/goods-receipt/create">
            <GoodReceiptCreate />
        </Route>
        <Route path="/dashboard/goods-receipt/list">
          <GoodReceiptList />
        </Route>
      </Switch>
    </div>
  );
}
