import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link, Route, Switch, useLocation } from "react-router-dom";
import { decideSubRoute } from "../../services/decideRoute";
// import ApproveInventory from "./ApproveInventory";
// import DisplayInventory from "./DisplayInventory";
// import StockCreate from "./StockCreate";
const ApproveInventory = React.lazy(() => import("./ApproveInventory"));
const DisplayInventory = React.lazy(() => import("./DisplayInventory"));
const StockCreate = React.lazy(() => import("./StockCreate"));

export default function InventoryPackage() {
  let location = useLocation();
  let [activeOption, setactiveOption] = useState();
  const [inventoryName, setInventoryName] = useState("Capture");

  useEffect(() => {
    setactiveOption(decideSubRoute(location.pathname));
    setInventoryName("Capture");
  }, [location.pathname]);

  const cfa = useSelector((state) => state.Auth.cfa);

  return (
    <div>
      <div className="row" style={{ backgroundColor: "#0F6FA2" }}>
        <div className="col-12 col-md-6">
          <div className="tab-div">
            {cfa?.CAP_INVT && (
              <Link
                className={
                  "tab-button" +
                  (activeOption === "create-inventory" ? " tab-active" : "")
                }
                to="/dashboard/physical-inventory/create-inventory"
                onClick={() => {
                  if (inventoryName !== "Capture") {
                    window.location.href =
                      "/dashboard/physical-inventory/create-inventory";
                  }
                }}
              >
                {inventoryName} Inventory
              </Link>
            )}

            {cfa?.APP_INVT && (
              <Link
                className={
                  "tab-button" +
                  (activeOption === "approve-inventory" ? " tab-active" : "")
                }
                to="/dashboard/physical-inventory/approve-inventory"
              >
                Edit Inventory
              </Link>
            )}

            {(cfa?.USER_CATEGORY === "CFA" ||
              cfa?.USER_CATEGORY === "REGH") && (
              <Link
                className={
                  "tab-button" +
                  (activeOption === "display-inventory" ? " tab-active" : "")
                }
                to="/dashboard/physical-inventory/display-inventory"
              >
                Display Inventory
              </Link>
            )}
          </div>
        </div>
      </div>
      <div>
        <Switch>
          {(cfa?.USER_CATEGORY === "CFA" || cfa?.USER_CATEGORY === "REGH") && (
            <Route path="/dashboard/physical-inventory/create-inventory">
              <StockCreate
                setInventoryName={(name) => setInventoryName(name)}
              />
            </Route>
          )}
          {cfa?.APP_INVT && (
            <Route path="/dashboard/physical-inventory/approve-inventory">
              <ApproveInventory />
            </Route>
          )}

          {(cfa?.USER_CATEGORY === "CFA" || cfa?.USER_CATEGORY === "REGH") && (
            <Route path="/dashboard/physical-inventory/display-inventory">
              <DisplayInventory />
            </Route>
          )}
        </Switch>
      </div>
    </div>
  );
}
