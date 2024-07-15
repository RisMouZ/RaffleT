import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import logo from "../assets/logo.png";

//TODO Faire le Router

const Header = () => {
  return (
    <div className="header">
      <div className="header-container">
        <div className="header-logo">
          <img src={logo} alt="RaffleT" />
        </div>
        <div className="dashboard-shortcut">
          <a href="/dashboard">Dashboard</a>
        </div>
        <div className="create-raffle-shortcut">
          <a href="/createRaffle">Create Raffle</a>
        </div>
        <div className="find-raffle-shortcut">
          <a href="/findRaffle">Find Raffle</a>
        </div>
        <div className="wallet-btn">
          <WalletMultiButton />
        </div>
      </div>
    </div>
  );
};

export default Header;
