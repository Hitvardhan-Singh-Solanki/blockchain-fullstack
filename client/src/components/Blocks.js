import React, { Component } from "react";
import { Button } from "react-bootstrap";
import { Link } from "react-router-dom";

import Block from "./Block";

export default class Blocks extends Component {
  state = { blocks: [], paginatedId: 1, blocksLength: 0 };

  componentDidMount() {
    fetch(`/api/blocks/length`)
      .then(response => response.json())
      .then(json => this.setState({ blocksLength: json }));

    this.fetchPaginatedBlocks(this.state.paginatedId)();
  }

  fetchPaginatedBlocks = paginatedId => () => {
    fetch(`/api/blocks/${paginatedId}`)
      .then(response => response.json())
      .then(json => this.setState({ blocks: json }));
  };

  render() {
    return (
      <div>
        <div>
          <Link to="/">Home</Link>
        </div>
        <h3>Blocks</h3>
        <div>
          {[...Array(Math.ceil(this.state.blocksLength / 5)).keys()].map(
            key => {
              const paginatedId = key + 1;

              return (
                <span
                  key={key}
                  onClick={this.fetchPaginatedBlocks(paginatedId)}
                >
                  <Button size="sm" variant="danger">
                    {paginatedId}
                  </Button>{" "}
                </span>
              );
            }
          )}
        </div>
        {this.state.blocks.map(block => {
          return <Block key={block.hash} block={block} />;
        })}
      </div>
    );
  }
}
