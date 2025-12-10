import {
  PrismaClient,
  Role,
  PropertyType,
  InspectionStatus,
} from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding database...");

  // Create a demo user
  const demoUser = await prisma.user.upsert({
    where: { email: "demo@inspectai.com" },
    update: {},
    create: {
      email: "demo@inspectai.com",
      name: "Demo Inspector",
      role: Role.INSPECTOR,
    },
  });

  console.log(`✅ Created demo user: ${demoUser.email}`);

  // Create a demo organization
  const demoOrg = await prisma.organization.upsert({
    where: { id: "demo-org" },
    update: {},
    create: {
      id: "demo-org",
      name: "Demo Inspection Company",
    },
  });

  console.log(`✅ Created demo organization: ${demoOrg.name}`);

  // Create a sample inspection
  const sampleInspection = await prisma.inspection.upsert({
    where: { id: "sample-inspection" },
    update: {},
    create: {
      id: "sample-inspection",
      title: "Sample Home Inspection",
      address: "123 Main Street",
      city: "San Francisco",
      state: "CA",
      zipCode: "94102",
      propertyType: PropertyType.SINGLE_FAMILY,
      status: InspectionStatus.DRAFT,
      userId: demoUser.id,
      metadata: {
        squareFootage: 2500,
        yearBuilt: 1985,
        bedrooms: 4,
        bathrooms: 2.5,
      },
    },
  });

  console.log(`✅ Created sample inspection: ${sampleInspection.title}`);

  console.log("🎉 Seeding completed!");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("❌ Seeding failed:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
