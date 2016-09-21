import React, {Component} from 'react'
import {Grid, Row, Col, Panel, Button, FormGroup, InputGroup, FormControl, DropdownButton, MenuItem  } from 'react-bootstrap'

export const FormSelect = (props) => {

  let statuses = Object.keys(props.statuses);
  let formSubmit = (e) => {

      e.preventDefault();
      let newPhone = document.getElementById("searchPhone").value;
      props.onSearch(newPhone);
  }
//   //debugger

  console.log(status);

    return (
      <form className="form-horizontal" onSubmit={formSubmit}>
        <FormGroup>
          <InputGroup>
            <InputGroup.Addon>Показать : </InputGroup.Addon>
            <FormControl componentClass="select" placeholder="select" value={props.activeStatuses} name="status" onChange={props.onSelect}>
              {statuses.map((status, i)=><option value={status} key={i} >{props.statuses[status]}</option>)}
            </FormControl>
          </InputGroup>
          <InputGroup>
            <InputGroup.Addon>Поик по номеру : </InputGroup.Addon>
            <FormControl type="phone" id="searchPhone" placeholder="380"/>
          </InputGroup>
          <Button bsStyle="primary" type="submit">Найти</Button>
        </FormGroup>
      </form>
    );
};




// <div className="btn-group box">
//
//   {statuses.map((status, i) =>
//       <button className={`btn btn-${(props.activeStatuses.indexOf(status) != -1) ? "success" : "default"}`}
//               key={i}
//               onClick={props.onSelect.bind(null, status)}>
//           {props.statuses[status]}
//       </button>)
//   }
// </div>
