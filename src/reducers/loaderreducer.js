const initialState = {
  loading_state: [],
};

export default (state = initialState, action) => {
  switch (action.type) {
    case "LOADING":
      let s = [...state.loading_state];
      if (action.payload) {
        s.push(true);
      } else {
        s.pop();
      }
      return {
        ...state,
        loading_state: s,
      };
    default:
      return state;
  }
};
