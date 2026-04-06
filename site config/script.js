const nameInput = document.querySelector('#input-name');
const pagesInput = document.querySelector('#input-pages');
const authorInput = document.querySelector('#input-author');
const btn = document.querySelector('#add-button');
const container = document.querySelector('#container');

let items = JSON.parse(localStorage.getItem('myBooks')) || [];

function render() {
  container.innerHTML = '';

  items.forEach((item, index) => {
    const card = document.createElement('div');
    card.className = 'card';

    card.innerHTML = `
      <ul>
        <li class="nameBook">Название: ${item.name}</li>
        <li class="pagesCount">Страниц: ${item.pages}<li>
        <li class="authorName">Автор: ${item.author}</li>
      </ul>
          <select class="select">
            <option value="Reading">Читаю</option>
            <option value="Ended">Закончил</option>
            <option value="Stopped">Отложил</option>
          </select>
      <button onclick="editItem(${index})" class="editButton">Редактировать</button>
      <button onclick="deleteItem(${index})" class="deleteButton")">Удалить</button>
    `;
    
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
  const pages = parseInt(pagesInput.value);
    const author = authorInput.value.trim();

  if (name && !isNaN(pages) && author) {
    items.push({ name: name, pages: pages, author: author });
    saveAndRender();
    nameInput.value = '';
    pagesInput.value = '';
    authorInput.value = '';
  } else {
    alert("Пожалуйста, введите корректное название и число страниц!");
  }
});

render();
