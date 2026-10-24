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
const jokes = [
    "Why don't scientists trust atoms? Because they make up everything! ⚛️",
    "I told my doctor that I broke my arm in two places. He told me to stop going to those places 🏥",
    "Why do we tell actors to 'break a leg'? Because every play has a cast 🎭",
    "What do you call a fake noodle? An impasta 🍝",
    "Why don't eggs tell jokes? They'd crack each other up 🥚",
    "My wife told me to stop impersonating a flamingo. I had to put my foot down 🦩"
]

let xpNeeded = 0;
let xpPerMessage = 0;

let s0urceChannel = null;
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

client.on('guildMemberAdd', async (member) => {

});

const CloseTicket = async function (Ticket) {
    const CloseMessage = await Ticket.send({ components: [new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId('close_ticket').setLabel('Close').setEmoji('🔒').setStyle(ButtonStyle.Danger))]});
    await CloseMessage.pin().catch(err => console.error('Erreur épinglage:', err));
};

const SendTicket = async function(ticketChannel) {
    const CreateticketEmbed = new EmbedBuilder()
        .setTitle('Tickets')
        .setColor('#1E3A8A')
        .setDescription('Ouvre un ticket pour commencer une conversation avec le staff');

    const row = new ActionRowBuilder();

    const OpenTicket = new ButtonBuilder()
        .setCustomId('OpenTicket')
        .setLabel('Créer un ticket')
        .setEmoji('📩')
        .setStyle(ButtonStyle.Secondary);

    row.addComponents(OpenTicket);

    await ticketChannel.send({ embeds: [CreateticketEmbed], components: [row] });
};

const SendThemes = async function(interaction, config) {
    const row = new ActionRowBuilder();

    const ticketEmbed = new EmbedBuilder()
        .setTitle('Choisir un thème')
        .setColor('#1E3A8A')
        .setDescription('Veuillez cliquer sur le bouton qui contient votre demande');

    config.themes.slice(0, 5).forEach((theme) => {
        row.addComponents(
            new ButtonBuilder()
                .setCustomId(`select_themes_${theme}`)
                .setLabel(theme)
                .setStyle(ButtonStyle.Success)
        );
    });

    await interaction.reply({ embeds: [ticketEmbed], components: [row], ephemeral: true });
};

const SendVerifTickets = async function(TicketsChanel, message) {
    const ticketEmbed = new EmbedBuilder()
        .setTitle('Résultats de la recherche de chaine')
        .setColor('#1E3A8A');

    const rows = [];

    if (TicketsChanel.size > 1) {
        ticketEmbed.setDescription('Veuillez cliquer sur le bouton qui contient la chaine voulue pour le post de ticket');

        const channels = [...TicketsChanel.values()].slice(0, 25);
        for (let i = 0; i < channels.length; i += 5) {
            const row = new ActionRowBuilder();
            channels.slice(i, i + 5).forEach((channel) => {
                row.addComponents(
                    new ButtonBuilder()
                        .setCustomId(`select_channel_${channel.id}`)
                        .setLabel(channel.name.slice(0, 80))
                        .setStyle(ButtonStyle.Primary)
                );
            });
            rows.push(row);
        }
    } else {
        const channel = TicketsChanel.first();
        ticketEmbed.setDescription(`chaine trouvée: ${channel.name}`);
        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('good').setLabel('Good !').setStyle(ButtonStyle.Success),
            new ButtonBuilder().setCustomId('false').setLabel('No !').setStyle(ButtonStyle.Danger)
        );
        rows.push(row);
    }

    await message.channel.send({ embeds: [ticketEmbed], components: rows });
};

client.on('guildCreate', async (guild) => {
    console.log(`🚀 Le bot a rejoint un nouveau serveur : ${guild.name}`);
});

