import axios from "axios";

const BASE_URL = "/api/sucursal";

class SucursalService {
  getSucursales(signal) {
    return axios.get(BASE_URL, { signal });
  }

  getSucursalById(id, signal) {
    return axios.get(`${BASE_URL}/${encodeURIComponent(id)}`, { signal });
  }

  getEncargadosDisponibles(id, signal) {
    const sufijo = id ? `/${encodeURIComponent(id)}` : "";

    return axios.get(`${BASE_URL}/encargados-disponibles${sufijo}`, { signal });
  }

  crearSucursal(datos) {
    return axios.post(BASE_URL, datos);
  }

  actualizarSucursal(id, datos) {
    return axios.put(`${BASE_URL}/${encodeURIComponent(id)}`, datos);
  }
}

export default new SucursalService();
