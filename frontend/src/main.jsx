import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import {
  createBrowserRouter,
  RouterProvider,
} from 'react-router-dom'

import './index.css'
import App from './App.jsx'

import { Home } from './components/Home/Home'
import { PageNotFound } from './components/Home/PageNotFound'

import { ListProductos } from './components/Producto/ListProductos'
import { DetailProducto } from './components/Producto/DetailProducto'
import { TableProductos } from './components/Producto/TableProductos'

import UserProvider from './components/User/UserProvider'
import { Login } from './components/User/Login'
import { Logout } from './components/User/Logout'
import { Signup } from './components/User/Signup'
import { Unauthorized } from './components/User/Unauthorized'
import { ListFacturas } from './components/Factura/ListFacturas'
import { DetailFactura } from './components/Factura/DetailFactura'
import { ListCitas } from './components/Cita/ListCitas'
import { DetailCita } from './components/Cita/DetailCita'

const rutas = createBrowserRouter([
  {
    element: <App />,
    children: [
      {
        path: '/',
        element: <Home />,
      },
      {
        path: '/producto',
        element: <ListProductos />,
      },
      {
        path: '/producto/:id',
        element: <DetailProducto />,
      },

      {
        path: '/producto-tabla',
        element: <TableProductos />,
      },

      {
        path: '/user/login',
        element: <Login />,
      },
      {
        path: '/user/logout',
        element: <Logout />,
      },
      {
        path: '/user/create',
        element: <Signup />,
      },
      {
        path: '/unauthorized',
        element: <Unauthorized />,
      },
      {
        path: '/factura',
        element: <ListFacturas />,
      },

      {
        path: '/factura/:id',
        element: <DetailFactura />,
      },

      {
        path: '/cita',
        element: <ListCitas />,
      },

      {
        path: '/cita/:id',
        element: <DetailCita />,
      },

      {
        path: '*',
        element: <PageNotFound />,
      },
    ],
  },
])

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <UserProvider>
      <RouterProvider router={rutas} />
    </UserProvider>
  </StrictMode>
)