client.on('messageCreate', async (message) => {
    try {
        if (message.author.bot || !message.guild || !message.member) return;

        const config = await getConfig(message.guild.id);

        const isModo = message.member.roles.cache.some(role =>
            config.modoRoles.map(r => r.toLowerCase()).includes(role.name.toLowerCase())
        );
        const text = message.content;

        let sender = await UserData.findOne({ userId: message.author.id, guildId: message.guild.id });
        if (!sender) sender = new UserData({ userId: message.author.id, guildId: message.guild.id, username: message.author.username });
        sender.xp += xpPerMessage;
        if (sender.xp >= xpNeeded) {
            sender.Level += 1;
            message.member.roles.add(message.guild.roles.cache.find(r => r.name === `Level ${sender.Level}`));
            await message.channel.send(`congrats: <@${message.author.id}> Est passé ${sender.Level}`);
            sender.xp = 0;
        }
        await sender.save();

        if (text === '/ping') {
            if (!isModo) {
                return message.reply("❌ Tu n'as pas les permissions d'administrateur pour utiliser cette commande !");
            }
            await message.reply('Pong! 🏓');
            return;
        }
        if (text.startsWith('/defxpLevel')) {
            if (!isModo) {
                return message.reply("❌ Tu n'as pas les permissions d'administrateur pour utiliser cette commande !");
            }
            const xpwanted = text.replace('/defxpLevel', '');
            xpNeeded = parseInt(xpwanted);
            await message.reply(`Maintenant les utilisateurs gagneront un niveau tous les ${xpwanted}xp`);
        }

        if (text.startsWith('/defxpMessage')) {
            if (!isModo) {
                return message.reply("❌ Tu n'as pas les permissions d'administrateur pour utiliser cette commande !");
            }
            const xpMessage = text.replace('/defxpMessage', '');
            await message.reply(`Maintenant les utilisateurs gagneront ${xpMessage}xp par message`);
            xpPerMessage = parseInt(xpMessage);
        }

        if (text === "/add-ticket") {
            if (!isModo) {
                return message.reply("❌ Tu n'as pas les permissions d'administrateur pour utiliser cette commande !");
            }

            await message.guild.roles.fetch();
            let staffRole = message.guild.roles.cache.find(role => role.name.toLowerCase() === 'staff');

            if (!staffRole) {
                try {
                    staffRole = await message.guild.roles.create({
                        name: 'Staff',
                        color: '#1E3A8A',
                        reason: 'Création automatique par le bot de tickets'
                    });
                    await message.channel.send('✅ Rôle **Staff** créé automatiquement !');
                } catch (err) {
                    console.error('Erreur création rôle Staff:', err);
                    return message.reply("❌ Impossible de créer le rôle Staff. Vérifie que mon rôle est bien placé au-dessus dans la hiérarchie et que j'ai la permission *Gérer les rôles*.");
                }
            }

            if (!message.member.roles.cache.has(staffRole.id)) {
                try {
                    await message.member.roles.add(staffRole);
                    await message.channel.send(`✅ ${message.member} a été ajouté au rôle **Staff**.`);
                } catch (err) {
                    console.error('Erreur ajout rôle Staff:', err);
                    await message.channel.send("⚠️ Rôle Staff trouvé/créé mais je n'ai pas pu te l'attribuer (permissions/hiérarchie).");
                }
            }

            const fetchedChannels = await message.guild.channels.fetch();
            const TicketsChanel = fetchedChannels.filter(
                (channel) => channel
                    && channel.name.toLowerCase().includes('ticket')
                    && !channel.name.toLowerCase().startsWith('ticket-')
                    && (channel.type === ChannelType.GuildText || channel.type === ChannelType.GuildAnnouncement)
            );

            if (TicketsChanel.size === 0) {
                await message.channel.send("❌ Il n'y a pas de salon comportant : tickets");
                return;
            } else {
                await SendVerifTickets(TicketsChanel, message);
            }
        }
        if (text === '/joke') {
            const joke = jokes[Math.floor(Math.random() * jokes.length)];
            await message.channel.send(senderNumber, { text: joke });
            return;
        }

        if (text.startsWith("/ticket-themes")) {
            if (!isModo) {
                return message.reply("❌ Tu n'as pas les permissions d'administrateur pour utiliser cette commande !");
            }

            const args = text.slice("/ticket-themes".length).trim();
            if (!args) {
                return await message.channel.send("❌ Tu dois indiquer des thèmes séparés par une virgule (ex: /ticket-themes bug, question, autre)");
            }

            const themes = args.split(',').map(theme => theme.trim()).filter(Boolean);
            config.themes = themes;
            await config.save();

            await message.channel.send('✅ thèmes mis à jour ! J\'envoie le message');

            if (config.ticketChannelId) {
                const ticketChannel = await message.guild.channels.fetch(config.ticketChannelId).catch(() => null);
                if (ticketChannel) {
                    await SendTicket(ticketChannel);
                } else {
                    await message.channel.send('❌ Le salon de ticket enregistré est introuvable, redéfinis-le avec /add-ticket.');
                }
            } else {
                await message.channel.send('❌ Aucun salon de ticket n\'a été sélectionné au préalable.');
            }
        }

        if (text.startsWith('/def-modos')) {
            const args = text.slice("/def-modos".length).trim();
            if (!args) {
                return await message.channel.send("❌ Tu dois indiquer des roles séparés par une virgule (ex: /def-modos apprentis-modo, modo-prime, goats)");
            }

            const modos = args.split(',').map(theme => theme.trim()).filter(Boolean);

            const invalidRoles = modos.filter(modoName =>
                !message.guild.roles.cache.find(role => role.name.toLowerCase() === modoName.toLowerCase())
            );
            if (invalidRoles.length > 0) {
                return await message.channel.send(`❌ Les rôles suivants n'existent pas sur ce serveur : ${invalidRoles.join(', ')}`);
            }

            config.modoRoles = modos;
            await config.save();
            await message.channel.send("✅ Rôles de modération enregistrés avec succès !");
        }
        if (text === '/s0urceHere') {
            config.s0urceChannelId = message.channel.id;
            s0urceChannel = message.channel;
            await config.save();
            if (s0urceChannel) {
                await message.channel.send('Success, the channel have been defined for s0urce');
            }

        }
        if (text.startsWith('/s0urceName')) {
            const pseudo = text.slice('/s0urceName'.length).trim().toLowerCase();
            await S0urceUser.findOneAndUpdate(
                { s0urceName: pseudo },
                { s0urceName: pseudo, discordId: message.author.id },
                { upsert: true }
            );
            await message.reply('✅ Pseudo associé !');
        }
    } catch (err) {
        console.error('Erreur messageCreate:', err);
    }   
});

