import moment from "moment";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import "react-html5-camera-photo/build/css/index.css";
import { connect } from "react-redux";
import { useHistory, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import { loading } from "../../actions/loadingAction";
import http from "../../services/apicall";
import apis from "../../services/apis";
import { getUrlParams } from "../../services/utils";
import ApproveReject from "./ApproveReject";

export const DemmurageData = (props) => {
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
    temp[index]["TOTAL_DMG"] = total;

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

    props.loading(true);

    // check image is there other wise through errror

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

  const selectedData = (e, data) => {
    let newData = [];
    if (e.target.checked) {
      newData = [...selectedCombine, data];
      setSelectedCombine(newData);
    } else {
      let filteredData = selectedCombine.filter(
        (item) => item.DELIVERY_NO !== data.DELIVERY_NO
      );
      setSelectedCombine(filteredData);
    }
  };

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

  const handleSubmitImage = (index) => {
    let temp = [...damageMapping];
    let data = temp[index];
    http
      .post(apis.IMAGE_UPLOAD, {
        image: photoData,
        imageFormat: "PNG",
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

  const openImage = (id) => {
    http.get(`${apis.GET_IMAGE}/${id}`).then((res) => {
      // open res in a new tab with img tag
      let imageWindow = window.open("");
      // title of the new tab
      imageWindow.document.write(`<title>Image</title>`);
      // turn of the loading
      imageWindow.document.write(
        `<style>body{margin:0;padding:0;}img{margin:auto;display:block}</style>`
      );

      imageWindow.document.write(`<img src='${res.data.image}' />`);
    });
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
          Demurage Data
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
              {/* <img
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
              /> */}
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

                <div className="row">
                  <div className="col-12 col-md-6">
                    <div className="row">
                      <div className="col-12">
                        <label>
                          Demmurage is Rs.<span>*</span>
                        </label>
                      </div>
                      <div className="col-12 depot-select">
                        <input
                          ref={register}
                          name="DEM_RS"
                          defaultValue={item.DEM_RS}
                          onChange={(e) => {
                            setDamageDataValue("DEM_RS", e.target.value, index);
                          }}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="col-12 col-md-6">
                    <div className="row">
                      <div className="col-12">
                        <label>
                          Wharfage is Rs.<span>*</span>
                        </label>
                      </div>
                      <div className="col-12 depot-select">
                        <input
                          ref={register}
                          name="WHR_RS"
                          defaultValue={item.WHR_RS}
                          onChange={(e) => {
                            setDamageDataValue("WHR_RS", e.target.value, index);
                          }}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="col-12 col-md-12">
                    <div className="row">
                      <div className="col-12">
                        <label>Remarks DC & WF</label>
                      </div>
                      <div className="col-12 depot-select">
                        <textarea
                          ref={register}
                          defaultValue={item.REMARKS_DC_WF}
                          name="REMARKS_DC_WF"
                          onChange={(e) => {
                            setDamageDataValue(
                              "REMARKS_DC_WF",
                              e.target.value,
                              index
                            );
                          }}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="col-12 col-md-12">
                    <div className="row">
                      <div className="col-12">
                        <label>Reason</label>
                      </div>
                      <div className="col-12 depot-select">
                        <textarea
                          ref={register}
                          name="REASON"
                          rows={5}
                          defaultValue={item.REASON}
                          onChange={(e) => {
                            setDamageDataValue("REASON", e.target.value, index);
                          }}
                        />
                      </div>
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
                                }}
                                onClick={() => {
                                  combineData();
                                }}
                                disabled={selectedCombine.length === 0}
                              >
                                Combine
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

      <ApproveReject id={id} link={"claim-insurance"} />
    </div>
  );
};

const mapStateToProps = (state) => ({});

const mapDispatchToProps = {
  loading,
};

export default connect(mapStateToProps, mapDispatchToProps)(DemmurageData);
