import { WhiteboardShell } from "@/components/whiteboard/WhiteboardShell";

export default function OpportunityPage({ params }: { params: { id: string } }) {
  return <WhiteboardShell opportunityId={params.id} />;
}
