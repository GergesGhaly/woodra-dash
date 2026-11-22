import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { DataGrid } from "@mui/x-data-grid";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
} from "@mui/material";
import {
  getOperations,
  isOrderCancelled,
  isOrderConfirmed,
  subscribeOperations,
  updateOperationStatus,
} from "../../../services/operationService";
import "./transactions.css";

function getStatusMeta(status) {
  if (isOrderConfirmed(status)) {
    return { label: "Confirmed", className: "opStatusBadge opStatusDone" };
  }
  if (isOrderCancelled(status)) {
    return { label: "Cancelled", className: "opStatusBadge opStatusCancelled" };
  }
  return { label: "Pending", className: "opStatusBadge opStatusPending" };
}

const Transactions = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [processingId, setProcessingId] = useState(null);
  const [cancelTarget, setCancelTarget] = useState(null);

  useEffect(() => {
    let active = true;

    const fetchOperations = async () => {
      try {
        const rows = await getOperations();
        if (active) {
          setData(rows);
          setError("");
        }
      } catch (err) {
        if (active) {
          setError(err.message || "Failed to load operations.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    fetchOperations();
    const unsubscribe = subscribeOperations(() => {
      fetchOperations();
    });
    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  const handleStatusUpdate = async (id, nextStatus) => {
    try {
      setProcessingId(id);
      setError("");
      await updateOperationStatus(id, nextStatus);
      setData((prev) =>
        prev.map((item) =>
          item.id === id
            ? { ...item, status: nextStatus, updated_at: new Date().toISOString() }
            : item
        )
      );
    } catch (err) {
      setError(err.message || "Failed to update operation status.");
    } finally {
      setProcessingId(null);
    }
  };

  const confirmCancel = async () => {
    if (!cancelTarget) return;
    const targetId = cancelTarget.id;
    setCancelTarget(null);
    await handleStatusUpdate(targetId, "cancelled");
  };

  const columns = [
    { field: "id", headerName: "Order ID", width: 135 },
    {
      field: "name",
      headerName: "User",
      width: 190,
      renderCell: (params) => {
        const label = params.row.name || params.row.user_name || "Customer";
        if (params.row.user_id !== undefined && params.row.user_id !== null) {
          return (
            <Link
              to={`/user/${params.row.user_id}`}
              style={{ color: "#2b2b2b", fontWeight: 600, textDecoration: "underline" }}
              dir="auto"
            >
              {label}
            </Link>
          );
        }
        return <span dir="auto">{label}</span>;
      },
    },
    {
      field: "description",
      headerName: "Details",
      width: 220,
      valueGetter: (_value, row) => row.description || "—",
    },
    {
      field: "created_at",
      headerName: "Time",
      width: 185,
      valueFormatter: (value) =>
        value ? new Date(value).toLocaleString() : "—",
    },
    {
      field: "amount",
      headerName: "Process Value",
      width: 140,
      valueFormatter: (value) => `$${Number(value || 0).toFixed(2)}`,
    },
    {
      field: "status",
      headerName: "Status",
      width: 130,
      renderCell: (params) => {
        const meta = getStatusMeta(params.row.status);
        return <span className={meta.className}>{meta.label}</span>;
      },
    },
    {
      field: "action",
      headerName: "Action",
      width: 210,
      sortable: false,
      renderCell: (params) => {
        const currentStatus = String(
          params.row.status || "pending"
        ).toLowerCase();
        const isLocked =
          isOrderConfirmed(currentStatus) || isOrderCancelled(currentStatus);
        const isBusy = processingId === params.row.id;

        return (
          <div className="operationActions">
            <button
              type="button"
              onClick={() => handleStatusUpdate(params.row.id, "confirmed")}
              disabled={isLocked || isBusy}
              className="transactionsListDone"
              title={
                isLocked
                  ? `Operation is already ${currentStatus}`
                  : "Mark operation as Done / Confirmed"
              }
            >
              Done
            </button>
            <button
              type="button"
              onClick={() => setCancelTarget(params.row)}
              disabled={isLocked || isBusy}
              className="transactionsListCancel"
              title={
                isLocked
                  ? `Operation is already ${currentStatus}`
                  : "Cancel operation"
              }
            >
              Cancel
            </button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="transactions">
      <div className="operationsHeader">
        <h1 className="operationsTitle">Operations</h1>
      </div>

      {error && <div className="operationsError">{error}</div>}

      {loading ? (
        <div className="operationsState">Loading operations...</div>
      ) : data.length === 0 ? (
        <div className="operationsState">No operations found.</div>
      ) : (
        <div className="operationsGridWrap">
          <DataGrid
            rows={data}
            columns={columns}
            disableRowSelectionOnClick
            autoHeight
            pageSizeOptions={[10, 25, 50]}
            initialState={{
              pagination: { paginationModel: { pageSize: 10, page: 0 } },
            }}
          />
        </div>
      )}

      <Dialog
        open={Boolean(cancelTarget)}
        onClose={() => setCancelTarget(null)}
      >
        <DialogTitle>Cancel Operation</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to cancel operation #{cancelTarget?.id}
            {cancelTarget?.name ? ` for ${cancelTarget.name}` : ""}? Cancelled
            operations cannot be processed again.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCancelTarget(null)}>Keep Pending</Button>
          <Button
            onClick={confirmCancel}
            color="error"
            variant="contained"
          >
            Confirm Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default Transactions;