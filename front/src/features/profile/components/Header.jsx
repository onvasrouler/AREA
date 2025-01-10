import { FaUser } from 'react-icons/fa';
import { LogOut, LayoutDashboard, Settings } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import AreaLogo from "../../../assets/AREA.png";
import { motion } from "framer-motion";

export function Header({ handleLogout, navigate }) {
  return (
    <motion.div
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="w-full px-4 sm:px-6 lg:px-8 bg-primary text-white"
    >
      <div className="flex items-center justify-between h-16 relative">
        <div className="flex items-center">
          <img src={AreaLogo} alt="AREA Logo" className="w-8 h-8 mr-2" />
          <h1 className="text-2xl font-bold">AREA</h1>
        </div>
        <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 flex items-center">
          <Settings className="mr-2 h-6 w-6" />
          <span className="text-2xl font-bold">Settings</span>
        </div>
        <div className="flex items-center bg-primary text-white">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="icon" aria-label="User profile menu" className="rounded-full">
                <FaUser className="h-8 w-8" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <div className="text-center">
                <DropdownMenuItem
                  className="focus:bg-primary focus:text-primary-foreground cursor-pointer"
                  onClick={() => navigate("/dashboard")}
                >
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  Dashboard
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="focus:bg-primary focus:text-primary-foreground cursor-pointer"
                  onClick={handleLogout}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </motion.div>
  );
}
