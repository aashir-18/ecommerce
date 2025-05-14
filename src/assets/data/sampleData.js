// Sample data for e-commerce admin dashboard
const generateRandomDate = (start, end) => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime())).toISOString();
};

// Generate dates for the last 12 months
const generateDatesForLastYear = () => {
  const dates = [];
  const today = new Date();
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(today.getFullYear() - 1);
  
  for (let i = 0; i < 365; i++) {
    const date = new Date(oneYearAgo);
    date.setDate(oneYearAgo.getDate() + i);
    dates.push(date.toISOString().split('T')[0]);
  }
  
  return dates;
};

const dates = generateDatesForLastYear();

// Product categories
const categories = ['Electronics', 'Clothing', 'Home & Kitchen', 'Books', 'Toys'];
const platforms = ['Amazon', 'Walmart'];

// Generate products
const products = [];
for (let i = 1; i <= 50; i++) {
  const category = categories[Math.floor(Math.random() * categories.length)];
  const platform = platforms[Math.floor(Math.random() * platforms.length)];
  const stock = Math.floor(Math.random() * 100);
  const lowStockThreshold = Math.floor(Math.random() * 20) + 5;
  
  products.push({
    id: `PROD-${i}`,
    name: `${category} Product ${i}`,
    description: `This is a sample ${category.toLowerCase()} product sold on ${platform}`,
    price: parseFloat((Math.random() * 100 + 10).toFixed(2)),
    stock: stock,
    lowStockThreshold: lowStockThreshold,
    category: category,
    platform: platform,
    image: `https://picsum.photos/id/${i + 10}/200/200`,
    createdAt: generateRandomDate(new Date(2024, 0, 1), new Date())
  });
}

// Generate orders
const orders = [];
for (let i = 1; i <= 200; i++) {
  const orderDate = generateRandomDate(new Date(2024, 0, 1), new Date());
  const numItems = Math.floor(Math.random() * 5) + 1;
  const items = [];
  let total = 0;
  
  for (let j = 0; j < numItems; j++) {
    const product = products[Math.floor(Math.random() * products.length)];
    const quantity = Math.floor(Math.random() * 3) + 1;
    const itemTotal = product.price * quantity;
    total += itemTotal;
    
    items.push({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: quantity,
      total: itemTotal
    });
  }
  
  orders.push({
    id: `ORD-${i}`,
    customer: `Customer ${i}`,
    date: orderDate,
    items: items,
    total: parseFloat(total.toFixed(2)),
    status: Math.random() > 0.1 ? 'Completed' : 'Pending'
  });
}

// Generate sales data for charts
const salesData = [];
dates.forEach(date => {
  const dailyOrders = Math.floor(Math.random() * 10) + 1;
  let dailyRevenue = 0;
  const categorySales = {};
  
  categories.forEach(category => {
    categorySales[category] = Math.floor(Math.random() * 1000) + 100;
    dailyRevenue += categorySales[category];
  });
  
  salesData.push({
    date: date,
    orders: dailyOrders,
    revenue: dailyRevenue,
    categorySales: categorySales
  });
});

export default {
  products,
  orders,
  salesData,
  categories,
  platforms
};
