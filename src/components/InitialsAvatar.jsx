export default function InitialsAvatar({ name, size = 'md', className = '' }) {
  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('');

  const sizeClasses = {
    sm: 'w-10 h-10 text-sm',
    md: 'w-16 h-16 text-xl',
    lg: 'w-24 h-24 text-3xl',
    xl: 'w-32 h-32 text-4xl',
  };

  return (
    <div
      className={`rounded-full flex items-center justify-center font-bold shrink-0 ${sizeClasses[size]} ${className}`}
      style={{ backgroundColor: '#085777', color: '#A58D69' }}
    >
      {initials}
    </div>
  );
}
