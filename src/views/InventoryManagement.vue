<script setup>
import { ref, computed, onMounted } from 'vue';
import { useStoreData } from '../store';
import sampleData from '../assets/data/sampleData';

const store = useStoreData();

// Filter states
const searchQuery = ref('');
const selectedCategory = ref(null);
const selectedPlatform = ref(null);
const sortField = ref('name');
const sortOrder = ref(1); // 1 for ascending, -1 for descending
const showLowStockOnly = ref(false);

// Edit inventory dialog
const editDialog = ref(false);
const editingProduct = ref(null);
const newStockValue = ref(0);

// Toast message
const toast = ref(null);

// Category and platform options for filters
const categoryOptions = computed(() => {
  return [
    { label: 'All Categories', value: null },
    ...sampleData.categories.map(category => ({ label: category, value: category }))
  ];
});

const platformOptions = computed(() => {
  return [
    { label: 'All Platforms', value: null },
    ...sampleData.platforms.map(platform => ({ label: platform, value: platform }))
  ];
});

// Filtered and sorted products
const filteredProducts = computed(() => {
  return store.products
    .filter(product => {
      // Search filter
      if (searchQuery.value && !product.name.toLowerCase().includes(searchQuery.value.toLowerCase()) && 
          !product.description.toLowerCase().includes(searchQuery.value.toLowerCase())) {
        return false;
      }
      
      // Category filter
      if (selectedCategory.value && product.category !== selectedCategory.value) {
        return false;
      }
      
      // Platform filter
      if (selectedPlatform.value && product.platform !== selectedPlatform.value) {
        return false;
      }
      
      // Low stock filter
      if (showLowStockOnly.value && product.stock >= product.lowStockThreshold) {
        return false;
      }
      
      return true;
    })
    .sort((a, b) => {
      if (sortField.value === 'price' || sortField.value === 'stock') {
        return (a[sortField.value] - b[sortField.value]) * sortOrder.value;
      } else {
        return a[sortField.value].localeCompare(b[sortField.value]) * sortOrder.value;
      }
    });
});

// Inventory stats
const inventoryStats = computed(() => {
  const totalProducts = store.products.length;
  const totalStock = store.products.reduce((sum, product) => sum + product.stock, 0);
  const lowStockCount = store.products.filter(product => product.stock < product.lowStockThreshold).length;
  const outOfStockCount = store.products.filter(product => product.stock === 0).length;
  
  return {
    totalProducts,
    totalStock,
    lowStockCount,
    outOfStockCount
  };
});

// Methods
const toggleSort = (field) => {
  if (sortField.value === field) {
    sortOrder.value *= -1;
  } else {
    sortField.value = field;
    sortOrder.value = 1;
  }
};

const openEditDialog = (product) => {
  editingProduct.value = { ...product };
  newStockValue.value = product.stock;
  editDialog.value = true;
};

const updateInventory = () => {
  if (newStockValue.value < 0) {
    // Show error toast
    toast.value.add({ 
      severity: 'error', 
      summary: 'Error', 
      detail: 'Stock value cannot be negative', 
      life: 3000 
    });
    return;
  }
  
  store.updateInventory(editingProduct.value.id, newStockValue.value);
  
  // Show success toast
  toast.value.add({ 
    severity: 'success', 
    summary: 'Success', 
    detail: 'Inventory updated successfully', 
    life: 3000 
  });
  
  editDialog.value = false;
};

const getStockStatusClass = (product) => {
  if (product.stock === 0) {
    return 'status-danger';
  } else if (product.stock < product.lowStockThreshold) {
    return 'status-warning';
  } else {
    return 'status-success';
  }
};

const getStockStatusLabel = (product) => {
  if (product.stock === 0) {
    return 'Out of Stock';
  } else if (product.stock < product.lowStockThreshold) {
    return 'Low Stock';
  } else {
    return 'In Stock';
  }
};

onMounted(() => {
  // Initialize toast component
  toast.value = window.$toast;
});
</script>

