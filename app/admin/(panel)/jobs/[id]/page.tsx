import JobEditor from "@/app/admin/components/JobEditor";
export default function Page({ params }: { params: { id: string } }) {
  return <JobEditor itemId={params.id} />;
}
