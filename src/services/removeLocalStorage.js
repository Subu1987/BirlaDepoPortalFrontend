const removeLocalItem = () => {
  localStorage.removeItem("plants");
  localStorage.removeItem("gr-plants");
  localStorage.removeItem("con-type");
  localStorage.removeItem("ship-type");
  localStorage.removeItem("regions");
  localStorage.removeItem("sales-office");
  localStorage.removeItem("division");
  localStorage.removeItem("cus-grp");
  localStorage.removeItem("sales-district");
  localStorage.removeItem("company-code");
  localStorage.removeItem("dist-chan");
  localStorage.removeItem("sales-customer");
  localStorage.removeItem("sales-group");
  localStorage.removeItem("doc-type");
  localStorage.removeItem("allRegion");
  localStorage.removeItem("allCFA");
  localStorage.removeItem("allDepot")
};

export default removeLocalItem;
