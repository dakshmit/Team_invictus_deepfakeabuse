import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import authRoutes from './routes/auth.routes.js';
import mediaRoutes from './routes/media.routes.js';
import reportRoutes from './routes/report.routes.js';
import aiRoutes from './routes/ai.routes.js';

const app = express();

app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/report', reportRoutes);
app.use('/api/ai', aiRoutes);

app.get('/', (req, res) => {
    res.send('Deepfake Abuse Protection Platform API is running');
});

import swaggerUi from 'swagger-ui-express';
import { specs } from './config/swagger.js';

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

export default app;
