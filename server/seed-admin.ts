import { NestFactory } from '@nestjs/core';
import * as bcrypt from 'bcrypt';
import { DataSource } from 'typeorm';
import { AppModule } from './src/app.module';
import { Role, User } from './src/user/entities/user.entity';

function requiredEnv(name: string) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} is required.`);
  return value;
}

async function seedAdmin() {
  const email = requiredEnv('ADMIN_EMAIL').toLowerCase();
  const password = requiredEnv('ADMIN_PASSWORD');
  const fullName = process.env.ADMIN_FULL_NAME?.trim() || 'ORUMA Admin';
  const phone = process.env.ADMIN_PHONE?.trim() || null;

  if (password.length < 12) {
    throw new Error('ADMIN_PASSWORD must be at least 12 characters.');
  }

  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn'],
  });

  try {
    const dataSource = app.get(DataSource);
    const userRepo = dataSource.getRepository(User);
    const existingAdmin = await userRepo.findOne({ where: { email } });
    const hashedPassword = await bcrypt.hash(password, 10);

    if (existingAdmin) {
      existingAdmin.password = hashedPassword;
      existingAdmin.role = Role.ADMIN;
      existingAdmin.fullName = existingAdmin.fullName || fullName;
      existingAdmin.phone = existingAdmin.phone || phone;
      await userRepo.save(existingAdmin);
      console.log(`Updated ADMIN user: ${email}`);
      return;
    }

    await userRepo.save(
      userRepo.create({
        email,
        password: hashedPassword,
        role: Role.ADMIN,
        fullName,
        phone,
        age: null,
        gender: null,
        healthInfo: null,
      }),
    );

    console.log(`Created ADMIN user: ${email}`);
  } finally {
    await app.close();
  }
}

seedAdmin().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
