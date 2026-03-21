import Link from "next/link";
import { prisma } from "@/lib/prisma";
import TableCard from "@/components/ui/TableCard";
import {
  pageMainStyle,
  pageHeaderStyle,
  pageHeaderActionsStyle,
  secondaryButtonStyle,
  primaryButtonStyle,
} from "@/components/ui/styles";

function fmtDate(date: Date | null | undefined) {
  if (!date) return "—";
  return date.toLocaleDateString("ru-RU");
}

export default async function CompaniesPage() {
  const companies = await prisma.company.findMany({
    orderBy: { name: "asc" },
  });

  return (
    <main style={pageMainStyle}>
      <div style={{ ...pageHeaderStyle, marginBottom: 18 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 34 }}>Компании</h1>
          <div style={{ marginTop: 6, fontSize: 13, opacity: 0.7 }}>
            Справочник контрагентов для договоров по юрлицу
          </div>
        </div>

        <div style={pageHeaderActionsStyle}>
          <Link href="/contracts" style={secondaryButtonStyle}>
            Договоры
          </Link>

          <Link href="/companies/new" style={primaryButtonStyle}>
            + Новая компания
          </Link>
        </div>
      </div>

      <TableCard>
        {companies.length === 0 ? (
          <div style={{ padding: 20, fontSize: 14, opacity: 0.8 }}>
            Компаний пока нет.
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: 14,
              }}
            >
              <thead>
                <tr style={{ background: "#f9fafb", textAlign: "left" }}>
                  <th style={{ padding: 12, borderBottom: "1px solid #e5e7eb" }}>
                    Наименование
                  </th>
                  <th style={{ padding: 12, borderBottom: "1px solid #e5e7eb" }}>
                    ИНН
                  </th>
                  <th style={{ padding: 12, borderBottom: "1px solid #e5e7eb" }}>
                    КПП
                  </th>
                  <th style={{ padding: 12, borderBottom: "1px solid #e5e7eb" }}>
                    ОГРН
                  </th>
                  <th style={{ padding: 12, borderBottom: "1px solid #e5e7eb" }}>
                    Подписант
                  </th>
                  <th style={{ padding: 12, borderBottom: "1px solid #e5e7eb" }}>
                    Создано
                  </th>
                  <th
                    style={{
                      padding: 12,
                      borderBottom: "1px solid #e5e7eb",
                      width: 170,
                    }}
                  >
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
                      {[company.directorPosition, company.directorName]
                        .filter(Boolean)
                        .join(" ") || "—"}
                    </td>

                    <td style={{ padding: 12, borderBottom: "1px solid #f1f5f9" }}>
                      {fmtDate(company.createdAt)}
                    </td>

                    <td style={{ padding: 12, borderBottom: "1px solid #f1f5f9" }}>
                      <div
                        style={{
                          display: "flex",
                          gap: 8,
                          flexWrap: "nowrap",
                          alignItems: "center",
                        }}
                      >
                        <Link
                          href={`/companies/${company.id}/edit`}
                          style={secondaryButtonStyle}
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
      </TableCard>
    </main>
  );
}