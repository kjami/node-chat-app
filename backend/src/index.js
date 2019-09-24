/* global process, require*/
const chalk = require('chalk');
const app = require('./app');

// eslint-disable-next-line no-process-env
const port = process.env.PORT;

app.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(chalk.gray.bgGreen(`                   App started on ${port}                   `));
});