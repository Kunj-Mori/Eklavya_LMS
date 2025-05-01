import { db } from "@/lib/db";
import { Course, Purchase } from "@prisma/client";

type PurchaseWithCourse = Purchase & {
  course: Course;
};

const groupByCourse = (purchases: PurchaseWithCourse[]) => {
  const grouped: { [courseTitle: string]: number } = {};
  
  purchases.forEach((purchase) => {
    const courseTitle = purchase.course.title;
    if (!grouped[courseTitle]) {
      grouped[courseTitle] = 0;
    }
    grouped[courseTitle] += purchase.course.price!;
  });

  return grouped;
};

export const getAnalytics = async (userId: string) => {
  try {
    // Get all purchases for courses created by this user
    const purchases = await db.purchase.findMany({
      where: {
        course: {
          userId: userId
        }
      },
      include: {
        course: true,
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Get count of courses
    const courseCount = await db.course.count({
      where: {
        userId: userId
      }
    });

    // Group earnings by course
    const groupedEarnings = groupByCourse(purchases);
    const data = Object.entries(groupedEarnings).map(([courseTitle, total]) => ({
      name: courseTitle,
      total: total,
    }));

    // Calculate total revenue
    const totalRevenue = data.reduce((acc, curr) => acc + curr.total, 0);
    
    // Calculate total sales count
    const totalSales = purchases.length;

    // Calculate monthly sales (current month revenue)
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    
    const monthlySales = purchases
      .filter(purchase => {
        const purchaseDate = new Date(purchase.createdAt);
        return purchaseDate.getMonth() === currentMonth && 
               purchaseDate.getFullYear() === currentYear;
      })
      .reduce((sum, purchase) => sum + purchase.course.price!, 0);

    // Get unique student count (active students)
    const uniqueUserIds = new Set(purchases.map(purchase => purchase.userId));
    const activeStudents = uniqueUserIds.size;

    // Find top performing course
    let topPerformingCourse = null;
    if (data.length > 0) {
      const sortedData = [...data].sort((a, b) => b.total - a.total);
      topPerformingCourse = {
        title: sortedData[0].name,
        revenue: sortedData[0].total
      };
    }

    // Get 5 most recent sales
    const recentSales = purchases.slice(0, 5).map(purchase => ({
      course: purchase.course.title,
      amount: purchase.course.price || 0,
      date: purchase.createdAt
    }));

    return {
      data,
      totalRevenue,
      totalSales,
      monthlySales,
      courseCount,
      activeStudents,
      topPerformingCourse,
      recentSales
    }
  } catch (error) {
    console.log("[GET_ANALYTICS]", error);
    return {
      data: [],
      totalRevenue: 0,
      totalSales: 0,
      monthlySales: 0,
      courseCount: 0,
      activeStudents: 0,
      topPerformingCourse: null,
      recentSales: []
    }
  }
}