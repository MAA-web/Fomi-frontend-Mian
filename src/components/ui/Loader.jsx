export default function Loader({ size = 65, className = "" }) {
  const style = { width: typeof size === "number" ? `${size}px` : size };
  return (
    <div
      className={`loader ${className}`}
      style={style}
      aria-label="Loading"
      role="status"
    />
  );
}


