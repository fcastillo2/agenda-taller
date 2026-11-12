import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  MenuItem,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import PropTypes from "prop-types";
import AgendaService from "../../services/AgendaService";
import SucursalService from "../../services/SucursalService";

function formatearFecha(fecha) {
  const [anio, mes, dia] = fecha.split("-");
  return `${dia}/${mes}/${anio}`;
}

function formatearFechaHora(valor) {
  const [fecha, hora] = valor.split(" ");
  return `${formatearFecha(fecha)} ${hora.slice(0, 5)}`;
}

function obtenerRango(registro, tipo) {
  if (tipo === "horario") {
    return [
      `${formatearFecha(registro.fecha)} ${registro.hora_inicio.slice(0, 5)}`,
      `${formatearFecha(registro.fecha)} ${registro.hora_fin.slice(0, 5)}`,
    ];
  }

  return [
    formatearFechaHora(registro.inicio),
    formatearFechaHora(registro.fin),
  ];
}

export function AgendaSucursal() {
  const { sucursalId, tipo, registroId } = useParams();
  const navegar = useNavigate();
  const [sedes, setSedes] = useState(null);
  const [errorSedes, setErrorSedes] = useState("");
  const [resultado, setResultado] = useState(null);
  const clave = `${sucursalId ?? ""}/${tipo ?? ""}/${registroId ?? ""}`;
  const diasSemana = [
    "Lunes",
    "Martes",
    "Miércoles",
    "Jueves",
    "Viernes",
    "Sábado",
    "Domingo",
  ];

  useEffect(() => {
    const controlador = new AbortController();
    const { signal } = controlador;

    SucursalService.getSucursales(signal)
      .then(({ data }) => {
        if (!signal.aborted) setSedes(data.sucursales);
      })
      .catch(() => {
        if (!signal.aborted)
          setErrorSedes("No se pudieron cargar las sucursales.");
      });

    return () => controlador.abort();
  }, []);

  useEffect(() => {
    if (!sucursalId) return;

    const controlador = new AbortController();
    const { signal } = controlador;

    const solicitud = registroId
      ? AgendaService.getDetalle(sucursalId, tipo, registroId, signal)
      : AgendaService.getAgenda(sucursalId, signal);

    solicitud
      .then(({ data }) => {
        if (!signal.aborted) setResultado({ clave, data });
      })
      .catch((fallo) => {
        if (!signal.aborted) {
          setResultado({
            clave,
            error:
              fallo.response?.data?.mensaje ?? "No se pudo cargar la agenda.",
          });
        }
      });

    return () => controlador.abort();
  }, [clave, sucursalId, tipo, registroId]);

  const actual = resultado?.clave === clave ? resultado : null;
  const data = actual?.data;
  const registro = data && tipo ? data[tipo] : null;
  const rango = registro ? obtenerRango(registro, tipo) : null;

  return (
    <Stack spacing={3} sx={{ p: 3 }}>
      <Typography variant="h4" component="h1">
        Agenda por sucursal
      </Typography>

      {errorSedes && <Alert severity="error">{errorSedes}</Alert>}

      {sedes && (
        <TextField
          select
          label="Sucursal"
          value={
            sedes.some((sede) => String(sede.id) === sucursalId)
              ? sucursalId
              : ""
          }
          onChange={(evento) => navegar(`/agenda/${evento.target.value}`)}
          sx={{ width: "100%", maxWidth: 400 }}
        >
          <MenuItem value="" disabled>
            Selecciona una sucursal
          </MenuItem>
          {sedes.map((sede) => (
            <MenuItem key={sede.id} value={String(sede.id)}>
              {sede.nombre}
            </MenuItem>
          ))}
        </TextField>
      )}

      {!sucursalId && <Alert severity="info">Selecciona una sucursal.</Alert>}

      {sucursalId && !actual && (
        <Typography role="status">Cargando agenda...</Typography>
      )}

      {actual?.error && <Alert severity="error">{actual.error}</Alert>}

      {data && !registroId && (
        <>
          <Box>
            <Typography variant="h6" component="h2" sx={{ mb: 2 }}>
              Horas de apertura — {data.sucursal.nombre}
            </Typography>

            <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
              {data.semanas?.map((semana, indice) => (
                <Paper key={semana[0].fecha} sx={{ flex: 1, p: 2 }}>
                  <Typography component="h3" variant="subtitle1" sx={{ mb: 1 }}>
                    {indice === 0 ? "Semana actual" : "Semana siguiente"}
                  </Typography>

                  <Table size="small">
                    <TableBody>
                      {semana.map((dia, posicion) => (
                        <TableRow key={dia.fecha}>
                          <TableCell component="th" scope="row">
                            {diasSemana[posicion]} {formatearFecha(dia.fecha)}
                          </TableCell>
                          <TableCell align="right">
                            {dia.rangos.length > 0
                              ? dia.rangos
                                  .map(({ inicio, fin }) => `${inicio}–${fin}`)
                                  .join(" / ")
                              : "Cerrado"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Paper>
              ))}
            </Stack>
          </Box>

          <TablaAgenda
            titulo="Horarios"
            tipo="horario"
            registros={data.horarios}
            sucursalId={sucursalId}
          />
          <TablaAgenda
            titulo="Bloqueos"
            tipo="bloqueo"
            registros={data.bloqueos}
            sucursalId={sucursalId}
          />
          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-end",
              gap: 2,
              flexWrap: "wrap",
            }}
          >
            <Button
              component={Link}
              to={`/agenda/${sucursalId}/horario/crear`}
              variant="contained"
            >
              Registrar horario
            </Button>

            <Button
              component={Link}
              to={`/agenda/${sucursalId}/bloqueo/crear`}
              variant="outlined"
            >
              Registrar bloqueo
            </Button>
          </Box>
        </>
      )}

      {registro && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" component="h2" sx={{ mb: 2 }}>
            {tipo === "horario" ? "Detalle del horario" : "Detalle del bloqueo"}
          </Typography>
          <Typography>Sucursal: {data.sucursal.nombre}</Typography>
          <Typography>Inicio: {rango[0]}</Typography>
          <Typography>Fin: {rango[1]}</Typography>
          {tipo === "bloqueo" && (
            <Typography sx={{ overflowWrap: "anywhere" }}>
              Motivo: {registro.motivo}
            </Typography>
          )}
        </Paper>
      )}

      {registroId && (
        <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
          <Button
            component={Link}
            to={`/agenda/${sucursalId}`}
            variant="outlined"
          >
            Volver a la agenda
          </Button>
        </Box>
      )}
    </Stack>
  );
}

function TablaAgenda({ titulo, tipo, registros, sucursalId }) {
  return (
    <Box>
      <Typography variant="h6" component="h2" sx={{ mb: 1 }}>
        {titulo}
      </Typography>

      {registros.length === 0 ? (
        <Alert severity="info">
          No hay {titulo.toLowerCase()} registrados.
        </Alert>
      ) : (
        <TableContainer component={Paper}>
          <Table size="small" aria-label={titulo}>
            <TableHead>
              <TableRow>
                <TableCell>Inicio</TableCell>
                <TableCell>Fin</TableCell>
                <TableCell align="right">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {registros.map((registro) => {
                const [inicio, fin] = obtenerRango(registro, tipo);

                return (
                  <TableRow key={registro.id}>
                    <TableCell>{inicio}</TableCell>
                    <TableCell>{fin}</TableCell>
                    <TableCell align="right">
                      <Button
                        component={Link}
                        to={`/agenda/${sucursalId}/${tipo}/${registro.id}`}
                        variant="outlined"
                        size="small"
                        aria-label={`Ver detalle del ${tipo} del ${inicio}`}
                      >
                        Ver detalle
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}

const tipoId = PropTypes.oneOfType([PropTypes.number, PropTypes.string]);

TablaAgenda.propTypes = {
  titulo: PropTypes.string.isRequired,
  tipo: PropTypes.oneOf(["horario", "bloqueo"]).isRequired,
  sucursalId: PropTypes.string.isRequired,
  registros: PropTypes.arrayOf(
    PropTypes.oneOfType([
      PropTypes.shape({
        id: tipoId.isRequired,
        fecha: PropTypes.string.isRequired,
        hora_inicio: PropTypes.string.isRequired,
        hora_fin: PropTypes.string.isRequired,
      }),
      PropTypes.shape({
        id: tipoId.isRequired,
        inicio: PropTypes.string.isRequired,
        fin: PropTypes.string.isRequired,
      }),
    ]).isRequired,
  ).isRequired,
};
