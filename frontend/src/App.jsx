import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import Appointments from "./pages/Appointments";
import BookAppointment from "./pages/patient/BookAppointment";
import Dashboard from "./pages/Dashboard";
import DoctorDashboard from "./pages/doctor/DoctorDashboard";
import DoctorDetails from "./pages/DoctorDetails";
import DoctorLayout from "./components/DoctorLayout";
import Doctors from "./pages/Doctors";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import MyAppointments from "./pages/patient/MyAppointments";
import MyDocuments from "./pages/patient/MyDocuments";
import MyPatients from "./pages/doctor/MyPatients";
import MyProfile from "./pages/patient/MyProfile";
import MySchedule from "./pages/doctor/MySchedule";
import PatientDashboard from "./pages/patient/PatientDashboard";
import PatientDetails from "./pages/PatientDetails";
import PatientLayout from "./components/PatientLayout";
import Patients from "./pages/Patients";
import Register from "./pages/Register";
import Schedule from "./pages/Schedule";
import VisitRecords from "./pages/doctor/VisitRecords";

function getDefaultRouteByRole(roleFromArg) {
  const role = roleFromArg || localStorage.getItem("authRole");

  if (role === "patient") return "/patient";
  if (role === "doctor") return "/doctor";
  return "/";
}

function PrivateRoute({ children, allowedRoles = [] }) {
  const token = localStorage.getItem("accessToken");
  const role = localStorage.getItem("authRole");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    return <Navigate to={getDefaultRouteByRole(role)} replace />;
  }

  return children;
}

function App() {
  const token = localStorage.getItem("accessToken");
  const role = localStorage.getItem("authRole");
  const defaultRoute = getDefaultRouteByRole(role);

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
            <PrivateRoute allowedRoles={["admin"]}>
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
          path="/doctor"
          element={
            <PrivateRoute allowedRoles={["doctor"]}>
              <DoctorLayout />
            </PrivateRoute>
          }
        >
          <Route index element={<DoctorDashboard />} />
          <Route path="patients" element={<MyPatients />} />
          <Route path="schedule" element={<MySchedule />} />
          <Route path="records" element={<VisitRecords />} />
        </Route>

        <Route
          path="/patient"
          element={
            <PrivateRoute allowedRoles={["patient"]}>
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