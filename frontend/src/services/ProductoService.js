import axios from 'axios'

const BASE_URL = '/api/producto'

class ProductoService {
  getProductos(signal) {
    return axios.get(BASE_URL, { signal })
  }

  getProductoById(id, signal) {
    return axios.get(
      `${BASE_URL}/${encodeURIComponent(id)}`,
      { signal }
    )
  }
}

export default new ProductoService()