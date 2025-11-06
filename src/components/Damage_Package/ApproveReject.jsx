import React from "react";
import { useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import Swal from "sweetalert2";
import { getUrlParams } from "../../services/utils";
import {
  approveDamageData,
  createMigoData,
  rejectDamageData,
} from "./ApproveDamageData";

export default function ApproveReject({
  id,
  nextPage = true,
  link,
  tableView,
}) {
  const userdetails = useSelector((state) => state.Auth.userdetails);
  const history = useHistory();

  const data = getUrlParams("hide-approve-reject");

  return (
    <>
      {(getUrlParams("view") || tableView) && (
        <div className="row">
          <div className="col-12 col-md-12">
            <div className="row">
              <div
                className="col-12"
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                }}
              >
                {!(userdetails.user_type === 7) && (
                  <>
                    {nextPage && (
                      <button
                        className="goods-button"
                        style={{
                          background: "rgb(15, 111, 162)",
                          margin: "0px 5px",
                        }}
                        onClick={() => {
                          history.push(
                            `/dashboard/damage-data-entry/${link}/${id}${history.location.search}`
                          );
                        }}
                      >
                        Next Page
                      </button>
                    )}
                    {userdetails.user_type !== 3 && data !== "Hide" && (
                      <>
                        <button
                          className="goods-button"
                          style={{
                            background: "red",
                            margin: "0px 5px",
                          }}
                          onClick={() => {
                            Swal.fire({
                              title: "Are you sure?",
                              html: `<p>Do you want to reject RR no: ${id}?.</p>`,
                              icon: "warning",
                              width: "40em",
                              confirmButtonText: "Yes",
                              cancelButtonText: "No",
                              showCancelButton: true,
                              input: "textarea",
                            }).then((result) => {
                              if (result.value) {
                                // if (userdetails.user_type === 4) {
                                //   rejectDamageData(id, {
                                //     APPROVED_CS: null,
                                //     BH_COMMENT: result.value,
                                //   });
                                // } else if (userdetails.user_type === 6) {
                                //   rejectDamageData(id, {
                                //     APPROVED_BH: null,
                                //     LG_COMMENT: result.value,
                                //   });
                                // } else if (userdetails.user_type === 8) {
                                //   rejectDamageData(id, {
                                //     APPROVED_LG: null,
                                //     CS_COMMENT: result.value,
                                //   });
                                // } else {
                                //   rejectDamageData(id, {
                                //     APPROVED_CS: null,
                                //     CS_COMMENT: result.value,
                                //   });
                                // }
                                rejectDamageData(id, {
                                  APPROVED_CS: null,
                                  APPROVED_BH: null,
                                  APPROVED_LG: null,
                                  APPROVED_SA: null,
                                  CS_COMMENT: result.value,
                                  BH_COMMENT: result.value,
                                  LG_COMMENT: result.value,
                                  SA_COMMENT: result.value,
                                });
                              } else {
                                Swal.fire({
                                  title: "Cancelled",
                                  text: "You need to put a reject reason",
                                  icon: "error",
                                });
                              }
                            });
                          }}
                        >
                          Reject
                        </button>
                        <button
                          className="goods-button"
                          style={{
                            background: "green",
                            margin: "0px 5px",
                          }}
                          onClick={() =>
                            Swal.fire({
                              title: "Are you sure?",
                              html: `<p>Do you want to approved RR no: ${id}?.</p>`,
                              icon: "warning",
                              confirmButtonText: "Yes",
                              cancelButtonText: "No",
                              showCancelButton: true,
                            }).then((result) => {
                              if (result.value) {
                                if (userdetails.user_type === 4) {
                                  // BH User
                                  approveDamageData(id, {
                                    APPROVED_BH:
                                      localStorage.getItem("user_code"),
                                    BH_COMMENT: "",
                                    BH_APPROVED: true,
                                    sendMail: true,
                                  });
                                } else if (userdetails.user_type === 9) {
                                  // approve logic is in the create migo data function
                                  // SA User
                                  createMigoData(id);
                                } else if (userdetails.user_type === 6) {
                                  // LG User
                                  approveDamageData(id, {
                                    APPROVED_LG:
                                      localStorage.getItem("user_code"),
                                    LG_COMMENT: "",
                                    LG_APPROVED: true,
                                    sendMail: true,
                                  });

                                  // Swal.fire({
                                  //   title: "Error",
                                  //   text: "Transfer posting is not allowed. Please contact admin",
                                  //   icon: "error",
                                  // });
                                } else {
                                  // CS User
                                  approveDamageData(id, {
                                    APPROVED_CS:
                                      localStorage.getItem("user_code"),
                                    CS_COMMENT: "",
                                    CS_APPROVED: true,
                                    sendMail: true,
                                  });
                                }
                              }
                            })
                          }
                        >
                          Approve
                        </button>
                      </>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
