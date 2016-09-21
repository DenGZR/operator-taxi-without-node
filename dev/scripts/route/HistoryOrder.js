import React, {Component} from 'react'
import ReactDOM from 'react-dom'

import {Table, Field} from "../components/Table"
import {DateTime} from "../components/DateTime"
import {FormSelect} from "../components/FormSelect"
import {User} from "../components/User"
import {Waypoints} from "../components/Waypoints"
import {makeRequest, Endpoints} from '../utils/api'
import {Order, OrderCollection} from '../models/Order'
import ReactPaginate from 'react-paginate'
import {Grid, Row, Col} from 'react-bootstrap'
import {PopupOrderDescription, BtnOrderDescription} from "../components/PopupOrderDescription"
import { AlertPopup, TYPE_ERROR, TYPE_INFO, TYPE_SUCCESS} from '../components/Alert'

// current_state
//
// DRIVER_TO_CLIENT
// WAITING_FOR_CLIENT
// ON_ROUTE
// COMPLETE
// CANCELED_BY_DRIVER

// обьект из которого строится <OrderStateSelect/>
const orderState = {
    "all" : "Все",
    "drive_to_client" : "Напрaвляется к клиенту",
    "waitng_for_client" : "Ожидает клиента",
    "on_route" : "В пути",
    "complete" : "Выполнен",
    "canceled_by_driver" : "Отменен водителем",
    "canceled_by_operator" : "Отменен оператором",
    "canceled_by_client" : "Отменен клиентом"
};


class OperatorStrip extends Component {
    constructor(props) {
        super(props);
        this.loadData = this.loadData.bind(this);
        this.togglePopup = this.togglePopup.bind(this);
        this.state = {
            currentState : "complete",
            currentPhone : "",
            paginate : {
              offset: 0,
              limit: 20
            },
            serverResponse: {
              result : {
                 textMass: '',
                 isError: false
              }
            },
            showPortal: false,
            showPopup: false,
            currentOrder: null,
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

    changeOrderStatus(newStatusType,order_id) {
      let endpoints;
      let responseData = {
        'order_id' : parseInt(order_id,10),
        'comment' : "operators " + newStatusType
      }
      switch ( newStatusType ) {
          case "cancel":
              console.log("cancel");
              endpoints = Endpoints.POST_ORDER_CANCEL();
              break;
          case "complete":
              console.log("complete");
              endpoints = Endpoints.POST_ORDER_COMPLETE();
              break;
      }
      console.log("POST data ",responseData);
      makeRequest(endpoints, responseData)
      .then(response=>console.log('Server response :', response))
      .catch(error=>console.log('Server response Error :', error));
    }

    handlePageClick(data) {
      let selected = data.selected;
      console.log("selected", selected);
      let { paginate } = this.state;
      let offset = Math.ceil(selected * paginate.limit);
      paginate.offset = offset;
      this.setState({paginate});
    }

    handleAlertPopup() {
      let {showPortal} = this.state;
      showPortal = !showPortal;
      this.setState({showPortal});
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

    loadData() {
        let {orders,serverResponse, showPortal} = this.state;
        makeRequest(Endpoints.GET_ORDER_LIST())
            .then(response=> {
                console.log('response server',response);
                let {netWorkManager} = response;
                showPortal = netWorkManager.result.isError;
                serverResponse = netWorkManager;
                orders.fromServer(response.data);
                this.setState({ orders,showPortal,serverResponse })
            })
            .catch(error=>console.log(error));
    }

    componentDidMount() {
        this.loadData();
        // this._autoUpdate = setInterval( () => {
        //   this.loadData();
        // } , 5000);
    }

    componentWillUnmount() {
        // clearInterval(this._autoUpdate);
    }

    render() {
      let { orders, currentState, currentPhone, paginate, serverResponse, showPortal } = this.state;
      let { textMass, isError } = serverResponse.result;
      let infoMesType = isError ? TYPE_ERROR : TYPE_SUCCESS;
      let orderPull = orders.getOrderByState(currentState).getOrderByPhone(currentPhone).toArray().sort(byStatusDuration); // изменил сортировку -> последнии заказы сверху, показую последних 51 заказ
      let pageNum = Math.ceil(orderPull.length/paginate.limit);
      console.log("orderPull",orderPull);
      console.log("paginate set", paginate);
      orderPull = orderPull.slice(paginate.offset,paginate.limit+paginate.offset);
      //const orderPull = orders.getOrderByState(currentState).toArray().sort(byStatusDuration).slice(0, 50); // изменил сортировку -> последнии заказы сверху, показую последних 51 заказ
      //console.log('status', currentState);
      console.log("orderPull",orderPull);
      return (
        <div className="history-order">
          <AlertPopup type={infoMesType} isOpened={showPortal} onClose={this.handleAlertPopup.bind(this)}>{textMass}</AlertPopup>
          <PopupOrderDescription
            showPopup={this.state.showPopup}
            togglePopup={this.togglePopup}
            order={this.state.currentOrder}
            onChangeOrderStatus={this.changeOrderStatus}/>
          <Row className={this.state.showPopup ? "hide" : ""}>
            <Col xs={6} xsOffset={3} >
              <FormSelect
                statuses={orderState}
                activeStatuses={this.state.currentState}
                onSelect={this.statusSelected.bind(this)}
                onSearch={this.formSearch.bind(this)}/>
            </Col>
            <Col xs={12} >
              <Table
                showTable={true}
                data={orderPull}
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

const byStatusDuration = ((/*Order*/a, /*Order*/b)=> {
    let result = 0;

    if (a.statusDurationPct < b.statusDurationPct || a.id > b.id) {
        result = -1;
    } else if (a.statusDurationPct > b.statusDurationPct || a.id < b.id) {
        result = 1;
    }
  return result;
});

export default OperatorStrip;

// ordersList : {
//   "all" : {
//     title : "Все",
//     orders : [new OrderCollection()]
//   },
//   "driver_to_client": {
//     title : "Напрвляется к клиенту",
//     orders : []
//   },
//   "waitng_for_client": {
//     title : "Ожидает клиента",
//     orders : []
//   },
//   "on_route": {
//     title : "В пути",
//     orders : []
//   },
//   "complete": {
//     title : "Выполнен",
//     orders : []
//   },
//   "canceled_by_driver": {
//     title : "Отменен водителем"
//     orders : []
//   }
// }
