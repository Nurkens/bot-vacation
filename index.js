const TelegramBot = require('node-telegram-bot-api');
const { gameOptions, againOptions } = require('./options.js');

const weather_key = '86c33f2ccde9c230d73b0d3da5cae232';
const token = '7382508718:AAEDXTrjB14AuetMaRLRijSFiibG6SauL5c'; 

const bot = new TelegramBot(token, { polling: true });

const chats = {};

const startGame = async (chatId) => {
  await bot.sendMessage(chatId, 'Сейчас я загадаю цифру от 0 до 9, а ты должен ее отгадать');
  const randomNumber = Math.floor(Math.random() * 10);
  chats[chatId] = randomNumber;
  await bot.sendMessage(chatId, 'Отгадай', gameOptions);
};

bot.setMyCommands([
  { command: '/start', description: 'Приветствие' },
  { command: '/info', description: 'Получить инфо о пользователе' },
  { command: '/game', description: 'Игра отгадай цифру' },
  { command: '/weather', description: 'чтобы узнать погоду,напиши /weather и название города' },
]);

const start = () => {
  bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, 'Привет,со мной ты можешь поиграть в игру,узнать погоду');
  });

  bot.onText(/\/info/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, `Тебя зовут ${msg.from.first_name} sugar daddy:)`);
  });

  bot.onText(/\/game/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, 'Сейчас я загадаю цифру от 0 до 9, а ты должен ее отгадать');
    const randomNumber = Math.floor(Math.random() * 10);
    chats[chatId] = randomNumber;
    return bot.sendMessage(chatId, 'Отгадай', gameOptions);
  });

  bot.on('callback_query', (msg) => {
    const data = msg.data;
    const chatId = msg.message.chat.id;

    if (data === '/again') {
      return startGame(chatId);
    }

    if (data == chats[chatId]) {
      return bot.sendMessage(chatId, `Поздравляю! Ты отгадал цифру ${chats[chatId]}`, againOptions);
    } else {
      return bot.sendMessage(chatId, `Ты не угадал, я загадал цифру ${chats[chatId]}`, againOptions);
    }
  });

  const getWeather = async (city) => {
    const fetch = await import('node-fetch').then((module) => module.default);
    const url = `http://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${weather_key}&units=metric&lang=ru`;
    try {
      const response = await fetch(url);
      const data = await response.json();

      console.log(data); 

      if (data.cod !== 200) {
        return 'Город не найден.';
      }
      const chatId = msg.chat.id;
      const weather = data.weather[0].description;
      const temp = data.main.temp;
      const windspeed = data.wind.speed;
      return `Погода в городе ${city}:\nТемпература: ${temp}°C\nОписание: ${weather} \nСкорость ветра ${windspeed} м/с`;
      
    } catch (error) {
      console.error('Error fetching weather data:', error);
      return 'Ошибка получения данных о погоде.';
    }
  };

  bot.onText(/\/weather (.+)/, async (msg, match) => {
    const chatId = msg.chat.id;
    const city = match[1];
    const weatherReport = await getWeather(city);
    bot.sendMessage(chatId, weatherReport);
  });

  bot.on('polling_error', (error) => {
    console.log(error.code);
  });
};

start();
