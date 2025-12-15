import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import Header from "./components/auth/Header";
import PatientList from "./components/PatientList";
import PatientDetails from "./components/PatientDetails";
import PatientForm from "./components/PatientForm";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Warnings from "./pages/Warnings";
import Appointments from "./pages/Appointments";

function AppLayout({ children }) {
  return (
    <>
      <Header />
      {children}
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <PatientList />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/patients/new"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <PatientForm />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/patients/:id"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <PatientDetails />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/patients/:id/edit"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <PatientForm />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/appointments"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <Appointments />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/warnings"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <Warnings />
                </AppLayout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;

