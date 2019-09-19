import React, { Component } from "react";

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
        <h1>Current wallet</h1>
        <p>Address: {address}</p>
        <p>Balance: {balance}</p>
      </>
    );
  }
}
