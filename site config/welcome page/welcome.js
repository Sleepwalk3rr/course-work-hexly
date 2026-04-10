const quotes = [
  "«Книги — это уникальное переносное волшебство». — Стивен Кинг",
  "Чтение на 68% снижает уровень стресса.",
  "«Читатель проживает тысячу жизней, прежде чем умрет». — Джордж Мартин",
  "30 минут чтения в день увеличивают продолжительность жизни.",
  "«Книга — это зеркало. Если в него смотрит осёл, он не может увидеть ангела».",
  "Чтение художественной литературы развивает эмпатию и эмоциональный интеллект.",
  "«Человек, который не читает хороших книг, не имеет преимуществ перед тем, кто не умеет читать»."
];

function showRandomQuote() {
  const quoteElement = document.querySelector('#quote-display');
  if (quoteElement) {
    const randomIndex = Math.floor(Math.random() * quotes.length);
    quoteElement.textContent = quotes[randomIndex];
  }
}

// Запускаем при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
  showRandomQuote();
  // ... остальной код (startBtn и т.д.)
});