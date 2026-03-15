import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import cors from 'cors';
import dotenv from 'dotenv';
// @ts-ignore
import midtransClient from 'midtrans-client';
import admin from 'firebase-admin';

import { getFirestore } from 'firebase-admin/firestore';

dotenv.config();

// Firebase Admin Setup
import firebaseConfig from './firebase-applet-config.json';

// Initialize Firebase Admin
if (admin.apps.length === 0) {
  admin.initializeApp({
    projectId: firebaseConfig.projectId,
  });
}

// Use the specific database ID if provided
const db = getFirestore(admin.app(), firebaseConfig.firestoreDatabaseId);

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 3000;

// Midtrans Setup
const snap = new midtransClient.Snap({
  isProduction: process.env.MIDTRANS_IS_PRODUCTION === 'true',
  serverKey: process.env.MIDTRANS_SERVER_KEY,
  clientKey: process.env.VITE_MIDTRANS_CLIENT_KEY
});

// ── API ROUTES ──────────────────────────────────────────────────────────────

// 1. Create Midtrans Transaction
app.post('/api/payment/create', async (req, res) => {
  try {
    const { name, email, plan, amount } = req.body;
    
    if (!name || !email || !plan || !amount) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const orderId = `ORDER-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    
    const parameter = {
      transaction_details: {
        order_id: orderId,
        gross_amount: amount
      },
      customer_details: {
        first_name: name,
        email: email
      },
      item_details: [{
        id: plan,
        price: amount,
        quantity: 1,
        name: `Akses Chef - ${plan === 'monthly' ? 'Bulanan' : 'Tahunan'}`
      }],
      // Store metadata in custom_field1
      custom_field1: JSON.stringify({ email, plan })
    };

    const transaction = await snap.createTransaction(parameter);
    res.json({ token: transaction.token, orderId });
  } catch (error: any) {
    console.error('Midtrans Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// 2. Midtrans Webhook (Notification)
app.post('/api/payment/webhook', async (req, res) => {
  try {
    const notification = req.body;
    const statusResponse = await snap.transaction.notification(notification);
    
    const orderId = statusResponse.order_id;
    const transactionStatus = statusResponse.transaction_status;
    const fraudStatus = statusResponse.fraud_status;

    console.log(`Transaction notification received. Order ID: ${orderId}. Status: ${transactionStatus}. Fraud: ${fraudStatus}`);

    if (transactionStatus === 'capture' || transactionStatus === 'settlement') {
      if (fraudStatus === 'challenge') {
        // Handle challenge
      } else {
        // SUCCESS! Generate Access Code
        const metadata = JSON.parse(statusResponse.custom_field1);
        const { email, plan } = metadata;

        // Generate a code
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        const code = 'CHEF-' + 
          Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('') + '-' +
          Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');

        // 1. Add to accessCodes
        await db.collection('accessCodes').add({
          code: code.toUpperCase(),
          used: false,
          createdAt: new Date().toISOString(),
          assignedEmail: email.trim().toLowerCase(),
          plan: plan,
          orderId: orderId
        });

        // 2. Update purchase request if exists
        const purchaseRequestsRef = db.collection('purchaseRequests');
        const q = purchaseRequestsRef.where('email', '==', email).where('status', '==', 'pending');
        const snapReq = await q.get();

        if (!snapReq.empty) {
          await snapReq.docs[0].ref.update({
            status: 'approved',
            code: code.toUpperCase(),
            updatedAt: new Date().toISOString(),
            orderId: orderId
          });
        } else {
          // Create new purchase record
          await purchaseRequestsRef.add({
            name: statusResponse.customer_details?.first_name || 'Customer',
            email: email,
            whatsapp: '-',
            status: 'approved',
            code: code.toUpperCase(),
            createdAt: new Date().toISOString(),
            orderId: orderId,
            plan: plan
          });
        }

        console.log(`Successfully generated code ${code} for ${email}`);
      }
    }

    res.status(200).send('OK');
  } catch (error: any) {
    console.error('Webhook Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ── VITE MIDDLEWARE ─────────────────────────────────────────────────────────

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
