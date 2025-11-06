import React, { useState } from "react";
import http from "../../services/apicall";
import Swal from "sweetalert2";

export default function GivePermissionToRR() {
  const [RR_NO, setRR_NO] = useState("");

  const addRRPermission = async () => {
    const user_code = localStorage.getItem("user_code");
    if (RR_NO) {
      const postData = {
        rr_no: RR_NO,
        user_code,
      };

      const data = await http.post("rfc/add_rr_permission", postData);
      if (data.data.code === 0) {
        Swal.fire({
          title: "Success",
          text: "Permission added successfully",
          icon: "success",
          timer: 2000,
        }).then(() => {
          setRR_NO("");
        });
      }
    }
  };

  return (
    <div>
      <div className="row">
        <br />
        <br />
        <div className="col-12 col-md-12">
          <div
            style={{
              padding: "50px",
              borderRadius: "5px",
              display: "flex",
              justifyContent: "space-between",
              gap: 10,
            }}
          >
            <input
              type="text"
              placeholder="Enter RR No"
              style={{
                margin: 0,
              }}
              value={RR_NO}
              onChange={(e) => setRR_NO(e.target.value)}
            />

            <button
              className="goods-button"
              style={{
                background: "#0F6FA2",
                margin: 0,
              }}
              onClick={() => addRRPermission()}
            >
              Add_Permission_to_RR
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
