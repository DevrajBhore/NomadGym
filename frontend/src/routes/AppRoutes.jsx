// routes/AppRoutes.jsx
import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "../components/ProtectedRoute";

// Auth pages
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import EmailVerification from "../pages/auth/EmailVerification";
import ForgotPassword from "../pages/auth/ForgotPassword";
import ResetPassword from "../pages/auth/ResetPassword";

// User pages
import Home from "../pages/user/Home";
import Explore from "../pages/user/Explore";
import AllCities from "../pages/user/AllCities";
import AllGyms from "../pages/user/AllGyms";
import GymDetails from "../pages/user/GymDetails";
import BookGym from "../pages/user/BookGym";
import MakePayment from "../pages/user/MakePayment";
import Confirmation from "../pages/user/Confirmation";
import FindGymsMap from "../pages/user/FindGymsMap";
import LocationSearch from "../pages/user/LocationSearch";
import MapView from "../pages/user/MapView";
import AboutUs from "../pages/user/AboutUs";
import Partnership from "../pages/user/Partnership";
import HelpCenter from "../pages/user/HelpCenter";
import ContactUs from "../pages/user/ContactUs"

// Profile pages
import MyBookings from "../pages/profile/MyBookings";

// Owner pages
import Dashboard from "../pages/owner/Dashboard";
import BookingsList from "../pages/owner/BookingsList";
import VerifyBooking from "../pages/owner/VerifyBooking";
import SetRecurringAvailability from "../pages/owner/SetRecurringAvailability";
import SetDateSpecificAvailability from "../pages/owner/SetDateSpecificAvailability";
import AllGymAvailability from "../pages/owner/AllGymAvailability";

// Admin pages
import AdminDashboard from "../pages/admin/AdminDashboard";
import AddGym from "../pages/admin/AddGym";
import ViewGymAvailability from "../pages/admin/ViewGymAvailability";

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/verify-email/:token" element={<EmailVerification />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />
      <Route path="/aboutus" element={<AboutUs />} />
      <Route path="/partnership" element={<Partnership />} />
      <Route path="/help" element={<HelpCenter />} />
      <Route path="/contactus" element={<ContactUs />} />


      {/* User Routes */}
      <Route path="/" element={<Home />} />
      <Route element={<ProtectedRoute allowedRoles={["user"]} />}>
      <Route path="/explore" element={<Explore />} />
      <Route path="/cities" element={<AllCities />} />
      <Route path="/gyms/:city" element={<AllGyms />} />
      <Route path="/gym/:id" element={<GymDetails />} />
      <Route path="/find-gyms" element={<FindGymsMap />} />
      <Route path="/search" element={<LocationSearch />} />
      <Route path="/map" element={<MapView />} />

      {/* Protected User Routes */}
      
        <Route path="/book/:gymId" element={<BookGym />} />
        <Route path="/payment/:bookingId" element={<MakePayment />} />
        <Route path="/confirmation/:bookingId" element={<Confirmation />} />
        <Route path="/my-bookings" element={<MyBookings />} />
      </Route>

      {/* Protected Gym Owner Routes */}
      <Route element={<ProtectedRoute allowedRoles={["gym_owner"]} />}>
        <Route path="/owner/dashboard" element={<Dashboard />} />
        <Route path="/owner/bookings" element={<BookingsList />} />
        <Route path="/owner/verify-booking" element={<VerifyBooking />} />
        <Route
          path="/owner/gym/:gymId/set-recurring-availability"
          element={<SetRecurringAvailability />}
        />
        <Route
          path="/owner/set-date-availability"
          element={<SetDateSpecificAvailability />}
        />
        <Route
          path="/owner/gym/:gymId/all-availability"
          element={<AllGymAvailability />}
        />
      </Route>

      {/* Protected Admin Routes */}
      <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/add-gym" element={<AddGym />} />
        <Route
          path="/admin/date-availability"
          element={<SetDateSpecificAvailability />}
        />
        <Route
          path="/admin/gym/:gymId/all-availability"
          element={<ViewGymAvailability />}
        />
      </Route>

      {/* Catch all route for 404 */}
      <Route path="*" element={<div>Page not found</div>} />
    </Routes>
  );
};

export default AppRoutes;
