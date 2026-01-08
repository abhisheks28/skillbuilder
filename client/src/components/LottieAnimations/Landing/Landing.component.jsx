"use client"
import animationData from "./quiz animation.json";
import { useLottie } from "lottie-react";

const LandingIllustration = () => {

    const defaultOptions = {
        animationData: animationData,
        loop: true,
    };

    const { View } = useLottie(defaultOptions);
    return (
        <div>
            {View}
        </div>
    );
}

export default LandingIllustration;