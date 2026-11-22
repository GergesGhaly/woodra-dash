import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import styled from "styled-components";

import ErrorBoundary from "./components/ErrorBoundary";
import Sidebar from "./components/sidebar/Sidebar";
import Topbar from "./components/topbar/Topbar";
import { AuthProvider } from "./context/AuthContext";
import { useAuth } from "./context/useAuth";

import Dashboard from "./pages/dashboard/Dashboard";
import ProductList from "./pages/productList/ProductList";
import NewProduct from "./pages/newProduct/NewProduct";
import Transactions from "./pages/Transactions/Transactions";
import Categories from "./pages/categories/Categories";
import UserList from "./pages/userList/UserList";
import Product from "./pages/product/Product";
import User from "./pages/user/User";
import Login from "./pages/login/Login";

import "./App.css";

function ProtectedDashboard() {
  const { user, isAdmin, isTestMode, authLoading } = useAuth();

  if (authLoading && !isTestMode) {
    return (
      <AuthLoadingState>
        <AuthSpinnerCard>Verifying administrator session...</AuthSpinnerCard>
      </AuthLoadingState>
    );
  }

  if (!isTestMode && (!user || !isAdmin)) {
    return <Login />;
  }

  return (
    <Container>
      <Sidebar />

      <Main>
        <Topbar />

        <Content>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/operations" element={<Transactions />} />
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/products" element={<ProductList />} />
            <Route path="/product/:productId" element={<Product />} />
            <Route path="/newproduct" element={<NewProduct />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/users" element={<UserList />} />
            <Route path="/user/:userId" element={<User />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Content>
      </Main>
    </Container>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <BrowserRouter>
          <ProtectedDashboard />
        </BrowserRouter>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;

const Container = styled.div`
  display: flex;
  min-height: 100vh;
`;

const Main = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
`;

const Content = styled.main`
  flex: 1;
  padding: 10px;
`;

const AuthLoadingState = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f8f9fb;
`;

const AuthSpinnerCard = styled.div`
  background-color: #ffffff;
  padding: 24px 32px;
  border-radius: 10px;
  box-shadow: 0px 0px 15px -10px rgba(0, 0, 0, 0.75);
  color: #555;
  font-weight: 600;
`;
