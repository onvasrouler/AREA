//template for profile page
import { FaUser } from 'react-icons/fa';
import { User, Settings, LogOut } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import AreaLogo from "../../assets/AREA.png";

export function ProfilePage() {
    return (
        <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 relative">
            <div className="flex items-center">
            <img src={AreaLogo} alt="AREA Logo" className="w-8 h-8 mr-2" />
            <h1 className="text-lg font-semibold">Profile</h1>
            </div>
            <div className="flex items-center">
            <DropdownMenu>
                <DropdownMenuTrigger>
                <Avatar>
                    <AvatarFallback>
                    <FaUser />
                    </AvatarFallback>
                    <AvatarImage src="https://avatars.dicebear.com/api/avataaars/john-doe.svg" alt="User avatar" />
                </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                <DropdownMenuItem icon={<User size={16} />} to="/profile">
                    Profile
                </DropdownMenuItem>
                <DropdownMenuItem icon={<Settings size={16} />} to="/settings">
                    Settings
                </DropdownMenuItem>
                <DropdownMenuItem icon={<LogOut size={16} />} to="/logout">
                    Logout
                </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
            </div>
        </div>
        </div>
    );
}