import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
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
} from "@mui/material";
import SucursalService from "../../services/SucursalService";

export function ListSucursales() {
  const [sucursales, setSucursales] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controlador = new AbortController();
    const { signal } = controlador;

    SucursalService.getSucursales(signal)
      .then(({ data }) => {
        if (!signal.aborted) setSucursales(data.sucursales);
      })
      .catch((fallo) => {
        if (!signal.aborted) {
          setError(
            fallo.response?.data?.mensaje ??
              "No se pudieron cargar las sucursales.",
          );
        }
      })
      .finally(() => {
        if (!signal.aborted) setCargando(false);
      });

    return () => controlador.abort();
  }, []);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" sx={{ mb: 3 }}>
        Sucursales del Taller Castillo
      </Typography>

      <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
        <Button component={Link} to="/sucursal/crear" variant="contained">
          Crear sucursal
        </Button>
      </Box>

      {cargando ? (
        <Typography role="status">Cargando sucursales...</Typography>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : sucursales.length === 0 ? (
        <Alert severity="info">No hay sucursales registradas.</Alert>
      ) : (
        <TableContainer component={Paper}>
          <Table aria-label="Sucursales del taller">
            <TableHead>
              <TableRow>
                <TableCell>Sucursal</TableCell>
                <TableCell>Teléfono</TableCell>
                <TableCell>Correo</TableCell>
                <TableCell align="right">Acciones</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {sucursales.map((sucursal) => (
                <TableRow key={sucursal.id}>
                  <TableCell component="th" scope="row">
                    {sucursal.nombre}
                  </TableCell>
                  <TableCell>{sucursal.telefono}</TableCell>
                  <TableCell>{sucursal.correo}</TableCell>
                  <TableCell align="right">
                    <Button
                      component={Link}
                      to={`/sucursal/${sucursal.id}`}
                      variant="outlined"
                      size="small"
                      aria-label={`Ver detalle de la sucursal ${sucursal.nombre}`}
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
