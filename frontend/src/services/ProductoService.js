import axios from "axios";

const BASE_URL = "/api/producto";

class ProductoService {
  getProductos(signal) {
    return axios.get(BASE_URL, { signal });
  }

  getProductoById(id, signal) {
    return axios.get(`${BASE_URL}/${encodeURIComponent(id)}`, { signal });
  }

  getCategorias(signal) {
    return axios.get(`${BASE_URL}/categorias`, { signal });
  }

  crearProducto(datos) {
    return axios.post(BASE_URL, datos)
  }

  actualizarProducto(id, datos) {
    const url = `${BASE_URL}/${encodeURIComponent(id)}`

    return datos instanceof FormData
      ? axios.post(url, datos)
      : axios.put(url, datos)
  }
}

export default new ProductoService();
