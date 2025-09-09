import React, { useState } from 'react';

import { getCheckoutUrl } from '../../../api/payment';
import Tips from './Tips';
import Logo from '../../../components/Logo';

interface Props {
    username: string;
    displayName: string
    currency: string
    bankConnected: boolean | null
}

const Donate: React.FC<Props> = (props: Props) => {

    const [tipAmount, setTipAmount] = useState<number>(1);
    const [name, setName] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);
    const [isPrivate, setIsPrivate] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);
        try {
            const response = await getCheckoutUrl({
                username: props.username, 
                payment_amount: calculateTotalTip(tipAmount),
                name: name,
                message: message,
                isPrivate: isPrivate
            });
            window.location.href = response.url;

        } catch (err: any) {
            console.log(err);
            setError("Failed to checkout Please try again.");
        } finally {
            setLoading(false);
        }
    }

    const calculateTotalTip = (tipAmount: number) => {
        return tipAmount * 100 * 3
    }

    const setAmount = (tipAmount: number) => {
        setTipAmount(tipAmount);
    }
    
    return (
        <div className="max-w-xl">
            <form onSubmit={handleSubmit} className='w-full'>
                {error && <p style={{ color: "red", marginTop: "1rem" }}>{error}</p>}
                <h2 className="text-2xl text-gray-700 font-semibold mb-2">Give <span >{props.displayName}</span> a TubeTip</h2>
                <h4 className="text-lg font-normal text-gray-500">{props.bankConnected ? "A TubeTip is a friendly way of giving support to your hard working content creator." : `Oh no! ${props.displayName} cannot current accept TubeTips until they complete their profile.`}</h4>


                {
                    props.bankConnected && (
                        <DonateAmount tipAmount={tipAmount} setAmount={setAmount} />
                    )
                }
                
                <div className="form-control mt-5">
                    <input
                        id="name"
                        value={name ? name : ""} 
                        onChange={e => setName(e.target.value)}
                        type="text"
                        placeholder="Your name"
                        className="input input-lg w-full bg-base-200 rounded-lg text-[14px] font-medium focus:outline-none focus:border-2 focus:bg-white cursor-pointer hover:bg-base-300 focus:border-red-300"
                        disabled={!props.bankConnected}
                    />
                </div>

                <div className="form-control mt-5">
                    <textarea
                        id="message"
                        value={message ? message : ""} 
                        placeholder="Write a nice message with your TubeTip"
                        onChange={e => setMessage(e.target.value)}
                        className="textarea textarea-lg w-full bg-base-200 rounded-lg min-h-[100px] resize-none !text-[14px] cursor-pointer hover:bg-base-300 focus:border-red-300 font-medium focus:border-2 focus:outline-none focus:bg-white"
                        disabled={!props.bankConnected}
                    />
                </div>
                <div className="form-control mt-4">
                    <label className="cursor-pointer label flex items-center gap-2">
                        <input
                        type="checkbox"
                        className="checkbox checkbox-xs"
                        checked={isPrivate}
                        onChange={() => setIsPrivate(!isPrivate)}
                        disabled={!props.bankConnected}
                        />
                        <span className="label-text text-sm">Make message private</span>
                    </label>
                </div>
                
                <button
                    type='submit'
                    disabled={!props.bankConnected || loading}
                    className="btn primary-btn btn-xl text-[16px] border-0 rounded-lg w-[100%] mt-5"
                >
                    {loading ?  <span className="loading loading-spinner"></span> : props.bankConnected ? `Tip ${props.currency}${(tipAmount*3).toString()}` : "Unavailable"}
                </button>
            </form>
        </div>
    )
} 

interface DonateAmountProps {
    tipAmount: number
    setAmount: (tipAmount: number) => void;
}

const DonateAmount: React.FC<DonateAmountProps> = (props: DonateAmountProps) => {

    const changeAmount = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value.replace(/\D/g, ""); 
        if (value) {
            const num = Math.min(parseInt(value, 10), 99999);
            props.setAmount(num);
        } else {
            props.setAmount(0);
        }
    };

    return (
    <div className="flex flex-row gap-3 items-center justify-center w-full h-[100px] bg-red-50 rounded-lg border-2 border-red-100 mt-5">
        <Logo />
        <div className="text-xl text-gray-500 font-semibold mr-3">x</div>

        <DonateNumberButton tips={1} tipAmount={props.tipAmount} setAmount={props.setAmount} />
        <DonateNumberButton tips={2} tipAmount={props.tipAmount} setAmount={props.setAmount} />
        <DonateNumberButton tips={3} tipAmount={props.tipAmount} setAmount={props.setAmount} />
        <DonateNumberButton tips={4} tipAmount={props.tipAmount} setAmount={props.setAmount} />
        {/* <DonateNumberButton tips={5} tipAmount={props.tipAmount} setAmount={props.setAmount} /> */}

        <input
        type="text"
        value={props.tipAmount || ""}
        onChange={changeAmount}
        placeholder="10"
        className="text-md text-red-300 font-bold text-center input bg-white h-[50px] w-[50px] rounded-lg border-2 border-base-300 ml-2 focus:outline-none
                    [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        />
    </div>
    );
}

interface DonateNumberButtonProps {
    tips: number;
    tipAmount: number;
    setAmount: (tipAmount: number) => void;
}

const DonateNumberButton: React.FC<DonateNumberButtonProps> = (props: DonateNumberButtonProps) => {
    const selected = props.tips == props.tipAmount
    return (
        <div onClick={() => props.setAmount(props.tips)} className={`${selected ? "primary-background" : "bg-white hover:border-error border-2"} flex items-center justify-center h-[50px] w-[50px] rounded-full border-base-300 cursor-pointer`}>
            <p className={`text-md ${selected ? "text-white" : "text-red-300"} font-bold`}>{props.tips}</p>
        </div>
    )
}

export default Donate;