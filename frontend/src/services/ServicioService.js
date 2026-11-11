import axios from "axios";

const BASE_URL = "/api/servicio";

class ServicioService {
  getServicios(signal) {
    return axios.get(BASE_URL, { signal });
  }

  getServicioById(id, signal) {
    return axios.get(`${BASE_URL}/${encodeURIComponent(id)}`, { signal });
  }

  crearServicio(datos) {
    return axios.post(BASE_URL, datos);
  }

  actualizarServicio(id, datos) {
    const url = `${BASE_URL}/${encodeURIComponent(id)}`;

    return datos instanceof FormData
      ? axios.post(url, datos)
      : axios.put(url, datos);
  }
}

export default new ServicioService();
