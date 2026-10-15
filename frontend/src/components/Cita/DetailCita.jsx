import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  Alert,
  Box,
  Button,
  Chip,
  Divider,
  Paper,
  Typography,
} from '@mui/material'
import CitaService from '../../services/CitaService'

const formatoFechaHora = new Intl.DateTimeFormat('es-CR', {
  dateStyle: 'short',
  timeStyle: 'short',
})

function mostrarFechaHora(fecha) {
  if (!fecha) return 'No registrada'

  const valor = new Date(fecha.replace(' ', 'T'))

  return Number.isNaN(valor.getTime())
    ? 'Fecha inválida'
    : formatoFechaHora.format(valor)
}

export function DetailCita() {
  const { id } = useParams()

  const [cita, setCita] = useState(null)
  const [error, setError] = useState('')
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const controlador = new AbortController()

    setLoaded(false)
    setError('')
    setCita(null)

    CitaService.getCitaById(id, controlador.signal)
      .then((response) => {
        if (controlador.signal.aborted) return

        setCita(response.data.cita)
      })
      .catch((errorSolicitud) => {
        if (controlador.signal.aborted) return

        setError(
          errorSolicitud.response?.data?.mensaje ??
          'No se pudo cargar el detalle de la reserva.'
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
    <Box sx={{ py: 3 }}>
      <Button
        component={Link}
        to="/cita"
        variant="outlined"
        sx={{ mb: 3 }}
      >
        Volver al historial
      </Button>

      {!loaded ? (
        <Typography role="status">
          Cargando reserva...
        </Typography>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : cita ? (
        <Paper
          component="article"
          variant="outlined"
          sx={{
            maxWidth: 900,
            mx: 'auto',
            p: { xs: 2, md: 4 },
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 2,
              mb: 3,
            }}
          >
            <Typography variant="h4" component="h1">
              Detalle de la reserva
            </Typography>

            <Chip
              label={cita.estado}
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
          </Box>

          <Typography sx={{ mb: 1 }}>
            <strong>Fecha de creación:</strong>{' '}
            {mostrarFechaHora(cita.fecha_creacion)}
          </Typography>

          <Typography sx={{ mb: 1 }}>
            <strong>Inicio de la cita:</strong>{' '}
            {mostrarFechaHora(cita.inicio)}
          </Typography>

          <Typography sx={{ mb: 1 }}>
            <strong>Fin de la cita:</strong>{' '}
            {mostrarFechaHora(cita.fin)}
          </Typography>

          <Divider sx={{ my: 3 }} />

          <Typography variant="h6" component="h2" sx={{ mb: 2 }}>
            Datos de la reserva
          </Typography>

          <Typography sx={{ mb: 1 }}>
            <strong>Cliente:</strong> {cita.cliente_nombre}
          </Typography>

          <Typography sx={{ mb: 1 }}>
            <strong>Identificación:</strong>{' '}
            {cita.cliente_identificacion || 'No registrada'}
          </Typography>

          <Typography sx={{ mb: 1 }}>
            <strong>Sucursal:</strong> {cita.sucursal_nombre}
          </Typography>

          <Typography sx={{ mb: 1 }}>
            <strong>Servicio:</strong> {cita.servicio_nombre}
          </Typography>

          <Divider sx={{ my: 3 }} />

          <Typography variant="h6" component="h2" sx={{ mb: 2 }}>
            Información del trabajo
          </Typography>

          <Box
            component="dl"
            sx={{
              m: 0,
              '& dt': {
                fontWeight: 'bold',
                mb: 0.5,
              },
              '& dd': {
                m: 0,
                mb: 3,
                whiteSpace: 'pre-wrap',
                overflowWrap: 'anywhere',
              },
            }}
          >
            <Typography component="dt">
              ¿Qué trabajo necesita realizar?
            </Typography>

            <Typography component="dd">
              {cita.descripcion_trabajo}
            </Typography>

            <Typography component="dt">
              ¿De qué material es la pieza?
            </Typography>

            <Typography component="dd">
              {cita.material_pieza}
            </Typography>

            <Typography component="dt">
              ¿Qué uso tiene la pieza?
            </Typography>

            <Typography component="dd">
              {cita.uso_pieza}
            </Typography>
          </Box>
        </Paper>
      ) : (
        <Alert severity="warning">
          No se recibió información de la reserva.
        </Alert>
      )}
    </Box>
  )
}