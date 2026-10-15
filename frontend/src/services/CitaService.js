import axios from 'axios'

const BASE_URL = '/api/cita'

class CitaService {
  getCitas(signal) {
    return axios.get(BASE_URL, { signal })
  }

  getCitaById(id, signal) {
    return axios.get(
      `${BASE_URL}/${encodeURIComponent(id)}`,
      { signal }
    )
  }
}

export default new CitaService()