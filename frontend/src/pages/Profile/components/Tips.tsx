import React from 'react'

interface TipsProps {
    tips: TipProps[];
}

export interface TipProps {
    id: number;
    amount: string;
    name: string | null;
    message: string | null;
    isPrivate: boolean
    created_at: Date;
}

const Tips: React.FC<TipsProps> = (props: TipsProps) => {
    return (
        <div className='mt-6'>
            {
                props.tips.map((tip) => {
                    return (
                        <Tip
                            key={tip.id}
                            id={tip.id}
                            amount={tip.amount}
                            name={tip.name}
                            message={tip.message}
                            isPrivate={tip.isPrivate}
                            created_at={tip.created_at}
                        />
                    )
                })
            }
        </div>
    )
}

const Tip: React.FC<TipProps> = (props: TipProps) => {

    return (
        <div className="mb-6">
            <p><span className='font-semibold'>{props.name ? props.name : "Someone"}</span> TubeTipped £{parseInt(props.amount)/100} 💸</p>
            { props.message &&
                <div className="bg-red-50 py-4 px-6 w-fit rounded-lg mt-2">
                    <p className="text-sm text-gray-700 font-normal">{props.message}</p>
                </div>
            }
            <p>{props.isPrivate && "(Sent privately)"}</p>
        </div>
    )
}

export default Tips;