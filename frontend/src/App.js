import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  return (
    <Router>
      <div className="App">
        <header className="App-header">
          <h1>Welcome to FreshRoute</h1>
          <p>Your Fresh Produce E-Commerce Platform</p>
        </header>

        <Routes>
          <Route path="/" element={
            <main style={{ padding: '20px', textAlign: 'center' }}>
              <h2>Home Page</h2>
              <p>E-commerce platform coming soon...</p>
            </main>
          } />
        </Routes>

        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
      </div>
    </Router>
  );
}

export default App;
