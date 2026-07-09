export default function Logo({ className = '' }) {
  return (
    <div className={`flex items-center ${className}`}>
      <img
        src="/logo.png"
        alt="herviva"
        className="h-14 sm:h-16 lg:h-20 w-auto object-contain"
      />
    </div>
  );
}
