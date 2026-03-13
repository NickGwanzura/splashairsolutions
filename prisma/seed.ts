import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting database seed...");

  if (process.env.NODE_ENV === "production" || process.env.APP_ENV === "production") {
    throw new Error("Refusing to run destructive seed in a production environment");
  }

  if (process.env.ALLOW_DESTRUCTIVE_SEED !== "true") {
    throw new Error("Set ALLOW_DESTRUCTIVE_SEED=true to run the local demo seed");
  }

  // Clean existing data
  await prisma.$transaction([
    prisma.notificationUser.deleteMany(),
    prisma.notification.deleteMany(),
    prisma.auditLog.deleteMany(),
    prisma.partUsage.deleteMany(),
    prisma.invoiceLineItem.deleteMany(),
    prisma.payment.deleteMany(),
    prisma.invoice.deleteMany(),
    prisma.estimateLineItem.deleteMany(),
    prisma.estimate.deleteMany(),
    prisma.jobNote.deleteMany(),
    prisma.jobPhoto.deleteMany(),
    prisma.jobChecklistItem.deleteMany(),
    prisma.jobStatusHistory.deleteMany(),
    prisma.jobAssignment.deleteMany(),
    prisma.job.deleteMany(),
    prisma.schedule.deleteMany(),
    prisma.equipment.deleteMany(),
    prisma.inventoryItem.deleteMany(),
    prisma.purchaseOrder.deleteMany(),
    prisma.supplier.deleteMany(),
    prisma.technician.deleteMany(),
    prisma.property.deleteMany(),
    prisma.customer.deleteMany(),
    prisma.session.deleteMany(),
    prisma.account.deleteMany(),
    prisma.user.deleteMany(),
    prisma.organization.deleteMany(),
  ]);

  // Create Organization
  const organization = await prisma.organization.create({
    data: {
      name: "Cool Air HVAC Services",
      slug: "coolair-hvac",
      address: "123 Service Street",
      city: "Dallas",
      state: "TX",
      zipCode: "75201",
      phone: "(555) 123-4567",
      email: "info@coolairhvac.com",
      website: "https://coolairhvac.com",
      timezone: "America/Chicago",
      currency: "USD",
      subscriptionTier: "PROFESSIONAL",
      subscriptionStatus: "ACTIVE",
      maxUsers: 20,
      maxTechnicians: 15,
    },
  });

  console.log(`Created organization: ${organization.name}`);

  // Hash password
  const hashedPassword = await bcrypt.hash("password123", 10);

  // Create Users
  const owner = await prisma.user.create({
    data: {
      email: "owner@coolairhvac.com",
      password: hashedPassword,
      name: "James Wilson",
      role: "OWNER",
      status: "ACTIVE",
      organizationId: organization.id,
    },
  });

  const admin = await prisma.user.create({
    data: {
      email: "admin@coolairhvac.com",
      password: hashedPassword,
      name: "Lisa Anderson",
      role: "ADMIN",
      status: "ACTIVE",
      organizationId: organization.id,
    },
  });

  const dispatcher = await prisma.user.create({
    data: {
      email: "dispatch@coolairhvac.com",
      password: hashedPassword,
      name: "Michael Chen",
      role: "DISPATCHER",
      status: "ACTIVE",
      organizationId: organization.id,
    },
  });

  const accountant = await prisma.user.create({
    data: {
      email: "accounting@coolairhvac.com",
      password: hashedPassword,
      name: "Sarah Miller",
      role: "ACCOUNTANT",
      status: "ACTIVE",
      organizationId: organization.id,
    },
  });

  console.log("Created users: owner, admin, dispatcher, accountant");

  // Create Technicians
  const techUsers = [
    { name: "Mike Johnson", email: "mike.j@coolairhvac.com" },
    { name: "Sarah Williams", email: "sarah.w@coolairhvac.com" },
    { name: "David Brown", email: "david.b@coolairhvac.com" },
    { name: "Jessica Taylor", email: "jessica.t@coolairhvac.com" },
  ];

  const technicians: any[] = [];
  for (const techData of techUsers) {
    const user = await prisma.user.create({
      data: {
        email: techData.email,
        password: hashedPassword,
        name: techData.name,
        role: "TECHNICIAN",
        status: "ACTIVE",
        organizationId: organization.id,
      },
    });

    const technician = await prisma.technician.create({
      data: {
        userId: user.id,
        organizationId: organization.id,
        employeeId: `EMP-${String(technicians.length + 1).padStart(3, "0")}`,
        skills: ["AC Repair", "Installation", "Maintenance"],
        certifications: ["EPA 608", "NATE"],
        licenseNumber: `HVAC-${Math.floor(Math.random() * 100000)}`,
        status: "AVAILABLE",
        rating: 4.5 + Math.random() * 0.5,
        jobsCompleted: Math.floor(Math.random() * 200) + 50,
      },
    });

    technicians.push({ user, technician });
  }

  console.log(`Created ${technicians.length} technicians`);

  // Create Customers
  const customersData = [
    { firstName: "John", lastName: "Smith", email: "john.smith@email.com", type: "RESIDENTIAL" },
    { firstName: "Emily", lastName: "Davis", email: "emily.davis@email.com", type: "RESIDENTIAL" },
    { firstName: "Robert", lastName: "Johnson", email: "robert.j@company.com", type: "COMMERCIAL" },
    { firstName: "Maria", lastName: "Garcia", email: "maria.garcia@email.com", type: "RESIDENTIAL" },
    { firstName: "Acme", lastName: "Corp", email: "facilities@acmecorp.com", type: "COMMERCIAL" },
  ];

  const customers = [];
  for (const customerData of customersData) {
    const customer = await prisma.customer.create({
      data: {
        organizationId: organization.id,
        createdById: owner.id,
        firstName: customerData.firstName,
        lastName: customerData.lastName,
        email: customerData.email,
        phones: [
          {
            number: `(${Math.floor(Math.random() * 900) + 100}) ${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`,
            type: "MOBILE",
            isPrimary: true,
          },
        ],
        type: customerData.type as any,
        status: "ACTIVE",
        properties: {
          create: [
            {
              name: customerData.type === "RESIDENTIAL" ? "Home" : "Main Office",
              address: `${Math.floor(Math.random() * 9000) + 1000} ${["Main", "Oak", "Park", "Elm", "Maple"][Math.floor(Math.random() * 5)]} St`,
              city: "Dallas",
              state: "TX",
              zipCode: `752${String(Math.floor(Math.random() * 99)).padStart(2, "0")}`,
              isPrimary: true,
              propertyType: customerData.type === "RESIDENTIAL" ? "SINGLE_FAMILY" : "COMMERCIAL",
            },
          ],
        },
      },
      include: {
        properties: true,
      },
    });

    customers.push(customer);
  }

  console.log(`Created ${customers.length} customers`);

  // Create Equipment for customers
  for (const customer of customers) {
    await prisma.equipment.createMany({
      data: [
        {
          organizationId: organization.id,
          customerId: customer.id,
          propertyId: customer.properties[0].id,
          type: "AIR_CONDITIONER",
          make: "Carrier",
          model: "Infinity 26",
          serialNumber: `SN${Math.floor(Math.random() * 1000000000)}`,
          installationDate: new Date(Date.now() - Math.floor(Math.random() * 5 * 365 * 24 * 60 * 60 * 1000)),
          warrantyExpiry: new Date(Date.now() + Math.floor(Math.random() * 5 * 365 * 24 * 60 * 60 * 1000)),
          capacity: `${Math.floor(Math.random() * 3) + 2} Ton`,
          status: "ACTIVE",
        },
      ],
    });
  }

  console.log("Created equipment for customers");

  // Create Jobs
  const jobTypes = ["INSTALLATION", "REPAIR", "MAINTENANCE", "INSPECTION"];
  const jobStatuses = ["NEW", "SCHEDULED", "ASSIGNED", "IN_PROGRESS", "COMPLETED"];
  const priorities = ["LOW", "NORMAL", "HIGH", "URGENT"];

  for (let i = 0; i < 20; i++) {
    const customer = customers[Math.floor(Math.random() * customers.length)];
    const status = jobStatuses[Math.floor(Math.random() * jobStatuses.length)];
    const scheduledDate = new Date(Date.now() + (Math.random() - 0.5) * 30 * 24 * 60 * 60 * 1000);
    
    const job = await prisma.job.create({
      data: {
        jobNumber: `JOB-2024-${String(i + 1).padStart(4, "0")}`,
        organizationId: organization.id,
        customerId: customer.id,
        propertyId: customer.properties[0].id,
        type: jobTypes[Math.floor(Math.random() * jobTypes.length)] as any,
        priority: priorities[Math.floor(Math.random() * priorities.length)] as any,
        status: status as any,
        title: `${["AC", "Heat Pump", "Furnace", "Ductwork"][Math.floor(Math.random() * 4)]} ${["Installation", "Repair", "Maintenance", "Inspection"][Math.floor(Math.random() * 4)]}`,
        description: "Customer reported issues with their HVAC system. Requires inspection and repair.",
        scheduledDate,
        scheduledTimeStart: scheduledDate,
        estimatedDuration: [60, 90, 120, 180, 240][Math.floor(Math.random() * 5)],
        estimatedCost: String(Math.floor(Math.random() * 3000) + 500),
        createdById: dispatcher.id,
      },
    });

    // Assign technician to some jobs
    if (["ASSIGNED", "IN_PROGRESS", "COMPLETED"].includes(status)) {
      const techPair = technicians[Math.floor(Math.random() * technicians.length)];
      await prisma.jobAssignment.create({
        data: {
          jobId: job.id,
          technicianId: techPair.technician.id,
          assignedById: dispatcher.id,
          isPrimary: true,
        },
      });
    }

    // Add status history
    await prisma.jobStatusHistory.create({
      data: {
        jobId: job.id,
        status: "NEW",
        notes: "Job created",
        createdById: dispatcher.id,
      },
    });
  }

  console.log("Created 20 jobs");

  // Create Inventory Items
  const inventoryItems = [
    { name: "Compressor - 3 Ton", category: "Compressors", sku: "COMP-3T-001", costPrice: 450, salePrice: 650 },
    { name: "Compressor - 5 Ton", category: "Compressors", sku: "COMP-5T-001", costPrice: 650, salePrice: 950 },
    { name: "Digital Thermostat", category: "Thermostats", sku: "THERM-DIG-001", costPrice: 85, salePrice: 150 },
    { name: "Smart Thermostat", category: "Thermostats", sku: "THERM-SMT-001", costPrice: 180, salePrice: 299 },
    { name: "Copper Pipe - 3/4\"", category: "Materials", sku: "PIPE-34-001", costPrice: 12, salePrice: 18 },
    { name: "Capacitor - 35/5 MFD", category: "Electrical", sku: "CAP-355-001", costPrice: 8, salePrice: 25 },
    { name: "Air Filter - 16x25x1", category: "Filters", sku: "FILT-1625-001", costPrice: 4, salePrice: 12 },
    { name: "Refrigerant R-410A", category: "Refrigerants", sku: "REF-410A-001", costPrice: 120, salePrice: 180 },
  ];

  for (const item of inventoryItems) {
    await prisma.inventoryItem.create({
      data: {
        organizationId: organization.id,
        sku: item.sku,
        name: item.name,
        category: item.category,
        costPrice: String(item.costPrice),
        salePrice: String(item.salePrice),
        quantityOnHand: Math.floor(Math.random() * 50) + 10,
        reorderPoint: 5,
        reorderQuantity: 25,
        isActive: true,
      },
    });
  }

  console.log(`Created ${inventoryItems.length} inventory items`);

  console.log("\n✅ Seed completed successfully!");
  console.log("\nTest accounts:");
  console.log("  Owner: owner@coolairhvac.com / password123");
  console.log("  Admin: admin@coolairhvac.com / password123");
  console.log("  Dispatcher: dispatch@coolairhvac.com / password123");
  console.log("  Accountant: accounting@coolairhvac.com / password123");
  console.log("  Technicians: mike.j@coolairhvac.com / password123 (and others)");
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
