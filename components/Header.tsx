import { ConnectButton } from "web3uikit";
import Link from "next/link";
export default function Header() {
  return (
    <nav className="p-5 border-b-2 flex flex-row justify-between items-center">
      <Link href="/">
        <h1 className="py-4 px-4 font-bold text-3xl">Yield Aggregator</h1>
      </Link>
      <Link href="/" className="mr-4 p-6 font-bold">
        Yield Aggregator for Aave V3 and Compound V3
      </Link>
      <div className="flex flex-row items-center">
        <ConnectButton moralisAuth={false} />
      </div>
    </nav>
  );
}
