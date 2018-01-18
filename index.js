const TelegramBot = require('node-telegram-bot-api');
const request = require('request')
const fs = require('fs')
const _ = require('lodash')

const token = '468242201:AAE7yPHCucLySu4_wWeTx12egpxQ0dT-nGg';

const bot = new TelegramBot(token, {
  polling: true
});


const KB = {
  currency: 'Курс валют',
  picture: 'Картинка', 
  cat: 'Котик',
  car: 'Машина',
  back: 'Назад'
}



const PicSrcs = {
  [KB.cat]:[
    'cat1.jpg',
    'cat2.jpg',
    'cat3.jpg'
  ],
  [KB.car]:[
  'car1.png',
  'car2.jpg',
  'car3.jpg'
  ]
}


bot.onText(/\/start/, msg => {
  console.log(msg);
  console.log('test:'+ msg.chat.first_name);
  sendGreeting(msg, true);
});


bot.on('message', msg => {
  switch (msg.text) {
    case KB.picture:
      sendPictureScreen(msg.chat.id)
      break
    case KB.currency:
      sendCurrencyScreen(msg.chat.id)
      break
    case KB.back:
      sendGreeting(msg, false)

      
      break
    case KB.car:
    case KB.cat:
      sendPictureByName(msg.chat.id, msg.text)
      break
  }
})


bot.on('callback_query', query => {
  //console.log(JSON.stringify(query, null, 2))
  const base = query.data
  const symbol = 'RUB'

  bot.answerCallbackQuery({
    callback_query_id: query.id,
    text: `Вы выбрали ${base}`
  })

  request(`http://api.fixer.io/latest?symbols=${symbol}&base=${base}`, (error, response, body) =>{
    if (error) throw new Error(error)

    if(response.statusCode === 200){
      const currencyData = JSON.parse(body)

      //console.log(currencyData)
      const html = `<b>1 ${base}</b> - <em>${currencyData.rates[symbol]} ${symbol}</em>`
      bot.sendMessage(query.message.chat.id, html, {
        parse_mode: 'HTML'
      })
    }

  })

})

function sendPictureScreen(chatId){
  bot.sendMessage(chatId, 'Выбирете тип картинки: ', {
    reply_markup: {
      keyboard: [
        [KB.car, KB.cat],
        [KB.back]
      ]
    }
  })
}


function sendGreeting(msg, sayHello = true){
  const text = sayHello
  ? 'Приветствую, '+msg.chat.first_name+' Что Вы хотите сделать?'
  : 'Что Вы хотите сделать?'

  bot.sendMessage(msg.chat.id, text, {
    reply_markup:{
      keyboard: [
        [KB.currency, KB.picture]
      ]
    }
  });
}

function sendPictureByName(chatId, picName){
  const srcs = PicSrcs[picName]
  console.log(srcs)
  const src = srcs[_.random(0, srcs.length-1)]

  fs.readFile(`${__dirname}/pictures/${src}`, (error, picture) => {
    if(error) throw new Error(error)

    bot.sendPhoto(chatId, picture).then(() => {
      bot.sendMessage(chatId, `Отправляю`)
    })
  })
}

function sendCurrencyScreen(chatId) {
  bot.sendMessage(chatId, `Выбирете тип валюты`, {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: 'Доллар',
            callback_data: 'USD'
          }
        ],
        [
          {
            text: 'Евро',
            callback_data: 'EUR'
          }
        ]
      ]
    }
  })
}