import { getMockStore } from "../src/data/mockStore";
import { isOrderCancelled, isOrderConfirmed } from "./operationService";

export async function getStoreDashboardStats() {
  const { orders, users, products, settings } = getMockStore();

  let pendingOrders = 0;
  let confirmedOrders = 0;
  let cancelledOrders = 0;
  let confirmedRevenue = 0;
  let totalAwardedPoints = 0;

  for (const order of orders) {
    if (isOrderConfirmed(order.status)) {
      confirmedOrders += 1;
      confirmedRevenue += Number(order.total ?? order.amount ?? 0);
      totalAwardedPoints += Number(order.rewardPoints ?? order.points ?? 0);
    } else if (isOrderCancelled(order.status)) {
      cancelledOrders += 1;
    } else {
      pendingOrders += 1;
    }
  }

  const recentOrders = [...orders]
    .sort((a, b) => {
      const da = a.created_at ? new Date(a.created_at).getTime() : 0;
      const dbTime = b.created_at ? new Date(b.created_at).getTime() : 0;
      return dbTime - da;
    })
    .slice(0, 6);

  return {
    totalOrders: orders.length,
    pendingOrders,
    confirmedOrders,
    cancelledOrders,
    totalCustomers: users.length,
    totalProducts: products.length,
    confirmedRevenue,
    totalAwardedPoints,
    currency: settings?.currency || "$",
    storeName: settings?.storeName || "Woodra",
    recentOrders,
  };
}
