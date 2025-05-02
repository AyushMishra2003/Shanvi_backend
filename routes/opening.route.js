import express from 'express';
import {
    addOpening,
    getOpeningAll,
    getOpeningById,
    updateOpening,
    deleteOpening
} from '../controller/opening.controller.js'
import { Router } from 'express';

const openingRouter = Router()

openingRouter.post('/', addOpening);
openingRouter.get('/', getOpeningAll);
openingRouter.get('/:title', getOpeningById);
openingRouter.put('/:id', updateOpening);
openingRouter.delete('/:id', deleteOpening);

export default openingRouter;
