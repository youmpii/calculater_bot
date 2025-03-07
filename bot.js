const TelegramBot = require("node-telegram-bot-api");
const calculator = require("advanced-calculator");
const dotenv = require("dotenv");

dotenv.config();

// replace the value below with the Telegram token you receive from @BotFather
const token = process.env.BOT_TOKEN;

// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token, { polling: true });

let currentExpression = {};
let calculationHistory = {};

// Обработчик для старта бота
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  currentExpression[chatId] = "";
  calculationHistory[chatId] = [];
  bot.sendMessage(
    chatId,
    "Добро пожаловать в калькулятор! Введите команду в формате /calculate <выражение> для вычисления."
  );
  bot.sendMessage(
    chatId,
    "Этот бот позволяет выполнять математические вычисления. Используйте команды для взаимодействия."
  );
});

// Обработчик для команды /calculate
bot.onText(/\/calculate (.+)/, (msg, match) => {
  const chatId = msg.chat.id;
  const expression = match[1];

  try {
    const result = calculator.evaluate(expression);
    const calcResult = `${expression} = ${result}`;

    // Сохраняем в историю
    if (!calculationHistory[chatId]) {
      calculationHistory[chatId] = [];
    }
    calculationHistory[chatId].push(calcResult);
    if (calculationHistory[chatId].length > 10) {
      calculationHistory[chatId].shift();
    }

    bot.sendMessage(chatId, calcResult);
  } catch (error) {
    bot.sendMessage(chatId, `Ошибка: ${error.message}`);
  }
});

// Добавляем обработчик команды /help для калькулятора
bot.onText(/\/calchеlp/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(
    chatId,
    `Калькулятор поддерживает следующие операции:
        - Сложение: 2+2
        - Вычитание: 5-3
        - Умножение: 4*5
        - Деление: 10/2
        - Степень: 2^3
        - Квадратный корень: sqrt(4)
        - Синус: sin(π/2)
        - Косинус: cos(π)
        - Тангенс: tan(π/4)
        
        Пример использования: /calculate 2+2*3`
  );
});

// Обработчик для команды /?
bot.onText(/\/\?/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(
    chatId,
    "Список доступных команд:\n" +
      "/start - Начать работу с ботом\n" +
      "/calculate <выражение> - Вычислить математическое выражение\n" +
      "/calchеlp - Помощь по использованию калькулятора\n" +
      "/history - Показать историю вычислений\n" +
      "/? - Показать список команд"
  );
});

// Обработчик для команды /history
bot.onText(/\/history/, (msg) => {
  const chatId = msg.chat.id;
  const history = calculationHistory[chatId] || [];

  if (history.length === 0) {
    bot.sendMessage(chatId, "История вычислений пуста.");
  } else {
    const historyMessage = history.join("\n");
    bot.sendMessage(chatId, `История вычислений:\n${historyMessage}`);
  }
});
