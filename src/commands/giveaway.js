const { MessageEmbed, Interaction, Client, CommandInteraction, TextChannel, MessageActionRow, MessageButton } = require('discord.js');
const Command = require("../classes/Command.js");
const Bot = require("../classes/Bot.js");
const ms = require("ms");

module.exports = class extends Command {
    constructor(client) {
        super(client, {
            name:"giveaway",
            description:"Giveaway Commands",
            userAvailable: false,
            options: [
                {
                    name: "create",
                    description: "Creates a new giveaway",
                    type: 1,
                    options: [
                        {
                            type: 7,
                            name: "channel",
                            description: "The channel to create the giveaway in.",
                            required: true,
                            channel_types: [ 0 ]
                        },{
                            type: 3,
                            name: "duration",
                            description: "The duration of the giveaway.",
                            required: true
                        },{
                            type: 10,
                            name: "winners",
                            description: "The amount of winners of the giveaway.",
                            required: true
                        },{
                            type: 3,
                            name: "prize",
                            description: "The prize of the giveaway.",
                            required: true
                        }
                    ]
                }
            ],
        });
    };

    /**
     * @param {CommandInteraction} interaction
     * @param {Bot} client
     */   

    async run(interaction, client) {
        const options = interaction.options;
        const commandArgs = options.data;
        
        if(commandArgs[0].name === "create") {
            let args = commandArgs[0].options;
            
            /**
             * @type {TextChannel}
             */
            let channel = args.find(arg => arg.name === "channel").channel;

            /**
             * @type {String}
             */
            let duration = args.find(arg => arg.name === "duration").value;

            /**
             * @type {Number}
             */
            let winners = args.find(arg => arg.name === "winners").value;

            /**
             * @type {String}
             */
            let prize = args.find(arg => arg.name === "prize").value;

            let missingPermissions = [];
            client.config.requiredPermissions.forEach(perm => {
                if(!channel.permissionsFor(client.user.id).has(perm)) missingPermissions.push(perm);
            });
            
            if(missingPermissions.length != 0) {
                return interaction.reply({ ephemeral: true, embeds: [ new MessageEmbed()    
                    .setColor("#ff0000")
                    .setDescription(`:x: I'm missing following permissions in <#${channel.id}>:\n- ${missingPermissions.join("\n- ")}`)
                ]});
            };

            if(!ms(duration) || isNaN(ms(duration))) return interaction.reply({ ephemeral: true, embeds: [ new MessageEmbed()    
                .setColor("#ff0000")
                .setDescription(`Please enter a valid duration.`)
            ]});

            let giveawayId = (await client.schemas.giveaway.count())+1;
            
            let endTime = new Date().getTime()+ms(duration)

            let confirmRow = new MessageActionRow()
                .addComponents([
                    new MessageButton()
                        .setCustomId("confirm_"+giveawayId)
                        .setStyle("PRIMARY")
                        .setEmoji("✅")
                        .setLabel("Confirm"),
                    new MessageButton()
                        .setCustomId("exit_"+giveawayId)
                        .setStyle("DANGER")
                        .setEmoji("❌")
                        .setLabel("Exit")
                ]);

            let giveawayConfirmEmbed = new MessageEmbed()
                .setColor("BLURPLE")
                .setTimestamp()
                .setFooter("Use the buttons below to confirm.")
                .setTitle(`${winners}x ${prize}`.substr(0, 256))
                .setDescription(`Ends: <t:${Math.round(endTime/1000)}:R> (<t:${Math.round(endTime/1000)}:f>)\nHosted by: <@!${interaction.user.id}>`)

            let giveawayDB = new client.schemas.giveaway({
                id: giveawayId,

                userid: interaction.user.id,
            
                guildid: interaction.guild.id,
                channelid: channel.id,
            
                end: endTime,
                winners: winners,
                prize: prize
            });

            await giveawayDB.save();

            return interaction.editReply({ components: [ confirmRow ], ephemeral: false, embeds: [
                giveawayConfirmEmbed
            ]});
        };
    };
};