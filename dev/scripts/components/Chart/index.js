import React from 'react'
import {Pie, Bar} from 'react-chartjs-2'

const dataPie = {
  labels: [],
  datasets: [
    {
      backgroundColor: 'rgba(255,99,132,0.2)',
      borderColor: 'rgba(255,99,132,1)',
      borderWidth: 1,
      hoverBackgroundColor: 'rgba(255,99,132,0.4)',
      hoverBorderColor: 'rgba(255,99,132,1)',
      data: []
    }
  ]
};

const dataBar = {
  labels: [],
  datasets: [{
    data: [],
    backgroundColor: [
    '#FF6384',
    '#36A2EB',
    '#FFCE56',
    '#FFCE70',
    '#FFCE90'
    ],
    hoverBackgroundColor: [
    '#FF6384',
    '#36A2EB',
    '#FFCE56',
    '#FFCE70',
    '#FFCE90'
    ]
  }]
}

const getChartData = (data,type) => {
  let chartLabel, chartData;

  if( type == 'order' ) {
    chartData = data.countByState.data
    chartLabel
  }
}



export const Chart = (props) =>  {

  let { set, data, } = props
  let { chartType, statType } = set
  let ChartComponent
  let { chartLabel=[], chartData=[] } = getChartData( data, statType )




  switch ( chartType ) {
    case 'pie':
      ChartComponent = <Pie data={data} />
      break;
    case 'bar':
      ChartComponent = <Bar data={data} />
      break;
    default:
      ChartComponent =  <Pie data={data} />
  }



  return (
    <div>
      <h2>Doughnut Example</h2>
      {ChartComponent}
    </div>
  );

}
