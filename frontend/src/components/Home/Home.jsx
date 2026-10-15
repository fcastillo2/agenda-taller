import { Link } from 'react-router-dom'
import {
  Box,
  Button,
  Container,
  Paper,
  Typography,
} from '@mui/material'
import BuildIcon from '@mui/icons-material/Build'

export function Home() {
  return (
    <Container maxWidth="md" sx={{ py: { xs: 3, md: 6 } }}>
      <Paper
        variant="outlined"
        sx={{
          p: { xs: 3, md: 6 },
          textAlign: 'center',
          borderRadius: 3,
        }}
      >
        <BuildIcon
          color="primary"
          sx={{ fontSize: 56, mb: 2 }}
        />

        <Typography
          component="h1"
          variant="h3"
          sx={{
            fontWeight: 'bold',
            fontSize: { xs: '2rem', md: '3rem' },
            mb: 2,
          }}
        >
          Taller de Precisión y Soldadura Castillo, S.A.
        </Typography>

        <Typography
          variant="h6"
          component="p"
          color="text.secondary"
          sx={{ mb: 3 }}
        >
          Trabajos de precisión y soldadura para atender
          las necesidades de nuestros clientes.
        </Typography>

        <Typography sx={{ mb: 4 }}>
          Consulta nuestro catálogo de productos y conoce
          sus características, materiales, dimensiones y precios.
        </Typography>

        <Box>
          <Button
            component={Link}
            to="/producto"
            variant="contained"
            size="large"
          >
            Explorar productos
          </Button>
        </Box>
      </Paper>
    </Container>
  )
}