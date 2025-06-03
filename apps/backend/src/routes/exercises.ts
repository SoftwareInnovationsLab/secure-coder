import { Router, Request, Response } from 'express';
import axios from "axios";

import prisma from '../prisma/client';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
    const exercises = await prisma.exercise.findMany();
    res.json(exercises);
});

// Create a exercise
router.post('/', async (req, res) => {
    const { type, title, description, driverCode, vulnerableCode, input, solution, hints, explanation, tags } = req.body;
    const newexercise = await prisma.exercise.create({
        data: { type, title, description, driverCode, vulnerableCode, input, solution, hints, explanation, tags },
    });
    res.status(201).json(newexercise);
});

router.get('/:id', async (req: Request, res: Response) => {
    const { id } = req.params;
    const exercise = await prisma.exercise.findUnique({ where: { id } });
    if (!exercise) return res.status(404).json({ error: 'Not found' });
    res.json(exercise);
});

// Edit exercise (PUT /api/exercises/:id)
router.put('/:id', async (req: Request, res: Response) => {
    const { id } = req.params;
    const {
        type,
        title,
        description,
        driverCode,
        vulnerableCode,
        input,
        solution,
        hints,
        explanation,
        tags,
    } = req.body;

    try {
        const updated = await prisma.exercise.update({
            where: { id },
            data: {
                type,
                title,
                description,
                driverCode,
                vulnerableCode,
                input,
                solution,
                hints,
                explanation,
                tags,
            },
        });
        res.json(updated);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to update exercise' });
    }
});

// Delete exercise (DELETE /api/exercises/:id)
router.delete('/:id', async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        await prisma.exercise.delete({ where: { id } });
        res.status(204).send(); // No content on successful delete
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to delete exercise' });
    }
});

router.post('/:id/submissions', async (req: Request, res: Response) => {
    const { id } = req.params;
    const { input } = req.body;

    const exercise = await prisma.exercise.findUnique({ where: { id } });
    if (!exercise) return res.status(404).json({ error: 'Not found' });

    const sourceCode = exercise.type === 'offensive' ? exercise.vulnerableCode : input;
    const exerciseInput = exercise.type === 'offensive' ? input : null;

    try {
        const submissionResponse = await axios.post('http://localhost:2358/submissions?base64_encoded=true', {
            source_code: btoa(sourceCode + '\n' + exercise.driverCode),
            language_id: 50,
            stdin: btoa(exerciseInput),
            command_line_arguments: exerciseInput,
            compiler_options: '-fstack-protector-all',
        });

        const token = submissionResponse.data.token;

        // 2. Poll for the results until the job is complete
        const getResult = async () => {
            const resultResponse = await axios.get(`http://localhost:2358/submissions/${token}?base64_encoded=true`);
            const status = resultResponse.data.status?.id;

            if (status === 1 || status === 2) { // In Queue or Processing
                setTimeout(getResult, 1000); // Check again in 1 second
            } else if (status === 6) {
                resultResponse.data['stderr'] = "Compilation error:" + atob(resultResponse.data.compile_output);
                res.json(resultResponse.data);
            } else {
                resultResponse.data['stderr'] = atob(resultResponse.data.stderr);
                res.json(resultResponse.data);
            }
        };

        getResult();

    } catch (error) {
        console.error('Error submitting or fetching code:', error);
        res.status(500).json({ stderr: 'Failed to execute code' });
    }
});

router.post('/validate', async (req: Request, res: Response) => {
    const { type, driver, vulnerableCode, solution } = req.body;

    const sourceCode = type === 'offensive' ? vulnerableCode : solution;
    const exerciseInput = type === 'offensive' ? solution : null;

    try {
        const submissionResponse = await axios.post('http://localhost:2358/submissions?base64_encoded=true', {
            source_code: btoa(sourceCode + '\n' + driver),
            language_id: 50,
            stdin: btoa(exerciseInput),
            command_line_arguments: exerciseInput,
            compiler_options: '-fstack-protector-all',
        });

        const token = submissionResponse.data.token;

        // 2. Poll for the results until the job is complete
        const getResult = async () => {
            const resultResponse = await axios.get(`http://localhost:2358/submissions/${token}?base64_encoded=true`);
            const status = resultResponse.data.status?.id;

            if (status === 1 || status === 2) { // In Queue or Processing
                setTimeout(getResult, 1000); // Check again in 1 second
            } else if (status === 6) {
                resultResponse.data['stderr'] = "Compilation error:" + atob(resultResponse.data.compile_output);
                res.json(resultResponse.data);
            } else {
                resultResponse.data['stderr'] = atob(resultResponse.data.stderr);
                res.json(resultResponse.data);
            }
        };

        getResult();

    } catch (error) {
        console.error('Error submitting or fetching code:', error);
        res.status(500).json({ stderr: 'Failed to execute code' });
    }
});

export default router;