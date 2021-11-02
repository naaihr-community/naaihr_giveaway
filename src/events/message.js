const BaseEvent = require("../classes/Event");
const { MessageEmbed, Message } = require("discord.js")
const Bot = require("../classes/Bot.js")

module.exports = class extends BaseEvent {
    constructor() {
        super('messageCreate');
    };

    /**
     * 
     * @param {Bot} client 
     * @param {Message} msg 
     * @returns 
     */

    async run(client, msg) {
        return
    };
};