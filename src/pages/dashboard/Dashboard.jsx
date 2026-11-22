import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import PendingActionsOutlinedIcon from "@mui/icons-material/PendingActionsOutlined";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import PeopleOutlinedIcon from "@mui/icons-material/PeopleOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined";
import StarsOutlinedIcon from "@mui/icons-material/StarsOutlined";
import { getStoreDashboardStats } from "../../../services/dashboardService";
import {
  isOrderCancelled,
  isOrderConfirmed,
  subscribeOperations,
} from "../../../services/operationService";
import { subscribeProducts } from "../../../services/productService";
import { subscribeUsers } from "../../../services/userService";
import GoogleAnalyticsSection from "../../components/analytics/GoogleAnalyticsSection";
import "./dashboard.css";

function formatCurrency(value, currency = "$") {
  const num = Number(value || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return currency === "$" ? `$${num}` : `${num} ${currency}`;
}

function getStatusBadgeClass(status) {
  if (isOrderConfirmed(status)) return "statusBadge statusDone";
  if (isOrderCancelled(status)) return "statusBadge statusCancelled";
  return "statusBadge statusPending";
}

function getStatusLabel(status) {
  if (isOrderConfirmed(status)) return "Confirmed";
  if (isOrderCancelled(status)) return "Cancelled";
  return "Pending";
}

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const loadStats = async () => {
      try {
        const data = await getStoreDashboardStats();
        if (active) {
          setStats(data);
          setError("");
        }
      } catch (err) {
        if (active) {
          let msg = err?.message || "Failed to load store dashboard statistics.";
          try {
            const parsed = JSON.parse(msg);
            if (parsed?.error) {
              msg = parsed.error;
            }
          } catch {
            // plain error message
          }
          setError(msg);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadStats();
    const unsubOps = subscribeOperations(() => loadStats());
    const unsubProds = subscribeProducts(() => loadStats());
    const unsubUsers = subscribeUsers(() => loadStats());

    return () => {
      active = false;
      unsubOps();
      unsubProds();
      unsubUsers();
    };
  }, []);

  const currency = stats?.currency || "$";
  const recentOrders = stats?.recentOrders || [];

  return (
    <div className="dashboardPage">
      <div className="dashboardHeader">
        <div>
          <h1 className="dashboardTitle">Dashboard Overview</h1>
          <p className="dashboardSubtitle">
            Store metrics, COD order revenue, and website analytics overview.
          </p>
        </div>
        <Link to="/operations" className="dashboardActionLink">
          View All Operations
        </Link>
      </div>

      {error && <div className="dashboardError">{error}</div>}

      {loading ? (
        <div className="dashboardLoading">Loading store statistics...</div>
      ) : (
        <>
          <div className="dashboardCards">
            <div className="statCard">
              <div className="statCardTop">
                <span className="statCardTitle">Total Orders</span>
                <AssignmentOutlinedIcon className="statCardIcon iconOrange" />
              </div>
              <div className="statCardValue">{stats?.totalOrders ?? 0}</div>
              <div className="statCardSub">All recorded COD orders</div>
            </div>

            <div className="statCard">
              <div className="statCardTop">
                <span className="statCardTitle">Pending Orders</span>
                <PendingActionsOutlinedIcon className="statCardIcon iconAmber" />
              </div>
              <div className="statCardValue">{stats?.pendingOrders ?? 0}</div>
              <div className="statCardSub">Awaiting confirmation</div>
            </div>

            <div className="statCard">
              <div className="statCardTop">
                <span className="statCardTitle">Confirmed Orders</span>
                <CheckCircleOutlinedIcon className="statCardIcon iconGreen" />
              </div>
              <div className="statCardValue">{stats?.confirmedOrders ?? 0}</div>
              <div className="statCardSub">Confirmed COD deliveries</div>
            </div>

            <div className="statCard">
              <div className="statCardTop">
                <span className="statCardTitle">Cancelled Orders</span>
                <CancelOutlinedIcon className="statCardIcon iconRed" />
              </div>
              <div className="statCardValue">{stats?.cancelledOrders ?? 0}</div>
              <div className="statCardSub">Excluded from revenue &amp; points</div>
            </div>

            <div className="statCard">
              <div className="statCardTop">
                <span className="statCardTitle">Total Customers</span>
                <PeopleOutlinedIcon className="statCardIcon iconOrange" />
              </div>
              <div className="statCardValue">{stats?.totalCustomers ?? 0}</div>
              <div className="statCardSub">Registered store accounts</div>
            </div>

            <div className="statCard">
              <div className="statCardTop">
                <span className="statCardTitle">Total Products</span>
                <Inventory2OutlinedIcon className="statCardIcon iconAmber" />
              </div>
              <div className="statCardValue">{stats?.totalProducts ?? 0}</div>
              <div className="statCardSub">Active &amp; draft catalog items</div>
            </div>

            <div className="statCard">
              <div className="statCardTop">
                <span className="statCardTitle">Confirmed Revenue (COD)</span>
                <PaymentsOutlinedIcon className="statCardIcon iconGreen" />
              </div>
              <div className="statCardValue">
                {formatCurrency(stats?.confirmedRevenue ?? 0, currency)}
              </div>
              <div className="statCardSub">
                Calculated from confirmed orders only
              </div>
            </div>

            <div className="statCard">
              <div className="statCardTop">
                <span className="statCardTitle">Awarded Reward Points</span>
                <StarsOutlinedIcon className="statCardIcon iconOrange" />
              </div>
              <div className="statCardValue">
                {Number(stats?.totalAwardedPoints ?? 0).toLocaleString()}
              </div>
              <div className="statCardSub">
                Points awarded on confirmed orders
              </div>
            </div>
          </div>

          <div className="dashboardRecentCard">
            <div className="dashboardRecentHeader">
              <h2 className="dashboardRecentTitle">Recent Orders</h2>
              <Link to="/operations" className="dashboardRecentLink">
                Manage Operations
              </Link>
            </div>

            {recentOrders.length === 0 ? (
              <div className="dashboardEmpty">No orders recorded yet.</div>
            ) : (
              <div className="dashboardTableWrap">
                <table className="dashboardTable">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Customer</th>
                      <th>Details</th>
                      <th>Date</th>
                      <th>Total</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrders.map((order) => (
                      <tr key={order.id}>
                        <td>#{order.id}</td>
                        <td>
                          {order.userId ? (
                            <Link
                              to={`/user/${order.userId}`}
                              className="dashboardCustomerLink"
                              dir="auto"
                            >
                              {order.name || "Customer"}
                            </Link>
                          ) : (
                            <span dir="auto">{order.name || "Customer"}</span>
                          )}
                        </td>
                        <td>{order.description || "—"}</td>
                        <td>
                          {order.created_at
                            ? new Date(order.created_at).toLocaleDateString()
                            : "—"}
                        </td>
                        <td>{formatCurrency(order.total, currency)}</td>
                        <td>
                          <span className={getStatusBadgeClass(order.status)}>
                            {getStatusLabel(order.status)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      <GoogleAnalyticsSection />
    </div>
  );
}
