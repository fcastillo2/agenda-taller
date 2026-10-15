import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Alert,
  Box,
  Button,
  Chip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material'
import CitaService from '../../services/CitaService'

const formatoFechaHora = new Intl.DateTimeFormat('es-CR', {
  dateStyle: 'short',
  timeStyle: 'short',
})

function mostrarFechaHora(fecha) {
  const valor = new Date(fecha.replace(' ', 'T'))

  return Number.isNaN(valor.getTime())
    ? 'Fecha inválida'
    : formatoFechaHora.format(valor)
}

export function ListCitas() {
  const [citas, setCitas] = useState([])
  const [error, setError] = useState('')
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const controlador = new AbortController()

    CitaService.getCitas(controlador.signal)
      .then((response) => {
        if (controlador.signal.aborted) return

        setCitas(response.data.citas)
      })
      .catch((errorSolicitud) => {
        if (controlador.signal.aborted) return

        setError(
          errorSolicitud.response?.data?.mensaje ??
          'No se pudo cargar el historial de citas.'
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
        Cargando citas...
      </Typography>
    )
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>
  }

  return (
    <Box sx={{ py: 3 }}>
      <Typography variant="h4" component="h1" sx={{ mb: 3 }}>
        Historial de reservas
      </Typography>

      {citas.length === 0 ? (
        <Alert severity="info">
          No hay citas registradas para la sucursal.
        </Alert>
      ) : (
        <TableContainer component={Paper}>
          <Table aria-label="Historial de reservas">
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
                <TableCell>Fecha y horario</TableCell>
                <TableCell>Cliente</TableCell>
                <TableCell>Servicio</TableCell>
                <TableCell>Estado</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {citas.map((cita) => (
                <TableRow key={cita.id} hover>
                  <TableCell component="th" scope="row">
                    <Button
                      component={Link}
                      to={`/cita/${cita.id}`}
                      size="small"
                      sx={{ textTransform: 'none', textAlign: 'left' }}
                      aria-label={`Ver reserva de ${cita.cliente}, ${mostrarFechaHora(cita.inicio)}`}
                    >
                      Inicio: {mostrarFechaHora(cita.inicio)}
                    </Button>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ whiteSpace: 'nowrap' }}
                    >
                      Fin: {mostrarFechaHora(cita.fin)}
                    </Typography>
                  </TableCell>

                  <TableCell>{cita.cliente}</TableCell>

                  <TableCell>{cita.servicio}</TableCell>

                  <TableCell>
                    <Chip
                      label={cita.estado}
                      size="small"
                      variant="outlined"
                      sx={{
                        borderColor: cita.estado_color,
                        borderWidth: 2,
                        color: 'text.primary',
                        '&::before': {
                          content: '""',
                          width: 10,
                          height: 10,
                          borderRadius: '50%',
                          bgcolor: cita.estado_color,
                          ml: 1,
                          flexShrink: 0,
                        },
                      }}
                    />
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