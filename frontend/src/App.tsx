import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import styled from 'styled-components';
import { GlobalStyles } from './styles/GlobalStyles';
import { theme } from './styles/theme';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { Header } from './components/common/Header';
import { Footer } from './components/common/Footer';
import { HomePage } from './pages/HomePage';
import { ProductListPage } from './pages/ProductListPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { CartPage } from './pages/CartPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { OrderSuccessPage } from './pages/OrderSuccessPage';
import { AccountDashboardPage } from './pages/AccountDashboardPage';
import { OrderHistoryPage } from './pages/OrderHistoryPage';
import { ProfilePage } from './pages/ProfilePage';
import { WishlistPage } from './pages/WishlistPage';
import { PrivateRoute } from './components/auth/PrivateRoute';
import { AdminRoute } from './components/auth/AdminRoute';
import AdminLayout from './components/admin/AdminLayout';
import DashboardPage from './pages/admin/DashboardPage';
import ProductsPage from './pages/admin/ProductsPage';
import OrdersPage from './pages/admin/OrdersPage';
import CategoriesPage from './pages/admin/CategoriesPage';
import AnalyticsPage from './pages/admin/AnalyticsPage';
import SettingsPage from './pages/admin/SettingsPage';

const AppLayout = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
`;

const Main = styled.main`
  flex: 1;
`;

function App() {
  return (
    <ThemeProvider theme={theme}>
      <GlobalStyles />
      <Router>
        <AuthProvider>
          <CartProvider>
            <Routes>
              <Route
                path="/admin/*"
                element={
                  <AdminRoute>
                    <AdminLayout />
                  </AdminRoute>
                }
              >
                <Route index element={<DashboardPage />} />
                <Route path="products" element={<ProductsPage />} />
                <Route path="orders" element={<OrdersPage />} />
                <Route path="categories" element={<CategoriesPage />} />
                <Route path="analytics" element={<AnalyticsPage />} />
                <Route path="settings" element={<SettingsPage />} />
              </Route>

              <Route
                path="*"
                element={
                  <AppLayout>
                    <Header />
                    <Main>
                      <Routes>
                        <Route path="/" element={<HomePage />} />
                        <Route path="/products" element={<ProductListPage />} />
                        <Route path="/products/:id" element={<ProductDetailPage />} />
                        <Route path="/cart" element={<CartPage />} />
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/register" element={<RegisterPage />} />
                        <Route
                          path="/wishlist"
                          element={
                            <PrivateRoute>
                              <WishlistPage />
                            </PrivateRoute>
                          }
                        />
                        <Route
                          path="/checkout"
                          element={
                            <PrivateRoute>
                              <CheckoutPage />
                            </PrivateRoute>
                          }
                        />
                        <Route
                          path="/order-success/:orderId"
                          element={
                            <PrivateRoute>
                              <OrderSuccessPage />
                            </PrivateRoute>
                          }
                        />
                        <Route
                          path="/account"
                          element={
                            <PrivateRoute>
                              <AccountDashboardPage />
                            </PrivateRoute>
                          }
                        />
                        <Route
                          path="/account/orders"
                          element={
                            <PrivateRoute>
                              <OrderHistoryPage />
                            </PrivateRoute>
                          }
                        />
                        <Route
                          path="/account/profile"
                          element={
                            <PrivateRoute>
                              <ProfilePage />
                            </PrivateRoute>
                          }
                        />
                        <Route
                          path="*"
                          element={
                            <div style={{ padding: '2rem', textAlign: 'center' }}>
                              <h1>Page Not Found</h1>
                            </div>
                          }
                        />
                      </Routes>
                    </Main>
                    <Footer />
                  </AppLayout>
                }
              />
            </Routes>
          </CartProvider>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;
