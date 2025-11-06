const Swal = require("sweetalert2");

const emptyResult = (data, callBack) => {
  if (data?.length > 0) {
    callBack(data);
  } else {
    Swal.fire("Info!", "No Data Found!", "info");
  }
};

export { emptyResult };
