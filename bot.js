const Discord = require('discord.js');
const client = new Discord.Client();
const config = require('./config.json');
const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')
const adapter = new FileSync('database.json')
const db = low(adapter)

client.on('ready', () => {
	console.log(`Logado como: ${client.user.tag}!`);
	console.log(`Esse Bot é utilizado em mais de ${client.guilds.size} servidores!`);
});

// add this guild to database
client.on("guildCreate", guild => {
	db.set(guild.id, {
		countChannels: []
		}).write()
})

// remove this guild from database
client.on("guildDelete", guild => {
	db.get(guild.id).remove().write()
})

function getTopycMsg(qtd){
	qtd = qtd.toString();
	qtdStr = '';
	
	for (var i = 0; i < qtd.length; i++) {
		switch(qtd.charAt(i)){
			case '0':
				qtdStr += '<a:0RS:696501768099725353>'
				break;
			case '1':
				qtdStr += '<a:1RS:696501768321892372>'
				break;
			case '2':
				qtdStr += '<a:2RS:696501769651617853>'
				break;
			case '3':
				qtdStr += '<a:3RS:696501769232187442>'
				break;
			case '4':
				qtdStr += '<a:4RS:696501769408348212>'
				break;
			case '5':
				qtdStr += '<a:5RS:696501769546498048>'
				break;
			case '6':
				qtdStr += '<a:6RS:696501769685172234>>'
				break;
			case '7':
				qtdStr += '<a:7RS:696501769659875398>'
				break;
			case '8':
				qtdStr += '<a:8RS:696501769819389972>'
				break;
			case '9':
				qtdStr += '<a:9RS:696501769534046221>'
				break;
		}
	}
	
	msg = `Total de ${qtdStr} membros no servidor!`;
	
	return msg;
}

client.on('message', async message => {
	
	if(message.author.bot) return;
    if(message.channel.type === 'dm') return;
    if(!message.content.startsWith(config.prefix)) return;
	if(!message.member.hasPermission('ADMINISTRATOR')) return;
	
	const args = message.content.slice(config.prefix.length).trim().split(/ +/g);
	const comand = args.shift().toLowerCase();
	
	if (comand === 'contador-add') {

		if(db.get(`${message.guild.id}.countChannels`).find({id: message.channel.id}).value() == null){
				
			db.get(`${message.guild.id}.countChannels`).push({id: message.channel.id}).write();
			
			let channel = message.guild.channels.cache.get(message.channel.id);
			channel.setTopic(getTopycMsg(message.guild.members.cache.filter(member => !member.user.bot).size))
				.catch(console.error);
			
			message.reply('Contador de membros adicionado para esse canal!');
		}
		else{
			message.reply('Contador de membros já foi adicionado para esse canal!');
		}
		
	}
	else if (comand === 'contador-remover') {
		
		if(db.get(`${message.guild.id}.countChannels`).find({id: message.channel.id}).value() == null){
			message.reply('Não tem contador de membros adicionado para esse canal!');
		}
		else{
			let channel = message.guild.channels.cache.get(message.channel.id);
			channel.setTopic('')
				.catch(console.error);
				
			db.get(`${message.guild.id}.countChannels`).remove({id: message.channel.id}).write();
			
			message.reply('Contador de membros removido!');
		}
	}
	else if(comand === 'contador-atualizar'){
		console.log('atualizando..');
		db.get(`${message.guild.id}.countChannels`).value().forEach(channelDB => { 
			let channel = message.guild.channels.cache.get(channelDB.id);
			channel.setTopic(getTopycMsg(message.guild.members.cache.filter(member => !member.user.bot).size))
				.catch(console.error);
		});
		
		message.reply('Contadores de membros atualizados!');
	}
	
});

// update member counter on channels topic when member join guild
client.on('guildMemberAdd', async member => {
	db.get(`${member.guild.id}.countChannels`).value().forEach(channelDB => { 
		let channel = member.guild.channels.cache.get(channelDB.id);
		channel.setTopic(getTopycMsg(member.guild.members.cache.filter(member => !member.user.bot).size))
			.catch(console.error);
	});
});

// update member counter on channels topic when member leave guild
client.on('guildMemberRemove', async member => {
	db.get(`${member.guild.id}.countChannels`).value().forEach(channelDB => { 
		let channel = member.guild.channels.cache.get(channelDB.id);
		channel.setTopic(getTopycMsg(member.guild.members.cache.filter(member => !member.user.bot).size))
			.catch(console.error);
	}); 
});

// remove member counter channel from database if the channel is delete
client.on('channelDelete', async channel => {
	if(db.get(`${channel.guild.id}.countChannels`).find({id: channel.id}).value() != null){	
		db.get(`${channel.guild.id}.countChannels`).remove({id: channel.id}).write();
	}
});


client.login(config.token);