(async () => {
    const { Intents } = require("discord.js");
    const Bot = require("./src/classes/Bot");
    const mongoose = require("mongoose");

    const client = new Bot({ 
        partials: ['MESSAGE', 'CHANNEL'],
        fetchAllMembers: false,
        intents: [ Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES ]
    });
    
    const mongo = client.config.mongo;
    const connection = await mongoose.connect(`mongodb://${mongo.user}:${mongo.password}@${mongo.host}/${mongo.database}?ssl=false`, { useNewUrlParser: true, useUnifiedTopology: true });
    client.connection = connection;

    await require("./src/functions/register").registerEvents(client, '../events');
    await require("./src/functions/register").registerCommands(client, '../commands');

    await client.login(client.config.token);
})();