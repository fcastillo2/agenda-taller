import { useContext, useState } from 'react'
import {
  AppBar,
  Box,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Toolbar,
  Typography,
} from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu'
import AccountCircle from '@mui/icons-material/AccountCircle'
import BuildIcon from '@mui/icons-material/Build'
import { Link } from 'react-router-dom'
import { UserContext } from '../../context/UserContext'

const navItems = [
  { name: 'Inicio', link: '/', roles: null },
  { name: 'Productos', link: '/producto', roles: null },
  { name: 'Tabla de productos', link: '/producto-tabla', roles: null },
  { name: 'Facturación', link: '/factura', roles: null },
  { name: 'Reservas', link: '/cita', roles: null },
]

const userItems = [
  { name: 'Iniciar sesión', link: '/user/login', login: false },
  { name: 'Registrarse', link: '/user/create', login: false },
  { name: 'Cerrar sesión', link: '/user/logout', login: true },

]

export default function Header() {
  const { decodeToken, autorize } = useContext(UserContext)

  const [anchorPrincipal, setAnchorPrincipal] = useState(null)
  const [anchorUsuario, setAnchorUsuario] = useState(null)

  const userData = decodeToken() ?? {}
  const tieneUsuario = Object.keys(userData).length > 0

  // Aplicar el mismo criterio al menú de escritorio y al móvil.
  const opcionesVisibles = navItems.filter(
    (item) =>
      item.roles === null ||
      (tieneUsuario && autorize({ requiredRoles: item.roles }))
  )

  const opcionesUsuario = userItems.filter(
    (item) => item.login === tieneUsuario
  )

  return (
    <AppBar position="static" component="header">
      <Toolbar sx={{ gap: 1 }}>
        <IconButton
          color="inherit"
          aria-label="Abrir menú principal"
          aria-controls={anchorPrincipal ? 'menu-principal' : undefined}
          aria-expanded={Boolean(anchorPrincipal)}
          aria-haspopup="true"
          onClick={(event) => setAnchorPrincipal(event.currentTarget)}
          sx={{ display: { xs: 'inline-flex', md: 'none' } }}
        >
          <MenuIcon />
        </IconButton>

        <Box
          component={Link}
          to="/"
          aria-label="Ir al inicio de Taller Castillo"
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            color: 'inherit',
            textDecoration: 'none',
            flexGrow: 1,
          }}
        >
          <BuildIcon />

          <Typography
            component="span"
            sx={{ fontWeight: 'bold', fontSize: { xs: 16, sm: 20 } }}
          >
            Taller Castillo
          </Typography>
        </Box>

        <Box
          component="nav"
          aria-label="Navegación principal"
          sx={{ display: { xs: 'none', md: 'flex' } }}
        >
          {opcionesVisibles.map((item) => (
            <Button
              key={item.link}
              component={Link}
              to={item.link}
              color="inherit"
            >
              {item.name}
            </Button>
          ))}
        </Box>

        <Menu
          id="menu-principal"
          anchorEl={anchorPrincipal}
          open={Boolean(anchorPrincipal)}
          onClose={() => setAnchorPrincipal(null)}
          sx={{ display: { xs: 'block', md: 'none' } }}
        >
          {opcionesVisibles.map((item) => (
            <MenuItem
              key={item.link}
              component={Link}
              to={item.link}
              onClick={() => setAnchorPrincipal(null)}
            >
              {item.name}
            </MenuItem>
          ))}
        </Menu>

        <IconButton
          color="inherit"
          aria-label="Abrir menú de usuario"
          aria-controls={anchorUsuario ? 'menu-usuario' : undefined}
          aria-expanded={Boolean(anchorUsuario)}
          aria-haspopup="true"
          onClick={(event) => setAnchorUsuario(event.currentTarget)}
        >
          <AccountCircle />
        </IconButton>

        <Menu
          id="menu-usuario"
          anchorEl={anchorUsuario}
          open={Boolean(anchorUsuario)}
          onClose={() => setAnchorUsuario(null)}
        >
          {tieneUsuario && userData.email && (
            <MenuItem disabled>{userData.email}</MenuItem>
          )}

          {opcionesUsuario.map((item) => (
            <MenuItem
              key={item.link}
              component={Link}
              to={item.link}
              onClick={() => setAnchorUsuario(null)}
            >
              {item.name}
            </MenuItem>
          ))}
        </Menu>
      </Toolbar>
    </AppBar>
  )
}