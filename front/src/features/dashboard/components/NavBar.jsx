import AreaLogo from "../../../assets/AREA.png"
import { FaUser } from "react-icons/fa"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function Navbar({ username }) {
  return (
    <nav className="bg-primary text-primary-foreground p-4">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <img src={AreaLogo} alt="AREA Logo" className="w-6 h-6" />
          <span className="text-xl font-bold">AREA</span>
        </div>
        <div className="flex-1 text-center">
          <span className="text-lg">Welcome back {username}</span>
        </div>
        <div className="flex items-center space-x-4">
          <Input
            type="search"
            placeholder="Search for services..."
            className="max-w-sm bg-primary-foreground text-primary"
          />
          <Button variant="ghost" size="icon">
            <FaUser className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </nav>
  )
}