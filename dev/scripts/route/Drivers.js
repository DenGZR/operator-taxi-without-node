import React, {Component} from 'react'
import ReactDOM from 'react-dom'
import {Grid, Row, Col} from 'react-bootstrap'
import ReactPaginate from 'react-paginate'
import {Link} from 'react-router'
import {Table, Field} from "../components/Table"
import {User} from "../components/User"
import {Driver, DriverCollection} from '../models/Driver'
// components
import {FormSelect} from "../components/FormSelect"
import {BtnToAddCache, PopupAddCacheToDriver} from "../components/PopupAddCacheToDriver"
//import {BtnToDriverDescription, PopupDriverDescription} from "../components/PopupDriverDescription"
//api
import {Waypoints} from "../components/Waypoints"
import {makeRequest, Endpoints} from '../utils/api'
import { AlertPopup, TYPE_ERROR, TYPE_INFO, TYPE_SUCCESS} from '../components/Alert'

// обьект из которого строится <StatusSelect/>
const driverStatus = {
    "all" : "Все",
    "new" : "Ожидает одобрения",
    "suspended" : "Заблокированный",
    "active" : "Активный"
};

class DriversPage extends Component {
    constructor(props) {
        super(props);
        this.state = {
          currentStatus : "all",
          currentPhone : "",
          currentDriver: null,
          drivers: new DriverCollection(),
          showPopupAddCache: false,
          showPortal: false,
          paginate : {
            offset: 0,
            limit: 20
          },
          serverResponse: {
            result : {
               textMass: '',
               isError: false
            }
          }
        };
        this.mainTableFields = [
            new Field("ID", (/*Driver*/ driver) => <span>{driver.id}</span>, 10),
            new Field("Водитель", (/*Driver*/ driver) => <User>{driver}</User>, 20),
            new Field("$", (/*Driver*/ driver) => <span>{driver.amount}</span>, 10),
            new Field("Статус", (/*Driver*/ driver) => <span>{driver.statusName}</span>, 20),
            new Field("Состояние", (/*Driver*/ driver) => <span  className={driver.state}>{driver.state}</span>, 10),
            new Field("Подробнее", (/*Driver*/ driver) => <Link to={`/drivers/${driver.id}`}>Подробнее</Link>, 10),
            new Field("Пополнить", (/*Driver*/ driver) => <BtnToAddCache currentDriver={driver} togglePopup={this.togglePopup.bind(this)}/>, 20)
        ];
    }

    loadData( endpoints ) {
        let { drivers, serverResponse, showPortal } = this.state;
        endpoints = endpoints || Endpoints.GET_DRIVER_LIST();
        console.log(endpoints);
        makeRequest(endpoints)
            .then(response=> {
                console.log("response",response);
                let {netWorkManager} = response;
                showPortal = netWorkManager.result.isError;
                serverResponse = netWorkManager;
                drivers.fromServer(response.data);
                this.setState({ drivers, showPortal, serverResponse })
            })
            .catch(error=>console.log(error));
    }

    componentDidMount() {
        this.loadData();
    }

    handleAlertPopup() {
      let {showPortal} = this.state;
      showPortal = !showPortal;
      this.setState({showPortal});
    }

    handlePageClick(data) {
      let selected = data.selected;
      console.log("selected", selected);
      let { paginate } = this.state;
      let offset = Math.ceil(selected * paginate.limit);
      paginate.offset = offset;
      this.setState({paginate});
    }

    statusSelected(e) {
      let newStatus = e.target.value.toString();
      let { currentStatus, paginate } = this.state;
      if( newStatus !== currentStatus ) {
        currentStatus = newStatus;
        paginate = { offset: 0, limit: 20 };
        this.setState({currentStatus,paginate});
      }
    }

    formSearch(newPhone) {
      let { currentPhone, paginate } = this.state;
      if( newPhone !== currentPhone ) {
        currentPhone = newPhone;
        paginate = { offset: 0, limit: 20 };
        this.setState({currentPhone});
      }
      console.log('orderSearch');
    }

// пеобразуем statuses в url для запроса
    // getEndpointsOfStatus(stat) {
    //   switch (stat) {
    //     case "new":
    //       return Endpoints.GET_INACTIVE_DRIVERS();
    //       break
    //     case "suspended":
    //       return Endpoints.GET_DRIVERS_SUSPENDED();
    //       break
    //     default:
    //       return Endpoints.GET_DRIVER_LIST();
    //   }
    // }
// показываем - прячем popup
    togglePopup(action_type,driver = {}) {
      let state = {};
      let togglePopupState;

      togglePopupState = !this.state[action_type];
      state[action_type] = togglePopupState;
      state['currentDriver'] = driver;
      this.setState(state);
      // console.log('Fun togglePopup', action_type);
      // console.log('togglePopupState ', togglePopupState );
    }
// запрос на сервер для пополнения счета
    makeRequestToAddCache( driverId, amount ) {
      //console.log("makeRequest");
      makeRequest(Endpoints.GET_DRIVER_ADD_CACHE( driverId, amount ))
         .then(response=>console.log('Server response :', response))
         .catch(error=>console.log('Server response Error :', error));
    }

    render() {
      let { drivers, currentStatus, currentPhone, paginate, serverResponse, showPortal } = this.state;
      let { textMass, isError } = serverResponse.result;
      let infoMesType = isError ? TYPE_ERROR : TYPE_SUCCESS;

      let driverPull = drivers.getDriverByState(currentStatus).getDriverByPhone(currentPhone).toArray();
      // console.log("currentStatus", currentStatus);
      // console.log("driverPull", driverPull);
      let pageNum = Math.ceil(driverPull.length/paginate.limit);
      driverPull = driverPull.slice(paginate.offset,paginate.limit+paginate.offset);
      let showDriverList = !(this.state.showPopupAddCache) ? "" : "hide";
      console.log('showDriverList',showDriverList);

      return (
            <div className="driver-list">
              <AlertPopup type={infoMesType} isOpened={showPortal} onClose={this.handleAlertPopup.bind(this)}>{textMass}</AlertPopup>
              <PopupAddCacheToDriver
                showPopup={this.state.showPopupAddCache}
                togglePopup={this.togglePopup.bind(this)}
                dataDriver={this.state.currentDriver}
                makeRequestCache={this.makeRequestToAddCache.bind(this)}/>
                <Row className={"driver-list-container " + showDriverList }>
                  <Col xs={6} xsOffset={3} >
                    <FormSelect
                      statuses={driverStatus}
                      activeStatuses={this.state.currentState}
                      onSelect={this.statusSelected.bind(this)}
                      onSearch={this.formSearch.bind(this)}/>
                  </Col>
                  <Col xs={12} >
                    <Table
                      showTable={true}
                      style={Styles.driversTable}
                      data={driverPull}
                      fields={this.mainTableFields}/>
                  </Col>
                  <Col xs={6} xsOffset={5} >
                    <ReactPaginate previousLabel={"<"}
                      nextLabel={">"}
                      breakLabel={<a href="">...</a>}
                      breakClassName={"break-me"}
                      pageNum={pageNum}
                      marginPagesDisplayed={2}
                      pageRangeDisplayed={5}
                      clickCallback={this.handlePageClick.bind(this)}
                      containerClassName={"pagination "}
                      subContainerClassName={"pages pagination"}
                      activeClassName={"active"} />
                  </Col>
                </Row>
            </div>
        );
    }
}


const Styles = {
    driversTable: {
        height: "900px",
        marginTop: "30px"
    }
};

export default DriversPage;
