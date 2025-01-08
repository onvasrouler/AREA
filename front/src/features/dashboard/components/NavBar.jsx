import { FaUser } from "react-icons/fa";
import { User, Settings, LogOut } from 'lucide-react';
import AreaLogo from "../../../assets/AREA.png";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useNavigate } from "react-router-dom";

export function Navbar({ username }) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const session = localStorage.getItem('session');
      if (session) {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}logout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'session': session
          }
        });
        if (response.ok) {
          localStorage.removeItem('session');
          navigate('/login');
        } else {
          console.error('Failed to logout');
        }
      } else {
        console.error('No session found');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <nav>
      <div className="w-full px-4 sm:px-6 lg:px-8 bg-primary text-white">
        <div className="flex items-center justify-between h-16 relative">
          <div className="flex items-center">
            <img src={AreaLogo} alt="AREA Logo" className="w-8 h-8 mr-2" />
            <span className="text-2xl font-bold">AREA</span>
          </div>
          <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <span className="text-2xl font-bold">
              Dashboard
            </span>
          </div>
          <div className="flex items-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="" size="icon" className="rounded-full">
                  <Avatar>
                    <AvatarImage src="https://static-00.iconduck.com/assets.00/avatar-icon-2048x2048-ilrgk6vk.png" alt={username} />
                    <AvatarFallback>
                      <FaUser className="h-5 w-5" />
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <div className="text-center">
                  <DropdownMenuItem className="focus:bg-primary focus:text-primary-foreground cursor-pointer" onClick={() => navigate("/profile")}>
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem className="focus:bg-primary focus:text-primary-foreground cursor-pointer" onClick={() => handleLogout()}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>
  );
}
