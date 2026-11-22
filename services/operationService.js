import { getMockStore, updateMockStore } from "../src/data/mockStore";

const operationListeners = new Set();

const notifyOperationListeners = () => {
  operationListeners.forEach((listener) => listener());
};

export const subscribeOperations = (listener) => {
  operationListeners.add(listener);
  return () => operationListeners.delete(listener);
};

export function isOrderConfirmed(status) {
  const s = String(status || "").toLowerCase();
  return s === "confirmed" || s === "done" || s === "completed";
}

export function isOrderCancelled(status) {
  const s = String(status || "").toLowerCase();
  return s === "cancelled" || s === "canceled";
}

export function isOrderPending(status) {
  return !isOrderConfirmed(status) && !isOrderCancelled(status);
}

export const getOperations = async () => {
  const { orders } = getMockStore();
  return [...orders].sort((a, b) => {
    const da = a.created_at ? new Date(a.created_at).getTime() : 0;
    const dbTime = b.created_at ? new Date(b.created_at).getTime() : 0;
    return dbTime - da;
  });
};

export const getOperationsByUser = async (userId, userEmail = "") => {
  const { orders } = getMockStore();
  const cleanUid = String(userId || "");
  const cleanEmail = String(userEmail || "").trim().toLowerCase();

  return orders
    .filter((op) => {
      if (op.userId !== undefined && op.userId !== null) {
        return String(op.userId) === cleanUid;
      }
      if (op.user_id !== undefined && op.user_id !== null) {
        return String(op.user_id) === cleanUid;
      }
      return (
        cleanEmail &&
        String(op.email || "").trim().toLowerCase() === cleanEmail
      );
    })
    .sort((a, b) => {
      const da = a.created_at ? new Date(a.created_at).getTime() : 0;
      const dbTime = b.created_at ? new Date(b.created_at).getTime() : 0;
      return dbTime - da;
    });
};

export const updateOperationStatus = async (id, nextStatus) => {
  const rawNext = String(nextStatus || "").toLowerCase();
  if (!["done", "confirmed", "cancelled", "pending"].includes(rawNext)) {
    throw new Error("Invalid order status.");
  }

  const targetStatus = rawNext === "done" ? "confirmed" : rawNext;
  const { orders } = getMockStore();
  const current = orders.find((o) => String(o.id) === String(id));

  if (!current) {
    throw new Error("Order not found.");
  }

  if (isOrderConfirmed(current.status) || isOrderCancelled(current.status)) {
    throw new Error(
      `This order is already ${current.status} and cannot be processed again.`
    );
  }

  const nowIso = new Date().toISOString();
  let updatedOrder = null;

  updateMockStore((store) => ({
    ...store,
    orders: store.orders.map((order) => {
      if (String(order.id) !== String(id)) return order;
      updatedOrder = {
        ...order,
        status: targetStatus,
        pointsAwarded: targetStatus === "confirmed",
        updated_at: nowIso,
      };
      return updatedOrder;
    }),
  }));

  notifyOperationListeners();
  return updatedOrder;
};
