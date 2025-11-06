import React from "react";
import { connect } from "react-redux";
import ReactExport from "react-export-excel";
import moment from "moment";
import is_number from "is-number";

const ExcelFile = ReactExport.ExcelFile;
const ExcelSheet = ReactExport.ExcelFile.ExcelSheet;
const ExcelColumn = ReactExport.ExcelFile.ExcelColumn;

export const ExcelReport = ({
  fileName,
  columns = [],
  data = [],
  buttonName = "Export to excel",
  className = "goods-button float-right",
  style,
}) => {
  //   format data for excel
  const formatData = (data) => {
    let formattedData = [];
    data.forEach((value, i) => {
      let obj = {};
      columns.forEach((col, j) => {
        if (col.key === "PHY_TIME") {
          obj[col.key] = moment(value[col.key], "HHmmss").format("hh:mm:ss A");
        } else if (col.key === "PHY_DATE") {
          obj[col.key] = moment(value[col.key], "YYYYMMDD").format(
            "DD-MM-YYYY"
          );
        } else if (col.key === "updatedAt" || col.key === "createdAt") {
          obj[col.key] = moment(value[col.key]).format("DD-MM-YYYY");
        } else if (
          [
            "DELIVERY_NO",
            "MAT_DOC",
            "RR_NO",
            "PRCTR",
            "REGIO",
            "BELNR",
            "KUNNR",
            "XBLNR",
            "SGTXT",
            "ZZCOL_CEN",
            "REGION",
            "TOTAL_DMG",
            "TOTAL_DMG_PER",
          ].includes(col.key)
        ) {
          obj[col.key] = value[col.key];
        } else {
          obj[col.key] = is_number(value[col.key])
            ? Number(value[col.key]).toFixed(2)
            : value[col.key];
        }
      });
      formattedData.push(obj);
    });

    return formattedData;
  };

  const columnsFilter = (columns) => {
    let filteredColumns = [];

    columns.forEach((value, i) => {
      if (value.key) {
        filteredColumns.push(value);
      }
    });

    return filteredColumns;
  };

  return (
    <ExcelFile
      filename={
        fileName
          ? fileName
          : `Inventory Report ${moment().format("DD-MM-YYYY hh:mm:ss A")}`
      }
      element={
        <button
          className={className}
          style={{ backgroundColor: "#0F6FA2", ...style }}
        >
          {buttonName}
        </button>
      }
    >
      <ExcelSheet data={formatData(data)} name="Report">
        {columnsFilter(columns).map((value, i) => (
          <ExcelColumn key={i} label={value.title} value={value.key} />
        ))}
      </ExcelSheet>
    </ExcelFile>
  );
};

const mapStateToProps = (state) => ({});

const mapDispatchToProps = {};

export default connect(mapStateToProps, mapDispatchToProps)(ExcelReport);
