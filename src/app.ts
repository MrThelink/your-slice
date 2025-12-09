// TODO: Generate an Express app in TypeScript, enable CORS, JSON parsing, and load routes from /routes folder: authRoutes, menuRoutes, orderRoutes, productRoutes, customerRoutes

import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes';
import menuRoutes from './routes/menuRoutes';
import orderRoutes from './routes/orderRoutes';
import productRoutes from './routes/productRoutes';
import customerRoutes from './routes/customerRoutes';

const app = express();

// Enable CORS
app.use(cors({
  origin: [
    'http://localhost:3000', 
    'http://localhost:3001', 
    'http://localhost:5173', 
    'http://127.0.0.1:5500', 
    'http://127.0.0.1:5501', 
    'http://127.0.0.1:5502', 
    'http://127.0.0.1:5503',
    'https://mywebserver1234.norwayeast.cloudapp.azure.com'
  ],
  credentials: true
}));

// Enable JSON parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    success: true,
    message: 'Your Slice API is running!' 
  });
});

// Load routes from /routes folder
app.use('/api/auth', authRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/products', productRoutes);
app.use('/api/customers', customerRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    success: false,
    error: 'Route not found' 
  });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false,
    error: 'Something went wrong!' 
  });
});

export default app;