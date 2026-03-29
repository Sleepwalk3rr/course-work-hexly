const inputName = document.getElementById('input-name')
const inputPages = document.querySelector('#inputPages')
const list = document.querySelector('#bookList')
const btn = document.getElementById('add-button')

btn.addEventListener('click', () => {
    const text = inputName.value

    if (text !== "") {
        const li = document.createElement('li');
        li.textContent = text;
        list.appendChild(li)

        inputName.value = "";
    }
})

inputName.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') btn.click();
});