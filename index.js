const { Client, Collection, Events, GatewayIntentBits,EmbedBuilder } = require('discord.js');
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildPresences] });
const fs = require('node:fs');
const path = require('node:path');
const {token} = require('./config.json');


client.commands = new Collection();
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);
		if ('data' in command && 'execute' in command) {
			client.commands.set(command.data.name, command);
		} else {
			console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
		}
	}
}

client.once(Events.ClientReady, readyClient => {
	console.log(`Ready! Logged in as ${readyClient.user.displayName}`);
});

client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isChatInputCommand()) return;
	const command = interaction.client.commands.get(interaction.commandName);

	if (!command) {
		console.error(`No command matching ${interaction.commandName} was found.`);
		return;
	}

	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		if (interaction.replied || interaction.deferred) {
			await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
		} else {
			await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
		}
	}
});

client.on('presenceUpdate', (oldPresence, newPresence) => {
	let newStatus = newPresence?.status
	let oldStatus = oldPresence?.status
	const config = JSON.parse(fs.readFileSync('dataConfig.json'));
	const id = newPresence?.userId
	if(!(id in config.users)) return
	if(newStatus !== oldStatus && newStatus === 'offline'){
		const ttt = Date.now() - config.users[id].time
		if(ttt>1000){
			const embed = new EmbedBuilder()
			.setColor("Red")
			.setTitle('The bot has gone offline!')
			.setDescription(`<@${id}> has gone offline!\nUpTime: ${msToTime(ttt)}`)
			client.users.fetch(config.users[id].user).then(async user => 
				await user.send({embeds: [embed]})
			)
			config.users[id].time = Date.now();
			fs.writeFileSync('dataConfig.json', JSON.stringify(config, null, 2));
		}
	} else if(oldStatus == 'offline' && newStatus == 'online'){
		config.users[id].time = Date.now();
		fs.writeFileSync('dataConfig.json', JSON.stringify(config, null, 2));
	}

})

client.login(token);

function msToTime(ms) {
	let seconds = Math.floor(ms / 1000);
	let days = Math.floor(seconds / 86400);
	seconds -= days * 86400;
	let hours = Math.floor(seconds / 3600);
	seconds -= hours * 3600;
	let minutes = Math.floor(seconds / 60);
	seconds -= minutes * 60;

	days = days < 10 ? '0' + days : days;
	hours = hours < 10 ? '0' + hours : hours;
	minutes = minutes < 10 ? '0' + minutes : minutes;
	seconds = seconds < 10 ? '0' + seconds : seconds;

	return `${days}:${hours}:${minutes}:${seconds}`;
}