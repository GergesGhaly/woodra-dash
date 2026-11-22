import { useCallback, useEffect, useState } from "react";
import RefreshIcon from "@mui/icons-material/Refresh";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import AnalyticsOutlinedIcon from "@mui/icons-material/AnalyticsOutlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { fetchGoogleAnalyticsReport } from "../../../services/analyticsService";
import "./googleAnalyticsSection.css";

const DEVICE_COLORS = ["#99532f", "#636d55", "#a0af92", "#64748b"];

function formatDuration(seconds) {
  const total = Math.max(0, Math.round(Number(seconds) || 0));
  const mins = Math.floor(total / 60);
  const secs = total % 60;
  if (mins === 0) return `${secs}s`;
  return `${mins}m ${secs}s`;
}

function formatNumber(val) {
  return Math.round(Number(val) || 0).toLocaleString();
}

function renderDeltaBadge(metric) {
  if (!metric) return null;
  const pct = Number(metric.changePercent || 0);
  const prevZero = Number(metric.previous || 0) === 0;
  const isPos = pct > 0;
  const isNeg = pct < 0;

  return (
    <span
      className={`gaDeltaBadge ${
        isPos ? "gaDeltaUp" : isNeg ? "gaDeltaDown" : "gaDeltaNeutral"
      }`}
      title={
        prevZero
          ? "Previous period value was 0"
          : `Previous period: ${formatNumber(metric.previous)}`
      }
    >
      {isPos && <ArrowUpwardIcon style={{ fontSize: 14 }} />}
      {isNeg && <ArrowDownwardIcon style={{ fontSize: 14 }} />}
      {isPos ? "+" : ""}
      {pct.toFixed(1)}%
    </span>
  );
}

