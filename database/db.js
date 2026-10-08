const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');

const dbPath = path.join(__dirname, 'pizzahub.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Failed to connect to SQLite database:', err);
  } else {
    console.log('Connected to SQLite database at', dbPath);
  }
});

// Promise wrappers for database operations
db.runAsync = function (sql, params = []) {
  return new Promise((resolve, reject) => {
    this.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
};

db.getAsync = function (sql, params = []) {
  return new Promise((resolve, reject) => {
    this.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

db.allAsync = function (sql, params = []) {
  return new Promise((resolve, reject) => {
    this.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

async function initDb() {
  // Foreign keys enabled
  await db.runAsync('PRAGMA foreign_keys = ON;');

  // Users table
  await db.runAsync(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'admin',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Settings table
  await db.runAsync(`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Menu items table
  await db.runAsync(`
    CREATE TABLE IF NOT EXISTS menu_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      description TEXT,
      ingredients TEXT,
      category TEXT NOT NULL DEFAULT 'Classic',
      image_url TEXT,
      is_available INTEGER DEFAULT 1,
      is_bestseller INTEGER DEFAULT 0,
      is_popular INTEGER DEFAULT 0,
      is_featured INTEGER DEFAULT 0,
      badge TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Item prices table (size-based pricing)
  await db.runAsync(`
    CREATE TABLE IF NOT EXISTS item_prices (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      menu_item_id INTEGER NOT NULL,
      size_name TEXT NOT NULL,
      price REAL NOT NULL,
      is_available INTEGER DEFAULT 1,
      FOREIGN KEY (menu_item_id) REFERENCES menu_items (id) ON DELETE CASCADE,
      UNIQUE(menu_item_id, size_name)
    );
  `);

  // Orders table
  await db.runAsync(`
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id TEXT UNIQUE NOT NULL,
      customer_name TEXT NOT NULL,
      customer_phone TEXT NOT NULL,
      customer_whatsapp TEXT,
      customer_email TEXT,
      delivery_address TEXT NOT NULL,
      landmark TEXT,
      city TEXT DEFAULT 'Karachi',
      order_notes TEXT,
      payment_method TEXT NOT NULL DEFAULT 'Cash on Delivery',
      subtotal REAL NOT NULL,
      delivery_charges REAL NOT NULL DEFAULT 0,
      discount_amount REAL NOT NULL DEFAULT 0,
      coupon_code TEXT,
      total_amount REAL NOT NULL,
      status TEXT NOT NULL DEFAULT 'received',
      idempotency_key TEXT UNIQUE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Order items table
  await db.runAsync(`
    CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id TEXT NOT NULL,
      menu_item_id INTEGER,
      item_name TEXT NOT NULL,
      size_name TEXT NOT NULL,
      unit_price REAL NOT NULL,
      quantity INTEGER NOT NULL,
      subtotal REAL NOT NULL,
      FOREIGN KEY (order_id) REFERENCES orders (order_id) ON DELETE CASCADE
    );
  `);

  // Coupons table
  await db.runAsync(`
    CREATE TABLE IF NOT EXISTS coupons (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT UNIQUE NOT NULL,
      description TEXT,
      discount_type TEXT NOT NULL DEFAULT 'percentage', -- 'percentage' or 'fixed'
      discount_value REAL NOT NULL,
      min_order_amount REAL DEFAULT 0,
      max_discount REAL DEFAULT 999999,
      expiry_date TEXT,
      is_active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Reviews table
  await db.runAsync(`
    CREATE TABLE IF NOT EXISTS reviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customer_name TEXT NOT NULL,
      customer_avatar TEXT,
      rating INTEGER NOT NULL DEFAULT 5,
      comment TEXT NOT NULL,
      is_approved INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Seed default Admin user if not exists
  const existingAdmin = await db.getAsync('SELECT * FROM users WHERE username = ?', ['admin']);
  if (!existingAdmin) {
    const defaultPassword = process.env.ADMIN_PASSWORD || 'admin123';
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(defaultPassword, salt);
    await db.runAsync(
      'INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)',
      ['admin', hash, 'admin']
    );
    console.log('Seeded default admin user (admin / admin123)');
  }

  // Seed default settings if empty
  const defaultSettings = [
    ['restaurant_name', 'Pizza Hub'],
    ['tagline', 'Fresh Pizza, Fresh Moments.'],
    ['phone_number', '+92 300 1234567'],
    ['whatsapp_number', '923001234567'],
    ['email', 'orders@pizzahub.com'],
    ['address', 'Shop #14, Commercial Boulevard, Phase 5, DHA'],
    ['currency', 'Rs.'],
    ['delivery_charges', '150'],
    ['free_delivery_threshold', '2500'],
    ['is_24_hours_open', '1'],
    ['business_hours', 'Open 24/7 (All Day & Night Delivery)'],
    ['announcement_banner', '🔥 24/7 Delivery Available! Free Delivery on orders above Rs. 2500 with code PIZZAFIRST!']
  ];

  for (const [key, value] of defaultSettings) {
    const existing = await db.getAsync('SELECT * FROM settings WHERE key = ?', [key]);
    if (!existing) {
      await db.runAsync('INSERT INTO settings (key, value) VALUES (?, ?)', [key, value]);
    }
  }

  // Seed default coupons
  const existingCoupons = await db.allAsync('SELECT COUNT(*) as count FROM coupons');
  if (existingCoupons[0].count === 0) {
    await db.runAsync(`
      INSERT INTO coupons (code, description, discount_type, discount_value, min_order_amount, max_discount, expiry_date, is_active)
      VALUES 
      ('PIZZAFIRST', '20% off on your first delicious order', 'percentage', 20, 1000, 500, '2028-12-31', 1),
      ('HUB250', 'Flat Rs. 250 Off on orders above Rs. 1500', 'fixed', 250, 1500, 250, '2028-12-31', 1),
      ('PARTY500', 'Flat Rs. 500 Off on orders above Rs. 3000', 'fixed', 500, 3000, 500, '2028-12-31', 1),
      ('CHEESY15', '15% discount for true cheese enthusiasts', 'percentage', 15, 1200, 400, '2028-12-31', 1)
    `);
    console.log('Seeded default coupons');
  }

  // Seed default menu items and prices
  const existingMenu = await db.allAsync('SELECT COUNT(*) as count FROM menu_items');
  if (existingMenu[0].count === 0) {
    const sampleItems = [
      {
        name: 'Pepperoni Feast',
        slug: 'pepperoni-feast',
        description: 'Loaded with double layers of gourmet beef pepperoni, molten mozzarella cheese and our signature rich herb marinara sauce.',
        ingredients: 'Beef Pepperoni, Mozzarella, Herb Marinara Sauce, Oregano, Virgin Olive Oil',
        category: 'Best Sellers',
        image_url: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&w=800&q=80',
        is_bestseller: 1,
        is_popular: 1,
        is_featured: 1,
        badge: 'Best Seller',
        prices: {
          Small: 699,
          Medium: 1199,
          Large: 1799,
          'Extra Large': 2299
        }
      },
      {
        name: 'Chicken Tikka Royale',
        slug: 'chicken-tikka-royale',
        description: 'Tender tandoori chicken tikka chunks with crunchy onions, crisp green bell peppers, spicy jalapeños and creamy mozzarella.',
        ingredients: 'Tikka Spiced Chicken, Red Onions, Green Bell Peppers, Jalapeños, Mozzarella, Garlic Butter',
        category: 'Special Pizzas',
        image_url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80',
        is_bestseller: 1,
        is_popular: 1,
        is_featured: 1,
        badge: 'Chef Special',
        prices: {
          Small: 649,
          Medium: 1149,
          Large: 1699,
          'Extra Large': 2199
        }
      },
      {
        name: 'Four Cheese Volcano',
        slug: 'four-cheese-volcano',
        description: 'An ultimate cheese celebration featuring mozzarella, sharp aged cheddar, creamy gorgonzola and grated parmesan over garlic herb crust.',
        ingredients: 'Mozzarella, Aged Cheddar, Gorgonzola, Parmesan, Garlic Herb Butter, Tomato Sauce',
        category: 'Cheesy',
        image_url: 'https://images.unsplash.com/photo-1573821663912-569905455b1a?auto=format&fit=crop&w=800&q=80',
        is_bestseller: 0,
        is_popular: 1,
        is_featured: 1,
        badge: 'Super Cheesy',
        prices: {
          Small: 749,
          Medium: 1299,
          Large: 1899,
          'Extra Large': 2499
        }
      },
      {
        name: 'Fiery Peri-Peri Heat',
        slug: 'fiery-peri-peri-heat',
        description: 'Spicy marinated peri-peri chicken breast slices, fiery bird eye chillies, crisp capsicum and a swirl of house peri-peri drizzle.',
        ingredients: 'Peri-Peri Chicken, Bird Eye Chillies, Red & Green Capsicum, Mozzarella, Peri Mayo Swirl',
        category: 'Spicy',
        image_url: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=800&q=80',
        is_bestseller: 0,
        is_popular: 1,
        is_featured: 0,
        badge: 'Extra Spicy',
        prices: {
          Small: 649,
          Medium: 1199,
          Large: 1749,
          'Extra Large': 2249
        }
      },
      {
        name: 'BBQ Smoked Supreme',
        slug: 'bbq-smoked-supreme',
        description: 'Slow-smoked hickory BBQ glazed chicken, smoked beef rashers, sweet caramelized red onions and rich melted mozzarella.',
        ingredients: 'Smoked BBQ Chicken, Beef Rashers, Caramelized Red Onions, Hickory BBQ Sauce, Mozzarella',
        category: 'Special Pizzas',
        image_url: 'https://images.unsplash.com/photo-1590947132387-155cc02f3212?auto=format&fit=crop&w=800&q=80',
        is_bestseller: 1,
        is_popular: 1,
        is_featured: 1,
        badge: 'Top Rated',
        prices: {
          Small: 699,
          Medium: 1249,
          Large: 1799,
          'Extra Large': 2349
        }
      },
      {
        name: 'Margherita Classico',
        slug: 'margherita-classico',
        description: 'Traditional Italian masterpiece: slow-cooked San Marzano tomato marinara, fresh mozzarella, aromatic basil leaves and cold-pressed olive oil.',
        ingredients: 'San Marzano Tomatoes, Fresh Mozzarella, Sweet Basil, Extra Virgin Olive Oil, Sea Salt',
        category: 'Classic',
        image_url: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?auto=format&fit=crop&w=800&q=80',
        is_bestseller: 0,
        is_popular: 0,
        is_featured: 1,
        badge: 'Authentic',
        prices: {
          Small: 549,
          Medium: 949,
          Large: 1449,
          'Extra Large': 1899
        }
      },
      {
        name: 'Truffle Wild Mushroom Gourmet',
        slug: 'truffle-wild-mushroom',
        description: 'Hand-tossed artisan dough topped with sautéed wild forest mushrooms, aromatic white truffle oil, caramelized shallots and fontina cheese.',
        ingredients: 'Wild Forest Mushrooms, White Truffle Oil, Shallots, Fresh Thyme, Fontina & Mozzarella',
        category: 'Gourmet',
        image_url: 'https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?auto=format&fit=crop&w=800&q=80',
        is_bestseller: 0,
        is_popular: 1,
        is_featured: 0,
        badge: 'Gourmet',
        prices: {
          Small: 799,
          Medium: 1399,
          Large: 1999,
          'Extra Large': 2599
        }
      },
      {
        name: 'Farmhouse Veggie Delight',
        slug: 'farmhouse-veggie-delight',
        description: 'A colorful garden harvest: sweet golden corn, crunchy capsicum, baby mushrooms, sliced black olives and sun-ripened cherry tomatoes.',
        ingredients: 'Sweet Corn, Button Mushrooms, Black Olives, Capsicum, Cherry Tomatoes, Mozzarella',
        category: 'Veggie',
        image_url: 'https://images.unsplash.com/photo-1576458088443-04a19bb13da6?auto=format&fit=crop&w=800&q=80',
        is_bestseller: 0,
        is_popular: 0,
        is_featured: 0,
        badge: '100% Veggie',
        prices: {
          Small: 549,
          Medium: 999,
          Large: 1499,
          'Extra Large': 1949
        }
      },
      {
        name: 'Carnivore Meat Overload',
        slug: 'carnivore-meat-overload',
        description: 'For the ultimate meat connoisseur: pepperoni, spicy beef sausage, tender chicken chunks, smoked bacon and thick layer of mozzarella.',
        ingredients: 'Beef Pepperoni, Italian Sausage, Chicken Breast Chunks, Smoked Beef Bacon, Mozzarella',
        category: 'Best Sellers',
        image_url: 'https://images.unsplash.com/photo-1544982503-9f984c14501a?auto=format&fit=crop&w=800&q=80',
        is_bestseller: 1,
        is_popular: 1,
        is_featured: 1,
        badge: 'Meat Lovers',
        prices: {
          Small: 799,
          Medium: 1399,
          Large: 1999,
          'Extra Large': 2599
        }
      },
      {
        name: 'Garlic Parmesan Breadsticks',
        slug: 'garlic-parmesan-breadsticks',
        description: 'Freshly baked artisan breadsticks slathered in warm garlic herb butter, dusted with aged parmesan and served with marinara dip.',
        ingredients: 'Artisan Dough, Garlic Herb Butter, Parmigiano Reggiano, Italian Herbs, Marinara Dip',
        category: 'Sides & Appetizers',
        image_url: 'https://images.unsplash.com/photo-1541745537411-b8046dc6d66c?auto=format&fit=crop&w=800&q=80',
        is_bestseller: 1,
        is_popular: 1,
        is_featured: 0,
        badge: 'Hot Side',
        prices: {
          Small: 399,
          Medium: 599,
          Large: 899,
          'Extra Large': 1199
        }
      },
      {
        name: 'Belgian Chocolate Lava Melt',
        slug: 'belgian-chocolate-lava-melt',
        description: 'Decadent warm Belgian chocolate sponge cake with an irresistible flowing molten chocolate center, dusted with snowy sugar.',
        ingredients: 'Belgian Dark Chocolate, Fresh Butter, Organic Cocoa, Vanilla Bean, Icing Sugar',
        category: 'Desserts',
        image_url: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=800&q=80',
        is_bestseller: 1,
        is_popular: 1,
        is_featured: 1,
        badge: 'Sweet Tooth',
        prices: {
          Small: 449,
          Medium: 799,
          Large: 1199,
          'Extra Large': 1599
        }
      }
    ];

    for (const item of sampleItems) {
      const res = await db.runAsync(
        `INSERT INTO menu_items (name, slug, description, ingredients, category, image_url, is_available, is_bestseller, is_popular, is_featured, badge)
         VALUES (?, ?, ?, ?, ?, ?, 1, ?, ?, ?, ?)`,
        [
          item.name,
          item.slug,
          item.description,
          item.ingredients,
          item.category,
          item.image_url,
          item.is_bestseller,
          item.is_popular,
          item.is_featured,
          item.badge
        ]
      );
      const menuItemId = res.lastID;

      for (const [sizeName, price] of Object.entries(item.prices)) {
        await db.runAsync(
          `INSERT INTO item_prices (menu_item_id, size_name, price, is_available)
           VALUES (?, ?, ?, 1)`,
          [menuItemId, sizeName, price]
        );
      }
    }
    console.log('Seeded complete Pizza Hub menu with size-based pricing.');
  }

  // Seed default customer reviews
  const existingReviews = await db.allAsync('SELECT COUNT(*) as count FROM reviews');
  if (existingReviews[0].count === 0) {
    await db.runAsync(`
      INSERT INTO reviews (customer_name, customer_avatar, rating, comment, is_approved)
      VALUES 
      ('Hamza Tariq', 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80', 5, 'Best pizza in town by far! Ordered at 2:30 AM and got it piping hot in 28 minutes. The Pepperoni Feast is absolutely loaded!', 1),
      ('Ayesha Malik', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80', 5, 'The crust quality is international level. Cheesy Fajita and Four Cheese Volcano are unmatched. Love the live tracking feature!', 1),
      ('Bilal Ahmed', 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=150&q=80', 5, 'Finally a real 24/7 delivery pizza joint that does not compromise on quality. Breadsticks and dipping sauce are super addictive.', 1),
      ('Sara Khan', 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=150&q=80', 5, 'The ordering process was so smooth on my phone, and WhatsApp confirmation reached me immediately. 10/10 service!', 1)
    `);
    console.log('Seeded customer reviews');
  }
}

initDb().catch((err) => {
  console.error('Error during database initialization:', err);
});

module.exports = db;