client.on('interactionCreate', async function(interaction) {
    if (!interaction.isButton()) return;

    try {
        const config = await getConfig(interaction.guild.id);

        if (interaction.customId.startsWith('select_channel_')) {
            const ChanelId = interaction.customId.replace('select_channel_', '');
            const selectedChannel = interaction.guild.channels.cache.get(ChanelId);

            if (!selectedChannel) {
                return await interaction.reply({ content: "❌ Salon introuvable.", ephemeral: true });
            }

            config.ticketChannelId = selectedChannel.id;
            await config.save();
            await interaction.reply({ content: 'Maintenant chosissez les thèmes des tickets avec /ticket-themes (themes séparés par une ,)', ephemeral: true });
        }

        if (interaction.customId === "good") {
            const selectedChannel = interaction.guild.channels.cache.find(
                (channel) => channel.name.toLowerCase().includes('ticket') && channel.type === ChannelType.GuildText
            );

            if (!selectedChannel) {
                return await interaction.reply({ content: "❌ Salon introuvable.", ephemeral: true });
            }

            config.ticketChannelId = selectedChannel.id;
            await config.save();
            await interaction.reply({ content: 'Maintenant chosissez les thèmes des tickets avec /ticket-themes (themes séparés par une ,)', ephemeral: true });
        }

        if (interaction.customId === "false") {
            await interaction.reply({ content: '❌ Relance la commande et si le problème persiste mp moi et envoie @aide', ephemeral: true });
        }

        if (interaction.customId === "OpenTicket") {
            await SendThemes(interaction, config);
        }

        if (interaction.customId.startsWith('select_themes_')) {
            const userName = interaction.user.username.toLowerCase();
            const theme = interaction.customId.replace('select_themes_', '');

            const staffRole = interaction.guild.roles.cache.find(role => role.name.toLowerCase() === 'staff');
            const staffRoleId = staffRole ? staffRole.id : interaction.guild.id;
            const staffMention = staffRole ? `<@&${staffRole.id}>` : "@everyone";

            const Ticket = await interaction.guild.channels.create({
                name: `ticket-${userName}-${theme}`,
                type: ChannelType.GuildText,
                permissionOverwrites: [
                    {
                        id: interaction.guild.id,
                        deny: [PermissionFlagsBits.ViewChannel],
                    },
                    {
                        id: interaction.user.id,
                        allow: [
                            PermissionFlagsBits.ViewChannel,
                            PermissionFlagsBits.SendMessages,
                            PermissionFlagsBits.ReadMessageHistory
                        ],
                    },
                    {
                        id: staffRoleId,
                        allow: [
                            PermissionFlagsBits.ViewChannel,
                            PermissionFlagsBits.SendMessages,
                            PermissionFlagsBits.ReadMessageHistory
                        ],
                    },
                ],
            });

            await Ticket.send(`${staffMention}, un nouveau ticket pour ${theme}`);
            await Ticket.send(`<@${interaction.user.id}>, ton ticket a été pris en compte, un membre du staff va bientôt te répondre`);
            await interaction.reply({ content: `✅ Ton salon a été créé : ${Ticket}`, ephemeral: true });
            await CloseTicket(Ticket);
        }

        if (interaction.customId === "close_ticket") {
            await interaction.reply('🔒 Fermeture du ticket dans 5 secondes...');
            setTimeout(async () => {
                try {
                    await interaction.channel.delete('Ticket fermé');
                } catch (err) {
                    console.error('Erreur suppression salon:', err);
                }
            }, 5000);
        }
    } catch (err) {
        console.error('Erreur interactionCreate:', err);
        if (interaction.isRepliable() && !interaction.replied && !interaction.deferred) {
            await interaction.reply({ content: '❌ Une erreur est survenue.', ephemeral: true }).catch(() => {});
        }
    }
});

