import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Grid from "@mui/material/Grid2";
import { Alert, Box, Button, Paper, Typography } from "@mui/material";
import SucursalService from "../../services/SucursalService";

export function DetailSucursal() {
  const { id } = useParams();
  const [sucursal, setSucursal] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controlador = new AbortController();
    const { signal } = controlador;

    setSucursal(null);
    setError("");
    setCargando(true);

    SucursalService.getSucursalById(id, signal)
      .then(({ data }) => {
        if (!signal.aborted) setSucursal(data.sucursal);
      })
      .catch((fallo) => {
        if (!signal.aborted) {
          setError(
            fallo.response?.data?.mensaje ?? "No se pudo cargar la sucursal.",
          );
        }
      })
      .finally(() => {
        if (!signal.aborted) setCargando(false);
      });

    return () => controlador.abort();
  }, [id]);

  return (
    <Box sx={{ p: 3 }}>
      {cargando ? (
        <Typography role="status">Cargando sucursal...</Typography>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : sucursal ? (
        <Paper sx={{ p: 3, overflowWrap: "anywhere" }}>
          <Typography variant="h4" component="h1" sx={{ mb: 3 }}>
            {sucursal.nombre}
          </Typography>

          <Grid container spacing={3}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="h6" component="h2">
                Contacto
              </Typography>
              <Typography>Teléfono: {sucursal.telefono}</Typography>
              <Typography>Correo: {sucursal.correo}</Typography>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="h6" component="h2">
                Encargados
              </Typography>
              {sucursal.encargados.length > 0 ? (
                <Box component="ul" sx={{ my: 0, pl: 3 }}>
                  {sucursal.encargados.map((encargado) => (
                    <Typography component="li" key={encargado.id}>
                      {encargado.nombre}
                    </Typography>
                  ))}
                </Box>
              ) : (
                <Typography color="text.secondary">
                  No hay encargados asignados.
                </Typography>
              )}
            </Grid>

            <Grid size={12}>
              <Typography variant="h6" component="h2">
                Dirección exacta
              </Typography>
              <Typography sx={{ whiteSpace: "pre-wrap" }}>
                {sucursal.direccion_exacta}
              </Typography>
            </Grid>

            <Grid size={12}>
              <Typography variant="h6" component="h2">
                Descripción
              </Typography>
              <Typography sx={{ whiteSpace: "pre-wrap" }}>
                {sucursal.descripcion}
              </Typography>
            </Grid>
          </Grid>
        </Paper>
      ) : (
        <Alert severity="warning">No se encontró la sucursal.</Alert>
      )}

      <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 3 }}>
        <Button component={Link} to="/sucursal" variant="outlined">
          Volver a sucursales
        </Button>

        {!cargando && !error && sucursal && (
          <Button
            component={Link}
            to={`/sucursal/${sucursal.id}/editar`}
            variant="contained"
          >
            Editar sucursal
          </Button>
        )}
      </Box>
    </Box>
  );
}
