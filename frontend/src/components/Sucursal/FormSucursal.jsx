import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import Grid from '@mui/material/Grid2'
import {
  Alert, Autocomplete, Box, Button, Paper, TextField, Typography,
} from '@mui/material'
import SucursalService from '../../services/SucursalService'

const campos = [
  { nombre: 'nombre', etiqueta: 'Nombre', ancho: 12 },
  { nombre: 'telefono', etiqueta: 'Teléfono', ancho: 6, tipo: 'tel' },
  { nombre: 'correo', etiqueta: 'Correo', ancho: 6, tipo: 'email' },
  { nombre: 'direccion_exacta', etiqueta: 'Dirección exacta', ancho: 12, filas: 2 },
  { nombre: 'descripcion', etiqueta: 'Descripción', ancho: 12, filas: 3 },
]

const inicial = Object.fromEntries(campos.map(({ nombre }) => [nombre, '']))

export function FormSucursal() {
  const { id } = useParams()
  const navegar = useNavigate()
  const rutaVolver = id ? `/sucursal/${id}` : '/sucursal'

  const [datos, setDatos] = useState(inicial)
  const [opciones, setOpciones] = useState([])
  const [seleccion, setSeleccion] = useState([])
  const [errores, setErrores] = useState({})
  const [mensaje, setMensaje] = useState('')
  const [errorCarga, setErrorCarga] = useState('')
  const [cargando, setCargando] = useState(true)
  const [guardando, setGuardando] = useState(false)

  useEffect(() => {
    const controlador = new AbortController()
    const { signal } = controlador

    setCargando(true)
    setErrorCarga('')
    setMensaje('')
    setErrores({})
    setDatos(inicial)
    setOpciones([])
    setSeleccion([])

    async function cargar() {
      try {
        const [respuestaOpciones, respuestaDetalle] = await Promise.all([
          SucursalService.getEncargadosDisponibles(id, signal),
          id ? SucursalService.getSucursalById(id, signal) : null,
        ])

        if (signal.aborted) return

        const disponibles = respuestaOpciones.data.encargados
        setOpciones(disponibles)

        if (respuestaDetalle) {
          const sucursal = respuestaDetalle.data.sucursal

          setDatos(Object.fromEntries(
            campos.map(({ nombre }) => [nombre, sucursal[nombre]])
          ))

          const idsActuales = new Set(
            sucursal.encargados.map((encargado) => Number(encargado.id))
          )

          setSeleccion(disponibles.filter(
            (encargado) => idsActuales.has(Number(encargado.id))
          ))
        }
      } catch (fallo) {
        if (!signal.aborted) {
          setErrorCarga(
            fallo.response?.data?.mensaje ?? 'No se pudo cargar el formulario.'
          )
        }
      } finally {
        if (!signal.aborted) setCargando(false)
      }
    }

    cargar()
    return () => controlador.abort()
  }, [id])

  function cambiarCampo(evento) {
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
      ...Object.fromEntries(
        campos.map(({ nombre }) => [nombre, datos[nombre].trim()])
      ),
      encargados_ids: seleccion.map((encargado) => Number(encargado.id)),
    }

    try {
      const respuesta = id
        ? await SucursalService.actualizarSucursal(id, envio)
        : await SucursalService.crearSucursal(envio)

      navegar(`/sucursal/${respuesta.data.sucursal.id}`)
    } catch (fallo) {
      setMensaje(
        fallo.response?.data?.mensaje ?? 'No se pudo guardar la sucursal.'
      )
      setErrores(fallo.response?.data?.errores ?? {})
    } finally {
      setGuardando(false)
    }
  }

  if (cargando) {
    return (
      <Typography role="status" sx={{ p: 3 }}>
        Cargando formulario...
      </Typography>
    )
  }

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h4" component="h1" sx={{ mb: 3 }}>
          {id ? 'Editar sucursal' : 'Crear sucursal'}
        </Typography>

        {errorCarga ? (
          <>
            <Alert severity="error">{errorCarga}</Alert>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
              <Button component={Link} to="/sucursal" variant="outlined">
                Volver a sucursales
              </Button>
            </Box>
          </>
        ) : (
          <Box component="form" onSubmit={guardar} noValidate>
            {mensaje && <Alert severity="error" sx={{ mb: 3 }}>{mensaje}</Alert>}

            <Grid container spacing={3}>
              {campos.map(({ nombre, etiqueta, ancho, tipo, filas }) => (
                <Grid key={nombre} size={{ xs: 12, sm: ancho }}>
                  <TextField
                    label={etiqueta}
                    name={nombre}
                    type={tipo}
                    value={datos[nombre]}
                    onChange={cambiarCampo}
                    error={Boolean(errores[nombre])}
                    helperText={errores[nombre]}
                    multiline={Boolean(filas)}
                    minRows={filas}
                    disabled={guardando}
                    required
                    fullWidth
                  />
                </Grid>
              ))}

              <Grid size={12}>
                <Autocomplete
                  multiple
                  options={opciones}
                  value={seleccion}
                  getOptionLabel={(encargado) => encargado.nombre}
                  getOptionKey={(encargado) => encargado.id}
                  isOptionEqualToValue={(opcion, valor) =>
                    Number(opcion.id) === Number(valor.id)
                  }
                  onChange={(_, nuevaSeleccion) => {
                    setSeleccion(nuevaSeleccion)
                    setErrores((actuales) => ({ ...actuales, encargados_ids: '' }))
                  }}
                  disabled={guardando}
                  noOptionsText="No hay encargados que coincidan."
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Encargados"
                      error={Boolean(errores.encargados_ids)}
                      helperText={
                        errores.encargados_ids ||
                        'Puedes seleccionar varios encargados o dejar la sede sin asignar.'
                      }
                    />
                  )}
                />
              </Grid>
            </Grid>

            <Box sx={{
              display: 'flex', justifyContent: 'flex-end',
              gap: 2, mt: 3, flexWrap: 'wrap',
            }}>
              <Button component={Link} to={rutaVolver} variant="outlined">
                Cancelar
              </Button>
              <Button type="submit" variant="contained" disabled={guardando}>
                {guardando ? 'Guardando...' : 'Guardar sucursal'}
              </Button>
            </Box>
          </Box>
        )}
      </Paper>
    </Box>
  )
}