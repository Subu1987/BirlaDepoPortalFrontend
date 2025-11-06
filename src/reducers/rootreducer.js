import { combineReducers } from 'redux'; 
import Auth from "./authreducer";
import Loader from "./loaderreducer";
import Delivery from "./deliveryreducer"

export default combineReducers({
    Auth : Auth,
    Loader : Loader,
    Delivery: Delivery
});