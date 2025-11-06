const initialState = {
  VKORG: "",
};

export default (state = initialState, action) => {
  switch (action.type) {
    case "VKORG":
      return{
          ...state,
          VKORG:action.payload
      }
    default:
      return state;
  }
};
