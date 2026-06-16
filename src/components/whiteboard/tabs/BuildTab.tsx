import { ExecuteTab } from "./ExecuteTab";
import type { WhiteboardTabProps } from "./types";

export function BuildTab(props: WhiteboardTabProps) {
  return <ExecuteTab {...props} />;
}
