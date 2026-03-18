import Link from "next/link";
import { prisma } from "@/lib/prisma";

function fmtDate(date: Date | null | undefined) {
  if (!date) return "—";
  return date.toLocaleDateString("ru-RU");
}

export default async function CompaniesPage() {
  const companies = await prisma.company.findMany({
    orderBy: { name: "asc" },
  });

  return (
    <main style={{ padding: 24, maxWidth: 1200, margin: "0 auto" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 12,
          flexWrap: "wrap",
          marginBottom: 18,
        }}
      >
        <div>
          <h1 style={{ margin: 0, fontSize: 34 }}>Юрлица</h1>
          <div style={{ marginTop: 6, fontSize: 13, opacity: 0.7 }}>
            Справочник контрагентов для договоров по юрлицу
          </div>
        </div>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <Link
            href="/contracts"
            style={{
              padding: "10px 14px",
              border: "1px solid #ddd",
              borderRadius: 10,
              textDecoration: "none",
              fontWeight: 700,
              background: "white",
              color: "#111827",
            }}
          >
            ← К договорам
          </Link>

          <Link
            href="/companies/new"
            style={{
              padding: "10px 14px",
              border: "1px solid #111827",
              borderRadius: 10,
              textDecoration: "none",
              fontWeight: 700,
              background: "#111827",
              color: "white",
            }}
          >
            + Новое юрлицо
          </Link>
        </div>
      </div>

      <section
        style={{
          border: "1px solid #e5e7eb",
          borderRadius: 16,
          background: "white",
          boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
          overflow: "hidden",
        }}
      >
        {companies.length === 0 ? (
          <div style={{ padding: 20, fontSize: 14, opacity: 0.8 }}>
            Юрлиц пока нет.
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
              <thead>
                <tr style={{ background: "#f9fafb", textAlign: "left" }}>
                  <th style={{ padding: 12, borderBottom: "1px solid #e5e7eb" }}>Наименование</th>
                  <th style={{ padding: 12, borderBottom: "1px solid #e5e7eb" }}>ИНН</th>
                  <th style={{ padding: 12, borderBottom: "1px solid #e5e7eb" }}>КПП</th>
                  <th style={{ padding: 12, borderBottom: "1px solid #e5e7eb" }}>ОГРН</th>
                  <th style={{ padding: 12, borderBottom: "1px solid #e5e7eb" }}>Подписант</th>
                  <th style={{ padding: 12, borderBottom: "1px solid #e5e7eb" }}>Создано</th>
                  <th style={{ padding: 12, borderBottom: "1px solid #e5e7eb", width: 160 }}>
                    Действия
                  </th>
                </tr>
              </thead>
              <tbody>
                {companies.map((company) => (
                  <tr key={company.id}>
                    <td style={{ padding: 12, borderBottom: "1px solid #f1f5f9" }}>
                      <div style={{ fontWeight: 700 }}>{company.name}</div>
                      {company.shortName ? (
                        <div style={{ marginTop: 4, fontSize: 12, opacity: 0.7 }}>
                          {company.shortName}
                        </div>
                      ) : null}
                    </td>

                    <td style={{ padding: 12, borderBottom: "1px solid #f1f5f9" }}>
                      {company.inn || "—"}
                    </td>

                    <td style={{ padding: 12, borderBottom: "1px solid #f1f5f9" }}>
                      {company.kpp || "—"}
                    </td>

                    <td style={{ padding: 12, borderBottom: "1px solid #f1f5f9" }}>
                      {company.ogrn || "—"}
                    </td>

                    <td style={{ padding: 12, borderBottom: "1px solid #f1f5f9" }}>
                      {[company.directorPosition, company.directorName].filter(Boolean).join(" ") || "—"}
                    </td>

                    <td style={{ padding: 12, borderBottom: "1px solid #f1f5f9" }}>
                      {fmtDate(company.createdAt)}
                    </td>

                    <td style={{ padding: 12, borderBottom: "1px solid #f1f5f9" }}>
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        <Link
                          href={`/companies/${company.id}/edit`}
                          style={{
                            padding: "8px 10px",
                            border: "1px solid #ddd",
                            borderRadius: 8,
                            textDecoration: "none",
                            fontWeight: 700,
                            background: "white",
                            color: "#111827",
                          }}
                        >
                          Редактировать
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}