import { prisma } from '../prisma';

export async function createOrGetUser(username: string) {
  const normalizedUsername = username.trim().toLowerCase();

  const user = await prisma.user.upsert({
    where: {
      username: normalizedUsername,
    },
    update: {},
    create: {
      username: normalizedUsername,
    },
  });

  return {
    id: user.id,
    username: user.username,
    createdAt: user.createdAt.toISOString(),
  };
}
