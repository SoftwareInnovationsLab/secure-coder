import './App.css'
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useParams } from "react-router-dom";

import Layout from './components/Layout';
import Exercise from "./components/Exercise";
import ExerciseList from "./components/ExerciseList";
import ExerciseForm from "./components/ExerciseForm";
import LoginPage from './pages/LoginPage';
import { BreadcrumbProvider } from './context/BreadcrumbsContext';
import { AuthProvider } from './auth/AuthContext';
import { PrivateRoute } from './auth/PrivateRoute';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <BreadcrumbProvider>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Navigate to="/exercises" replace />} />
              <Route path="exercises" element={<ExerciseList />} />
              <Route path="exercises/new" element={
                <PrivateRoute>
                  <ExerciseForm />
                </PrivateRoute>
              } />
              <Route path="exercises/:id/edit" element={
                <PrivateRoute>
                  <ExerciseFormWithId />
                </PrivateRoute>
              } />
              <Route path="exercises/:id/do" element={<ExerciseWithId />} />
              <Route path="login" element={<LoginPage />} />
            </Route>
          </Routes>
        </BreadcrumbProvider>
      </BrowserRouter>
    </AuthProvider>
  );
}

// Wrapper to extract id param and pass to ExerciseForm

function ExerciseWithId() {
  const { id } = useParams();
  if (!id) return <div>Invalid exercise ID</div>;
  return <Exercise exerciseId={id} />;
}

function ExerciseFormWithId() {
  const { id } = useParams();
  if (!id) return <div>Invalid exercise ID</div>;
  return <ExerciseForm exerciseId={id} />;
}

