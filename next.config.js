const path = require('path');

module.exports = {
  reactStrictMode: true,
}

module.exports = {
  //Allow sass vars to be used in components
  sassOptions: {
    includePaths: [path.join(__dirname, 'styles')],
  }
};