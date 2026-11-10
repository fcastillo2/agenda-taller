import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Divider,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import FacturaService from "../../services/FacturaService";

const formatoPrecio = new Intl.NumberFormat("es-CR", {
  style: "currency",
  currency: "CRC",
});

const formatoFecha = new Intl.DateTimeFormat("es-CR", {
  dateStyle: "short",
  timeStyle: "short",
});

function mostrarFecha(fecha) {
  if (!fecha) return "No registrada";

  const valor = new Date(fecha.replace(" ", "T"));

  return Number.isNaN(valor.getTime())
    ? "Fecha inválida"
    : formatoFecha.format(valor);
}

function mostrarMonto(valor) {
  return formatoPrecio.format(Number(valor));
}

export function DetailFactura() {
  const { id } = useParams();

  const [factura, setFactura] = useState(null);
  const [error, setError] = useState("");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const controlador = new AbortController();

    setLoaded(false);
    setError("");
    setFactura(null);

    FacturaService.getFacturaById(id, controlador.signal)
      .then((response) => {
        if (controlador.signal.aborted) return;

        setFactura(response.data.factura);
      })
      .catch((errorSolicitud) => {
        if (controlador.signal.aborted) return;

        setError(
          errorSolicitud.response?.data?.mensaje ??
            "No se pudo cargar la factura.",
        );
      })
      .finally(() => {
        if (!controlador.signal.aborted) {
          setLoaded(true);
        }
      });

    return () => controlador.abort();
  }, [id]);

  return (
    <Box sx={{ py: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
        <Button component={Link} to="/factura" variant="outlined">
          Volver al historial
        </Button>
      </Box>

      {!loaded ? (
        <Typography role="status">Cargando factura...</Typography>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : factura ? (
        <Paper
          component="article"
          variant="outlined"
          sx={{ p: { xs: 2, md: 4 }, maxWidth: 1100, mx: "auto" }}
        >
          {/* Encabezado del documento */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "minmax(0, 1fr)",
                md: "repeat(2, minmax(0, 1fr))",
              },
              gap: 2,
            }}
          >
            <Box sx={{ overflowWrap: "anywhere" }}>
              <Typography variant="h6" component="h2" color="primary">
                {factura.sucursal_nombre}
              </Typography>
              <Typography variant="body2">
                {factura.sucursal_direccion}
              </Typography>
              <Typography variant="body2">
                Teléfono: {factura.sucursal_telefono}
              </Typography>
              <Typography variant="body2">
                Correo: {factura.sucursal_correo}
              </Typography>
            </Box>

            <Box>
              <Typography variant="h5" component="h1">
                Proforma
              </Typography>
              <Typography variant="body2">
                <strong>Número:</strong> {factura.numero}
              </Typography>
              <Typography variant="body2">
                <strong>Fecha:</strong> {mostrarFecha(factura.fecha)}
              </Typography>
              <Typography variant="body2">
                <strong>Estado:</strong> {factura.estado}
              </Typography>
              {factura.fecha_completada && (
                <Typography variant="body2">
                  <strong>Completada:</strong>{" "}
                  {mostrarFecha(factura.fecha_completada)}
                </Typography>
              )}

              <Typography variant="subtitle2" component="h2" sx={{ mt: 1 }}>
                Cliente
              </Typography>
              <Typography variant="body2">
                <strong>Nombre:</strong> {factura.cliente_nombre}
              </Typography>
              <Typography variant="body2">
                <strong>Identificación:</strong>{" "}
                {factura.cliente_identificacion || "No registrada"}
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* Líneas de productos y servicios */}
          <Typography variant="h6" component="h2" sx={{ mb: 2 }}>
            Detalle de productos y servicios
          </Typography>

          <TableContainer>
            <Table
              size="small"
              aria-label="Líneas de la factura"
              sx={{ minWidth: 650 }}
            >
              <TableHead>
                <TableRow
                  sx={{
                    bgcolor: "primary.main",
                    "& th": {
                      color: "primary.contrastText",
                      fontWeight: "bold",
                    },
                  }}
                >
                  <TableCell>Tipo</TableCell>
                  <TableCell>Descripción</TableCell>
                  <TableCell align="right">Cantidad</TableCell>
                  <TableCell align="right">Precio unitario</TableCell>
                  <TableCell align="right">Subtotal</TableCell>
                  <TableCell align="right">IVA %</TableCell>
                  <TableCell align="right">Impuesto</TableCell>
                  <TableCell align="right">Total de línea</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {factura.detalles.map((linea) => (
                  <TableRow key={`${linea.tipo}-${linea.elemento_id}`}>
                    <TableCell>{linea.tipo}</TableCell>

                    <TableCell component="th" scope="row">
                      {linea.descripcion}
                    </TableCell>

                    <TableCell align="right">{linea.cantidad}</TableCell>

                    <TableCell align="right" sx={{ whiteSpace: "nowrap" }}>
                      {mostrarMonto(linea.precio_unitario)}
                    </TableCell>

                    <TableCell align="right" sx={{ whiteSpace: "nowrap" }}>
                      {mostrarMonto(linea.subtotal)}
                    </TableCell>

                    <TableCell align="right">
                      {Number(linea.porcentaje_impuesto)} %
                    </TableCell>
                    <TableCell align="right" sx={{ whiteSpace: "nowrap" }}>
                      {mostrarMonto(linea.impuesto)}
                    </TableCell>
                    <TableCell align="right" sx={{ whiteSpace: "nowrap" }}>
                      {mostrarMonto(linea.total)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {factura.detalles.length === 0 && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              Este documento no tiene líneas de detalle.
            </Alert>
          )}

          {/* Totales del documento */}
          <Box
            sx={{
              maxWidth: 360,
              ml: "auto",
              mt: 4,
            }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                gap: 2,
                mb: 1,
              }}
            >
              <Typography>Subtotal</Typography>
              <Typography>{mostrarMonto(factura.subtotal)}</Typography>
            </Box>

            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                gap: 2,
                mb: 2,
              }}
            >
              <Typography>Impuesto Total</Typography>
              <Typography>{mostrarMonto(factura.impuesto)}</Typography>
            </Box>

            <Divider />

            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                gap: 2,
                mt: 2,
              }}
            >
              <Typography variant="h6">Total</Typography>

              <Typography variant="h6" color="primary">
                {mostrarMonto(factura.total)}
              </Typography>
            </Box>
          </Box>
        </Paper>
      ) : (
        <Alert severity="warning">
          No se recibió información de la factura.
        </Alert>
      )}
    </Box>
  );
}
