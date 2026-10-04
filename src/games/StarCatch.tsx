import TargetGame from "./TargetGame";
export default function StarCatch(props: {
  record: number;
  onRecord: (n: number) => void;
}) {
  return <TargetGame {...props} kind="casual" />;
}
