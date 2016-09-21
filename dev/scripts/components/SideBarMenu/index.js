import React, {Component} from 'react'
import {Grid, Row, Col, Panel, Button, FormGroup, InputGroup, FormControl, DropdownButton, MenuItem  } from 'react-bootstrap'

export const SideBarMenu = (props) => {
  const { itemsList, active, onSelected } = props;
  let menuItems = Object.keys(itemsList);
//   //debugger

  console.log(status);

    return (
      <div className="side-bar-menu">
        <ul  className="menu">
          { menuItems.map((item,i) => <li className={ active.title == itemsList[item].title ? "active" : "" } onClick={onSelected} key={i}>{itemsList[item].title}</li>)}
        </ul>
      </div>
    );
};
