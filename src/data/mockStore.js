import { DUMMY_CUSTOMERS_TEMPLATE } from "./dummyCustomers";

const STORAGE_KEY = "woodra_mock_store_v1";

function daysAgoIso(daysAgo, hour = 11) {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  d.setHours(hour, 15, 0, 0);
  return d.toISOString();
}

const INITIAL_CATEGORIES = [
  {
    id: "cat-1",
    name_en: "Dining Chairs",
    name_ar: "كراسي طعام",
    created_at: daysAgoIso(120),
    updated_at: daysAgoIso(120),
  },
  {
    id: "cat-2",
    name_en: "Dining Tables",
    name_ar: "طاولات طعام",
    created_at: daysAgoIso(115),
    updated_at: daysAgoIso(115),
  },
  {
    id: "cat-3",
    name_en: "Office Desks",
    name_ar: "مكاتب عمل",
    created_at: daysAgoIso(110),
    updated_at: daysAgoIso(110),
  },
  {
    id: "cat-4",
    name_en: "Living Room Sofas",
    name_ar: "أرائك غرفة المعيشة",
    created_at: daysAgoIso(95),
    updated_at: daysAgoIso(95),
  },
  {
    id: "cat-5",
    name_en: "Wooden Storage",
    name_ar: "وحدات تخزين خشبية",
    created_at: daysAgoIso(80),
    updated_at: daysAgoIso(80),
  },
];

const INITIAL_PRODUCTS = [
  {
    id: "prod-1",
    title: "Oak Dining Chair",
    title_ar: "كرسي طعام من خشب البلوط",
    description:
      "Handcrafted solid oak dining chair with ergonomic backrest and natural matte oil finish.",
    description_ar:
      "كرسي طعام مصنوع يدويًا من خشب البلوط الطبيعي بظهر مريح وتشطيب مطفي.",
    category_id: "cat-1",
    price: 185,
    points: 18,
    active: true,
    images: [
      "https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg?auto=compress&cs=tinysrgb&w=600",
    ],
    created_at: daysAgoIso(90),
    updated_at: daysAgoIso(20),
  },
  {
    id: "prod-2",
    title: "Walnut Family Dining Table",
    title_ar: "طاولة طعام عائلية من خشب الجوز",
    description:
      "Spacious six-seater dining table crafted from kiln-dried American walnut wood.",
    description_ar:
      "طاولة طعام واسعة تتسع لستة أشخاص مصنوعة من خشب الجوز الأمريكي المعالج.",
    category_id: "cat-2",
    price: 740,
    points: 74,
    active: true,
    images: [
      "https://images.pexels.com/photos/1080721/pexels-photo-1080721.jpeg?auto=compress&cs=tinysrgb&w=600",
    ],
    created_at: daysAgoIso(85),
    updated_at: daysAgoIso(18),
  },
  {
    id: "prod-3",
    title: "Minimalist Studio Desk",
    title_ar: "مكتب عمل بسيط من الخشب الطبيعي",
    description:
      "Clean-lined workspace desk with hidden cable tray and solid ash wood legs.",
    description_ar:
      "مكتب عمل عصري بتصميم بسيط مع مجرى مخفي للكابلات وأرجل من خشب الدردار الصلب.",
    category_id: "cat-3",
    price: 420,
    points: 42,
    active: true,
    images: [
      "https://images.pexels.com/photos/667838/pexels-photo-667838.jpeg?auto=compress&cs=tinysrgb&w=600",
    ],
    created_at: daysAgoIso(75),
    updated_at: daysAgoIso(14),
  },
  {
    id: "prod-4",
    title: "Nordic Linen Sofa",
    title_ar: "أريكة كتان بقاعدة خشب زان",
    description:
      "Three-seater living room sofa upholstered in breathable linen over a beechwood frame.",
    description_ar:
      "أريكة ثلاثية من الكتان الفاخر بقاعدة متينة من خشب الزان الطبيعي.",
    category_id: "cat-4",
    price: 960,
    points: 96,
    active: true,
    images: [
      "https://images.pexels.com/photos/1866149/pexels-photo-1866149.jpeg?auto=compress&cs=tinysrgb&w=600",
    ],
    created_at: daysAgoIso(60),
    updated_at: daysAgoIso(10),
  },
  {
    id: "prod-5",
    title: "Rustic Pine Bookshelf",
    title_ar: "مكتبة كتب من خشب الصنوبر",
    description:
      "Five-tier open shelving unit in warm honey-toned pine for living rooms and studies.",
    description_ar:
      "وحدة أرفف مفتوحة من خمسة طوابق من خشب الصنوبر الدافئ لغرف المعيشة والمكاتب.",
    category_id: "cat-5",
    price: 310,
    points: 31,
    active: true,
    images: [
      "https://images.pexels.com/photos/2079249/pexels-photo-2079249.jpeg?auto=compress&cs=tinysrgb&w=600",
    ],
    created_at: daysAgoIso(45),
    updated_at: daysAgoIso(7),
  },
  {
    id: "prod-6",
    title: "Teak Sideboard Cabinet",
    title_ar: "خزانة جانبية من خشب الساج",
    description:
      "Mid-century modern sideboard cabinet with soft-close doors and brass pulls.",
    description_ar:
      "خزانة جانبية بتصميم عصري مع أبواب هادئة الإغلاق ومقابض نحاسية.",
    category_id: "cat-5",
    price: 580,
    points: 58,
    active: false,
    images: [
      "https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=600",
    ],
    created_at: daysAgoIso(30),
    updated_at: daysAgoIso(4),
  },
];

