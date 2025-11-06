import moment from "moment";
import React, { useEffect, useRef, useState } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Table from "react-bootstrap/Table";
import { CSVLink } from "react-csv";
import { useForm } from "react-hook-form";
import ReactPaginate from "react-paginate";
import { connect } from "react-redux";
import Select from "react-select";
import AsyncSelect from "react-select/async";
import Swal from "sweetalert2";
import { loading } from "../../actions/loadingAction";
import fetchCustomerNumber from "../../Functions/fetchCustomer";
import filterOptions from "../../Functions/filterData";
import usePlant from "../../hook/usePlant";
import http from "../../services/apicall";
import apis from "../../services/apis";
import SearchCustomerFrom from "./SearchCustomersFrom";
import SearchCustomerTo from "./SearchCustomersTo";

let today = moment();
let twodaysback = moment().subtract(2, "day");

function InvoiceList(props) {
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [invoiceData, setInvoiceData] = useState([]);
  const [allOrderSupplyingPlants, setAllOrderSupplyingPlants] = useState([]);
  const [isPlantModalVisible, setIsPlantModalVisible] = useState(false);
  const [selectedPlant, setSelectedPlant] = useState(undefined);
  const [paginatedInvoiceData, setPaginatedInvoiceData] = useState([]);
  const [perPage, setPerpage] = useState(25);
  const [printNumber, setPrintNumber] = useState("");
  const [SearchCustomerModalVisbleFrom, setSearchCustomerModalVisbleFrom] =
    useState(false);
  const [SearchCustomerModalVisbleTo, setSearchCustomerModalVisbleTo] =
    useState(false);
  const [isDigitalSign, setIsDigitalSign] = useState(false);

  const [pageFinanceList, setPageFinanceList] = useState({
    TOTAL_QTY: 0,
    NET_AMT: 0,
    TAX_AMT: 0,
    TOTAL_AMT: 0,
    FREIGHT: 0,
  });

  const [multipleInvoice, setMultipleInvoice] = useState([]);

  const {
    register,
    handleSubmit,
    watch,
    errors,
    setValue,
    triggerValidation,
    reset,
    getValues,
  } = useForm({
    mode: "onSubmit",
    reValidateMode: "onChange",
    defaultValues: {
      invoice_date_from: twodaysback.format("YYYY-MM-DD"),
      invoice_date_to: today.format("YYYY-MM-DD"),
    },
  });
  // let history = useHistory();
  const watchAllFields = watch();

  //++++++++++++++++++++++++++++++++++++++++++++++searchSysytem plant+++++++++++++++++++++++++++++++++++++++++++++++++++
  const [plantSearch1, setplantSearch1] = useState("");
  const [plantSearch2, setplantSearch2] = useState("");
  const [plantSearchedfiltered, setplantSearchedfiltered] = useState([]);
  const plantRef = useRef();

  useEffect(() => {
    if (plantSearch1 !== "" || plantSearch2 !== "") {
      let new_data = allOrderSupplyingPlants;
      new_data = new_data.filter((ele, j) => {
        if (
          (plantSearch1 !== "" &&
            ele["WERKS"].toLowerCase().includes(plantSearch1)) ||
          (plantSearch2 !== "" &&
            ele["NAME1"].toLowerCase().includes(plantSearch2))
        ) {
          return ele;
        }
      });
      setplantSearchedfiltered(new_data);
    }
  }, [plantSearch1, plantSearch2]);

  let openPlantSearchModal = () => {
    setIsPlantModalVisible(true);
    setplantSearch1("");
    setplantSearch2("");
    setplantSearchedfiltered(allOrderSupplyingPlants);
    // console.log(allOrderSupplyingPlants);
  };

  useEffect(() => {
    if (isPlantModalVisible) {
      plantRef.current.focus();
    }
  }, [isPlantModalVisible]);

  //++++++++++++++++++++++++++++++++++++++++++++++searchSysytem+++++++++++++++++++++++++++++++++++++++++++++++++++

  const plant = usePlant();

  useEffect(() => {
    if (plant.length > 0) {
      setAllOrderSupplyingPlants(plant);
    }
  }, [plant]);

  //++++++++++++++++++++++++++++++++++++++++++++++++++++++++++fetching delivery list++++++++++++++++++++++++++++++++++++++
  let fetchDeliveryList = () => {
    if (
      moment(watchAllFields.invoice_date_to).diff(
        watchAllFields.invoice_date_from,
        "days"
      ) > 31
    ) {
      Swal.fire({
        title: "Error",
        text: "Date should be within 31 days",
        icon: "error",
      });
    } else if (
      moment(watchAllFields.invoice_date_to).diff(
        watchAllFields.invoice_date_from,
        "days"
      ) < 0
    ) {
      Swal.fire({
        title: "Error",
        text: "Date should be within 31 days",
        icon: "error",
      });
    } else {
      props.loading(true);
      let body = {
        lv_user: localStorage.getItem("user_code"),
      };
      if (
        Object.keys(selectedCustomerFrom).length > 0 &&
        Object.keys(selectedCustomerTo).length > 0
      ) {
        body["customer_from"] = selectedCustomerFrom?.KUNNR;
        body["customer_to"] = selectedCustomerTo?.KUNNR;
      }
      if (watchAllFields.invoice_date_from && watchAllFields.invoice_date_to) {
        body["invoice_date_from"] = moment(
          watchAllFields.invoice_date_from
        ).format("YYYYMMDD");
        body["invoice_date_to"] = moment(watchAllFields.invoice_date_to).format(
          "YYYYMMDD"
        );
      }
      if (watchAllFields.invoice_from) {
        body["invoice_from"] = watchAllFields.invoice_from;
        body["invoice_to"] = watchAllFields.invoice_from;
      }
      if (watchAllFields.invoice_from && watchAllFields.invoice_to) {
        body["invoice_from"] = watchAllFields.invoice_from;
        body["invoice_to"] = watchAllFields.invoice_to;
      }
      if (Object.keys(plantValue).length > 0) {
        body["plant"] = plantValue?.value;
      }

      http
        .post(apis.INVOICE_LIST, body)
        .then((result) => {
          if (result.data.status) {
            setInvoiceData(result.data.result);

            let data = result.data.result;

            if (data?.length > 0) {
              let x = data.slice(0, perPage);

              let TOTAL_QTY = 0;
              let NET_AMT = 0;
              let TAX_AMT = 0;
              let TOTAL_AMT = 0;
              let Freight_Change = 0;

              x.forEach((resp) => {
                TOTAL_QTY += +resp.FKIMG;
                NET_AMT += +resp.NETWR;
                TAX_AMT += +resp.MWSBP;
                TOTAL_AMT += +resp.TOTAL_AMT;
                Freight_Change += +resp.FREIGHT;
              });

              setPageFinanceList({
                TOTAL_QTY: TOTAL_QTY,
                NET_AMT: NET_AMT,
                TAX_AMT: TAX_AMT,
                TOTAL_AMT: TOTAL_AMT,
                FREIGHT: Freight_Change,
              });
            }
          } else {
            let msg = result.data.msg;
            if (msg.toLowerCase().startsWith("server")) {
              return null;
            } else {
              Swal.fire({
                title: "Error!",
                text: result.data.msg,
                icon: "error",
                confirmButtonText: "Ok",
              });
            }
          }
        })
        .catch((err) => {
          console.log(err);
          fetchDeliveryList();
        })
        .finally(() => {
          props.loading(false);
        });
    }
  };

  useEffect(() => {
    // fetchDeliveryList();
  }, []);

  var pageChange = ({ selected }) => {
    setPaginatedInvoiceData(
      invoiceData.slice(selected * perPage, perPage * (selected + 1))
    );

    let x = invoiceData.slice(selected * perPage, perPage * (selected + 1));

    let TOTAL_QTY = 0;
    let NET_AMT = 0;
    let TAX_AMT = 0;
    let TOTAL_AMT = 0;
    let Freight_Change = 0;

    x.forEach((resp) => {
      TOTAL_QTY += +resp.FKIMG;
      NET_AMT += +resp.NETWR;
      TAX_AMT += +resp.MWSBP;
      TOTAL_AMT += +resp.TOTAL_AMT;
      Freight_Change += +resp.FREIGHT;
    });

    setPageFinanceList({
      TOTAL_QTY: TOTAL_QTY,
      NET_AMT: NET_AMT,
      TAX_AMT: TAX_AMT,
      TOTAL_AMT: TOTAL_AMT,
      FREIGHT: Freight_Change,
    });

    let selectAll = document.querySelectorAll(".all-checkbox");
    selectAll.forEach((item) => {
      item.checked = false;
    });
    selectAllInvoice(false);
  };

  useEffect(() => {
    console.log(paginatedInvoiceData);
  }, [paginatedInvoiceData]);

  useEffect(() => {
    pageChange({ selected: 0 });
  }, [perPage, invoiceData]);
  //++++++++++++++++++++++++++++++++++++++++++++++++++++++++++fetching delivery list end++++++++++++++++++++++++++++++++++++++

  let onSubmit = (data) => {
    fetchDeliveryList();
  };

  //+++++++++++++++++++++++++++++++++++++++++++++++++++++++++other handlers++++++++++++++++++++++++++++++++++++++++++++++
  useEffect(() => {
    if (watchAllFields.customer_to) {
      triggerValidation("customer_to");
    }
  }, [watchAllFields.customer_from]);

  useEffect(() => {
    if (watchAllFields.customer_from) {
      triggerValidation("customer_from");
    }
  }, [watchAllFields.customer_to]);

  useEffect(() => {
    triggerValidation("invoice_date_to");
  }, [watchAllFields.invoice_date_from]);

  useEffect(() => {
    triggerValidation("invoice_date_from");
  }, [watchAllFields.invoice_date_to]);

  useEffect(() => {
    if (watchAllFields.invoice_to) {
      triggerValidation("invoice_to");
    }
  }, [watchAllFields.invoice_from]);

  useEffect(() => {
    if (watchAllFields.invoice_from) {
      triggerValidation("invoice_from");
    }
  }, [watchAllFields.invoice_to]);

  useEffect(() => {
    if (watchAllFields.plant) {
      triggerValidation("plant");
    }
  }, [watchAllFields.plant]);

  let setWithValidationTrigger = (key, value) => {
    setValue(key, value);
    triggerValidation(key);
  };
  //+++++++++++++++++++++++++++++++++++++++++++++++++++++++++other handlers end++++++++++++++++++++++++++++++++++++++++++++++
  //   console.log(watchAllFields.invoice_date_from);

  //+++++++++++++++++++++++++++++++++++++++++++++++++++++validation for invoice date+++++++++++++++++++++++++++++++++++++++++
  let today_invoice = new Date().getTime();
  let today_moment = moment(today_invoice).format("YYYY-MM-DD");
  let invoiceFrom = new Date(watchAllFields.invoice_date_from);
  let timestamp_max_invoice_to = invoiceFrom.setDate(
    invoiceFrom.getDate() + 31
  );
  let max_invoice_to = "";

  //   console.log(timestamp_max_invoice_to, today_invoice);

  if (timestamp_max_invoice_to > today_invoice) {
    max_invoice_to = moment(today_invoice).format("YYYY-MM-DD");
  } else {
    max_invoice_to = moment(timestamp_max_invoice_to).format("YYYY-MM-DD");
  }
  //+++++++++++++++++++++++++++++++++++++++++++++++++++++validation for invoice date end+++++++++++++++++++++++++++++++++++++++++

  //+++++++++++++++++++++++++++++++++++++++++++++++++++++setting customer's TO and FROM++++++++++++++++++++++++++++++++++++++++++
  let setSearchedValueFrom = (value, value2) => {
    setValue("customer_from", value);
    setSelectedCustomerFrom({ KUNNR: value });
    value = value?.replace(/^0+/, "");
    setval({ value: value, label: value + "-" + value2 });
  };

  let setSearchedValueTo = (value, value2) => {
    setValue("customer_to", value);
    setSelectedCustomerTo({ KUNNR: value });
    value = value?.replace(/^0+/, "");
    setValTo({ value: value, label: value + "-" + value2 });
  };
  //+++++++++++++++++++++++++++++++++++++++++++++++++++++setting customer's TO and FROM end++++++++++++++++++++++++++++++++++++++

  // useEffect(()=>{
  //   console.log(selectedInvoice)
  // },[selectedInvoice])

  let setSelectedInvoiceFunc = (value) => {
    if (value === selectedInvoice) {
      setSelectedInvoice(null);
    } else {
      setSelectedInvoice(value);
    }
  };

  let printInvoice = (selectedInvoice, IM_DS_FLAG = "D") => {
    console.log("printing");
    props.loading(true);
    http
      .post(apis.PRINT_INVOICE, {
        invoice_number: selectedInvoice,
        IM_DS_FLAG: IM_DS_FLAG,
        IM_LOGIN_ID: localStorage.getItem("user_code"),
      })
      .then((response) => {
        if (response.data.status === false) {
          Swal.fire({
            title: "Error!",
            text: response.data.data.ET_RETURN[0].MESSAGE,
            icon: "error",
            confirmButtonText: "Ok",
          });
        } else {
          //setPdfString(response.data.data)
          let pdfWindow = window.open("");
          // pdfWindow.document.write(
          //     "<iframe width='100%' height='100%' src='data:application/pdf;base64, " +
          //     encodeURI(response.data.data) + "'></iframe>"
          // )

          pdfWindow.document.write(
            "<html><body><center>" +
              '<a title="Download File" style="font-family: \'Verdana\';color: #333;text-decoration: none;font-weight: 600;" download="File.PDF" href="data:application/pdf;base64,' +
              encodeURI(response.data.data) +
              '">Download File</a>' +
              "</center><br>" +
              '<object width=100% height=100% type="application/pdf" data="data:application/pdf;base64,' +
              encodeURI(response.data.data) +
              '">' +
              '<embed type="application/pdf" src="data:application/pdf;base64,' +
              encodeURI(response.data.data) +
              '" id="embed_pdf"></embed>' +
              "</object></body></html>"
          );
        }
      })
      .catch((err) => {
        console.log(err);
        // printInvoice();
      })
      .finally(() => {
        props.loading(false);
      });
  };

  let downloadInvoice = (selectedInvoice, IM_DS_FLAG = "D") => {
    props.loading(true);
    http
      .post(apis.PRINT_INVOICE, {
        invoice_number: selectedInvoice,
        IM_DS_FLAG: IM_DS_FLAG,
        IM_LOGIN_ID: localStorage.getItem("user_code"),
      })
      .then((response) => {
        if (response.data.status === false) {
          Swal.fire({
            title: "Error!",
            text: response.data.data.ET_RETURN[0].MESSAGE,
            icon: "error",
            confirmButtonText: "Ok",
          });
        } else {
          console.log("Hello I am Download File");
          const downloadLink = document.createElement("a");
          const fileName = `invoice-${selectedInvoice}.pdf`;
          downloadLink.href = `data:application/pdf;base64, ${encodeURI(
            response.data.data
          )}`;
          downloadLink.download = fileName;
          downloadLink.click();
          downloadLink.remove();
        }
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        props.loading(false);
      });
  };

  // Headers
  let headers = [
    { label: "Status", key: "STATUS" },
    { label: "Sales Organization", key: "VKORG" },
    { label: "Billing Type", key: "FKART" },
    { label: "Invoice", key: "VBELN" },
    { label: "Inv. Date", key: "FKDAT" },
    { label: "Customer", key: "KUNRG" },
    { label: "Customer Name", key: "NAME1" },
    { label: "Delivery", key: "XBLNR" },
    { label: "Material", key: "MATNR" },
    { label: "Mat Desc.", key: "ARKTX" },
    { label: "Total Qty.", key: "FKIMG" },
    { label: "Net Amount", key: "NETWR" },
    { label: "Tax Amount", key: "MWSBP" },
    { label: "Total Amount", key: "TOTAL_AMT" },
    { label: "Freight Charges", key: "FREIGHT" },
    { label: "Inco Term1", key: "INCO1" },
    { label: "Plant", key: "WERKS" },
    { label: "E Invoice Status", key: "EINV_STATUS" },
  ];

  // Fix date Format
  useEffect(() => {
    let data = invoiceData;
    for (let i = 0; i < data.length; i++) {
      data[i].FKDAT = moment(data[i].FKDAT, "YYYYMMDD").format("DD-MM-YYYY");
      data[i].KUNRG = data[i].KUNRG.replace(/^0+/, "");
      data[i].MATNR = data[i].MATNR.replace(/^0+/, "");
    }
  }, [invoiceData]);

  // Customer New Logic

  const [value, setval] = useState([]);
  const [valueTo, setValTo] = useState([]);
  const [selectedCustomerFrom, setSelectedCustomerFrom] = useState([]);
  const [selectedCustomerTo, setSelectedCustomerTo] = useState([]);

  const loadOptionsFrom = async (inputValue) => {
    if (inputValue !== "" && inputValue.length > 4) {
      return await fetchCustomerNumber(inputValue, "KUNNR", "NAME1");
    }
  };

  const loadOptionsTo = async (inputValue) => {
    console.log("Hello", inputValue);
    if (inputValue !== "" && inputValue.length > 4) {
      return await fetchCustomerNumber(inputValue, "KUNNR", "NAME1");
    }
  };

  const handleInputChangeFrom = (newValue) => {
    const inputValue = newValue.replace(/\W/g, "");
    return inputValue;
  };

  const handleChangeFrom = (value2) => {
    setSelectedCustomerFrom({ KUNNR: value2?.value });
    setval({ value: value2?.value, label: value2?.label });
  };

  const handleInputChangeTo = (newValue) => {
    const inputValue = newValue.replace(/\W/g, "");
    return inputValue;
  };

  const handleChangeTo = (value2) => {
    setSelectedCustomerTo({ KUNNR: value2?.value });
    setValTo({ value: value2?.value, label: value2?.label });
  };

  // Plant

  const [plantOptions, setPlantOptions] = useState([]);
  const [plantValue, setPlantValue] = useState([]);

  useEffect(() => {
    setPlantOptions(filterOptions(allOrderSupplyingPlants, "WERKS", "NAME1"));
  }, [allOrderSupplyingPlants]);

  // Common Handle Change
  const commonHandleChange = (data, filedName) => {
    console.log(data, filedName);
    if (filedName === "PLANT") {
      setPlantValue(data);
    }
  };

  useEffect(() => {
    if (value.value > valueTo.value) {
      Swal.fire({
        title: "Customer From has to be smaller than Customer To",
        icon: "error",
      });
      // setval([]);
      setValTo([]);
    }
  }, [valueTo, value]);

  const isMonthEnd = () => {
    let today = moment().format("DD");

    if (moment().endOf("month").format("DD") === "31") {
      if (today === "31" || today === "30") {
        return false;
      }
    } else if (moment().endOf("month").format("DD") === "30") {
      if (today === "30" || today === "29") {
        return false;
      }
    } else if (moment().endOf("month").format("DD") === "28") {
      if (today === "28" || today === "27") {
        return false;
      }
    } else if (moment().endOf("month").format("DD") === "29") {
      if (today === "29" || today === "28") {
        return false;
      }
    }
    return true;
  };

  const selectMultipleInvoice = (e, data) => {
    // maximum 25 will be selected
    if (e.target.checked) {
      let max = 25;
      if (multipleInvoice.length < max) {
        // deselect all the radio and setPrintNumber to ""
        let allRadio = document.querySelectorAll(".finance-radio");
        allRadio.forEach((item) => {
          item.checked = false;
        });
        setPrintNumber("");

        setMultipleInvoice([...multipleInvoice, data]);
      } else {
        Swal.fire({
          title: "Error",
          text: `Maximum ${max} Invoices can be selected`,
          icon: "error",
        });
      }
    } else {
      setMultipleInvoice(
        multipleInvoice.filter((item) => item.VBELN !== e.target.value)
      );
    }
  };

  const downloadMultipleInvoice = () => {
    console.log(multipleInvoice);
    props.loading(true);
    http
      .post(apis.COMMON_POST_WITH_FM_NAME, {
        fm_name: "ZRFC_INVOICE_PRINT_PDF_M",
        params: {
          IM_DATA: multipleInvoice.map((ele) => {
            return {
              IM_INVOICE: ele.VBELN,
              IM_DS_FLAG: "N",
              I_FLAG: "",
              IM_LOGIN_ID: localStorage.getItem("user_code"),
            };
          }),
        },
      })
      .then((res) => {
        console.log(res);
        if (res.data.status === false) {
          Swal.fire({
            title: "Error!",
            text: "Download not complete or error found. Please try again",
            icon: "error",
            confirmButtonText: "Ok",
          });
        } else {
          let data = res.data.result.EX_DATA_RETURN;

          let i = 0;
          data.forEach((ele) => {
            setTimeout(function () {
              downloadPDF(ele);
            }, i++ * 500);
          });
          let allCheckbox = document.querySelectorAll(".invoice-checkbox");
          allCheckbox.forEach((item) => {
            item.checked = false;
          });
          let selectAll = document.querySelectorAll(".all-checkbox");
          selectAll.forEach((item) => {
            item.checked = false;
          });

          setMultipleInvoice([]);
        }
      })
      .finally(() => {
        props.loading(false);
      });
  };

  const downloadPDF = (data) => {
    const downloadLink = document.createElement("a");
    const fileName = `invoice-${data.EX_INVOICE}.pdf`;
    downloadLink.href = `data:application/pdf;base64, ${encodeURI(
      data.EX_BASE64
    )}`;
    downloadLink.download = fileName;
    downloadLink.click();
    downloadLink.remove();
  };

  // select all multiple invoice
  const selectAllInvoice = (e) => {
    if (e) {
      let allCheckbox = document.querySelectorAll(".invoice-checkbox");
      allCheckbox.forEach((item) => {
        item.checked = true;
      });
      let allRadio = document.querySelectorAll(".finance-radio");
      allRadio.forEach((item) => {
        item.checked = false;
      });
      setPrintNumber("");
      setMultipleInvoice(paginatedInvoiceData);
    } else {
      let allCheckbox = document.querySelectorAll(".invoice-checkbox");
      allCheckbox.forEach((item) => {
        item.checked = false;
      });
      setMultipleInvoice([]);
    }
  };

  return (
    <>
      <div>
        {/* Filter Section Open */}

        <form className="filter-section" onSubmit={handleSubmit(onSubmit)}>
          <div className="row">
            <div className="col">
              <div className="row">
                <div className="col-3">
                  <label>Customer#</label>
                </div>
                <div className="col-4">
                  <i
                    className="far fa-clone click-icons"
                    onClick={() => {
                      setSearchCustomerModalVisbleFrom(true);
                    }}
                  ></i>
                  <AsyncSelect
                    classNamePrefix="react-select"
                    cacheOptions
                    loadOptions={loadOptionsFrom}
                    defaultOptions
                    onInputChange={handleInputChangeFrom}
                    value={value}
                    placeholder={"From"}
                    ref={register}
                    // name={"SOLD_TO_PARTY"}
                    onChange={handleChangeFrom}
                  />
                  {/* <input
                    type="number"
                    placeholder="From"
                    ref={register({
                      validate: (value) => {
                        let ans = false;
                        if (watchAllFields.customer_to) {
                          if (
                            parseInt(value) <=
                            parseInt(watchAllFields.customer_to)
                          ) {
                            ans = true;
                          }
                        } else {
                          ans = true;
                        }
                        return ans;
                      },
                    })}
                    name="customer_from"
                    onFocus={() => setSearchCustomerModalVisbleFrom(true)}
                    // onChange={(e) => {
                    //   setSearchedValueFrom(e.target.value);
                    // }}
                    readOnly
                  /> */}
                  {errors.customer_from && (
                    <p className="form-error">Please put a valid value</p>
                  )}
                </div>
                <div className="column-divider"></div>
                <div className="col-4">
                  <i
                    className="far fa-clone click-icons"
                    onClick={() => {
                      setSearchCustomerModalVisbleTo(true);
                    }}
                  ></i>
                  <AsyncSelect
                    classNamePrefix="react-select"
                    cacheOptions
                    loadOptions={loadOptionsTo}
                    defaultOptions
                    onInputChange={handleInputChangeTo}
                    value={valueTo}
                    placeholder={"To"}
                    // name={"SOLD_TO_PARTY"}
                    onChange={handleChangeTo}
                  />
                  {/* <input
                    type="number"
                    placeholder="To"
                    ref={register({
                      validate: (value) => {
                        let ans = false;
                        if (watchAllFields.customer_from) {
                          if (
                            parseInt(value) >=
                            parseInt(watchAllFields.customer_from)
                          ) {
                            ans = true;
                          }
                        } else {
                          ans = true;
                        }
                        return ans;
                      },
                    })}
                    name="customer_to"
                    onFocus={() => setSearchCustomerModalVisbleFrom(true)}
                    // onChange={(e) => {
                    //   setSearchedValueTo(e.target.value);
                    // }}
                    readOnly
                  /> */}
                  {errors.customer_to && (
                    <p className="form-error">Please put a valid value</p>
                  )}
                </div>
              </div>
            </div>
            <div className="col">
              <div className="row">
                <div className="col-3">
                  <label className="float-right">
                    Invoice Date From<span>*</span>
                  </label>
                </div>
                <div className="col-3">
                  <input
                    type="date"
                    placeholder="From"
                    name="invoice_date_from"
                    max={today_moment}
                    ref={register({
                      validate: (value) => {
                        let ans = false;
                        if (watchAllFields.invoice_date_to) {
                          if (
                            moment(watchAllFields.invoice_date_from).isBefore(
                              moment(watchAllFields.invoice_date_to)
                            ) ||
                            moment(watchAllFields.invoice_date_from).isSame(
                              moment(watchAllFields.invoice_date_to)
                            )
                          ) {
                            ans = true;
                          }
                        } else {
                          ans = true;
                        }
                        return ans;
                      },
                    })}
                  />
                  {errors.invoice_date_from && (
                    <p className="form-error">Please put a valid value</p>
                  )}
                </div>
                <div className="col-3">
                  <label className="float-right">
                    Invoice Date To<span>*</span>
                  </label>
                </div>
                <div className="col-3">
                  <input
                    type="date"
                    name="invoice_date_to"
                    max={max_invoice_to}
                    ref={register({
                      validate: (value) => {
                        let ans = false;
                        if (watchAllFields.invoice_date_from) {
                          if (
                            moment(watchAllFields.invoice_date_from).isBefore(
                              moment(watchAllFields.invoice_date_to)
                            ) ||
                            moment(watchAllFields.invoice_date_from).isSame(
                              moment(watchAllFields.invoice_date_to)
                            )
                          ) {
                            ans = true;
                          }
                        } else {
                          ans = true;
                        }
                        return ans;
                      },
                    })}
                  />
                  {errors.invoice_date_to && (
                    <p className="form-error">Please put a valid value</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col">
              <div className="row">
                <div className="col-3">
                  <label>Invoice#</label>
                </div>
                <div className="col-4">
                  <input
                    type="number"
                    placeholder="From"
                    ref={register({
                      validate: (value) => {
                        let ans = false;
                        if (watchAllFields.invoice_to) {
                          if (
                            parseInt(value) <=
                            parseInt(watchAllFields.invoice_to)
                          ) {
                            ans = true;
                          }
                        } else {
                          ans = true;
                        }
                        return ans;
                      },
                    })}
                    name="invoice_from"
                  />
                  {errors.invoice_from && (
                    <p className="form-error">Please put a valid value</p>
                  )}
                </div>
                <div className="column-divider"></div>
                <div className="col-4">
                  <input
                    type="number"
                    placeholder="To"
                    ref={register({
                      validate: (value) => {
                        let ans = true;
                        if (watchAllFields.invoice_from) {
                          if (
                            parseInt(value) >=
                            parseInt(watchAllFields.invoice_from)
                          ) {
                            ans = true;
                          }
                        } else {
                          ans = true;
                        }
                        return ans;
                      },
                    })}
                    name="invoice_to"
                  />
                  {errors.invoice_to && (
                    <p className="form-error">Please put a valid value</p>
                  )}
                </div>
              </div>
            </div>
            <div className="col" />
          </div>

          <div className="row">
            <div className="col">
              <div className="row">
                <div className="col-3">
                  <label>
                    Plant<span>*</span>
                  </label>
                </div>
                <div className="col-9">
                  <i
                    className="far fa-clone click-icons"
                    onClick={() => {
                      openPlantSearchModal();
                    }}
                  ></i>

                  <Select
                    classNamePrefix="react-select"
                    value={Object.keys(plantValue).length > 0 ? plantValue : []}
                    options={plantOptions}
                    name="PLANT"
                    ref={register}
                    cacheOptions
                    defaultOptions
                    placeholder={"Plant"}
                    onChange={(e) => commonHandleChange(e, "PLANT")}
                  />
                  {/* <input
                    type="text"
                    ref={register({
                      validate: (value) => {
                        let ans = false;
                        if (watchAllFields.plant) {
                          ans = true;
                        }
                        return ans;
                      },
                    })}
                    name="plant"
                    onChange={(e) => {
                      setSelectedPlant({
                        WERKS: e.target.value,
                      });
                      setWithValidationTrigger("plant", e.target.value);
                    }}
                    readOnly
                  /> */}
                  {errors.plant && (
                    <p className="form-error">Please Select a Plant</p>
                  )}
                </div>
              </div>
            </div>

            <div className="col">
              <div className="row">
                <div className="col-6">
                  <button
                    className="search-button float-right"
                    style={{ backgroundColor: "red" }}
                  >
                    <i
                      className="fa fa-times icons-button"
                      onClick={() => window.location.reload()}
                    ></i>
                  </button>
                  {!Object.keys(plantValue).length > 0 ? (
                    <div
                      style={{ cursor: "pointer" }}
                      className="search-button float-right"
                      onClick={() =>
                        Swal.fire({
                          title: "Fill all the mandatory fields",
                          icon: "error",
                        })
                      }
                    >
                      <i className="fas fa-search icons-button"></i>
                    </div>
                  ) : (
                    <button type="submit" className="search-button float-right">
                      <i className="fas fa-search icons-button"></i>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </form>

        {/* Filter Section Close */}

        {/* Table Filter Open */}

        <div className="background">
          <div className="table-filter">
            <div className="filter-div">
              <div className="row">
                <div className="col">
                  <div className="row">
                    <div className="col">
                      {/* <Link className="goods-button float-right" style={{ backgroundColor: "#59A948" }} to="/dashboard/finance/invoice-create">Form Entry</Link> */}

                      {/* <button
                        className="goods-button float-left"
                        style={{ backgroundColor: "#59A948" }}
                        onClick={() => {
                          if (multipleInvoice.length === 0) {
                            selectAllInvoice(true);
                          } else {
                            selectAllInvoice(false);
                          }
                        }}
                      >
                        {multipleInvoice.length === 0
                          ? "Select All"
                          : "Deselect All"}
                      </button> */}

                      {invoiceData.length > 0 ? (
                        <CSVLink
                          className="goods-button float-right"
                          style={{ backgroundColor: "#0F6FA2" }}
                          data={invoiceData}
                          headers={headers}
                          filename={`Invoice List- ${getValues(
                            "plant"
                          )} - From:- ${getValues(
                            "invoice_date_from"
                          )} to ${getValues("invoice_date_to")}.csv`}
                        >
                          Export to csv
                        </CSVLink>
                      ) : (
                        <button
                          className="goods-button float-right"
                          style={{ backgroundColor: "#0F6FA2" }}
                        >
                          Export to CSV
                        </button>
                      )}
                      {/* {multipleInvoice.length > 0 &&
                        userList.includes(
                          localStorage.getItem("user_code")
                        ) && (
                          <button
                            className="goods-button float-right"
                            style={{ backgroundColor: "#0F6FA2" }}
                            onClick={() => downloadMultipleInvoice()}
                          >
                            Multiple Download
                          </button>
                        )} */}

                      <>
                        {printNumber ? (
                          isDigitalSign ? (
                            <Button
                              onClick={() => printInvoice(printNumber, "N")}
                              className="goods-button float-right float-right"
                              style={{ backgroundColor: "#0F6FA2" }}
                              to="#"
                            >
                              View without DS
                            </Button>
                          ) : (
                            <>
                              {console.log(!isMonthEnd())}
                              {isMonthEnd() && (
                                <Button
                                  onClick={() => printInvoice(printNumber)}
                                  className="goods-button float-right"
                                  style={{ backgroundColor: "#0F6FA2" }}
                                  to="#"
                                >
                                  View with DS
                                </Button>
                              )}
                              <Button
                                onClick={() => printInvoice(printNumber, "N")}
                                className="goods-button float-right"
                                style={{ backgroundColor: "#0F6FA2" }}
                                to="#"
                              >
                                View without DS
                              </Button>
                            </>
                          )
                        ) : null}

                        {printNumber ? (
                          isDigitalSign ? (
                            <Button
                              onClick={() => downloadInvoice(printNumber, "N")}
                              className="goods-button float-right"
                              style={{ backgroundColor: "#0F6FA2" }}
                              to="#"
                            >
                              Download without DS
                            </Button>
                          ) : (
                            <>
                              {isMonthEnd() && (
                                <Button
                                  onClick={() => downloadInvoice(printNumber)}
                                  className="goods-button float-right"
                                  style={{ backgroundColor: "#0F6FA2" }}
                                  to="#"
                                >
                                  Download with DS
                                </Button>
                              )}
                              <Button
                                onClick={() =>
                                  downloadInvoice(printNumber, "N")
                                }
                                className="goods-button float-right"
                                style={{ backgroundColor: "#0F6FA2" }}
                                to="#"
                              >
                                Download without DS
                              </Button>
                            </>
                          )
                        ) : null}
                      </>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Table Div Open */}

            <div className="table-div">
              <div className="row">
                <table className="table">
                  <thead>
                    <tr>
                      {/* <th scope="col" className="table-sticky-vertical"></th> */}
                      <th scope="col" className="table-sticky-vertical">
                        Select
                      </th>
                      <th
                        scope="col"
                        className="table-sticky-vertical"
                        style={{ minWidth: "70px" }}
                      >
                        Status
                      </th>
                      <th
                        className="table-sticky-horizontal table-sticky-vertical"
                        style={{
                          minWidth: "160px",
                          left: "0px",
                          zIndex: "15",
                        }}
                        scope="col"
                      >
                        Sales Organization
                      </th>
                      <th
                        scope="col"
                        className="table-sticky-vertical table-sticky-horizontal"
                        style={{
                          left: "160px",
                          minWidth: "160px",
                          zIndex: "15",
                        }}
                      >
                        Billing Type
                      </th>
                      <th
                        scope="col"
                        className="table-sticky-vertical table-sticky-horizontal"
                        style={{
                          left: "320px",
                          minWidth: "160px",
                          zIndex: "15",
                        }}
                      >
                        Invoice
                      </th>
                      <th
                        scope="col"
                        className="table-sticky-vertical table-sticky-horizontal"
                        style={{
                          minWidth: "150px",
                          left: "460px",
                          zIndex: "15",
                        }}
                      >
                        Inv. Date
                      </th>
                      <th
                        scope="col"
                        className="table-sticky-vertical"
                        style={{ minWidth: "" }}
                      >
                        Customer
                      </th>
                      <th
                        scope="col"
                        className="table-sticky-vertical"
                        style={{ minWidth: "" }}
                      >
                        Customer Name
                      </th>
                      <th
                        scope="col"
                        className="table-sticky-vertical"
                        style={{ minWidth: "" }}
                      >
                        Delivery
                      </th>
                      <th
                        scope="col"
                        className="table-sticky-vertical"
                        style={{ minWidth: "" }}
                      >
                        Material
                      </th>
                      <th
                        scope="col"
                        className="table-sticky-vertical"
                        style={{ minWidth: "230px" }}
                      >
                        Mat Desc.
                      </th>
                      <th
                        scope="col"
                        className="table-sticky-vertical"
                        style={{ minWidth: "" }}
                      >
                        Total Qty
                      </th>
                      <th
                        scope="col"
                        className="table-sticky-vertical"
                        style={{ minWidth: "" }}
                      >
                        Net Amount
                      </th>
                      <th
                        scope="col"
                        className="table-sticky-vertical"
                        style={{ minWidth: "" }}
                      >
                        Tax Amount
                      </th>
                      <th
                        scope="col"
                        className="table-sticky-vertical"
                        style={{ minWidth: "" }}
                      >
                        Total Amount
                      </th>
                      <th
                        scope="col"
                        className="table-sticky-vertical"
                        style={{ minWidth: "" }}
                      >
                        Freight Charges
                      </th>
                      <th
                        scope="col"
                        className="table-sticky-vertical"
                        style={{ minWidth: "" }}
                      >
                        Inco Terms1
                      </th>
                      <th
                        scope="col"
                        className="table-sticky-vertical"
                        style={{ minWidth: "" }}
                      >
                        Plant
                      </th>
                      <th
                        scope="col"
                        className="table-sticky-vertical"
                        style={{ minWidth: "" }}
                      >
                        E Invoice Status
                      </th>
                      <th
                        scope="col"
                        style={{ minWidth: "500px " }}
                        className="table-sticky-vertical"
                      >
                        View
                      </th>
                      <th
                        scope="col"
                        style={{ minWidth: "500px " }}
                        className="table-sticky-vertical"
                      >
                        Download
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedInvoiceData.map((ele, i) => (
                      <tr key={ele.VBELN}>
                        {/* <td>
                          <input
                            type="checkbox"
                            checked={
                              Object.keys(
                                multipleInvoice.find(
                                  (item) => item.VBELN === ele.VBELN
                                ) ?? {}
                              ).length !== 0
                            }
                            onChange={(e) => {
                              selectMultipleInvoice(e, ele);
                            }}
                            name="invoice"
                            className="invoice-checkbox"
                            value={ele.VBELN}
                          />
                        </td> */}

                        <td>
                          <input
                            name="print"
                            type="radio"
                            className="finance-radio"
                            onChange={() => {
                              setIsDigitalSign(
                                moment(ele.FKDAT, "DD-MM-YYYY").isBefore(
                                  moment("1-10-2021", "DD-MM-YYYY")
                                )
                              );
                              setPrintNumber(ele.VBELN);
                            }}
                            disabled={multipleInvoice.length !== 0}
                          />
                        </td>
                        <>
                          {ele.STATUS === "A" ? (
                            <td>
                              <button className="badge-button danger"></button>
                            </td>
                          ) : null}
                          {ele.STATUS === "C" ? (
                            <td>
                              <button className="badge-button success"></button>
                            </td>
                          ) : null}
                          {ele.STATUS === "N" ? (
                            <td>
                              <button className="badge-button primary"></button>
                            </td>
                          ) : null}
                        </>

                        <td
                          className="table-sticky-horizontal"
                          style={{
                            left: "0px",
                            zIndex: "8",
                            minWidth: "160px",
                          }}
                        >
                          {ele.VKORG}
                        </td>
                        <td
                          className="table-sticky-horizontal"
                          style={{
                            left: "160px",
                            zIndex: "8",
                            minWidth: "160px",
                          }}
                        >
                          {ele.FKART}
                        </td>

                        <td
                          className="table-sticky-horizontal"
                          style={{
                            left: "300px",
                            zIndex: "8",
                            minWidth: "160px",
                          }}
                        >
                          {ele.VBELN}
                        </td>
                        <td
                          className="table-sticky-horizontal"
                          style={{ left: "450px", zIndex: "8" }}
                        >
                          {ele.FKDAT}
                        </td>
                        <td>{ele.KUNRG.replace(/^0+/, "")}</td>
                        <td>{ele.NAME1}</td>
                        <td>{ele.XBLNR}</td>
                        <td>{ele.MATNR.replace(/^0+/, "")}</td>
                        <td>{ele.ARKTX}</td>
                        <td>{ele.FKIMG}</td>
                        <td>{ele.NETWR}</td>
                        <td>{ele.MWSBP}</td>
                        <td>{ele.TOTAL_AMT}</td>
                        <td>{ele.FREIGHT}</td>
                        <td>{ele.INCO1}</td>
                        <td>{ele.WERKS}</td>
                        <td>{ele.EINV_STATUS}</td>
                        <td>
                          {moment(ele.FKDAT, "DD-MM-YYYY").isBefore(
                            moment("1-10-2021", "DD-MM-YYYY")
                          ) ? (
                            <Button
                              onClick={() => printInvoice(ele.VBELN, "N")}
                              className="goods-button"
                              style={{ backgroundColor: "#0F6FA2" }}
                              to="#"
                            >
                              View without DS
                            </Button>
                          ) : (
                            <>
                              <Button
                                onClick={() => printInvoice(ele.VBELN)}
                                className="goods-button"
                                style={{ backgroundColor: "#0F6FA2" }}
                                to="#"
                              >
                                View with DS
                              </Button>
                              <Button
                                onClick={() => printInvoice(ele.VBELN, "N")}
                                className="goods-button"
                                style={{ backgroundColor: "#0F6FA2" }}
                                to="#"
                              >
                                View without DS
                              </Button>
                            </>
                          )}
                        </td>
                        <td>
                          {moment(ele.FKDAT, "DD-MM-YYYY").isBefore(
                            moment("1-10-2021", "DD-MM-YYYY")
                          ) ? (
                            <Button
                              onClick={() => downloadInvoice(ele.VBELN, "N")}
                              className="goods-button"
                              style={{ backgroundColor: "#0F6FA2" }}
                              to="#"
                            >
                              Download without DS
                            </Button>
                          ) : (
                            <>
                              <Button
                                onClick={() => downloadInvoice(ele.VBELN, "D")}
                                className="goods-button"
                                style={{ backgroundColor: "#0F6FA2" }}
                                to="#"
                              >
                                Download with DS
                              </Button>
                              <Button
                                onClick={() => downloadInvoice(ele.VBELN, "N")}
                                className="goods-button"
                                style={{ backgroundColor: "#0F6FA2" }}
                                to="#"
                              >
                                Download without DS
                              </Button>
                            </>
                          )}
                          {/* <Button
                            onClick={() => downloadInvoice(ele.VBELN)}
                            className="goods-button float-right"
                            style={{ backgroundColor: "#0F6FA2" }}
                            to="#"
                          >
                            Download
                          </Button> */}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <div className="row">
          <ReactPaginate
            previousLabel={"prev"}
            nextLabel={"next"}
            breakLabel={"..."}
            breakClassName={"break-me"}
            pageCount={invoiceData.length / perPage}
            marginPagesDisplayed={2}
            pageRangeDisplayed={5}
            onPageChange={pageChange}
            containerClassName={"pagination"}
            subContainerClassName={"pages pagination"}
            activeClassName={"active"}
            initialPage={0}
          />

          <div className="col-1">
            {/* <label className="float-left" style={{ paddingTop: "12px" }}>
              Visible Rows
            </label> */}
          </div>
          <div className="col-1">
            {/* <select
              onChange={(e) => {
                setPerpage(e.target.value);
              }}
              style={{ width: "50px" }}
            >
              <option>10</option>
              <option>20</option>
              <option>50</option>
              <option>100</option>
            </select> */}
          </div>
          <div className="col">
            <label className="badge float-right">
              <button className="badge-button primary"></button>
              Cancelled
            </label>
            <label className="badge float-right">
              <button className="badge-button warning"></button>
              Partially Processed
            </label>
            <label className="badge float-right">
              <button className="badge-button success"></button>
              Closed
            </label>
            <label className="badge float-right">
              <button className="badge-button danger"></button>
              Open
            </label>
          </div>
        </div>

        <div
          className="agregatePageTable"
          style={{
            marginLeft: "30px",
          }}
        >
          {" "}
          Total Quantity: <span>
            {pageFinanceList.TOTAL_QTY.toFixed(2)}
          </span>{" "}
          &emsp; &emsp; Net Amount:{" "}
          <span>{pageFinanceList.NET_AMT.toFixed(2)}</span> &emsp; &emsp; Tax
          Amount: <span>{pageFinanceList.TAX_AMT.toFixed(2)}</span> &emsp;
          &emsp; Total Amount:{" "}
          <span>{pageFinanceList.TOTAL_AMT.toFixed(2)}</span> &emsp; &emsp;
          Freight: <span>{pageFinanceList.FREIGHT.toFixed(2)}</span> &emsp;
          &emsp;
        </div>

        {/* plant modal */}
        <Modal
          show={isPlantModalVisible}
          size="lg"
          centered
          className="modal"
          onHide={() => {
            setIsPlantModalVisible(false);
          }}
        >
          <Modal.Header closeButton>
            <Modal.Title>Select Plant</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div className="input-area-modal">
              Plant Number
              <input
                type="text"
                className="model-input"
                onChange={(e) => {
                  setplantSearch1(e.target.value.toLowerCase());
                }}
                value={plantSearch1}
                ref={plantRef}
              />
              <br />
              Plant Name
              <input
                type="text"
                className="model-input"
                onChange={(e) => {
                  setplantSearch2(e.target.value.toLowerCase());
                }}
                value={plantSearch2}
              />
            </div>
            <div className="modal-div">
              <Table size="sm" className="modal-table">
                <thead className="modal-thead">
                  <tr className="modal-table-tr">
                    <th className="modal-table-th float-center">
                      Plant Number
                    </th>
                    <th className="modal-table-th float-center">Plant Name</th>
                    <th className="modal-table-th float-center">Select</th>
                  </tr>
                </thead>
                <tbody className="modal-table-tbody">
                  {plantSearchedfiltered?.map((row, i) => (
                    <tr className="modal-table-tr" key={i}>
                      <td>{row["WERKS"].replace(/^0+/, "")}</td>
                      <td>{row["NAME1"]}</td>
                      <td className="modal-table-td">
                        <button
                          className="button search-button"
                          onClick={() => {
                            setSelectedPlant(row);
                            setWithValidationTrigger(
                              "plant",
                              row["WERKS"].replace(/^0+/, "") +
                                "-" +
                                row["NAME1"]
                            );
                            setIsPlantModalVisible(false);
                            setPlantValue({
                              value: row?.WERKS,
                              label: row?.WERKS + "-" + row?.NAME1,
                            });
                          }}
                        >
                          Select
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          </Modal.Body>
          <Modal.Footer className="modal-footer">
            <Button
              className="button modal-button"
              onClick={() => setIsPlantModalVisible(false)}
            >
              Close
            </Button>
          </Modal.Footer>
        </Modal>
        {/* plant modal close*/}

        {/* Customer Modal From */}
        {SearchCustomerModalVisbleFrom ? (
          <SearchCustomerFrom
            show={SearchCustomerModalVisbleFrom}
            setSearchedValue={setSearchedValueFrom}
            hideIt={() => setSearchCustomerModalVisbleFrom(false)}
          />
        ) : null}
        {/* Customer Modal From Close */}

        {/* Customer Modal To */}
        {SearchCustomerModalVisbleTo ? (
          <SearchCustomerTo
            show={SearchCustomerModalVisbleTo}
            setSearchedValue={setSearchedValueTo}
            hideIt={() => setSearchCustomerModalVisbleTo(false)}
          />
        ) : null}
        {/* Customer Modal To Close */}
      </div>
    </>
  );
}

const mapStateToProps = (state) => ({
  Auth: state.Auth,
});

export default connect(mapStateToProps, { loading })(InvoiceList);
