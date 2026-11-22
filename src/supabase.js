import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

const STORAGE_KEY = "woodra_dashboard_mock_db_v2";

function buildSeedData() {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  const makeDateInMonth = (monthOffset, day, hour = 10) => {
    const d = new Date(currentYear, currentMonth + monthOffset, day, hour, 30, 0);
    return d.toISOString();
  };

  return {
    categories: [
      {
        id: 1,
        name_en: "Wooden Chairs",
        name_ar: "كراسي خشبية",
        created_at: makeDateInMonth(-2, 5),
      },
      {
        id: 2,
        name_en: "Dining Tables",
        name_ar: "طاولات طعام",
        created_at: makeDateInMonth(-2, 8),
      },
      {
        id: 3,
        name_en: "Office Desks",
        name_ar: "مكاتب عمل",
        created_at: makeDateInMonth(-2, 12),
      },
      {
        id: 4,
        name_en: "Storage Cabinets",
        name_ar: "خزائن تخزين",
        created_at: makeDateInMonth(-2, 15),
      },
    ],
    products: [
      {
        id: 1,
        title: "Oak Dining Chair",
        title_ar: "كرسي طعام من خشب البلوط",
        description: "Handcrafted solid oak chair with ergonomic backrest.",
        description_ar: "كرسي مصنوع يدوياً من خشب البلوط الصلب مع مسند ظهر مريح.",
        price: 185,
        stock: 24,
        points: 18,
        active: true,
        category_id: 1,
        images: [
          "https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg?auto=compress&cs=tinysrgb&w=500",
        ],
        created_at: makeDateInMonth(-1, 10),
        updated_at: makeDateInMonth(0, 2),
      },
      {
        id: 2,
        title: "Walnut Family Dining Table",
        title_ar: "طاولة طعام عائلية من خشب الجوز",
        description: "Six-seater natural walnut dining table with matte finish.",
        description_ar: "طاولة طعام طبيعية من خشب الجوز تتسع لستة أشخاص بتشطيب غير لامع.",
        price: 740,
        stock: 9,
        points: 74,
        active: true,
        category_id: 2,
        images: [
          "https://images.pexels.com/photos/1080721/pexels-photo-1080721.jpeg?auto=compress&cs=tinysrgb&w=500",
        ],
        created_at: makeDateInMonth(-1, 14),
        updated_at: makeDateInMonth(0, 3),
      },
      {
        id: 3,
        title: "Minimalist Studio Desk",
        title_ar: "مكتب استوديو بسيط",
        description: "Spacious ash wood workstation desk with cable tray.",
        description_ar: "مكتب عمل واسع من خشب الدردار مع حامل لتنظيم الكابلات.",
        price: 420,
        stock: 15,
        points: 42,
        active: true,
        category_id: 3,
        images: [
          "https://images.pexels.com/photos/1957477/pexels-photo-1957477.jpeg?auto=compress&cs=tinysrgb&w=500",
        ],
        created_at: makeDateInMonth(0, 4),
        updated_at: makeDateInMonth(0, 4),
      },
    ],
    users: [],
    operations: [],
  };
}

function loadInitialTables() {
  const seed = buildSeedData();
  const tables = new Map();

  if (typeof window !== "undefined" && window.localStorage) {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        for (const [key, value] of Object.entries(parsed)) {
          if (Array.isArray(value)) {
            tables.set(key, value);
          }
        }
      }
    } catch {
      // ignore localStorage read failures
    }
  }

  for (const [key, value] of Object.entries(seed)) {
    if (!tables.has(key)) {
      tables.set(key, value);
    }
  }

  return tables;
}

function persistTables(tables) {
  if (typeof window !== "undefined" && window.localStorage) {
    try {
      const obj = {};
      for (const [key, value] of tables.entries()) {
        obj[key] = value;
      }
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(obj));
    } catch {
      // ignore localStorage write failures
    }
  }
}

