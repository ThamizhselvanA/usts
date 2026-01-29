
import { createBrowserRouter } from "react-router-dom";
import ProtectedRoute from "../components/guards/ProtectedRoute";
import AppShell from "../components/layout/AppShell";

import LandingPage from "../pages/LandingPage";
import LoginPage from "../pages/LoginPage";
import CreateTicketPage from "../pages/CreateTicketPage";
import MyTicketsPage from "../pages/MyTicketsPage";
import TicketDetailPage from "../pages/TicketDetailPage";
import DashboardPage from "../pages/DashboardPage";
import AdminAuditPage from "../pages/AdminAuditPage";
import ErrorPage from "../pages/ErrorPage";

export const router = createBrowserRouter([
  { path: "/", element: <LandingPage /> },
  { path: "/login", element: <LoginPage /> },

  {
    element: (
      <ProtectedRoute>
        <AppShell />
      </ProtectedRoute>
    ),
    children: [
      { path: "/tickets/new", element: <ProtectedRoute allow={["END_USER"]}><CreateTicketPage /></ProtectedRoute> },
      { path: "/tickets", element: <ProtectedRoute allow={["END_USER"]}><MyTicketsPage /></ProtectedRoute> },
      { path: "/tickets/:id", element: <ProtectedRoute allow={["END_USER", "IT_AGENT", "ADMIN"]}><TicketDetailPage /></ProtectedRoute> },
      { path: "/dashboard", element: <ProtectedRoute allow={["END_USER", "IT_AGENT", "ADMIN"]}><DashboardPage /></ProtectedRoute> },
      { path: "/admin", element: <ProtectedRoute allow={["ADMIN"]}><AdminAuditPage /></ProtectedRoute> }
    ]
  },

  { path: "*", element: <ErrorPage /> }
]);
