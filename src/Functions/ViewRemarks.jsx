import Tooltip from "rc-tooltip";
import React from "react";
import "rc-tooltip/assets/bootstrap_white.css";

export default function ViewRemarks({ data }) {
  return (
    <Tooltip
      placement="top"
      overlay={
        <div style={{ width: "300px" }}>
          {data
            .filter((item) => item.value)
            .map((item, index) => (
              <p
                style={{
                  fontSize: "16px",
                  marginBottom: "5px",
                  textAlign: "center",
                  borderBottom: "1px solid #ccc",
                }}
                key={index}
              >
                {item.user}: {item.value}
              </p>
            ))}
        </div>
      }
    >
      <p style={{ cursor: "pointer", marginBottom: "0px", fontSize: "12px" }}>
        All remarks
      </p>
    </Tooltip>
  );
}
