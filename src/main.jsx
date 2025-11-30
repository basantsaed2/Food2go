import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { store } from './Store/store';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './index.css';
import './App.css';
import { RouterProvider } from 'react-router-dom';
import router from './router';
import './i18n';
import { LanguageProvider } from './context/LanguageContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

// Create a React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 2 * 60 * 1000, // 2 minutes
      refetchOnWindowFocus: false, // Optional: prevent refetch on window focus
    },
  },
});

createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <ToastContainer />
        <RouterProvider router={router} />
        {/* Add React Query DevTools for development */}
        <ReactQueryDevtools initialIsOpen={false} />
      </LanguageProvider>
    </QueryClientProvider>
  </Provider>
);