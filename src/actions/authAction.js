import http from "../services/apicall";

export const login = (token) => {
  http.defaults.headers.common["Authorization"] = "Bearer " + token;
  return {
    type: "LOGIN",
    payload: token,
  };
};

export const logout = () => {
  return {
    type: "LOGOUT",
  };
};

export const setUserDetails = (user) => {
  return {
    type: "SET_USER_DETAILS",
    payload: user,
  };
};

export const toggleSidebar = (toggle) => {
  return {
    type: "TOGGLE_SIDEBAR",
    payload: toggle,
  };
};

export const cfaAuth = (cfa) => {
  return {
    type: "CFA_AUTH",
    payload: cfa,
  };
};
