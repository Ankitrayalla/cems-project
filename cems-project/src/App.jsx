import { BrowserRouter, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminDashboard from "./pages/AdminDashboard";
import AdminResourceVerification from "./pages/AdminResourceVerification";
import ClubResourceRequest from "./pages/ClubResourceRequest";
import CreateProposal from "./pages/CreateProposal";
import Dashboard from "./pages/Dashboard";
import EditProposal from "./pages/Editproposal";
import HodDashboard from "./pages/HodDashboard";
import Home from "./pages/Home";
import Login from "./pages/Login";
import PrincipalDashboard from "./pages/PrincipalDashboard";
import SignUP from "./pages/SignUP";

function App() {
  return (
    <div className="app-shell page-container">
      <BrowserRouter>
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUP />} />
            <Route path="/edit/:id" element={<EditProposal />} />

            <Route
              path="/create"
              element={
                <ProtectedRoute>
                  <CreateProposal />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/hod-dashboard"
              element={
                <ProtectedRoute>
                  <HodDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/principal-dashboard"
              element={
                <ProtectedRoute>
                  <PrincipalDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/club-resource-request"
              element={
                <ProtectedRoute>
                  <ClubResourceRequest />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin-resource-verification"
              element={
                <ProtectedRoute>
                  <AdminResourceVerification />
                </ProtectedRoute>
              }
            />
          </Routes>
        </main>
      </BrowserRouter>
    </div>
  );
}

export default App;
