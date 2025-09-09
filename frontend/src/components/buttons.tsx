import React from "react";
import { useNavigate } from "react-router-dom";

const TreeButton = ({page, label}) => {

    const navigate = useNavigate();

    const handleNavigate = () => {
        navigate(`/${page}`);
    }

    return (
        <button
            onClick={handleNavigate}
        >
            {label}
        </button>
    )
}

export const NextButton = ({page}) => {
    return <TreeButton page={page} label={'Continue'} />
}

export const PreviousButton = ({page}) => {
    return <TreeButton page={page} label={'Previous'} />
}

export const SkipButton = ({page}) => {
    return <TreeButton page={page} label={'Set up later'} />
}
