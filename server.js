import express from 'express';

import router from './routes/router.js';

const app = express();
const PORT = 3000;

app.use(express.json());
app.use("/api/v1", router);

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
})