const initialState = {
  isLoggedIn: false,
  sidebarOpen: false,
  token: null,
  userdetails: {
    name: "",
    mobile: "",
  },
  cfa: {
    CAP_INVT: "",
    APP_INVT: "",
    DIS_INVT: "",
    REP_INVT: "",
    USER_CATERGORY: "",
  },
  mappedCFA: [],
};

export default (state = initialState, action) => {
  switch (action.type) {
    case "LOGIN":
      return {
        ...state,
        isLoggedIn: true,
        token: action.payload,
      };
    case "LOGOUT":
      return {
        ...state,
        isLoggedIn: false,
        token: null,
        userdetails: {
          name: "",
          mobile: "",
        },
      };
    case "SET_USER_DETAILS":
      return {
        ...state,
        userdetails: action.payload,
      };
    case "TOGGLE_SIDEBAR":
      return {
        ...state,
        sidebarOpen: !action.payload,
      };
    case "CFA_AUTH":
      return {
        ...state,
        cfa: action.payload,
      };
    case "MAPPED_CFA":
      return {
        ...state,
        mappedCFA: action.payload,
      };
    default:
      return state;
  }
};
