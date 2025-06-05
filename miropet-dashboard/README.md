# MiroPet Admin Dashboard

A modern, fully-featured ecommerce admin dashboard built with React TypeScript that integrates with the MiroPet backend API. This dashboard provides comprehensive tools for managing your pet store including products, users, orders, and analytics.

## Features

### 🎯 **Core Features**

- **Authentication System** - Secure login with JWT tokens
- **Product Management** - Full CRUD operations for products with variations
- **User Management** - Create and manage admin users
- **Dashboard Analytics** - Real-time stats and charts
- **Responsive Design** - Works perfectly on desktop, tablet, and mobile

### 🛠 **Technical Features**

- **React 19** with TypeScript for type safety
- **Material-UI v5** for beautiful, consistent UI components
- **React Router v6** for navigation
- **React Hook Form** with Yup validation
- **Recharts** for data visualization
- **Axios** for API communication
- **Notistack** for notifications
- **Context API** for state management

### 📊 **Dashboard Sections**

1. **Dashboard Overview** - Key metrics, charts, and quick actions
2. **Product Management** - Add, edit, delete, and view products
3. **User Management** - Create admin users and manage access
4. **Orders** - Track and manage customer orders (Coming Soon)
5. **Analytics** - Detailed insights and reports (Coming Soon)
6. **Settings** - System configuration (Coming Soon)

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- MiroPet backend server running on `http://localhost:3001`

### Installation

1. **Clone the repository**

   ```bash
   git clone <your-repo-url>
   cd miropet-dashboard
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Start the development server**

   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173`

### Default Login Credentials

- **Email:** `admin@miropet.com`
- **Password:** `admin123`

## Project Structure

```
src/
├── components/          # Reusable UI components
│   └── Layout/         # Layout components (Sidebar, etc.)
├── context/            # React Context providers
│   └── AuthContext.tsx # Authentication state management
├── pages/              # Page components
│   ├── Dashboard.tsx   # Main dashboard
│   ├── Login.tsx       # Login page
│   ├── Products.tsx    # Product list page
│   ├── ProductForm.tsx # Add/Edit product form
│   └── UserForm.tsx    # Add user form
├── services/           # API service layer
│   └── api.ts          # API client with axios
├── types/              # TypeScript type definitions
│   └── index.ts        # All interfaces and types
├── App.tsx             # Main app component with routing
└── main.tsx            # Entry point
```

## API Integration

The dashboard integrates with your MiroPet backend server with the following endpoints:

### Authentication

- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

### Products

- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create new product (Admin only)
- `PUT /api/products/:id` - Update product (Admin only)
- `DELETE /api/products/:id` - Delete product (Admin only)

### Users

- `GET /api/users/profile` - Get user profile
- `POST /api/users/admin` - Create admin user (Admin only)

## Features Overview

### 🏪 Product Management

- **Product List** - View all products with filtering and search
- **Add Product** - Create new products with multiple variations
- **Edit Product** - Update existing product information
- **Delete Product** - Remove products with confirmation
- **Product Variations** - Support for colors, sizes, prices, and stock
- **Image Management** - Multiple image URLs per variation
- **Category System** - Flexible categorization
- **Featured Products** - Mark products as featured

### 👥 User Management

- **Admin Creation** - Create new admin users
- **Role-based Access** - Different permissions for admins and customers
- **Profile Management** - View and edit user profiles

### 📈 Dashboard Analytics

- **Key Metrics** - Total products, orders, users, revenue
- **Sales Charts** - Line charts showing sales trends
- **Category Distribution** - Pie charts for product categories
- **Recent Activity** - Latest products and transactions

### 🔒 Security Features

- **JWT Authentication** - Secure token-based authentication
- **Protected Routes** - Route guards for authenticated users
- **Role-based Access** - Admin-only features and pages
- **Automatic Logout** - Session management and token refresh

## Customization

### Theming

The dashboard uses Material-UI's theming system. You can customize colors, typography, and spacing in `src/App.tsx`:

```typescript
const theme = createTheme({
  palette: {
    primary: {
      main: "#667eea", // Change primary color
    },
    secondary: {
      main: "#764ba2", // Change secondary color
    },
  },
});
```

### API Configuration

Update the API base URL in `src/services/api.ts`:

```typescript
const BASE_URL = "http://localhost:3001/api"; // Change to your API URL
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Production Deployment

1. **Build the project**

   ```bash
   npm run build
   ```

2. **Deploy the `dist` folder** to your hosting service (Netlify, Vercel, etc.)

3. **Environment Variables**
   Make sure to set up environment variables for production:
   - `VITE_API_URL` - Your production API URL

## Troubleshooting

### Common Issues

1. **API Connection Issues**

   - Ensure the backend server is running
   - Check the API base URL in `api.ts`
   - Verify CORS settings on the backend

2. **Authentication Issues**

   - Clear localStorage and cookies
   - Check if JWT tokens are valid
   - Verify admin user exists in the database

3. **Build Issues**
   - Delete `node_modules` and reinstall
   - Update Node.js to latest LTS version
   - Check for peer dependency conflicts

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please refer to the documentation or create an issue in the repository.

---

**Built with ❤️ for MiroPet - Making pet care easier, one click at a time!**
