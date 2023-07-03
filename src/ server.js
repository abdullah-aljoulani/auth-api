'use strict';

// 3rd Party Resources
const express = require('express');
const cors = require('cors');


// Esoteric Resources
const logger = require('./middleware/logger');
const errorHandler = require('./error-handlers/500');
const notFound = require('./error-handlers/ 404');
const authRoutes = require('./auth/routes');
const v1Routes = require('./routes/v1');
const v2Routes = require('./routes/v2');

// Prepare the express app
const app = express();

// App Level MW
app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//Logger
app.use(logger);
// Routes
app.use(authRoutes);
app.use('/api/v1', v1Routes);
app.use('/api/v2', v2Routes);

// Catchalls
app.use(notFound);
app.use(errorHandler);

module.exports = {
  server: app,
  start: (port) => {
    app.listen(port, () => {
      console.log(`Server Up on ${port}`);
    });
  },
};