import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  Alert, Box, Button, Paper, Stack, TextField, Typography,
} from '@mui/material'
import AgendaService from '../../services/AgendaService'

export function FormAgenda() {
  const { sucursalId, tipo } = useParams()
  const navegar = useNavigate()
  const rutaAgenda = `/agenda/${sucursalId}`
  const esBloqueo = tipo === 'bloqueo'

  const [datos, setDatos] = useState({
    fecha: '',
    hora_inicio: '',
    hora_fin: '',
    motivo: '',
  })
  const [errores, setErrores] = useState({})
  const [mensaje, setMensaje] = useState('')
  const [guardando, setGuardando] = useState(false)

  function cambiar(evento) {
    const { name, value } = evento.target
    setDatos((actuales) => ({ ...actuales, [name]: value }))
    setErrores((actuales) => ({ ...actuales, [name]: '' }))
  }

  async function guardar(evento) {
    evento.preventDefault()
    if (guardando) return

    setMensaje('')
    setErrores({})
    setGuardando(true)

    const envio = {
      fecha: datos.fecha,
      hora_inicio: datos.hora_inicio,
      hora_fin: datos.hora_fin,
      ...(esBloqueo ? { motivo: datos.motivo.trim() } : {}),
    }

    try {
      const { data } = await AgendaService.crear(sucursalId, tipo, envio)
      navegar(`${rutaAgenda}/${tipo}/${data[tipo].id}`)
    } catch (fallo) {
      setMensaje(
        fallo.response?.data?.mensaje ?? 'No se pudo guardar el registro.'
      )
      setErrores(fallo.response?.data?.errores ?? {})
    } finally {
      setGuardando(false)
    }
  }

  if (tipo !== 'horario' && tipo !== 'bloqueo') {
    return (
      <Stack spacing={2} sx={{ p: 3 }}>
        <Alert severity="error">El tipo de registro no es válido.</Alert>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button component={Link} to={rutaAgenda}>Volver a la agenda</Button>
        </Box>
      </Stack>
    )
  }

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 3, maxWidth: 680, mx: 'auto' }}>
        <Typography variant="h4" component="h1" sx={{ mb: 3 }}>
          {esBloqueo ? 'Registrar bloqueo' : 'Registrar horario'}
        </Typography>

        <Stack component="form" spacing={2} onSubmit={guardar} noValidate>
          {mensaje && <Alert severity="error">{mensaje}</Alert>}

          <TextField
            label="Fecha"
            name="fecha"
            type="date"
            value={datos.fecha}
            onChange={cambiar}
            error={Boolean(errores.fecha)}
            helperText={errores.fecha}
            slotProps={{ inputLabel: { shrink: true } }}
            disabled={guardando}
            required
          />

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            {[
              ['hora_inicio', 'Hora de inicio'],
              ['hora_fin', 'Hora de fin'],
            ].map(([campo, etiqueta]) => (
              <TextField
                key={campo}
                label={etiqueta}
                name={campo}
                type="time"
                value={datos[campo]}
                onChange={cambiar}
                error={Boolean(errores[campo])}
                helperText={errores[campo]}
                slotProps={{ inputLabel: { shrink: true } }}
                disabled={guardando}
                required
                fullWidth
              />
            ))}
          </Stack>

          {esBloqueo && (
            <TextField
              label="Motivo del bloqueo"
              name="motivo"
              value={datos.motivo}
              onChange={cambiar}
              error={Boolean(errores.motivo)}
              helperText={errores.motivo}
              slotProps={{ htmlInput: { maxLength: 500 } }}
              disabled={guardando}
              multiline
              minRows={2}
              required
            />
          )}

          <Box sx={{
            display: 'flex', justifyContent: 'flex-end',
            gap: 2, flexWrap: 'wrap',
          }}>
            <Button component={Link} to={rutaAgenda} variant="outlined">
              Cancelar
            </Button>
            <Button type="submit" variant="contained" disabled={guardando}>
              {guardando ? 'Guardando...' : 'Guardar'}
            </Button>
          </Box>
        </Stack>
      </Paper>
    </Box>
  )
}