import { FeaturePlaceholder } from "@/components/feature-placeholder";

export default function NewInvoicePage() {
  return (
    <FeaturePlaceholder
      title="Create Invoice"
      description="Invoice creation is not live yet in this build."
      backHref="/invoices"
      backLabel="Back to invoices"
    />
  );
}
