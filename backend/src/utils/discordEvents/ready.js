module.exports = {
    name: "ready",
    once: false,
    async execute(client) {
        console.log(`Discord logged in as ${client.user.tag}!`);

        console.log(`https://discord.com/api/oauth2/authorize?client_id=${client.user.id}&permissions=8&scope=bot%20applications.commands`);
    },
};