import PropTypes from 'prop-types'
import Grid from '@mui/material/Grid2'
import { Link } from 'react-router-dom'
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardMedia,
  Typography,
} from '@mui/material'

const formatoPrecio = new Intl.NumberFormat('es-CR', {
  style: 'currency',
  currency: 'CRC',
})

export function ListCardProductos({ data }) {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" sx={{ mb: 3 }}>
        Productos del Taller Castillo
      </Typography>

      <Grid container spacing={3}>
        {data.map((producto) => (
          <Grid
            key={producto.id}
            size={{ xs: 12, sm: 6, md: 4 }}
          >
            <Card sx={{ height: '100%' }}>
              {producto.imagen ? (
                <CardMedia
                  component="img"
                  height="180"
                  image={producto.imagen}
                  alt={producto.nombre}
                  sx={{ objectFit: 'cover' }}
                />
              ) : (
                <Box
                  sx={{
                    height: 180,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: 'action.hover',
                  }}
                >
                  <Typography color="text.secondary">
                    Imagen pendiente
                  </Typography>
                </Box>
              )}

              <CardContent>
                <Typography
                  variant="h6"
                  component="h2"
                  sx={{ mb: 1 }}
                >
                  {producto.nombre}
                </Typography>

                <Typography color="text.secondary">
                  {producto.categoria}
                </Typography>

                <Typography
                  variant="h6"
                  color="primary"
                  sx={{ mt: 2 }}
                >
                  {formatoPrecio.format(
                    Number(producto.precio)
                  )}
                </Typography>

              </CardContent>
              <CardActions>
                <Button
                  component={Link}
                  to={`/producto/${producto.id}`}
                  size="small"
                >
                  Ver detalle
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  )
}

ListCardProductos.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([
        PropTypes.number,
        PropTypes.string,
      ]).isRequired,
      nombre: PropTypes.string.isRequired,
      categoria: PropTypes.string.isRequired,
      precio: PropTypes.oneOfType([
        PropTypes.number,
        PropTypes.string,
      ]).isRequired,
      imagen: PropTypes.string,
    })
  ).isRequired,
}