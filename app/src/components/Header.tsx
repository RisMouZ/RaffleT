import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import logo from "../assets/logo.png";
import { NavLink } from "react-router-dom";

//TODO Faire le Router

const Header = () => {
  return (
    <div className="header">
      <div className="header-container">
        <div className="header-logo">
          <img src={logo} alt="RaffleT" />
        </div>
        <div className="navigation">
          <ul>
            <NavLink
              to="/"
              className={(nav) =>
                nav.isActive ? "nav-active" : "nav-inactive"
              }
            >
              <li>Home</li>
            </NavLink>
            <NavLink
              to="/dashboard"
              className={(nav) =>
                nav.isActive ? "nav-active" : "nav-inactive"
              }
            >
              <li>Dashboard</li>
            </NavLink>
            <NavLink
              to="/createRaffle"
              className={(nav) =>
                nav.isActive ? "nav-active" : "nav-inactive"
              }
            >
              <li>Create Raffle</li>
            </NavLink>
            <NavLink
              to="/explore"
              className={(nav) =>
                nav.isActive ? "nav-active" : "nav-inactive"
              }
            >
              <li>Explore</li>
            </NavLink>
          </ul>
        </div>
        <div className="wallet-btn">
          <WalletMultiButton />
        </div>
      </div>
    </div>
  );
};

export default Header;
