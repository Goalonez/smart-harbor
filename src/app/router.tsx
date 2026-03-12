import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { AuthGatePage } from '@/pages/AuthGatePage'

const router = createBrowserRouter([
  {
    path: '/',
    element: <AuthGatePage />,
  },
])

export function Router() {
  return <RouterProvider router={router} />
}
