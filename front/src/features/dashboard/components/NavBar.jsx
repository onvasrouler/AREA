import { FaUser } from "react-icons/fa";
import { LogOut, Settings, LayoutDashboard } from 'lucide-react';
import AreaLogo from "../../../assets/AREA.png";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

export function Navbar() {
  const navigate = useNavigate();
  const { toast } = useToast();

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
          toast({
            title: "Logout successful",
            description: "You have been successfully logged out",
            variant: "default",
          });
          localStorage.removeItem('session');
          navigate('/login');
        } else {
          toast({
            title: "Logout failed",
            description: "An error occurred while trying to logout",
            variant: "destructive",
          });
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
          <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 flex items-center">
            <LayoutDashboard className="mr-2 h-6 w-6" />
            <span className="text-2xl font-bold">
              Dashboard
            </span>
          </div>
          <div className="flex items-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="icon"  aria-label="User profile button" className="rounded-full">
                  <FaUser className="h-8 w-8" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <div className="text-center">
                  <DropdownMenuItem className="focus:bg-primary focus:text-primary-foreground cursor-pointer" onClick={() => navigate("/settings")}>
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
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
