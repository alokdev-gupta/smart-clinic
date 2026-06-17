import prisma from "@/lib/prisma";
import { startOfMonth, endOfMonth, subMonths, format, subDays, startOfDay, endOfDay } from "date-fns";

export async function getDashboardStats() {
  const now = new Date();
  const todayStart = startOfDay(now);
  const todayEnd = endOfDay(now);
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);

  // Run all queries concurrently
  const [
    totalPatients,
    todayAppointments,
    availableDoctors,
    monthlyRevenuePaid,
    bedStats,
    pendingInvoices,
    recentAppointments,
  ] = await Promise.all([
    // Total patients
    prisma.patient.count(),

    // Today's appointments
    prisma.appointment.count({
      where: {
        date: { gte: todayStart, lte: todayEnd },
      },
    }),

    // Available doctors (all doctors count)
    prisma.doctor.count(),

    // Monthly revenue (PAID invoices this month)
    prisma.invoice.aggregate({
      _sum: { total: true },
      where: {
        status: "PAID",
        issuedAt: { gte: monthStart, lte: monthEnd },
      },
    }),

    // Bed occupancy
    prisma.bed.groupBy({
      by: ["isOccupied"],
      _count: { _all: true },
    }),

    // Pending invoices
    prisma.invoice.count({
      where: { status: "PENDING" },
    }),

    // Recent appointments (last 5)
    prisma.appointment.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        patient: { include: { user: { select: { name: true } } } },
        doctor: { include: { user: { select: { name: true } } } },
      },
    }),
  ]);

  // Weekly appointments – last 7 days grouped by day
  const weeklyRaw = await Promise.all(
    Array.from({ length: 7 }, (_, i) => {
      const d = subDays(now, 6 - i);
      return prisma.appointment
        .count({
          where: {
            date: {
              gte: startOfDay(d),
              lte: endOfDay(d),
            },
          },
        })
        .then((count: number) => ({
          day: format(d, "EEE"), // Mon, Tue, ...
          count,
        }));
    })
  );

  // Monthly revenue trend – last 6 months
  const monthlyRevenueTrend = await Promise.all(
    Array.from({ length: 6 }, (_, i) => {
      const monthDate = subMonths(now, 5 - i);
      const start = startOfMonth(monthDate);
      const end = endOfMonth(monthDate);
      return prisma.invoice
        .aggregate({
          _sum: { total: true },
          where: {
            status: "PAID",
            issuedAt: { gte: start, lte: end },
          },
        })
        .then((agg: any) => ({
          month: format(monthDate, "MMM"),
          revenue: agg._sum.total ?? 0,
        }));
    })
  );

  // Calculate bed occupancy
  const totalBeds = bedStats.reduce((acc: number, s: any) => acc + s._count._all, 0);
  const occupiedBeds =
    bedStats.find((s: any) => s.isOccupied === true)?._count._all ?? 0;
  const bedOccupancyPercent =
    totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;

  // Shape recent appointments
  const recentAppointmentsData = recentAppointments.map((a: any) => ({
    id: a.id,
    patientName: a.patient.user.name,
    doctorName: a.doctor.user.name,
    date: format(a.date, "dd/MM/yyyy"),
    time: a.time,
    status: a.status,
  }));

  return {
    totalPatients,
    todayAppointments,
    availableDoctors,
    monthlyRevenue: monthlyRevenuePaid._sum.total ?? 0,
    bedOccupancyPercent,
    pendingInvoices,
    weeklyAppointments: weeklyRaw,
    monthlyRevenueTrend,
    recentAppointments: recentAppointmentsData,
  };
}
