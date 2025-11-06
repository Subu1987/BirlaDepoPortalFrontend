import React, { useState } from "react";
import { connect } from "react-redux";
import Swal from "sweetalert2";
import { loading } from "../../actions/loadingAction";
import http from "../../services/apicall";

function DMSDetails(props) {
  const [dmsNo, setDmsNo] = useState("");
  const [dmsData, setDmsData] = useState({});

  const getDMSData = () => {
    if (dmsNo) {
      let url = "/login/openapi/status_check";
      props.loading(true);

      http
        .post(url, {
          dms_req_no: dmsNo.trim(),
          app_id: "4dc71a29d661ac06bf3e5b5b725be10c",
          app_secret:
            "$2a$12$zxBThToaPuXoeXuj6kBYZuENeBZW4Vg9u0yBU7ghyxEnQnVx2CUte",
        })
        .then((res) => {
          if (res.data.code === 1) {
            Swal.fire({
              title: "No Data Found",
              text: "No Data Found",
              icon: "error",
              confirmButtonText: "Ok",
            });
          } else {
            if (res.data.result.length === 0) {
              Swal.fire({
                title: "No Data Found",
                text: "No Data Found",
                icon: "error",
                confirmButtonText: "Ok",
              });
              return;
            } else {
              setDmsData(res.data.result[0]);
            }
          }
        })
        .catch((err) => console.log(err))
        .finally(() => props.loading(false));
    }
  };

  const syncToSAP = () => {
    console.log(dmsData);
    const postData = {
      fm_name: "ZRFC_DMS_PAYLOAD",
      params: {
        IM_DATA: [
          {
            SO_DMS_REQID: dmsData.dms_req_no,
            SO_SHIP_TO: dmsData.ship_to_party,
            SO_SOLD_TO: dmsData.sold_to_party,
            SO_MATNR: dmsData.material,
            SO_QTY: dmsData.qty,
          },
        ],
      },
    };

    http
      .post("/rfc/common_post_with_fm_name", postData)
      .then((res) => {
        if (res.data.code === 1) {
          Swal.fire({
            title: "Error",
            text: "Error",
            icon: "error",
            confirmButtonText: "Ok",
          });
        } else {
          Swal.fire({
            title: "Success",
            text: "Success",
            icon: "success",
            confirmButtonText: "Ok",
          });
        }
      })
      .catch((err) => console.log(err));

    console.log(postData);
  };

  return (
    <div className="" style={{ padding: "30px" }}>
      <div
        style={{
          display: "flex",
          gap: 10,
          padding: "20px",
          border: "1px solid #ccc",
          borderRadius: "5px",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 10,
            width: "100%",
          }}
        >
          <input
            value={dmsNo}
            onChange={(e) => setDmsNo(e.target.value)}
            type="text"
            placeholder="Enter DMS No"
            style={{
              margin: 0,
            }}
            onKeyDown={(e) => e.key === "Enter" && getDMSData()}
          />
        </div>
        <button
          onClick={() => {
            getDMSData();
          }}
          className="goods-button"
          style={{
            background: "#0F6FA2",
            margin: 0,
          }}
        >
          Search
        </button>
      </div>
      <br />
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 10,
          padding: "20px",
          border: "1px solid #ccc",
          borderRadius: "5px",
        }}
      >
        {Object.keys(dmsData).length > 0 ? (
          <div>
            <div>
              <button
                className="goods-button"
                style={{ background: "#0F6FA2", margin: 0 }}
                onClick={() => syncToSAP()}
              >
                Sync to SAP
              </button>
            </div>
            <br />
            {Object.keys(dmsData).map((key, index) => (
              <>
                <div>
                  <p>
                    {key}:&nbsp;<span>{dmsData[key]}</span>
                  </p>
                </div>
              </>
            ))}
          </div>
        ) : (
          <div>No Data</div>
        )}
      </div>
    </div>
  );
}

const mapStateToProps = (state) => ({
  Auth: state.Auth,
});

export default connect(mapStateToProps, { loading })(DMSDetails);
