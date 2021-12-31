const express = require('express');
const app = express();
const connectDB = require('./config/db');
// connect the database
connectDB();

const PORT = process.env.PORT || 5000;
 app.get('/', (req, res) => {
     res.send('api is running')
 })

 app.use(express.json({extended: false}));
app.use('/api/users',require('./routes/api/users'));
app.use('/api/auth',require('./routes/api/auth'));
app.use('/api/profile',require('./routes/api/profile'));
app.use('/api/posts',require('./routes/api/posts'));

app.listen(PORT, () => {
    console.log(`server is listening on port ${PORT}`);
});
