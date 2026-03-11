import { Component, OnInit, ViewChild } from '@angular/core';
import { MaterialModule } from '../../../material.module';
import { CommonModule } from '@angular/common';
import { TablerIconsModule } from 'angular-tabler-icons';
import {
  ApexChart,
  ChartComponent,
  ApexDataLabels,
  ApexLegend,
  ApexStroke,
  ApexTooltip,
  ApexAxisChartSeries,
  ApexPlotOptions,
  NgApexchartsModule,
  ApexXAxis,
  ApexYAxis,
  ApexGrid,
  ApexFill,
} from 'ng-apexcharts';

export interface processingTimelineChart {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  dataLabels: ApexDataLabels;
  plotOptions: ApexPlotOptions;
  tooltip: ApexTooltip;
  stroke: ApexStroke;
  legend: ApexLegend;
  xaxis: ApexXAxis;
  yaxis: ApexYAxis;
  grid: ApexGrid;
  fill: ApexFill;
  colors: string[];
}

@Component({
  selector: 'app-processing-timeline',
  standalone: true,
  imports: [MaterialModule, CommonModule, TablerIconsModule, NgApexchartsModule],
  templateUrl: './processing-timeline.component.html',
  styleUrls: ['./processing-timeline.component.scss']
})
export class ProcessingTimelineComponent implements OnInit {
  @ViewChild('chart') chart: ChartComponent = Object.create(null);

  public processingTimelineChart!: Partial<processingTimelineChart> | any;

  ngOnInit(): void {
    this.processingTimelineChart = {
      series: [
        {
          name: 'Applications Submitted',
          type: 'column',
          data: [8, 12, 6, 15, 10, 14],
        },
        {
          name: 'Applications Completed',
          type: 'line',
          data: [6, 10, 5, 12, 8, 11],
        },
        {
          name: 'Avg. Processing Days',
          type: 'line',
          data: [9, 8, 10, 7, 8, 6],
        },
      ],
      chart: {
        type: 'line',
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        height: 350,
        toolbar: {
          show: false,
        },
      },
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: '50%',
          borderRadius: 4,
        },
      },
      dataLabels: {
        enabled: false,
      },
      stroke: {
        width: [0, 3, 3],
        curve: 'smooth',
      },
      xaxis: {
        categories: ['Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb'],
        labels: {
          style: {
            fontSize: '13px',
            fontWeight: 500,
          },
        },
      },
      yaxis: [
        {
          title: {
            text: 'Applications',
            style: {
              fontSize: '13px',
              fontWeight: 600,
            },
          },
          labels: {
            style: {
              fontSize: '12px',
            },
          },
        },
        {
          opposite: true,
          title: {
            text: 'Days',
            style: {
              fontSize: '13px',
              fontWeight: 600,
            },
          },
          labels: {
            style: {
              fontSize: '12px',
            },
          },
        },
      ],
      legend: {
        show: true,
        position: 'top',
        fontSize: '13px',
        fontWeight: 500,
        markers: {
          width: 10,
          height: 10,
        },
      },
      grid: {
        borderColor: 'rgba(0,0,0,0.1)',
        strokeDashArray: 3,
      },
      fill: {
        opacity: [0.85, 1, 1],
      },
      colors: ['#5D87FF', '#13DEB9', '#FFAE1F'],
      tooltip: {
        theme: 'dark',
        fillSeriesColor: false,
      },
    };
  }
}
