import React,{useState,useEffect} from 'react'
import {Link,useLocation,Switch,Route} from "react-router-dom";
import {decideSubRoute} from "../../services/decideRoute";
import DeliveryCreate from "./DeliveryCreate";
import DeliveryList from "./DeliveryList";
import DeliveryEdit from "./DeliveryEdit";



export default function DeliveryPackage() {

    let location = useLocation();
    let [activeOption,setactiveOption] = useState();
    useEffect(()=>{
        setactiveOption(decideSubRoute(location.pathname));
    },[location.pathname]);

    return (
        <div>
            
            <div className="row" style={{ backgroundColor: "#0F6FA2" }}>
                <div className="col-6">
                    {/* <div className="tab-div">
                        <Link className="tab-button" to="">Overview</Link>
                        <Link className="tab-button" to="">Delivery Create</Link>
                        <Link className="tab-button" to="">Delivery List</Link>
                    </div> */}
                    <div className="tab-div">
                        {/* <Link className={"tab-button"+(activeOption==="Overview"?" tab-active":"")} to="/dashboard/delivery/overview">
                            Overview
                        </Link> */}
                        <Link className={"tab-button"+(activeOption==="Create"?" tab-active":"")} to="/dashboard/delivery/create">
                            Delivery Create
                        </Link>
                        <Link className={"tab-button"+(activeOption==="List"?" tab-active":"")} to="/dashboard/delivery/list">
                            Delivery List
                        </Link>
                    </div>
                </div>
            </div>
            <Switch>
                {/* <Route path="/dashboard/delivery/overview">
                    No overview
                </Route> */}
                <Route path="/dashboard/delivery/create">
                    <DeliveryCreate />
                </Route>
                <Route path="/dashboard/delivery/list">
                    <DeliveryList />
                </Route>
                <Route path="/dashboard/delivery/edit/:id">
                    <DeliveryEdit />
                </Route>
            </Switch>
        </div>
    )
}
