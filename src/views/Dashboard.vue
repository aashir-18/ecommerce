<script setup>
import { ref, computed, onMounted } from 'vue';
import { useStoreData } from '../store';

const store = useStoreData();

// Computed properties
const totalRevenue = computed(() => store.totalRevenue);
const totalOrders = computed(() => store.totalOrders);
const lowInventoryProducts = computed(() => store.lowInventoryProducts);

// Chart data
const revenueChartData = ref(null);
const inventoryChartData = ref(null);
const categoryChartData = ref(null);

// Chart options
const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom'
    }
  }
};

onMounted(() => {
  // Revenue chart data (last 7 days)
  const weeklyData = store.getRevenueByTimeRange('weekly');
  const dates = weeklyData.map(item => item.date).slice(-7);
  const revenues = weeklyData.map(item => item.revenue).slice(-7);
  const orders = weeklyData.map(item => item.orders).slice(-7);
  
  revenueChartData.value = {
    labels: dates,
    datasets: [
      {
        label: 'Revenue ($)',
        backgroundColor: 'rgba(64, 158, 255, 0.2)',
        borderColor: '#409eff',
        data: revenues,
      },
      {
        label: 'Orders',
        backgroundColor: 'rgba(103, 194, 58, 0.2)',
        borderColor: '#67c23a',
        data: orders,
      }
    ]
  };
  
  // Category revenue chart
  const categoryRevenue = store.getRevenueByCategory();
  const categories = Object.keys(categoryRevenue);
  const categoryValues = Object.values(categoryRevenue);
  
  categoryChartData.value = {
    labels: categories,
    datasets: [
      {
        data: categoryValues,
        backgroundColor: [
          '#409eff', '#67c23a', '#e6a23c', '#f56c6c', '#909399'
        ],
        hoverBackgroundColor: [
          '#66b1ff', '#85ce61', '#ebb563', '#f78989', '#a6a9ad'
        ]
      }
    ]
  };
  
  // Inventory chart
  const productCategories = [...new Set(store.products.map(p => p.category))];
  const inventoryByCategory = productCategories.map(category => {
    return {
      category,
      stock: store.products
        .filter(p => p.category === category)
        .reduce((sum, product) => sum + product.stock, 0)
    };
  });
  
  inventoryChartData.value = {
    labels: inventoryByCategory.map(item => item.category),
    datasets: [
      {
        label: 'Stock Level',
        backgroundColor: 'rgba(230, 162, 60, 0.2)',
        borderColor: '#e6a23c',
        data: inventoryByCategory.map(item => item.stock),
      }
    ]
  };
});
</script>

<template>
  <div>
    <h1 class="page-title">Dashboard</h1>
    
    <!-- Summary Cards -->
    <div class="grid summary-grid">
      <div class="card summary-card">
        <h3 class="summary-title">Total Revenue</h3>
        <p class="summary-value">${{ totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}</p>
      </div>
      
      <div class="card summary-card">
        <h3 class="summary-title">Total Orders</h3>
        <p class="summary-value">{{ totalOrders }}</p>
      </div>
      
      <div class="card summary-card">
        <h3 class="summary-title">Low Stock Alerts</h3>
        <p class="summary-value">{{ lowInventoryProducts.length }}</p>
      </div>
    </div>
    
    <!-- Revenue Chart -->
    <div class="card">
      <h2 class="card-title">Revenue & Orders (Last 7 Days)</h2>
      <div class="chart-container">
        <Chart v-if="revenueChartData" type="line" :data="revenueChartData" :options="chartOptions" />
        <ProgressSpinner v-else />
      </div>
    </div>
    
    <div class="grid chart-grid">
      <!-- Category Revenue Chart -->
      <div class="card">
        <h2 class="card-title">Revenue by Category</h2>
        <div class="chart-container">
          <Chart v-if="categoryChartData" type="pie" :data="categoryChartData" :options="chartOptions" />
          <ProgressSpinner v-else />
        </div>
      </div>
      
      <!-- Inventory Chart -->
      <div class="card">
        <h2 class="card-title">Inventory by Category</h2>
        <div class="chart-container">
          <Chart v-if="inventoryChartData" type="bar" :data="inventoryChartData" :options="chartOptions" />
          <ProgressSpinner v-else />
        </div>
      </div>
    </div>
    
    <!-- Low Stock Alerts -->
    <div class="card" v-if="lowInventoryProducts.length > 0">
      <h2 class="card-title">Low Stock Alerts</h2>
      <DataTable :value="lowInventoryProducts" responsiveLayout="scroll" class="p-datatable-sm">
        <Column field="id" header="ID"></Column>
        <Column field="name" header="Product Name"></Column>
        <Column field="category" header="Category"></Column>
        <Column field="stock" header="Current Stock"></Column>
        <Column field="lowStockThreshold" header="Threshold"></Column>
        <Column header="Status">
          <template #body="slotProps">
            <span class="status-badge status-warning">Low Stock</span>
          </template>
        </Column>
      </DataTable>
    </div>
  </div>
</template>

<style scoped>
.page-title {
  margin-bottom: 1.5rem;
  color: #2c3e50;
  font-size: 1.75rem;
}

.summary-grid {
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  margin-bottom: 1.5rem;
}

.summary-card {
  text-align: center;
  padding: 1.5rem;
}

.summary-title {
  font-size: 1rem;
  color: #606266;
  margin-bottom: 0.5rem;
}

.summary-value {
  font-size: 2rem;
  font-weight: 600;
  color: #2c3e50;
}

.chart-container {
  height: 300px;
  position: relative;
}

.chart-grid {
  grid-template-columns: repeat(auto-fit, minmax(450px, 1fr));
  gap: 1.5rem;
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.75rem;
  font-weight: 600;
}

.status-warning {
  background-color: rgba(230, 162, 60, 0.1);
  color: #e6a23c;
}

@media (max-width: 768px) {
  .chart-grid {
    grid-template-columns: 1fr;
  }
}
</style>
