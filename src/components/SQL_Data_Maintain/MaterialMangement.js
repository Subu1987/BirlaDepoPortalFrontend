import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import http from "../../services/apicall";
import apis from "../../services/apis";
import { loading } from "../../actions/loadingAction";
import Select from "react-select";
import Swal from "sweetalert2";
import store from "../../store";

export const MaterialManagement = (props) => {
  const [allPlants, setAllPlants] = useState([]);
  const [selectedPlant, setSelectedPlant] = useState(null);
  const [plantMaterialDetails, setPlantMaterialDetails] = useState([]);

  useEffect(() => {}, []);

  const getAllPlants = async () => {
    store.dispatch(loading(true));
    try {
      const res = await http.post("/rfc-reducer/get-all-plants", {});
      if (res.data.status) {
        let allPlants = res.data.data;
        allPlants = allPlants.sort((a, b) => a.PLANT.localeCompare(b.PLANT));

        allPlants = allPlants.map((item) => {
          return {
            value: item.PLANT,
            label: item.PLANT + " - " + item.PLANT_NAME,
          };
        });

        setAllPlants(allPlants);
      }
    } catch (error) {
      console.log(error);
    } finally {
      store.dispatch(loading(false));
    }
  };

  useEffect(() => {
    getAllPlants();
  }, []);

  const getSelectedPlantMaterialDetails = async () => {
    store.dispatch(loading(true));
    try {
      const res = await http.post("/rfc-reducer/get-plant-material", {
        lv_plant: selectedPlant.value,
      });
      if (res.data.status) {
        setPlantMaterialDetails(res.data.result);
      }
    } catch (error) {
      console.log(error);
    } finally {
      store.dispatch(loading(false));
    }
  };

  useEffect(() => {
    if (selectedPlant) {
      getSelectedPlantMaterialDetails();
    }
  }, [selectedPlant]);

  const updateAllPlantMaterial = async () => {
    updatePlantMaterial(0);
  };

  const updatePlantMaterial = async (i) => {
    if (i === allPlants.length - 1) {
      return;
    }
    console.log(allPlants[i].value);

    try {
      store.dispatch(loading(true));
      const res = await http.post(apis.COMMON_POST_WITH_FM_NAME, {
        fm_name: "ZFM_MATERIAL",
        params: {
          LV_PLANT: allPlants[i].value,
        },
      });
      if (res.data.code === 0) {
        await createOrUpdatePlantMaterialData(i, res);
      }
    } catch (error) {
      updatePlantMaterial(i);
    } finally {
      store.dispatch(loading(false));
    }
  };

  const createOrUpdatePlantMaterialData = async (i, res) => {
    try {
      const data = res.data.result;
      const createRes = await http.post("/rfc-reducer/upsert-plant-material", {
        ...data,
      });
      if (createRes.data.status) {
        updatePlantMaterial(i + 1);
      }
    } catch (error) {
      updatePlantMaterial(i + 1);
    }
  };

  const updateNewPlantMaterial = async () => {
    try {
      store.dispatch(loading(true));
      const res = await http.post(apis.COMMON_POST_WITH_FM_NAME, {
        fm_name: "ZFM_MATERIAL",
        params: {
          LV_PLANT: selectedPlant.value,
        },
      });
      if (res.data.code === 0) {
        const data = res.data.result;
        const createRes = await http.post(
          "/rfc-reducer/upsert-plant-material",
          {
            ...data,
          }
        );
        if (createRes.data.status) {
          Swal.fire({
            title: "Success",
            text: "Plant Material Updated",
            icon: "success",
            confirmButtonText: "Ok",
          }).then(() => {
            setSelectedPlant(null);
          });
        } else {
          Swal.fire({
            title: "Error",
            text: "Plant Material Update Failed",
            icon: "error",
            confirmButtonText: "Ok",
          });
        }
      }
    } catch (error) {
    } finally {
      store.dispatch(loading(false));
    }
  };

  return (
    <div>
      <div className="filter-section">
        <p
          style={{
            fontSize: "20px",
          }}
        >
          PLANTS MATERIALS Management
        </p>
        <br />
        <div className="row">
          <div className="col-md-3">
            <button
              className="button goods-button"
              style={{
                display: "block",
                margin: "20px auto",
              }}
              onClick={() => {
                Swal.fire({
                  title: "Are you sure?",
                  text: `This will create ${
                    allPlants.length * 2
                  } new sessions. which lead to server slow down. Else you can update individual CFA Plants.`,
                  icon: "warning",
                  showCancelButton: true,
                  confirmButtonColor: "#3085d6",
                  cancelButtonColor: "#d33",
                  confirmButtonText: "Yes, Update All CFA Plants",
                  cancelButtonText: "No, Cancel",
                }).then((result) => {
                  if (result.value) {
                    updateAllPlantMaterial();
                  }
                });
              }}
            >
              Update Plants Material
            </button>
          </div>
          <div className="col-md-3">
            <div style={{ margin: "20px auto", padding: "0px 20px" }}>
              <Select
                options={allPlants}
                onChange={(e) => setSelectedPlant(e)}
                classNamePrefix="report-select"
                placeholder="Select Plants"
                isClearable={true}
                value={selectedPlant}
              />
              <button
                className="button goods-button"
                onClick={() => updateNewPlantMaterial()}
              >
                Update
              </button>
            </div>
          </div>
          {selectedPlant && plantMaterialDetails?.IT_FINAL && (
            <div className="col-md-5">
              <div>
                <div className="table-div">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>{selectedPlant.value}</th>
                        <th>{selectedPlant.label.split(" - ")[1]}</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {plantMaterialDetails?.IT_FINAL.map((item, index) => (
                        <tr key={index}>
                          <td>{item.MATNR.replace(/^0+/, "")}</td>
                          <td>{item.MAKTX}</td>
                          <td>{item.UOM}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const mapStateToProps = (state) => ({});

const mapDispatchToProps = {
  loading,
};

export default connect(mapStateToProps, mapDispatchToProps)(MaterialManagement);
