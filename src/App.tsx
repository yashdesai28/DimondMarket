import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import AppRouter from './router/AppRouter';
import './index.css';

function App() {
  return (
    <BrowserRouter>
      <AppRouter />
      <Toaster
        position="top-right"
        toastOptions={{
          className: 'border border-zinc-200 bg-white text-zinc-900 shadow-lg text-sm font-medium rounded-lg px-4 py-3',
          success: {
            iconTheme: {
              primary: '#10b981', // emerald-500
              secondary: '#ecfdf5', // emerald-50
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444', // red-500
              secondary: '#fef2f2', // red-50
            },
          },
        }}
      />
    </BrowserRouter>
  );
}

export default App;
