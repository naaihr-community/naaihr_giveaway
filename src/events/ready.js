const { MessageEmbed, MessageButton, MessageActionRow } = require("discord.js");
const BaseEvent = require("../classes/Event.js");
const Bot = require("../classes/Bot.js")

module.exports = class extends BaseEvent {
    constructor() {
        super('ready');
    };

    /**
     * 
     * @param {Bot} client 
     */

    async run(client) {
        client.Logger.info(`Logged in at ${new Date().toLocaleString().replace(",","")} as ${client.user.tag} [${client.user.id}]`, "CLIENT")

        client.commands.forEach(command => {
            command.initialize("699742385919229963");
        });

        setInterval(async () => {
            let giveaways = await client.schemas.giveaway.find({ confirmed: true, messageid: { '$ne': null }, end: { '$lt': new Date().getTime() } })

            giveaways.forEach(async giveaway => {
                let gWinners = [];
                let i = giveaway.winners;
                for(i; i>giveaway.participants.length;) {
                    i--;
                }

                if(giveaway.participants.length <= 0) return;

                while(i!=0) {
                    let random = Math.floor(Math.random()*giveaway.participants.length)

                    let winner = giveaway.participants[random];
                    if(!gWinners.find(x => x === winner)) {
                        gWinners.push(winner)
                        i--;
                    }
                }
                
                if(gWinners.length <= 0) return await client.schemas.giveaway.deleteOne({ id: giveaway.id });

                let channel = client.channels.cache.get(giveaway.channelid) || await client.channels.fetch(giveaway.channelid).catch(client.Logger.error);
                if(!channel) return await client.schemas.giveaway.deleteOne({ id: giveaway.id });

                let giveawayMessage = await channel.messages.fetch(giveaway.messageid).catch(client.Logger.error)
                if(!giveawayMessage) return await client.schemas.giveaway.deleteOne({ id: giveaway.id });

                let participateButton = new MessageButton()
                    .setCustomId("participate")
                    .setStyle("PRIMARY")
                    .setEmoji("🎉")
                    .setLabel("Join Giveaway")
                    .setDisabled(true)

                let giveawayEmbed = new MessageEmbed()
                    .setColor("BLURPLE")
                    .setTimestamp(new Date(parseInt(giveaway.end)))
                    .setFooter("Ended at")
                    .setTitle(`${giveaway.winners}x ${giveaway.prize}`.substr(0, 256))
                    .setDescription(`Winners:\n<@!${gWinners.join(">\n<@!")}>`)

                giveawayMessage.edit({ components: [ new MessageActionRow().addComponents(participateButton) ], embeds: [ giveawayEmbed ]}).catch(client.Logger.error)

                channel.send({ content: `🎉🎉 **Congratulations!** 🎉🎉🎉\nYou won **${giveaway.winners}x ${giveaway.prize}**\n\n- <@!${gWinners.join(">\n- <@!")}>`}).catch(client.Logger.error)

                return await client.schemas.giveaway.deleteOne({ id: giveaway.id });
            })
        }, 1000)
    };
};