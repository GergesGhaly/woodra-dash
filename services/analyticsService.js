function formatDateIso(date) {
  return date.toISOString().slice(0, 10);
}

function addDays(date, delta) {
  const copy = new Date(date);
  copy.setUTCDate(copy.getUTCDate() + delta);
  return copy;
}

function resolveDummyRanges(preset = "30d", customStart = "", customEnd = "") {
  const now = new Date();
  const todayUtc = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
  );

  let start;
  let end = todayUtc;

  if (preset === "today") {
    start = todayUtc;
  } else if (preset === "7d") {
    start = addDays(todayUtc, -6);
  } else if (preset === "90d") {
    start = addDays(todayUtc, -89);
  } else if (preset === "custom" && customStart && customEnd) {
    const parsedStart = new Date(`${customStart}T00:00:00Z`);
    const parsedEnd = new Date(`${customEnd}T00:00:00Z`);
    if (
      Number.isNaN(parsedStart.getTime()) ||
      Number.isNaN(parsedEnd.getTime()) ||
      parsedStart > parsedEnd
    ) {
      throw new Error("Start date must be on or before end date.");
    }
    start = parsedStart;
    end = parsedEnd;
  } else {
    start = addDays(todayUtc, -29);
  }

  const daySpan = Math.max(
    1,
    Math.round((end.getTime() - start.getTime()) / (24 * 60 * 60 * 1000)) + 1
  );
  const prevEnd = addDays(start, -1);
  const prevStart = addDays(prevEnd, -(daySpan - 1));

  return {
    daySpan,
    start,
    currentRange: {
      startDate: formatDateIso(start),
      endDate: formatDateIso(end),
    },
    previousRange: {
      startDate: formatDateIso(prevStart),
      endDate: formatDateIso(prevEnd),
    },
  };
}

