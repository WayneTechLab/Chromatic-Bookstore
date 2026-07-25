import { createBrowserRouter } from 'react-router-dom'
import { Layout } from '@/components/layout/Layout'
import { LoginPage } from '@/pages/LoginPage'
import { StorefrontPage } from '@/pages/StorefrontPage'
import { NotFoundPage } from '@/pages/NotFoundPage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <StorefrontPage /> },
      { path: 'login', element: <LoginPage /> },
      { path: ':pageId', element: <StorefrontPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])
