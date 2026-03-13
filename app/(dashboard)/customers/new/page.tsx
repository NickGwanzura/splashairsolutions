import { FeaturePlaceholder } from "@/components/feature-placeholder";

export default function NewCustomerPage() {
  return (
    <FeaturePlaceholder
      title="Add Customer"
      description="Customer creation is not live yet in this build."
      backHref="/customers"
      backLabel="Back to customers"
    />
  );
}
