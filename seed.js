const mongoose = require('mongoose');
const Product = require('./models/Product').default;
require('dotenv').config({ path: './.env.local' });

// --- LIST PRODUK ---
const productsToSeed = [
  {
    name: "Es Kopi Susu",
    price: 22000,
    description: "Perpaduan kopi, susu, dan gula aren.",
    category: "Drinks",
    imageUrl: "https://asset.kompas.com/crops/YTyDJj22I_fOz251EjqXIBndOrU=/0x0:1000x667/1200x800/data/photo/2023/10/18/652f4427264de.jpg"
  },
  {
    name: "Croissant Cokelat",
    price: 25000,
    description: "Pastry renyah dengan isian cokelat lumer.",
    category: "Snacks",
    imageUrl: "https://image.idntimes.com/post/20250721/vecteezy_fresh-croissant-with-chocolate-on-plate_2829324_9f0e01a3-8488-490b-8090-c75e8bfc41df.jpg"
  },
  {
    name: "Paket Brunch 1",
    price: 40000,
    description: "1 Es Kopi Susu + 1 Croissant Cokelat.",
    category: "Bundles",
    imageUrl: "https://media01.stockfood.com/largepreviews/NDIxODAwNjk0/13606474-French-croissant-and-coffee.jpg"
  },
  {
    name: "Matcha Latte",
    price: 28000,
    description: "Bubuk teh hijau Jepang premium dengan susu segar.",
    category: "Drinks",
    imageUrl: "https://cdn.loveandlemons.com/wp-content/uploads/2023/06/iced-matcha-latte.jpg"
  },
  {
    name: "Donut",
    price: 11000,
    description: "Donat dengan berbagai topping manis.",
    category: "Snacks",
    imageUrl: "https://wuollet.com/cdn/shop/files/62d88878e755e8848e69cbb8_5edc3fece5cf1e090554e22e_sprinkled_2520yeast_2520donut_4bb0f82a-271e-4f8d-959a-86d795cc4581.jpg?v=1747846458"
  },
  {
    name: "Iced Americano",
    price: 20000,
    description: "Kopi hitam dingin, dengan rasa pahit yang kuat.",
    category: "Drinks",
    imageUrl: "https://emilylaurae.com/wp-content/uploads/2022/09/iced-americano-6.jpg" 
  },
  {
    name: "Caramel Macchiato",
    price: 30000,
    description: "Espresso dengan susu panas dan sirup karamel.",
    category: "Drinks",
    imageUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS_agCT5BnXcwx5mOXvV9RXaRIL5-m3TdQf-w&s" 
  },
  {
    name: "Taro Milk Tea",
    price: 25000,
    description: "Teh susu dengan rasa taro yang lembut.",
    category: "Drinks",
    imageUrl: "https://i.pinimg.com/736x/93/ae/2f/93ae2f187d2669042324e36564072935.jpg" 
  },
  {
    name: "Cheese Stick",
    price: 13000,
    description: "Stick keju crispy, gurih, dan lezat.",
    category: "Snacks",
    imageUrl: "https://images.arla.com/recordid/164CE127-1A5B-444F-B44516BDA2D47FBF/crispy-cheese-sticks.jpeg" 
  },
  {
    name: "Banana Bread",
    price: 18000,
    description: "Roti pisang lembut dengan potongan pisang segar.",
    category: "Snacks",
    imageUrl: "https://i0.wp.com/www.growingupcali.com/wp-content/uploads/2021/01/Healthy-Banana-Slice-2.jpg?fit=800%2C1000&ssl=1" 
  },
  {
    name: "Muffin Blueberry",
    price: 21000,
    description: "Muffin lembut dengan isian blueberry segar.",
    category: "Snacks",
    imageUrl: "https://sallysbakingaddiction.com/wp-content/uploads/2019/05/blueberry-muffin.jpg" 
  },
  {
    name: "Paket Brunch 2",
    price: 45000,
    description: "1 Matcha Latte + 1 Donut.",
    category: "Bundles",
    imageUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRjBKVckHhbPp5ICWDVu7YejD7UV1XKbA32qw&s" 
  },
  {
    name: "Paket Camilan",
    price: 32000,
    description: "1 Cheese Stick + 1 Banana Bread.",
    category: "Bundles",
    imageUrl: "https://www.sixsistersstuff.com/wp-content/uploads/2024/07/Cream-Cheese-Banana-Bread-5-1.jpg" 
  },
  {
    name: "Paket Teh & Cake",
    price: 44000,
    description: "1 Taro Milk Tea + 1 Muffin Blueberry.",
    category: "Bundles",
    imageUrl: "https://boboteashop.com/cdn/shop/articles/taro_milk_boba_tea_on_the_table_e06062c6-1306-4277-813e-343af2c3e748.jpg?v=1749973517&width=1920" 
  },
  {
    name: "Paket Bahagia",
    price: 52000,
    description: "1 Sliced Cake + 1 Coffee.",
    category: "Bundles",
    imageUrl: "https://cdn.shopify.com/s/files/1/0271/1558/5622/files/SFB_LFS_CoffeePairings-blog_1024x1024.jpg?v=1706571555" 
  }
];

const seedDB = async () => {
  try {
    // 1
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Berhasil terhubung ke MongoDB...');

    // 2
    await Product.deleteMany({});
    console.log('🧹 Collection Product berhasil dikosongkan...');

    // 3
    await Product.insertMany(productsToSeed);
    console.log('🌱 Berhasil memasukkan data produk baru...');

    // 4
  } catch (err) {
    console.error('❌ Gagal melakukan seeding:', err);
  } finally {
    mongoose.connection.close();
    console.log('🔌 Koneksi ke MongoDB diputus.');
  }
};

seedDB();