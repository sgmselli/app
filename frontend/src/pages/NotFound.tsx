import { useNavigate } from "react-router-dom";

import Logo from "../components/Logo";

const NotFound: React.FC= () => {

  const navigate = useNavigate();

  const navigateLanding = () => {
      navigate('/');
  }
    
  return (
    <div className="flex flex-col">
       <nav className="w-full h-[120px] flex items-center justify-between px-8 sm:px-12">
          <button onClick={navigateLanding} className="cursor-pointer">
            <Logo />
          </button>
        </nav>
        <div className="flex justify-center items-center text-center pt-20 px-4">
          <h2
              className="text-xl md:text-3xl"
          >
              404, No page exists here.
          </h2>
        </div>
    </div>
  );
}

export default NotFound;