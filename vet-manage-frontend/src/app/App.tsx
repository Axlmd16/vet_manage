import { BrowserRouter } from 'react-router-dom';
import { ToastProvider } from '../common/components/toast';
import { AppRouter } from './router';

function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <AppRouter />
      </BrowserRouter>
    </ToastProvider>
  );
}

export default App;
