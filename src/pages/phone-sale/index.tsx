import {useState} from 'react';
import React from 'react';
import Button from '../../client/components/common/Button/Button';

import styles from './phone-sale.module.scss';
import formStyles from '../../styles/forms.module.scss';
import {Alert} from '../../client/components/common/Alert/Alert';
import {CustomPageProps} from '../_app';
import classNames from 'classnames';
import {Severity} from '../../server/checkResult';
import {useVisitorData} from '@fingerprintjs/fingerprintjs-pro-react';
import {TEST_IDS} from '../../client/testIDs';
import {useMutation} from "react-query";
import {CouponClaimPayload, CouponClaimResponse} from "../api/coupon-fraud/claim";

export default function Index({embed}: CustomPageProps) {
    const {getData} = useVisitorData(
        {ignoreCache: true},
        {
            immediate: false,
        },
    );

    // Default mocked card data
    const [cardNumber, setCardNumber] = useState('4242 4242 4242 4242');
    const [cardCvv, setCardCvv] = useState('123');
    const [cardExpiration, setCardExpiration] = useState('04/28');

    const [orderStatusMessage, setOrderStatusMessage] = useState();
    const [applyChargeback, setApplyChargeback] = useState(false);
    const [usingStolenCard, setUsingStolenCard] = useState(false);
    const [severity, setSeverity] = useState<Severity | undefined>();
    const [isWaitingForResponse, setIsWaitingForResponse] = useState(false);
    const [httpResponseStatus, setHttpResponseStatus] = useState<number | undefined>();

    const [airMaxCount, setAirMaxCount] = useState(1);
    const [allStarCount, setAllStarCount] = useState(1);

    const [couponCode, setCouponCode] = useState('');
    const [discount, setDiscount] = useState(0);


    const {getData: getVisitorData} = useVisitorData(
        {
            ignoreCache: true,
        },
        {immediate: false},
    );

    const {
        mutate: claimCoupon,
        isLoading,
        data: claimResponse,
    } = useMutation({
        mutationKey: ['request coupon claim'],
        mutationFn: async ({couponCode}: Omit<CouponClaimPayload, 'requestId'>) => {
            const {requestId} = await getVisitorData({ignoreCache: true});
            const response = await fetch('/api/coupon-fraud/claim', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({couponCode, requestId} satisfies CouponClaimPayload),
            });
            return await response.json();
        },
        onSuccess: (data: CouponClaimResponse) => {
            if (data.severity === 'success') {
                setDiscount(30);
            }
        },
    });

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setIsWaitingForResponse(true);

        const fpData = await getData();
        const {requestId, visitorId} = fpData;

        const orderData = {
            cardNumber,
            cardCvv,
            cardExpiration,
            applyChargeback,
            usingStolenCard,
            visitorId,
            requestId,
        };

        // Server-side handler for this route is located in api/payment-fraud/place-order.js file.
        const response = await fetch('/api/payment-fraud/place-order', {
            method: 'POST',
            body: JSON.stringify(orderData),
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
            },
        });

        const responseJson = await response.json();
        const responseStatus = response.status;
        setOrderStatusMessage(responseJson.message);
        setSeverity(responseJson.severity);
        setHttpResponseStatus(responseStatus);
        setIsWaitingForResponse(false);
    }

    return (
        <div>
            <br/>
            <div className={styles.notification}>
                Complete Your Purchase
            </div>
            <div className={styles.details}>
                <div className={styles.details__item}>
                    <div className={styles.item__image}>
                        <img className={styles.iphone}
                             src="https://www.apple.com/v/iphone/compare/k/images/overview/compare_iphoneXSmax_silver_large.jpg"
                             alt=""/>
                    </div>
                    <div className={styles.item__details}>
                        <div className={styles.item__title}>
                            Iphone 13 Pro - Limited Edition
                        </div>
                        <div className={styles.item__price}>
                            $ 1750
                        </div>
                        <div className={styles.item__quantity}>
                            Quantity: 1
                        </div>
                        <div className="item__description">
                            <ul className={styles.ul}>
                                <li>Super fast and power efficient</li>
                                <li>A lot of fast memory</li>
                                <li>High resolution camera</li>
                                <li>Smart tools for health and traveling and more</li>
                                <li>Share your games and achievements with your friends via Group Play</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
            <div className={styles.payment}>
                <div className={styles.payment__title}>
                    Payment Method
                </div>
                <div className={styles.payment__types}>
                    <div className={`${styles.payment__type} ${styles.payment__cc} ${styles.active}`} id='cc'>
                        <i className="icon icon-credit-card"></i>Credit Card
                    </div>
                    <div className={`${styles.payment__type} ${styles.payment__cc}`}>
                        <i className="icon icon-paypal"></i>Paypal
                    </div>
                    <div className={`${styles.payment__type} ${styles.payment__cc}`} id='paylater'>
                        <i className="icon icon-wallet"></i>Pay Later
                    </div>
                    <div className={`${styles.payment__type} ${styles.payment__cc}`}>
                        <i className="icon icon-note"></i>Invoice
                    </div>
                </div>
            </div>
            <div className={styles.checkout}>
                <div className={styles.formWrapper}>
                    <form onSubmit={handleSubmit} className={classNames(formStyles.useCaseForm, styles.paymentForm)}>
                        <label>Card Number</label>
                        <input
                            type='text'
                            name='cardNumber'
                            placeholder='Card Number'
                            defaultValue={cardNumber}
                            onChange={(e) => setCardNumber(e.target.value)}
                            required
                            data-testid={TEST_IDS.paymentFraud.cardNumber}
                        />

                        <div className={styles.ccInfoGroup}>
                            <div>
                                <label>Expiration</label>
                                <input
                                    type='text'
                                    placeholder='Expiration'
                                    defaultValue={cardExpiration}
                                    onChange={(e) => setCardExpiration(e.target.value)}
                                    required
                                    data-testid={TEST_IDS.paymentFraud.cardExpiration}
                                />
                            </div>

                            <div>
                                <label>CVV</label>
                                <input
                                    type='text'
                                    placeholder='CVV'
                                    defaultValue={cardCvv}
                                    onChange={(e) => setCardCvv(e.target.value)}
                                    required
                                    data-testid={TEST_IDS.paymentFraud.cardCvv}
                                />
                            </div>
                        </div>

                        <hr/>

                        <div className={styles.checkboxes}>
                            <label className={formStyles.checkboxLabel}>
                                <input
                                    type='checkbox'
                                    name='applyChargeback'
                                    onChange={(event) => setApplyChargeback(event.target.checked)}
                                    data-testid={TEST_IDS.paymentFraud.askForChargeback}
                                />
                                Ask for chargeback after purchase
                            </label>

                            <label className={formStyles.checkboxLabel}>
                                <input
                                    type='checkbox'
                                    name='usingStolenCard'
                                    onChange={(event) => {
                                        setUsingStolenCard(event.target.checked);
                                    }}
                                    data-testid={TEST_IDS.paymentFraud.usingStolenCard}
                                />
                                Flag this visitor using stolen card after purchase
                            </label>
                        </div>

                        {httpResponseStatus ?
                            <Alert severity={severity ?? 'warning'}>{orderStatusMessage}</Alert> : null}
                        <Button
                            disabled={isWaitingForResponse}
                            size='large'
                            type='submit'
                            data-testid={TEST_IDS.paymentFraud.submitPayment}
                        >
                            {isWaitingForResponse ? 'Hold on, doing magic...' : 'Place Order'}
                        </Button>
                    </form>
                </div>
                <div>
                    <div className={styles.innerWrapper}>
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                claimCoupon({couponCode});
                            }}
                            className={classNames(formStyles.useCaseForm, styles.couponFraudForm)}
                        >
                            <p>Do you have a coupon? Apply to get a discount!</p>
                            <div className={styles.couponInputContainer}>
                                <input
                                    type='text'
                                    placeholder='Enter a coupon (Promo3000 or BlackFriday)'
                                    onChange={(e) => setCouponCode(e.target.value)}
                                    required
                                    data-testid={TEST_IDS.couponFraud.couponCode}
                                />
                                <Button disabled={isLoading} size='medium'
                                        data-testid={TEST_IDS.couponFraud.submitCoupon}>
                                    {isLoading ? 'Processing...' : 'Apply'}
                                </Button>
                            </div>
                            {claimResponse?.message && !isLoading && (
                                <div>
                                    <Alert severity={claimResponse.severity}>{claimResponse.message}</Alert>
                                </div>
                            )}
                        </form>
                    </div>
                    <div className={styles.payment__shipping}>
                        <div className={styles.payment__title}>
                            <i className="icon icon-plane"></i> Shipping Information
                        </div>
                        <div className={styles.details__user}>
                            <div className="user__address">Shipping Address: 22 St, Pine Valley, California 43092
                                <br/>USA
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
