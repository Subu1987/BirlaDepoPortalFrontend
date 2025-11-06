import React, { useState } from "react";
import Swal from "sweetalert2";
import http from "../../services/apicall";
import { connect } from "react-redux";
import { loading } from "../../actions/loadingAction";
import moment from "moment";

function RRDelete(props) {
  const [rrNo, setRRNo] = useState("");
  const [dlNo, setDlNo] = useState("");
  const [rrData, setRRData] = useState({});

  const getRRData = () => {
    if (rrNo) {
      let url = "/get-rake-data-post";
      props.loading(true);

      http
        .post(url, {
          RR_NO: rrNo.trim(),
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
            console.log(res.data);
            setRRData(res.data.data);
          }
        })
        .catch((err) => console.log(err))
        .finally(() => props.loading(false));
    } else {
      let url = `/get-rake-data-by-delivery-no/${dlNo.trim()}`;
      props.loading(true);
      http
        .get(url)
        .then((res) => {
          if (res.data.code === 1) {
            Swal.fire({
              title: "No Data Found",
              text: "No Data Found",
              icon: "error",
              confirmButtonText: "Ok",
            });
          } else {
            console.log(res.data);
            if (res.data.data.length === 0) {
              Swal.fire({
                title: "No Data Found",
                text: "No Data Found",
                icon: "error",
                confirmButtonText: "Ok",
              });
              return;
            }
            setRRData(res.data.data[0]);
          }
        })
        .catch((err) => console.log(err))
        .finally(() => props.loading(false));
    }
  };

  const deleteRRData = () => {
    let url = "/delete-rake-data-post";
    props.loading(true);
    http
      .post(url, {
        RR_NO: rrNo.trim(),
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
          Swal.fire({
            title: "Success",
            text: "Entry deleted Successfully",
            icon: "success",
          }).then(() => {
            setRRData({});
          });
        }
      })
      .catch((err) => console.log(err))
      .finally(() => props.loading(false));
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
            value={rrNo}
            onChange={(e) => setRRNo(e.target.value)}
            type="text"
            placeholder="Enter RR No"
            style={{
              margin: 0,
            }}
            onKeyDown={(e) => e.key === "Enter" && getRRData()}
          />
          <input
            value={dlNo}
            onChange={(e) => setDlNo(e.target.value)}
            type="text"
            placeholder="Enter Delivery No"
            style={{
              margin: 0,
            }}
            onKeyDown={(e) => e.key === "Enter" && getRRData()}
          />
        </div>
        <button
          onClick={() => {
            getRRData();
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
        {Object.keys(rrData).length > 0 ? (
          <div>
            <div>
              <p>
                RR No:&nbsp;<span>{rrData.RR_NO}</span>
              </p>
            </div>
            <div>
              <p>
                RR Date:&nbsp;
                <span>{moment(rrData.RR_DATE).format("MMM DD, YYYY")}</span>
              </p>
            </div>
            <div>
              <p>
                Date of Rake Received:(This is the filter date so please check
                this date carefully)&nbsp;
                <span>
                  {moment(rrData.DATE_OF_RAKE_RECEIVED).format("MMM DD, YYYY")}
                </span>
              </p>
            </div>
            <div>
              <p>
                Handing Party:&nbsp;<span>{rrData.HANDLING_PARTY}</span>
              </p>
            </div>
            <div>
              <p>
                Created At:&nbsp;
                <span>{moment(rrData.createdAt).format("MMM DD, YYYY")}</span>
              </p>
            </div>
            <div>
              <button
                onClick={() => {
                  Swal.fire({
                    title: "Are you sure?",
                    text: "You won't be able to revert this!",
                    icon: "warning",
                    showCancelButton: true,
                    confirmButtonColor: "#3085d6",
                    cancelButtonColor: "#d33",
                    confirmButtonText: "Yes, delete it!",
                  }).then((result) => {
                    if (result.value) {
                      deleteRRData();
                    }
                  });
                }}
                className="goods-button"
                style={{
                  background: "#0F6FA2",
                  margin: 0,
                }}
              >
                Delete
              </button>
            </div>
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

export default connect(mapStateToProps, { loading })(RRDelete);
