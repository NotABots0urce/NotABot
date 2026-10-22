const { io } = require('socket.io-client');
const http = require('http');
http.createServer((req, res) => {
    res.end('bot en ligne');
}).listen(process.env.PORT || 3000);
const SERVER_URL = 'https://s0urce.io';
const MY_PLAYER_ID = '69bfe7652baa455bee3c111a';
const CONNECT_SID = 's%3ArxlR5TH86FgITRd1ZUSkTmThQ1KL36wO.hSRiT7BOX%2Fdo2aOMY4x%2BT43EKls%2Bx31uMcVyYB6EkdQ';
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
    function knowBTC(){
        socket.emit('updateBtc', {'btc':6.6800961959996705,'btcLastUpdated':1792686475982,'btcPerSecond':0.000051469713256499996}, (res) => {
            actualBTC = res.btc;
        });
    }
    function sendmessageglobal(messagechat){
        socket.emit('playerInput',{'event' :"sendGlobalChatMessage", message: messagechat});
    }
    socket.on('connect', () => {
        socket.io.engine.on('packetCreate', (p) => { if (p.data) console.log('ENVOYÉ :', p.data); });
        console.log('Socket connectée avec succès ! ID :', socket.id);

        socket.emit('playGame', MY_PLAYER_ID, (reponse) => {
            console.log('playGame réponse :', reponse);

            socket.emit('playerInput', { event: 'getBoosterInfo' });
            socket.emit('playerInput', { event: 'getPlayerMails' });
            socket.emit('playerInput', { event: 'joinGlobalChat', join: true });
            socket.emit('playerInput', { event: 'getClosestPlayersAndNPC' });
        });
    });

    socket.on('connect_error', (err) => {
        console.error('Erreur de connexion (Refusé par le serveur) :', err.message);
        if (err.data) {
            console.error('Données d\'erreur :', err.data);
        }
    });

    socket.onAny((eventName, ...args) => {
        console.log(`[DONNÉE REÇUE] ${eventName} -->`, JSON.stringify(args, null, 2));
        
    });

    socket.on('disconnect', (reason) => {
        console.warn('Déconnecté par le serveur :', reason);
        socket.close();
        setTimeout(startBot, 5000);
    });
    socket.on('event', function(data){
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
                setTimeout(() => send(id, sender, '- /filaPrice'), 700);
                setTimeout(() => send(id, sender, '- and nothing yet'), 900);
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
            if (text === '/tradeCommon'){
                grabLootFila();
                console.log('grabbed loot');
                setTimeout(() => commonFila = filament.common, 700);
                trade = 'common';
                sendTradRequest(sender);
                sended = 1;
                sendedchoice = 0;
            }
            if (text === '/tradeUncommon'){
                grabLootFila();
                console.log('grabbed loot');
                setTimeout(() => uncommonFila = filament.uncommon, 700);
                trade = 'uncommon';
                sendTradRequest(sender);
                sended = 1;
                sendedchoice = 0;
            }
            if (text === '/tradeRare'){
                grabLootFila();
                console.log('grabbed loot');
                setTimeout(() => rareFila = filament.rare, 700);
                trade = 'rare';
                sendTradRequest(sender);
                sended = 1;
                sendedchoice = 0;
            }
            if (text === '/tradeEpic'){
                grabLootFila();
                console.log('grabbed loot');
                setTimeout(() => epicFila = filament.epic, 700);
                trade = 'epic';
                sendTradRequest(sender);
                sended = 1;
                sendedchoice = 0;
            }
            if (text === '/tradeLeg'){
                grabLootFila();
                console.log('grabbed loot');
                setTimeout(() => legFila = filament.legendary, 700);
                trade = 'leg';
                sendTradRequest(sender);
                sended = 1;
                sendedchoice = 0;
            }
            if (text === '/tradeMythic'){
                grabLootFila();
                console.log('grabbed loot');
                setTimeout(() => myhticFila = filament.mythic, 700);
                trade = 'mythic';
                sendTradRequest(sender);
                sended = 1;
                sendedchoice = 0;
            }
            if (text === '/tradeEth'){
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
                print(want);
            }
            if (text === 'CPU'){
                send(id, sender, `Ok i wil print ${goodornot} ${trade} CPU`)
                want = `${trade}CPU`;
                console.log(want);
                print(want);
            }
            if (text === 'FW'){
                send(id, sender, `Ok i wil print ${goodornot} ${trade} FW`)
                want = `${trade}Firewall`;
                console.log(want);
                print(want);
            }
            if (text === 'GPU'){
                send(id, sender, `Ok i wil print ${goodornot} ${trade} GPU`)
                want = `${trade}GPU`;
                console.log(want);
                print(want);
            }
            if (text === 'N'){
                send(id, sender, `Ok i wil print ${goodornot} ${trade} basic item(CPU)`)
                want = `${trade}CPU`;
                console.log(want);
                print(want);
            }
            if (text === '/needmoney'){
                send(id, sender, 'Ok, i will send a trade request, push your items and i will buy them for file price (see with /filaPrice)');
                sendTradRequest(sender);
                trade = 'needargent';
                console.log(trade);
                sended = 1;
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
                    setTimeout(() => { good = 1; }, 2100);
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
                knowBTC();
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
                if (totalvalueoftrade >= actualBTC){
                    send(id, sender, 'sorry, not enough BTC wait a little');
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
            if (msgText === 'nigga' || msgText === 'nigga' || msgText === 'fuck' || msgText === 'fuck'){
                sendmessageglobal('Bro, that\'s not very kind... stop that or get reported');
            }
        }
    });
    const slotsFilaAgent = 290;
    const delai = slotsFilaAgent * 60 * 1000 * 3.2;
    const slotsItemAgent = 6;
    const delai2 = slotsItemAgent * 60 * 1000 * 80
    setTimeout(() => grabLootFila(), delai);
    setTimeout(() => shredLoot(), delai2);
}

startBot();
