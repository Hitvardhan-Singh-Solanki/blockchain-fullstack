import React, { Component } from "react";
import Block from "./Block";

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
        <h3>Current wallet</h3>
        <p>Address: {address}</p>
        <p>Balance: {balance}</p>
        <div>
          <h3>Blocks</h3>
          <Block />
        </div>
      </>
    );
  }
}
