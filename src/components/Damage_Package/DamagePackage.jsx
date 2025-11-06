import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link, Route, Switch, useLocation } from "react-router-dom";
import { RAKE_USERS } from "../../data/RAKE_USER_TYPES";
import { decideSubRoute } from "../../services/decideRoute";
import ColsolidatedReportException from "./ColsolidatedReportException";
import DemmurageData from "./DemmurageWharfageData";
import RakeDamageData from "./RakeDamageData";
import RakeData from "./RakeData";
import RakeDetails from "./RakeDetails";
import RakeHandlingData from "./RakeHandlingData";
import RakeInsuranceData from "./RakeInsuranceData";
import Report from "./Report";
import ReportApproval from "./ReportApproval";
import GivePermissionToRR from "./GivePermissionToRR";

export default function DamagePackage() {
  let location = useLocation();
  let [activeOption, setactiveOption] = useState();

  useEffect(() => {
    setactiveOption(decideSubRoute(location.pathname));
  }, [location.pathname]);

  const cfa = useSelector((state) => state.Auth.cfa);
  const userdetails = useSelector((state) => state.Auth.userdetails);

  return (
    <div>
      <div className="row" style={{ backgroundColor: "#0F6FA2" }}>
        <div className="col-12 col-md-8">
          <div className="tab-div">
            {cfa?.USER_CATEGORY === "CFA" && (
              <Link
                className={
                  "tab-button" +
                  (activeOption === "rake-data" ? " tab-active" : "")
                }
                to="/dashboard/damage-data-entry/rake-data"
              >
                Rake Data
              </Link>
            )}

            {cfa?.USER_CATEGORY === "REGH" &&
              !RAKE_USERS.includes(userdetails?.user_type) && (
                <Link
                  className={
                    "tab-button" +
                    (activeOption === "rake-arrival-report"
                      ? " tab-active"
                      : "")
                  }
                  to="/dashboard/damage-data-entry/rake-arrival-report"
                >
                  Consolidated Rake Arrival Report
                </Link>
              )}
            {RAKE_USERS.includes(userdetails?.user_type) && (
              <>
                <Link
                  className={
                    "tab-button" +
                    (activeOption === "rake-report" ? " tab-active" : "")
                  }
                  to="/dashboard/damage-data-entry/rake-report"
                >
                  Rake Arrival Report
                </Link>
              </>
            )}

            {userdetails?.user_type === 9 && (
              <>
                <Link
                  className={
                    "tab-button" +
                    (activeOption === "give-rr-permission" ? " tab-active" : "")
                  }
                  to="/dashboard/damage-data-entry/give-rr-permission"
                >
                  Give RR Permission
                </Link>
              </>
            )}

            {cfa?.USER_CATEGORY === "REGH" &&
              !RAKE_USERS.includes(userdetails?.user_type) && (
                <Link
                  className={
                    "tab-button" +
                    (activeOption === "rake-exception" ? " tab-active" : "")
                  }
                  to="/dashboard/damage-data-entry/consolidated-report-exception"
                >
                  Consolidated Exception Report
                </Link>
              )}
          </div>
        </div>
      </div>
      <div>
        <Switch>
          <Route path="/dashboard/damage-data-entry/rake-details">
            <RakeDetails />
          </Route>

          {cfa?.USER_CATEGORY === "CFA" && (
            <>
              <Route path="/dashboard/damage-data-entry/rake-data">
                <RakeData />
              </Route>

              <Route path="/dashboard/damage-data-entry/new-rake-entry">
                <RakeHandlingData />
              </Route>

              <Route path="/dashboard/damage-data-entry/rake-handling-data/:id">
                <RakeHandlingData />
              </Route>

              <Route path="/dashboard/damage-data-entry/claim-insurance/:id">
                <RakeInsuranceData />
              </Route>

              <Route path="/dashboard/damage-data-entry/demmurage-data/:id">
                <DemmurageData />
              </Route>

              <Route path="/dashboard/damage-data-entry/rake-damage-data/:id">
                <RakeDamageData />
              </Route>
            </>
          )}

          {cfa?.USER_CATEGORY === "REGH" &&
            !RAKE_USERS.includes(userdetails?.user_type) && (
              <>
                <Route path="/dashboard/damage-data-entry/rake-data">
                  <RakeData />
                </Route>

                <Route path="/dashboard/damage-data-entry/rake-handling-data/:id">
                  <RakeHandlingData />
                </Route>

                <Route path="/dashboard/damage-data-entry/new-rake-entry">
                  <RakeHandlingData />
                </Route>

                <Route path="/dashboard/damage-data-entry/demmurage-data/:id">
                  <DemmurageData />
                </Route>

                <Route path="/dashboard/damage-data-entry/rake-damage-data/:id">
                  <RakeDamageData />
                </Route>

                <Route path="/dashboard/damage-data-entry/claim-insurance/:id">
                  <RakeInsuranceData />
                </Route>

                <Route path="/dashboard/damage-data-entry/rake-arrival-report">
                  <Report />
                </Route>

                <Route path="/dashboard/damage-data-entry/consolidated-report-exception">
                  <ColsolidatedReportException />
                </Route>
              </>
            )}

          {RAKE_USERS.includes(userdetails?.user_type) && (
            <>
              <Route path="/dashboard/damage-data-entry/rake-report">
                <ReportApproval />
              </Route>
              {userdetails?.user_type === 9 && (
                <Route path="/dashboard/damage-data-entry/give-rr-permission">
                  <GivePermissionToRR />
                </Route>
              )}
              <Route path="/dashboard/damage-data-entry/rake-handling-data/:id">
                <RakeHandlingData />
              </Route>
              <Route path="/dashboard/damage-data-entry/rake-damage-data/:id">
                <RakeDamageData />
              </Route>
              <Route path="/dashboard/damage-data-entry/demmurage-data/:id">
                <DemmurageData />
              </Route>
              <Route path="/dashboard/damage-data-entry/claim-insurance/:id">
                <RakeInsuranceData />
              </Route>
            </>
          )}
        </Switch>
      </div>
    </div>
  );
}
