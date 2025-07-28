import EcoHeader from '@/components/EcoHeader';
import RecyclingCalculator from '@/components/RecyclingCalculator';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <EcoHeader />
      <main className="py-12 px-6">
        <RecyclingCalculator />
      </main>
    </div>
  );
};

export default Index;
