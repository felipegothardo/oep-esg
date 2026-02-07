import Dashboard from '@/components/Dashboard';
import ProtectedRoute from '@/components/ProtectedRoute';
import AIAssistant from '@/components/AIAssistant';

const Index = () => {
  return (
    <ProtectedRoute>
      <div className="relative">
        <Dashboard />
        <AIAssistant />
      </div>
    </ProtectedRoute>
  );
};

export default Index;
