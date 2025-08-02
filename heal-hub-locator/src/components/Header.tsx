
import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, ChevronDown, LogIn, UserCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import EmergencyButton from './EmergencyButton';
import { useMobile } from '@/hooks/use-mobile';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isMobile = useMobile();
  const location = useLocation();
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  const handleSignInClick = () => {
    navigate('/login');
  };

  const handleBookAppointmentClick = () => {
    if (isAuthenticated) {
      navigate('/book-appointment');
    } else {
      navigate('/login');
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 bg-white shadow-sm z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-xl font-bold text-health-primary">HealHub</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-10">
            
            <Link to="/hospitals" className={`text-gray-700 hover:text-health-primary transition-colors ${location.pathname === '/hospitals' || location.pathname.startsWith('/hospitals/') ? 'font-medium text-health-primary' : ''}`}>
              Hospitals
            </Link>
            <Link to="/doctors" className={`text-gray-700 hover:text-health-primary transition-colors ${location.pathname === '/doctors' ? 'font-medium text-health-primary' : ''}`}>
              Doctors
            </Link>
            <Link to="/symptom-tracker" className={`text-gray-700 hover:text-health-primary transition-colors ${location.pathname === '/symptom-tracker' ? 'font-medium text-health-primary' : ''}`}>
              Symptom Tracker
            </Link>
            
          </nav>

          {/* Right section */}
          <div className="hidden md:flex items-center space-x-4">
            <Link to="/risk-predictor">
              <Button className={`bg-gray-700 text-white px-4 py-2 rounded shadow hover:from-blue-600 hover:to-green-500 transition-colors ${location.pathname === '/risk-predictor' ? 'ring-2 ring-blue-400' : ''}`}>Heart Disease Prediction</Button>
            </Link>
            <EmergencyButton />
            
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-2">
                    <UserCircle size={18} />
                    {user?.name}
                    <ChevronDown size={16} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => navigate('/profile')}>
                    My Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/book-appointment')}>
                    Book Appointment
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout}>
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center space-x-3">
                <Button variant="outline" onClick={handleSignInClick}>
                  <LogIn className="mr-2 h-4 w-4" />
                  Sign In
                </Button>
                <Button className='bg-gray-700' onClick={handleBookAppointmentClick}>
                  Book Appointment
                </Button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden text-gray-700"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && isMobile && (
        <div className="md:hidden bg-white border-t">
          <div className="container mx-auto py-4 px-4 space-y-4">
            <Link
              to="/"
              className={`block py-2 ${
                location.pathname === '/' ? 'text-health-primary font-medium' : 'text-gray-700'
              }`}
            >
              Home
            </Link>
            <Link
              to="/hospitals"
              className={`block py-2 ${
                location.pathname === '/hospitals' || location.pathname.startsWith('/hospitals/')
                  ? 'text-health-primary font-medium'
                  : 'text-gray-700'
              }`}
            >
              Hospitals
            </Link>
            <Link
              to="/doctors"
              className={`block py-2 ${
                location.pathname === '/doctors' ? 'text-health-primary font-medium' : 'text-gray-700'
              }`}
            >
              Doctors
            </Link>
            <Link
              to="/symptom-tracker"
              className={`block py-2 ${
                location.pathname === '/symptom-tracker' ? 'text-health-primary font-medium' : 'text-gray-700'
              }`}
            >
              Symptom Tracker
            </Link>

            <div className="pt-2 border-t border-gray-100">
              <EmergencyButton className="w-full justify-center mb-3" />
              
              {isAuthenticated ? (
                <div className="space-y-2">
                  <Button variant="outline" className="w-full justify-between" onClick={() => navigate('/profile')}>
                    My Profile <UserCircle size={16} />
                  </Button>
                  <Button className="w-full" onClick={() => navigate('/book-appointment')}>
                    Book Appointment
                  </Button>
                  <Button variant="ghost" className="w-full" onClick={logout}>
                    Logout
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Button variant="outline" className="w-full" onClick={handleSignInClick}>
                    <LogIn className="mr-2 h-4 w-4" />
                    Sign In
                  </Button>
                  <Button className="w-full" onClick={handleBookAppointmentClick}>
                    Book Appointment
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
