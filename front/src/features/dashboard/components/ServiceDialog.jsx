import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

export function ServiceDialog({ isOpen, onClose, service, isDiscordAuthenticated }) {
  const handleDiscordLogin = () => {
    // Implement Discord login logic here
    console.log("Logging in with Discord");
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{service.name}</DialogTitle>
        </DialogHeader>
        <div className="p-4">
          {service.name === "Discord" && !isDiscordAuthenticated ? (
            <div className="flex flex-col items-center">
              <p className="mb-4">You need to log in with Discord to access this service.</p>
              <Button
                onClick={handleDiscordLogin}
                className="font-bold py-2 px-4 rounded"
              >
                Login with Discord
              </Button>
            </div>
          ) : (
            <p>This is where you can add more details about {service.name}.</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

