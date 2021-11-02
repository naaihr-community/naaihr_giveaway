const { MessageEmbed, CommandInteraction } = require("discord.js");
const fs = require("fs").promises
const Bot = require("./Bot.js")

class BaseCommand {
    constructor(client, {
        description = "",
		name = "Beispiel Command",

		userAvailable = true,

		options = [],
    }) {
        /**
         * The {@link Bot} the Command belongs to.
         * @type {Bot}
         */
		this.client = client;

		this.config = { userAvailable, options };
		this.help = { name, description };
		this.interaction = null;
        this.Logger = client?.Logger
    }

    get embed() {
        return class extends MessageEmbed {
            constructor(options) {
                super(options);
                this.color = "#347aeb",
                this.timestamp = Date.now(),
                this.footer = {
                    text: "BTE Germany",
                    iconURL: (this.interaction ? this.interaction.guild.iconURL({ dynamic: true }) : null)
                }
            }
        }
    }

    /**
     * 
     * @param {String} key 
     * @returns 
     */

    t(key) {
        let language = key.split("/")[0]
        let command  = key.split("/")[1].split(":")[0]
        let text  = key.split("/")[1].split(":")[1]
        return require(`../lang/${language}/${command}`)[text]
    };

    /**
     * 
     * @param {CommandInteraction} interaction 
     */

	async run(interaction) {
        this.Logger.warn("Ended up in command.js [" + this.config + "]")
    };

    /**
     * 
     * @param {String} query 
     */

    async queryHandler(query ) {
        this.Logger.warn("Ended up in command.js [" + this.config + "]");
        return [];
    }

    /**
     * 
     * @param {String} guildId 
     */

	async initialize(guildId) {
        let guild = await this.client.guilds.fetch(guildId)

        if(this.config.userAvailable) this.config.permissions.push({
            id: "752606696794357801", // user (rules) // 709805597863968799
            type: "ROLE",
            permission: true
        })

        guild.commands.create({
            name: this.help.name,
            description: this.help.description,
            defaultPermission: true,
            options: this.config.options
        }).then(cmd => {
            this.Logger.info(`Created ${this.help.name}`, "CMD-Deployer");
        }).catch(this.client.Logger.error);
	}

    delete() {
        this.rest.applications(this.client.user.id).guilds(this.client.config.guild).commands.post({
            data: {
                name: this.help.name,
                description: this.help.description,
                options: this.config.options
            }
        }).catch(e => { console.log(e) })
	}

    /**
     * 
     * @param {[MessageEmbed, String, Array]} input 
     * @param {Array} components 
     * @returns 
     */

	async response(input, components = []) {
        if(typeof input === "object") {
            if(input.description) return await this.interaction.editReply({ embeds: [ input ], components: components }).catch(this.client.Logger.error);
            else return await this.interaction.editReply({ embeds: input, components: components }).catch(this.client.Logger.error)
        } else if(typeof input === "string") {
            return await this.interaction.editReply({ content: input, components: components }).catch(this.client.Logger.error);
        }
	}

    /**
     * 
     * @param {String} text 
     * @returns 
     */

	error(text) {
        return this.interaction.editReply({ embeds: [new MessageEmbed().setColor('#ff0000').setDescription(":x: " + text)] }).catch(this.client.Logger.error);
	}

	get rest() {
        return this.client.api;
    }
}

module.exports = BaseCommand;