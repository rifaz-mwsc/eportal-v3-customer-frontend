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
  ApexNonAxisChartSeries,
  ApexResponsive,
} from 'ng-apexcharts';

export interface applicationStatusChart {
  series: ApexNonAxisChartSeries | ApexAxisChartSeries;
  chart: ApexChart;
  dataLabels: ApexDataLabels;
  plotOptions: ApexPlotOptions;
  tooltip: ApexTooltip;
  stroke: ApexStroke;
  legend: ApexLegend;
  responsive: ApexResponsive[];
  labels: string[];
  colors: string[];
}

@Component({
  selector: 'app-application-status-overview',
  standalone: true,
  imports: [MaterialModule, CommonModule, TablerIconsModule, NgApexchartsModule],
  templateUrl: './application-status-overview.component.html',
  styleUrls: ['./application-status-overview.component.scss']
})
export class ApplicationStatusOverviewComponent implements OnInit {
  @ViewChild('chart') chart: ChartComponent = Object.create(null);

  // KPI Stats
  stats = [
    {
      id: 1,
      icon: 'file-text',
      color: 'primary',
      title: 'Total Applications',
      value: '24',
      subtitle: 'All time',
      bgColor: 'bg-light-primary',
    },
    {
      id: 2,
      icon: 'clock',
      color: 'warning',
      title: 'Pending Review',
      value: '5',
      subtitle: 'Awaiting action',
      bgColor: 'bg-light-warning',
    },
    {
      id: 3,
      icon: 'circle-check',
      color: 'success',
      title: 'Approved',
      value: '18',
      subtitle: '75% success rate',
      bgColor: 'bg-light-success',
    },
    {
      id: 4,
      icon: 'refresh',
      color: 'error',
      title: 'Returned',
      value: '1',
      subtitle: 'Needs revision',
      bgColor: 'bg-light-error',
    },
  ];

  // Donut Chart Configuration
  public applicationStatusChart!: Partial<applicationStatusChart> | any;

  ngOnInit(): void {
    this.applicationStatusChart = {
      series: [18, 5, 1],
      chart: {
        type: 'donut',
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        height: 280,
      },
      plotOptions: {
        pie: {
          donut: {
            size: '70%',
            labels: {
              show: true,
              name: {
                show: true,
                fontSize: '14px',
                fontWeight: 600,
              },
              value: {
                show: true,
                fontSize: '22px',
                fontWeight: 700,
              },
              total: {
                show: true,
                label: 'Total',
                fontSize: '14px',
                fontWeight: 600,
                formatter: function (w: any) {
                  return w.globals.seriesTotals.reduce((a: number, b: number) => {
                    return a + b;
                  }, 0);
                },
              },
            },
          },
        },
      },
      dataLabels: {
        enabled: false,
      },
      stroke: {
        show: false,
      },
      legend: {
        show: true,
        position: 'bottom',
        fontSize: '13px',
        fontWeight: 500,
      },
      colors: ['#13DEB9', '#FFAE1F', '#FA896B'],
      labels: ['Approved', 'Pending', 'Returned'],
      tooltip: {
        theme: 'dark',
        fillSeriesColor: false,
      },
      responsive: [
        {
          breakpoint: 480,
          options: {
            chart: {
              height: 250,
            },
          },
        },
      ],
    };
  }
}
