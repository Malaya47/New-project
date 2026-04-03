import BagScanPage from "../../../components/bag-scan-page";

export default function BagRoute({ params }) {
  return <BagScanPage code={params.code} />;
}
