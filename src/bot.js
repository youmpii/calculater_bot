// Автор: youmpii
// GitHub: https://github.com/youmpii

const TelegramBot = require('node-telegram-bot-api');
const calculator = require('advanced-calculator');
const dotenv = require('dotenv');

dotenv.config();

const token = process.env.BOT_TOKEN;

// Создаем бота, который использует 'polling' для получения новых обновлений
const bot = new TelegramBot(token, { polling: true });

// Объекты для хранения текущих выражений и истории вычислений
const currentExpression = {};
const calculationHistory = {};

// Функция для проверки, является ли сообщение математическим выражением
function isMathExpression(message) {
    // Регулярное выражение для поиска математических функций и операторов
    const functionPattern =
        /\b(sin|cos|tan|ln|log|max|min|sqrt)\s*\(.*?\)|\b\d+\s*[\+\-\*/%\^]\s*\d+\b|\(.*?\)/;

    // Проверка на соответствие шаблонам
    return functionPattern.test(message);
}

// Обновленная функция для проверки, содержит ли выражение недопустимые символы в контексте математического выражения
function isInvalidMathExpression(expression) {
    // Регулярное выражение для проверки наличия цифр, операторов и недопустимых символов
    const invalidPattern = /\d+[^0-9+\-*/%^().\s]+|[^0-9+\-*/%^().\s]+\d+/;
    return invalidPattern.test(expression);
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

// Обработчик для команды /start
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    currentExpression[chatId] = '';
    calculationHistory[chatId] = [];
    bot.sendMessage(
        chatId,
        'Добро пожаловать в калькулятор! Введите команду в формате /calculate <выражение> для вычисления.'
    );
});

// Обработчик для команды /calc
bot.onText(/\/calc (.+)/, (msg, match) => {
    const chatId = msg.chat.id;
    let expression = match[1].replace(/\s+/g, ''); // Удаление пробелов

    // Проверка на недопустимые символы в контексте математического выражения
    if (isInvalidMathExpression(expression)) {
        bot.sendMessage(chatId, 'Ошибка: выражение содержит недопустимые символы.');
        return;
    }

    try {
        const result = calculator.evaluate(expression);
        const calcResult = `${expression} = ${result}`;
        addToHistory(chatId, calcResult);
        bot.sendMessage(chatId, `Результат: ${result}`);
    } catch (error) {
        bot.sendMessage(chatId, `Ошибка: ${error.message}`);
    }
});

// Добавляем обработчик команды /calchelp
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
        
        Пример использования: /calculate 2+2*3 или 2+3*4`
    );
});

// Обработчик для команды /help
bot.onText(/\/(h|help)/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(
        chatId,
        'Список доступных команд:\n' +
            '/start - Начать работу с ботом\n' +
            '/calc <выражение> - Вычислить математическое выражение\n' +
            '/calchelp - Помощь по использованию калькулятора\n' +
            '/his|/history - Показать историю вычислений\n' +
            '/clear - Очистить историю вычислений\n' +
            '/h|/help - Показать список команд'
    );
    // Удаление команды из истории сообщений
    bot.removeTextListener(/\/(h|help)/);
});

// Обработчик для команды /his|/history
bot.onText(/\/(his|history)/, (msg) => {
    const chatId = msg.chat.id;
    const history = calculationHistory[chatId] || [];

    if (history.length === 0) {
        bot.sendMessage(chatId, 'История вычислений пуста.');
    } else {
        const historyMessage = history
            .map((entry, index) => `${index + 1}: ${entry}`)
            .join('\n');
        bot.sendMessage(chatId, `История вычислений:\n${historyMessage}`);
    }
});

// Обработчик для команды /clear
bot.onText(/\/clear/, (msg) => {
    const chatId = msg.chat.id;
    calculationHistory[chatId] = [];
    bot.sendMessage(chatId, 'История вычислений очищена.');
});

// Обработчик для всех сообщений
bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text.replace(/\s+/g, '');

    // Проверка, что сообщение не является командой
    if (!msg.text.startsWith('/')) {
        // Проверка на недопустимые символы в контексте математического выражения
        if (isInvalidMathExpression(text)) {
            bot.sendMessage(chatId, 'Ошибка: выражение содержит недопустимые символы.');
            return;
        }

        if (isMathExpression(text)) {
            try {
                const result = calculator.evaluate(text);
                const calcResult = `${text} = ${result}`;
                addToHistory(chatId, calcResult);
                bot.sendMessage(chatId, `Результат: ${result}`);
            } catch (error) {
                bot.sendMessage(chatId, 'Ошибка в вычислении выражения.');
            }
        }
    }
});
