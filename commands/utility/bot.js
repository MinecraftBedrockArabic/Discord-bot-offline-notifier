const { EmbedBuilder,SlashCommandBuilder} = require('discord.js');
const fs = require('node:fs');

module.exports = {
    cf9e883400ac4d0383513b2a971ddd2f:'random id to mark this command as specific guild only',
    data: new SlashCommandBuilder()
                .setName("bot")
                .setDescription("subscribe or unsubscribe to a bot status.")
                .setDMPermission(false)
                .addStringOption(options=>options.setName('type').setDescription('The type of the command.').setRequired(true).addChoices({name: 'subscribe', value: 'subscribe'},{name: 'unsubscribe', value: 'unsubscribe'}))
                .addUserOption(options=>options.setName('bot').setDescription('the target bot.').setRequired(true)),

    async execute(interaction){
        const type = interaction.options.getString('type');
        const bot = interaction.options.getUser('bot').id;
        const user = interaction.user.id;
        const embed = new EmbedBuilder()
        if(user != "704346785811923016"){
            embed.setColor('Red').setTitle('Error!').setDescription('<:x_:1223515118835466240> Only <@704346785811923016> can use this command.');
            await interaction.reply({embeds: [embed], ephemeral: true});
            return;
        }
        await interaction.deferReply();
        const dataConfig = JSON.parse(fs.readFileSync('dataConfig.json'));
        try {
            const time = Date.now();
            if(type == 'subscribe'){
                dataConfig.users[bot] = {user, time};
                embed.setColor('Green').setTitle('Success!').setDescription('successfully subscribed to:' + `<@${bot}>`)
            }
            if(type == 'unsubscribe'){
                delete dataConfig.users[bot];
                embed.setColor('Green').setTitle('Success!').setDescription('successfully unsubscribed from:' + `<@${bot}>`)
            }
            fs.writeFileSync('dataConfig.json', JSON.stringify(dataConfig, null, 2));
        } catch (error) {
            embed.setColor('Red').setTitle('Error!').setDescription(error.message)
        }
        await interaction.editReply({embeds: [embed]})
    },
}