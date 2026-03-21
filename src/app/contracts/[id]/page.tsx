"use client";

import { useEffect, useState } from "react";
import TableCard from "@/components/ui/TableCard";
import {
  pageMainStyle,
  pageHeaderStyle,
  pageHeaderActionsStyle,
  secondaryButtonStyle,
  primaryButtonStyle,
} from "@/components/ui/styles";

type ContractDetails = {
  id: string;
  number: string;
  type: "PERSON" | "COMPANY";

  propertyId?: string | null;
  propertyCode: string;
  propertyName?: string | null;
  propertyAddress: string | null;

  checkIn: string;
  checkOut: string;
  contractDate?: string | null;
  actDate?: string | null;
  invoiceDate?: string | null;

  pricePerDayRub: number | null;
  priceRub: number;

  tenantId: string | null;
  tenantName: string | null;
  tenantPassport: string | null;
  tenantBirthDate: string | null;
  tenantPassportIssuedBy: string | null;
  tenantPassportCode: string | null;
  tenantPassportIssuedAt: string | null;
  tenantAddress: string | null;

  companyId?: string | null;
  companyKind?: "COMPANY" | "IP" | null;
  companyName?: string | null;
  companyShortName?: string | null;
  companyInn?: string | null;
  companyKpp?: string | null;
  companyOgrn?: string | null;
  companyAddress?: string | null;
  companyPostalAddress?: string | null;
  companyEmail?: string | null;
  companyPhone?: string | null;
  companyBankName?: string | null;
  companyBankBik?: string | null;
  companyBankAccount?: string | null;
  companyCorrespondentAccount?: string | null;
  companyDirectorName?: string | null;
  companyDirectorPosition?: string | null;
  companyDirectorGender?: "MALE" | "FEMALE" | null;
  companyDirectorPositionGenitive?: string | null;
  companyDirectorNameGenitive?: string | null;
  companyBasis?: string | null;
  companyGuestText?: string | null;

  createdAt: string;
};

function fmtDate(iso?: string | null) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("ru-RU");
}

function money(n?: number | null) {
  const v = Math.max(0, Math.floor(Number(n) || 0));
  return v.toLocaleString("ru-RU");
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "220px 1fr",
        gap: 12,
        padding: "10px 0",
        borderTop: "1px solid #eee",
      }}
    >
      <div style={{ opacity: 0.7 }}>{label}</div>
      <div>{value || "—"}</div>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section
      style={{
        border: "1px solid #e5e7eb",
        borderRadius: 16,
        padding: 16,
        background: "white",
        boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
      }}
    >
      <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 8 }}>{title}</div>
      {children}
    </section>
  );
}

