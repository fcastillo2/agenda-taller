import axios from "axios";

const BASE_URL = "/api/agenda";

class AgendaService {
  getAgenda(sucursalId, signal) {
    return axios.get(`${BASE_URL}/${encodeURIComponent(sucursalId)}`, {
      signal,
    });
  }

  getDetalle(sucursalId, tipo, registroId, signal) {
    return axios.get(
      `${BASE_URL}/${encodeURIComponent(sucursalId)}/${tipo}/${encodeURIComponent(registroId)}`,
      { signal },
    );
  }

  crear(sucursalId, tipo, datos) {
    return axios.post(
      `${BASE_URL}/${encodeURIComponent(sucursalId)}/${tipo}`,
      datos,
    );
  }
}

export default new AgendaService();
