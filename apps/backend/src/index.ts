import express from 'express';
import cors from 'cors';
import exercisesRouter from './routes/exercises'; // adjust path as needed

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/exercises', exercisesRouter);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
