import { useEffect, useState } from 'react'
import { Alert, Typography } from '@mui/material'
import ProductoService from '../../services/ProductoService'
import { ListCardProductos } from './ListCardProductos.jsx'

export function ListProductos() {
  const [data, setData] = useState([])
  const [error, setError] = useState('')
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const controlador = new AbortController()

    ProductoService.getProductos(controlador.signal)
      .then((response) => {
        if (controlador.signal.aborted) return

        setData(response.data.productos)
      })
      .catch((errorSolicitud) => {
        if (controlador.signal.aborted) return

        setError(
          errorSolicitud.response?.data?.mensaje ??
          'No se pudo cargar el listado de productos.'
        )
      })
      .finally(() => {
        if (!controlador.signal.aborted) {
          setLoaded(true)
        }
      })

    return () => controlador.abort()
  }, [])

  if (!loaded) {
    return (
      <Typography role="status" sx={{ p: 3 }}>
        Cargando productos...
      </Typography>
    )
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>
  }

  if (data.length === 0) {
    return (
      <Typography sx={{ p: 3 }}>
        No hay productos disponibles.
      </Typography>
    )
  }

  return <ListCardProductos data={data} />
}