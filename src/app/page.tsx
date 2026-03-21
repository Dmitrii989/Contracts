export default function Home() {
  return (
    <main
      style={{
        padding: 24,
        maxWidth: 900,
        margin: "0 auto",
      }}
    >
      <h1 style={{ fontSize: 36, marginBottom: 20 }}>
        Contracts CRM
      </h1>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 16,
        }}
      >
        <a href="/contracts" style={card}>
          <h2>Договоры</h2>
          <p>Создание, список, DOCX и PDF</p>
        </a>

        <a href="/properties" style={card}>
          <h2>Объекты</h2>
          <p>Квартиры, помещения, адреса</p>
        </a>

        <a href="/tenants" style={card}>
          <h2>Арендаторы</h2>
          <p>Физлица</p>
        </a>

        <a href="/companies" style={card}>
          <h2>Компании</h2>
          <p>Юрлица и ИП</p>
        </a>
      </div>
    </main>
  );
}

const card: React.CSSProperties = {
  display: "block",
  padding: 20,
  borderRadius: 16,
  border: "1px solid #e5e7eb",
  textDecoration: "none",
  color: "#111827",
  background: "white",
  boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
};