import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import Appointments from "./pages/Appointments";
import Dashboard from "./pages/Dashboard";
import DoctorDetails from "./pages/DoctorDetails";
import Doctors from "./pages/Doctors";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import PatientDetails from "./pages/PatientDetails";
import Patients from "./pages/Patients";
import Schedule from "./pages/Schedule";

function PrivateRoute({ children }) {
  const token = localStorage.getItem("accessToken");
  return token ? children : <Navigate to="/login" replace />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route
          element={
            <PrivateRoute>
              <Layout />
            </PrivateRoute>
          }
        >
          <Route path="/" element={<Dashboard />} />
          <Route path="/patients" element={<Patients />} />
          <Route path="/patients/:id" element={<PatientDetails />} />
          <Route path="/doctors" element={<Doctors />} />
          <Route path="/doctors/:id" element={<DoctorDetails />} />
          <Route path="/appointments" element={<Appointments />} />
          <Route path="/schedule" element={<Schedule />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;