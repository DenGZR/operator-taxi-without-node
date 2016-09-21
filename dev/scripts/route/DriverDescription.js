//{BtnToDriverDescription, PopupDriverDescription}

import React, {Component} from 'react'
import {Grid, Row, Col, Panel, Button, FormGroup, InputGroup, FormControl, DropdownButton, MenuItem  } from 'react-bootstrap'
import {Table, Field} from '../components/Table'
import {Link} from 'react-router'

import {Driver, DriverCollection} from '../models/Driver'
import {Waypoints} from "../components/Waypoints"
import {makeRequest, Endpoints} from '../utils/api'

const HeaderPanel = (Id) => {
  let HeaderPanelStyle = {

  }
  return (
    <div className="header-panel">
      <span>Водитель ID : {Id}</span>
      <Link to={`/drivers`} className="btn btn-danger btn-cancel">x</Link>
    </div>
  )
}

const driverToTableAdapter = (/*Driver*/ driver) => {
    return {
        driver: [
            {key: "Фамилия", value: driver.lastName},
            {key: "Имя", value: driver.firstName},
            {key: "Отчество", value: driver.middleName},
            {key: "Пол", value: driver.sex},
            {key: "Дата рождения", value: driver.birthDate.format("DD.MM.YYYY")},
            {key: "Телефон", value: driver.phone},
            {key: "Адрес", value: driver.address},
            {key: "ИНН", value: driver.PMT},
            {key: "Паспорт", value: driver.passport},
        ],
        car: [
            {key: "Марка", value: driver.carBrand},
            {key: "Модель", value: driver.carModel},
            {key: "Цвет", value: driver.carColor},
            {key: "Тип", value: driver.carType},
            {key: "Год выпуска", value: driver.carYear},
            {key: "Номер", value: driver.carNumber}
        ]
    }
};

const keyValueFields = [
    new Field("Параметр", i=><p>{i.key}</p>, 10),
    new Field("Значение", i=><p style={{textAlign: "right"}}>{i.value}</p>, 10)
];
export const GET_DRIVER_ACTIVATE = (driver_id) => ({path: `/api/operator/drivers/activate/?driver=`+driver_id , method: "GET"});
// блокирует водителя
export const GET_DRIVER_SUSPEND = (driver_id) => ({path: `/api/operator/drivers/suspend/?driver=`+driver_id , method: "GET"});

const statuses = ["active", "suspended","new"];
const statusNames = {"active": "Активен", "suspended": "Заблокирован", "new": "Ожидает подтверждения"};
const statusName = (status) => (statusNames[status] || `Неизвестный ${status}`);

const tariffs = ["once", "month"];
const tariffNames = {"once": "Один раз", "month": "Месяц"};
const tariffName = (tariff) => (tariffNames[tariff] || `Неизвестный ${tariff}`);

const driverState = ["online", "offline"];
const driverStateNames = {"online": "online", "offline": "offline"};

export default class DriverDescription extends Component {
    constructor(props) {
          super(props);
          this.handleChange = this.handleChange.bind(this);
          this.handleSave = this.handleSave.bind(this);
          this.state = {
              // tariff: "hourly",
              stateDriver: '',
              statusDriver: '',
              driver: null
          };
    }

    handleSave(e) {
      e.preventDefault();
      let { stateDriver, statusDriver, driver } = this.state;
      const driverId = driver.id;
      let urls = [];
      //debugger

      if( stateDriver !== driver.state ) {  // меняет статус online / offline
        urls.push(Endpoints.GET_DRIVER_SET_STATE(stateDriver,driverId))
      }
      if( statusDriver !== driver.status ) {  //активирует/блокирует   водителя active / suspended
        // активирует/блокирует   водителя по запросу на api c парамепрами activate / suspend
        // приходит statusDriver active / suspended
        switch (statusDriver) {
          case "active":
            statusDriver = "activate";
          break;
          case "suspended":
           statusDriver = "suspend";
          break;
        }
        urls.push(Endpoints.GET_DRIVER_SET_STATUS(statusDriver,driverId))
      }

      Promise.all( urls.map(makeRequest))
      .then(responses=> {
          console.log(responses);
      })
      .catch(error => {
        console.log(error);
      });
    }