function calcChangePercent(current, previous) {
  if (!previous) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

export async function fetchGoogleAnalyticsReport({
  preset = "30d",
  startDate = "",
  endDate = "",
} = {}) {
  const { daySpan, start, currentRange, previousRange } = resolveDummyRanges(
    preset,
    startDate,
    endDate
  );

  const trafficSeries = [];
  let totalUsersSum = 0;
  let sessionsSum = 0;
  let pageViewsSum = 0;

  for (let i = 0; i < daySpan; i += 1) {
    const d = addDays(start, i);
    const wave = Math.sin(i * 0.65) * 28 + Math.cos(i * 0.3) * 16;
    const users = Math.max(42, Math.round(135 + wave + (i % 5) * 7));
    const sessions = Math.round(users * 1.34);
    const pageViews = Math.round(sessions * 3.15);

    totalUsersSum += users;
    sessionsSum += sessions;
    pageViewsSum += pageViews;

    trafficSeries.push({
      date: formatDateIso(d),
      activeUsers: Math.round(users * 0.92),
      users,
      sessions,
      pageViews,
    });
  }

  const activeUsers = Math.round(totalUsersSum * 0.86);
  const newUsers = Math.round(activeUsers * 0.64);
  const avgEngagementTimeSeconds = 164;
  const engagementRate = 63.4;
  const eventCount = Math.round(pageViewsSum * 2.1);

  const prevScale = 0.88;
  const metrics = {
    activeUsers: {
      value: activeUsers,
      previous: Math.round(activeUsers * prevScale),
      changePercent: calcChangePercent(
        activeUsers,
        Math.round(activeUsers * prevScale)
      ),
    },
    totalUsers: {
      value: totalUsersSum,
      previous: Math.round(totalUsersSum * 0.91),
      changePercent: calcChangePercent(
        totalUsersSum,
        Math.round(totalUsersSum * 0.91)
      ),
    },
    sessions: {
      value: sessionsSum,
      previous: Math.round(sessionsSum * 0.86),
      changePercent: calcChangePercent(
        sessionsSum,
        Math.round(sessionsSum * 0.86)
      ),
    },
    pageViews: {
      value: pageViewsSum,
      previous: Math.round(pageViewsSum * 0.89),
      changePercent: calcChangePercent(
        pageViewsSum,
        Math.round(pageViewsSum * 0.89)
      ),
    },
    newUsers: {
      value: newUsers,
      previous: Math.round(newUsers * 0.93),
      changePercent: calcChangePercent(newUsers, Math.round(newUsers * 0.93)),
    },
    avgEngagementTimeSeconds: {
      value: avgEngagementTimeSeconds,
      previous: 151,
      changePercent: calcChangePercent(avgEngagementTimeSeconds, 151),
    },
    engagementRate: {
      value: engagementRate,
      previous: 59.8,
      changePercent: calcChangePercent(engagementRate, 59.8),
    },
    eventCount: {
      value: eventCount,
      previous: Math.round(eventCount * 0.85),
      changePercent: calcChangePercent(
        eventCount,
        Math.round(eventCount * 0.85)
      ),
    },
  };

  const trafficSources = [
    {
      source: "Organic Search",
      sessions: Math.round(sessionsSum * 0.44),
      users: Math.round(activeUsers * 0.42),
    },
    {
      source: "Direct",
      sessions: Math.round(sessionsSum * 0.27),
      users: Math.round(activeUsers * 0.28),
    },
    {
      source: "Organic Social",
      sessions: Math.round(sessionsSum * 0.17),
      users: Math.round(activeUsers * 0.18),
    },
    {
      source: "Referral",
      sessions: Math.round(sessionsSum * 0.08),
      users: Math.round(activeUsers * 0.08),
    },
    {
      source: "Email",
      sessions: Math.round(sessionsSum * 0.04),
      users: Math.round(activeUsers * 0.04),
    },
  ];

  const topPages = [
    {
      pagePath: "/",
      pageTitle: "Woodra Home – Handcrafted Wood Furniture",
      views: Math.round(pageViewsSum * 0.34),
      users: Math.round(activeUsers * 0.72),
    },
    {
      pagePath: "/products",
      pageTitle: "Catalog – All Furniture",
      views: Math.round(pageViewsSum * 0.23),
      users: Math.round(activeUsers * 0.54),
    },
    {
      pagePath: "/product/oak-dining-chair",
      pageTitle: "Oak Dining Chair | Woodra",
      views: Math.round(pageViewsSum * 0.16),
      users: Math.round(activeUsers * 0.38),
    },
    {
      pagePath: "/product/walnut-dining-table",
      pageTitle: "Walnut Family Dining Table | Woodra",
      views: Math.round(pageViewsSum * 0.14),
      users: Math.round(activeUsers * 0.31),
    },
    {
      pagePath: "/categories",
      pageTitle: "Categories | Woodra",
      views: Math.round(pageViewsSum * 0.13),
      users: Math.round(activeUsers * 0.27),
    },
  ];

  const mobileUsers = Math.round(activeUsers * 0.62);
  const desktopUsers = Math.round(activeUsers * 0.31);
  const tabletUsers = Math.max(0, activeUsers - mobileUsers - desktopUsers);

  const deviceCategories = [
    {
      category: "mobile",
      users: mobileUsers,
      sessions: Math.round(sessionsSum * 0.6),
      percentage: 62,
    },
    {
      category: "desktop",
      users: desktopUsers,
      sessions: Math.round(sessionsSum * 0.33),
      percentage: 31,
    },
    {
      category: "tablet",
      users: tabletUsers,
      sessions: Math.round(sessionsSum * 0.07),
      percentage: 7,
    },
  ];

  const countries = [
    {
      country: "Egypt",
      users: Math.round(activeUsers * 0.45),
      sessions: Math.round(sessionsSum * 0.46),
    },
    {
      country: "Saudi Arabia",
      users: Math.round(activeUsers * 0.26),
      sessions: Math.round(sessionsSum * 0.25),
    },
    {
      country: "United Arab Emirates",
      users: Math.round(activeUsers * 0.14),
      sessions: Math.round(sessionsSum * 0.14),
    },
    {
      country: "Jordan",
      users: Math.round(activeUsers * 0.08),
      sessions: Math.round(sessionsSum * 0.08),
    },
    {
      country: "Kuwait",
      users: Math.round(activeUsers * 0.07),
      sessions: Math.round(sessionsSum * 0.07),
    },
  ];

  return {
    propertyId: "Demo Analytics",
    currentRange,
    previousRange,
    fetchedAt: new Date().toISOString(),
    fromCache: false,
    metrics,
    trafficSeries,
    trafficSources,
    topPages,
    deviceCategories,
    countries,
    ecommerceTracking: {
      presentEvents: ["view_item", "add_to_cart", "begin_checkout", "purchase"],
      missingEvents: [],
    },
  };
}
