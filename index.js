const qrcode = require('qrcode-terminal');
const { Client, LocalAuth } = require('whatsapp-web.js');
const { Configuration, OpenAIApi } = require("openai");

const configuration = new Configuration({
    apiKey: '',
  });
  const openai = new OpenAIApi(configuration);

const client = new Client({
    authStrategy: new LocalAuth(
        clientId = "my_wpp"
    ),
    qrMaxRetries: 5,
    puppeteer: { 
        headless: true,
        channel: 'chrome',
        args: ['--no-sandbox', '--max_old_space_size']
    }
});

client.on('qr', qr => {
    qrcode.generate(qr, {small: true});
});

client.on('authenticated', () => {
    console.log('Authenticated!')
});

client.on('ready', () => {
    console.log('Client is ready!');
});

client.on('message', async msg => {
    console.log(`${msg.from} | ${msg.body}`)
    if (msg.body.includes('!ai')) {

        await client.sendMessage(msg.from, "Tunggu yah....")

        const pesan = msg.body.replace(/\!ai /, '')

        openai.createCompletion({
            model: "text-davinci-003",
            prompt: pesan,
            temperature: 0.9,
            max_tokens: 2000,
            top_p: 1,
            frequency_penalty: 0,
            presence_penalty: 0.6,
            stop: [" Human:", " AI:"],
        }).then(async (result) => {
            if(result.data.choices.length >= 1){
                await client.sendMessage(msg.from, result.data.choices[0].text)
            } else {
                await client.sendMessage(msg.from, "LIMIT, silakan coba nanti")
            }
        }).catch(error => {
            console.log(error)
        })
    }

    if(!msg.body.includes('!ai')){
        await client.sendMessage(msg.from, "Gunakan perintah !ai *pertanyaan*\n\nContoh\n!ai nama presiden indonesia sekarang\n\nAda kendala? DM Instagram *rul.g*")
    }
});

client.initialize();