    handleChange(e) {
      //debugger
      let { stateDriver, statusDriver } = this.state;
      let inputType = e.target.name;
      let inputVal = e.target.value ;

      console.log("inputType",inputType);
      console.log("inputVal",inputVal);

        switch (inputType) {
          case "status":
            console.log("driver status");
            statusDriver = inputVal;
          break;
          case "state":
           console.log("driver state");
           stateDriver = inputVal;
          break;
        }
        this.setState({stateDriver,statusDriver})
    }

    componentDidMount() {
      let {driverId} = this.props.params;
      console.log(driverId);
      this.loadData(Endpoints.GET_DRIVER_DESCRIPTION(driverId),Endpoints.GET_DRIVER_STATE(driverId));
    }

    loadData( ...urls ) {
        let { driver, stateDriver, statusDriver} = this.state;

        Promise.all( urls.map(makeRequest) )
        .then(responses=> {    // array response
            console.log("Promise responses array", responses);
            responses.map((response) => {
              driver = {...driver,...response.data.data}
              console.log("driver ... spred", driver);
            })
            driver = new Driver(driver);
            stateDriver = driver.state;
            statusDriver = driver.status;
            this.setState({driver,stateDriver,statusDriver})
        })
    }

    render() {
      //debugger
      let {driverId} = this.props.params;
      let { driver, stateDriver, statusDriver} = this.state;
      console.log("Driver status", statusDriver);
      console.log("Driver state", stateDriver);
      // console.log("Driver status", driver.status);
      // console.log("Driver state", driver.state);
      // console.log(driverId);

      console.log(driver);
      if( !driver ) {
        return <div className="hide"></div>
      }
      const data = driverToTableAdapter(driver);
      //const { tariff, status } = this.state;
      //selected={status === driverStatus ? "selected" : ""}
      // console.log(data.driver);
      // console.log(data.car);
      return (
        <Row className="driver-description">
          <Col xs={10} xsOffset={1}>
            <Panel header={HeaderPanel(driverId)}>
              <Row className="driver-form">
                <Col xs={10} xsOffset={1}>
                  <form className="form-horizontal" onSubmit={this.handleSave}>
                    <FormGroup>
                      <InputGroup>
                        <InputGroup.Addon>Статус</InputGroup.Addon>
                        <FormControl componentClass="select" placeholder="select" value={statusDriver} name="status" onChange={this.handleChange}>
                          {statuses.map((status, i)=><option value={status} key={i} >{statusName(status)}</option>)}
                        </FormControl>
                      </InputGroup>
                      <InputGroup>
                        <InputGroup.Addon>Тариф</InputGroup.Addon>
                        <FormControl componentClass="select" placeholder="select" name="tariff" onChange={this.handleChange}>
                          {tariffs.map((tariff, i)=><option value={tariff} key={i}>{tariffName(tariff)}</option>)}
                        </FormControl>
                      </InputGroup>
                      <InputGroup>
                      <InputGroup.Addon>Состояние</InputGroup.Addon>
                        <FormControl componentClass="select" placeholder="select" value={stateDriver} name="state" onChange={this.handleChange}>
                          {driverState.map((state, i)=><option value={state} key={i} >{state}</option>)}
                        </FormControl>
                      </InputGroup>
                      <Button bsStyle="primary" type="submit">Сохранить</Button>
                    </FormGroup>
                  </form>
                </Col>
              </Row>
              <Row className="driver-info">
                <Col xs={4} >
                  <img
                     src={driver.photo}
                     alt="Водитель"/>
                </Col>
                <Col xs={6}>
                  <Table withoutHeader={true}
                    style={{}}
                    showTable={true}
                    data={data.driver}
                    fields={keyValueFields}/>
                </Col>
              </Row>
              <Row className="driver-car">
                <Col xs={4} >
                  <img
                     src={driver.carPhoto}
                     alt="Машина"/>
                </Col>
                <Col xs={6}>
                  <Table withoutHeader={true}
                      showTable={true}
                      data={data.car}
                      fields={keyValueFields}/>
                </Col>
              </Row>
            </Panel>
          </Col>
        </Row>
      );
    }
};
