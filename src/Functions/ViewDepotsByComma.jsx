import Tooltip from "rc-tooltip";
import React from "react";
import "rc-tooltip/assets/bootstrap_white.css";

export default function ViewDepotsByComma({ data }) {
  let depotsName = data.map((item) => {
    return item.value;
  });

  return (
    <Tooltip
      placement="top"
      overlay={
        <div style={{ width: "300px" }}>
          {data.map((item, index) => (
            <p
              style={{
                fontSize: "16px",
                marginBottom: "5px",
                textAlign: "center",
                borderBottom: "1px solid #ccc",
              }}
              key={index}
            >
              {item.label}
            </p>
          ))}
        </div>
      }
    >
      <p style={{ cursor: "pointer", marginBottom: "0px" }}>
        {depotsName.join(", ")}
      </p>
    </Tooltip>
  );
}
