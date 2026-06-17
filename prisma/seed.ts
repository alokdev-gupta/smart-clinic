import { PrismaClient, Role, AppointmentStatus, InvoiceStatus } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import * as dotenv from "dotenv";

// Load env vars — seed runs outside Next.js so we need to load manually
dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding database...");

  // Clean up existing data
  await prisma.prescription.deleteMany();
  await prisma.medicalRecord.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.appointment.deleteMany();
  await prisma.bed.deleteMany();
  await prisma.ward.deleteMany();
  await prisma.inventory.deleteMany();
  await prisma.doctor.deleteMany();
  await prisma.patient.deleteMany();
  await prisma.user.deleteMany();

  console.log("✅ Cleaned existing data");

  // ============================================================
  // ADMIN
  // ============================================================
  const adminPassword = await bcrypt.hash("Admin@123", 10);
  await prisma.user.create({
    data: {
      name: "Admin User",
      email: "admin@clinic.com",
      password: adminPassword,
      role: Role.ADMIN,
    },
  });

  console.log("✅ Admin created");

  // ============================================================
  // DOCTORS
  // ============================================================
  const doctorPassword = await bcrypt.hash("Doctor@123", 10);

  const doctor1User = await prisma.user.create({
    data: {
      name: "Dr. Ramesh Sharma",
      email: "ramesh@clinic.com",
      password: doctorPassword,
      role: Role.DOCTOR,
    },
  });

  const doctor2User = await prisma.user.create({
    data: {
      name: "Dr. Sunita Rai",
      email: "sunita@clinic.com",
      password: doctorPassword,
      role: Role.DOCTOR,
    },
  });

  const doctor3User = await prisma.user.create({
    data: {
      name: "Dr. Bikash Thapa",
      email: "bikash@clinic.com",
      password: doctorPassword,
      role: Role.DOCTOR,
    },
  });

  const doctor1 = await prisma.doctor.create({
    data: {
      userId: doctor1User.id,
      specialization: "Cardiology",
      licenseNumber: "NMC-001",
      experience: 10,
      consultationFee: 1500,
      schedule: {
        monday: "09:00-17:00",
        tuesday: "09:00-17:00",
        wednesday: "09:00-17:00",
        thursday: "09:00-17:00",
        friday: "09:00-14:00",
      },
    },
  });

  const doctor2 = await prisma.doctor.create({
    data: {
      userId: doctor2User.id,
      specialization: "Orthopedics",
      licenseNumber: "NMC-002",
      experience: 8,
      consultationFee: 1200,
      schedule: {
        monday: "10:00-18:00",
        tuesday: "10:00-18:00",
        wednesday: "10:00-18:00",
        thursday: "10:00-18:00",
        friday: "10:00-14:00",
      },
    },
  });

  const doctor3 = await prisma.doctor.create({
    data: {
      userId: doctor3User.id,
      specialization: "General Medicine",
      licenseNumber: "NMC-003",
      experience: 5,
      consultationFee: 800,
      schedule: {
        monday: "08:00-16:00",
        tuesday: "08:00-16:00",
        wednesday: "08:00-16:00",
        thursday: "08:00-16:00",
        friday: "08:00-13:00",
        saturday: "09:00-12:00",
      },
    },
  });

  console.log("✅ Doctors created");

  // ============================================================
  // PATIENTS
  // ============================================================
  const patientPassword = await bcrypt.hash("Patient@123", 10);

  const patientData = [
    {
      name: "Aarav Shrestha",
      email: "aarav@patient.com",
      dob: "1990-03-15",
      gender: "Male",
      blood: "O+",
      phone: "9841000001",
    },
    {
      name: "Priya Gurung",
      email: "priya@patient.com",
      dob: "1985-07-22",
      gender: "Female",
      blood: "A+",
      phone: "9841000002",
    },
    {
      name: "Sanjay Tamang",
      email: "sanjay@patient.com",
      dob: "1978-11-05",
      gender: "Male",
      blood: "B+",
      phone: "9841000003",
    },
    {
      name: "Anita Karki",
      email: "anita@patient.com",
      dob: "1995-02-18",
      gender: "Female",
      blood: "AB+",
      phone: "9841000004",
    },
    {
      name: "Roshan Magar",
      email: "roshan@patient.com",
      dob: "1982-09-30",
      gender: "Male",
      blood: "O-",
      phone: "9841000005",
    },
    {
      name: "Sita Rai",
      email: "sita@patient.com",
      dob: "1992-06-12",
      gender: "Female",
      blood: "A-",
      phone: "9841000006",
    },
    {
      name: "Deepak Adhikari",
      email: "deepak@patient.com",
      dob: "1975-12-25",
      gender: "Male",
      blood: "B-",
      phone: "9841000007",
    },
    {
      name: "Meena Thapa",
      email: "meena@patient.com",
      dob: "1988-04-08",
      gender: "Female",
      blood: "AB-",
      phone: "9841000008",
    },
    {
      name: "Suresh Basnet",
      email: "suresh@patient.com",
      dob: "1970-08-14",
      gender: "Male",
      blood: "O+",
      phone: "9841000009",
    },
    {
      name: "Kamala Pandey",
      email: "kamala@patient.com",
      dob: "1998-01-20",
      gender: "Female",
      blood: "A+",
      phone: "9841000010",
    },
  ];

  const patients = [];
  for (const pd of patientData) {
    const user = await prisma.user.create({
      data: {
        name: pd.name,
        email: pd.email,
        password: patientPassword,
        role: Role.PATIENT,
      },
    });
    const patient = await prisma.patient.create({
      data: {
        userId: user.id,
        dateOfBirth: new Date(pd.dob),
        gender: pd.gender,
        bloodGroup: pd.blood,
        phone: pd.phone,
        address: "Kathmandu, Nepal",
        emergencyContact: "9841999" + Math.floor(Math.random() * 1000).toString().padStart(3, "0"),
      },
    });
    patients.push(patient);
  }

  console.log("✅ 10 Patients created");

  // ============================================================
  // APPOINTMENTS (20 appointments)
  // ============================================================
  const doctors = [doctor1, doctor2, doctor3];
  const statuses = [
    AppointmentStatus.PENDING,
    AppointmentStatus.CONFIRMED,
    AppointmentStatus.COMPLETED,
    AppointmentStatus.CANCELLED,
  ];
  const times = ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"];
  const reasons = [
    "Regular checkup",
    "Chest pain",
    "Knee pain",
    "Fever and cough",
    "Headache",
    "Back pain",
    "Diabetes follow-up",
    "Heart palpitations",
    "Joint pain",
    "General weakness",
  ];

  const now = new Date();
  const appointments = [];

  for (let i = 0; i < 20; i++) {
    const daysAgo = Math.floor(Math.random() * 30);
    const appointmentDate = new Date(now);
    appointmentDate.setDate(appointmentDate.getDate() - daysAgo);
    appointmentDate.setHours(0, 0, 0, 0);

    const patient = patients[i % patients.length];
    const doctor = doctors[i % doctors.length];
    const status = statuses[i % statuses.length];
    const time = times[i % times.length];
    const reason = reasons[i % reasons.length];

    const appointment = await prisma.appointment.create({
      data: {
        patientId: patient.id,
        doctorId: doctor.id,
        date: appointmentDate,
        time,
        status,
        reason,
        notes: i % 3 === 0 ? "Patient requires follow-up in 2 weeks" : null,
      },
    });
    appointments.push({ appointment, patient, doctor, status });
  }

  console.log("✅ 20 Appointments created");

  // ============================================================
  // MEDICAL RECORDS for COMPLETED appointments
  // ============================================================
  const completedAppointments = appointments.filter(
    (a) => a.status === AppointmentStatus.COMPLETED
  );

  const diagnoses = [
    "Hypertension",
    "Type 2 Diabetes",
    "Osteoarthritis",
    "Upper Respiratory Tract Infection",
    "Migraine",
  ];

  for (let i = 0; i < completedAppointments.length; i++) {
    const { appointment, patient, doctor } = completedAppointments[i];
    await prisma.medicalRecord.create({
      data: {
        patientId: patient.id,
        doctorId: doctor.id,
        appointmentId: appointment.id,
        diagnosis: diagnoses[i % diagnoses.length],
        prescription: "Rest and medication as prescribed",
        labResults: i % 2 === 0 ? "Blood pressure: 130/85 mmHg, Blood Sugar: 120 mg/dL" : null,
        followUpDate:
          i % 2 === 0
            ? new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
            : null,
        prescriptions: {
          create: [
            {
              medicineName: "Paracetamol",
              dosage: "500mg",
              duration: "5 days",
              instructions: "Take after meals",
            },
            {
              medicineName: "Amoxicillin",
              dosage: "250mg",
              duration: "7 days",
              instructions: "Take twice daily",
            },
          ],
        },
      },
    });
  }

  console.log("✅ Medical records created for completed appointments");

  // ============================================================
  // INVOICES (10 invoices for COMPLETED appointments)
  // ============================================================
  const invoiceAmounts = [800, 1200, 1500, 2000, 2500, 3000, 3500, 4000, 4500, 5000];
  const invoiceStatuses = [InvoiceStatus.PAID, InvoiceStatus.PENDING];
  const paymentMethods = ["Cash", "Card", "Online Transfer", null];

  let invoiceCount = 0;
  for (let i = 0; i < completedAppointments.length && invoiceCount < 10; i++) {
    const { appointment, patient } = completedAppointments[i];
    const amount = invoiceAmounts[invoiceCount % invoiceAmounts.length];
    const taxRate = 13;
    const tax = Math.round((amount * taxRate) / 100);
    const total = amount + tax;
    const status = invoiceStatuses[invoiceCount % 2];
    const paymentMethod =
      status === InvoiceStatus.PAID
        ? paymentMethods[invoiceCount % 3]
        : null;

    await prisma.invoice.create({
      data: {
        appointmentId: appointment.id,
        patientId: patient.id,
        amount,
        tax,
        total,
        status,
        paymentMethod,
        issuedAt: appointment.date,
      },
    });
    invoiceCount++;
  }

  console.log("✅ 10 Invoices created");

  // ============================================================
  // INVENTORY (8 items)
  // ============================================================
  const inventoryItems = [
    {
      itemName: "Paracetamol",
      category: "Medicine",
      quantity: 500,
      unit: "Tablets",
      reorderLevel: 100,
      expiryDate: new Date("2027-12-31"),
      supplier: "Nepal Pharma Ltd",
      costPerUnit: 5,
    },
    {
      itemName: "Amoxicillin",
      category: "Medicine",
      quantity: 200,
      unit: "Capsules",
      reorderLevel: 50,
      expiryDate: new Date("2027-06-30"),
      supplier: "Nepal Pharma Ltd",
      costPerUnit: 15,
    },
    {
      itemName: "Surgical Gloves",
      category: "Equipment",
      quantity: 1000,
      unit: "Pairs",
      reorderLevel: 200,
      expiryDate: new Date("2026-12-31"),
      supplier: "MedSupply Nepal",
      costPerUnit: 30,
    },
    {
      itemName: "Syringe 5ml",
      category: "Equipment",
      quantity: 500,
      unit: "Pieces",
      reorderLevel: 100,
      expiryDate: new Date("2027-03-31"),
      supplier: "MedSupply Nepal",
      costPerUnit: 20,
    },
    {
      itemName: "Blood Pressure Monitor",
      category: "Medical Device",
      quantity: 10,
      unit: "Units",
      reorderLevel: 2,
      expiryDate: null,
      supplier: "HealthTech Nepal",
      costPerUnit: 3500,
    },
    {
      itemName: "Stethoscope",
      category: "Medical Device",
      quantity: 15,
      unit: "Units",
      reorderLevel: 3,
      expiryDate: null,
      supplier: "HealthTech Nepal",
      costPerUnit: 2500,
    },
    {
      itemName: "Bandage Roll",
      category: "Consumable",
      quantity: 300,
      unit: "Rolls",
      reorderLevel: 60,
      expiryDate: new Date("2028-01-31"),
      supplier: "MedSupply Nepal",
      costPerUnit: 45,
    },
    {
      itemName: "Hand Sanitizer",
      category: "Consumable",
      quantity: 100,
      unit: "Bottles",
      reorderLevel: 20,
      expiryDate: new Date("2026-09-30"),
      supplier: "CleanCare Nepal",
      costPerUnit: 120,
    },
  ];

  await prisma.inventory.createMany({ data: inventoryItems });

  console.log("✅ 8 Inventory items created");

  // ============================================================
  // WARDS AND BEDS
  // ============================================================
  const generalWard = await prisma.ward.create({
    data: {
      name: "General Ward",
      floor: 1,
      totalBeds: 20,
      availableBeds: 15,
      type: "GENERAL",
    },
  });

  const icuWard = await prisma.ward.create({
    data: {
      name: "ICU",
      floor: 2,
      totalBeds: 5,
      availableBeds: 3,
      type: "ICU",
    },
  });

  // Create 20 beds for General Ward
  const generalBeds = [];
  for (let i = 1; i <= 20; i++) {
    const isOccupied = i > 15; // beds 16-20 are occupied
    generalBeds.push({
      wardId: generalWard.id,
      bedNumber: `G-${String(i).padStart(2, "0")}`,
      isOccupied,
      patientId: isOccupied ? patients[(i - 16) % patients.length].id : null,
    });
  }
  await prisma.bed.createMany({ data: generalBeds });

  // Create 5 beds for ICU
  const icuBeds = [];
  for (let i = 1; i <= 5; i++) {
    const isOccupied = i > 3; // beds 4-5 are occupied
    icuBeds.push({
      wardId: icuWard.id,
      bedNumber: `ICU-${String(i).padStart(2, "0")}`,
      isOccupied,
      patientId: isOccupied ? patients[(i + 4) % patients.length].id : null,
    });
  }
  await prisma.bed.createMany({ data: icuBeds });

  console.log("✅ Wards and beds created");
  console.log("\n🎉 Database seeding completed successfully!");
  console.log("\n📋 Login Credentials:");
  console.log("  Admin:   admin@clinic.com / Admin@123");
  console.log("  Doctor:  ramesh@clinic.com / Doctor@123");
  console.log("  Doctor:  sunita@clinic.com / Doctor@123");
  console.log("  Doctor:  bikash@clinic.com / Doctor@123");
  console.log("  Patient: aarav@patient.com / Patient@123");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
