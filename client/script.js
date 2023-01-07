import bot from "./assets/bot.svg";
import user from "./assets/user.svg";

const form = document.querySelector("form");
const chatContainer = document.querySelector("#chat_container");

let loadInterval;

function loader(element) {
  element.textContent = "";

  loadInterval = setInterval(() => {
    element.textContent += ".";

    if (element.textContent === "....") {
      element.textContent = "";
    }
  }, 300);
}

function typeText(element, text) {
  let index = 0;

  let interval = setInterval(() => {
    if (index < text.length) {
      element.innerHTML += text.charAt(index);
      index++;
    } else {
      clearInterval(interval);
    }
  }, 20);
}

function generateUID() {
  const timeStamp = Date.now();
  const randomNum = Math.random();
  const hex = randomNum.toString(16);
  return `id-${timeStamp}-${hex}`;
}

function chatStripe(isAi, value, uniqueId) {
  return `
      <div class="wrapper ${isAi && "ai"}">
          <div class="chat">
              <div class="profile">
                  <img 
                    src=${isAi ? bot : user} 
                    alt="${isAi ? "bot" : "user"}" 
                  />
              </div>
              <div class="message" id=${uniqueId}>${value}</div>
          </div>
      </div>
  `;
}
const handleSubmit = async (e) => {
  e.preventDefault();

  const data = new FormData(form);

  //User's message
  chatContainer.innerHTML += chatStripe(false, data.get("prompt"));
  form.reset();

  //Bot's message
  const UID = generateUID();
  chatContainer.innerHTML += chatStripe(true, " ", UID);
  chatContainer.scrollTop = chatContainer.scrollHeight;

  const messageDiv = document.getElementById(UID);
  loader(messageDiv);

  //Fetch bot's response
  const response = await fetch('http://localhost:5000', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      prompt: data.get("prompt")
    })
  });
  
  clearInterval(loadInterval);
  messageDiv.innerHTML = '';

  if (response.ok) {
    const data = await response.json();
    const parsedData = data.bot.trim();
    typeText(messageDiv, parsedData);
  } else {
    const err = await response.text();
    messageDiv.innerHTML = "Somehing went wrong."
    alert(err);
  }

};

form.addEventListener("submit", handleSubmit);
form.addEventListener("keyup", (e) => {
  if ((e.keyCode === 13) | (e.key === "Enter")) {
    handleSubmit(e);
  }
});
