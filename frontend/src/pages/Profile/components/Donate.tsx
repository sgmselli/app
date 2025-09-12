import React, { useState } from 'react';

import { getCheckoutUrl } from '../../../api/payment';
import Logo from '../../../components/Logo';
import Input from '../../../components/elements/input';
import Textarea from '../../../components/elements/textarea';

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
    const [loading, setLoading] = useState<boolean>(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({});
        setLoading(true);
        try {
            const response = await getCheckoutUrl({
                username: props.username, 
                payment_amount: calculateTotalTip(tipAmount),
                name: name,
                message: message
            });
            window.location.href = response.url;

        } catch (err: any) {
            const apiErrors = err?.response?.data?.errors || [];
            const newErrors: Record<string, string> = {};
            apiErrors.forEach((e: { field: string; message: string }) => {
                newErrors[e.field] = e.message;
            });
            setErrors(newErrors);
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
                <h2 className="text-2xl text-gray-700 font-semibold mb-2">Give <span >{props.displayName}</span> a TubeTip</h2>
                <h4 className="text-lg font-normal text-gray-500">{props.bankConnected ? "A TubeTip is a friendly way of giving support to your hard working content creator." : `Oh no! ${props.displayName} cannot current accept TubeTips until they complete their profile.`}</h4>

                {
                    props.bankConnected && (
                        <DonateAmount tipAmount={tipAmount} setAmount={setAmount} />
                    )
                }
                
                <div className="form-control mt-5">
                    <Input
                        id="name"
                        value={name} 
                        onChange={setName}
                        type="text"
                        placeholder="Your name (optional)"
                        disabled={!props.bankConnected}
                        error={errors.name}
                    />
                </div>

                <div className="form-control mt-5">
                    <Textarea
                        id="message"
                        value={message} 
                        placeholder="Write a nice message with your TubeTip (optional)"
                        onChange={setMessage}
                        disabled={!props.bankConnected}
                        error={errors.message}
                    />
                </div>
                <button
                    type='submit'
                    disabled={!props.bankConnected || loading}
                    className="btn primary-btn btn-xl text-[16px] font-medium border-0 rounded-lg w-[100%] mt-5"
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