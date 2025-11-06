import React from 'react';
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
            <AppLayout>
              <Header />
              <Main>
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/products" element={<ProductListPage />} />
                  <Route path="/products/:id" element={<ProductDetailPage />} />
                  <Route path="/cart" element={<CartPage />} />
                  <Route path="/wishlist" element={<div style={{ padding: '2rem' }}><h1>Wishlist (Coming Soon)</h1></div>} />
                  <Route path="/account" element={<div style={{ padding: '2rem' }}><h1>Account (Coming Soon)</h1></div>} />
                  <Route path="/login" element={<div style={{ padding: '2rem' }}><h1>Login (Coming Soon)</h1></div>} />
                  <Route path="/checkout" element={<div style={{ padding: '2rem' }}><h1>Checkout (Coming Soon)</h1></div>} />
                  <Route path="*" element={<div style={{ padding: '2rem', textAlign: 'center' }}><h1>Page Not Found</h1></div>} />
                </Routes>
              </Main>
              <Footer />
            </AppLayout>
          </CartProvider>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;
