import moment from "moment";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import "react-html5-camera-photo/build/css/index.css";
import { connect } from "react-redux";
import { useHistory, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import { loading } from "../../actions/loadingAction";
import FileUpload from "../../Functions/FileUpload";
import http from "../../services/apicall";
import apis from "../../services/apis";
import { getUrlParams } from "../../services/utils";
import ApproveReject from "./ApproveReject";

export const RakeDamageData = (props) => {
  const [alreadySaved, setAlreadySaved] = useState(false);
  const [documentData, setDocumentData] = useState([]);
  const [damageMapping, setDamageMapping] = useState([]);
  const [selectedCombine, setSelectedCombine] = useState([]);
  const [takePhoto, setTakePhoto] = useState(false);
  const [photoData, setPhotoData] = useState("");

  const history = useHistory();

  const { id } = useParams();

  const { register, setValue, handleSubmit } = useForm({
    mode: "onSubmit",
    reValidateMode: "onChange",
  });

  useEffect(() => {
    if (id) {
      getRakeDetails(id);
    } else {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Please select a Rake",
      }).then(() => {
        history.goBack();
      });
    }
  }, [id]);

  // create a function that set the value of the damage data by field name
  const setDamageDataValue = (name, value, index) => {
    let temp = [...damageMapping];

    temp[index][name] = value;
    setDamageMapping(temp);
    setTotalData(index, temp);
  };

  const setTotalData = (index, temp) => {
    let total = 0;
    for (let key in temp[index]) {
      if (
        key === "CUT_TORN" ||
        key === "WATER_DMG" ||
        key === "HANDING_DMG" ||
        key === "BRUST_BAG" ||
        key === "NEW_BURST"
      ) {
        if (+temp[index][key]) total += +temp[index][key];
      }
    }
    temp[index]["TOTAL_DMG"] = total.toFixed(2);

    const allMaterialTotal = temp[index]["COMBINED_MATERIAL"].reduce(
      (acc, curr) => {
        return acc + +curr.DESPATCH_QTY;
      },
      0
    );

    temp[index]["TOTAL_DMG_PER"] = findPercentage(
      temp[index].TOTAL_DMG,
      allMaterialTotal
    );
    setDamageMapping(temp);
  };

  const findPercentage = (value, total) => {
    return ((+value / +total) * 100).toFixed(2);
  };

  const getRakeDetails = (RR_NO) => {
    let url = "/get-rake-data/" + RR_NO;
    props.loading(true);

    http
      .get(url)
      .then((res) => {
        if (res.data.code === 0) {
          setAlreadySaved(true);
          let data = res.data.data;

          if (+data.CUT_TORN) setValue("CUT_TORN", data.CUT_TORN);
          if (+data.WATER_DMG) setValue("WATER_DMG", data.WATER_DMG);
          if (+data.HANDING_DMG) setValue("HANDING_DMG", data.HANDING_DMG);
          if (+data.BRUST_BAG) setValue("BRUST_BAG", data.BRUST_BAG);
          if (+data.NEW_BURST) setValue("NEW_BURST", data.NEW_BURST);
          if (+data.TOTAL_DMG) setValue("TOTAL_DMG", data.TOTAL_DMG);
          if (+data.TOTAL_DMG_PER)
            setValue("TOTAL_DMG_PER", data.TOTAL_DMG_PER);

          // total dispatch qty from data.document
          let totalDispatchQty = data.DOCUMENT.reduce(
            (acc, curr) => acc + +curr.GR_QTY,
            0
          );

          totalDispatchQty = totalDispatchQty.toFixed(2);

          setValue("GR_QTY", totalDispatchQty);

          setValue("RR_QTY", Number(data.RR_QTY).toFixed(2));
          setValue("RR_NO", data.RR_NO);
          setValue(
            "RR_DATE",
            moment(data.RR_DATE, "YYYYMMDD").format("YYYY-MM-DD")
          );
          setDocumentData(data.DOCUMENT);
          setDamageMapping(data.DAMAGE_DATA);
          removeDocumentData(data.DOCUMENT, data.DAMAGE_DATA);
        }
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        props.loading(false);
      });
  };

  const onSubmit = (data) => {
    let postData = {
      ...data,
      DAMAGE_DATA: damageMapping,
    };

    // checking all the data have IM_IMAGE
    console.log(postData.DAMAGE_DATA);
    let noImage = false;

    postData.DAMAGE_DATA.forEach((ele) => {
      if (!ele.IM_IMAGE) {
        noImage = true;
      }
    });

    if (noImage) {
      Swal.fire({
        title: "Error",
        text: "Please upload image for all the damage data",
        icon: "error",
      });
      return;
    }

    props.loading(true);

    let url = "update-rake-data/" + id;

    http
      .post(url, postData)
      .then((res) => {
        Swal.fire({
          icon: "success",
          title: "Success",
          text: alreadySaved
            ? "Data Updated Successfully"
            : "Data Saved Successfully",
        }).then(() => {
          history.goBack();
        });
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        props.loading(false);
      });
  };

  let columnsSelected = [
    {
      title: "",
      key: "DELIVERY_NO",
    },
    {
      title: "Delivery No",
      key: "DELIVERY_NO",
    },
    { key: "GR_QTY", title: "Dispatch Qty" },
    { key: "GRN_DATE", title: "Dispatch Date" },
    {
      title: "Mfg Plant",
      key: "MFG_PLANT",
    },
    { key: "DEPOT", title: "Depot" },
    { key: "MATERIAL", title: "Material" },
    { key: "MATERIAL_DESC", title: "Material Desc" },
  ];

  // const selectedData = (e, data) => {
  //   let newData = [];
  //   if (e.target.checked) {
  //     newData = [...selectedCombine, data];
  //     setSelectedCombine(newData);
  //   } else {
  //     let filteredData = selectedCombine.filter(
  //       (item) => item.DELIVERY_NO !== data.DELIVERY_NO
  //     );
  //     setSelectedCombine(filteredData);
  //   }
  // };

  const selectedData = (e, data) => {
    let newData = [];

    if (e.target.checked) {
      // Check if there are already selected items
      if (selectedCombine.length > 0) {
        // Compare MATERIAL with the first selected item
        if (selectedCombine[0].MATERIAL !== data.MATERIAL) {
          // If MATERIAL is different, prevent selection
          e.target.checked = false; // Uncheck the checkbox
          Swal.fire({
            icon: "error",
            title: "Error",
            text: "Cannot select items with different MATERIAL",
          });
          return;
        }
      }

      // If MATERIAL matches or this is the first selection, add the data
      newData = [...selectedCombine, data];
      setSelectedCombine(newData);
    } else {
      // Remove item logic remains the same
      let filteredData = selectedCombine.filter(
        (item) => item.DELIVERY_NO !== data.DELIVERY_NO
      );
      setSelectedCombine(filteredData);
    }
  };

  console.log(damageMapping);

  const combineData = () => {
    let obj = {
      COMBINED_MATERIAL: selectedCombine,
    };

    let temp = [...damageMapping, obj];

    setDamageMapping(
      temp.map((item) => {
        return {
          ...item,
          CUT_TORN: item.CUT_TORN,
          WATER_DMG: item.WATER_DMG,
          HANDING_DMG: item.HANDING_DMG,
          BRUST_BAG: item.BRUST_BAG,
          NEW_BURST: item.NEW_BURST,
          TOTAL_DMG: item.TOTAL_DMG,
          TOTAL_DMG_PER: item.TOTAL_DMG_PER,
          DELIVERY_NO: item.DELIVERY_NO,
          GR_QTY: item.GR_QTY,
        };
      })
    );

    // update the damage data filter by selected combine

    const allMaterial = temp.map((item) => item.COMBINED_MATERIAL).flat();

    let tempDamageData = documentData.filter((item) => {
      return !allMaterial.some(
        (item2) => item2.DELIVERY_NO === item.DELIVERY_NO
      );
    });

    setDocumentData(tempDamageData);

    let allCheckBox = document.querySelectorAll(".select-rake");

    allCheckBox.forEach((item) => {
      item.checked = false;
    });

    setSelectedCombine([]);
  };

  const dateFormat = (data, key, allData) => {
    if (key === "GRN_DATE") return moment(data).format("DD-MM-YYYY");
    if (key === "MATERIAL") return data.replace(/^0+/, "");
    if (key === "DEPOT") return allData.DEPOT + " - " + allData.DEPOT_NAME;
    if (key === "MFG_PLANT")
      return allData.MFG_PLANT + " - " + allData.MFG_PLANT_NAME;

    return data;
  };

  const removeDocumentData = (data, damageMapping) => {
    const allMaterial = damageMapping
      .map((item) => item.COMBINED_MATERIAL)
      .flat();

    let tempDamageData = data.filter((item) => {
      return !allMaterial.some(
        (item2) => item2.DELIVERY_NO === item.DELIVERY_NO
      );
    });

    console.log(tempDamageData, data, damageMapping);

    setDocumentData(tempDamageData);
  };

  const removeDocumentMapping = (data, index, allData) => {
    let temp = [...allData];

    temp.splice(index, 1);

    let material = data.COMBINED_MATERIAL.flat();

    setDocumentData([...documentData, ...material]);

    setDamageMapping(temp);
  };

  function handleTakePhoto(dataUri) {
    // Do stuff with the photo...
    console.log("takePhoto", dataUri);
    setPhotoData(dataUri);
  }

  const handleSubmitImage = (index, photoData, type) => {
    let temp = [...damageMapping];
    let data = temp[index];
    http
      .post(apis.IMAGE_UPLOAD, {
        image: photoData,
        imageFormat: type,
        material_code: data.DELIVERY_NO,
        cfa_code: localStorage.getItem("user_code"),
        depot: null,
      })
      .then((res) => {
        console.log(res.data.id);
        setTakePhoto(false);
        temp[index].IM_IMAGE = res.data.id;
        setDamageMapping(temp);
        setPhotoData(null);
      });
  };

  const openImage = async (id) => {
    try {
      props.loading(true);
      const res = await http.get(`${apis.GET_IMAGE}/${id}`);
      const { image, imageFormat } = res.data;

      openBase64File(image, imageFormat);
      // // Create a new tab or window
      // const imageWindow = window.open("", "_blank");

      // // Ensure the window was opened
      // if (!imageWindow) {
      //   console.error("Failed to open a new tab. Please allow popups.");
      //   return;
      // }

      // // Add title and basic styling
      // const documentContent = `
      //   <title>Image</title>
      //   <style>
      //     body { margin: 0; padding: 0; display: flex; justify-content: center; align-items: center; height: 100vh; }
      //     embed, img { max-width: 100%; max-height: 100%; }
      //   </style>
      // `;

      // imageWindow.document.write(documentContent);

      // // Add the image or PDF content
      // if (imageFormat === "application/pdf") {
      //   imageWindow.document.write(
      //     `<embed src="${image}" type="application/pdf" width="100%" height="100%" />`
      //   );
      // } else {
      //   imageWindow.document.write(
      //     `<img src="${image}" alt="Loaded Content" />`
      //   );
      // }

      // imageWindow.document.close();
    } catch (error) {
      console.error("Error fetching or displaying the image:", error);
      props.loading(false);
    }
  };

  const openBase64File = (base64Data, fileType) => {
    try {
      // Debugging: Check input data
      console.log("Base64 Data:", base64Data);
      if (!base64Data || typeof base64Data !== "string") {
        throw new Error("Invalid Base64 input.");
      }

      // Remove metadata prefix if present
      const cleanBase64Data = base64Data.includes(",")
        ? base64Data.split(",")[1]
        : base64Data;

      // Validate Base64 string
      const isValidBase64 = (str) => /^[A-Za-z0-9+/]+={0,2}$/.test(str);
      if (!isValidBase64(cleanBase64Data)) {
        throw new Error("Invalid Base64 string format.");
      }

      // Decode Base64
      let byteCharacters;
      try {
        byteCharacters = atob(cleanBase64Data);
      } catch (error) {
        throw new Error("Failed to decode Base64 string.");
      }

      // Create a Blob
      const byteNumbers = Array.from(byteCharacters, (char) =>
        char.charCodeAt(0)
      );
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: fileType });

      // Create URL and open in a new tab
      const fileURL = URL.createObjectURL(blob);
      const newWindow = window.open(fileURL, "_blank");

      if (!newWindow) {
        throw new Error("Failed to open a new tab. Please allow popups.");
      }

      // Revoke URL after 10 seconds to release memory
      setTimeout(() => URL.revokeObjectURL(fileURL), 10000);
    } catch (error) {
      console.error("Error handling the Base64 file:", error.message);
    } finally {
      props.loading(false);
    }
  };

  return (
    <div style={{ padding: "20px 20px 40px 20px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          padding: "20px 20px 40px 20px",
        }}
      >
        <button
          style={{
            border: "none",
            backgroundColor: "transparent",
            color: "green",
            outline: "none",
            fontSize: "1.4rem",
          }}
          onClick={() => {
            history.goBack();
          }}
        >
          <b>&lt;- Back</b>
        </button>
        <h5
          style={{
            textAlign: "center",
            marginBottom: "0px",
          }}
        >
          Rake Damage Data
        </h5>
        <div
          style={{
            width: "100px",
          }}
        ></div>
      </div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div
          style={{
            border: "1px solid #ccc",
            padding: "20px 2px",
            borderRadius: "5px",
            position: "relative",
            background: "#c9c9c9",
          }}
        >
          <p
            style={{
              textAlign: "center",
              position: "absolute",
              marginBottom: "0px",
              top: "-12px",
              left: "10px",
              background: "rgb(155, 155, 155)",
              borderRadius: "5px",
              padding: "0px 10px",
            }}
          >
            Headers
          </p>
          <div className="row">
            <div className="col-12 col-md-3">
              <div className="row">
                <div className="col-12">
                  <label>RR Number</label>
                </div>
                <div className="col-12 depot-select">
                  <input disabled ref={register} name="RR_NO" type="text" />
                </div>
              </div>
            </div>
            <div className="col-12 col-md-3">
              <div className="row">
                <div className="col-12">
                  <label>Total Dispatch Quantity</label>
                </div>
                <div className="col-12 depot-select">
                  <input disabled ref={register} name="GR_QTY" type="number" />
                </div>
              </div>
            </div>
            <div className="col-12 col-md-2">
              <div className="row">
                <div className="col-12">
                  <label>RR QTY</label>
                </div>
                <div className="col-12 depot-select">
                  <input disabled ref={register} name="RR_QTY" type="number" />
                </div>
              </div>
            </div>
            <div className="col-12 col-md-2">
              <div className="row">
                <div className="col-12">
                  <label>RR Date</label>
                </div>
                <div className="col-12 depot-select">
                  <input disabled ref={register} name="RR_DATE" type="date" />
                </div>
              </div>
            </div>
          </div>
        </div>
        <br />

        <div
          className="row"
          style={{
            position: "relative",
          }}
        >
          <p
            style={{
              textAlign: "center",
              position: "absolute",
              marginBottom: "0px",
              top: "-0px",
              left: "0px",
              background: "rgb(155, 155, 155)",
              borderRadius: "5px",
              padding: "0px 10px",
            }}
          >
            Damage Details
          </p>
          <div className="col-12">
            <br />
            {documentData.length !== 0 && <br />}
          </div>

          {damageMapping?.map((item, index) => (
            <div
              style={{
                padding: "20px 10px 10px 10px",
                border: "1px solid #ccc",
                borderRadius: "5px",
                marginBottom: "20px",
                background: "rgb(231 231 231)",
                position: "relative",
              }}
              key={`item-${index}`}
            >
              <img
                style={{
                  position: "absolute",
                  right: "5px",
                  top: "8px",
                  cursor: "pointer",
                  width: "20px",
                  height: "20px",
                  zIndex: "100",
                }}
                onClick={() =>
                  removeDocumentMapping(item, index, damageMapping)
                }
                src="/images/delete.png"
                alt="Delete"
              />
              <div
                style={{
                  position: "absolute",
                  right: "60px",
                  top: "10px",
                  zIndex: 10,
                }}
              >
                <br />
                {
                  // takePhoto ? (
                  // <Modal
                  //   show={true}
                  //   centered
                  //   onHide={() => setTakePhoto(!takePhoto)}
                  // >
                  //   <Modal.Header closeButton>
                  //     <Modal.Title>Take Photo</Modal.Title>
                  //   </Modal.Header>
                  //   {photoData ? (
                  //     <img src={photoData} alt="img" />
                  //   ) : (
                  //     <Camera
                  //       onTakePhoto={(dataUri) => {
                  //         handleTakePhoto(dataUri);
                  //       }}
                  //       imageType="jpg"
                  //       idealFacingMode={FACING_MODES.ENVIRONMENT}
                  //     />
                  //   )}
                  //   <Modal.Footer>
                  //     {photoData ? (
                  //       <>
                  //         <div
                  //           style={{
                  //             display: "flex",
                  //             justifyContent: "space-between",
                  //           }}
                  //         >
                  //           <button
                  //             className="button button-foreword"
                  //             style={{
                  //               marginRight: "0px",
                  //               padding: "10px",
                  //             }}
                  //             onClick={() => handleSubmitImage(index)}
                  //           >
                  //             Save
                  //           </button>
                  //           <button
                  //             className="button button-foreword"
                  //             style={{
                  //               marginRight: "0px",
                  //               padding: "10px",
                  //             }}
                  //             onClick={() => setPhotoData(null)}
                  //           >
                  //             Retake
                  //           </button>
                  //         </div>
                  //       </>
                  //     ) : (
                  //       <button
                  //         className="button button-foreword"
                  //         onClick={() => setTakePhoto(!takePhoto)}
                  //       >
                  //         Close
                  //       </button>
                  //     )}
                  //   </Modal.Footer>
                  // </Modal>
                  //   <FileUpload fileUploaded={console.log} />
                  // ) :
                  item.IM_IMAGE ? (
                    <button
                      className="button"
                      style={{
                        margin: "0 auto",
                        padding: "7px 10px",
                        background: "transparent",
                      }}
                      type="button"
                      onClick={() => openImage(item.IM_IMAGE)}
                    >
                      {console.log(item.IMAGE)}
                      {/* view icon */}
                      <i className="fas fa-eye" style={{ color: "black" }}></i>
                    </button>
                  ) : (
                    // <button
                    //   onClick={() => {
                    //     setTakePhoto(!takePhoto);
                    //   }}
                    //   className="button"
                    //   style={{
                    //     margin: "0 auto",
                    //     padding: "7px 10px",
                    //     background: "transparent",
                    //   }}
                    // >
                    //   <i className="fas fa-camera" style={{ color: "black" }}></i>
                    // </button>
                    <FileUpload
                      fileUploaded={(data, type) =>
                        handleSubmitImage(index, data, type)
                      }
                    />
                  )
                }
              </div>
              <div className="row" style={{}}>
                {item.COMBINED_MATERIAL.map((ele, i) => (
                  <React.Fragment key={i}>
                    <div className="col-12 col-md-3">
                      <div className="row">
                        <label className="col-12">Material</label>
                        <div className="col-12">
                          <input
                            disabled
                            value={`${ele.MATERIAL.replace(/^0+/, "")} - ${
                              ele.MATERIAL_DESC
                            }`}
                            key={i}
                            type="text"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="col-12 col-md-3">
                      <div className="row">
                        <label className="col-12">Delivery No</label>
                        <div className="col-12">
                          <input
                            disabled
                            value={ele.DELIVERY_NO}
                            key={i}
                            type="text"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="col-12 col-md-3">
                      <div className="row">
                        <label className="col-12">Dispatch QTY</label>
                        <div className="col-12 depot-select">
                          <input
                            disabled
                            value={ele.DESPATCH_QTY}
                            type="text"
                            key={i}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="col-12 col-md-3"></div>
                  </React.Fragment>
                ))}

                <div className="col-6 col-md-2">
                  <div className="row">
                    <div className="col-12">
                      <label>Cut & Torn</label>
                    </div>
                    <div className="col-12 depot-select">
                      <input
                        name="CUT_TORN"
                        type="number"
                        defaultValue={item.CUT_TORN}
                        step={".01"}
                        onChange={(e) => {
                          setDamageDataValue("CUT_TORN", e.target.value, index);
                        }}
                      />
                    </div>
                  </div>
                </div>
                <div className="col-6 col-md-2">
                  <div className="row">
                    <div className="col-12">
                      <label>Water Damage</label>
                    </div>
                    <div className="col-12 depot-select">
                      <input
                        name="WATER_DMG"
                        type="number"
                        defaultValue={item.WATER_DMG}
                        step={".01"}
                        onChange={(e) => {
                          setDamageDataValue(
                            "WATER_DMG",
                            e.target.value,
                            index
                          );
                        }}
                      />
                    </div>
                  </div>
                </div>
                <div className="col-6 col-md-2">
                  <div className="row">
                    <div className="col-12">
                      <label>Handling Dmg.</label>
                    </div>
                    <div className="col-12 depot-select">
                      <input
                        name="HANDING_DMG"
                        type="number"
                        defaultValue={item.HANDING_DMG}
                        step={".01"}
                        onChange={(e) => {
                          setDamageDataValue(
                            "HANDING_DMG",
                            e.target.value,
                            index
                          );
                        }}
                      />
                    </div>
                  </div>
                </div>
                <div className="col-6 col-md-2">
                  <div className="row">
                    {/* label is replaced with burst bag */}
                    {/* others variable is burst bag */}
                    <div className="col-12">
                      <label>Burst Bag</label>
                    </div>
                    <div className="col-12 depot-select">
                      <input
                        name="NEW_BURST"
                        type="number"
                        defaultValue={item.NEW_BURST}
                        step={".01"}
                        onChange={(e) => {
                          setDamageDataValue(
                            "NEW_BURST",
                            e.target.value,
                            index
                          );
                        }}
                      />
                    </div>
                  </div>
                </div>
                <div className="col-6 col-md-1">
                  <div className="row">
                    {/* label is replaced with others */}
                    {/* Burst bag variable is others */}
                    <div className="col-12">
                      <label>Others</label>
                    </div>
                    <div className="col-12 depot-select">
                      <input
                        name="BRUST_BAG"
                        type="number"
                        defaultValue={item.BRUST_BAG}
                        step={".01"}
                        onChange={(e) => {
                          setDamageDataValue(
                            "BRUST_BAG",
                            e.target.value,
                            index
                          );
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div className="col-6 col-md-1">
                  <div className="row">
                    <div className="col-12">
                      <label>Total Dmg.</label>
                    </div>
                    <div className="col-12 depot-select">
                      <input
                        value={item.TOTAL_DMG}
                        name="TOTAL_DMG"
                        disabled
                        type="number"
                      />
                    </div>
                  </div>
                </div>
                <div className="col-6 col-md-2">
                  <div className="row">
                    <div className="col-12">
                      <label>Total Dmg. %</label>
                    </div>
                    <div className="col-12 depot-select">
                      <input
                        name="TOTAL_DMG_PER"
                        disabled
                        type="number"
                        value={item.TOTAL_DMG_PER}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {documentData?.length > 0 && (
          <div className="row">
            <div className="col-12 col-md-12">
              <div
                className="table-div"
                style={{
                  minHeight: "300px",
                }}
              >
                <table className="table" style={{ margin: "10px 0" }}>
                  <thead>
                    <tr>
                      {columnsSelected.map((column, index) => {
                        if (column.title === "") {
                          return (
                            <th key={index}>
                              <button
                                className="goods-button"
                                style={{
                                  margin: "0px 5px",
                                  background: "rgb(15, 111, 162)",
                                  width: "200px",
                                }}
                                onClick={() => {
                                  combineData();
                                }}
                                disabled={selectedCombine.length === 0}
                              >
                                Enter Damage
                              </button>
                            </th>
                          );
                        } else {
                          return <th key={index}>{column.title}</th>;
                        }
                      })}
                    </tr>
                  </thead>
                  <tbody>
                    {documentData.map((ele, i) => (
                      <tr key={i}>
                        {columnsSelected.map((column, index) => {
                          if (column.title === "View") {
                            return (
                              <td key={index}>
                                <i
                                  className="fas fa-eye"
                                  style={{ color: "black", cursor: "pointer" }}
                                ></i>
                              </td>
                            );
                          } else if (column.title === "Delete") {
                            return (
                              <td key={index} onClick={() => {}}>
                                Delete
                              </td>
                            );
                          } else if (column.title === "") {
                            return (
                              <td key={index}>
                                <input
                                  type="checkbox"
                                  onChange={(e) => {
                                    selectedData(e, ele);
                                  }}
                                  value={ele[column.key]}
                                  name="selectRake"
                                  className="select-rake"
                                  id={ele[column.key]}
                                />
                              </td>
                            );
                          } else {
                            return (
                              <td key={index}>
                                {dateFormat(ele[column.key], column.key, ele)}
                              </td>
                            );
                          }
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {!getUrlParams("view") && (
          <div className="row">
            <div className="col-12 col-md-12">
              <div className="row">
                <div className="col-12">
                  <button
                    className="goods-button"
                    style={{
                      background: "rgb(15, 111, 162)",
                    }}
                  >
                    {alreadySaved ? "Update" : "Save"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </form>

      <ApproveReject id={id} link={"demmurage-data"} />
    </div>
  );
};

const mapStateToProps = (state) => ({});

const mapDispatchToProps = {
  loading,
};

export default connect(mapStateToProps, mapDispatchToProps)(RakeDamageData);
