import React from "react";
import "./Style.css"

export default function GlobalLoader() {
  return (
    <div>
      <div className="arc"></div>
      <h1 className="loader-text">
        <span>LOADING</span>
      </h1>
    </div>
  );
}
