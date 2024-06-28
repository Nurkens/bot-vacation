const TelegramBot = require('node-telegram-bot-api');

const token = '7382508718:AAEDXTrjB14AuetMaRLRijSFiibG6SauL5c'; 

const bot = new TelegramBot(token, { polling: true });

const chats = {};


const startGame = async (chatId) =>{
    await bot.sendMessage(chatId, `Сейчас я загадаю цифру от 0 до 9, а ты должен ее отгадать`);
    const randomNumber = Math.floor(Math.random() * 10);
    chats[chatId] = randomNumber;
    await bot.sendMessage(chatId, 'Отгадай', gameOptions);
}

const gameOptions = {
  reply_markup: JSON.stringify({
    inline_keyboard: [
      [{ text: '1', callback_data: '1' }, { text: '2', callback_data: '2' }, { text: '3', callback_data: '3' }],
      [{ text: '4', callback_data: '4' }, { text: '5', callback_data: '5' }, { text: '6', callback_data: '6' }],
      [{ text: '7', callback_data: '7' }, { text: '8', callback_data: '8' }, { text: '9', callback_data: '9' }],
      [{ text: '0', callback_data: '0' }],
    ]
  })
};
const  againOptions = {
    reply_markup: JSON.stringify({
      inline_keyboard: [
        [{ text: 'Играть еще раз', callback_data: '/again' }],
      ]
    })
  };

const start = () => {
  bot.setMyCommands([
    { command: '/start', description: 'greeting' },
    { command: '/info', description: 'get info about user' },
    { command: '/game', description: 'game guess the number' },
  ]);

  bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, 'Добро пожаловать! Это ваш новый Telegram-бот.');
  });

  bot.onText(/\/info/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, `Тебя зовут ${msg.from.first_name} ${msg.from.last_name}`);
  });

  bot.onText(/\/game/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, `Сейчас я загадаю цифру от 0 до 9, а ты должен ее отгадать`);
    const randomNumber = Math.floor(Math.random() * 10);
    chats[chatId] = randomNumber;
    return bot.sendMessage(chatId, 'Отгадай', gameOptions);
  });

  bot.on('callback_query', (msg) => {
    const data = msg.data;
    const chatId = msg.message.chat.id;

    if(data === '/again'){
        return startGame(chatId);
    }

    if (data == chats[chatId]) {
        return bot.sendMessage(chatId, `Поздравляю! Ты отгадал цифру ${chats[chatId]}`,againOptions);
    } else {
      return bot.sendMessage(chatId, `Ты не угадал, я загадал цифру ${chats[chatId]}`,againOptions);
    }
    
    
  });

  bot.on('polling_error', (error) => {
    console.log(error.code);  
  });
};

start();
