import { Box, Container, Typography } from '@mui/material'

export function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        mt: 4,
        py: 3,
        bgcolor: 'primary.main',
        color: 'primary.contrastText',
      }}
    >
      <Container maxWidth="xl">
        <Typography align="center" sx={{ fontWeight: 'bold' }}>
          Taller de Precisión y Soldadura Castillo, S.A.
        </Typography>

        <Typography align="center" variant="body2" sx={{ mt: 1 }}>
          Sistema de agenda de servicios y catálogo de productos
        </Typography>

        <Typography align="center" variant="body2" sx={{ mt: 1 }}>
          {new Date().getFullYear()}
        </Typography>
      </Container>
    </Box>
  )
}