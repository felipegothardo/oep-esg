import Dashboard from '@/components/Dashboard';
import ProtectedRoute from '@/components/ProtectedRoute';
import AuthHeader from '@/components/AuthHeader';
import AIAssistant from '@/components/AIAssistant';

const Index = () => {
  return (
    <ProtectedRoute>
      <div className="relative">
        <AuthHeader />
        <Dashboard />
        <AIAssistant />
      </div>
    </ProtectedRoute>
  );
};

export default Index;
