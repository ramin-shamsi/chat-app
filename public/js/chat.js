const socket = io();

const messageForm = document.querySelector("#message-form");
const formInput = messageForm.querySelector("input");
const formButton = messageForm.querySelector("button");
const shareLocationBtn = document.querySelector("#send-location");
const messgaeTemplate = document.querySelector("#message-template").innerHTML;
const locationTemplate = document.querySelector("#location-template").innerHTML;
const messages = document.querySelector("#messages");
const sidebarTemplate = document.querySelector("#sidebar-template").innerHTML;

const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

const autoscroll = () => {
  // New message element
  const $newMessage = messages.lastElementChild;

  // Height of the new message
  const newMessageStyles = getComputedStyle($newMessage);
  const newMessageMargin = parseInt(newMessageStyles.marginBottom);
  const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;

  // Visible height
  const visibleHeight = messages.offsetHeight;

  // Height of messages container
  const containerHeight = messages.scrollHeight;

  // How far have I scrolled?
  const scrollOffset = messages.scrollTop + visibleHeight;

  if (containerHeight - newMessageHeight <= scrollOffset) {
    messages.scrollTop = messages.scrollHeight;
  }
};

socket.emit("join", { username, room }, (error) => {
  if (error) {
    alert(error);
    location.href = "/";
  }
});

socket.on("roomData", ({ room, users }) => {
  const html = Mustache.render(sidebarTemplate, { users, room });
  document.querySelector("#sidebar").innerHTML = html;
});

socket.on("message", (message) => {
  const html = Mustache.render(messgaeTemplate, {
    username: message.username,
    message: message.text,
    createdAt: moment(message.createdAt).format("h:mm a"),
  });
  messages.insertAdjacentHTML("beforeend", html);
  autoscroll();
});

socket.on("location", (location) => {
  const html = Mustache.render(locationTemplate, {
    username: location.username,
    url: location.url,
    sharedAt: moment(location.sharedAt).format("h:mm a"),
  });
  messages.insertAdjacentHTML("beforeend", html);
  autoscroll();
});
messageForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const text = formInput.value;
  formInput.setAttribute("disabled", "disabled");

  socket.emit("newMessage", text, (error) => {
    formInput.removeAttribute("disabled");
    formInput.value = "";
    formInput.focus();
    // Ackhowledgement
    if (error) {
      return console.log(error);
    }
    console.log("message delivered");
  });
});

shareLocationBtn.addEventListener("click", () => {
  if (!navigator.geolocation) {
    return alert("Your Browser Dosen't Support Geolocation");
  }

  navigator.geolocation.getCurrentPosition((position, err) => {
    if (err) {
      console.log(err);
    }
    shareLocationBtn.setAttribute("disabled", "disabled");
    socket.emit(
      "shareLocation",
      {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      },
      () => {
        shareLocationBtn.removeAttribute("disabled");
        // Ackhowledgement
        console.log("location shared");
      }
    );
  });
});
