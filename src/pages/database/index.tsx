import { INSTRUCTION_ANCHOR_ID, UseCaseWrapper } from '../../client/components/common/UseCaseWrapper/UseCaseWrapper';
import { NextPage } from 'next';
import { USE_CASES } from '../../client/components/common/content';
import { CustomPageProps } from '../_app';
import styles from './database.module.scss';

import { useMutation, useQuery } from 'react-query';
import Button from '../../client/components/common/Button/Button';
import stylesFW from '../../client/bot-firewall/botFirewallComponents.module.scss';
import { BlockIpPayload, BlockIpResponse } from '../api/bot-firewall/block-ip';
import { VisitorQueryContext, useVisitorData } from '@fingerprintjs/fingerprintjs-pro-react';
import { OptionsObject as SnackbarOptions, enqueueSnackbar } from 'notistack';
import ChevronIcon from '../../client/img/chevronBlack.svg';
import Image from 'next/image';
import Link from 'next/link';
import { BotTypeInfo, BotVisitAction, InstructionPrompt } from '../../client/bot-firewall/botFirewallComponents';
import { wait } from '../../shared/timeUtils';
import { Spinner } from '../../client/components/common/Spinner/Spinner';
import {useState} from "react";

const DEFAULT_DISPLAYED_VISITS = 10;
const DISPLAYED_VISITS_INCREMENT = 10;
const BOT_VISITS_FETCH_LIMIT = 200;

/** Format date */
const formatDate = (date: string) => {
  const d = new Date(date);
  return `${d.toLocaleDateString('en-Us', {
    month: 'short',
    day: 'numeric',
  })} ${d.toLocaleTimeString('gb', { hour: '2-digit', minute: '2-digit' })}`;
};

const snackbarOptions: SnackbarOptions = {
  autoHideDuration: 3000,
  anchorOrigin: { horizontal: 'right', vertical: 'bottom' },
};

/** Query to retrieve all bot visits */
const useBotVisits = () => {
  const {
    data: dbEntries,
    refetch: refetchBotVisits,
    isFetching: isFetchingBotVisits,
    status: botVisitsQueryStatus,
  } = useQuery({
    queryKey: ['get db entries'],
    queryFn: (): Promise<any[]> => {
      return fetch(`/api/db/all`).then((res) => res.json());
    },
  });
  return { dbEntries, refetchBotVisits, isFetchingBotVisits, botVisitsQueryStatus };
};

/** Query to retrieve blocked IP addresses */
const useBlockedIps = () => {
  const {
    data: blockedIps,
    refetch: refetchBlockedIps,
    isFetching: isFetchingBlockedIps,
  } = useQuery({
    queryKey: ['get blocked IPs'],
    queryFn: (): Promise<string[]> => {
      return fetch('/api/bot-firewall/get-blocked-ips').then((res) => res.json());
    },
  });
  return { blockedIps, refetchBlockedIps, isFetchingBlockedIps };
};

/** Mutation (POST request) to block/unblock an IP */
const useBlockUnblockIpAddress = (
  getVisitorData: VisitorQueryContext<true>['getData'],
  refetchBlockedIps: () => void,
) => {
  const { mutate: blockIp, isLoading: isLoadingBlockIp } = useMutation({
    mutationKey: ['block IP'],
    mutationFn: async ({ ip, blocked }: Omit<BlockIpPayload, 'requestId'>) => {
      const { requestId } = await getVisitorData({ ignoreCache: true });
      const response = await fetch('/api/bot-firewall/block-ip', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ip, blocked, requestId } satisfies BlockIpPayload),
      });
      if (!response.ok) {
        throw new Error('Failed to update firewall: ' + (await response.json()).message ?? response.statusText);
      }
      return await response.json();
    },
    onSuccess: async (data: BlockIpResponse) => {
      refetchBlockedIps();
      enqueueSnackbar(
        <div>
          IP address <b>&nbsp;{data.data?.ip}&nbsp;</b> was{' '}
          <b>&nbsp;{data.data?.blocked ? 'blocked' : 'unblocked'}&nbsp;</b> in the application firewall.{' '}
        </div>,
        { ...snackbarOptions, variant: 'success' },
      );
    },
    onError: (error: Error) => {
      enqueueSnackbar(error.message, {
        ...snackbarOptions,
        variant: 'error',
      });
    },
  });

  return { blockIp, isLoadingBlockIp };
};

