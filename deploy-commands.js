const { REST, Routes } = require("discord.js");
const { clientId, guildId, token } = require("./config.json");
const fs = require("node:fs");
const path = require("node:path");

let commands = [];
let commandsTest = [];
const foldersPath = path.join(__dirname, "commands");
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
  const commandsPath = path.join(foldersPath, folder);
  const commandFiles = fs
    .readdirSync(commandsPath)
    .filter((file) => file.endsWith(".js"));
  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    if ("data" in command && "execute" in command) {

      //random id to mark commands as specific guild only
      if(("cf9e883400ac4d0383513b2a971ddd2f" in command)){
          commandsTest.push(command.data.toJSON());
      }else{
          commands.push(command.data.toJSON())
      }

    } else {console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);}
  }
}

const rest = new REST().setToken(token);
(async () => {
  try {
    console.log(`Started refreshing ${commands.length} application (/) commands.`);
    console.log(`Started refreshing ${commandsTest.length} guild application (/) commands.\n......`);

    const data = await rest.put(Routes.applicationCommands(clientId), {body: commands,});
    const dataTest = await rest.put(Routes.applicationGuildCommands(clientId, guildId), {body: commandsTest,});

    console.log(`Successfully reloaded ${data.length} application (/) commands.`);
    console.log(`Successfully reloaded ${dataTest.length} guild application (/) commands.`);

  } catch (error) {
    console.error(error);
  }
})();