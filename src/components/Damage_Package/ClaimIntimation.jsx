import moment from "moment";
import React, { useEffect, useState } from "react";
import Modal from "react-bootstrap/Modal";
import Swal from "sweetalert2";
import { loading } from "../../actions/loadingAction";
import http from "../../services/apicall";
import store from "../../store";

//     CLAIM INTIMATION TEMPLATE
// Particular	Remarks		Editable/Non-Editable	Remark

// Type of Policy	Marine Open Policy-Inland		FIX value - Non-Editable	FIX
// Policy Number			FIX value - Non-Editable	To be provided
// Company Name (RCCPL/BCL)	BCL		Non-Editable	Company Name picked from SAP
// Consignment Booked From ?	BIRLA CORPORATION LTD CHANDERIYA		Non-Editable	Despatch Plant Company Name + Location
// Consignment Final Destination ?	DHOSAWAS RAKE POINT RATLAM 457001 (M.P)		Non-Editable	Receiving Plant Destination Name
// RR Number.	261001044		Non-Editable	RR No. capture from Rake Report (Portal)
// RR Date.	12.09.2023		Non-Editable	RR Date capture from Rake Report (Portal)
// Invoice Number /DO No.	1911477504/1911477506		Non-Editable	If possible, Invoice no can be captured and this is availble in subsiquent doc of Delivery, otherwise DO no will be provided - It could be multiple
// Invoice Date	12.09.2023		Non-Editable	DO / Invoice date
// Nature of Commodity	Cement Bags (50KG Each)		FIX value - Non-Editable	FIX
// Date of receipt of consignment at destnation railway siding	13.09.2023		Non-Editable	Receiving Date
// Date of Loss/damage	13.09.2023		Non-Editable	Receiving Date
// Cause of Loss/Damage	water demmage		Editable 	Capture from Rake arrival Portal
// Estimated Damaged Quantity (In MT)	22.55 M.T		Non-Editable	Capture from Rake arrival Portal
// Estimated Value of Loss/Damage. (Rs.)	 167963/- 		Editable 	This is DO/Invoice per tonne Value * Damage Qty - If DO/Invoice have multiple invoice/DO with different rates then weighted average per tonee rate will be updated
// "Total Consignment Value
// (As per RR/Delivery Challan/Invoices)"	 3873518.56/- 		Editable 	Total value of DO/Invoice under above RR
// Complete Address where damaged Material has been stored and surveyor can Visit for Survey ?	RATLAM STRPOW BORD RATLAM		Non-Editable	Destination Warehouse Address
// Contact Person details who is assist surveyor in Site survey and Documentations.	Name SANJAY KOCHATTA /SUBHASH ROY		Editable 	CFA Contact Name  - No available in Portal
// Mobile Number 9425195260/7489714153		Editable 	Will be capture from CFA login matrix
// Email Id. Sanjay_kochatta@yahoo.co.in		Editable 	Will be capture from CFA login matrix

