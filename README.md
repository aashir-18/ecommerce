# E-Commerce Admin Dashboard

A comprehensive web-based admin dashboard for e-commerce managers to monitor sales, revenue, and inventory status. This dashboard provides real-time data visualization and management tools to support effective decision-making.

## Features

### 1. Dashboard
- Overview of key metrics including total revenue, orders, and low stock alerts
- Interactive charts displaying revenue trends, category distribution, and inventory levels

### 2. Revenue Analysis
- Real-time display of total orders, sales (revenue), and average order value
- Interactive charts to visualize orders and sales trends over time (daily, weekly, monthly, annually)
- Revenue data filterable by product categories
- Comparative analysis of revenue across different categories

### 3. Inventory Management
- List view of all products with current inventory status
- Options to sort, filter, and search products
- Functionality to update inventory levels
- Low inventory alerts indicating when restocking is necessary

### 4. Product Registration
- Form to add new products to the inventory
- Fields for product name, description, price, and initial stock level
- Option to upload product images
- Automatic inventory update upon successful submission

## Technologies Used

- **Frontend**: Vue.js 3 (Composition API)
- **State Management**: Pinia
- **Routing**: Vue Router
- **UI Components**: PrimeVue
- **Charts**: Chart.js with vue-chartjs
- **Data Tables**: ag-Grid

## Project Setup

### Prerequisites
- Node.js (v14 or higher)
- npm (v6 or higher)

### Installation

```sh
# Install dependencies
npm install

# Compile and hot-reload for development
npm run dev

# Compile and minify for production
npm run build
```

## Project Structure

```
├── public/              # Public static assets
├── src/
│   ├── assets/          # Project assets (images, styles, etc.)
│   │   └── data/        # Sample data for the dashboard
│   ├── components/      # Vue components
│   ├── router/          # Vue Router configuration
│   ├── store/           # Pinia store modules
│   ├── views/           # Page components
│   ├── App.vue          # Root component
│   └── main.js          # Application entry point
├── index.html           # HTML template
├── package.json         # Project dependencies and scripts
└── vite.config.js       # Vite configuration
```

## Design Choices

- **Modern UI/UX**: Clean, intuitive interface with responsive design for all device sizes
- **Interactive Visualizations**: Dynamic charts and graphs for better data interpretation
- **Real-time Updates**: Immediate reflection of inventory changes across the dashboard
- **Filterable Data**: Comprehensive filtering options for customized data views
- **Component-based Architecture**: Modular design for better code organization and reusability

## Screenshots

*Screenshots will be added here after deployment*

## Live Demo

*A link to the live demo will be provided here after deployment*

## License

MIT
