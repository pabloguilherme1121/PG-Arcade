import TargetGame from "./TargetGame";
export default function SpaceShooter(props: {
  record: number;
  onRecord: (n: number) => void;
}) {
  return <TargetGame {...props} kind="shoot" />;
}
