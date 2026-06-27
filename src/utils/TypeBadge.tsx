
interface TypeBadgeProps {
  type: string;
}

const colorMap: Record<string, string> = {
  Grocery: 'bg-green-100 text-green-700',
  Clothes: 'bg-pink-100 text-pink-700',
  Electronics: 'bg-blue-100 text-blue-700',
  Furniture: 'bg-yellow-100 text-yellow-800',
  Pay: 'bg-purple-100 text-purple-700',
  Dues: 'bg-orange-100 text-orange-700',
  Default: 'bg-gray-100 text-gray-600',
};

const TypeBadge: React.FC<TypeBadgeProps> = ({ type }) => {
  const style = colorMap[type] || colorMap.Default;
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold inline-block ${style}`}>
      {type}
    </span>
  );
};

export default TypeBadge;
