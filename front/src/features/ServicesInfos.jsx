import discordImage from "../assets/services/Discord.png"
import githubImage from "../assets/services/Github.png"
import spotifyImage from "../assets/services/Spotify.png"
import onedriveImage from "../assets/services/Onedrive.png"
import gmailImage from "../assets/services/Gmail.png"
import instagramImage from "../assets/services/Instagram.png"

const ServicesInfos = [
    { id: 1, name: "Discord", description: "Manage Discord service", image: discordImage, bgColor: "#526af1", titleStyle: "text-2xl font-bold text-center text-white" },
    { id: 2, name: "GitHub", description: "Manage GitHub service", image: githubImage, bgColor: "#000000", titleStyle: "text-2xl font-bold text-center text-white" },
    { id: 3, name: "Spotify", description: "Manage Spotfiy service", image: spotifyImage, bgColor: "#1DB954", titleStyle: "text-2xl font-bold text-center text-white" },
    { id: 4, name: "OneDrive", description: "Manage OneDrive service", image: onedriveImage, bgColor: "#0849b0", titleStyle: "text-2xl font-bold text-center text-white" },
    { id: 5, name: "Gmail", description: "Manage Gmail service", image: gmailImage, bgColor: "#ffdc5c", titleStyle: "text-2xl font-bold text-center text-white" },
    { id: 6, name: "Instagram", description: "Manage Instagram service", image: instagramImage, bgColor: "#E4405F", titleStyle: "text-2xl font-bold text-center text-white" },
  ];

export default ServicesInfos;