import React, { useState } from 'react'

import { getCheckoutUrl } from '../../../api/payment';

interface Props {
    username: string;
    tipAmount: number;
    stripeAccountId: string;
    message: string | null;
    isPrivate: boolean
}

const DonateButton: React.FC<Props> = (props: Props) => {

    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const handleCheckout = async () => {
        setError(null);
        setLoading(true);
        try {
            const response = await getCheckoutUrl({
                username: props.username, 
                payment_amount: props.tipAmount,
                message: props.message,
                isPrivate: props.isPrivate
            })
            window.location.href = response.url;

        } catch (err: any) {
            console.log(err)
            setError("Failed to checkout Please try again.");
        } finally {
            setLoading(false)
        }
    }

    return (
        <div>
            {error && <p style={{ color: "red", marginTop: "1rem" }}>{error}</p>}
            <button
                onClick={handleCheckout}
                disabled={loading}
                style={{
                    width: "100%",
                    padding: "0.5rem",
                    backgroundColor: "#4f46e5",
                    color: "white",
                    border: "none",
                    cursor: "pointer",
                }}
            >
                {loading ? "Redirecting to checkout..." : `Tip £${(props.tipAmount/100).toString()}`}
            </button>
        </div>
    )
}

export default DonateButton;