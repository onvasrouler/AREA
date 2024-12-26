module.exports = {
    data: {
        name: "ping",
        description: "response to ping command",
        default_member_permissions: null, // No specific permissions required

    },
    async execute(interaction) {

        await interaction.reply("pong");
    }
};