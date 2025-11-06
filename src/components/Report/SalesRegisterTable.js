import React from "react";
import headers from "./salesRegisterHeaders";

export default function SalesRegisterTable({ data, props }) {
  return (
    <div>
      <div className="table-div">
        <div className="row">
          <table className="table">
            <thead>
              <tr>
                {headers.map((header, i) => (
                  <th
                    key={i}
                    className="table-sticky-vertical"
                    style={{
                      minWidth:
                        header?.minWidth === undefined
                          ? "150px"
                          : header?.minWidth,
                    }}
                    scope="col"
                  >
                    {header.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((ele, i) =>
                Number(ele["DEL_NO"]) !== 0 ? (
                  <tr key={ele["DEL_NO"]}>
                    {headers.map((body, i) => (
                      <td key={i}>{ele[body.value]}</td>
                    ))}
                  </tr>
                ) : null
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
