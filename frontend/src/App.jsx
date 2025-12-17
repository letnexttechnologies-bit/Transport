import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import RoleSelect from "./component/Home";
import ShipmentCard from "./component/ShipmentCard";
import Home from "./component/Home";
import Dashboard from "./component/Dashboard";
import AdminDashboard from "./component/AdminDashboard";
import UserDashboard from "./component/UserDashboard";
import EditShipment from "./component/EditShipment";
import AdminLogin from "./component/AdminLogin";
import UserLogin from "./component/UserLogin";
import TrackingPage from "./component/TrackingPage";
import ShipmentDetails from "./component/ShipmentDetails";
import ContactSupport from "./component/ContactSupport";
import EmailReport from "./component/EmailReport";
import PrintDetails from "./component/PrintDetails";
import ReportIssue from "./component/ReportIssue";
import './i18n/config'; // Import i18n config

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/admindashboard" element={<AdminDashboard />} />
        <Route path="/userdashboard" element={<UserDashboard />} />
        <Route path="/edit" element={<EditShipment />} />
        <Route path="/roleselect" element={<RoleSelect />} />
        <Route path="/shipmentcard" element={<ShipmentCard />} />
         <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/user-login" element={<UserLogin />} />
        <Route path="//tracking/:shipmentId" element={<TrackingPage />} />
        <Route path="/shipment-details/:shipmentId" element={<ShipmentDetails />} />
         <Route path="/edit-shipment/:shipmentId" element={<EditShipment />} />
         {/* New Quick Action Routes */}
          <Route path="/contact-support" element={<ContactSupport />} />
          <Route path="/email-report" element={<EmailReport />} />
          <Route path="/print-details" element={<PrintDetails />} />
          <Route path="/report-issue" element={<ReportIssue />} />

      </Routes>
    </Router>
  );
}

export default App;
