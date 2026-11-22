import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import LocationSearchingIcon from "@mui/icons-material/LocationSearching";
import PermIdentityIcon from "@mui/icons-material/PermIdentity";
import PhoneAndroidIcon from "@mui/icons-material/PhoneAndroid";
import MailOutlineOutlinedIcon from "@mui/icons-material/MailOutlineOutlined";
import ShoppingBagOutlinedIcon from "@mui/icons-material/ShoppingBagOutlined";
import MonetizationOnOutlinedIcon from "@mui/icons-material/MonetizationOnOutlined";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import {
  calculateUserStats,
  getUserById,
} from "../../../services/userService";
import {
  getOperationsByUser,
  isOrderCancelled,
  isOrderConfirmed,
  subscribeOperations,
  updateOperationStatus,
} from "../../../services/operationService";
import "./user.css";

function formatCurrency(value) {
  return `$${Number(value || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function getStatusMeta(status) {
  if (isOrderConfirmed(status)) {
    return { label: "Confirmed", className: "userOrderBadge userOrderDone" };
  }
  if (isOrderCancelled(status)) {
    return { label: "Cancelled", className: "userOrderBadge userOrderCancelled" };
  }
  return { label: "Pending", className: "userOrderBadge userOrderPending" };
}

export default function User() {
  const { userId } = useParams();

  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState("");
  const [processingId, setProcessingId] = useState(null);
  const [cancelTarget, setCancelTarget] = useState(null);

  useEffect(() => {
    let active = true;

    const loadUserAndOrders = async () => {
      try {
        const customer = await getUserById(userId);
        if (!active) return;

        if (!customer) {
          setUser(null);
          setOrders([]);
          setError("Customer not found.");
          return;
        }

        const customerOrders = await getOperationsByUser(
          customer.id,
          customer.email
        );
        if (!active) return;

        setUser(customer);
        setOrders(customerOrders);
        setError("");
      } catch (err) {
        if (active) {
          setError(err.message || "Failed to load customer details.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadUserAndOrders();
    const unsubscribe = subscribeOperations(() => {
      loadUserAndOrders();
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, [userId]);

  const stats = useMemo(() => calculateUserStats(orders), [orders]);

  const handleOrderStatus = async (orderId, nextStatus) => {
    try {
      setProcessingId(orderId);
      setError("");
      setFeedback("");
      await updateOperationStatus(orderId, nextStatus);
      setOrders((prev) =>
        prev.map((order) =>
          order.id === orderId
            ? {
                ...order,
                status: nextStatus,
                updated_at: new Date().toISOString(),
              }
            : order
        )
      );
      setFeedback(
        `Order #${orderId} marked as ${
          isOrderConfirmed(nextStatus) ? "Confirmed" : "Cancelled"
        }.`
      );
    } catch (err) {
      setError(err.message || "Failed to update order status.");
    } finally {
      setProcessingId(null);
    }
  };

  const confirmCancelOrder = async () => {
    if (!cancelTarget) return;
    const targetId = cancelTarget.id;
    setCancelTarget(null);
    await handleOrderStatus(targetId, "cancelled");
  };

  if (loading) {
    return (
      <div className="user">
        <div className="userState">Loading customer details...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="user">
        <div className="userError">{error || "Customer not found."}</div>
        <Link to="/users" className="userBackLink">
          Back to Users
        </Link>
      </div>
    );
  }

  const displayName = user.name || user.username || "Customer";

  return (
    <div className="user">
      <div className="userTitleContainer">
        <div>
          <h1 className="userTitle">Customer Details</h1>
          <p className="userSubtitle">
            Profile overview and complete order history.
          </p>
        </div>
        <div className="userHeaderLinks">
          <Link to="/operations" className="userNavLinkSecondary">
            Operations
          </Link>
          <Link to="/users" className="userNavLink">
            Back to Users
          </Link>
        </div>
      </div>

      {error && <div className="userError">{error}</div>}
      {feedback && <div className="userSuccess">{feedback}</div>}

      <div className="userContainer">
        <div className="userShow">
          <div className="userShowTop">
            <div className="userAvatarFallback">
              {displayName.charAt(0).toUpperCase()}
            </div>
            <div className="userShowTopTitle">
              <span className="userShowUsername" dir="auto">
                {displayName}
              </span>
              <span className="userShowUserTitle">Customer ID #{user.id}</span>
            </div>
          </div>

          <div className="userShowDetailsGrid">
            <div className="userShowSection">
              <span className="userShowTitle">Customer Information</span>
              <div className="userShowInfo">
                <PermIdentityIcon className="userShowIcon" />
                <span className="userShowInfoLabel">Full Name:</span>
                <span className="userShowInfoTitle" dir="auto">
                  {displayName}
                </span>
              </div>
              <div className="userShowInfo">
                <PhoneAndroidIcon className="userShowIcon" />
                <span className="userShowInfoLabel">Phone Number:</span>
                <span className="userShowInfoTitle">{user.phone || "—"}</span>
              </div>
              <div className="userShowInfo">
                <MailOutlineOutlinedIcon className="userShowIcon" />
                <span className="userShowInfoLabel">Email:</span>
                <span className="userShowInfoTitle">{user.email || "—"}</span>
              </div>
              <div className="userShowInfo">
                <LocationSearchingIcon className="userShowIcon" />
                <span className="userShowInfoLabel">Delivery Address:</span>
                <span className="userShowInfoTitle" dir="auto">
                  {user.address || "—"}
                </span>
              </div>
              <div className="userShowInfo">
                <CalendarTodayIcon className="userShowIcon" />
                <span className="userShowInfoLabel">Registration Date:</span>
                <span className="userShowInfoTitle">
                  {user.created_at
                    ? new Date(user.created_at).toLocaleDateString()
                    : "—"}
                </span>
              </div>
            </div>

            <div className="userShowSection">
              <span className="userShowTitle">Order Summary</span>
              <div className="userSummaryCards">
                <div className="userSummaryCard">
                  <div className="userSummaryTop">
                    <span>Total Number of Orders</span>
                    <ShoppingBagOutlinedIcon className="userSummaryIconAmber" />
                  </div>
                  <div className="userSummaryValue">{stats.totalOrders}</div>
                  <div className="userSummarySub">
                    {stats.completedCount} Confirmed · {stats.pendingCount} Pending ·{" "}
                    {stats.cancelledCount} Cancelled
                  </div>
                </div>

                <div className="userSummaryCard">
                  <div className="userSummaryTop">
                    <span>Total Amount Spent</span>
                    <MonetizationOnOutlinedIcon className="userSummaryIconGreen" />
                  </div>
                  <div className="userSummaryValue">
                    {formatCurrency(stats.totalSpent)}
                  </div>
                  <div className="userSummarySub">
                    Confirmed COD orders · {stats.awardedPoints.toLocaleString()}{" "}
                    reward pts awarded
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="userOrdersCard">
          <div className="userOrdersHeader">
            <h2 className="userOrdersTitle">Order History</h2>
            <span className="userOrdersCount">
              {orders.length} order{orders.length === 1 ? "" : "s"}
            </span>
          </div>

          {orders.length === 0 ? (
            <div className="userOrdersEmpty">
              This customer has no previous orders yet.
            </div>
          ) : (
            <div className="userOrdersTableWrap">
              <table className="userOrdersTable">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Order Date</th>
                    <th>Products Ordered</th>
                    <th>Total Amount</th>
                    <th>Order Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => {
                    const currentStatus = String(
                      order.status || "pending"
                    ).toLowerCase();
                    const isLocked =
                      isOrderConfirmed(currentStatus) ||
                      isOrderCancelled(currentStatus);
                    const isBusy = processingId === order.id;
                    const meta = getStatusMeta(order.status);

                    return (
                      <tr key={order.id}>
                        <td className="orderIdCell">#{order.id}</td>
                        <td>
                          {order.created_at
                            ? new Date(order.created_at).toLocaleString()
                            : "—"}
                        </td>
                        <td>
                          {Array.isArray(order.items) &&
                          order.items.length > 0 ? (
                            <ul className="orderProductsList">
                              {order.items.map((item, idx) => (
                                <li key={`${order.id}-${idx}`}>
                                  {item.title || item.name || "Product"} ×{" "}
                                  {item.quantity || 1}
                                </li>
                              ))}
                            </ul>
                          ) : (
                            order.description || "—"
                          )}
                        </td>
                        <td className="orderAmountCell">
                          {formatCurrency(order.amount)}
                        </td>
                        <td>
                          <span className={meta.className}>{meta.label}</span>
                        </td>
                        <td>
                          <div className="orderActionButtons">
                            <button
                              type="button"
                              className="orderBtnDone"
                              disabled={isLocked || isBusy}
                              onClick={() =>
                                handleOrderStatus(order.id, "confirmed")
                              }
                              title={
                                isLocked
                                  ? `Order is already ${currentStatus}`
                                  : "Mark order as Done / Confirmed"
                              }
                            >
                              Done
                            </button>
                            <button
                              type="button"
                              className="orderBtnCancel"
                              disabled={isLocked || isBusy}
                              onClick={() => setCancelTarget(order)}
                              title={
                                isLocked
                                  ? `Order is already ${currentStatus}`
                                  : "Cancel order"
                              }
                            >
                              Cancel
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <Dialog
        open={Boolean(cancelTarget)}
        onClose={() => setCancelTarget(null)}
      >
        <DialogTitle>Cancel Order</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to cancel order #{cancelTarget?.id} for{" "}
            <strong dir="auto">{displayName}</strong>? Cancelled orders cannot
            be processed again and will be excluded from Total Spent.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCancelTarget(null)}>Keep Pending</Button>
          <Button
            onClick={confirmCancelOrder}
            color="error"
            variant="contained"
          >
            Confirm Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
