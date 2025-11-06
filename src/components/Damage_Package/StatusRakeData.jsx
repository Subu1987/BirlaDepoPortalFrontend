import React from "react";

export default function StatusRakeData() {
  return (
    <div
      className="col badge-div"
      style={{
        padding: "10px",
      }}
    >
      <label className="badge float-right">
        <button className="badge-button success"></button>Rake Entry Claimed
      </label>
      <label className="badge float-right">
        <button className="badge-button warning"></button>Rake Damage Entered
      </label>
      <label className="badge float-right">
        <button className="badge-button danger"></button>Rake Data Entered
      </label>
      <label className="badge float-right">
        <button
          className="badge-button "
          style={{
            background: "#0065ff",
          }}
        ></button>
        Approved By CS
      </label>
      <label className="badge float-right">
        <button
          className="badge-button"
          style={{
            background: "rgb(145 0 255)",
          }}
        ></button>
        Approve By BH
      </label>
      <label className="badge float-right">
        <button
          className="badge-button"
          style={{
            background: "#ff8d00",
          }}
        ></button>
        Approved By LG
      </label>
      <label className="badge float-right">
        <button
          className="badge-button"
          style={{
            background: "#6e180c",
          }}
        ></button>
        Fully Approved
      </label>
    </div>
  );
}