/**
 * Bot Firewall Page Component
 */
export const DBView: NextPage<CustomPageProps> = ({ embed }) => {
  // Get visitor data from Fingerprint (just used for the visitor's IP address)
  const {
    getData: getVisitorData,
    data: visitorData,
    isLoading: isLoadingVisitorData,
  } = useVisitorData({
    extendedResult: true,
  });


  // Get a list of bot visits
  const { dbEntries, refetchBotVisits, isFetchingBotVisits: isLoadingBotVisits, botVisitsQueryStatus } = useBotVisits();

  const [isArtificiallyLoading, setIsArtificiallyLoading] = useState(false);
  const isLoading = isLoadingVisitorData || isLoadingBotVisits || isArtificiallyLoading;

  let content = <Spinner size='40px' thickness={3} />;

  if (dbEntries?.data) {
    const orders = dbEntries.data.orders;
    const paymentAttempts = dbEntries.data.paymentAttempts;
    const couponClaims = dbEntries.data.couponClaims;

    content = (
        <>
          <h2 className={stylesFW.title}>
            Orders Table
          </h2>
          <table className={stylesFW.botVisitsTable}>
            <thead>
            <tr>
              <th>
                Timestamp <Image src={ChevronIcon} alt=''/>
              </th>
              <th>Visitor ID</th>
              <th>
                Product
              </th>
            </tr>
            </thead>
            <tbody>
            {orders.map((order) => {
              return (
                  <tr key={order?.visitorId}>
                    <td>{formatDate(order?.timestamp)}</td>
                    <td>{order?.visitorId}</td>
                    <td>
                      {order?.product} ({order.product})
                    </td>
                  </tr>
              );
            })}
            </tbody>
          </table>

          <br/><br/>
          <h2 className={stylesFW.title}>
            Coupon Claim Table
          </h2>
          <table className={stylesFW.botVisitsTable}>
            <thead>
            <tr>
              <th>
                Timestamp <Image src={ChevronIcon} alt=''/>
              </th>
              <th>Visitor ID</th>
              <th>
                Coupon Code
              </th>
            </tr>
            </thead>
            <tbody>
            {couponClaims.map((couponClaim) => {
              return (
                  <tr key={couponClaim?.visitorId}>
                    <td>{formatDate(couponClaim?.timestamp)}</td>
                    <td>{couponClaim?.visitorId}</td>
                    <td>
                      {couponClaim?.couponCode} ({couponClaim.couponCode})
                    </td>
                  </tr>
              );
            })}
            </tbody>
          </table>

          <br/><br/>
          <h2 className={stylesFW.title}>
            Payment Attempts
          </h2>
          <table className={stylesFW.botVisitsTable}>
            <thead>
            <tr>
              <th>
                Timestamp <Image src={ChevronIcon} alt=''/>
              </th>
              <th>Visitor ID</th>
              <th>
                Result
              </th>
              <th>
                Is Charge Back
              </th>
              <th>
                Used Stolen Card
              </th>
            </tr>
            </thead>
            <tbody>
            {paymentAttempts.map((paymentAttempt) => {
              return (
                  <tr key={paymentAttempt?.visitorId}>
                    <td>{formatDate(paymentAttempt?.timestamp)}</td>
                    <td>{paymentAttempt?.visitorId}</td>
                    <td>{paymentAttempt?.checkResult}</td>
                    <td>{paymentAttempt.isChargebacked ? 'True' : 'False'}</td>
                    <td>{paymentAttempt.usedStolenCard ? 'True' : 'False'}</td>
                  </tr>
              );
            })}
            </tbody>
          </table>
        </>
    );
  }

  return (
      <>
        <div>
          <div className={styles.container}>
            <div className={stylesFW.header}>
              <h2 className={stylesFW.title}>
                Showing Backend Database Entries
              </h2>
              <Button
                  size='small'
                  outlined
                  onClick={async () => {
                    // Loading bot visits is usually really fast, use a minimum loading time to prevent UI flashing
                    setIsArtificiallyLoading(true);
                    await Promise.all([refetchBotVisits(), wait(500)]);
                    setIsArtificiallyLoading(false);
                  }}
                  className={stylesFW.reloadButton}
                  disabled={isLoading}
              >
                {isLoading ? 'Loading ⏳' : 'Refresh'}
              </Button>
            </div>

            {content}
          </div>
      </div>
    </>
  );
};

export default DBView;
