/**
 * Angular imports.
 */
import { AfterViewInit, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AnalysisService } from '@core/services';

/**
 * OpenLayers imports
 */
import GeoJSON from 'ol/format/GeoJSON.js';
import OlMap from 'ol/Map.js';
import View from 'ol/View.js';
import {Fill, Stroke, Style} from 'ol/style.js';
import {OSM, Vector as VectorSource} from 'ol/source.js';
import {Tile as TileLayer, Vector as VectorLayer} from 'ol/layer.js';
import * as Proj from 'ol/proj';

// Tokn de teste: 390c7d96-d6ca-4308-bfaa-d4f6c7049510

@Component({
  selector: 'app-analysis',
  templateUrl: './analysis.component.html',
  styleUrls: ['./analysis.component.scss'],
})
export class AnalysisComponent implements OnInit, AfterViewInit {
  private map: OlMap = new OlMap({
    target: 'map',
    layers: [
      new TileLayer({
        source: new OSM(),
      }),
    ],
    view: new View({
      projection: 'EPSG:4326',
    }),
  });

  public transitionChart: any | null = null;
  public pastureCharts: any[] | null = null;
  public indexesCharts: any[] | null = null;
  

  private token: string;

  msg: any = [];

  c_pasture = '#EDDE8E';
  c_precipitation = '#72C3DC';
  c_vigor = ['#F06B6E', '#F3B377', '#62AE56'];
  classe_id = {
    'Baixo Vigor': 1,
    'Médio Vigor': 2,
    'Alto Vigor': 3,
  };

  constructor(
    private analysisService: AnalysisService,
    private activatedRoute: ActivatedRoute
  ) {
    this.token = activatedRoute.snapshot.params['token'];
  }
  ngAfterViewInit(): void {
    this.map.setTarget('analysis-map');
  }

  ngOnInit(): void {
    this.fetchPastureData(this.token);
  }

  public fetchPastureData(token: string): void {
    this.analysisService.getAnalysisByToken(token).subscribe({
      next: (result: any) => {
        this.pastureCharts = [];
        this.indexesCharts = [];

        this.addGeometryToMap(result.geojson);

        this.transitionChart = this.createPastureIndexesAndPrecipitationChart(result.pasture);

        this.pastureCharts.push(this.createPastureAreaChart(result.pasture));
        this.pastureCharts.push(this.createVigorAreaChart(result.pasture_vigor));
        
        this.indexesCharts.push(...this.createVigorIndexesChart(result.pasture_vigor));
      },
      error: (error) => {
        console.error('Erro ao buscar dados da API:', error);
        this.msg = [
          {
            severity: 'error',
            summary: 'Erro',
            detail: 'Não foi possível carregar os dados.',
          },
        ];
      },
    });
  }

  private addGeometryToMap(geoJson: GeoJSON) {
    const styles = {
      'Polygon': new Style({
        stroke: new Stroke({
          color: 'blue',
          lineDash: [4],
          width: 3,
        }),
        fill: new Fill({
          color: 'rgba(0, 0, 255, 0.1)',
        }),
      }),
    };
    
    const styleFunction = function (feature) {
      return styles[feature.getGeometry().getType()];
    };
    
    const vectorSource = new VectorSource({
      features: new GeoJSON().readFeatures(geoJson),
    });
    
    const vectorLayer = new VectorLayer({
      source: vectorSource,
      style: styleFunction,
    });

    this.map.addLayer(vectorLayer);

    this.map.once('postrender', () => {
      const extent = vectorSource.getExtent();

      this.map.getView().fit(extent, {
        size: this.map.getSize(),
        padding: [50, 50, 50, 50],
      });
    });
  }

