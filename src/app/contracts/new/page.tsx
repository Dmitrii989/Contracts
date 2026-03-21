import ContractForm from "@/components/contracts/ContractForm";
import { prisma } from "@/lib/prisma";

type PageProps = {
  searchParams: Promise<{ copyFrom?: string }>;
};

function toYmd(value: Date | string | null | undefined) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export default async function NewContractPage({ searchParams }: PageProps) {
  const { copyFrom } = await searchParams;

  let initialData = undefined;
  const todayYmd = toYmd(new Date());

  if (copyFrom) {
    const contract = await prisma.contract.findUnique({
      where: { id: copyFrom },
    });

    if (contract) {
      initialData = {
        type: contract.type,
        propertyId: contract.propertyId ?? "",

        // даты проживания копируем из исходного договора
        checkIn: toYmd(contract.checkIn),
        checkOut: toYmd(contract.checkOut),

        // служебные даты ставим на сегодня
        contractDate: todayYmd,
        actDate: todayYmd,
        invoiceDate: todayYmd,

        pricePerDayRub: contract.pricePerDayRub ?? 0,
        priceRub: contract.priceRub ?? 0,

        tenantId: contract.tenantId ?? "",
        tenantName: contract.tenantName ?? "",
        tenantPassport: contract.tenantPassport ?? "",
        tenantAddress: contract.tenantAddress ?? "",

        companyId: contract.companyId ?? "",
        companyKind: contract.companyKind ?? "COMPANY",

        companyName: contract.companyName ?? "",
        companyShortName: contract.companyShortName ?? "",
        companyInn: contract.companyInn ?? "",
        companyKpp: contract.companyKpp ?? "",
        companyOgrn: contract.companyOgrn ?? "",
        companyAddress: contract.companyAddress ?? "",
        companyPostalAddress: contract.companyPostalAddress ?? "",
        companyEmail: contract.companyEmail ?? "",
        companyPhone: contract.companyPhone ?? "",
        companyBankName: contract.companyBankName ?? "",
        companyBankBik: contract.companyBankBik ?? "",
        companyBankAccount: contract.companyBankAccount ?? "",
        companyCorrespondentAccount:
          contract.companyCorrespondentAccount ?? "",

        companyDirectorName: contract.companyDirectorName ?? "",
        companyDirectorPosition:
          contract.companyDirectorPosition ?? "Генеральный директор",
        companyDirectorGender: contract.companyDirectorGender ?? "MALE",
        companyDirectorPositionGenitive:
          contract.companyDirectorPositionGenitive ?? "",
        companyDirectorNameGenitive:
          contract.companyDirectorNameGenitive ?? "",
        companyBasis: contract.companyBasis ?? "Устава",

        companyGuestText: contract.companyGuestText ?? "",
      };
    }
  }

  return <ContractForm mode="create" initialData={initialData} />;
}