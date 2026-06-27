import { useLoader } from '../contexts/LoaderContext';

const Loader = () => {
  const { isLoading } = useLoader();

  return isLoading ? (
    <div className="fixed inset-0 z-[9999] bg-transparent flex justify-center items-center">
      {/* Transparent overlay to block clicks */}
      <div className="absolute inset-0 bg-transparent pointer-events-auto" />

      {/* Spinner (popup look) */}
      <div className="relative z-10 animate-spin h-10 w-10 border-4 border-orange-500 border-t-transparent rounded-full" />
    </div>
  ) : null;
};

export default Loader;
