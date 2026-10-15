import axios from 'axios'

const BASE_URL = '/api/factura'

class FacturaService {
  getFacturas(signal) {
    return axios.get(BASE_URL, { signal })
  }

  getFacturaById(id, signal) {
    return axios.get(
      `${BASE_URL}/${encodeURIComponent(id)}`,
      { signal }
    )
  }
}

export default new FacturaService()