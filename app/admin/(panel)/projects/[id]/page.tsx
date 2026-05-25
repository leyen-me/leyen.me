import ProjectEditor from "@/app/admin/components/ProjectEditor";
export default function Page({ params }: { params: { id: string } }) {
  return <ProjectEditor itemId={params.id} />;
}
