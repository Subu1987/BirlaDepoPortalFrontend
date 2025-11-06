import React, { useState, useEffect } from "react";
import { Link, useLocation, Switch, Route } from "react-router-dom";
import { decideSubRoute } from "../../services/decideRoute";
import FinanceInvoiceCreate from "./FinanceInvoiceCreate";
import InvoiceList from "./FinanceInvoiceList";

export default function FinancePackage() {
  let location = useLocation();
  let [activeOption, setactiveOption] = useState();
  useEffect(() => {
    setactiveOption(decideSubRoute(location.pathname));
  }, [location.pathname]);

  return (
    <div>
      <div className="row" style={{ backgroundColor: "#0F6FA2" }}>
        <div className="col-6">
          {/* <div className="tab-div">
                        <Link to="/dashboard/finance/overview" className="tab-button">Overview</Link>
                        <Link to="/dashboard/finance/invoice-create" className="tab-button tab-active">Invoice Create</Link>
                        <Link to=""></Link>
                    </div> */}
          <div className="tab-div">
            {/* <Link
              className={
                "tab-button" +
                (activeOption === "Overview" ? " tab-active" : "")
              }
              to="/dashboard/finance/overview"
            >
              Overview
            </Link> */}
            <Link
              className={
                "tab-button" +
                (activeOption === "Invoice Create" ? " tab-active" : "")
              }
              to="/dashboard/finance/invoice-create"
            >
              Invoice Create
            </Link>
            <Link
              className={
                "tab-button" +
                (activeOption === "Invoice List" ? " tab-active" : "")
              }
              to="/dashboard/finance/invoice-list"
            >
              Invoice List
            </Link>
          </div>
        </div>
      </div>
      <Switch>
        {/* <Route path="/dashboard/finance/overview">No Overview</Route> */}
        <Route path="/dashboard/finance/invoice-create">
          <FinanceInvoiceCreate />
        </Route>
        <Route path="/dashboard/finance/invoice-list">
          <InvoiceList />
        </Route>
      </Switch>
    </div>
  );
}
