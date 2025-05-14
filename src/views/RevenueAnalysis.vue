<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useStoreData } from '../store';
import sampleData from '../assets/data/sampleData';

const store = useStoreData();

// Filter states
const selectedTimeRange = ref('monthly');
const selectedCategory = ref('all');
const timeRangeOptions = [
  { label: 'Daily', value: 'daily' },
  { label: 'Weekly', value: 'weekly' },
  { label: 'Monthly', value: 'monthly' },
  { label: 'Annually', value: 'annually' }
];
const categoryOptions = computed(() => {
  return [
    { label: 'All Categories', value: 'all' },
    ...sampleData.categories.map(category => ({ label: category, value: category }))
  ];
});

// Chart data
const revenueChartData = ref(null);
const orderChartData = ref(null);
const categoryRevenueData = ref(null);

// Chart options
const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom'
    },
    tooltip: {
      callbacks: {
        label: function(context) {
          let label = context.dataset.label || '';
          if (label) {
            label += ': ';
          }
          if (context.parsed.y !== null) {
            label += new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(context.parsed.y);
          }
          return label;
        }
      }
    }
  }
};

// Sales summary data
const salesSummary = computed(() => {
  const data = store.getRevenueByTimeRange(selectedTimeRange.value);
  
  // Filter by category if needed
  let filteredData = data;
  if (selectedCategory.value !== 'all') {
    filteredData = data.filter(item => {
      return item.categorySales && item.categorySales[selectedCategory.value] > 0;
    });
  }
  
  const totalRevenue = filteredData.reduce((sum, item) => {
    if (selectedCategory.value === 'all') {
      return sum + item.revenue;
    } else {
      return sum + (item.categorySales[selectedCategory.value] || 0);
    }
  }, 0);
  
  const totalOrders = filteredData.reduce((sum, item) => sum + item.orders, 0);
  
  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  
  return {
    totalRevenue,
    totalOrders,
    averageOrderValue
  };
});

// Update chart data based on filters
const updateCharts = () => {
  const data = store.getRevenueByTimeRange(selectedTimeRange.value);
  
  // Prepare labels based on time range
  let labels = data.map(item => {
    const date = new Date(item.date);
    if (selectedTimeRange.value === 'daily') {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } else if (selectedTimeRange.value === 'weekly') {
      return `Week ${Math.ceil(date.getDate() / 7)} - ${date.toLocaleDateString('en-US', { month: 'short' })}`;
    } else if (selectedTimeRange.value === 'monthly') {
      return date.toLocaleDateString('en-US', { month: 'long' });
    } else {
      return date.getFullYear().toString();
    }
  });
  
  // Remove duplicate labels (for weekly/monthly/annual views)
  const uniqueLabels = [];
  const uniqueIndices = [];
  labels.forEach((label, index) => {
    if (!uniqueLabels.includes(label)) {
      uniqueLabels.push(label);
      uniqueIndices.push(index);
    }
  });
  
  // Aggregate data by unique labels
  const aggregatedRevenue = {};
  const aggregatedOrders = {};
  
  uniqueLabels.forEach(label => {
    aggregatedRevenue[label] = 0;
    aggregatedOrders[label] = 0;
  });
  
  data.forEach((item, index) => {
    const label = labels[index];
    
    if (selectedCategory.value === 'all') {
      aggregatedRevenue[label] += item.revenue;
    } else if (item.categorySales && item.categorySales[selectedCategory.value]) {
      aggregatedRevenue[label] += item.categorySales[selectedCategory.value];
    }
    
    aggregatedOrders[label] += item.orders;
  });
  
  // Create chart datasets
  revenueChartData.value = {
    labels: uniqueLabels,
    datasets: [
      {
        label: 'Revenue',
        backgroundColor: 'rgba(64, 158, 255, 0.2)',
        borderColor: '#409eff',
        data: uniqueLabels.map(label => aggregatedRevenue[label]),
      }
    ]
  };
  
  orderChartData.value = {
    labels: uniqueLabels,
    datasets: [
      {
        label: 'Orders',
        backgroundColor: 'rgba(103, 194, 58, 0.2)',
        borderColor: '#67c23a',
        data: uniqueLabels.map(label => aggregatedOrders[label]),
      }
    ]
  };
  
  // Category revenue breakdown
  const categoryRevenue = store.getRevenueByCategory();
  const categories = Object.keys(categoryRevenue);
  const categoryValues = Object.values(categoryRevenue);
  
  categoryRevenueData.value = {
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
};

// Watch for filter changes
watch([selectedTimeRange, selectedCategory], () => {
  updateCharts();
});

onMounted(() => {
  updateCharts();
});
</script>

<template>
  <div>
    <h1 class="page-title">Revenue Analysis</h1>
    
    <!-- Filters -->
    <div class="card filter-card">
      <div class="filter-container">
        <div class="filter-item">
          <label class="filter-label">Time Range</label>
          <Dropdown v-model="selectedTimeRange" :options="timeRangeOptions" optionLabel="label" optionValue="value" placeholder="Select Time Range" class="w-full" />
        </div>
        
        <div class="filter-item">
          <label class="filter-label">Category</label>
          <Dropdown v-model="selectedCategory" :options="categoryOptions" optionLabel="label" optionValue="value" placeholder="Select Category" class="w-full" />
        </div>
      </div>
    </div>
    
    <!-- Summary Cards -->
    <div class="grid summary-grid">
      <div class="card summary-card">
        <h3 class="summary-title">Total Revenue</h3>
        <p class="summary-value">${{ salesSummary.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}</p>
      </div>
      
      <div class="card summary-card">
        <h3 class="summary-title">Total Orders</h3>
        <p class="summary-value">{{ salesSummary.totalOrders }}</p>
      </div>
      
      <div class="card summary-card">
        <h3 class="summary-title">Average Order Value</h3>
        <p class="summary-value">${{ salesSummary.averageOrderValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}</p>
      </div>
    </div>
    
    <!-- Revenue Chart -->
    <div class="card">
      <h2 class="card-title">Revenue Trends</h2>
      <div class="chart-container">
        <Chart v-if="revenueChartData" type="line" :data="revenueChartData" :options="chartOptions" />
        <ProgressSpinner v-else />
      </div>
    </div>
    
    <!-- Orders Chart -->
    <div class="card">
      <h2 class="card-title">Order Trends</h2>
      <div class="chart-container">
        <Chart v-if="orderChartData" type="bar" :data="orderChartData" :options="chartOptions" />
        <ProgressSpinner v-else />
      </div>
    </div>
    
    <!-- Category Revenue Breakdown -->
    <div class="card">
      <h2 class="card-title">Revenue by Category</h2>
      <div class="chart-container">
        <Chart v-if="categoryRevenueData" type="doughnut" :data="categoryRevenueData" :options="chartOptions" />
        <ProgressSpinner v-else />
      </div>
    </div>
  </div>
</template>

<style scoped>
.page-title {
  margin-bottom: 1.5rem;
  color: #2c3e50;
  font-size: 1.75rem;
}

.filter-card {
  margin-bottom: 1.5rem;
}

.filter-container {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
}

.filter-item {
  flex: 1;
  min-width: 200px;
}

.filter-label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
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
  margin-bottom: 1.5rem;
}

.w-full {
  width: 100%;
}
</style>
