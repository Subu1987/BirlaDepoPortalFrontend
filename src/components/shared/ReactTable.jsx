import React from "react";

const CustomTable = ({ data, columns }) => {
  return (
    <table className="table">
      <thead>
        <tr>
          {columns.map((column, i) => (
            <th
              className="table-sticky-vertical"
              key={column.key + i}
              style={{ minWidth: column.width }}
            >
              {column.title}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((record, index) => (
          <tr key={index}>
            {columns.map((column) => (
              <td key={column.key}>
                {column.render ? (
                  column.render(record[column.key], record)
                ) : (
                  <>{record[column.key] ? record[column.key] : "-"}</>
                )}
              </td>
            ))}
          </tr>
        ))}
        {data.length === 0 && (
          <tr>
            <td
              colSpan={columns.length}
              style={{
                position: "relative",
              }}
            >
              <h4
                style={{
                  position: "absolute",
                  padding: "10px",
                }}
              >
                No Data
              </h4>
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
};

export default CustomTable;
