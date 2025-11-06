import Swal from "sweetalert2";
import http from "../services/apicall";

// generate password with 8 characters and 1 special character and 1 number and 1 uppercase
const generatePassword = () => {
  let password = "";
  let specialChar = "@";
  let number = "0123456789";
  let upperCase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let lowerCase = "abcdefghijklmnopqrstuvwxyz";

  for (let i = 0; i < 1; i++) {
    password += upperCase.charAt(Math.floor(Math.random() * upperCase.length));
  }

  for (let i = 0; i < 2; i++) {
    password += lowerCase.charAt(Math.floor(Math.random() * lowerCase.length));
  }

  for (let i = 0; i < 1; i++) {
    password += specialChar.charAt(
      Math.floor(Math.random() * specialChar.length)
    );
  }

  for (let i = 0; i < 1; i++) {
    password += number.charAt(Math.floor(Math.random() * number.length));
  }

  for (let i = 0; i < 4; i++) {
    password += lowerCase.charAt(Math.floor(Math.random() * lowerCase.length));
  }

  return password;
};

const checkRFCPassword = async (token) => {
  if (localStorage.getItem("bcl-depot-user")) {
    console.log(token);
    console.log("checkRFCPassword");
    const userData = JSON.parse(localStorage.getItem("bcl-depot-user"));
    console.log(userData);
    let postData = {
      BNAME: userData.user_code,
      PASSWORD: userData.rfc_password,
      XCODVN: "",
      USE_NEW_EXCEPTION: 0,
    };
    const res = await http.post(
      "rfc/common_sap_pass_check",
      {
        fm_name: "SUSR_LOGIN_CHECK_RFC",
        params: postData,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    if (res.data.status) {
      return true;
    } else {
      console.log(res.data.result);
      Swal.fire({
        title: "Error",
        text: "Your SAP Password is changed. Please login again.",
        icon: "error",
      }).then(() => {
        console.log("checkRFCPassword");
        if (res.data.result.key === "NO_CHECK_FOR_THIS_USER") {
          unlockUser();
        } else if (res.data.result.key === "PASSWORD_EXPIRED") {
          Swal.fire({
            title: "Password Expired",
            text: "Your password is expired.",
            icon: "error",
          });
        } else {
          // please uncomment this line
          updateSAPPassword();
        }
      });
      return false;
    }
  }
};

const unlockUser = async () => {
  if (localStorage.getItem("user_code")) {
    let postData = {
      USERID: JSON.parse(localStorage.getItem("bcl-depot-user")).user_code,
    };
    const res = await http.post("rfc/common_sap_pass_check", {
      fm_name: "ZRFC_USER_UNLOCK",
      params: postData,
    });
    if (res.data.status) {
      updateSAPPassword();
    } else {
      Swal.fire({
        title: "Error",
        text: res.data.status,
        icon: "error",
        confirmButtonText: "Ok",
      });
    }
  } else {
    return false;
  }
};

const updateSAPPassword = async () => {
  if (localStorage.getItem("user_code")) {
    const userData = JSON.parse(localStorage.getItem("bcl-depot-user"));
    let PASSWORD = generatePassword();
    let postData = {
      USERID: userData.user_code,
      PASSWORD,
    };

    const res = await http.post("rfc/common_sap_pass_check", {
      fm_name: "ZRFC_USER_PSWD_RESET",
      params: postData,
    });

    console.log(res.data.status);
    if (res.data.status && res.data.result.IT_MSG?.[0]?.TYPE === "S") {
      updateServerPassword(PASSWORD);
    } else {
      Swal.fire({
        title: "Error",
        text: "Something went wrong",
        icon: "error",
        confirmButtonText: "Ok",
      }).then(() => {
        localStorage.removeItem("Token");
        localStorage.removeItem("user_code");
        localStorage.removeItem("bcl-depot-user");
        window.location.href = "/login";
      });
    }
  }
};

const updateServerPassword = async (rfc_password) => {
  if (localStorage.getItem("user_code")) {
    const userData = JSON.parse(localStorage.getItem("bcl-depot-user"));
    let postData = {
      name: userData.name,
      user_code: userData.user_code,
      email: userData.email,
      user_type: userData.user_type,
      mobile: userData.mobile,
      rfc_password,
      status: userData.status,
      id: userData.id,
      password: "",
    };
    const res = await http.post("login/update", postData);
    if (res.data.code === 0) {
      localStorage.removeItem("Token");
      localStorage.removeItem("user_code");
      localStorage.removeItem("bcl-depot-user");
      window.location.href = "/login";
    } else {
      updateSAPPassword(rfc_password);
    }
  }
};

export default checkRFCPassword;
