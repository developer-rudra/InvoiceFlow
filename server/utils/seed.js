const dotenv = require('dotenv');
const mongoose = require('mongoose');
const dns = require('dns');
const User = require('../models/User');
const Client = require('../models/Client');
const Invoice = require('../models/Invoice');
const { calculateInvoiceTotals } = require('./calculations');

try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {}

dotenv.config({ path: __dirname + '/../.env' });

const seedData = async () => {
  if (!process.env.MONGO_URI) {
    console.error('MONGO_URI is not configured. Please check the server .env file.');
    process.exit(1);
  }

  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected');

    // Clean existing data for clean demo state
    await User.deleteMany({});
    await Client.deleteMany({});
    await Invoice.deleteMany({});

    console.log('[Seed] Cleared existing database records');

    // 1. Create Demo User
    const demoUser = await User.create({
      name: 'Alex Mercer',
      email: 'demo@invoiceflow.com',
      password: 'password123',
      companyName: 'Astra Digital Solutions',
      companyAddress: '104 Innovation Hub, Cyber City, Tech Park, HR 122002',
      companyPhone: '+91 98765 43210'
    });

    console.log('[Seed] Created demo user: demo@invoiceflow.com / password123');

    // 2. Create Demo Clients
    const clients = await Client.insertMany([
      {
        user: demoUser._id,
        name: 'Rahul Verma',
        companyName: 'Acuity Tech Solutions',
        email: 'rahul@acuitytech.io',
        phone: '+91 98112 34567',
        billingAddress: '42 Tech Tower, Outer Ring Road, Bengaluru 560103',
        gstNumber: '29AAACA12341ZV'
      },
      {
        user: demoUser._id,
        name: 'Priya Sharma',
        companyName: 'Nova Design Studio',
        email: 'priya@novadesign.com',
        phone: '+91 98220 98765',
        billingAddress: '15 Art Alley, Bandra West, Mumbai 400050',
        gstNumber: '27BBBCB56782ZW'
      },
      {
        user: demoUser._id,
        name: 'Amit Patel',
        companyName: 'CloudScale Global',
        email: 'amit@cloudscale.net',
        phone: '+91 99001 11223',
        billingAddress: '88 IT Expressway, Gachibowli, Hyderabad 500032',
        gstNumber: '36CCCC10103ZX'
      },
      {
        user: demoUser._id,
        name: 'Sneha Gupta',
        companyName: 'Horizon Media & Marketing',
        email: 'sneha@horizonmedia.in',
        phone: '+91 97778 88999',
        billingAddress: '702 Commerce House, CG Road, Ahmedabad 380009',
        gstNumber: '24DDDDD40404ZY'
      }
    ]);

    console.log(`[Seed] Created ${clients.length} demo clients`);

    // 3. Create Demo Invoices with recalculated totals
    const today = new Date();
    const pastDate = new Date();
    pastDate.setDate(today.getDate() - 30);
    const pastDueDate = new Date();
    pastDueDate.setDate(today.getDate() - 10);

    const futureDueDate = new Date();
    futureDueDate.setDate(today.getDate() + 15);

    const invoiceConfigs = [
      {
        client: clients[0]._id, // Acuity
        number: 'INV-2026-001',
        items: [
          { description: 'Full-Stack Web Development - Sprint 1 & 2', quantity: 1, rate: 40000 },
          { description: 'Cloud Infrastructure & CI/CD Setup', quantity: 1, rate: 10000 }
        ],
        taxPercentage: 18,
        discount: 2000,
        issueDate: pastDate,
        dueDate: pastDueDate,
        status: 'Paid',
        notes: 'Thank you for your prompt business!'
      },
      {
        client: clients[1]._id, // Nova
        number: 'INV-2026-002',
        items: [
          { description: 'UI/UX Design System & Figma Component Library', quantity: 1, rate: 25000 },
          { description: 'User Journey Mapping Workshop', quantity: 2, rate: 5000 }
        ],
        taxPercentage: 18,
        discount: 1000,
        issueDate: today,
        dueDate: futureDueDate,
        status: 'Unpaid',
        notes: 'Payment terms: 15 net days upon receipt.'
      },
      {
        client: clients[2]._id, // CloudScale
        number: 'INV-2026-003',
        items: [
          { description: 'Enterprise Architecture Consulting', quantity: 40, rate: 2500 },
          { description: 'Database Optimization & Security Audit', quantity: 1, rate: 20000 }
        ],
        taxPercentage: 18,
        discount: 5000,
        issueDate: pastDate,
        dueDate: pastDueDate, // Past due date with Unpaid -> Overdue
        status: 'Unpaid',
        notes: 'Overdue notification sent.'
      },
      {
        client: clients[3]._id, // Horizon
        number: 'INV-2026-004',
        items: [
          { description: 'SEO Content Strategy & Copywriting', quantity: 10, rate: 1500 }
        ],
        taxPercentage: 18,
        discount: 0,
        issueDate: today,
        dueDate: futureDueDate,
        status: 'Draft',
        notes: 'Draft proposal awaiting client sign-off.'
      }
    ];

    for (const cfg of invoiceConfigs) {
      const totals = calculateInvoiceTotals(cfg.items, cfg.taxPercentage, cfg.discount);
      await Invoice.create({
        user: demoUser._id,
        client: cfg.client,
        invoiceNumber: cfg.number,
        items: totals.items,
        subtotal: totals.subtotal,
        taxPercentage: totals.taxPercentage,
        taxAmount: totals.taxAmount,
        discount: totals.discount,
        grandTotal: totals.grandTotal,
        issueDate: cfg.issueDate,
        dueDate: cfg.dueDate,
        status: cfg.status,
        notes: cfg.notes
      });
    }

    console.log('[Seed] Created sample invoices with accurate backend calculations');
    console.log('[Seed] Database seeding completed successfully on MongoDB Atlas!');
    process.exit(0);
  } catch (err) {
    console.error(`MongoDB connection failed: ${err.message}`);
    process.exit(1);
  }
};

seedData();
