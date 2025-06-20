import { Router } from 'express'
import { authenticateUserController } from '../controllers/authenticate-user.controller'

const authRouter = Router()

/**
 * @swagger
 * components:
 *   schemas:
 *     AuthResponse:
 *       type: object
 *       properties:
 *         access_token:
 *           type: string
 *           description: Access token (JWT)
 *       example:
 *         access_token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3MjAwMTYzOTMsImV4cCI6MTcyMDEwMjc5Mywic3ViIjoiNDhhNmVhODUtMDRmNS00NGRjLWExOTItZjQ3MDMwNzg2M2RmIn0.i2e7TQ5dSY7dhdL0kldySVOeYiLHC75OVo7P4yvBGmw
 */

/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: The authentication managing API
 */

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Authenticate a user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AuthResponse'
 *     responses:
 *       200:
 *         description: The user was successfully authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       401:
 *         description: Invalid credentials
 */
authRouter.post('/login', authenticateUserController)

export { authRouter }
