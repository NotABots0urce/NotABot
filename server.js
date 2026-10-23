const express = require('express');
const cors = require('cors');
const { Client, GatewayIntentBits, ChannelType, PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const mongoose = require('mongoose');

const app = express();
app.use(cors());
app.use(express.json());

const uri = process.env.MONGO_URI;
if (!uri) {
    console.error('❌ MONGO_URI manquant dans les variables d\'environnement.');
    process.exit(1);
}
const http = require('http');
const https = require('https');
mongoose.connect(uri)
    .then(() => console.log('✅ Connecté à MongoDB'))
    .catch((err) => console.error('❌ Erreur connexion MongoDB:', err));

const configSchema = new mongoose.Schema({
    guildId: { type: String, required: true, unique: true },
    ticketChannelId: { type: String, default: null },
    s0urceChannelId: { type: String, default: null },
    themes: { type: [String], default: [] },
    modoRoles: { type: [String], default: [] }
});
const GuildConfig = mongoose.model('GuildConfig', configSchema);

const userSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    guildId: { type: String, required: true },
    username: { type: String, required: true },
    xp: {type: Number, default: 0},
    Level: {type: Number, default: 0}
});
userSchema.index({ userId: 1, guildId: 1 }, { unique: true });
const UserData = mongoose.model('UserData', userSchema);
const s0urceUserSchema = new mongoose.Schema({
    s0urceName: { type: String, required: true, unique: true },
    discordId: { type: String, required: true }
});
const S0urceUser = mongoose.model('S0urceUser', s0urceUserSchema);

async function getConfig(guildId) {
    let config = await GuildConfig.findOne({ guildId });
    if (!config) {
        config = await GuildConfig.create({ guildId });
    }
    return config;
}

process.on('unhandledRejection', (err) => console.error('❌ Unhandled rejection:', err));
process.on('uncaughtException', (err) => console.error('❌ Uncaught exception:', err));

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
    ]
});

client.on('error', (err) => console.error('❌ Client error:', err));
client.on('shardDisconnect', (e, id) => console.error(`❌ Shard ${id} déconnecté`, e?.code));

client.once('ready', () => {
    console.log(`🤖 Bot Discord connecté en tant que ${client.user.tag} !`);
});

client.on('messageCreate', async function(message){
    if (message.author.bot || !message.guild || !message.member) return;
});