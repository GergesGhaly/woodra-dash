import { getMockStore } from "../src/data/mockStore";
import { isOrderCancelled, isOrderConfirmed } from "./operationService";

const userListeners = new Set();

export const notifyUserListeners = () => {
  userListeners.forEach((listener) => listener());
};

export const subscribeUsers = (listener) => {
  userListeners.add(listener);
  return () => userListeners.delete(listener);
};

export const getUsers = async () => {
  const { users } = getMockStore();
  return [...users].sort((a, b) => (a.name || "").localeCompare(b.name || ""));
};

export const getUserById = async (id) => {
  const { users } = getMockStore();
  const found = users.find((u) => String(u.id) === String(id));
  return found ? { ...found } : null;
};

export const calculateUserStats = (orders = []) => {
  let totalSpent = 0;
  let awardedPoints = 0;
  let completedCount = 0;
  let pendingCount = 0;
  let cancelledCount = 0;

  for (const order of orders) {
    const amount = Number(order.total ?? order.amount ?? 0);
    const rewardPts = Number(order.rewardPoints ?? order.points ?? 0);

    if (isOrderConfirmed(order.status)) {
      completedCount += 1;
      totalSpent += amount;
      awardedPoints += rewardPts;
    } else if (isOrderCancelled(order.status)) {
      cancelledCount += 1;
    } else {
      pendingCount += 1;
    }
  }

  return {
    totalOrders: orders.length,
    totalSpent,
    awardedPoints,
    completedCount,
    pendingCount,
    cancelledCount,
  };
};
