module.exports = {
    data: {
        name: "clear",
        description: "clear a specific number of messages",
        default_member_permissions: null, // No specific permissions required
        options: [
            {
                name: "amount",
                description: "The amount of messages to delete",
                type: 4,
                required: true,
            },
        ],
    },
    async execute(interaction) {
        const { options } = interaction;
        const amount = options.getInteger("amount");
        if (amount <= 0 || amount > 100) {
            return await interaction.reply({
                content: "The amount must be between 1 and 100.",
                ephemeral: true,
            });
        }
        try {
            await interaction.channel.bulkDelete(amount, true);
            await interaction.reply({
                content: `${amount} message(s) have been deleted.`,
                ephemeral: true,
            });
        } catch (error) {
            console.error("Error deleting messages:", error);
            await interaction.reply({
                content: "An error occurred while trying to delete messages.",
                ephemeral: true,
            });
        }
    }
};