import React, { useEffect, useState } from "react";
import { Link, useLocation, Switch, Route } from "react-router-dom";
import { decideSubRoute } from "../../services/decideRoute";
import UserProfile from "./UserProfile";
import DMSDetails from "../User_Admin_Package/DMSDetails";

export default function ProfilePackage() {
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
            <Link
              className={
                "tab-button" +
                (activeOption === "User Profile" ? " tab-active" : "")
              }
              to="/dashboard/profile/user-profile"
            >
              User Profile
            </Link>
          </div>
        </div>
        <div className="col-6">
          <div className="tab-div">
            <Link
              className={
                "tab-button" +
                (activeOption === "DMS Details" ? " tab-active" : "")
              }
              to="/dashboard/profile/dms-details"
            >
              DMS Details
            </Link>
          </div>
        </div>
      </div>
      <Switch>
        <Route path="/dashboard/profile/user-profile">
          <UserProfile />
        </Route>
        <Route path="/dashboard/profile/dms-details">
          <DMSDetails />
        </Route>
      </Switch>
    </div>
  );
}
