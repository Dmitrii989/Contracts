import { notFound } from "next/navigation";
import ContractForm from "@/components/contracts/ContractForm";
import { prisma } from "@/lib/prisma";

function toYmd(date: Date | null | undefined) {
  if (!date) return "";
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export default async function EditContractPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const contract = await prisma.contract.findUnique({
    where: { id },
  });

  if (!contract) {
    notFound();
  }

  return (
    <ContractForm
      mode="edit"
      contractId={contract.id}
      initialData={{
        type: contract.type,
        propertyId: contract.propertyId ?? "",

        tenantId: contract.tenantId ?? "",
        companyId: contract.companyId ?? "",

        checkIn: toYmd(contract.checkIn),
        checkOut: toYmd(contract.checkOut),
        contractDate: toYmd(contract.contractDate ?? contract.createdAt),
        actDate: toYmd(contract.actDate ?? contract.contractDate ?? contract.createdAt),
        invoiceDate: toYmd(contract.invoiceDate ?? contract.contractDate ?? contract.createdAt),

        pricePerDayRub: contract.pricePerDayRub,
        priceRub: contract.priceRub,

        tenantName: contract.tenantName ?? "",
        tenantPassport: contract.tenantPassport ?? "",
        tenantAddress: contract.tenantAddress ?? "",

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
        companyCorrespondentAccount: contract.companyCorrespondentAccount ?? "",
        companyDirectorName: contract.companyDirectorName ?? "",
        companyDirectorPosition: contract.companyDirectorPosition ?? "Генеральный директор",
        companyDirectorGender: contract.companyDirectorGender ?? "MALE",
        companyDirectorPositionGenitive:
          contract.companyDirectorPositionGenitive ?? "",
        companyDirectorNameGenitive: contract.companyDirectorNameGenitive ?? "",
        companyBasis: contract.companyBasis ?? "Устава",
        companyGuestText: contract.companyGuestText ?? "",
      }}
    />
  );
}