import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Auth pages
import Login from "./pages/Login";
import Signup from "./pages/Signup";

// User pages
import Home from "./pages/Home";
import UserPracticals from "./pages/UserPracticals";
import UserAttendance from "./pages/UserAttendance";
import UserReports from "./pages/UserReports";
import UserLayout from "./pages/UserLayout";

// Admin pages
import Admin from "./pages/admin/Admin";
import AdminHome from "./pages/admin/AdminHome";
import Equipment from "./pages/admin/Equipment";
import Chemical from "./pages/admin/Chemical";
import Practicals from "./pages/admin/Practicals";
import Timetable from "./pages/admin/Timetable";
import Report from "./pages/admin/Report";
import Attendance from "./pages/admin/Attendance";



// Admin  Routes
const AdminRoute = ({ children }) => {
  const isAdmin = localStorage.getItem("admin");
  return isAdmin ? children : <Navigate to="/login" />;
};
 
//Other Routes
export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/*  root → login */}
        <Route path="/" element={<Navigate to="/login" />} />

        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* User Routes */}
         <Route element={<UserLayout />}>
        <Route path="/home" element={<Home />} />
        <Route path="/userpracticals" element={<UserPracticals />} />
        <Route path="/userattendance" element={<UserAttendance />} />
        <Route path="/userreports" element={<UserReports />} />
        </Route>

        {/* Admin Routes  */}
        <Route
          path="/admin/*"
          element={
            <AdminRoute>
              <Admin />
            </AdminRoute>
          }
        >
          <Route index element={<AdminHome />} />
          <Route path="equipment" element={<Equipment />} />
          <Route path="chemical" element={<Chemical />} />
          <Route path="practicals" element={<Practicals />} />
          <Route path="timetable" element={<Timetable />} />
          <Route path="report" element={<Report />} />
          <Route path="attendance" element={<Attendance />} />
        </Route>

      </Routes>
    </BrowserRouter>
  );
}
