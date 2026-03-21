type TableCardProps = {
  children: React.ReactNode;
  style?: React.CSSProperties;
};

export default function TableCard({ children, style }: TableCardProps) {
  return (
    <div
      style={{
        marginTop: 16,
        border: "1px solid #e5e7eb",
        borderRadius: 16,
        overflow: "hidden",
        background: "white",
        boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
        ...style,
      }}
    >
      {children}
    </div>
  );
}