import "./userList.css";
import { DataGrid } from "@mui/x-data-grid";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import SearchIcon from "@mui/icons-material/Search";
import {
  calculateUserStats,
  getUsers,
  subscribeUsers,
} from "../../../services/userService";
import {
  getOperations,
  subscribeOperations,
} from "../../../services/operationService";

function formatCurrency(value) {
  return `$${Number(value || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export default function UserList() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [operations, setOperations] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const loadData = async () => {
      try {
        const [usersList, opsList] = await Promise.all([
          getUsers(),
          getOperations(),
        ]);
        if (active) {
          setUsers(usersList);
          setOperations(opsList);
          setError("");
        }
      } catch (err) {
        if (active) {
          setError(err.message || "Failed to load customers.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadData();
    const unsubUsers = subscribeUsers(() => loadData());
    const unsubOps = subscribeOperations(() => loadData());

    return () => {
      active = false;
      unsubUsers();
      unsubOps();
    };
  }, []);

  const enrichedUsers = useMemo(() => {
    return users.map((user) => {
      const userEmail = String(user.email || "").trim().toLowerCase();
      const customerOrders = operations.filter((op) => {
        if (op.user_id !== undefined && op.user_id !== null) {
          return String(op.user_id) === String(user.id);
        }
        return userEmail && String(op.email || "").trim().toLowerCase() === userEmail;
      });

      const stats = calculateUserStats(customerOrders);

      return {
        ...user,
        totalOrders: stats.totalOrders,
        totalSpent: stats.totalSpent,
      };
    });
  }, [users, operations]);

  const filteredUsers = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return enrichedUsers;

    return enrichedUsers.filter((user) => {
      const name = String(user.name || user.username || "").toLowerCase();
      const phone = String(user.phone || "").toLowerCase();
      const email = String(user.email || "").toLowerCase();
      return name.includes(q) || phone.includes(q) || email.includes(q);
    });
  }, [enrichedUsers, searchQuery]);

  const columns = [
    { field: "id", headerName: "User ID", width: 90 },
    {
      field: "name",
      headerName: "Customer Name",
      width: 210,
      renderCell: (params) => (
        <span dir="auto" className="userListNameCell">
          {params.row.name || params.row.username || "Customer"}
        </span>
      ),
    },
    {
      field: "phone",
      headerName: "Phone Number",
      width: 170,
      valueGetter: (_value, row) => row.phone || "—",
    },
    {
      field: "email",
      headerName: "Email",
      width: 220,
      valueGetter: (_value, row) => row.email || "—",
    },
    {
      field: "totalOrders",
      headerName: "Total Orders",
      width: 120,
      type: "number",
    },
    {
      field: "totalSpent",
      headerName: "Total Spent",
      width: 130,
      valueFormatter: (value) => formatCurrency(value),
    },
    {
      field: "created_at",
      headerName: "Registration Date",
      width: 150,
      valueFormatter: (value) =>
        value ? new Date(value).toLocaleDateString() : "—",
    },
    {
      field: "action",
      headerName: "Actions",
      width: 140,
      sortable: false,
      renderCell: (params) => (
        <Link
          to={`/user/${params.row.id}`}
          onClick={(e) => e.stopPropagation()}
        >
          <button type="button" className="userListEdit">
            View Details
          </button>
        </Link>
      ),
    },
  ];

  return (
    <div className="userList">
      <div className="userListHeader">
        <div>
          <h1 className="userListTitle">Users</h1>
          <p className="userListSubtitle">
            View customer profiles, order counts, and total spending.
          </p>
        </div>

        <div className="userSearchBox">
          <SearchIcon className="userSearchIcon" />
          <input
            type="text"
            className="userSearchInput"
            placeholder="Search by name, phone, or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Search customers by name, phone, or email"
          />
          {searchQuery && (
            <button
              type="button"
              className="userSearchClear"
              onClick={() => setSearchQuery("")}
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {error && <div className="userListError">{error}</div>}

      {loading ? (
        <div className="userListState">Loading customers...</div>
      ) : users.length === 0 ? (
        <div className="userListState">No customers found.</div>
      ) : filteredUsers.length === 0 ? (
        <div className="userListState">
          No customers match &quot;{searchQuery}&quot;.
        </div>
      ) : (
        <div className="userListGridWrap">
          <DataGrid
            rows={filteredUsers}
            columns={columns}
            disableRowSelectionOnClick
            autoHeight
            pageSizeOptions={[10, 25]}
            initialState={{
              pagination: { paginationModel: { pageSize: 10, page: 0 } },
            }}
            onRowClick={(params) => navigate(`/user/${params.row.id}`)}
            sx={{
              "& .MuiDataGrid-row": {
                cursor: "pointer",
              },
            }}
          />
        </div>
      )}
    </div>
  );
}