app.get('/ping', (req, res) => {
    res.send('OK');
});

app.get('/', (req, res) => {
    res.send('Bot Discord en ligne !');
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`🚀 Serveur web Discord actif sur le port ${port}`);
    fetch('https://discord.com/api/v10/gateway').then(r => console.log('[test] status', r.status)).catch(e => console.log('[test] erreur', e.message));

    const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
    if (!DISCORD_TOKEN) {
        console.error('❌ DISCORD_TOKEN manquant dans les variables d\'environnement.');
        process.exit(1);
    }
    client.on('debug', (info) => console.log('[debug]', info));
    client.on('shardError', (err) => console.error('❌ shardError:', err));
    client.rest.on('rateLimited', (info) => console.log('[rateLimit]', info));
    client.login(DISCORD_TOKEN).catch((err) => console.error('❌ Login échoué:', err));
});
setInterval(() => {
    http.get(`http://localhost:${port}/ping`, (res) => {}).on('error', () => {});
    https.get('https://mechabeaverd-mm41.onrender.com', (res) => {}).on('error', () => {});
}, 5 * 60 * 1000);


app.post('/sendTime', async (req, res) => {
    res.sendStatus(200);

    const pseudo = (req.body.realUsername || '').toLowerCase();
    const user = await S0urceUser.findOne({ s0urceName: pseudo });
    if (!user) {
        return;
    }
    const delai = timeTowait;

    setTimeout(async () => {
        try { 
            if (!s0urceChannel) {
                const config = await GuildConfig.findOne({});
                if (config && config.s0urceChannelId) {
                    s0urceChannel = await client.channels.fetch(config.s0urceChannelId).catch(() => null);
                }
            }
            if (s0urceChannel) {
                await s0urceChannel.send(`<@${user.discordId}>, il est temps de looter les agents !`);
            } else {
                console.log('❌ Aucun salon s0urce n\'a été trouvé.');
            }
        }
        catch (err) {
            console.error('Erreur lors de l\'envoi du message s0urce:', err);
        }
    }, delai);
});
app.post('/sendTime2', async (req, res) => {
    res.sendStatus(200);

    const pseudo = (req.body.realUsername || '').toLowerCase();
    const user = await S0urceUser.findOne({ s0urceName: pseudo });
    if (!user) {
        return;
    }
    const delai = 2 * 60;

    setTimeout(async () => {
        try { 
            if (!s0urceChannel) {
                const config = await GuildConfig.findOne({});
                if (config && config.s0urceChannelId) {
                    s0urceChannel = await client.channels.fetch(config.s0urceChannelId).catch(() => null);
                }
            }
            if (s0urceChannel) {
                await s0urceChannel.send(`<@${user.discordId}>, il est temps de looter les agents !`);
            } else {
                console.log('❌ Aucun salon s0urce n\'a été trouvé.');
            }
        }
        catch (err) {
            console.error('Erreur lors de l\'envoi du message s0urce:', err);
        }
    }, delai);
});