<template>
  <div>
    <Toast ref="toast" />
    
    <h1 class="page-title">Inventory Management</h1>
    
    <!-- Inventory Stats -->
    <div class="grid summary-grid">
      <div class="card summary-card">
        <h3 class="summary-title">Total Products</h3>
        <p class="summary-value">{{ inventoryStats.totalProducts }}</p>
      </div>
      
      <div class="card summary-card">
        <h3 class="summary-title">Total Stock</h3>
        <p class="summary-value">{{ inventoryStats.totalStock }}</p>
      </div>
      
      <div class="card summary-card">
        <h3 class="summary-title">Low Stock Items</h3>
        <p class="summary-value">{{ inventoryStats.lowStockCount }}</p>
      </div>
      
      <div class="card summary-card">
        <h3 class="summary-title">Out of Stock</h3>
        <p class="summary-value">{{ inventoryStats.outOfStockCount }}</p>
      </div>
    </div>
    
    <!-- Filters -->
    <div class="card filter-card">
      <div class="filter-container">
        <div class="filter-item search-filter">
          <span class="p-input-icon-left w-full">
            <i class="pi pi-search" />
            <InputText v-model="searchQuery" placeholder="Search products..." class="w-full" />
          </span>
        </div>
        
        <div class="filter-item">
          <Dropdown v-model="selectedCategory" :options="categoryOptions" optionLabel="label" optionValue="value" placeholder="Category" class="w-full" />
        </div>
        
        <div class="filter-item">
          <Dropdown v-model="selectedPlatform" :options="platformOptions" optionLabel="label" optionValue="value" placeholder="Platform" class="w-full" />
        </div>
        
        <div class="filter-item checkbox-filter">
          <div class="p-field-checkbox">
            <input type="checkbox" id="lowStock" v-model="showLowStockOnly" class="p-checkbox-box" />
            <label for="lowStock">Show Low Stock Only</label>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Products Table -->
    <div class="card">
      <DataTable :value="filteredProducts" responsiveLayout="scroll" class="p-datatable-sm" stripedRows>
        <Column field="id" header="ID" sortable @click="toggleSort('id')"></Column>
        <Column field="name" header="Product Name" sortable @click="toggleSort('name')">
          <template #body="slotProps">
            <div class="product-name-cell">
              <img :src="slotProps.data.image" :alt="slotProps.data.name" class="product-thumbnail" />
              <div>
                <div class="product-name">{{ slotProps.data.name }}</div>
                <div class="product-category">{{ slotProps.data.category }}</div>
              </div>
            </div>
          </template>
        </Column>
        <Column field="platform" header="Platform" sortable @click="toggleSort('platform')"></Column>
        <Column field="price" header="Price" sortable @click="toggleSort('price')">
          <template #body="slotProps">
            ${{ slotProps.data.price.toFixed(2) }}
          </template>
        </Column>
        <Column field="stock" header="Stock" sortable @click="toggleSort('stock')"></Column>
        <Column field="lowStockThreshold" header="Low Stock Threshold"></Column>
        <Column header="Status">
          <template #body="slotProps">
            <span class="status-badge" :class="getStockStatusClass(slotProps.data)">
              {{ getStockStatusLabel(slotProps.data) }}
            </span>
          </template>
        </Column>
        <Column header="Actions">
          <template #body="slotProps">
            <Button icon="pi pi-pencil" class="p-button-sm p-button-text" @click="openEditDialog(slotProps.data)" />
          </template>
        </Column>
      </DataTable>
    </div>
    
    <!-- Edit Inventory Dialog -->
    <Dialog v-model:visible="editDialog" header="Update Inventory" :style="{ width: '450px' }" :modal="true">
      <div class="edit-dialog-content" v-if="editingProduct">
        <div class="product-details">
          <h3>{{ editingProduct.name }}</h3>
          <p>Current Stock: {{ editingProduct.stock }}</p>
          <p>Low Stock Threshold: {{ editingProduct.lowStockThreshold }}</p>
        </div>
        
        <div class="form-group">
          <label for="newStock" class="form-label">New Stock Value</label>
          <InputText id="newStock" v-model.number="newStockValue" type="number" class="w-full" />
        </div>
      </div>
      
      <template #footer>
        <Button label="Cancel" icon="pi pi-times" class="p-button-text" @click="editDialog = false" />
        <Button label="Update" icon="pi pi-check" class="p-button-text" @click="updateInventory" />
      </template>
    </Dialog>
  </div>
</template>

<style scoped>
.page-title {
  margin-bottom: 1.5rem;
  color: #2c3e50;
  font-size: 1.75rem;
}

.summary-grid {
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
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

.filter-card {
  margin-bottom: 1.5rem;
}

.filter-container {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  align-items: center;
}

.filter-item {
  flex: 1;
  min-width: 200px;
}

.search-filter {
  flex: 2;
  min-width: 300px;
}

.checkbox-filter {
  min-width: 150px;
  flex: 0 0 auto;
}

.product-name-cell {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.product-thumbnail {
  width: 40px;
  height: 40px;
  border-radius: 4px;
  object-fit: cover;
}

.product-name {
  font-weight: 500;
}

.product-category {
  font-size: 0.75rem;
  color: #909399;
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.75rem;
  font-weight: 600;
}

.status-success {
  background-color: rgba(103, 194, 58, 0.1);
  color: #67c23a;
}

.status-warning {
  background-color: rgba(230, 162, 60, 0.1);
  color: #e6a23c;
}

.status-danger {
  background-color: rgba(245, 108, 108, 0.1);
  color: #f56c6c;
}

.edit-dialog-content {
  padding: 1rem 0;
}

.product-details {
  margin-bottom: 1.5rem;
}

.product-details h3 {
  margin-bottom: 0.5rem;
  color: #2c3e50;
}

.product-details p {
  margin-bottom: 0.25rem;
  color: #606266;
}

.w-full {
  width: 100%;
}
</style>
