import React, { Component } from "react";

export default class Block extends Component {
  state = {
    blocks: []
  };

  componentDidMount = async () => {
    // get wallet info thru fetch
    const response = await fetch("/api/blocks");
    const jsonResponse = await response.json();
    this.setState({ blocks: jsonResponse });
    console.log(jsonResponse);
  };

  render() {
    return (
      <ul>
        {this.state.blocks.map(block => (
          <li key={block.timeStamp}>
            <p>time: {block.timeStamp}</p>
            <p>
              data:{" "}
              {block.data.map(dat => (
                <p>{dat.id}</p>
              ))}
            </p>
            <p>hash: {block.hash}</p>
          </li>
        ))}
      </ul>
    );
  }
}

/* <p>last-hash: {block.lastHash}</p>
            <p>data: {block.data}</p>
            <p>nonce: {block.nonce}</p>
            <p>difficulty: {block.difficulty}</p>
            <p>time: {block.hash}</p>
             */
