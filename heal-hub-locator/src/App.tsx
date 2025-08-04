
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Hospitals from "./pages/Hospitals";
import HospitalDetail from "./pages/HospitalDetail";
import Doctors from "./pages/Doctors";
import SymptomTracker from "./pages/SymptomTracker";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import { UserButton } from '@clerk/clerk-react';
import Profile from "./pages/Profile";
import BookAppointment from "./pages/BookAppointment";
import NotFound from "./pages/NotFound";
import RiskPredictor from "./pages/RiskPredictor";

const App = () => (
  <TooltipProvider>
    <Toaster />
    <Sonner />
    {/* Clerk UserButton in the top right */}
    <div style={{ position: 'absolute', top: 16, right: 24, zIndex: 100 }}>
      <UserButton afterSignOutUrl="/" />
    </div>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/hospitals" element={<Hospitals />} />
        <Route path="/risk-predictor" element={<RiskPredictor />} />
        <Route path="/hospitals/:id" element={<HospitalDetail />} />
        <Route path="/doctors" element={<Doctors />} />
        <Route path="/symptom-tracker" element={<SymptomTracker />} />
        <Route path="/sign-in" element={<SignIn />} />
        <Route path="/sign-up" element={<SignUp />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/book-appointment" element={<BookAppointment />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  </TooltipProvider>
);

export default App;
