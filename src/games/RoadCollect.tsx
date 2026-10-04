import ArcadeRun from "./ArcadeRun";
export default function RoadCollect(props: {
  record: number;
  onRecord: (n: number) => void;
}) {
  return <ArcadeRun {...props} kind="coleta" />;
}
