const dotenv = require('dotenv');
dotenv.config();

const connectDB = require('./config/db');
const app = require('./app');

// Connect to Database and start server
connectDB().then(() => {
  const PORT = process.env.PORT;
  app.listen(PORT, () => {
    console.log(`[InvoiceFlow Server] Running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  });
});
