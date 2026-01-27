import {
  Navigate,
  Outlet,
  Route,
  Routes,
  BrowserRouter,
  useLocation,
} from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Rooms from "./pages/Rooms";
import ChatRoom from "./pages/ChatRoom";
import AcceptInvitation from "./pages/AcceptInvitation";
import { GlobalStyle, LoadingScreen } from "./App.styles";

const ProtectedRoute = (): JSX.Element => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingScreen>Loading chat experience…</LoadingScreen>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

const PublicRoute = ({ children }: { children: JSX.Element }): JSX.Element => {
  const { user, loading } = useAuth();
  const location = useLocation();
  const redirectTo = (location.state as { redirectTo?: string } | null)
    ?.redirectTo;

  if (loading) {
    return <LoadingScreen>Preparing secure session…</LoadingScreen>;
  }

  if (user) {
    return <Navigate to={redirectTo ?? "/"} replace />;
  }

  return children;
};

const App = (): JSX.Element => {
  return (
    <BrowserRouter>
      <GlobalStyle />
      <Routes>
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          }
        />
        <Route path="/invite/accept/:token" element={<AcceptInvitation />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Rooms />} />
          <Route path="/rooms/:roomId" element={<ChatRoom />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