function createMockSupabaseClient() {
  console.warn(
    "[AI Studio] Supabase env vars not configured — using persistent in-memory mock client"
  );

  const tables = loadInitialTables();
  const storageFiles = new Map();

  const getTable = (name) => {
    if (!tables.has(name)) {
      tables.set(name, []);
    }
    return tables.get(name);
  };

  const makeQuery = (executor) => {
    const state = {
      filters: [],
      orderBy: null,
      singleMode: null,
      selectAfterMutation: false,
    };

    const builder = {
      eq(column, value) {
        state.filters.push((row) => String(row[column]) === String(value));
        return builder;
      },
      order(column, { ascending = true } = {}) {
        state.orderBy = { column, ascending };
        return builder;
      },
      select() {
        state.selectAfterMutation = true;
        return builder;
      },
      single() {
        state.singleMode = "single";
        return builder;
      },
      maybeSingle() {
        state.singleMode = "maybeSingle";
        return builder;
      },
      then(resolve, reject) {
        return Promise.resolve()
          .then(() => executor(state))
          .then(resolve, reject);
      },
    };

    return builder;
  };

  return {
    from(tableName) {
      return {
        select() {
          return makeQuery((state) => {
            let rows = [...getTable(tableName)];
            for (const fn of state.filters) {
              rows = rows.filter(fn);
            }
            if (state.orderBy) {
              const { column, ascending } = state.orderBy;
              rows.sort((a, b) => {
                if (a[column] === b[column]) return 0;
                const cmp = a[column] > b[column] ? 1 : -1;
                return ascending ? cmp : -cmp;
              });
            }
            if (state.singleMode === "single") {
              if (rows.length === 0) {
                return { data: null, error: new Error("Record not found") };
              }
              return { data: rows[0], error: null };
            }
            if (state.singleMode === "maybeSingle") {
              return { data: rows[0] ?? null, error: null };
            }
            return { data: rows, error: null };
          });
        },
        insert(records) {
          return makeQuery((state) => {
            const table = getTable(tableName);
            const maxId = table.reduce(
              (max, row) => (typeof row.id === "number" && row.id > max ? row.id : max),
              0
            );
            const nowIso = new Date().toISOString();
            const inserted = (Array.isArray(records) ? records : [records]).map(
              (item, idx) => ({
                id: item.id ?? maxId + idx + 1,
                created_at: item.created_at ?? nowIso,
                updated_at: item.updated_at ?? nowIso,
                ...item,
              })
            );
            table.push(...inserted);
            persistTables(tables);

            if (state.singleMode) {
              return { data: inserted[0] ?? null, error: null };
            }
            return { data: inserted, error: null };
          });
        },
        update(updates) {
          return makeQuery((state) => {
            const table = getTable(tableName);
            const updated = [];
            const nowIso = new Date().toISOString();
            for (let i = 0; i < table.length; i++) {
              if (state.filters.every((fn) => fn(table[i]))) {
                table[i] = {
                  ...table[i],
                  ...updates,
                  updated_at: updates.updated_at ?? nowIso,
                };
                updated.push(table[i]);
              }
            }
            persistTables(tables);

            if (state.singleMode === "single" && updated.length === 0) {
              return { data: null, error: new Error("Record not found") };
            }
            if (state.singleMode) {
              return { data: updated[0] ?? null, error: null };
            }
            return { data: updated, error: null };
          });
        },
        delete() {
          return makeQuery((state) => {
            const table = getTable(tableName);
            const kept = table.filter(
              (row) => !state.filters.every((fn) => fn(row))
            );
            tables.set(tableName, kept);
            persistTables(tables);
            return { data: null, error: null };
          });
        },
      };
    },
    storage: {
      from(bucket) {
        return {
          async upload(fileName, file) {
            let url = `https://via.placeholder.com/300x300?text=${encodeURIComponent(fileName)}`;
            if (typeof FileReader !== "undefined" && file instanceof Blob) {
              url = await new Promise((resolve) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result);
                reader.onerror = () => resolve(URL.createObjectURL(file));
                reader.readAsDataURL(file);
              });
            }
            storageFiles.set(`${bucket}/${fileName}`, url);
            return { data: { path: fileName }, error: null };
          },
          getPublicUrl(fileName) {
            const publicUrl =
              storageFiles.get(`${bucket}/${fileName}`) ||
              `https://via.placeholder.com/300x300?text=${encodeURIComponent(fileName)}`;
            return { data: { publicUrl } };
          },
        };
      },
    },
  };
}

export const supabase =
  supabaseUrl && supabaseKey
    ? createClient(supabaseUrl, supabaseKey)
    : createMockSupabaseClient();
