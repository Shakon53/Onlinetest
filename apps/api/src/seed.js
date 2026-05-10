import 'dotenv/config';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { User } from './models/User.js';

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  const users = [
    {
      name: 'Administrator',
      email: 'admin@onlinetest.app',
      password: 'Admin@1234',
      role: 'admin'
    },
    {
      name: 'Алия Нурланова',
      email: 'teacher1@onlinetest.app',
      password: 'Teacher@1234',
      role: 'teacher'
    },
    {
      name: 'Данияр Абишев',
      email: 'teacher2@onlinetest.app',
      password: 'Teacher@1234',
      role: 'teacher'
    }
  ];

  for (const u of users) {
    const exists = await User.findOne({ email: u.email });
    if (exists) {
      console.log(`SKIP: ${u.email} already exists`);
      continue;
    }
    const passwordHash = await bcrypt.hash(u.password, 12);
    await User.create({ name: u.name, email: u.email, passwordHash, role: u.role });
    console.log(`CREATED: ${u.role} — ${u.email} / ${u.password}`);
  }

  await mongoose.disconnect();
  console.log('Done.');
}

seed().catch((err) => { console.error(err); process.exit(1); });
