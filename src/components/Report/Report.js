import React from "react";

export default function Report() {
  return (
    <div>
      <div className="row" style={{ backgroundColor: "#0F6FA2" }}>
        <div className="col-6">
          <div className="tab-div"></div>
        </div>
      </div>
      <div className="container-fluid">
        <div className="col-md-3">
          <div className="card report-card">
            <img
              className="img-fluid report-card-img"
              src="/images/card-img.png"
              alt=""
            />
            <div className="report-text-div">
              <h4>Ageing Report</h4>
              <a rel="noopener noreferrer" href="http://bcldev.birlacoporation.com:8010/sap/bc/gui/sap/its/webgui?~transaction=ZFI058" target="_blank">View</a>
                
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
