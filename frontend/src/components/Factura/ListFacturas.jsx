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
import FacturaService from '../../services/FacturaService'

const formatoPrecio = new Intl.NumberFormat('es-CR', {
  style: 'currency',
  currency: 'CRC',
})

const formatoFecha = new Intl.DateTimeFormat('es-CR', {
  dateStyle: 'short',
  timeStyle: 'short',
})

function mostrarFecha(fecha) {
  const valor = new Date(fecha.replace(' ', 'T'))

  return Number.isNaN(valor.getTime())
    ? 'Fecha inválida'
    : formatoFecha.format(valor)
}

export function ListFacturas() {
  const [facturas, setFacturas] = useState([])
  const [error, setError] = useState('')
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const controlador = new AbortController()

    FacturaService.getFacturas(controlador.signal)
      .then((response) => {
        if (controlador.signal.aborted) return

        setFacturas(response.data.facturas)
      })
      .catch((errorSolicitud) => {
        if (controlador.signal.aborted) return

        setError(
          errorSolicitud.response?.data?.mensaje ??
          'No se pudo cargar el historial de facturación.'
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
        Cargando facturas...
      </Typography>
    )
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>
  }

  return (
    <Box sx={{ py: 3 }}>
      <Typography variant="h4" component="h1" sx={{ mb: 3 }}>
        Historial de facturación
      </Typography>

      {facturas.length === 0 ? (
        <Alert severity="info">
          No hay facturas registradas para la sucursal.
        </Alert>
      ) : (
        <TableContainer component={Paper}>
          <Table aria-label="Historial de facturación">
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
                <TableCell>Número</TableCell>
                <TableCell>Fecha</TableCell>
                <TableCell>Cliente</TableCell>
                <TableCell align="right">Total</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {facturas.map((factura) => (
                <TableRow key={factura.id} hover>
                  <TableCell component="th" scope="row">
                    <Button
                      component={Link}
                      to={`/factura/${factura.id}`}
                      size="small"
                      aria-label={`Ver detalle de la factura ${factura.numero}`}
                    >
                      {factura.numero}
                    </Button>
                  </TableCell>

                  <TableCell sx={{ whiteSpace: 'nowrap' }}>
                    {mostrarFecha(factura.fecha)}
                  </TableCell>

                  <TableCell>
                    {factura.cliente}
                  </TableCell>

                  <TableCell
                    align="right"
                    sx={{ whiteSpace: 'nowrap' }}
                  >
                    {formatoPrecio.format(Number(factura.total))}
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