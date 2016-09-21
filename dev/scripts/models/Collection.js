import moment from 'moment'
import {statusName} from '../dicts/statuses'
import {Point} from '../structures/Point'

import {User} from './User'
import {Order} from './Order'
import {Driver} from './Driver'

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

const ORDER_STATE_BY_STAT = {
  complete : {
    title : 'complete',
    txt : 'Выполнен'
  },
  canceledByDriver : {
    title : 'canceled_by_driver',
    txt : 'Отменен водителем'
  },
  canceledByOperator : {
    title : 'canceled_by_operator',
    txt : 'Отменен оператором'
  },
  canceledByClient : {
    title : 'canceled_by_client',
    txt : 'Отменен клиентом'
  }
}



//
// export class Collection {
//     constructor(CollectionType = "", dataMap = new Map(), timeStamp = 0) {
//         this._timeStamp = timeStamp;
//         this._dataMap = dataMap;
//         this._CollectionType = CollectionType;
//     }
//
//     fromArray() {
//       let dataMap = this._dataMap;
//       let arrOfDataMap = Array.from(dataMap);
//
//       return arrOfDataMap;
//     }
//
//     fromServer( CollectionType, serverData ) {
//
//         let dataMap = this._dataMap;
//         for (let dataItem in serverData) {
//             const orderObj = serverData[dataItem];
//             const /*Order*/ order = new Order(orderObj);
//             mapOfOrders.set(order.id, order);
//         }
//         //console.log(mapOfOrders);
//         this._timeStamp = serverData.time_stamp;
//         this._dataMap = mapOfOrders;
//     }
//
//     get timeStamp() {
//         return this._timeStamp;
//     }
//
//     filter(fn) {
//         const dataMap = new Map();
//         const timeStamp = this._timeStamp;
//         const CollectionType = this._CollectionType;
//
//         this._dataMap.forEach((item, i) => {
//             if (fn(item, i)) {
//                 dataMap.set(item.id, item);
//             }
//         });
//
//        return new Collection(CollectionType,dataMap,timeStamp);
//     }
//
//     /*Array<Order>*/
//     toArray() {
//         const /*Array<Order>*/ newArray = [];
//
//         this._dataMap.forEach((item, i) => {
//             newArray.push(item);
//         });
//
//         return newArray;
//     }
//
//
//     getByOperator(operatorId) {
//         return this.filter(order=>order.operatorId == operatorId)
//     }
//
//     getByNotOperator(operatorId) {
//         return this.filter(order=>order.operatorId != operatorId)
//     }
//
//     getFree() {
//         return this.filter(order=>!(order.isHasOperator)&&(order.status == "new"))
//     }
//
//     getNewOrders() {
//         return this.filter(order=> order.status == "new")
//     }
//
//     getСlosedOrders() {
//         return this.filter(order=> order.status == "closed")
//     }
//
//     getOrderByState(currentState) {
//       if(currentState === "all") {
//         return this
//       }
//         return this.filter(order=> order.currentState == currentState)
//     }
//
//     getOrderByPhone(phone) {
//       if(!phone || phone === "" ) {
//         return this
//       }
//       return this.filter(order=> order.orderPhones.indexOf(phone) != -1)
//     }
//
//
// }

export class DriverCollection {
    constructor(mapOfDrivers = new Map()) {
        this._mapOfDrivers = mapOfDrivers;
    }

    fromArray() {
      let mapOfDrivers = this._mapOfOrders;
      let arrOfDrivers = Array.from(mapOfDrivers);

      return arrOfDrivers;
    }

    fromServer(serverData) {
        let mapOfDrivers = this._mapOfDrivers;
        for (let i = 0; i < serverData.data.length; i++) {
          const driver = new Driver(serverData.data[i]);
          mapOfDrivers.set(driver.id, driver);
        }
        //console.log(mapOfOrders);
        //this._timeStamp = serverData.time_stamp;
        this._mapOfDrivers = mapOfDrivers;
    }

    /**
     * @param ids
     * @returns {Array.<*>}
     */
    toArray(/*Array*/ ids = null) {

        if (ids == null) {
            const result = [];
            this._mapOfDrivers.forEach((driver)=> {
                if (driver)
                    result.push(driver);
            });
            return result;
        } else {
            return ids
                .map(id=>this.get(id))
                .filter(driver=>!!driver);
        }
    }

    get(id) {
        return this._mapOfDrivers.get(id);
    }

    filter(fn) {
        const mapOfDrivers = new Map();
        const timeStamp = this._timeStamp;

        this._mapOfDrivers.forEach((driver, i) => {
            if (fn(driver, i)) {
                mapOfDrivers.set(driver.id, driver);
            }
        });

       return new DriverCollection(mapOfDrivers);
    }

    getDriverByState(currentStatus) {
      if(currentStatus === "all") {
        return this
      }
        return this.filter(driver=> driver.status == currentStatus)
    }

