module.exports = {
    name: 'error',
    once: false,
    async execute(error) {
        console.error(error);
    },
};