import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import Appointments from "./pages/Appointments";
import BookAppointment from "./pages/patient/BookAppointment";
import Dashboard from "./pages/Dashboard";
import DoctorDetails from "./pages/DoctorDetails";
import Doctors from "./pages/Doctors";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import MyAppointments from "./pages/patient/MyAppointments";
import MyDocuments from "./pages/patient/MyDocuments";
import MyProfile from "./pages/patient/MyProfile";
import PatientDashboard from "./pages/patient/PatientDashboard";
import PatientDetails from "./pages/PatientDetails";
import PatientLayout from "./components/PatientLayout";
import Patients from "./pages/Patients";
import Register from "./pages/Register";
import Schedule from "./pages/Schedule";

function getDefaultRouteByRole() {
  const role = localStorage.getItem("userRole");

  if (role === "patient") return "/patient";
  if (role === "doctor") return "/";
  return "/";
}

function PrivateRoute({ children }) {
  const token = localStorage.getItem("accessToken");
  return token ? children : <Navigate to="/login" replace />;
}

function App() {
  const token = localStorage.getItem("accessToken");
  const defaultRoute = getDefaultRouteByRole();

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={token ? <Navigate to={defaultRoute} replace /> : <Login />}
        />

        <Route
          path="/register"
          element={token ? <Navigate to={defaultRoute} replace /> : <Register />}
        />

        <Route
          element={
            <PrivateRoute>
              <Layout />
            </PrivateRoute>
          }
        >
          <Route path="/" element={<Dashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/patients" element={<Patients />} />
          <Route path="/patients/:id" element={<PatientDetails />} />
          <Route path="/doctors" element={<Doctors />} />
          <Route path="/doctors/:id" element={<DoctorDetails />} />
          <Route path="/appointments" element={<Appointments />} />
          <Route path="/schedule" element={<Schedule />} />
        </Route>

        <Route
          path="/patient"
          element={
            <PrivateRoute>
              <PatientLayout />
            </PrivateRoute>
          }
        >
          <Route index element={<PatientDashboard />} />
          <Route path="appointments" element={<MyAppointments />} />
          <Route path="book" element={<BookAppointment />} />
          <Route path="documents" element={<MyDocuments />} />
          <Route path="profile" element={<MyProfile />} />
        </Route>

        <Route
          path="*"
          element={<Navigate to={token ? defaultRoute : "/login"} replace />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;