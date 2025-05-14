<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useStoreData } from '../store';
import sampleData from '../assets/data/sampleData';

const store = useStoreData();
const router = useRouter();

// Form data
const productForm = ref({
  name: '',
  description: '',
  price: '',
  stock: '',
  lowStockThreshold: '',
  category: null,
  platform: null,
  image: null
});

// Form validation
const errors = ref({});
const isSubmitting = ref(false);

// Category and platform options
const categoryOptions = sampleData.categories.map(category => ({ label: category, value: category }));
const platformOptions = sampleData.platforms.map(platform => ({ label: platform, value: platform }));

// Toast message
const toast = ref(null);

// Validate form
const validateForm = () => {
  const newErrors = {};
  
  if (!productForm.value.name.trim()) {
    newErrors.name = 'Product name is required';
  }
  
  if (!productForm.value.description.trim()) {
    newErrors.description = 'Product description is required';
  }
  
  if (!productForm.value.price || isNaN(productForm.value.price) || parseFloat(productForm.value.price) <= 0) {
    newErrors.price = 'Price must be a positive number';
  }
  
  if (!productForm.value.stock || isNaN(productForm.value.stock) || parseInt(productForm.value.stock) < 0) {
    newErrors.stock = 'Stock must be a non-negative number';
  }
  
  if (!productForm.value.lowStockThreshold || isNaN(productForm.value.lowStockThreshold) || parseInt(productForm.value.lowStockThreshold) < 0) {
    newErrors.lowStockThreshold = 'Low stock threshold must be a non-negative number';
  }
  
  if (!productForm.value.category) {
    newErrors.category = 'Category is required';
  }
  
  if (!productForm.value.platform) {
    newErrors.platform = 'Platform is required';
  }
  
  errors.value = newErrors;
  return Object.keys(newErrors).length === 0;
};

// Handle image upload
const onImageUpload = (event) => {
  const file = event.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      productForm.value.image = e.target.result;
    };
    reader.readAsDataURL(file);
  }
};

// Submit form
const submitForm = () => {
  if (!validateForm()) {
    toast.value.add({ 
      severity: 'error', 
      summary: 'Validation Error', 
      detail: 'Please check the form for errors', 
      life: 3000 
    });
    return;
  }
  
  isSubmitting.value = true;
  
  // Create new product object
  const newProduct = {
    name: productForm.value.name,
    description: productForm.value.description,
    price: parseFloat(productForm.value.price),
    stock: parseInt(productForm.value.stock),
    lowStockThreshold: parseInt(productForm.value.lowStockThreshold),
    category: productForm.value.category,
    platform: productForm.value.platform,
    image: productForm.value.image || `https://picsum.photos/id/${Math.floor(Math.random() * 100)}/200/200`
  };
  
  // Add product to store
  store.addProduct(newProduct);
  
  // Show success message
  toast.value.add({ 
    severity: 'success', 
    summary: 'Success', 
    detail: 'Product added successfully', 
    life: 3000 
  });
  
  // Reset form
  productForm.value = {
    name: '',
    description: '',
    price: '',
    stock: '',
    lowStockThreshold: '',
    category: null,
    platform: null,
    image: null
  };
  
  isSubmitting.value = false;
  
  // Navigate to inventory page after a short delay
  setTimeout(() => {
    router.push('/inventory');
  }, 2000);
};

// Reset form
const resetForm = () => {
  productForm.value = {
    name: '',
    description: '',
    price: '',
    stock: '',
    lowStockThreshold: '',
    category: null,
    platform: null,
    image: null
  };
  errors.value = {};
};

onMounted(() => {
  // Initialize toast component
  toast.value = window.$toast;
});
</script>

