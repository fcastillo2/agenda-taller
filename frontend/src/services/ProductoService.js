import axios from 'axios'

const BASE_URL = '/api/producto'

class ProductoService {
  getProductos(signal) {
    return axios.get(BASE_URL, { signal })
  }

  getProductoById(id) {
    return axios.get(
      `${BASE_URL}/${encodeURIComponent(id)}`
    )
  }
}

export default new ProductoService()