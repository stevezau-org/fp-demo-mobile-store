import {Severity, isValidPostRequest} from '../../../server/server';
import {LoginAttemptDbModel} from '../credential-stuffing/authenticate';
import {PaymentAttemptDbModel, OrdersDbModel} from '../payment-fraud/place-order';
import {
    UserCartItemDbModel,
    UserPreferencesDbModel,
    UserSearchHistoryDbModel,
} from '../../../server/personalization/database';
import {LoanRequestDbModel} from '../../../server/loan-risk/database';
import {ArticleViewDbModel} from '../../../server/paywall/database';
import {CouponClaimDbModel} from '../../../server/coupon-fraud/database';
import {getAndValidateFingerprintResult} from '../../../server/checks';
import {NextApiRequest, NextApiResponse} from 'next';
import {deleteBlockedIp} from '../../../server/botd-firewall/blockedIpsDatabase';
import {syncFirewallRuleset} from '../../../server/botd-firewall/cloudflareApiHelper';


export default async function handler(req: NextApiRequest, res: NextApiResponse<any>) {

    const orders = await OrdersDbModel.findAll();
    const paymentAttempts = await PaymentAttemptDbModel.findAll();
    const couponClaims = await CouponClaimDbModel.findAll();

    res.status(200).json({
        data: {
            orders,
            paymentAttempts,
            couponClaims
        },
    });
}