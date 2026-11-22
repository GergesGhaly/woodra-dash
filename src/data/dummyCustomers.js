function makeRelativeDate({ monthsAgo = 0, daysAgo = 0, dayOfMonth = null, hour = 11 }) {
  const now = new Date();
  if (dayOfMonth !== null) {
    const safeDay = Math.min(dayOfMonth, 28);
    return new Date(
      now.getFullYear(),
      now.getMonth() - monthsAgo,
      safeDay,
      hour,
      20,
      0
    ).toISOString();
  }
  const d = new Date(
    now.getFullYear(),
    now.getMonth() - monthsAgo,
    now.getDate() - daysAgo,
    hour,
    15,
    0
  );
  return d.toISOString();
}

export const DUMMY_CUSTOMERS_TEMPLATE = [
  {
    id: 1,
    name: "Ahmed Mahmoud",
    phone: "+20 100 245 8812",
    email: "ahmed.mahmoud@example.com",
    address: "15 El-Tahrir St, Dokki, Giza, Egypt",
    created_at: makeRelativeDate({ monthsAgo: 5, dayOfMonth: 4 }),
    is_dummy: true,
    orders: [
      {
        id: 1001,
        created_at: makeRelativeDate({ monthsAgo: 0, dayOfMonth: 3, hour: 10 }),
        status: "done",
        lineItems: [{ productIndex: 0, quantity: 2 }],
      },
      {
        id: 1002,
        created_at: makeRelativeDate({ monthsAgo: 1, dayOfMonth: 11, hour: 14 }),
        status: "done",
        lineItems: [{ productIndex: 1, quantity: 1 }],
      },
      {
        id: 1003,
        created_at: makeRelativeDate({ monthsAgo: 2, dayOfMonth: 19, hour: 16 }),
        status: "cancelled",
        lineItems: [{ productIndex: 2, quantity: 1 }],
      },
    ],
  },
  {
    id: 2,
    name: "سارة عبدالله المنصور",
    phone: "+966 50 412 7790",
    email: "sara.mansour@example.com",
    address: "حي العليا، شارع الملك فهد، الرياض، المملكة العربية السعودية",
    created_at: makeRelativeDate({ monthsAgo: 4, dayOfMonth: 12 }),
    is_dummy: true,
    orders: [
      {
        id: 1004,
        created_at: makeRelativeDate({ monthsAgo: 0, dayOfMonth: 6, hour: 12 }),
        status: "done",
        lineItems: [
          { productIndex: 1, quantity: 1 },
          { productIndex: 0, quantity: 2 },
        ],
      },
      {
        id: 1005,
        created_at: makeRelativeDate({ monthsAgo: 0, dayOfMonth: 14, hour: 15 }),
        status: "pending",
        lineItems: [{ productIndex: 2, quantity: 1 }],
      },
      {
        id: 1006,
        created_at: makeRelativeDate({ monthsAgo: 1, dayOfMonth: 8, hour: 11 }),
        status: "done",
        lineItems: [{ productIndex: 0, quantity: 4 }],
      },
    ],
  },
  {
    id: 3,
    name: "Omar Khaled Hassan",
    phone: "+971 55 831 2044",
    email: "omar.khaled@example.com",
    address: "Villa 18, Al Wasl Road, Jumeirah, Dubai, UAE",
    created_at: makeRelativeDate({ monthsAgo: 4, dayOfMonth: 21 }),
    is_dummy: true,
    orders: [
      {
        id: 1007,
        created_at: makeRelativeDate({ monthsAgo: 0, dayOfMonth: 8, hour: 13 }),
        status: "pending",
        lineItems: [{ productIndex: 2, quantity: 2 }],
      },
      {
        id: 1008,
        created_at: makeRelativeDate({ monthsAgo: 1, dayOfMonth: 17, hour: 10 }),
        status: "done",
        lineItems: [{ productIndex: 2, quantity: 1 }],
      },
    ],
  },
  {
    id: 4,
    name: "ليلى يوسف إبراهيم",
    phone: "+20 122 674 3901",
    email: "laila.youssef@example.com",
    address: "٤٢ شارع قناة السويس، المنصورة، مصر",
    created_at: makeRelativeDate({ monthsAgo: 3, dayOfMonth: 9 }),
    is_dummy: true,
    orders: [
      {
        id: 1009,
        created_at: makeRelativeDate({ monthsAgo: 0, dayOfMonth: 10, hour: 17 }),
        status: "cancelled",
        lineItems: [{ productIndex: 1, quantity: 1 }],
      },
      {
        id: 1010,
        created_at: makeRelativeDate({ monthsAgo: 1, dayOfMonth: 22, hour: 12 }),
        status: "done",
        lineItems: [{ productIndex: 0, quantity: 3 }],
      },
      {
        id: 1011,
        created_at: makeRelativeDate({ monthsAgo: 2, dayOfMonth: 15, hour: 14 }),
        status: "done",
        lineItems: [{ productIndex: 2, quantity: 1 }],
      },
    ],
  },
  {
    id: 5,
    name: "Karim Adel Fathy",
    phone: "+20 111 908 4415",
    email: "karim.adel@example.com",
    address: "28 El-Horreya Ave, Smouha, Alexandria, Egypt",
    created_at: makeRelativeDate({ monthsAgo: 3, dayOfMonth: 24 }),
    is_dummy: true,
    orders: [
      {
        id: 1012,
        created_at: makeRelativeDate({ monthsAgo: 0, dayOfMonth: 11, hour: 11 }),
        status: "done",
        lineItems: [{ productIndex: 0, quantity: 2 }],
      },
      {
        id: 1013,
        created_at: makeRelativeDate({ monthsAgo: 1, dayOfMonth: 4, hour: 16 }),
        status: "done",
        lineItems: [{ productIndex: 1, quantity: 1 }],
      },
      {
        id: 1014,
        created_at: makeRelativeDate({ monthsAgo: 1, dayOfMonth: 25, hour: 13 }),
        status: "cancelled",
        lineItems: [{ productIndex: 0, quantity: 1 }],
      },
      {
        id: 1015,
        created_at: makeRelativeDate({ monthsAgo: 2, dayOfMonth: 6, hour: 10 }),
        status: "done",
        lineItems: [{ productIndex: 2, quantity: 1 }],
      },
    ],
  },
  {
    id: 6,
    name: "نور الهدى طارق",
    phone: "+962 79 514 6623",
    email: "nour.tarek@example.com",
    address: "شارع المدينة المنورة، عمان، الأردن",
    created_at: makeRelativeDate({ monthsAgo: 2, dayOfMonth: 18 }),
    is_dummy: true,
    orders: [
      {
        id: 1016,
        created_at: makeRelativeDate({ monthsAgo: 0, dayOfMonth: 13, hour: 15 }),
        status: "pending",
        lineItems: [
          { productIndex: 0, quantity: 3 },
          { productIndex: 2, quantity: 1 },
        ],
      },
      {
        id: 1017,
        created_at: makeRelativeDate({ monthsAgo: 1, dayOfMonth: 19, hour: 11 }),
        status: "done",
        lineItems: [{ productIndex: 0, quantity: 2 }],
      },
    ],
  },
  {
    id: 7,
    name: "Daniel Carter",
    phone: "+44 7700 900412",
    email: "daniel.carter@example.com",
    address: "74 Baker Street, Marylebone, London, UK",
    created_at: makeRelativeDate({ monthsAgo: 2, dayOfMonth: 27 }),
    is_dummy: true,
    orders: [
      {
        id: 1018,
        created_at: makeRelativeDate({ monthsAgo: 0, dayOfMonth: 5, hour: 9 }),
        status: "done",
        lineItems: [{ productIndex: 2, quantity: 1 }],
      },
      {
        id: 1019,
        created_at: makeRelativeDate({ monthsAgo: 0, dayOfMonth: 16, hour: 14 }),
        status: "pending",
        lineItems: [{ productIndex: 1, quantity: 1 }],
      },
      {
        id: 1020,
        created_at: makeRelativeDate({ monthsAgo: 1, dayOfMonth: 14, hour: 18 }),
        status: "done",
        lineItems: [{ productIndex: 0, quantity: 4 }],
      },
    ],
  },
  {
    id: 8,
    name: "منى إبراهيم السعيد",
    phone: "+965 9912 3480",
    email: "mona.elsaeed@example.com",
    address: "منطقة السالمية، قطعة ٤، شارع سالم المبارك، الكويت",
    created_at: makeRelativeDate({ monthsAgo: 1, dayOfMonth: 10 }),
    is_dummy: true,
    orders: [
      {
        id: 1021,
        created_at: makeRelativeDate({ monthsAgo: 0, dayOfMonth: 7, hour: 12 }),
        status: "done",
        lineItems: [{ productIndex: 1, quantity: 1 }],
      },
      {
        id: 1022,
        created_at: makeRelativeDate({ monthsAgo: 1, dayOfMonth: 15, hour: 10 }),
        status: "cancelled",
        lineItems: [{ productIndex: 2, quantity: 1 }],
      },
      {
        id: 1023,
        created_at: makeRelativeDate({ monthsAgo: 1, dayOfMonth: 20, hour: 16 }),
        status: "done",
        lineItems: [{ productIndex: 0, quantity: 2 }],
      },
    ],
  },
  {
    id: 9,
    name: "Youssef Samir Nabil",
    phone: "+20 109 332 7150",
    email: "youssef.nabil@example.com",
    address: "90th Street, Fifth Settlement, New Cairo, Egypt",
    created_at: makeRelativeDate({ monthsAgo: 0, dayOfMonth: 2 }),
    is_dummy: true,
    orders: [
      {
        id: 1024,
        created_at: makeRelativeDate({ monthsAgo: 0, dayOfMonth: 4, hour: 13 }),
        status: "done",
        lineItems: [
          { productIndex: 2, quantity: 1 },
          { productIndex: 0, quantity: 1 },
        ],
      },
      {
        id: 1025,
        created_at: makeRelativeDate({ monthsAgo: 0, dayOfMonth: 15, hour: 11 }),
        status: "pending",
        lineItems: [{ productIndex: 0, quantity: 2 }],
      },
    ],
  },
  {
    id: 10,
    name: "فاطمة الزهراء علي",
    phone: "+971 52 740 1985",
    email: "fatima.ali@example.com",
    address: "شارع الكورنيش، الخالدية، أبوظبي، الإمارات",
    created_at: makeRelativeDate({ monthsAgo: 0, dayOfMonth: 5 }),
    is_dummy: true,
    orders: [
      {
        id: 1026,
        created_at: makeRelativeDate({ monthsAgo: 0, dayOfMonth: 9, hour: 14 }),
        status: "done",
        lineItems: [{ productIndex: 0, quantity: 4 }],
      },
      {
        id: 1027,
        created_at: makeRelativeDate({ monthsAgo: 0, dayOfMonth: 12, hour: 16 }),
        status: "cancelled",
        lineItems: [{ productIndex: 1, quantity: 1 }],
      },
      {
        id: 1028,
        created_at: makeRelativeDate({ monthsAgo: 0, dayOfMonth: 17, hour: 10 }),
        status: "pending",
        lineItems: [{ productIndex: 2, quantity: 1 }],
      },
    ],
  },
];

