const { Client, Collection } = require("discord.js");
const Logger = require("./Logger.js");

class Bot extends Client {
    constructor(options) {
        super(options);

        this.Logger = new Logger()

        this.commands = new Collection()

        this.schemas = {
            giveaway: require("../schemas/giveaway.js"),
        };
    }

    get config() {
        return require("../../config/config.js");
    }
}

module.exports = Bot;