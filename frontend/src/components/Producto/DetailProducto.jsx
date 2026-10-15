import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Typography,
} from '@mui/material'
import ProductoService from '../../services/ProductoService'

const formatoPrecio = new Intl.NumberFormat('es-CR', {
  style: 'currency',
  currency: 'CRC',
})

export function DetailProducto() {
  const { id } = useParams()

  const [producto, setProducto] = useState(null)
  const [error, setError] = useState('')
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const controlador = new AbortController()

    setLoaded(false)
    setError('')
    setProducto(null)

    ProductoService.getProductoById(id, controlador.signal)
      .then((response) => {
        if (controlador.signal.aborted) return

        setProducto(response.data.producto)
      })
      .catch((errorSolicitud) => {
        if (controlador.signal.aborted) return

        setError(
          errorSolicitud.response?.data?.mensaje ??
          'No se pudo cargar el detalle del producto.'
        )
      })
      .finally(() => {
        if (!controlador.signal.aborted) {
          setLoaded(true)
        }
      })

    return () => controlador.abort()
  }, [id])

  return (
    <Box sx={{ p: 3 }}>
      <Button
        component={Link}
        to="/producto"
        variant="outlined"
        sx={{ mb: 3 }}
      >
        Volver al catálogo
      </Button>

      {!loaded ? (
        <Typography role="status">
          Cargando producto...
        </Typography>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : producto ? (
        <Card sx={{ maxWidth: 800, mx: 'auto' }}>
          {producto.imagen ? (
            <CardMedia
              component="img"
              image={producto.imagen}
              alt={producto.nombre}
              sx={{ height: 300, objectFit: 'cover' }}
            />
          ) : (
            <Box
              sx={{
                height: 250,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: 'action.hover',
              }}
            >
              <Typography color="text.secondary">
                Imagen pendiente
              </Typography>
            </Box>
          )}

          <CardContent>
            <Typography
              variant="h4"
              component="h1"
              sx={{ mb: 2 }}
            >
              {producto.nombre}
            </Typography>

            <Typography sx={{ mb: 2 }}>
              {producto.descripcion || 'Sin descripción disponible.'}
            </Typography>

            <Typography sx={{ mb: 1 }}>
              <strong>Categoría:</strong> {producto.categoria}
            </Typography>

            <Typography sx={{ mb: 1 }}>
              <strong>Material:</strong>{' '}
              {producto.material || 'No especificado'}
            </Typography>

            <Typography sx={{ mb: 2 }}>
              <strong>Dimensiones:</strong>{' '}
              {producto.dimensiones || 'No especificadas'}
            </Typography>

            <Typography variant="h5" color="primary">
              {formatoPrecio.format(Number(producto.precio))}
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Alert severity="warning">
          No se recibió información del producto.
        </Alert>
      )}
    </Box>
  )
}