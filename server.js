
const { io } = require('socket.io-client');
const mongoose = require('mongoose');
function stop() {
    console.log('Arrêt du bot...');
    mongoose.connection.close().finally(() => process.exit(0));
}
process.on('SIGINT', stop);
process.on('SIGTERM', stop);
process.on('exit', code => console.log("I'm out with code", code));

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ MongoDB connecté'))
    .catch((err) => console.error('❌ Erreur MongoDB :', err));

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    record: { type: Number, default: 0 },
    recordOwner: { type: String, default: null},
    someoneStopMyProject: { type: String, default: null}
});
const announceSchema = new mongoose.Schema({
    seller:      { type: String, required: true },
    item:        { type: String, required: true },
    price:       { type: String, required: true },
    description: { type: String, default: '' },
});
const Announce = mongoose.model('Announce', announceSchema);
const User = mongoose.model('User', userSchema);
const RECORD_KEY = 'GLOBAL_RECORD';
const http = require('http');
const https = require('https');
const express = require('express');
const app = express();
app.use(express.json());
process.on('uncaughtException', (err) => console.error('Erreur :', err));
http.createServer((req, res) => {
    res.end('bot en ligne');
}).listen(process.env.PORT || 3000);
setInterval(() => {
    https.get('https://notabot-qecj.onrender.com/ping', (res) => {}).on('error', () => {});
}, 15 * 1000);
const SERVER_URL = 'https://s0urce.io';
const MY_PLAYER_ID = '69bfe7652baa455bee3c111a';
const CONNECT_SID = 's%3AT1Rxov2oSgxNSLwEd-xnMa6jDioF9mHU.EjoGP5XTEGt7kf%2FZsEbrKojEE4F%2FL%2FZbXGpmExuECyo';
const adminsOFThebot = ['Titouan', 'NanderTGA', 'Nel'];
let sended = 0;
let accepted = null;
let confirmed = null;
let acceptedBot = null;
let confirmedBot = null;
let text = null;
let player = null;
let sender = null;
let id = null;
let filament = null;
let commonFila = 0;
let uncommonFila = 0;
let rareFila = 0;
let epicFila = 0;
let legFila = 0;
let myhticFila = 0;
let ethFila = 0;
let commonFilaPrice = 0.01;
let uncommonFilaPrice = 0.03;
let rareFilaPrice = 0.1;
let epicFilaPrice = 0.3;
let legFilaPrice = 1.5;
let myhticFilaPrice = 4.5;
let ethFilaPrice = 45;
let trade = null;
let goodornot = 0;
let want = null;
let newitem = null;
let slotneeded = 0;
let sendedchoice = 0;
let good = 0;
let actualBTC = 0;
let inventory = null;
let marketplace = false;
function startBot() {
    console.log('Tentative de connexion Socket.IO...');
    console.log('Longueur du cookie :', CONNECT_SID.length, '| début :', CONNECT_SID.slice(0, 5));

    const socket = io(SERVER_URL, {
        extraHeaders: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Origin': SERVER_URL,
            'Referer': `${SERVER_URL}/`,
            'Cookie': `connect.sid=${CONNECT_SID}; serverid=de_frankfurt_2`
        }
    });
    function send(id, user, msg) {
        socket.emit('playerInput', { event: 'sendChatMessage', username: user, message: msg });
    }
    function sends0urcemail(id, from, to, msg){
        socket.emit('playerInput', {event: 'sendmail', id: id, username: from, to: to, message: msg});
    }
    function print(want){
        socket.emit('playerInput', { event: 'printItem', id: want }, (res) => {
            const inv = res?.player_inventory.inventory;
            newitem = Object.keys(inv)[0];
            console.log('newitem =', newitem);

            sendtotrade(slotneeded, newitem);
        });
    }
    function grabLootFila(){
        socket.emit('playerInput',{event: 'claimFilamentLoot'}, (res) => {
            filament = res.filament;
            console.log(filament);
        })
    }
    function shredLoot(){
        socket.emit('playerInput',{event: 'shredComponentLoot'}, (res) => {
            filament = res.filament;
        })
    }
    function sendTradRequest(user){
        console.log('envoi sendTradeRequest à', JSON.stringify(user));
        socket.emit('playerInput',{event: 'sendTradeRequest',username: user});
    }
    function accept(){
        socket.emit('playerInput', {event: 'tradeWindowAccept',accepted: true});
    }
    function confirm(){
        socket.emit('playerInput', {event: 'tradeWindowConfirm',confirmed: true},);
    }
    function shredAllItems() {
        socket.emit('playerInput', { event: 'shredAllItems' }, (res) => {
            const filament = res.player_progress.filament;
            console.log(filament);
        });
    }
    
    function sendtotrade(slotneeded, newitem){
        socket.emit('playerInput', { event: 'moveItem', goalSlot: `trade_a_${slotneeded}`, goalID: null, dragSlot: newitem, dragID: newitem }, (res) => {
            console.log('moveItem ack :', res);
        });
    }
    function sendBTCtrade(totalvalueoftrade){
        socket.emit('playerInput',{event: 'setBtcTradeAmount',amount: totalvalueoftrade})
    }
    function sendmessageglobal(messagechat){
        socket.emit('playerInput',{'event' :"sendGlobalChatMessage", message: messagechat});
    }
    function getinventoryandshred(){
        socket.emit('playerInput',{event: 'getInventory'}, (res) => {
            inventory = res.data.inventory;
            Object.keys(inventory).filter(k => inventory[k].name !== 'Crow' && inventory[k].name !== 'Otter' && inventory[k].name !== 'Gobo').forEach((itemId, i) => {
                console.log('shred', itemId, '| id =', inventory[itemId].id, '| name =', inventory[itemId].name);
                setTimeout(() => {
                    gotoshredder(itemId);
                    setTimeout(() => shredAllItems(), 500);
                }, i * 1500);
            });
        })
    }
    function gotoshredder(iddelitem){
        socket.emit('playerInput', { event: 'moveItem', goalSlot: 'shredder_0', goalID: null, dragSlot: iddelitem, dragID: iddelitem }, (res) => {
            console.log('moveItem shredder ack :', JSON.stringify(res));
        });
    }
    socket.on('connect', () => {
        socket.io.engine.on('packetCreate', (p) => { if (p.data) console.log('ENVOYÉ :', p.data); });
        console.log('Socket connectée avec succès ! ID :', socket.id);

        socket.emit('playGame', MY_PLAYER_ID, async (reponse) => {
            console.log('playGame réponse :', reponse);

            socket.emit('playerInput', { event: 'getBoosterInfo' });
            socket.emit('playerInput', { event: 'getPlayerMails' });
            socket.emit('playerInput', { event: 'joinGlobalChat', join: true });
            socket.emit('playerInput', { event: 'getClosestPlayersAndNPC' });
            sendmessageglobal('hi !');
            const whorestartme = await User.findOneAndUpdate(
                { someoneStopMyProject: 'botmodos' },
                { someoneStopMyProject: null }
            );
            if (whorestartme){
                send(id, whorestartme.username, 'I\'m Back ! 😎');
            }
                });
            });

    socket.on('connect_error', (err) => {
        console.error('Erreur de connexion (Refusé par le serveur) :', err.message);
        if (err.data) {
            console.error('Données d\'erreur :', err.data);
        }
    });

    socket.onAny((eventName, ...args) => {
        if (args[0]?.event === 'updateCountryWarsGraph'){
            return;
        }
        console.log(`[DONNÉE REÇUE] ${eventName} -->`, JSON.stringify(args, null, 2));
        
    });

    socket.on('disconnect', (reason) => {
        console.warn('Déconnecté par le serveur :', reason);
        socket.close();
        setTimeout(startBot, 5000);
    });
    socket.on('event', async function(data){
        if (data.event == 'gotChatMessage'){
            text = data.arguments[0].message;
            player = data.arguments[0];
            sender = player.username;
            id = player.id;
            console.log(id);
            if (text === '/ping'){
                send(id, sender, 'pong 🏓');
            }
            if (text.startsWith('/commands')) {
                send(id, sender, 'list of commands:');
                setTimeout(() => send(id, sender, '- /filaPrice (see the fila price (2026))'), 700);
                setTimeout(() => send(id, sender, '- /ping (awnser pong 🏓 lol'), 900);
                setTimeout(() => send(id, sender, '- /tradeCommon or /trade(the rarety you want with a MAJUSCULE), he will print you fila for fila price'), 900);
                setTimeout(() => send(id, sender, '- /needmoney, he will buy you filament ⚠️ There is an autoshredder, the bot will never give back the smae items, this is not for more inventory space ⚠️'), 900);
                shredAllItems();
            }

            if (text.startsWith('/filaPrice')) {
                send(id, sender, 'fila price (2026):');
                setTimeout(() => send(id, sender, 'common: 0.01 BTC | uncommon: 0.03 BTC | rare: 0.1 BTC | epic: 0.3 BTC | legendary: 1.5 BTC | mythic: 4.5 BTC | ethereal: 45 BTC'), 700);
            }
            if (text === '/trade'){
                send(id, sender, 'how does loan works ? I have an eth GPU and PSU, so you give me BTC and i farm it, when you want with /recupBTC I will give you back your BTC * my BTC/sec * the number of second that i keep it, after 30 days,  stop counting the + you earn')
                sendTradRequest(sender);
                sended = 1;
            }
            if (text.startsWith('/') && !text === '/ping' || text.startsWith('/') && !text === '/commands' ||  text.startsWith('/') && !text === '/filaPrice'){
                send(id, sender, '❌ invalid command');
            }
            if (text === '/restart'){
                if (!adminsOFThebot.includes(sender)){
                    send(id, sender, 'How did you even know that command ? but you\'re not allowed to use it');
                } else {
                    send(id, sender, 'I will be back soon, more soon that you think...');
                    await User.findOneAndUpdate(
                        { username: sender },
                        { someoneStopMyProject: 'botmodos'},
                        { upsert: true }
                    );
                    setTimeout(stop, 2500);
                }

            }
            if (text === '/tradeCommon'){
                send(id, sender, 'ok i will send you a trade reuqest, put a factor of 0.01BTC for a valid trade');
                grabLootFila();
                console.log('grabbed loot');
                setTimeout(() => commonFila = filament.common, 700);
                trade = 'common';
                sendTradRequest(sender);
                sended = 1;
                sendedchoice = 0;
            }
            if (text === '/tradeUncommon'){
                send(id, sender, 'ok i will send you a trade reuqest, put a factor of 0.03BTC for a valid trade');
                grabLootFila();
                console.log('grabbed loot');
                setTimeout(() => uncommonFila = filament.uncommon, 700);
                trade = 'uncommon';
                sendTradRequest(sender);
                sended = 1;
                sendedchoice = 0;
            }
            if (text === '/tradeRare'){
                send(id, sender, 'ok i will send you a trade reuqest, put a factor of 0.1BTC for a valid trade');
                grabLootFila();
                console.log('grabbed loot');
                setTimeout(() => rareFila = filament.rare, 700);
                trade = 'rare';
                sendTradRequest(sender);
                sended = 1;
                sendedchoice = 0;
            }
            if (text === '/tradeEpic'){
                send(id, sender, 'ok i will send you a trade reuqest, put a factor of 0.3BTC for a valid trade');
                grabLootFila();
                console.log('grabbed loot');
                setTimeout(() => epicFila = filament.epic, 700);
                trade = 'epic';
                sendTradRequest(sender);
                sended = 1;
                sendedchoice = 0;
            }
            if (text === '/tradeLeg'){
                send(id, sender, 'ok i will send you a trade reuqest, put a factor of 1.5BTC for a valid trade');
                grabLootFila();
                console.log('grabbed loot');
                setTimeout(() => legFila = filament.legendary, 700);
                trade = 'leg';
                sendTradRequest(sender);
                sended = 1;
                sendedchoice = 0;
            }
            if (text === '/tradeMythic'){
                send(id, sender, 'ok i will send you a trade reuqest, put a factor of 4.5BTC for a valid trade');
                grabLootFila();
                console.log('grabbed loot');
                setTimeout(() => myhticFila = filament.mythic, 700);
                trade = 'mythic';
                sendTradRequest(sender);
                sended = 1;
                sendedchoice = 0;
            }
            if (text === '/tradeEth'){
                send(id, sender, 'ok i will send you a trade reuqest, put a factor of 45BTC for a valid trade');
                grabLootFila();
                console.log('grabbed loot');
                setTimeout(() => ethFila = filament.ethereal, 700);
                trade = 'eth';
                sendTradRequest(sender);
                sended = 1;
                sendedchoice = 0;
            }
            if (text === 'PSU'){
                send(id, sender, `Ok i wil print ${goodornot} ${trade} PSU`)
                want = `${trade}PSU`;
                console.log(want);
                for (let i = 0; i < goodornot; i++){
                    print(want);
                }
            }
            if (text === 'CPU'){
                send(id, sender, `Ok i wil print ${goodornot} ${trade} CPU`)
                want = `${trade}CPU`;
                console.log(want);
                for (let i = 0; i < goodornot; i++){
                    print(want);
                }
            }
            if (text === 'FW'){
                send(id, sender, `Ok i wil print ${goodornot} ${trade} FW`)
                want = `${trade}Firewall`;
                console.log(want);
                for (let i = 0; i < goodornot; i++){
                    print(want);
                }
            }
            if (text === 'GPU'){
                send(id, sender, `Ok i wil print ${goodornot} ${trade} GPU`)
                want = `${trade}GPU`;
                console.log(want);
                for (let i = 0; i < goodornot; i++){
                    print(want);
                }
            }
            if (text === 'N'){
                send(id, sender, `Ok i wil print ${goodornot} ${trade} basic item(CPU)`)
                want = `${trade}CPU`;
                console.log(want);
                for (let i = 0; i < goodornot; i++){
                    print(want);
                }
                
            }
            if (text === '/needmoney'){
                send(id, sender, 'Ok, i will send a trade request, push your items and i will buy them for file price (see with /filaPrice)');
                sendTradRequest(sender);
                trade = 'needargent';
                console.log(trade);
                sended = 1;
            }
            if (text.startsWith('/delete')){
                if (!adminsOFThebot.includes(sender)){
                    send(id, sender, 'How did you even know that command ? but you\'re not allowed to use it');
                    return;
                }
                const args = text.split(' ');
                const numberAsked = args[1];
                if (isNaN(numberAsked) || numberAsked < 1 || numberAsked > 10){
                    send(id, sender, 'Spécifie un numéro valide entre 1 et 10.');
                    return;
                }
                const annonces = await Announce.find().sort({ _id: -1 }).limit(10);
                const annonceVoulue = annonces[numberAsked - 1];
                if (!annonceVoulue){
                    send(id, sender, 'No announce find at this number');
                    return;
                }
                await Announce.deleteOne({ _id: annonceVoulue._id });
                send(id, sender, `the announce n°${numberAsked} was successfull deleted`);
            }
            if (text === '/marketplace'){
                send(id, sender, 'Here you are in the marketplace what did you want:');
                setTimeout(() => send(id, sender, '- see for see the offers'), 100);
                setTimeout(() => send(id, sender, '- sell <item> <price> <description> ex: sell firewallEthereal 115BTC I sell this firewall 8p !, if you want to sell a lot of items please send your shop ex: My shop undefBTC <the link>'), 200);
                setTimeout(() => send(id, sender, '- buy <number>'), 300);
                setTimeout(() => send(id, sender, '- exit for exit the marketplace'), 400);
                marketplace = true;
                
            }
            if (text === 'see'){
                if (marketplace == false){
                    send(id, sender, 'enter on the marketplace before')
                } else {
                    const annonces = await Announce.find().sort({ _id: -1 }).limit(10);
                    annonces.forEach((annonce, i) => {
                        setTimeout(() => {
                            send(id, sender, `${i + 1}: selled by: ${annonce.seller} item: ${annonce.item} price: ${annonce.price}, description: ${annonce.description}`)
                        }, i * 100);
                    }); 
                }
            }
            if (text.startsWith('sell')) {
                if (marketplace == false){
                    send(id, sender, 'enter on the marketplace before');
                    return;
                }
                const args = text.split(' ')
                const seller = sender;
                const item = args[1];
                const price = args[2];
                const description = args.slice(3).join(' ');
                if (!seller || !item || !price || !description){
                    send(id, sender, 'please made a schema like this: sell <item> <price> <description> ex: sell firewallEthereal 115BTC I sell this firewall 8p !');
                    return;
                }
                const newAnnouce = await Announce.create({ seller, item, price, description });
                send(id, sender, `succes ! your announce has been created: selled by: ${seller} item: ${item} price: ${price}, description: ${description}`);
                await fetch('https://notabot-discord.onrender.com/newAnnouce', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ names0urce: sender, seller, item, price, description })
                    
                });
            }
            if (text.startsWith('buy')){
                if (marketplace == false){
                    send(id, sender, 'enter on the marketplace before');
                    return;
                }
                const args = text.split(' ')
                const number = args[1];
                if (isNaN(number) || number < 1 || number > 10){
                    send(id, sender, 'specify a valid number please ex: buy 2');
                    return;
                } else {
                    send(id, send, 'OK, i send a mail to the person, he/she will contact you soon');
                }
            }
            if (text === 'exit'){
                marketplace = false;
                send(id, sender, 'you left the marketplace');
            }
            if (text === '/goat'){
                send(id, sender, 'Titouan is the goat 😎, bigd credits to nander for ideas (also try Yabluzo !)');
            }
            if (text === 'seeRecord'){
                const currentrecord = await User.findOne({ username: RECORD_KEY });
                if (!currentrecord || !currentrecord.record){
                    send(id, sender, 'No record yet !');
                } else {
                    send(id, sender, `The actual record is: ${currentrecord.record}sec by ${currentrecord.recordOwner}`);
                }
            }
            if (text === '/balance'){
                grabLootFila();
                console.log('grabbed loot');
                setTimeout(() => commonFila = filament.common, 100);
                setTimeout(() => uncommonFila = filament.uncommon, 100);
                setTimeout(() => rareFila = filament.rare, 100);
                setTimeout(() => epicFila = filament.epic, 100);
                setTimeout(() => legFila = filament.legendary, 100);
                setTimeout(() => myhticFila = filament.mythic, 100);
                setTimeout(() => ethFila = filament.ethereal, 100);
                setTimeout(() => send(id, sender, `I have: ${commonFila} common fila | ${uncommonFila} uncommon fila | ${rareFila} rare fila | ${epicFila} epic fila | ${legFila} legendary fila | ${myhticFila} mythic fila | ${ethFila} ethereal fila`), 300);
            }
        }
        if (data.event == 'updateTradeWindow' && sended == 1){
            const infos = data.arguments[0];
            const source = infos.states ?? infos.slots ?? infos.btc;
            const theotherID = Object.keys(source).find(id => id !== socket.id);
            if (infos.states){
                if (infos.states[theotherID].accepted && !infos.states[socket.id].accepted){
                    accepted = true;
                    setTimeout(accept, 2000);
                    acceptedBot = true;
                }
                if (infos.states[theotherID].confirmed){
                    confirmed = true;
                    setTimeout(confirm, 2000);
                    confirmedBot = true;
                    acceptedBot = null;
                    confirmedBot = null;
                    sended = 0;
                    setTimeout(() => { good = 1; }, 1900);
                }
            }
            if (trade === 'common'){
                const btcsend = infos.btc[theotherID];
                goodornot = btcsend/commonFilaPrice;
                if (Number.isInteger(goodornot)){
                    console.log(`je dois imprimer ${goodornot} items communs`)
                    if (goodornot  * 30 > commonFila){
                        send(id, sender, 'I don\'t have enough fila sorry');
                    } 
                    if (goodornot > 6){
                        send(id, sender, 'Too big ammount, don\'t have enough slots in the trade window');
                    } else {
                        if (sendedchoice !== 1){
                            setTimeout(() => send(id, sender, 'Is this for shred or try to have a great item ? awnser with the type you want(CPU; PSU; GPU; FW) or just N for a random item'), 700);
                            sendedchoice = 1;
                        }   
                    }
                } else {
                    send(id, sender, 'your ammount is not a divisor of the filaPrice of a commun item, please send a correct value')
                }
            }
            if (trade === 'uncommon'){
                const btcsend = infos.btc[theotherID];
                goodornot = btcsend/uncommonFilaPrice;
                if (Number.isInteger(goodornot)){
                    console.log(`je dois imprimer ${goodornot} items uncommuns`)
                    if (goodornot  * 30 > uncommonFila){
                        send(id, sender, 'I don\'t have enough fila sorry');
                    } 
                    if (goodornot > 6){
                        send(id, sender, 'Too big ammount, don\'t have enough slots in the trade window');
                    } else {
                        if (sendedchoice !== 1){
                            setTimeout(() => send(id, sender, 'Is this for shred or try to have a great item ? awnser with the type you want(CPU; PSU; GPU; FW) or just N for a random item'), 700);
                            sendedchoice = 1;
                        }   
                    }
                } else {
                    send(id, sender, 'your ammount is not a divisor of the filaPrice of a commun item, please send a correct value')
                }
            }
            if (trade === 'rare'){
                const btcsend = infos.btc[theotherID];
                goodornot = btcsend/rareFilaPrice;
                if (Number.isInteger(goodornot)){
                    console.log(`je dois imprimer ${goodornot} items arre`)
                    if (goodornot  * 30 > rareFila){
                        send(id, sender, 'I don\'t have enough fila sorry');
                    } 
                    if (goodornot > 6){
                        send(id, sender, 'Too big ammount, don\'t have enough slots in the trade window');
                    } else {
                        if (sendedchoice !== 1){
                            setTimeout(() => send(id, sender, 'Is this for shred or try to have a great item ? awnser with the type you want(CPU; PSU; GPU; FW) or just N for a random item'), 700);
                            sendedchoice = 1;
                        }   
                    }
                } else {
                    send(id, sender, 'your ammount is not a divisor of the filaPrice of a commun item, please send a correct value')
                }
            }
            if (trade === 'epic'){
                const btcsend = infos.btc[theotherID];
                goodornot = btcsend/epicFilaPrice;
                if (Number.isInteger(goodornot)){
                    console.log(`je dois imprimer ${goodornot} items epics`)
                    if (goodornot  * 30 > epicFila){
                        send(id, sender, 'I don\'t have enough fila sorry');
                    } 
                    if (goodornot > 6){
                        send(id, sender, 'Too big ammount, don\'t have enough slots in the trade window');
                    } else {
                        if (sendedchoice !== 1){
                            setTimeout(() => send(id, sender, 'Is this for shred or try to have a great item ? awnser with the type you want(CPU; PSU; GPU; FW) or just N for a random item'), 700);
                            sendedchoice = 1;
                        }   
                    }
                } else {
                    send(id, sender, 'your ammount is not a divisor of the filaPrice of a commun item, please send a correct value')
                }
            }
            if (trade === 'leg'){
                const btcsend = infos.btc[theotherID];
                goodornot = btcsend/legFilaPrice;
                if (Number.isInteger(goodornot)){
                    console.log(`je dois imprimer ${goodornot} items leg`)
                    if (goodornot  * 30 > legFila){
                        send(id, sender, 'I don\'t have enough fila sorry');
                    } 
                    if (goodornot > 6){
                        send(id, sender, 'Too big ammount, don\'t have enough slots in the trade window');
                    } else {
                        if (sendedchoice !== 1){
                            setTimeout(() => send(id, sender, 'Is this for shred or try to have a great item ? awnser with the type you want(CPU; PSU; GPU; FW) or just N for a random item'), 700);
                            sendedchoice = 1;
                        }   
                    }
                } else {
                    send(id, sender, 'your ammount is not a divisor of the filaPrice of a commun item, please send a correct value')
                }
            }
            if (trade === 'mythic'){
                const btcsend = infos.btc[theotherID];
                goodornot = btcsend/myhticFilaPrice;
                if (Number.isInteger(goodornot)){
                    console.log(`je dois imprimer ${goodornot} items mythic`)
                    if (goodornot  * 30 > myhticFila){
                        send(id, sender, 'I don\'t have enough fila sorry');
                    } 
                    if (goodornot > 6){
                        send(id, sender, 'Too big ammount, don\'t have enough slots in the trade window');
                    } else {
                        if (sendedchoice !== 1){
                            setTimeout(() => send(id, sender, 'Is this for shred or try to have a great item ? awnser with the type you want(CPU; PSU; GPU; FW) or just N for a random item'), 700);
                            sendedchoice = 1;
                        }   
                    }
                } else {
                    send(id, sender, 'your ammount is not a divisor of the filaPrice of a commun item, please send a correct value')
                }
            }
            if (trade === 'eth'){
                const btcsend = infos.btc[theotherID];
                goodornot = btcsend/ethFilaPrice;
                if (Number.isInteger(goodornot)){
                    console.log(`je dois imprimer ${goodornot} items eth`)
                    if (goodornot  * 30 > ethFila){
                        send(id, sender, 'I don\'t have enough fila sorry');
                    } 
                    if (goodornot > 6){
                        send(id, sender, 'Too big ammount, don\'t have enough slots in the trade window');
                    } else {
                        if (sendedchoice !== 1){
                            setTimeout(() => send(id, sender, 'Is this for shred or try to have a great item ? awnser with the type you want(CPU; PSU; GPU; FW) or just N for a random item'), 700);
                            sendedchoice = 1;
                        }   
                    }
                } else {
                    send(id, sender, 'your ammount is not a divisor of the filaPrice of a commun item, please send a correct value')
                }
            }
            if (trade === 'needargent' && infos.slots){
                console.log('le trade est bein en needargent');
                const hisSlots = infos.slots[theotherID] ?? [];
                const rarities = hisSlots.filter(Boolean).map(it => it.rarity);
                let totalvalueoftrade = 0;
                rarities.forEach(newItemInTrade => {
                    if (newItemInTrade === 'D'){
                        totalvalueoftrade += 0.01;
                    }
                    if (newItemInTrade === 'C'){
                        totalvalueoftrade += 0.03;
                    }
                    if (newItemInTrade === 'B'){
                        totalvalueoftrade += 0.1;
                    }
                    if (newItemInTrade === 'A'){
                        totalvalueoftrade += 0.3;
                    }
                    if (newItemInTrade === 'S'){
                        totalvalueoftrade += 1.5;
                    }
                    if (newItemInTrade === 'SS'){
                        totalvalueoftrade += 4.5;
                    }
                    if (newItemInTrade === 'SSS'){
                        totalvalueoftrade += 45;
                    }
                });
                if (totalvalueoftrade > actualBTC){
                    send(id, sender ,'i\'m broke sorry');
                    return;
                }
                sendBTCtrade(totalvalueoftrade);
            }

            if (good == 1){
                send(id, sender, 'thanks for the trade')
                good = 0;
            }
        }
        if (data.event === 'gotGlobalRoomMessage'){
            const msgText = data.arguments[0].content;
            if (msgText === 'nigga' || msgText === 'Nigga' || msgText === 'fuck' || msgText === 'Fuck'){
                sendmessageglobal('Bro, that\'s not very kind... stop that or get reported');
            }
        }
        if (data.event === 'gotTradeInvite'){
            sender = data.arguments[0].from;
            id = data.arguments[0].from_id;
            send(id, sender, 'Asks for trade are dismissed');
        }
        if (data.event === 'updateBtc'){
            actualBTC = data.arguments[0].btc;
            console.log(actualBTC);
        }
        if (data.event === 'closeTradeWindow'){
            const status = data.arguments[0].status;
            if (status === 'success'){
                setTimeout(getinventoryandshred, 1500);
            }
        }
        if (data.event === 'initPlayer'){
            actualBTC = data.arguments[0].btcUpdate.btc;
        }
        if (data.event === 'gotHacked'){
            const infos = data.arguments[0];
            id = infos.id;
            sender = infos.attacker;
            const TotalHackTime = infos.total_hack_duration;
            const currentrecord = await User.findOne({ username: RECORD_KEY });
            if (currentrecord && currentrecord.record > TotalHackTime){
                send(id, sender, `GG by hack me on ${TotalHackTime}sec, But the record is ${currentrecord.record} by ${currentrecord.recordOwner}`);
            } else {
                await User.findOneAndUpdate(
                    { username: RECORD_KEY },
                    { record: TotalHackTime, recordOwner: sender},
                    { upsert: true }
                );
                send(id, sender, `🏆 ! You made A new record ! : ${TotalHackTime} by ${sender}`);
            }
        }
    });
    const slotsFilaAgent = 290;
    const delai = slotsFilaAgent * 60 * 1000 * 3.2;
    const slotsItemAgent = 7;
    const delai2 = slotsItemAgent * 60 * 1000 * 80
    setTimeout(() => grabLootFila(), delai);
    setTimeout(() => shredLoot(), delai2);
    app.post('/sendMailFromDiscord', async (req, res) => {
        res.sendStatus(200);
        const { from, to } = req.body;
        sends0urcemail(id, from, to, `${from} want to buy you something !`)
    });
}

startBot();