export default function ClaimIntimation({ show, hideIt, data = null }) {
  const [formJson, setFormJson] = useState({
    typeOfPolicy: { value: "Marine Open Policy-Inland", disabled: true },
    policyNumber: { value: "", disabled: true },
    companyName: { value: "", disabled: true },
    consignmentBookedFrom: { value: "", disabled: true },
    consignmentFinalDestination: { value: "", disabled: true },
    rrNumber: { value: "", disabled: true },
    rrDate: { value: "", disabled: true },
    invoiceNumberOrDoNo: { value: "", disabled: true },
    invoiceDate: { value: "", disabled: true },
    natureOfCommodity: { value: "", disabled: true },
    dateOfReceiptOfConsignmentAtDestinationRailwaySiding: {
      value: "",
      disabled: true,
    },
    dateOfLossDamage: { value: "", disabled: true },
    causeOfLossDamage: { value: "", disabled: false },
    estimatedDamagedQuantityInMT: { value: "", disabled: true },
    estimatedValueOfLossDamage: { value: "", disabled: true },
    totalConsignmentValue: { value: "", disabled: false },
    completeAddressWhereDamagedMaterialHasBeenStoredAndSurveyorCanVisitForSurvey:
      { value: "", disabled: true },
    contactPersonDetailsWhoIsAssistSurveyorInSiteSurveyAndDocumentations: null,
    mobileNumber: {
      value: "",
      disabled: false,
    },
    emailId: { value: "", disabled: false },
    remarks: { value: "", disabled: false },
  });

  const [html, setHtml] = useState("");

  const submitData = (data) => {
    let postData = {};
    Object.entries(formJson).forEach(([key, value]) => {
      if (value) {
        postData[textFormatting(key)] = value
          ? typeof value.value === "object"
            ? value.value.join(",")
            : value.value
          : "";
      }
    });

    console.log(postData);

    store.dispatch(loading(true));

    http
      .post("/claim-intimation", postData)
      .then((res) => {
        console.log(res);
        if (res.data.code === 0) {
          Swal.fire({
            icon: "success",
            title: "Success",
            text: "Claim Intimation Submitted Successfully",
          }).then(() => {
            window.location.reload();
          });
        } else {
          Swal.fire({
            icon: "error",
            title: "Oops...",
            text: "Something went wrong!",
          });
        }
      })
      .catch((err) => console.log(err))
      .finally(() => store.dispatch(loading(false)));
  };

  const textFormatting = (inputString = "") => {
    const convertedString = inputString
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, function (str) {
        return str.toUpperCase();
      });

    return convertedString;
  };

  const getData = (data) => {
    console.log(data);

    const allMaterials = [];
    let damageQty = 0;

    for (const item of data.DAMAGE_DATA) {
      if (item.hasOwnProperty("COMBINED_MATERIAL")) {
        damageQty += Number(item.TOTAL_DMG);
        for (const material of item.COMBINED_MATERIAL) {
          if (material.hasOwnProperty("DELIVERY_NO")) {
            allMaterials.push(material);
          }
        }
      }
    }

    console.log(allMaterials);

    setFormJson({
      ...formJson,
      rrNumber: { value: data.RR_NO, disabled: true },
      rrDate: {
        value: moment(data.RR_DATE).format("DD MMM YYYY"),
        disabled: true,
      },
      consignmentBookedFrom: {
        value: uniqueData(allMaterials.map((ele) => ele.MFG_PLANT_NAME)),
        disabled: true,
      },
      consignmentFinalDestination: {
        value: uniqueData(allMaterials.map((ele) => ele.DEPOT_NAME)),
        disabled: true,
      },
      invoiceNumberOrDoNo: {
        value: uniqueData(allMaterials.map((ele) => ele.DELIVERY_NO)),
        disabled: true,
      },
      invoiceDate: {
        value: uniqueData(
          allMaterials.map((ele) => moment(ele.GRN_DATE).format("DD MMM YY"))
        ),
        disabled: true,
      },
      dateOfReceiptOfConsignmentAtDestinationRailwaySiding: {
        value: moment(data.DATE_OF_RAKE_RECEIVED).format("DD MMM YY"),
        disabled: true,
      },
      dateOfLossDamage: {
        value: moment(data.DATE_OF_RAKE_RECEIVED).format("DD MMM YY"),
        disabled: true,
      },
      estimatedDamagedQuantityInMT: {
        value: data.CLAIM_QTY,
        disabled: true,
      },
      estimatedValueOfLossDamage: {
        value: Number(data.CLAIM_AMOUNT).toFixed(2),
        disabled: true,
      },
      completeAddressWhereDamagedMaterialHasBeenStoredAndSurveyorCanVisitForSurvey:
        {
          value: uniqueData(allMaterials.map((ele) => ele.DEPOT_NAME)),
          disabled: true,
        },
      contactPersonDetailsWhoIsAssistSurveyorInSiteSurveyAndDocumentations:
        null,
    });
  };

  const uniqueData = (data) => {
    return [...new Set(data)];
  };

  useEffect(() => {
    if (Object.keys(data).length) {
      getData(data);
    }
  }, [data]);

  return (
    <Modal show={show} onHide={hideIt} size="lg" centered style={{}}>
      <Modal.Header closeButton>
        <Modal.Title id="contained-modal-title-vcenter">
          Claim Intimation Data
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <form className="claim-modal">
          <div className="">
            <div style={{ display: "flex" }}>
              <div style={{ width: "50%" }}>
                <label>Particular</label>
              </div>
              <div style={{ width: "50%" }}>
                <label>Remarks</label>
              </div>
            </div>
            {Object.entries(formJson).map(([key, value]) => (
              <div
                key={key}
                style={{
                  display: "flex",
                  gap: "5px",
                  marginBottom: "10px",
                }}
              >
                <div style={{ width: !value ? "100%" : "50%" }}>
                  <label
                    style={{
                      fontWeight: value ? 500 : 600,
                    }}
                  >
                    {textFormatting(key)}
                  </label>
                </div>
                {value ? (
                  <div style={{ width: "50%" }}>
                    <input
                      style={{
                        margin: "0px",
                      }}
                      type="text"
                      disabled={value.disabled}
                      name={key}
                      value={value.value}
                      onChange={(e) =>
                        setFormJson({
                          ...formJson,
                          [key]: {
                            ...formJson[key],
                            value: e.target.value,
                          },
                        })
                      }
                    />
                  </div>
                ) : (
                  <div
                    style={{
                      width: 0,
                    }}
                  ></div>
                )}
              </div>
            ))}
          </div>
        </form>
        <div
          dangerouslySetInnerHTML={{
            __html: html,
          }}
        ></div>
      </Modal.Body>
      <Modal.Footer>
        <button
          onClick={submitData}
          className="goods-button"
          style={{
            background: "green",
          }}
          type="submit"
        >
          Submit
        </button>
      </Modal.Footer>
    </Modal>
  );
}
