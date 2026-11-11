import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Button,
} from "@mui/material";
import ServicioService from "../../services/ServicioService";
import { Link } from "react-router-dom";

const formatoPrecio = new Intl.NumberFormat("es-CR", {
  style: "currency",
  currency: "CRC",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

export function ListServicios() {
  const [servicios, setServicios] = useState([]);
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const controlador = new AbortController();

    ServicioService.getServicios(controlador.signal)
      .then((respuesta) => {
        if (controlador.signal.aborted) return;

        setServicios(respuesta.data);
      })
      .catch((errorSolicitud) => {
        if (controlador.signal.aborted) return;

        setError(
          errorSolicitud.response?.data?.mensaje ??
            "No se pudo cargar el listado de servicios.",
        );
      })
      .finally(() => {
        if (!controlador.signal.aborted) {
          setCargando(false);
        }
      });

    return () => controlador.abort();
  }, []);

  if (cargando) {
    return (
      <Typography role="status" sx={{ p: 3 }}>
        Cargando servicios...
      </Typography>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" sx={{ mb: 3 }}>
        Servicios del Taller Castillo
      </Typography>

      <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 3 }}>
        <Button component={Link} to="/servicio/crear" variant="contained">
          Crear servicio
        </Button>
      </Box>

      {servicios.length === 0 ? (
        <Alert severity="info">No hay servicios registrados.</Alert>
      ) : (
        <TableContainer component={Paper}>
          <Table aria-label="Servicios del taller">
            <TableHead>
              <TableRow>
                <TableCell>Servicio</TableCell>
                <TableCell>Material aplicable</TableCell>
                <TableCell align="right">Duración en minutos</TableCell>
                <TableCell align="right">Precio</TableCell>
                <TableCell align="right">Acciones</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {servicios.map((servicio) => (
                <TableRow key={servicio.id}>
                  <TableCell component="th" scope="row">
                    {servicio.nombre}
                  </TableCell>
                  <TableCell>{servicio.material_aplicable}</TableCell>
                  <TableCell align="right">
                    {servicio.duracion_minutos}
                  </TableCell>
                  <TableCell align="right">
                    {formatoPrecio.format(Number(servicio.precio))}
                  </TableCell>

                  <TableCell align="right">
                    <Button
                      component={Link}
                      to={`/servicio/${servicio.id}`}
                      variant="outlined"
                      size="small"
                      aria-label={`Ver detalle de ${servicio.nombre}`}
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
  );
}
