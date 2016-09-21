/**
 * Created by gasya on 14.04.16.
 * DigitalOutlooks corporation.
 */
import moment from 'moment'
import {statusName} from '../dicts/statuses'
import {Point} from '../structures/Point'


const OTHER_STATUSES = Symbol('OTHER_STATUSES');


const configs = {
    incomeDateFormat: "HH:mm:ss DD.MM.YYYY",
    outputDateFormat: "DD/MM/YYYY HH:mm",
    // In seconds
    statusDurations: {
        active: 30 * 60,
        accepted: 15 * 60,
        [OTHER_STATUSES]: 15 * 60
    }
};

export class OrderCollection {
    constructor(ordersMap = new Map(), timeStamp = 0) {
        this._timeStamp = timeStamp;
        this._mapOfOrders = ordersMap;
    }

    fromArray() {
      let mapOfOrders = this._mapOfOrders;
      let arrOfOrders = Array.from(mapOfOrders);

      return arrOfOrders;
    }

    fromServer(serverData) {

        let mapOfOrders = this._mapOfOrders;
        for (let orderId in serverData.orders) {
            const orderObj = serverData.orders[orderId];
            const /*Order*/ order = new Order(orderObj);
            mapOfOrders.set(order.id, order);
        }
        //console.log(mapOfOrders);
        this._timeStamp = serverData.time_stamp;
        this._mapOfOrders = mapOfOrders;
    }

    get timeStamp() {
        return this._timeStamp;
    }

    get(id) {
        return this._mapOfOrders.get(id);
    }

    filter(fn) {
        const mapOfOrders = new Map();
        const timeStamp = this._timeStamp;

        this._mapOfOrders.forEach((order, i) => {
            if (fn(order, i)) {
                mapOfOrders.set(order.id, order);
            }
        });

       return new OrderCollection(mapOfOrders,timeStamp);
    }

    /*Array<Order>*/
    toArray() {
        const /*Array<Order>*/ orderArray = [];

        this._mapOfOrders.forEach((order, i) => {
            orderArray.push(order);
        });

        return orderArray;
    }

    getArrayByIDs(/*Array*/ ids) {
        return ids
            .map(id=>this.get(id))
            .filter(order=>!!order);
    }

    getByOperator(operatorId) {
        return this.filter(order=>order.operatorId == operatorId)
    }

    getByNotOperator(operatorId) {
        return this.filter(order=>order.operatorId != operatorId)
    }

    getFreeOrders() {
        return this.filter(order=>!(order.isHasOperator)&&(order.status == "new"))
    }

    getNewOrders() {
        return this.filter(order=> order.status == "new")
    }

    getСlosedOrders() {
        return this.filter(order=> order.status == "closed")
    }

    getOrderByState(currentState) {
      if(currentState === "all") {
        return this
      }
        return this.filter(order=> order.currentState == currentState)
    }

    getOrderByPhone(phone) {
      if(!phone || phone === "" ) {
        return this
      }
      return this.filter(order=> order.orderPhones.indexOf(phone) != -1)
    }
}

export class Order {
    constructor(order) {
        this._order = order;
    }

    //From data
    get id() {
        return this._order.id;
    }

    get client() {
        return new User(this._order.client);
    }

    get driver() {
        return new User(this._order.driver);
    }

    get driverInfo() {
        return this._order.driver;
    }

    get operatorId() {
        return this._order.operator_id;
    }

    get status() {
        return this._order.status;
    }

    get currentState() {
        return this._order.current_state;
    }

    get clientInfo() {
      return this._order.client;
    }

    get carInfo() {
      return this._order.car;
    }

    get tariffAddons() {
      return this._order.tariff_addons;
    }

    get createdAt() {
        return this._order.created_at;
    }

    get scheduledAt() {
        return this._order.scheduled_at;
    }

    get stateChangedAt() {
        return this._order.state_changed_at;
    }

    get operatorComment() {
        return this._order.operator_comment;
    }

    get driverComment() {
        return this._order.driver_comment;
    }

    get clientComment() {
        return this._order.client_comment;
    }

    get passengerCount() {
        return this._order.passengers;
    }

    get statusChangeTime() {
        return moment(this.stateChangedAt);
    }

    get orderDateTime() {
        return moment(this._order.createdAt);
    }

    get dateTime() {
        return moment(this._order.scheduledAt);
    }

    get waypoints() {
        return [
            this.startPoint,
            this.endPoint
        ];
    }

    get endPoint() {
        return Point.createFromData(this._order.end_point);
    }

    get startPoint() {
        return Point.createFromData(this._order.start_point);
    }

    get calulatedPrice() {
        return this._order.calculated_price;
    }

    get finalPrice() {
        return this._order.final_price;
    }

    get price() {
        return this.calulatedPrice;
    }

    get orderPhones() {
      let clientPhone = this._order.client.phone;
      let driverPhone = this._order.driver.phone;
      //console.log([ clientPhone, driverPhone ]);
      return [ clientPhone, driverPhone ]
    }

    //Evaluated
    get isHasOperator() {
        return this.operatorId != 0;
    }

    get statusDuration() {
        //console.log("moment", moment.duration(moment().diff(this.statusChangeTime)));
        return moment.duration(moment().diff(this.statusChangeTime));
    }

    get statusName() {
        return statusName(this.status);
    }

    get maxStatusDuration() {
        return configs.statusDurations[this.status] || configs.statusDurations[OTHER_STATUSES];
    }

    get statusDurationPct() {
        return 100 * this.statusDuration.asSeconds() / this.maxStatusDuration;
    }

    get statusDurationStr() {
        return `${Math.floor(this.statusDuration.asMinutes())}:${this.statusDuration.seconds()}`;
    }
}

class User {
    constructor(data) {
        this._data = data || {};
    }

    get id() {
        return this._data.id;
    }

    get phone() {
        return this._data.phone;
    }

    get firstName() {
        return this._data.first_name;
    }

    get middleName() {
        return this._data.middle_name;
    }

    get lastName() {
        return this._data.last_name;
    }

    get fullName() {
        return `${this.firstName} ${this.middleName} ${this.lastName}`;
    }

    get gender() {
        return this._data.gender;
    }

    get serviceId() {
        return this._data.service_id;
    }

    get name() {
        return this.fullName;
    }
}
