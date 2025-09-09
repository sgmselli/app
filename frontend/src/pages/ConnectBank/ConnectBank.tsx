import React, { useState } from "react";
import { Country } from "../../types/country"; 
import { getConnectBankUrl } from "../../api/payment"; 
import type { ConnectBankRequest, ConnectBankResponse } from "../../types/payment";
import Navbar from "../../components/Navbar";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

const ConnectBank: React.FC = () => {
  const [country, setCountry] = useState<keyof typeof Country>("UnitedKingdom");
  const [connecting, setConnecting] = useState(false);

  const [open, setOpen] = useState(false); // country modal
  const [laterModal, setLaterModal] = useState(false); // new modal
  const [error, setError] = useState<string | null>(null);

  const { user } = useAuth();

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setConnecting(true);
    try {
      const requestData: ConnectBankRequest = { country };
      const response: ConnectBankResponse = await getConnectBankUrl(requestData);
      window.location.href = response.url;
    } catch (err) {
      console.error(err);
      setError("Failed to connect bank. Please try again.");
    } finally {
      setConnecting(false);
    }
  };

  const navigateProfile = () => {
    navigate(`/${user?.username}`);
  }

  return (
    <div className="flex flex-col min-h-screen w-full">
      <Navbar />
      <div className="flex flex-1 items-start justify-center w-[100%]">
        <form onSubmit={handleSubmit} className="w-full max-w-xl">
          {error && <p style={{ color: "red", marginTop: "1rem" }}>{error}</p>}

          <h2 className="text-4xl font-medium mb-4 text-center text-gray-700">
            Connect your bank
          </h2>
          <h4 className="text-lg font-normal mb-10 text-center text-gray-500">
            You will need to connect your bank to accept payments from
            supporters. You will be redirected to Stripe to handle this securely.
          </h4>

          {/* Country picker */}
          <div className="form-control mb-8">
            <label
              htmlFor="country"
              className="mb-2 block font-medium text-gray-700"
            >
              Select Country
            </label>

            <button
              type="button"
              disabled={connecting}
              onClick={() => setOpen(true)}
              className="input input-lg w-full bg-base-200 rounded-lg text-[14px] font-medium 
                        flex justify-between items-center hover:border-black focus:outline-none disabled:opacity-50 cursor-pointer"
            >
              {country ? Country[country] : "Select country"}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 opacity-60"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            <p className="mt-2 text-xs text-gray-500 leading-snug break-words">
              Select the country where you live in and use your bank.
            </p>

            {open && (
              <dialog open className="modal modal-open">
                <div className="modal-box max-w-md">
                  <h3 className="font-medium text-lg">Select country</h3>
                  <p className="text-sm text-gray-400 mt-2 mb-5">
                    Scroll to see more countries
                  </p>

                  <div className="max-h-[300px] overflow-y-scroll scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-transparent">
                    {Object.entries(Country).map(([key, label]) => (
                      <button
                        key={key}
                        onClick={() => {
                          setCountry(key as keyof typeof Country);
                          setOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg hover:bg-base-200 ${
                          country === key ? "bg-base-300 font-medium" : ""
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>

                  <div className="modal-action">
                    <button
                      onClick={() => setOpen(false)}
                      className="btn primary-btn border-0"
                    >
                      Close
                    </button>
                  </div>
                </div>
                <form method="dialog" className="modal-backdrop">
                  <button onClick={() => setOpen(false)}>close</button>
                </form>
              </dialog>
            )}
          </div>

          {/* Main connect button */}
          <button
            type="submit"
            className="btn btn-lg primary-btn border-0 rounded-lg w-full font-normal text-[16px] focus:outline-none"
            disabled={connecting}
          >
            {connecting ? (
              <span className="loading loading-spinner"></span>
            ) : (
              "Connect"
            )}
          </button>

          {/* Divider */}
          <div className="flex items-center my-6">
            <hr className="flex-grow border-gray-300" />
            <span className="mx-4 text-gray-500 text-sm font-medium">or</span>
            <hr className="flex-grow border-gray-300" />
          </div>

          {/* Later button */}
          <button
            type="button"
            className="btn btn-lg w-full rounded-lg border border-gray-300 bg-white text-gray-700 font-normal text-[16px] hover:bg-gray-100"
            onClick={() => setLaterModal(true)}
          >
            Come back to this later
          </button>

          {/* Later modal */}
          {laterModal && (
            <dialog open className="modal modal-open">
              <div className="modal-box max-w-lg p-8">
                <h3 className="font-semibold text-xl text-gray-800 mb-3">
                  You will not be able to accept payments.
                </h3>
                <p className="text-md text-gray-600 mt-2 mb-10">
                  If you don’t connect your bank with Stripe now, you will not be
                  able to accept payments from supporters.
                </p>

                <div className="modal-action flex justify-end gap-3">
                  <button
                    className="btn btn-md rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-100"
                    onClick={() => setLaterModal(false)}
                  >
                    Go Back
                  </button>
                  <button
                    className="btn btn-md primary-btn border-0 rounded-lg text-white"
                    onClick={() => {
                      navigateProfile();
                    }}
                  >
                    Continue
                  </button>
                </div>
              </div>
              <form method="dialog" className="modal-backdrop">
                <button onClick={() => setLaterModal(false)}>close</button>
              </form>
            </dialog>
          )}
        </form>
      </div>
    </div>
  );
};

export default ConnectBank;