const nameInput = document.querySelector('#input-name');
const pagesInput = document.querySelector('#input-pages');
const authorInput = document.querySelector('#input-author');
const btn = document.querySelector('#add-button');
const container = document.querySelector('#container');
let dailyGoal = localStorage.getItem('readingGoal') || 0;
// История прочтений: [{date: '2023-10-01', pages: 20}, ...]
let readingHistory = JSON.parse(localStorage.getItem('readingHistory')) || [];

let items = JSON.parse(localStorage.getItem('myBooks')) || [];
document.getElementById('daily-goal-input').value = dailyGoal;

window.updateGoal = (val) => {
    dailyGoal = parseInt(val);
    localStorage.setItem('readingGoal', dailyGoal);
    render();
};

function updateStatistics() {
    const statsDayEl = document.getElementById('stats-day');
    if (!statsDayEl) return;

    // Получаем текущую дату в формате "ГГГГ-ММ-ДД"
    const todayStr = new Date().toLocaleDateString(); 

    // 1. Считаем страницы за СЕГОДНЯ
    const readToday = readingHistory.reduce((sum, entry) => {
        const entryDate = new Date(entry.date).toLocaleDateString();
        return entryDate === todayStr ? sum + entry.pages : sum;
    }, 0);

    // 2. Считаем страницы за НЕДЕЛЮ (последние 7 дней)
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const readWeek = readingHistory.reduce((sum, entry) => {
        return new Date(entry.date) >= weekAgo ? sum + entry.pages : sum;
    }, 0);

    // 3. Считаем страницы за МЕСЯЦ (последние 30 дней)
    const monthAgo = new Date();
  monthAgo.setDate(monthAgo.getDate() - 30);
    const readMonth = readingHistory.reduce((sum, entry) => {
        return new Date(entry.date) >= monthAgo ? sum + entry.pages : sum;
    }, 0);

    // 4. Считаем завершенные книги
    const finished = items.filter(b => b.status === 'finished').length;

    // Выводим данные на экран
    statsDayEl.innerText = readToday;
    if(document.getElementById('stats-week')) document.getElementById('stats-week').innerText = readWeek;
    if(document.getElementById('stats-month')) document.getElementById('stats-month').innerText = readMonth;
    if(document.getElementById('finished-count')) document.getElementById('finished-count').innerText = finished;

    // Обновляем визуализацию цели и наград
    updateGoalUI(readToday);
    checkAwards(finished, readToday);
}

// Карточка с целью на страницы\день
function updateGoalUI(todayPages) {
    const statusEl = document.getElementById('goal-status');
    const input = document.getElementById('daily-goal-input');
    input.value = dailyGoal;

    if (dailyGoal <= 0) {
        statusEl.innerText = "Поставьте цель!";
        return;
    }

    if (todayPages >= dailyGoal) {
        statusEl.innerHTML = "<span style='color: #fff; text-shadow: 0 0 10px #fff;'>🏆 Цель достигнута!</span>";
    } else {
        statusEl.innerText = `Осталось: ${dailyGoal - todayPages} стр.`;
    }
}

// Всякие награды за прочтение книг
function checkAwards(finishedCount, todayPages) {
    const container = document.getElementById('awards-container');
    container.innerHTML = '';
    
    const awards = [];
    if (finishedCount >= 1) awards.push({icon: '📖', title: 'Первая книга'});
    if (finishedCount >= 5) awards.push({icon: '📚', title: 'Библиотекарь'});
    if (todayPages >= dailyGoal && dailyGoal > 0) awards.push({icon: '🔥', title: 'В ударе'});

    awards.forEach(a => {
        container.innerHTML += `<div class="award-item" title="${a.title}">${a.icon}</div>`;
    });
}

