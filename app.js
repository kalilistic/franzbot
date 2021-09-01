const {
	Client, Collection, Intents,
} = require("discord.js");
const {
	promisify,
} = require("util");
// const readdir = promisify(require("fs").readdir);
const {
	readdirSync,
} = require("fs");
const Enmap = require("enmap");

// set up intents
const myIntents = new Intents();
myIntents.add('DIRECT_MESSAGES', 'GUILDS', 'GUILD_MEMBERS', 'GUILD_MESSAGES', 'GUILD_MESSAGE_REACTIONS');

const client = new Client(
	{
		intents: myIntents.bitfield,
	}
);

const config = require("./config.json");
// We also need to make sure we're attaching the config to the CLIENT so it's accessible everywhere!
client.config = config;

// Require our logger
const logger = require("./modules/Logger");
client.logger = logger;

// Let's start by getting some useful functions that we'll use throughout
// the bot, like logs and elevation features.
require("./modules/functions.js")(client);

// Aliases and commands are put in collections where they can be read from,
// catalogued, listed, etc.
client.commands = new Collection();
client.aliases = new Collection();
client.slashcmds = new Collection();

const init = async () => {
	// Here we load **commands** into memory, as a collection, so they're accessible
	// here and everywhere else.
	// Here we load **commands** into memory, as a collection, so they're accessible
	// here and everywhere else.
	const commands = readdirSync("./commands/").filter(file => file.endsWith(".js"));
	for (const file of commands) {
		const props = require(`./commands/${file}`);
		logger.log(`Loading Command: ${props.help.name}. 👌`, "log");
		client.commands.set(props.help.name, props);
		props.conf.aliases.forEach(alias => {
			client.aliases.set(alias, props.help.name);
		});
	}
	// Now we load any **slash** commands you may have in the ./slash directory.
	const slashFiles = readdirSync("./slash").filter(file => file.endsWith(".js"));
	for (const file of slashFiles) {
		const command = require(`./slash/${file}`);
		const commandName = file.split(".")[0];
		logger.log(`Loading Slash command: ${commandName}. 👌`, "log");

		// Now set the name of the command with it's properties.
		client.slashcmds.set(command.commandData.name, command);
	}

	// Then we load events, which will include our message and ready event.
	const eventFiles = readdirSync("./events/").filter(file => file.endsWith(".js"));
	for (const file of eventFiles) {
		const eventName = file.split(".")[0];
		logger.log(`Loading Event: ${eventName}. 👌`, "log");
		const event = require(`./events/${file}`);
		// Bind the client to any event, before the existing arguments
		// provided by the discord.js event.
		// This line is awesome by the way. Just sayin'.
		client.on(eventName, event.bind(null, client));
	}


	// Here we login the client.
	client.login(client.config.token);

	// End top-level async/await function.
};

init();