function buildInitialSeed() {
  const users = [];
  const orders = [];

  for (const customer of DUMMY_CUSTOMERS_TEMPLATE) {
    const customerId = String(customer.id);
    users.push({
      id: customerId,
      name: customer.name,
      phone: customer.phone,
      email: customer.email,
      address: customer.address,
      created_at: customer.created_at,
    });

    for (const order of customer.orders) {
      const items = order.lineItems.map((li) => {
        const prod =
          INITIAL_PRODUCTS[li.productIndex % INITIAL_PRODUCTS.length];
        return {
          product_id: prod.id,
          title: prod.title,
          quantity: li.quantity,
          price: Number(prod.price) || 0,
        };
      });

      const total = items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );
      const rewardPoints = items.reduce((sum, item) => {
        const prod = INITIAL_PRODUCTS.find((p) => p.id === item.product_id);
        return sum + (Number(prod?.points || 0) * item.quantity);
      }, 0);

      const normalizedStatus =
        order.status === "done" ? "confirmed" : order.status;

      orders.push({
        id: String(order.id),
        userId: customerId,
        user_id: customerId,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        address: customer.address,
        items,
        description: items
          .map((item) => `${item.quantity}x ${item.title}`)
          .join(", "),
        total,
        amount: total,
        rewardPoints,
        pointsAwarded: normalizedStatus === "confirmed",
        paymentMethod: "cod",
        status: normalizedStatus,
        created_at: order.created_at,
        updated_at: order.created_at,
      });
    }
  }

  return {
    categories: INITIAL_CATEGORIES.map((c) => ({ ...c })),
    products: INITIAL_PRODUCTS.map((p) => ({ ...p, images: [...p.images] })),
    users,
    orders,
    settings: {
      storeName: "Woodra",
      currency: "$",
    },
  };
}

let memoryStore = null;

function loadStore() {
  if (memoryStore) return memoryStore;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (
        parsed &&
        Array.isArray(parsed.categories) &&
        Array.isArray(parsed.products) &&
        Array.isArray(parsed.users) &&
        Array.isArray(parsed.orders)
      ) {
        memoryStore = parsed;
        return memoryStore;
      }
    }
  } catch {
    // ignore storage errors
  }

  memoryStore = buildInitialSeed();
  saveStore(memoryStore);
  return memoryStore;
}

function saveStore(nextStore) {
  memoryStore = nextStore;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextStore));
  } catch {
    // ignore storage errors
  }
}

export function getMockStore() {
  return loadStore();
}

export function updateMockStore(updater) {
  const current = loadStore();
  const next = updater(current);
  saveStore(next);
  return next;
}