export function buildDummySeedRecords(existingProducts = []) {
  const fallbackProducts = [
    { id: 1, title: "Oak Dining Chair", price: 185 },
    { id: 2, title: "Walnut Family Dining Table", price: 740 },
    { id: 3, title: "Minimalist Studio Desk", price: 420 },
  ];

  const sourceProducts =
    existingProducts.length > 0 ? existingProducts : fallbackProducts;

  const users = [];
  const operations = [];

  for (const customer of DUMMY_CUSTOMERS_TEMPLATE) {
    users.push({
      id: customer.id,
      name: customer.name,
      phone: customer.phone,
      email: customer.email,
      address: customer.address,
      created_at: customer.created_at,
      is_dummy: true,
    });

    for (const order of customer.orders) {
      const items = order.lineItems.map((li) => {
        const prod =
          sourceProducts[li.productIndex % sourceProducts.length];
        return {
          product_id: prod.id,
          title: prod.title || prod.name || `Product #${prod.id}`,
          quantity: li.quantity,
          price: Number(prod.price) || 0,
        };
      });

      const amount = items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );

      const description = items
        .map((item) => `${item.quantity}x ${item.title}`)
        .join(", ");

      operations.push({
        id: order.id,
        user_id: customer.id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        items,
        description,
        amount,
        status: order.status,
        created_at: order.created_at,
        updated_at: order.created_at,
        is_dummy: true,
      });
    }
  }

  return { users, operations };
}
