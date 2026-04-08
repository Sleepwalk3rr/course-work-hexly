const nameInput = document.querySelector('#input-name');
const pagesInput = document.querySelector('#input-pages');
const authorInput = document.querySelector('#input-author');
const btn = document.querySelector('#add-button');
const container = document.querySelector('#container');

let items = JSON.parse(localStorage.getItem('myBooks')) || [];

function render() {
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
  const newRead = prompt(`Сколько страниц прочитано? (Всего: ${items[index].pages})`, items[index].readPages || 0);
  if (newRead !== null) {
    const val = parseInt(newRead);
    if (!isNaN(val) && val <= items[index].pages && val >= 0) {
      items[index].readPages = val;
      if (val === items[index].pages) items[index].status = 'finished';
      saveAndRender();
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
    // ВОТ ЭТОТ БЛОК НУЖНО ОБНОВИТЬ:
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


function updateStatistics() {
    const finishedCountEl = document.getElementById('finished-count');
    if (!finishedCountEl) return;

    // Считаем книги
    const finishedBooks = items.filter(book => book.status === 'finished');

    // Обновляем текст на странице
    finishedCountEl.innerText = finishedBooks.length;
}