export default function ContractPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [contractId, setContractId] = useState("");
  const [item, setItem] = useState<ContractDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setErr("");

        const p = await params;
        const id = String(p?.id ?? "").trim();

        if (!id) {
          setErr("Некорректный id договора.");
          setItem(null);
          setLoading(false);
          return;
        }

        setContractId(id);

        const r = await fetch(`/api/contracts/${id}`, { cache: "no-store" });
        if (!r.ok) {
          const t = await r.text();
          throw new Error(`HTTP ${r.status}: ${t}`);
        }

        const data = await r.json();
        setItem(data);
      } catch (e: unknown) {
        setErr(e instanceof Error ? e.message : String(e));
        setItem(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [params]);

  const companyInnKppText =
    item?.companyKind === "IP"
      ? item.companyInn || "—"
      : [item?.companyInn, item?.companyKpp].filter(Boolean).join(" / ") || "—";

  const companyOgrnLabel = item?.companyKind === "IP" ? "ОГРНИП" : "ОГРН";

  return (
    <main style={pageMainStyle}>
      <div style={pageHeaderStyle}>
        <div>
          <h1 style={{ margin: 0, fontSize: 34 }}>
            Договор {item?.number ? `№ ${item.number}` : ""}
          </h1>
          <div style={{ marginTop: 6, fontSize: 13, opacity: 0.7 }}>
            Просмотр карточки договора
          </div>
        </div>

        <div style={pageHeaderActionsStyle}>
          <a href="/contracts" style={secondaryButtonStyle}>
            Договоры
          </a>

          {contractId ? (
            <>
              <a href={`/contracts/${contractId}/edit`} style={primaryButtonStyle}>
                Редактировать
              </a>

              <a
                href={`/contracts/new?copyFrom=${contractId}`}
                style={secondaryButtonStyle}
              >
                Копировать
              </a>

              <a
                href={`/api/contracts/${contractId}/docx`}
                target="_blank"
                rel="noreferrer"
                style={secondaryButtonStyle}
              >
                DOCX
              </a>

              <a
                href={`/api/contracts/${contractId}/pdf`}
                target="_blank"
                rel="noreferrer"
                style={secondaryButtonStyle}
              >
                PDF
              </a>

              <a
                href={`/api/contracts/${contractId}/act`}
                target="_blank"
                rel="noreferrer"
                style={secondaryButtonStyle}
              >
                Акт
              </a>

              <a
                href={`/api/contracts/${contractId}/invoice`}
                target="_blank"
                rel="noreferrer"
                style={secondaryButtonStyle}
              >
                Счёт
              </a>
            </>
          ) : null}
        </div>
      </div>

      {loading ? (
        <div style={{ marginTop: 16 }}>Загрузка...</div>
      ) : err ? (
        <div style={{ marginTop: 16, color: "crimson" }}>Ошибка: {err}</div>
      ) : !item ? (
        <div style={{ marginTop: 16 }}>Договор не найден.</div>
      ) : (
        <>
          <div style={{ marginTop: 16 }}>
            <TableCard>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1.2fr 1fr 1fr 1fr",
                  gap: 0,
                  background: "#f9fafb",
                  padding: "10px 12px",
                  fontWeight: 700,
                }}
              >
                <div>Тип</div>
                <div>Заезд</div>
                <div>Выезд</div>
                <div>Сумма</div>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1.2fr 1fr 1fr 1fr",
                  gap: 0,
                  padding: "12px",
                  alignItems: "center",
                }}
              >
                <div>{item.type === "PERSON" ? "Физлицо" : "Юрлицо"}</div>
                <div>{fmtDate(item.checkIn)}</div>
                <div>{fmtDate(item.checkOut)}</div>
                <div style={{ fontWeight: 800 }}>{money(item.priceRub)} ₽</div>
              </div>
            </TableCard>
          </div>

          <div style={{ marginTop: 18, display: "grid", gap: 16 }}>
            <Card title="Основное">
              <Row label="Номер" value={item.number} />
              <Row label="Тип" value={item.type === "PERSON" ? "Физлицо" : "Юрлицо"} />
              <Row label="Дата договора" value={fmtDate(item.contractDate)} />
              <Row label="Дата акта" value={fmtDate(item.actDate)} />
              <Row label="Дата счёта" value={fmtDate(item.invoiceDate)} />
              <Row label="Дата создания" value={fmtDate(item.createdAt)} />
            </Card>

            <Card title="Объект">
              <Row label="Код объекта" value={item.propertyCode} />
              <Row label="Наименование" value={item.propertyName} />
              <Row label="Адрес" value={item.propertyAddress} />
            </Card>

            <Card title="Срок и сумма">
              <Row label="Заезд" value={fmtDate(item.checkIn)} />
              <Row label="Выезд" value={fmtDate(item.checkOut)} />
              <Row
                label="Цена за сутки"
                value={item.pricePerDayRub ? `${money(item.pricePerDayRub)} ₽` : "—"}
              />
              <Row label="Итоговая сумма" value={`${money(item.priceRub)} ₽`} />
            </Card>

            {item.type === "PERSON" ? (
              <Card title="Арендатор">
                <Row label="ФИО" value={item.tenantName} />
                <Row label="Дата рождения" value={fmtDate(item.tenantBirthDate)} />
                <Row label="Паспорт" value={item.tenantPassport} />
                <Row label="Кем выдан" value={item.tenantPassportIssuedBy} />
                <Row label="Код подразделения" value={item.tenantPassportCode} />
                <Row label="Дата выдачи" value={fmtDate(item.tenantPassportIssuedAt)} />
                <Row label="Адрес регистрации" value={item.tenantAddress} />
              </Card>
            ) : (
              <>
                <Card title="Компания">
                  <Row label="Тип контрагента" value={item.companyKind === "IP" ? "ИП" : "Юрлицо"} />
                  <Row label="Полное наименование" value={item.companyName} />
                  <Row label="Краткое наименование" value={item.companyShortName} />
                  <Row
                    label={item.companyKind === "IP" ? "ИНН" : "ИНН / КПП"}
                    value={companyInnKppText}
                  />
                  <Row label={companyOgrnLabel} value={item.companyOgrn} />
                  <Row label="Юридический адрес" value={item.companyAddress} />
                  <Row label="Почтовый адрес" value={item.companyPostalAddress} />
                  <Row label="Телефон" value={item.companyPhone} />
                  <Row label="Email" value={item.companyEmail} />
                </Card>

                <Card title="Подписант">
                  <Row label="ФИО" value={item.companyDirectorName} />
                  <Row label="Должность" value={item.companyDirectorPosition} />
                  <Row
                    label="Пол"
                    value={
                      item.companyDirectorGender === "FEMALE"
                        ? "Женский"
                        : item.companyDirectorGender === "MALE"
                          ? "Мужской"
                          : "—"
                    }
                  />
                  <Row label="Основание полномочий" value={item.companyBasis} />
                </Card>

                <Card title="Банковские реквизиты">
                  <Row label="Банк" value={item.companyBankName} />
                  <Row label="БИК" value={item.companyBankBik} />
                  <Row label="Расчётный счёт" value={item.companyBankAccount} />
                  <Row
                    label="Корреспондентский счёт"
                    value={item.companyCorrespondentAccount}
                  />
                </Card>

                <Card title="Работники для проживания">
                  <Row label="Текст" value={item.companyGuestText} />
                </Card>
              </>
            )}
          </div>
        </>
      )}
    </main>
  );
}