import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const properties = [
    "Оз 2-43",
    "П 37-51",
    "П 51-29",
    "Сев 4-5",
    "Сев 4-64А",
    "Сев 4-64Б",
    "Сев 6-67",
  ];

  for (const code of properties) {
    await prisma.property.upsert({
      where: { code },
      update: {},
      create: { code },
    });
  }

  console.log("7 объектов добавлены");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
  