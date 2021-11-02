const { MessageEmbed, MessageSelectMenu, MessageActionRow, CommandInteraction, AutocompleteInteraction, ButtonInteraction, MessageButton } = require("discord.js");
const BaseEvent = require("../classes/Event.js");
const Bot = require("../classes/Bot.js");
const BaseCommand = require("../classes/Command.js");

module.exports = class extends BaseEvent {
    constructor() {
        super('interactionCreate');
    };

    /**
     * 
     * @param {Bot} client 
     * @param {ButtonInteraction} interaction 
     */

    async run(client, interaction) {
        if(interaction.type === "APPLICATION_COMMAND") {

            /**
             * @type {BaseCommand}
             */
            let command = client.commands.get(interaction.commandName);
            if(!command) return;
            
            if(!command.config.userAvailable && !interaction.memberPermissions.has("MANAGE_GUILD")) return interaction.reply({ ephemeral: true, embeds: [ new MessageEmbed()
                .setColor("#ff0000")
                .setDescription(":x: You need `MANAGE_GUILD` permissions to use this command.")
            ]});

            await interaction.deferReply().catch(e => {
                return client.Logger.error(e);
            });

            return command.run(interaction, client);
        } else if(interaction.isButton()) {
            if(interaction.customId.startsWith("confirm_")) {
                let giveawayId = interaction.customId.split("_")[1];
                let giveawayDB = await client.schemas.giveaway.findOne({ giveawayId: parseInt(giveawayId), confirmed: false });
                if(!giveawayDB) {
                    interaction.message.delete().catch(client.Logger.error);
                    return interaction.reply({ ephemeral: true, embeds: [ new MessageEmbed()
                        .setColor("#ff0000")
                        .setDescription(":x: An Error occured. Giveaway canceled.")
                    ]})
                }

                if(interaction.user.id != giveawayDB.userid) return interaction.deferUpdate();

                let giveawayChannel = client.channels.cache.get(giveawayDB.channelid) || await client.channels.fetch(giveawayDB.channelid).catch(client.Logger.error);
                if(!giveawayChannel) {
                    await client.schemas.giveaway.deleteOne({ giveawayId: giveawayId });
                    interaction.message.delete().catch(client.Logger.error);
                    return interaction.reply({ ephemeral: true, embeds: [ new MessageEmbed()
                        .setColor("#ff0000")
                        .setDescription(":x: The channel wasn't found. Giveaway canceled.")
                    ]})
                }

                let participateButton = new MessageButton()
                    .setCustomId("participate_"+giveawayId)
                    .setStyle("PRIMARY")
                    .setEmoji("🎉")
                    .setLabel("Join Giveaway")

                let giveawayEmbed =   new MessageEmbed()
                    .setColor("BLURPLE")
                    .setTimestamp(new Date(parseInt(giveawayDB.end)))
                    .setFooter("Ends at")
                    .setTitle(`${giveawayDB.winners}x ${giveawayDB.prize}`.substr(0, 256))
                    .setDescription(`Ends: <t:${Math.round(giveawayDB.end/1000)}:R> (<t:${Math.round(giveawayDB.end/1000)}:f>)\nHosted by: <@!${giveawayDB.userid}>`)

                giveawayChannel.send({ components: [ new MessageActionRow().addComponents(participateButton) ], embeds: [ giveawayEmbed ]}).catch(async () => {
                    await client.schemas.giveaway.deleteOne({ giveawayId: giveawayId });
                    interaction.message.delete().catch(client.Logger.error);
                    return interaction.reply({ ephemeral: true, embeds: [ new MessageEmbed()
                        .setColor("#ff0000")
                        .setDescription(":x: Couldn't send giveaway Message. Check permissions. Giveaway canceled.")
                    ]})
                }).then(async m => {
                    giveawayDB.confirmed = true;
                    giveawayDB.messageid = m.id;
                    await giveawayDB.save();
                    interaction.message.delete().catch(client.Logger.error);
                    return interaction.deferUpdate();
                })
            } else if(interaction.customId.startsWith("exit_")) {
                let giveawayId = interaction.customId.split("_")[1];
                let giveawayDB = await client.schemas.giveaway.findOne({ giveawayId: parseInt(giveawayId), confirmed: false });
                if(!giveawayDB) {
                    interaction.message.delete().catch(client.Logger.error)
                    return interaction.reply({ ephemeral: true, embeds: [ new MessageEmbed()
                        .setColor("#ff0000")
                        .setDescription(":x: An Error occured. Giveaway canceled.")
                    ]})
                }

                if(interaction.user.id != giveawayDB.userid) return interaction.deferUpdate();

                await client.schemas.giveaway.deleteOne({ giveawayId: giveawayId });
                interaction.deferUpdate();
                return interaction.message.delete().catch(client.Logger.error);
            } else if(interaction.customId.startsWith("participate_")) {
                let giveawayId = interaction.customId.split("_")[1];
                let giveawayDB = await client.schemas.giveaway.findOne({ giveawayId: parseInt(giveawayId) });
                if(!giveawayDB) return interaction.deferUpdate();
                console.log(giveawayDB.participants)
                if(!giveawayDB.participants.find(x => x === interaction.user.id)) {
                    giveawayDB.participants.push(interaction.user.id)
                    await giveawayDB.save();
                    return interaction.reply({ ephemeral: true, content: "🎉 Entered Giveaway."});
                } else {
                    giveawayDB.participants = giveawayDB.participants.filter(x => x != interaction.user.id);
                    await giveawayDB.save();
                    return interaction.reply({ ephemeral: true, content: "🎉 Removed Entry from Giveaway."});
                }
            }
        }
    };
};