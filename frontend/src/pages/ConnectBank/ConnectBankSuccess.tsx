import React from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../../contexts/AuthContext";
import Navbar from "../../components/Navbar";
import Steps from "../../components/Steps";
import MotionDiv from "../../components/divAnimation";

const ConnectBankSuccess: React.FC = () => {

    const navigate = useNavigate();
    const { user } = useAuth();

    const handleNavigate = () => {
      navigate(`/${user?.username}`)
    }

    return (
      <div className="flex flex-col min-h-screen w-full">
        <Navbar />
        <div
          className="inline sm:hidden pb-10 sm:pb-0"
        >
          <Steps steps={4} currentStep={4} />
        </div>
        <div className="flex flex-1 items-start justify-center w-full pt-[10%]">
          <MotionDiv 
            className="w-[90%] md:w-full md:max-w-3xl flex flex-col items-center text-center"
          >
            <h2 className="text-2xl md:text-4xl font-medium mb-4 text-gray-700">
              Congratulations {user ? user.username : ""}, your bank is successfully connected to your account!
            </h2>

            <h4 className="text-md md:text-lg font-normal mb-10 text-gray-500">
              Your profile can now start accepting tips. Click next to have a look at your live TubeTip profile.
            </h4>

            <button onClick={handleNavigate} className="btn btn-lg primary-btn border-0 w-[200px] rounded-lg font-normal text-md focus:outline-none">
              Next
            </button>
          </MotionDiv>
        </div>
        <div
          className="hidden sm:inline sm:pb-20"
        >
          <Steps steps={4} currentStep={4} />
        </div>
      </div>
    );
};

export default ConnectBankSuccess;