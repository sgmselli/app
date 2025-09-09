import { useNavigate, useSearchParams } from "react-router-dom";

const CheckoutSuccess: React.FC = () => {

  const [searchParams, setSearchParams] = useSearchParams();
  const username: string | null = searchParams.get('username');
  const amount: string | null = searchParams.get('amount');
  const navigate = useNavigate();

  const handleNavigate = () => {
    navigate(`/${username ? username : ""}`)
  }

  return (
    <div>
      <p>Checkout Success</p>
      {
        amount && <p>You tipped {username} £{parseInt(amount)/100}!</p>
      }
      <button
        onClick={handleNavigate}
      >
        Return to {username}'s profile
      </button>
    </div>
  );
}

export default CheckoutSuccess;