<template>
  <div>
    <Toast ref="toast" />
    
    <h1 class="page-title">Add New Product</h1>
    
    <div class="card">
      <form @submit.prevent="submitForm" class="product-form">
        <div class="form-grid">
          <!-- Left column - Product details -->
          <div class="form-column">
            <div class="form-group">
              <label for="name" class="form-label">Product Name *</label>
              <InputText id="name" v-model="productForm.name" :class="{'p-invalid': errors.name}" class="w-full" />
              <small v-if="errors.name" class="p-error">{{ errors.name }}</small>
            </div>
            
            <div class="form-group">
              <label for="description" class="form-label">Description *</label>
              <Textarea id="description" v-model="productForm.description" rows="5" :class="{'p-invalid': errors.description}" class="w-full" />
              <small v-if="errors.description" class="p-error">{{ errors.description }}</small>
            </div>
            
            <div class="form-row">
              <div class="form-group">
                <label for="price" class="form-label">Price ($) *</label>
                <InputText id="price" v-model="productForm.price" type="number" step="0.01" :class="{'p-invalid': errors.price}" class="w-full" />
                <small v-if="errors.price" class="p-error">{{ errors.price }}</small>
              </div>
              
              <div class="form-group">
                <label for="stock" class="form-label">Initial Stock *</label>
                <InputText id="stock" v-model="productForm.stock" type="number" :class="{'p-invalid': errors.stock}" class="w-full" />
                <small v-if="errors.stock" class="p-error">{{ errors.stock }}</small>
              </div>
            </div>
            
            <div class="form-group">
              <label for="lowStockThreshold" class="form-label">Low Stock Threshold *</label>
              <InputText id="lowStockThreshold" v-model="productForm.lowStockThreshold" type="number" :class="{'p-invalid': errors.lowStockThreshold}" class="w-full" />
              <small v-if="errors.lowStockThreshold" class="p-error">{{ errors.lowStockThreshold }}</small>
            </div>
            
            <div class="form-row">
              <div class="form-group">
                <label for="category" class="form-label">Category *</label>
                <Dropdown id="category" v-model="productForm.category" :options="categoryOptions" optionLabel="label" optionValue="value" placeholder="Select Category" :class="{'p-invalid': errors.category}" class="w-full" />
                <small v-if="errors.category" class="p-error">{{ errors.category }}</small>
              </div>
              
              <div class="form-group">
                <label for="platform" class="form-label">Platform *</label>
                <Dropdown id="platform" v-model="productForm.platform" :options="platformOptions" optionLabel="label" optionValue="value" placeholder="Select Platform" :class="{'p-invalid': errors.platform}" class="w-full" />
                <small v-if="errors.platform" class="p-error">{{ errors.platform }}</small>
              </div>
            </div>
          </div>
          
          <!-- Right column - Image upload -->
          <div class="form-column">
            <div class="image-upload-container">
              <h3 class="upload-title">Product Image</h3>
              
              <div class="image-preview" v-if="productForm.image">
                <img :src="productForm.image" alt="Product Preview" class="preview-image" />
              </div>
              <div class="image-placeholder" v-else>
                <i class="pi pi-image"></i>
                <p>No image selected</p>
              </div>
              
              <FileUpload mode="basic" accept="image/*" :maxFileSize="1000000" 
                chooseLabel="Choose Image" class="upload-button" 
                @select="onImageUpload" :auto="true" />
              
              <p class="upload-help">
                Supported formats: JPG, PNG, GIF<br>
                Max size: 1MB
              </p>
            </div>
          </div>
        </div>
        
        <div class="form-actions">
          <Button type="button" label="Cancel" icon="pi pi-times" class="p-button-text" @click="resetForm" />
          <Button type="submit" label="Add Product" icon="pi pi-check" :loading="isSubmitting" />
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.page-title {
  margin-bottom: 1.5rem;
  color: #2c3e50;
  font-size: 1.75rem;
}

.product-form {
  padding: 1rem 0;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
}

.form-column {
  display: flex;
  flex-direction: column;
}

.form-group {
  margin-bottom: 1.5rem;
  width: 100%;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 0;
}

.form-label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid #ebeef5;
}

.image-upload-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1.5rem;
  background-color: #f8f9fa;
  border-radius: 8px;
  height: 100%;
}

.upload-title {
  margin-bottom: 1.5rem;
  color: #2c3e50;
}

.image-preview {
  width: 200px;
  height: 200px;
  margin-bottom: 1.5rem;
  border-radius: 8px;
  overflow: hidden;
}

.preview-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-placeholder {
  width: 200px;
  height: 200px;
  margin-bottom: 1.5rem;
  border-radius: 8px;
  background-color: #ebeef5;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: #909399;
}

.image-placeholder i {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.upload-button {
  margin-bottom: 1rem;
}

.upload-help {
  font-size: 0.75rem;
  color: #909399;
  text-align: center;
}

.p-error {
  color: #f56c6c;
  font-size: 0.75rem;
  margin-top: 0.25rem;
}

.w-full {
  width: 100%;
}

@media (max-width: 768px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
  
  .image-upload-container {
    margin-top: 1.5rem;
  }
}
</style>
