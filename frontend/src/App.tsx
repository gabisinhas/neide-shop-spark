import { AppProviders } from './presentation/providers/AppProviders';
import { AppRoutes } from './presentation/routes/AppRoutes';

function App() {
  return (
    <AppProviders>
      <AppRoutes />
    </AppProviders>
  );
}

export default App;