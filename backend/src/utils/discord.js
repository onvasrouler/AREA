const { Client, Collection, GatewayIntentBits, REST, Routes } = require("discord.js");
const fs = require("fs");
const path = require("path");

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.DirectMessages, GatewayIntentBits.GuildMessageReactions] });

client.commands = new Collection();

// Load commands dynamically
const commandsPath = path.join(__dirname, "discordCommands");
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith(".js"));

const commands = []; // Array for slash commands data

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);

    if (command.data.name && command.data.description) {
        client.commands.set(command.data.name, command);

        commands.push({
            name: command.data.name,
            description: command.data.description,
            default_member_permissions: command.data.default_member_permissions || null,
        });
    } else {
        console.error(`Command ${filePath} is missing name or description`);
    }
}

// Load events dynamically
const eventsPath = path.join(__dirname, "discordEvents");
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith(".js"));

for (const file of eventFiles) {
    const filePath = path.join(eventsPath, file);
    const event = require(filePath);
    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args, client));
    } else {
        client.on(event.name, (...args) => event.execute(...args, client));
    }
}

const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN);
(async () => {
    try {
        await rest.put(
            Routes.applicationCommands(process.env.DISCORD_CLIENT_ID),
            { body: commands }
        );
        console.log("Successfully reloaded application commands.");

        // Log in to Discord after commands are registered
        await client.login(process.env.DISCORD_TOKEN);
    } catch (error) {
        console.error("Error registering application commands:", error);
    }
})();


module.exports = client;