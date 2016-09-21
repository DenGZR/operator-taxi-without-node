import React, {Component} from 'react'
import ReactDOM from 'react-dom'

import {Table, Field} from "../components/Table"
import {Doughnut} from 'react-chartjs-2';
import {DateTime} from '../components/DateTime'
import {SideBarMenu} from '../components/SideBarMenu'

import {makeRequest, Endpoints} from '../utils/api'
import {OrderCollection} from '../models/Collection'

import DatePicker from 'react-datepicker'
import moment from 'moment'
import { Grid, Row, Col } from 'react-bootstrap'
import { AlertPopup, TYPE_ERROR, TYPE_INFO, TYPE_SUCCESS} from '../components/Alert'
import { Chart } from '../components/Chart'

// current_state
// DRIVER_TO_CLIENT
// WAITING_FOR_CLIENT
// ON_ROUTE
// COMPLETE
// CANCELED_BY_DRIVER

// обьект из которого строится компонент Statistic
const menu = {
  order : {
    type: 'order',
    txt : 'Заказы',
    chartSet: {
      chartType : 'pie',
      statType : 'order',
    },
    requestSet : {
      endpoints : Endpoints.GET_ORDER_LIST(),
      timeStamp : null,
      dataFromTo : null
    }
  },
  driver : {
    statType : "driver",
    txt : "Водители",
    type: 'order',
    txt : 'Заказы',
    chartSet: {
      chartType : 'pie',
      statType : 'order',
    },
    requestSet : {
      endpoints : Endpoints.GET_ORDER_LIST(),
      timeStamp : null,
      dataFromTo : null
    }
  },
  client : {
    txt : "Клиенты",
    requestSet : {
      endpoints : Endpoints.GET_ORDER_LIST(),
      timeStamp : null,
      dataFromTo : null
    }
  },
  money : {
    txt : "$",
    requestSet : {
      endpoints : Endpoints.GET_ORDER_LIST(),
      timeStamp : null,
      dataFromTo : null
    }
  }
}

const adapterDataToTable = (/*Driver*/ driver) => {
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


class Statistic extends Component {
    constructor(props) {
        super(props);
        this.loadData = this.loadData.bind(this);
        this.togglePopup = this.togglePopup.bind(this);
        this.state = {
            activeMenu : menu.order,
            serverResponse: {
              result : {
                 textMass: '',
                 isError: false
              }
            },
            showPortal: false,
            showPopup: false,
            startDate: moment(),
            orders :  new OrderCollection()
        };
        this.mainTableFields = [
            new Field("Создан",
                (/*Order*/order) => <DateTime>{order.createdAt}</DateTime>, 20),
            new Field("Заказ",
                (/*Order*/order) => <BtnOrderDescription order={order} togglePopup={this.togglePopup} />, 10),
            new Field("Клиент",
                (/*Order*/order) => <User>{order.client}</User>, 20),
            new Field("Водитель",
                (/*Order*/order) => <User>{order.driver}</User>, 20),
            new Field("Стоимость",
                (/*Order*/order) => <span>{order.price}</span>, 10),
            new Field("Статус",
                (/*Order*/order) => <span>{order.statusName}</span>, 20)
        ];
    }

    handleChange(date) {
      this.setState({
        startDate: date
      })
    }

    statusSelected(e) {
      let newStatus = e.target.value.toString();
      let { currentState, paginate } = this.state;

      if( newStatus !== currentState ) {
        currentState = newStatus;
        paginate = { offset: 0, limit: 20 };
        this.setState({currentState,paginate});
      }
    }

    // показываем - прячем popup подробности заказа
    togglePopup(order = {}) {

      let togglePopupState = !this.state.showPopup;
      // console.log('togglePopupState ', togglePopupState );
      // console.log('this order ', order )
      this.setState({
        showPopup: togglePopupState,
        currentOrder: order
      })
    }

    handleAlertPopup() {
      let {showPortal} = this.state;
      showPortal = !showPortal;
      this.setState({showPortal});
    }

    loadData( endpoints ) {
        let { orders, activeMenu, serverResponse, showPortal } = this.state;
        endpoints = activeMenu.requestSet.endpoints || Endpoints.GET_ORDER_LIST();
        console.log(endpoints);
        makeRequest(endpoints)
            .then(response=> {
                console.log("response",response);
                let {netWorkManager} = response;
                showPortal = netWorkManager.result.isError;
                serverResponse = netWorkManager;
                orders.fromServer(response.data);
                this.setState({ orders, showPortal, serverResponse })
            })
          .catch(error=>console.log(error));
    }

    componentDidMount() {
        this.loadData();
    }



    render() {
      let { orders, activeMenu, serverResponse, showPortal, startDate } = this.state;
      let { textMass, isError } = serverResponse.result;
      let infoMesType = isError ? TYPE_ERROR : TYPE_SUCCESS;
      let orderPull = orders.getStatisticForOrder(); // изменил сортировку -> последнии заказы сверху, показую последних 51 заказ


      console.log("startDate",startDate);
      console.log("orderPull",orderPull);
      return (
        <div className="statistic">
          <AlertPopup type={infoMesType} isOpened={showPortal} onClose={this.handleAlertPopup.bind(this)}>{textMass}</AlertPopup>
          <Row className={this.state.showPopup ? "hide" : ""}>
            <Col xs={2} >
              <SideBarMenu
                itemsList={menu}
                active={activeMenu}
                onSelected={this.statusSelected.bind(this)}/>
            </Col>
            <Col xs={7} >
              <h1 className="main-title">{activeMenu.txt}</h1>
              <div>
                <span>Период</span>
                <DatePicker selected={startDate} onChange={this.handleChange.bind(this)}/>
                <DatePicker selected={this.state.startDate} onChange={this.handleChange.bind(this)}/>
              </div>
              <Chart data={orderPull} set={activeMenu.chartSet} />
            </Col>
            <Col xs={3} >
              {" "}
            </Col>
          </Row>
        </div>
      );
    }
}

export default Statistic;

// <div className="statistic">
//   <AlertPopup type={infoMesType} isOpened={showPortal} onClose={this.handleAlertPopup.bind(this)}>{textMass}</AlertPopup>
//   <Row className={this.state.showPopup ? "hide" : ""}>
//     <Col xs={2} >
//       <SideBarMenu
//         itemsList={orderState}
//         active={activeMenu}
//         onSelect={this.statusSelected.bind(this)}/>
//     </Col>
//     <Col xs={7} >
//       <Doughnut ref='chart' data={} />
//     </Col>
//     <Col xs={3} >
//     <Table withoutHeader={true}
//       style={{}}
//       showTable={true}
//       data={data.driver}
//       fields={keyValueFields}/>
//     </Col>
//   </Row>
// </div>
