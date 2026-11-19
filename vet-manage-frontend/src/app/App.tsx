import { BrowserRouter } from 'react-router-dom';
import { ToastProvider } from '../common/components/toast';
import { AuthProvider } from '../modules/auth/auth-provider';
import { AppRouter } from './router';

function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <BrowserRouter>
          <AppRouter />
        </BrowserRouter>
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;
