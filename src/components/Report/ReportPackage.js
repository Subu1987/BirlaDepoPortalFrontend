import React, { useState, useEffect } from "react";
import { Link, useLocation, Switch, Route } from "react-router-dom";
import { decideSubRoute } from "../../services/decideRoute";
import LeRegister from "./LeRegister";
import FIDaywiseReport from "./FIDaywiseReport";
import StockOverViewReport from "./StockOverViewReport";
import DebitAndCredit from "./DebitAndCredit";
import SalesRegister from "./SalesRegister";
import CollectionReport from "./CollectionReport";
import isWithinLast3DaysOfMonth from "../../Functions/IsLast3Days";
import moment from "moment";

export default function FinancePackage() {
  let location = useLocation();
  let [activeOption, setactiveOption] = useState();
  useEffect(() => {
    setactiveOption(decideSubRoute(location.pathname));
  }, [location.pathname]);

  const isLast3Days = isWithinLast3DaysOfMonth(moment());

  return (
    <div>
      <div className="row" style={{ backgroundColor: "#0F6FA2" }}>
        <div className="col-12">
          <div className="tab-div">
            {!isLast3Days && (
              <Link
                className={
                  "tab-button" +
                  (activeOption === "le-register" ? " tab-active" : "")
                }
                to="/dashboard/reports/le-register"
              >
                Le Register
              </Link>
            )}
            <Link
              className={
                "tab-button" +
                (activeOption === "fi-daywise" ? " tab-active" : "")
              }
              to="/dashboard/reports/fi-daywise"
            >
              FI Daywise
            </Link>
            <Link
              className={
                "tab-button" +
                (activeOption === "stock-overview-report" ? " tab-active" : "")
              }
              to="/dashboard/reports/stock-overview-report"
            >
              Stock Overview
            </Link>
            {!isLast3Days && (
              <Link
                className={
                  "tab-button" +
                  (activeOption === "debit-credit-report" ? " tab-active" : "")
                }
                to="/dashboard/reports/debit-credit-report"
              >
                DR/CR Note Register
              </Link>
            )}
            {!isLast3Days && (
              <Link
                className={
                  "tab-button" +
                  (activeOption === "sales-register-report"
                    ? " tab-active"
                    : "")
                }
                to="/dashboard/reports/sales-register-report"
              >
                Sales Register
              </Link>
            )}
            <Link
              className={
                "tab-button" +
                (activeOption === "collection-report" ? " tab-active" : "")
              }
              to="/dashboard/reports/collection-report"
            >
              Collection Report
            </Link>
          </div>
        </div>
      </div>
      <Switch>
        {/* <Route path="/dashboard/finance/overview">No Overview</Route> */}
        <Route path="/dashboard/reports/fi-daywise">
          <FIDaywiseReport />
        </Route>
        <Route path="/dashboard/reports/stock-overview-report">
          <StockOverViewReport />
        </Route>
        <Route path="/dashboard/reports/collection-report">
          <CollectionReport />
        </Route>
        {!isLast3Days && (
          <>
            <Route path="/dashboard/reports/le-register">
              <LeRegister />
            </Route>
            <Route path="/dashboard/reports/debit-credit-report">
              <DebitAndCredit />
            </Route>
            <Route path="/dashboard/reports/sales-register-report">
              <SalesRegister />
            </Route>
          </>
        )}
      </Switch>
    </div>
  );
}
