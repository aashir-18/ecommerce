import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import sampleData from '../assets/data/sampleData';

export const useStoreData = defineStore('storeData', () => {
  const products = ref(sampleData.products);
  const orders = ref(sampleData.orders);
  const salesData = ref(sampleData.salesData);
  const inventoryAlerts = ref([]);

  // Computed properties
  const totalRevenue = computed(() => {
    return orders.value.reduce((total, order) => total + order.total, 0);
  });

  const totalOrders = computed(() => {
    return orders.value.length;
  });

  const lowInventoryProducts = computed(() => {
    return products.value.filter(product => product.stock < product.lowStockThreshold);
  });

  // Actions
  function addProduct(product) {
    products.value.push({
      ...product,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    });
  }

  function updateInventory(productId, newStock) {
    const product = products.value.find(p => p.id === productId);
    if (product) {
      product.stock = newStock;
      
      // Check if we need to add a low inventory alert
      if (newStock < product.lowStockThreshold && !inventoryAlerts.value.some(alert => alert.productId === productId)) {
        inventoryAlerts.value.push({
          id: Date.now().toString(),
          productId: productId,
          message: `Low inventory for ${product.name}. Current stock: ${newStock}`,
          createdAt: new Date().toISOString(),
        });
      }
    }
  }

  function getRevenueByCategory() {
    const categoryRevenue = {};
    
    orders.value.forEach(order => {
      order.items.forEach(item => {
        const product = products.value.find(p => p.id === item.productId);
        if (product) {
          if (!categoryRevenue[product.category]) {
            categoryRevenue[product.category] = 0;
          }
          categoryRevenue[product.category] += item.price * item.quantity;
        }
      });
    });
    
    return categoryRevenue;
  }

  function getRevenueByTimeRange(timeRange) {
    // Filter sales data by time range (daily, weekly, monthly, annually)
    const now = new Date();
    let filteredData;
    
    switch(timeRange) {
      case 'daily':
        filteredData = salesData.value.filter(sale => {
          const saleDate = new Date(sale.date);
          return saleDate.getDate() === now.getDate() && 
                 saleDate.getMonth() === now.getMonth() && 
                 saleDate.getFullYear() === now.getFullYear();
        });
        break;
      case 'weekly':
        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        filteredData = salesData.value.filter(sale => {
          const saleDate = new Date(sale.date);
          return saleDate >= oneWeekAgo;
        });
        break;
      case 'monthly':
        filteredData = salesData.value.filter(sale => {
          const saleDate = new Date(sale.date);
          return saleDate.getMonth() === now.getMonth() && 
                 saleDate.getFullYear() === now.getFullYear();
        });
        break;
      case 'annually':
        filteredData = salesData.value.filter(sale => {
          const saleDate = new Date(sale.date);
          return saleDate.getFullYear() === now.getFullYear();
        });
        break;
      default:
        filteredData = salesData.value;
    }
    
    return filteredData;
  }

  return {
    products,
    orders,
    salesData,
    inventoryAlerts,
    totalRevenue,
    totalOrders,
    lowInventoryProducts,
    addProduct,
    updateInventory,
    getRevenueByCategory,
    getRevenueByTimeRange
  };
});
