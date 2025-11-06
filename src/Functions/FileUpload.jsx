import React from "react";
import Upload from "rc-upload";
import Swal from "sweetalert2";

const FileUpload = ({ fileUploaded }) => {
  const props = {
    multiple: false,

    beforeUpload(file, fileList) {
      console.log(file, fileList);
      const stringToCheck = file.name;
      const extensions = ["jpg", "png", "jpeg", "pdf"];
      const regex = new RegExp(`\\.(${extensions.join("|")})$`, "i");

      const isMatch = regex.test(stringToCheck);
      if (!isMatch) {
        Swal.fire({
          title: "Error",
          text: "Please upload image file",
          icon: "error",
          confirmButtonText: "Ok",
        });
        return;
      }
      console.log(file);
      getBase64(file).then((data) => {
        fileUploaded(data, file.type);
      });
    },
  };

  const dummyRequest = ({ file, onSuccess }) => {
    setTimeout(() => {
      onSuccess("ok");
    }, 0);
  };

  const getBase64 = (file) => {
    return new Promise((resolve) => {
      let fileInfo;
      let baseURL = "";
      // Make new FileReader
      let reader = new FileReader();

      reader.readAsDataURL(file);

      reader.onload = () => {
        baseURL = reader.result;
        resolve(baseURL);
      };
    });
  };
  return (
    <Upload {...props} customRequest={dummyRequest}>
      <i
        className="fas fa-camera"
        style={{ color: "black", cursor: "pointer" }}
      ></i>
    </Upload>
  );
};

export default FileUpload;
