import React, { useEffect, useState } from "react";
import { Link, Route, Switch, useLocation } from "react-router-dom";
import { decideSubRoute } from "../../services/decideRoute";
import RRSummaryReport from "./RRSummaryReport";
// import Report from "./Report";
// import ComplianceReport from "./ComplianceReport";
const Report = React.lazy(() => import("./Report"));
const ComplianceReport = React.lazy(() => import("./ComplianceReport"));

export default function InventoryReportPackage() {
  let location = useLocation();
  let [activeOption, setactiveOption] = useState();
  useEffect(() => {
    setactiveOption(decideSubRoute(location.pathname));
  }, [location.pathname]);

  return (
    <div>
      <div className="row" style={{ backgroundColor: "#0F6FA2" }}>
        <div className="col-12 col-md-6">
          <div className="tab-div">
            <Link
              className={
                "tab-button" +
                (activeOption === "comparative-reports" ? " tab-active" : "")
              }
              to="/dashboard/stock-report/comparative-reports"
            >
              Comparative Report
            </Link>
            <Link
              className={
                "tab-button" +
                (activeOption === "compliance-reports" ? " tab-active" : "")
              }
              to="/dashboard/stock-report/compliance-reports"
            >
              Compliance Report
            </Link>
            <Link
              className={
                "tab-button" +
                (activeOption === "rr-summary-report" ? " tab-active" : "")
              }
              to="/dashboard/stock-report/rr-summary-report"
            >
              RR Summary Report
            </Link>
          </div>
        </div>
      </div>
      <div>
        <Switch>
          <Route path="/dashboard/stock-report/comparative-reports">
            <Report />
          </Route>
          <Route path="/dashboard/stock-report/compliance-reports">
            <ComplianceReport />
          </Route>
          <Route path="/dashboard/stock-report/rr-summary-report">
            <RRSummaryReport />
          </Route>
        </Switch>
      </div>
    </div>
  );
}
