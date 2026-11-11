import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Grid from "@mui/material/Grid2";
import { Alert, Box, Button, Paper, Typography } from "@mui/material";
import ServicioService from "../../services/ServicioService";

const formatoPrecio = new Intl.NumberFormat("es-CR", {
  style: "currency",
  currency: "CRC",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

export function DetailServicio() {
  const { id } = useParams();
  const [servicio, setServicio] = useState(null);
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const controlador = new AbortController();

    setCargando(true);
    setError("");
    setServicio(null);

    ServicioService.getServicioById(id, controlador.signal)
      .then((respuesta) => {
        if (controlador.signal.aborted) return;

        setServicio(respuesta.data);
      })
      .catch((errorSolicitud) => {
        if (controlador.signal.aborted) return;

        setError(
          errorSolicitud.response?.data?.mensaje ??
            "No se pudo cargar el servicio.",
        );
      })
      .finally(() => {
        if (!controlador.signal.aborted) {
          setCargando(false);
        }
      });

    return () => controlador.abort();
  }, [id]);

  return (
    <Box sx={{ p: 3 }}>
      {cargando ? (
        <Typography role="status">Cargando servicio...</Typography>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : servicio ? (
        <Paper sx={{ p: 3 }}>
          <Typography
            variant="h4"
            component="h1"
            sx={{ mb: 3, overflowWrap: "anywhere" }}
          >
            {servicio.nombre}
          </Typography>

          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 5 }}>
              {servicio.imagen ? (
                <Box
                  component="img"
                  src={servicio.imagen}
                  alt={servicio.nombre}
                  sx={{
                    width: "100%",
                    height: 240,
                    objectFit: "contain",
                    borderRadius: 1,
                  }}
                />
              ) : (
                <Box
                  sx={{
                    height: 240,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    bgcolor: "action.hover",
                    borderRadius: 1,
                  }}
                >
                  <Typography color="text.secondary">
                    Imagen pendiente
                  </Typography>
                </Box>
              )}
            </Grid>

            <Grid size={{ xs: 12, md: 7 }}>
              <Box
                component="dl"
                sx={{
                  m: 0,
                  "& dt": {
                    fontWeight: 600,
                    color: "text.secondary",
                  },
                  "& dd": {
                    m: 0,
                    mb: 2,
                    overflowWrap: "anywhere",
                  },
                }}
              >
                <Typography component="dt">Precio</Typography>
                <Typography component="dd" variant="h6" color="primary">
                  {formatoPrecio.format(Number(servicio.precio))}
                </Typography>

                <Typography component="dt">Duración</Typography>
                <Typography component="dd">
                  {servicio.duracion_minutos} minutos
                </Typography>

                <Typography component="dt">Material aplicable</Typography>
                <Typography component="dd">
                  {servicio.material_aplicable}
                </Typography>

                <Typography component="dt">Equipo requerido</Typography>
                <Typography component="dd">
                  {servicio.equipo_requerido}
                </Typography>
              </Box>
            </Grid>

            <Grid size={12}>
              <Typography component="h2" variant="h6" sx={{ mb: 1 }}>
                Descripción
              </Typography>

              <Typography
                sx={{
                  whiteSpace: "pre-wrap",
                  overflowWrap: "anywhere",
                }}
              >
                {servicio.descripcion}
              </Typography>
            </Grid>
          </Grid>
        </Paper>
      ) : (
        <Alert severity="warning">
          No se encontró información del servicio.
        </Alert>
      )}

      <Box
        sx={{
          display: "flex",
          justifyContent: "flex-end",
          gap: 2,
          mt: 3,
          flexWrap: "wrap",
        }}
      >
        <Button component={Link} to="/servicio" variant="outlined">
          Volver a servicios
        </Button>

        {!cargando && !error && servicio && (
          <Button
            component={Link}
            to={`/servicio/${servicio.id}/editar`}
            variant="contained"
          >
            Editar servicio
          </Button>
        )}
      </Box>
    </Box>
  );
}
