const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.upsert({
    where: { email: 'raman@example.com' },
    update: {},
    create: {
      name: 'Raman',
      email: 'raman@example.com',
      passwordHash: 'hashed_password_123',
    },
  });
  console.log('Created user:', user);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
