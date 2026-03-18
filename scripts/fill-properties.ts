import { prisma } from "../src/lib/prisma";

async function main() {
  const items = [
    { code: "Оз 2-43", address: "Приморский край, г. Находка, ул. Озёрная, д. 2, кв. 43" },
    { code: "П 37-51", address: "Приморский край, г. Находка, ул. Постышева, д. 37, кв. 51" },
    { code: "П 51-29", address: "Приморский край, г. Находка, ул. Постышева, д. 51, кв. 29" },
    { code: "Сев 4-5", address: "Приморский край, г. Находка, Северный проспект, д. 4, кв. 5" },
    { code: "Сев 4-64А", address: "Приморский край, г. Находка, Северный проспект, д. 4, кв. 64А" },
    { code: "Сев 4-64Б", address: "Приморский край, г. Находка, Северный проспект, д. 4, кв. 64Б" },
    { code: "Сев 6-67", address: "Приморский край, г. Находка, Северный проспект, д. 6, кв. 67" },
  ];

  for (const item of items) {
    await prisma.property.upsert({
      where: { code: item.code },
      update: { address: item.address },
      create: { code: item.code, address: item.address },
    });
  }

  console.log("Properties filled");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });