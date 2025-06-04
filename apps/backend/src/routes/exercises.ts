import { Router, Request, Response } from 'express';
import axios from "axios";

import prisma from '../prisma/client';
import { buildSubmission, submitToJudge0 } from '../services/judge0client';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
    const exercises = await prisma.exercise.findMany();
    res.json(exercises);
});

router.post('/', async (req, res) => {
    const newexercise = await prisma.exercise.create({
        data: req.body
    });
    res.status(201).json(newexercise);
});

router.get('/:id', async (req: Request, res: Response) => {
    const { id } = req.params;
    const exercise = await prisma.exercise.findUnique({ where: { id } });
    if (!exercise) return res.status(404).json({ error: 'Not found' });
    res.json(exercise);
});

router.put('/:id', async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const updated = await prisma.exercise.update({
            where: { id },
            data: req.body,
        });
        res.json(updated);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to update exercise' });
    }
});

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
    let { input } = req.body;

    const exercise = await prisma.exercise.findUnique({ where: { id } });
    if (!exercise) return res.status(404).json({ error: 'Not found' });

    const source = exercise.type === 'offensive' ? exercise.vulnerableCode : input;
    input = exercise.type === 'offensive' ? input : null;

    try {
        const submission = await buildSubmission(source, exercise.driverCode, input);
        const result = await submitToJudge0(submission);
        res.json(result);
    } catch (error) {
        console.error('Error submitting or fetching code:', error);
        res.status(500).json({ stderr: 'Failed to execute code' });
    }
});

router.post('/validate', async (req: Request, res: Response) => {
    const { type, driver, vulnerableCode, solution } = req.body;
    const source = type === 'offensive' ? vulnerableCode : solution;
    const input = type === 'offensive' ? solution : null;

    try {
        const submission = await buildSubmission(source, driver, input);
        const result = await submitToJudge0(submission);
        res.json(result);
    } catch (error) {
        console.error('Error submitting or fetching code:', error);
        res.status(500).json({ stderr: 'Failed to execute code' });
    }
});

export default router;