export default function GoogleAnalyticsSection() {
  const [preset, setPreset] = useState("30d");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");
  const [appliedCustom, setAppliedCustom] = useState({ start: "", end: "" });

  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadAnalytics = useCallback(
    async (forceRefresh = false) => {
      if (preset === "custom" && (!appliedCustom.start || !appliedCustom.end)) {
        return;
      }

      try {
        setLoading(true);
        setError("");
        const data = await fetchGoogleAnalyticsReport({
          preset,
          startDate: appliedCustom.start,
          endDate: appliedCustom.end,
          forceRefresh,
        });
        setReport(data);
      } catch (err) {
        setReport(null);
        setError(
          err?.message || "Unable to retrieve Google Analytics 4 reports."
        );
      } finally {
        setLoading(false);
      }
    },
    [preset, appliedCustom.start, appliedCustom.end]
  );

  useEffect(() => {
    if (preset === "custom" && (!appliedCustom.start || !appliedCustom.end)) {
      return;
    }

    let active = true;
    (async () => {
      try {
        const data = await fetchGoogleAnalyticsReport({
          preset,
          startDate: appliedCustom.start,
          endDate: appliedCustom.end,
          forceRefresh: false,
        });
        if (active) {
          setReport(data);
          setError("");
        }
      } catch (err) {
        if (active) {
          setReport(null);
          setError(
            err?.message || "Unable to retrieve Google Analytics 4 reports."
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    })();

    return () => {
      active = false;
    };
  }, [preset, appliedCustom.start, appliedCustom.end]);

  const handlePresetClick = (nextPreset) => {
    setError("");
    if (nextPreset !== "custom") {
      setLoading(true);
    }
    setPreset(nextPreset);
  };

  const handleApplyCustom = (e) => {
    e.preventDefault();
    if (!customStart || !customEnd) {
      setError("Please select both a start date and an end date.");
      return;
    }
    if (customStart > customEnd) {
      setError("Start date must be on or before end date.");
      return;
    }
    setError("");
    setLoading(true);
    setAppliedCustom({ start: customStart, end: customEnd });
  };

  const metrics = report?.metrics;
  const hasAnyTraffic =
    report &&
    ((metrics?.activeUsers?.value || 0) > 0 ||
      (metrics?.sessions?.value || 0) > 0 ||
      (metrics?.pageViews?.value || 0) > 0 ||
      (report.trafficSeries?.length || 0) > 0);

  return (
    <section className="gaSection" aria-label="Google Analytics 4">
      <div className="gaHeader">
        <div className="gaHeaderTitleWrap">
          <div className="gaTitleRow">
            <AnalyticsOutlinedIcon className="gaHeaderIcon" />
            <h2 className="gaTitle">Website Traffic &amp; Behavior (GA4)</h2>
            <span className="gaPropertyTag">
              {report?.propertyId || "Demo Analytics"}
            </span>
          </div>
          <p className="gaSubtitle">
            Traffic overview and visitor metrics. Store orders and COD revenue
            above reflect current store orders.
          </p>
        </div>

        <div className="gaControls">
          <div className="gaPresetGroup" role="group" aria-label="Date Range">
            {[
              { id: "today", label: "Today" },
              { id: "7d", label: "Last 7 Days" },
              { id: "30d", label: "Last 30 Days" },
              { id: "90d", label: "Last 90 Days" },
              { id: "custom", label: "Custom" },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                className={`gaPresetBtn ${preset === item.id ? "active" : ""}`}
                onClick={() => handlePresetClick(item.id)}
              >
                {item.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            className="gaRefreshBtn"
            onClick={() => loadAnalytics(true)}
            disabled={loading}
            title="Refresh analytics (bypasses 15-minute cache)"
          >
            <RefreshIcon fontSize="small" />
            <span>{loading ? "Loading..." : "Refresh"}</span>
          </button>
        </div>
      </div>

      {preset === "custom" && (
        <form className="gaCustomRangeForm" onSubmit={handleApplyCustom}>
          <label>
            From
            <input
              type="date"
              value={customStart}
              onChange={(e) => setCustomStart(e.target.value)}
            />
          </label>
          <label>
            To
            <input
              type="date"
              value={customEnd}
              onChange={(e) => setCustomEnd(e.target.value)}
            />
          </label>
          <button type="submit" className="gaApplyCustomBtn">
            Apply Range
          </button>
        </form>
      )}

      {report && (
        <div className="gaMetaBar">
          <span>
            Period: <strong>{report.currentRange?.startDate}</strong> to{" "}
            <strong>{report.currentRange?.endDate}</strong> (compared vs{" "}
            {report.previousRange?.startDate} to {report.previousRange?.endDate}
            )
          </span>
          <span>
            {report.fromCache ? "Cached" : "Demo Data"} · Updated{" "}
            {new Date(report.fetchedAt).toLocaleTimeString()}
          </span>
        </div>
      )}

      {loading ? (
        <div className="gaLoadingState">
          Retrieving Google Analytics 4 report...
        </div>
      ) : error ? (
        <div className="gaErrorCard">
          <div className="gaErrorTitle">Google Analytics Data Unavailable</div>
          <p className="gaErrorText">{error}</p>
          <button
            type="button"
            className="gaRetryBtn"
            onClick={() => loadAnalytics(true)}
          >
            Retry Connection
          </button>
        </div>
      ) : !hasAnyTraffic ? (
        <div className="gaEmptyState">
          No Google Analytics traffic data was recorded for the selected date
          range.
        </div>
      ) : (
        <>
          <div className="gaMetricsGrid">
            <div className="gaMetricCard">
              <span className="gaMetricLabel">Active Users</span>
              <div className="gaMetricValueRow">
                <span className="gaMetricValue">
                  {formatNumber(metrics.activeUsers.value)}
                </span>
                {renderDeltaBadge(metrics.activeUsers)}
              </div>
            </div>

            <div className="gaMetricCard">
              <span className="gaMetricLabel">Total Users</span>
              <div className="gaMetricValueRow">
                <span className="gaMetricValue">
                  {formatNumber(metrics.totalUsers.value)}
                </span>
                {renderDeltaBadge(metrics.totalUsers)}
              </div>
            </div>

            <div className="gaMetricCard">
              <span className="gaMetricLabel">Sessions</span>
              <div className="gaMetricValueRow">
                <span className="gaMetricValue">
                  {formatNumber(metrics.sessions.value)}
                </span>
                {renderDeltaBadge(metrics.sessions)}
              </div>
            </div>

            <div className="gaMetricCard">
              <span className="gaMetricLabel">Page Views</span>
              <div className="gaMetricValueRow">
                <span className="gaMetricValue">
                  {formatNumber(metrics.pageViews.value)}
                </span>
                {renderDeltaBadge(metrics.pageViews)}
              </div>
            </div>

            <div className="gaMetricCard">
              <span className="gaMetricLabel">New Users</span>
              <div className="gaMetricValueRow">
                <span className="gaMetricValue">
                  {formatNumber(metrics.newUsers.value)}
                </span>
                {renderDeltaBadge(metrics.newUsers)}
              </div>
            </div>

            <div className="gaMetricCard">
              <span className="gaMetricLabel">Avg. Engagement Time</span>
              <div className="gaMetricValueRow">
                <span className="gaMetricValue">
                  {formatDuration(metrics.avgEngagementTimeSeconds.value)}
                </span>
                {renderDeltaBadge(metrics.avgEngagementTimeSeconds)}
              </div>
            </div>

            <div className="gaMetricCard">
              <span className="gaMetricLabel">Engagement Rate</span>
              <div className="gaMetricValueRow">
                <span className="gaMetricValue">
                  {Number(metrics.engagementRate.value || 0).toFixed(1)}%
                </span>
                {renderDeltaBadge(metrics.engagementRate)}
              </div>
            </div>

            <div className="gaMetricCard">
              <span className="gaMetricLabel">Event Count</span>
              <div className="gaMetricValueRow">
                <span className="gaMetricValue">
                  {formatNumber(metrics.eventCount.value)}
                </span>
                {renderDeltaBadge(metrics.eventCount)}
              </div>
            </div>
          </div>

          <div className="gaChartsGrid">
            {/* A. Website Traffic Overview */}
            <div className="gaChartCard gaChartWide">
              <h3 className="gaChartTitle">Website Traffic Overview</h3>
              {report.trafficSeries?.length > 0 ? (
                <div className="gaChartContainer">
                  <ResponsiveContainer width="100%" height={280}>
                    <LineChart data={report.trafficSeries}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#eeeeee" />
                      <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="users"
                        name="Users"
                        stroke="#99532f"
                        strokeWidth={2}
                        dot={false}
                      />
                      <Line
                        type="monotone"
                        dataKey="sessions"
                        name="Sessions"
                        stroke="#636d55"
                        strokeWidth={2}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="gaEmptyChart">No daily traffic data available.</div>
              )}
            </div>

            {/* B. Traffic Sources */}
            <div className="gaChartCard">
              <h3 className="gaChartTitle">Traffic Sources</h3>
              {report.trafficSources?.length > 0 ? (
                <div className="gaChartContainer">
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={report.trafficSources}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#eeeeee" />
                      <XAxis dataKey="source" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="sessions" name="Sessions" fill="#99532f" />
                      <Bar dataKey="users" name="Active Users" fill="#636d55" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="gaEmptyChart">No traffic sources recorded.</div>
              )}
            </div>

            {/* D. Device Categories */}
            <div className="gaChartCard">
              <h3 className="gaChartTitle">Device Categories</h3>
              {report.deviceCategories?.length > 0 ? (
                <div className="gaDeviceLayout">
                  <div className="gaPieWrap">
                    <ResponsiveContainer width="100%" height={220}>
                      <PieChart>
                        <Pie
                          data={report.deviceCategories}
                          dataKey="users"
                          nameKey="category"
                          cx="50%"
                          cy="50%"
                          outerRadius={75}
                          label={({ category, percentage }) =>
                            `${category} (${percentage.toFixed(0)}%)`
                          }
                        >
                          {report.deviceCategories.map((entry, idx) => (
                            <Cell
                              key={entry.category}
                              fill={DEVICE_COLORS[idx % DEVICE_COLORS.length]}
                            />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="gaDeviceLegend">
                    {report.deviceCategories.map((d, idx) => (
                      <div key={d.category} className="gaDeviceRow">
                        <span
                          className="gaDeviceDot"
                          style={{
                            backgroundColor:
                              DEVICE_COLORS[idx % DEVICE_COLORS.length],
                          }}
                        />
                        <span className="gaDeviceName">{d.category}</span>
                        <span className="gaDeviceVal">
                          {formatNumber(d.users)} ({d.percentage.toFixed(1)}%)
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="gaEmptyChart">No device data available.</div>
              )}
            </div>

            {/* C. Most Visited Pages */}
            <div className="gaChartCard">
              <h3 className="gaChartTitle">Most Visited Pages</h3>
              {report.topPages?.length > 0 ? (
                <div className="gaTableWrap">
                  <table className="gaTable">
                    <thead>
                      <tr>
                        <th>Page</th>
                        <th>Path</th>
                        <th>Views</th>
                      </tr>
                    </thead>
                    <tbody>
                      {report.topPages.map((p, idx) => (
                        <tr key={`${p.pagePath}-${idx}`}>
                          <td>{p.pageTitle}</td>
                          <td className="gaMonoPath">{p.pagePath}</td>
                          <td>{formatNumber(p.views)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="gaEmptyChart">No page view data recorded.</div>
              )}
            </div>

            {/* E. Geographic Overview */}
            <div className="gaChartCard">
              <h3 className="gaChartTitle">Geographic Overview</h3>
              {report.countries?.length > 0 ? (
                <div className="gaTableWrap">
                  <table className="gaTable">
                    <thead>
                      <tr>
                        <th>Country</th>
                        <th>Users</th>
                        <th>Sessions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {report.countries.map((c) => (
                        <tr key={c.country}>
                          <td>{c.country}</td>
                          <td>{formatNumber(c.users)}</td>
                          <td>{formatNumber(c.sessions)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="gaEmptyChart">
                  No geographic traffic data available.
                </div>
              )}
            </div>
          </div>

          {report.ecommerceTracking?.missingEvents?.length > 0 && (
            <div className="gaNoticeBanner">
              <InfoOutlinedIcon fontSize="small" />
              <div>
                <strong>Storefront E-commerce Tracking Note:</strong> The
                following GA4 e-commerce events were not detected in this period:{" "}
                <code>{report.ecommerceTracking.missingEvents.join(", ")}</code>
                . Add these events to the Woodra Storefront using{" "}
                <code>logEvent()</code> if you want funnel tracking. Because
                Woodra uses Cash on Delivery (COD), confirmed revenue and reward
                points are calculated exclusively from confirmed{" "}
                <code>orders</code>.
              </div>
            </div>
          )}
        </>
      )}
    </section>
  );
}