  private createPastureAreaChart(pastureResults: any): any {
    const datasets = [
      this.createDataset(
        'Área (ha)',
        pastureResults.area_ha.label,
        pastureResults.area_ha.datasets[0].data,
        this.c_pasture,
        'line',
        'y1'
      ),
    ];

    return {
      title: 'Área de Pastagem',
      text: 'Variação da Área de Pastagem ao Longo dos Anos',
      type: 'line',
      data: {
        labels: pastureResults.area_ha.label,
        datasets: datasets,
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: { title: { display: true, text: 'Ano' } },
          y1: {
            type: 'linear',
            position: 'left',
            title: { display: true, text: 'Área de Pastagem (ha)' },
            beginAtZero: true,
          },
        },
      },
    };
  }

  private createPastureIndexesAndPrecipitationChart(pastureResults: any): any {
    const datasets = [
      this.createDataset(
        'CAI',
        pastureResults.cai.label,
        pastureResults.cai.datasets[0].data,
        '#FFD700',
        'line',
        'y1'
      ),
      this.createDataset(
        'NDVI',
        pastureResults.ndvi.label,
        pastureResults.ndvi.datasets[0].data,
        '#32CD32',
        'line',
        'y1'
      ),
      this.createDataset(
        'NWDI',
        pastureResults.nwdi.label,
        pastureResults.nwdi.datasets[0].data,
        '#1E90FF',
        'line',
        'y1'
      ),
      this.createDataset(
        'Precipitação (mm)',
        pastureResults.precipitation.label,
        pastureResults.precipitation.datasets[0].data,
        this.c_precipitation,
        'bar',
        'y2'
      ),
    ];

    return {
      title: 'Índices de Pastagem e Precipitação',
      text: 'Variação dos Índices de Pastagem e Precipitação ao Longo dos Anos',
      type: 'line',
      data: {
        labels: pastureResults.area_ha.label,
        datasets: datasets,
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: { title: { display: true, text: 'Ano' } },
          y1: {
            type: 'linear',
            position: 'left',
            title: { display: true, text: 'Valor do Índice' },
            beginAtZero: true,
          },
          y2: {
            type: 'linear',
            position: 'right',
            title: { display: true, text: 'Precipitação (mm)' },
            grid: {
              drawOnChartArea: false, // Para evitar sobreposição de grades dos dois eixos Y
            },
            beginAtZero: true,
          },
        },
      },
    };
  }

  private createVigorAreaChart(pastureVigorResults: any): any {
    const datasets: any[] = [];

    pastureVigorResults.area_ha.datasets.forEach(
      (dataset: any, classIndex: number) => {
        datasets.push(
          this.createDataset(
            `Área - ${Object.keys(this.classe_id)[classIndex]}`,
            pastureVigorResults.area_ha.label,
            dataset.data,
            this.c_vigor[classIndex],
            'line',
            'y1'
          )
        );
      }
    );

    return {
      title: 'Área de Vigor da Pastagem',
      text: 'Variação da Área de Vigor da Pastagem ao Longo dos Anos',
      type: 'line',
      data: {
        labels: pastureVigorResults.area_ha.label,
        datasets: datasets,
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: { title: { display: true, text: 'Ano' } },
          y1: {
            type: 'linear',
            position: 'left',
            title: { display: true, text: 'Área (ha)' },
            beginAtZero: true,
          },
        },
      },
    };
  }

  private createVigorIndexesChart(pastureVigorResults: any): any {
    const charts: any[] = [];

    const datasets: any[] = [];

    const vigorKeys = ['cai', 'ndiv', 'ndwi'];

    vigorKeys.forEach((key) => {
      let new_datasets: any[] = [];

      pastureVigorResults[key].datasets.forEach(
        
        (dataset: any, classIndex: number) => {
          new_datasets.push(
            this.createDataset(
              `${key.toUpperCase()} - ${
                Object.keys(this.classe_id)[classIndex]
              }`,
              pastureVigorResults[key].label,
              dataset.data,
              this.c_vigor[classIndex],
              'line',
              'y1'
            )
          );
        }
      );

      charts.push({
        title: 'Índices de Vigor da Pastagem',
        text: `Variação do Índice de ${key.toUpperCase()} ao Longo dos Anos`,
        type: 'line',
        data: {
          labels: pastureVigorResults.area_ha.label,
          datasets: new_datasets,
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            x: { title: { display: true, text: 'Ano' } },
            y1: {
              type: 'linear',
              position: 'left',
              title: { display: true, text: 'Valor do Índice' },
              beginAtZero: true,
            },
          },
        },
      })
    });

    return charts;
  }

  private createDataset(
    label: string,
    labels: any[],
    data: any[],
    color: string,
    chartType: string,
    yAxisID: string
  ): any {
    return {
      label: label,
      data: data,
      type: chartType,
      borderColor: color,
      backgroundColor: color,
      fill: false,
      yAxisID: yAxisID,
    };
  }
}
