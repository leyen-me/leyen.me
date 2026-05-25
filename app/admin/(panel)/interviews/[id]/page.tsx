import InterviewEditor from "@/app/admin/components/InterviewEditor";
export default function Page({ params }: { params: { id: string } }) {
  return <InterviewEditor itemId={params.id} />;
}
