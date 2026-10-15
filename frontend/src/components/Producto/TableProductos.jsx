import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Alert,
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material'
import ProductoService from '../../services/ProductoService'

const formatoPrecio = new Intl.NumberFormat('es-CR', {
  style: 'currency',
  currency: 'CRC',
})

export function TableProductos() {
  const [productos, setProductos] = useState([])
  const [error, setError] = useState('')
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const controlador = new AbortController()

    ProductoService.getProductos(controlador.signal)
      .then((response) => {
        if (controlador.signal.aborted) return

        setProductos(response.data.productos)
      })
      .catch((errorSolicitud) => {
        if (controlador.signal.aborted) return

        setError(
          errorSolicitud.response?.data?.mensaje ??
          'No se pudo cargar la tabla de productos.'
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

  return (
    <Box sx={{ py: 3 }}>
      <Typography variant="h4" component="h1" sx={{ mb: 3 }}>
        Consulta de productos para mantenimiento
      </Typography>

      {productos.length === 0 ? (
        <Alert severity="info">
          No hay productos registrados.
        </Alert>
      ) : (
        <TableContainer component={Paper}>
          <Table aria-label="Productos registrados">
            <TableHead>
              <TableRow
                sx={{
                  bgcolor: 'primary.main',
                  '& th': {
                    color: 'primary.contrastText',
                    fontWeight: 'bold',
                  },
                }}
              >
                <TableCell>Nombre</TableCell>
                <TableCell>Categoría</TableCell>
                <TableCell>Material</TableCell>
                <TableCell align="right">Precio</TableCell>
                <TableCell align="center">Acciones</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {productos.map((producto) => (
                <TableRow key={producto.id} hover>
                  <TableCell component="th" scope="row">
                    {producto.nombre}
                  </TableCell>

                  <TableCell>
                    {producto.categoria}
                  </TableCell>

                  <TableCell>
                    {producto.material || 'No especificado'}
                  </TableCell>

                  <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                    {formatoPrecio.format(Number(producto.precio))}
                  </TableCell>

                  <TableCell align="center">
                    <Button
                      component={Link}
                      to={`/producto/${producto.id}`}
                      size="small"
                      aria-label={`Ver detalle de ${producto.nombre}`}
                    >
                      Ver detalle
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  )
}