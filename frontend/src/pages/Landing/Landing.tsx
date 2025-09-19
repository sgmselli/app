import React from 'react'
import { useNavigate } from 'react-router-dom';

const Landing : React.FC = () => {

  const navigate = useNavigate()
  
  const handleNavigate = () => {
    navigate('/register')
  }

  return (
    <>
      <div className="fullscreen-pattern" />
      <div style={{ position: 'relative', zIndex: 1 }}>
        <button
          className='btn btn-soft'
          onClick={handleNavigate}
        >Create your profile
        </button>
      </div>
    </>
  );
}

export default Landing;