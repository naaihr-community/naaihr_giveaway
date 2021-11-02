const mongoose = require("mongoose")

const giveawaySchema = new mongoose.model("giveaway", new mongoose.Schema({
    id: { type: Number },

    userid: { type: String },

    confirmed: { type: Boolean, default: false },

    guildid: { type: String },
    channelid: { type: String },
    messageid: { type: String, default: null },

    end: { type: Number },
    winners: { type: Number },
    prize: { type: String },

    participants: { type: Array, default: [] }
}))

module.exports = giveawaySchema;