// Самое главное - карточки с книгами
function render() {
  if (!container) return;
  container.innerHTML = '';

  updateStatistics();

  items.forEach((item, index) => {
    const card = document.createElement('div');
    card.className = 'card';

card.innerHTML = `
  <div class="card-top-row">
    <span class='cardName'><strong>Книга:</strong> ${item.name}</span>
    <span class='cardReaden'><strong>Прочитано:</strong> ${item.readPages} из ${item.pages}</span>
    <span class='cardAuthor'><strong>Автор:</strong> ${item.author || 'Не указан'}</span>
  </div>

  <!-- Progress Bar -->
  <div class="progress-container" onclick="updatePages(${index})">
    <div class="progress-bar" style="width: ${(item.readPages / item.pages) * 100}%"></div>
    <span class="progress-text">${item.readPages || 0} / ${item.pages} стр.</span>
  </div>
  
  <div class="card-bottom-row">
    <select class="status-select" onchange="updateStatus(${index}, this.value)">
      <option value="reading" ${item.status === 'reading' ? 'selected' : ''}>Читаю</option>
      <option value="finished" ${item.status === 'finished' ? 'selected' : ''}>Закончил</option>
      <option value="on-hold" ${item.status === 'on-hold' ? 'selected' : ''}>Отложил</option>
    </select>
  </div>
  <div class="card-bottom">
    <button onclick="editItem(${index})" class="editButton">Редактировать</button>
    <button onclick="deleteItem(${index})" class="deleteButton">Удалить</button>
  </div>
`;


// Функция смены статуса
window.updateStatus = (index, newStatus) => {
    items[index].status = newStatus;
    
    if (newStatus === 'finished') {
        items[index].readPages = items[index].pages; // Устанавливаем макс. страницы
    }
    
    saveAndRender(); // Перерисовывает всё, включая статистику
};

window.updatePages = (index) => {
    const book = items[index];
    const oldRead = Number(book.readPages) || 0; // сколько было
    const newReadRaw = prompt(`Сколько страниц прочитано всего? (Текущий прогресс: ${oldRead})`, oldRead);
    
    if (newReadRaw !== null) {
        const newRead = parseInt(newReadRaw);
        
        if (!isNaN(newRead) && newRead <= book.pages && newRead >= 0) {
            const addedPages = newRead - oldRead; // считаем разницу

            if (addedPages > 0) {
                // ВАЖНО: сохраняем запись о чтении именно на текущий момент
                readingHistory.push({
                    date: new Date().toISOString(),
                    pages: addedPages
                });
                localStorage.setItem('readingHistory', JSON.stringify(readingHistory));
            }

            items[index].readPages = newRead;
            
            // Авто-статус при завершении
            if (newRead === items[index].pages) {
                items[index].status = 'finished';
            }
            
            saveAndRender();
        } else {
            alert("Введите корректное число страниц (не больше общего количества)!");
        }
    }
};

    
    container.appendChild(card);
  });
}

// Удаление
window.deleteItem = (index) => {
  items.splice(index, 1);
  saveAndRender();
};

// Редактирование (раздельное и с проверкой на число)
window.editItem = (index) => {
  const currentItem = items[index];

  // 1. Редактируем название
  const newName = prompt("Введите новое название:", currentItem.name);
  if (newName !== null) {
    items[index].name = newName || currentItem.name;
  }

  // 2. Редактируем страницы
  const newPagesRaw = prompt("Введите новое кол-во страниц:", currentItem.pages);
  
  if (newPagesRaw !== null && newPagesRaw !== "") {
    const newPages = parseInt(newPagesRaw);
    
    if (!isNaN(newPages)) {
      items[index].pages = newPages;
    } else {
      alert("Ошибка: количество страниц должно быть числом!");
    }
  }

  saveAndRender();
};

function saveAndRender() {
  localStorage.setItem('myBooks', JSON.stringify(items));
  render();
}

// Добавление новой книги
btn.addEventListener('click', () => {
  const name = nameInput.value.trim();
  const author = authorInput.value.trim() || "Неизвестен"; // Берем автора из нового инпута
  const pages = parseInt(pagesInput.value);

  if (name && !isNaN(pages)) {
    items.push({ 
      name: name, 
      author: author, 
      pages: pages,      // общее кол-во страниц
      readPages: 0,      // по умолчанию прочитано 0
      status: 'reading'  // по умолчанию статус "Читаю"
    });

    saveAndRender(); // сохраняем в localStorage и перерисовываем

    // Очищаем поля ввода
    nameInput.value = '';
    authorInput.value = '';
    pagesInput.value = '';
  } else {
    alert("Пожалуйста, введите корректное название и число страниц!");
  }
});

render();




// Инициализируем массив активности (если его нет)
let activityLog = JSON.parse(localStorage.getItem('readingActivity')) || [];

// Функция для записи прогресса в статистику
function logReading(pagesRead) {
  const today = new Date().toLocaleDateString(); // Формат "10.04.2026"
  
  // Ищем, есть ли уже запись за сегодня
  const dayIndex = activityLog.findIndex(entry => entry.date === today);
  
  if (dayIndex !== -1) {
    activityLog[dayIndex].pages += pagesRead;
  } else {
    activityLog.push({ date: today, pages: pagesRead });
  }
  
  localStorage.setItem('readingActivity', JSON.stringify(activityLog));
  renderStats();
}

