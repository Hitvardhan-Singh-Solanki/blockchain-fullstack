import React, { Component } from "react";
import { Button } from "react-bootstrap";
import Transaction from "./Transaction";

export default class Block extends Component {
  state = {
    displayTransaction: false
  };

  toggleTransaction = () => {
    this.setState(prevState => ({
      displayTransaction: !prevState.displayTransaction
    }));
  };

  get displayTransaction() {
    const { data } = this.props.block;
    const stringifyData = JSON.stringify(data);
    const dataDisplay =
      stringifyData.length > 35
        ? `${stringifyData.substring(0, 35)}...`
        : stringifyData;

    if (this.state.displayTransaction) {
      return (
        <div>
          {data.map(transaction => (
            <div key={transaction.id}>
              <hr />
              <Transaction transaction={transaction} />
            </div>
          ))}
          <br />
          <Button variant="danger" size="sm" onClick={this.toggleTransaction}>
            Show Less
          </Button>
        </div>
      );
    }

    return (
      <div onclick={() => this.toggleTrx()}>
        <div>Data: {dataDisplay}</div>{" "}
        <Button variant="danger" size="sm" onClick={this.toggleTransaction}>
          Show More
        </Button>
      </div>
    );
  }

  render() {
    const { timeStamp, hash } = this.props.block;
    const hashDisplay = `${hash.substring(0, 15)}...`;

    return (
      <div className={"Block"}>
        <div>Hash: {hashDisplay}</div>
        <div>Timestamp: {new Date(timeStamp).toLocaleDateString()}</div>
        {this.displayTransaction}
      </div>
    );
  }
}
