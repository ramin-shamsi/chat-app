const users = [];

const addUser = ({ id, username, room }) => {
  // clean up data
  username = username.trim().toLowerCase();
  room = room.trim().toLowerCase();

  // validate
  if (!username || !room) {
    return {
      error: "Username and Room Required!",
    };
  }

  // check user
  const existingUser = users.find((user) => {
    return user.username === username && user.room === room;
  });

  if (existingUser) {
    return {
      error: "username is in use!",
    };
  }

  // store user
  const user = { id, username, room };
  users.push(user);
  return { user };
};

const removeUser = (id) => {
  const index = users.findIndex((user) => user.id === id);
  if (index === -1) {
    return { error: "User not found" };
  }
  return users.splice(index, 1)[0];
};

const getUser = (id) => {
  return users.find((user) => user.id === id);
};

const getUsersInRoom = (room) => {
  return users.filter((user) => user.room === room);
};

module.exports = {
  addUser,
  removeUser,
  getUsersInRoom,
  getUser,
};
