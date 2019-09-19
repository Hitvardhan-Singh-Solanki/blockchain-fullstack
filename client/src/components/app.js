import React, { Component } from "react";
import { Link } from "react-router-dom";
import logo from "../assets/logo.png";

export default class App extends Component {
  state = {
    walletInfo: { address: "", balance: 0 }
  };

  componentDidMount = async () => {
    // get wallet info thru fetch
    const response = await fetch("/api/wallet-info");
    const jsonResponse = await response.json();
    this.setState({ walletInfo: jsonResponse });
  };

  render() {
    const { address, balance } = this.state.walletInfo;
    return (
      <>
        <img src={logo} alt="" className={"logo"} />
        <br />
        <div>Welcome to the blockchain...</div>
        <div>
          <Link to="/blocks">Blocks</Link>
        </div>
        <div>
          <Link to="/conduct-transaction">Conduct a Transaction</Link>
        </div>
        <div>
          <Link to="/transaction-pool">Transaction Pool</Link>
        </div>
        <br />
        <div className={"walletInfo"}>
          <h3>Current wallet</h3>
          <p>Address: {address}</p>
          <p>Balance: {balance}</p>
        </div>
      </>
    );
  }
}
