import ArcadeRun from "./ArcadeRun";
export default function Rally(props: {
  record: number;
  onRecord: (n: number) => void;
}) {
  return <ArcadeRun {...props} kind="rally" />;
}
