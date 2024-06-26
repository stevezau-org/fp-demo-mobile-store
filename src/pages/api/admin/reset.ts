import { Severity, isValidPostRequest } from '../../../server/server';
import { LoginAttemptDbModel } from '../credential-stuffing/authenticate';
import { PaymentAttemptDbModel, OrdersDbModel } from '../payment-fraud/place-order';
import {
  UserCartItemDbModel,
  UserPreferencesDbModel,
  UserSearchHistoryDbModel,
} from '../../../server/personalization/database';
import { LoanRequestDbModel } from '../../../server/loan-risk/database';
import { ArticleViewDbModel } from '../../../server/paywall/database';
import { CouponClaimDbModel } from '../../../server/coupon-fraud/database';
import { getAndValidateFingerprintResult } from '../../../server/checks';
import { NextApiRequest, NextApiResponse } from 'next';
import { deleteBlockedIp } from '../../../server/botd-firewall/blockedIpsDatabase';
import { syncFirewallRuleset } from '../../../server/botd-firewall/cloudflareApiHelper';

export type ResetResponse = {
  message: string;
  severity?: Severity;
  result?: ResetResult;
};

export type ResetRequest = {
  requestId: string;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResetResponse>) {
  // This API route accepts only POST requests.
  const reqValidation = isValidPostRequest(req);
  if (!reqValidation.okay) {
    res.status(405).send({ severity: 'error', message: reqValidation.error });
    return;
  }

  const { requestId } = req.body as ResetRequest;

  // Get the full Identification result from Fingerprint Server API and validate its authenticity
  const fingerprintResult = await getAndValidateFingerprintResult(requestId, req);
  if (!fingerprintResult.okay) {
    res.status(403).send({ severity: 'error', message: fingerprintResult.error });
    return;
  }

  const { visitorId, ip } = fingerprintResult.data.products?.identification?.data ?? {};
  if (!visitorId) {
    res.status(403).send({ severity: 'error', message: 'Visitor ID not found.' });
    return;
  }

  const deleteResult = await deleteVisitorData(visitorId, ip ?? '');

  res.status(200).json({
    message: 'Visitor data deleted successfully.',
    severity: 'success',
    result: deleteResult,
  });
}

const deleteVisitorData = async (visitorId: string, ip: string) => {
  const options = {
    where: {},
    truncate: true
  };

  return {
    deletedOrders: await tryToDestroy(() => OrdersDbModel.destroy(options)),
    deletedPaymentAttempts: await tryToDestroy(() => PaymentAttemptDbModel.destroy(options)),
    deletedCouponsClaims: await tryToDestroy(() => CouponClaimDbModel.destroy(options)),
    deletedLoginAttempts: await tryToDestroy(() => LoginAttemptDbModel.destroy(options)),
    deletedPersonalizationRecords: await tryToDestroy(async () => {
      const deletedCartItemsCount = await UserCartItemDbModel.destroy(options);
      const deletedUserPreferencesCount = await UserPreferencesDbModel.destroy(options);
      const deletedUserSearchHistoryCount = await UserSearchHistoryDbModel.destroy(options);
      return deletedCartItemsCount + deletedUserPreferencesCount + deletedUserSearchHistoryCount;
    }),
    deletedLoanRequests: await tryToDestroy(() => LoanRequestDbModel.destroy(options)),
    deletedArticleViews: await tryToDestroy(() => ArticleViewDbModel.destroy(options)),
    deletedBlockedIps: await tryToDestroy(async () => {
      const deletedIpCount = await deleteBlockedIp(ip);
      await syncFirewallRuleset();
      return deletedIpCount;
    }),
  };
};

type ResetResult = Awaited<ReturnType<typeof deleteVisitorData>>;

const tryToDestroy = async (callback: () => Promise<number>) => {
  try {
    return await callback();
  } catch (err) {
    console.error(err);
    return 0;
  }
};
