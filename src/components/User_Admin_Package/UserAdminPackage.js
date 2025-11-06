import React, { useEffect, useState } from "react";
import { Link, useLocation, Switch, Route } from "react-router-dom";
import { decideSubRoute } from "../../services/decideRoute";
import UserEditList from "./UserEditList";
import UserCreateForm from "./UserCreateForm";
import CFADepotMap from "./CFADepotMap";
import BHCSDepotMapUnMap from "./BHCSDepotMapUnMap";
import GiveUserPermissions from "./GiveUserPermissions";
import RRDelete from "./RRDetete";
import DMSDetails from "./DMSDetails";

export default function UserAdminPackage() {
  let location = useLocation();
  let [activeOption, setactiveOption] = useState();
  useEffect(() => {
    setactiveOption(decideSubRoute(location.pathname));
  }, [location.pathname]);
  let [unit, setUnit] = useState();

  let changeUnit = (unit) => {
    setUnit(unit);
    console.log(unit);
  };

  return (
    <div>
      <div className="row" style={{ backgroundColor: "#0F6FA2" }}>
        <div className="col-12">
          <div className="tab-div">
            <Link
              className={
                "tab-button" +
                (activeOption === "User Create" ? " tab-active" : "")
              }
              to="/dashboard/user-admin/user-create"
            >
              User Create
            </Link>
            <Link
              className={
                "tab-button" +
                (activeOption === "User List" ? " tab-active" : "")
              }
              to="/dashboard/user-admin/user-list"
            >
              User List
            </Link>
            <Link
              className={
                "tab-button" +
                (activeOption === "CFA Depot Map" ? " tab-active" : "")
              }
              to="/dashboard/user-admin/cfa-depot-map"
            >
              CFA Depot Map / UnMap
            </Link>
            {/* <Link
              className={
                "tab-button" +
                (activeOption === "CFA Depot UnMap" ? " tab-active" : "")
              }
              to="/dashboard/user-admin/cfa-depot-unmap"
            >
              CFA Depot Un Map
            </Link> */}
            <Link
              className={
                "tab-button" +
                (activeOption === "User Permissions" ? " tab-active" : "")
              }
              to="/dashboard/user-admin/user-permissions"
            >
              User Permissions
            </Link>

            <Link
              className={
                "tab-button" +
                (activeOption === "CS BH Depot Map" ? " tab-active" : "")
              }
              to="/dashboard/user-admin/cs-bh-depot-map-unmap"
            >
              BH CS LG SDM Depot Map / UnMap
            </Link>
            <Link
              className={
                "tab-button" +
                (activeOption === "RR Delete" ? " tab-active" : "")
              }
              to="/dashboard/user-admin/rr-delete"
            >
              RR Delete
            </Link>
            <Link
              className={
                "tab-button" +
                (activeOption === "DMS Details" ? " tab-active" : "")
              }
              to="/dashboard/user-admin/dms-details"
            >
              DMS Details
            </Link>
          </div>
        </div>
      </div>
      <Switch>
        <Route path="/dashboard/user-admin/user-create">
          <UserCreateForm data={unit} />
        </Route>
        <Route path="/dashboard/user-admin/user-list">
          <UserEditList data={(unit, changeUnit.bind(this))} />
        </Route>
        <Route path="/dashboard/user-admin/cfa-depot-map">
          <CFADepotMap />
        </Route>
        <Route path="/dashboard/user-admin/user-permissions">
          <GiveUserPermissions />
        </Route>
        <Route path="/dashboard/user-admin/cs-bh-depot-map-unmap">
          <BHCSDepotMapUnMap />
        </Route>
        <Route path="/dashboard/user-admin/rr-delete">
          <RRDelete />
        </Route>
        <Route path="/dashboard/user-admin/dms-details">
          <DMSDetails />
        </Route>
      </Switch>
    </div>
  );
}
