import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"


const handleLoginFunctions = {
  handleDiscordLogin: () => {
    const CLIENT_ID = import.meta.env.VITE_DISCORD_CLIENT_ID;
    const REDIRECT_URI = import.meta.env.VITE_DISCORD_REDIRECT_URI;
    const AUTH_URL = `https://discord.com/api/oauth2/authorize?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(
        REDIRECT_URI
    )}&response_type=code&scope=identify%20guilds`;
    window.location.href = AUTH_URL;
  },
  handleGitHubLogin: () => {
      const GITHUB_CLIENT_ID = import.meta.env.VITE_GITHUB_CLIENT_ID;
      const SCOPE = "repo user";
      const CALLBACK_URI = import.meta.env.VITE_GITHUB_REDIRECT_URI;
      const AUTH_URL = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&redirect_uri=${CALLBACK_URI}&scope=${SCOPE}`;
      window.location.href = AUTH_URL;
  },
  handleSpotifyLogin: () => {
    // Implement Spotify login logic
    console.log("Spotify login")
  },
  handleOneDriveLogin: () => {
    // Implement OneDrive login logic
    console.log("OneDrive login")
  },
  handleGmailLogin: () => {
    // Implement Gmail login logic
    console.log("Gmail login")
  },
  handleInstagramLogin: () => {
    // Implement Instagram login logic
    console.log("Instagram login")
  }
}

export function ServiceDialog({ isOpen, onClose, service, authStatus }) {
  const isAuthenticated = authStatus[`is${service.name}Authenticated`]
  const handleLogin = handleLoginFunctions[`handle${service.name}Login`]

  const renderServiceContent = () => {
    if (!isAuthenticated) {
      return (
        <div className="flex flex-col items-center">
          <p className="mb-4">You need to log in with {service.name} to access this service.</p>
          <Button
            onClick={handleLogin}
            className="font-bold py-2 px-4 rounded"
          >
            Login with {service.name}
          </Button>
        </div>
      )
    } else {
      return (
        <div>
          <h1 className="text-lg font-semibold mb-2">LOGGED IN</h1>
        </div>
      )
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-center">
            {service.name}
          </DialogTitle>
          <DialogDescription className="text-center">
            {service.description}
          </DialogDescription>
        </DialogHeader>
        <Separator className="bg-primary" />
        <div className="p-4">
          {renderServiceContent()}
        </div>
      </DialogContent>
    </Dialog>
  )
}

