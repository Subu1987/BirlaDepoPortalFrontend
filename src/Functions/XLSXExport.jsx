import * as XLSX from "xlsx";
function generateXLSX(data = [], fileName = "Comparative Report") {
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.aoa_to_sheet(data);

  const style = { fill: { fgColor: { rgb: "FFFF0000" } } }; // Red background color

  // Apply style object to the cell
  const cellRef = "B2";
  const cell = worksheet[cellRef];
  cell.s = style; // Set the style of the cell

  XLSX.utils.book_append_sheet(workbook, worksheet, "Comparative Report");
  XLSX.writeFile(workbook, `${fileName}.xlsx`);
}

export default generateXLSX;


