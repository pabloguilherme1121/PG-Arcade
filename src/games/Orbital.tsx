import ArcadeRun from "./ArcadeRun";
export default function Orbital(props: {
  record: number;
  onRecord: (n: number) => void;
}) {
  return <ArcadeRun {...props} kind="orbital" />;
}
