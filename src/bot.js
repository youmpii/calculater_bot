// Автор: youmpii
// GitHub: https://github.com/youmpii

const TelegramBot = require("node-telegram-bot-api");
const calculator = require("advanced-calculator");
const dotenv = require("dotenv");

dotenv.config();

// replace the value below with the Telegram token you receive from @BotFather
const token = process.env.BOT_TOKEN;

// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token, { polling: true });

// Объекты для хранения текущих выражений и истории вычислений
const currentExpression = {};
const calculationHistory = {};

// Функция для проверки, является ли сообщение математическим выражением
function isMathExpression(message) {
  // Регулярное выражение для поиска математических функций и операторов
  const functionPattern = /\b(sin|cos|tan|ln|log|max|min|sqrt)\s*\(.*?\)|\b\d+\s*[\+\-\*/%\^]\s*\d+\b|\(.*?\)/;
  
  // Проверка на соответствие шаблонам
  return functionPattern.test(message);
}

// Функция для добавления результата в историю вычислений
function addToHistory(chatId, result) {
  if (!calculationHistory[chatId]) {
    calculationHistory[chatId] = [];
  }
  calculationHistory[chatId].push(result);
  if (calculationHistory[chatId].length > 10) {
    calculationHistory[chatId].shift();
  }
}

// Обработчик для старта бота
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  currentExpression[chatId] = "";
  calculationHistory[chatId] = [];
  bot.sendMessage(
    chatId,
    "Добро пожаловать в калькулятор! Введите команду в формате /calculate <выражение> для вычисления."
  );
});

// Обработчик для команды /calculate
bot.onText(/\/calculate (.+)/, (msg, match) => {
  const chatId = msg.chat.id;
  const expression = match[1];

  try {
    const result = calculator.evaluate(expression);
    const calcResult = `${expression} = ${result}`;
    addToHistory(chatId, calcResult);
    bot.sendMessage(chatId, calcResult);
  } catch (error) {
    bot.sendMessage(chatId, `Ошибка: ${error.message}`);
  }
});

// Добавляем обработчик команды /calchelp для калькулятора
bot.onText(/\/calchelp/, (msg) => {
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
        
        Пример использования: /calculate 2+2*3
        Также можно использовать бота без команд, просто вводите выражения и получаете результат.`
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

// Обработчик для всех сообщений
bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  if (isMathExpression(text)) {
    try {
      // Вычисление выражения
      const result = calculator.evaluate(text);
      bot.sendMessage(chatId, `Результат: ${result}`);
    } catch (error) {
      bot.sendMessage(chatId, 'Ошибка в вычислении выражения.');
    }
  }
});
