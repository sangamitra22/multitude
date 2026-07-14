import {
  Deploy,
  DeployHeader,
  ExecutableDeployItem,
  PublicKey,
  Timestamp,
  Duration,
} from "casper-js-sdk";
import type { NetworkConfig } from "./network";

// Payment for a native transfer on Casper: 100M motes = 0.1 CSPR
const NATIVE_TRANSFER_PAYMENT = "100000000";

export interface BuildTransferArgs {
  fromPublicKeyHex: string;
  toPublicKeyHex: string;
  amountCspr: string;
  memoId?: string;
  network: NetworkConfig;
}

export function buildTransferDeployJson(args: BuildTransferArgs): object {
  const from = PublicKey.fromHex(args.fromPublicKeyHex);
  const to = PublicKey.fromHex(args.toPublicKeyHex);
  const amountMotes = BigInt(Math.floor(Number(args.amountCspr) * 1_000_000_000)).toString();
  const id = args.memoId && /^\d+$/.test(args.memoId) ? args.memoId : String(Date.now() % 1_000_000_000);

  const session = ExecutableDeployItem.newTransfer(amountMotes, to, undefined, id);
  const payment = ExecutableDeployItem.standardPayment(NATIVE_TRANSFER_PAYMENT);

  const header = new DeployHeader(
    args.network.chainName,
    [],
    1,
    new Timestamp(new Date()),
    new Duration(30 * 60 * 1000), // 30 min TTL
    from,
  );

  const deploy = Deploy.makeDeploy(header, payment, session);
  return Deploy.toJSON(deploy);
}
