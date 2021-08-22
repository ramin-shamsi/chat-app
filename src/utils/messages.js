const generateMessage = (username, message) => {
  return {
    username,
    text: message,
    createdAt: new Date().getTime(),
  };
};

const generateLocation = (username, url) => {
  return {
    username,
    url,
    sharedAt: new Date().getTime(),
  };
};

module.exports = {
  generateMessage,
  generateLocation,
};