    getDriverByPhone(phone) {
      if(!phone || phone === "" ) {
        return this
      }
      return this.filter(driver=> driver.driverPhones.indexOf(phone) != -1)
    }

}

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

    getStatisticForDriver() {
        let mapOfOrders = this._mapOfOrders;
        let orderState = ORDER_STATE_BY_STAT;

        let statMap = new  Map();
            statMap
              .set('all' , mapOfOrders.size)
              .set('complete' , 0)
              .set('canceled_by_driver' , 0)
              .set('canceled_by_operator' , 0)
              .set('canceled_by_client' , 0)

        this._mapOfOrders.forEach((order, i) => {
            let count = 0;
            switch (order.currentState) {
              case "complete":
                count = statMap.get('complete') + 1 ;
                statMap.set('complete',count)
                break;
              case "canceled_by_driver":
                count = statMap.get('canceled_by_driver') + 1 ;
                statMap.set('canceled_by_driver',count)
                break;
              case "canceled_by_operator":
                count = statMap.get('canceled_by_operator') + 1 ;
                statMap.set('canceled_by_operator',count)
                break;
              case "canceled_by_client":
                count = statMap.get('canceled_by_client') + 1 ;
                statMap.set('canceled_by_client',count)
                break;
            }
        });
        console.log('statMap', statMap);
        return statMap;
       //return new OrderCollection(mapOfOrders,timeStamp);
      }
    }

    getStatisticForOrder() {
      let mapOfOrders = this._mapOfOrders;
      let orderState = ORDER_STATE_BY_STAT;

      let statMap = new  Map();
          statMap
            .set('all' , mapOfOrders.size)
            .set('complete' , 0)
            .set('canceled_by_driver' , 0)
            .set('canceled_by_operator' , 0)
            .set('canceled_by_client' , 0)

      this._mapOfOrders.forEach((order, i) => {
          let count = 0;
          switch (order.currentState) {
            case "complete":
              count = statMap.get('complete') + 1 ;
              statMap.set('complete',count)
              break;
            case "canceled_by_driver":
              count = statMap.get('canceled_by_driver') + 1 ;
              statMap.set('canceled_by_driver',count)
              break;
            case "canceled_by_operator":
              count = statMap.get('canceled_by_operator') + 1 ;
              statMap.set('canceled_by_operator',count)
              break;
            case "canceled_by_client":
              count = statMap.get('canceled_by_client') + 1 ;
              statMap.set('canceled_by_client',count)
              break;
          }
      });
      console.log('statMap', statMap);
      return statMap;
     //return new OrderCollection(mapOfOrders,timeStamp);
    }
}

// const ORDER_STATE_BY_STAT = {
//   complete : {
//     title : 'complete',
//     txt : 'Выполнен'
//   },
//   canceledByDriver : {
//     title : 'canceled_by_driver',
//     txt : 'Отменен водителем'
//   },
//   canceledByOperator : {
//     title : 'canceled_by_operator',
//     txt : 'Отменен оператором'
//   },
//   canceledByClient : {
//     title : 'canceled_by_client',
//     txt : 'Отменен клиентом'
//   }
// }
// [
//     {key: "Фамилия", value: driver.lastName},
//     {key: "Имя", value: driver.firstName},
//     {key: "Отчество", value: driver.middleName},
//     {key: "Пол", value: driver.sex},
//     {key: "Дата рождения", value: driver.birthDate.format("DD.MM.YYYY")},
//     {key: "Телефон", value: driver.phone},
//     {key: "Адрес", value: driver.address},
//     {key: "ИНН", value: driver.PMT},
//     {key: "Паспорт", value: driver.passport},
// ],
export class makeStatistic {
    constructor(ordersMap = new Map(), timeStamp = 0) {
        this._timeStamp = timeStamp;
        this._mapOfOrders = ordersMap;
        this._orderStat = {
          count: 0,
          amount: 0,
          maxDistance: 0,
          minDistance: 0,
          midDistance: 0
        };
        this._orderByState = {
          complete : {
              title : 'complete',
              txt : 'Выполнен',
              count: 0
            },
            canceledByDriver : {
              title : 'canceled_by_driver',
              txt : 'Отменен водителем',
              count: 0
            },
            canceledByOperator : {
              title : 'canceled_by_operator',
              txt : 'Отменен оператором',
              count: 0
            },
            canceledByClient : {
              title : 'canceled_by_client',
              txt : 'Отменен клиентом',
              count: 0
            }
        }
    }

    fromArray() {
      let mapOfOrders = this._mapOfOrders;
      let arrOfOrders = Array.from(mapOfOrders);

      return arrOfOrders;
    }

    init() {

      this._mapOfOrders.forEach((order, i) => {
          let count = 0;
          switch (order.currentState) {
            case "complete":
              count = orderStatMap.get('complete') + 1 ;
              orderStatMap.set('complete',count)
              break;
            case "canceled_by_driver":
              count = orderStatMap.get('canceled_by_driver') + 1 ;
              orderStatMap.set('canceled_by_driver',count)
              break;
            case "canceled_by_operator":
              count = orderStatMap.get('canceled_by_operator') + 1 ;
              orderStatMap.set('canceled_by_operator',count)
              break;
            case "canceled_by_client":
              count = orderStatMap.get('canceled_by_client') + 1 ;
              orderStatMap.set('canceled_by_client',count)
              break;
          }
      });
    }

    prepare() {
      return {
          driver : [{}],
          order : [{}],
          countByState: [{}]
      }
    }
}
