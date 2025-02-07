/**
 * Angular imports.
 */
import { Component, OnInit, Input, OnDestroy } from '@angular/core';

/**
 * Interfaces imports.
 */
import { TextFilter } from '@core/interfaces';

/**
 * Services imports.
 */
import {
  RegionFilterService,
  DEFAULT_REGION,
  MapAPIService,
} from '@core/services';
import { MapService } from '@core/services/map.service';

/**
 * PrimeNg imports.
 */
import { AutoCompleteCompleteEvent } from 'primeng/autocomplete';

/**
 * RXJS imports.
 */
import { Observable } from 'rxjs';

/**
 * Open Layers imports.
 */
import { GeoJSON } from 'ol/format';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import { Fill, Stroke, Style } from 'ol/style';
import CircleStyle from 'ol/style/Circle';

const PRIMARY_COLOR = window
  .getComputedStyle(document.body)
  .getPropertyValue('--primary')
  .trim();

@Component({
  selector: 'app-filter',
  templateUrl: './filter.component.html',
  styleUrls: ['./filter.component.scss'],
})
export class FilterComponent implements OnInit, OnDestroy {
  @Input() onClose!: Observable<void>;

  public regionsLimits: any;

  public selectedSearchOption!: string;

  public selectRegion: any = DEFAULT_REGION;

  public listForAutoComplete!: any[];

  public selectValue: string = 'region';
  public selectOptions: any[] = [
    {
      label: 'controls.filter_texts.label_region',
      value: 'region',
      icon: 'language',
      placeholder: 'search_placeholder_region',
    },
    {
      label: 'controls.filter_texts.label_car',
      value: 'car',
      icon: 'home',
      placeholder: 'search_placeholder_region',
    },
    {
      label: 'controls.filter_texts.label_uc',
      value: 'uc',
      icon: 'nature_people',
      placeholder: 'search_placeholder_region',
    },
  ];

  public textsComponentesFilters: TextFilter = {
    emptyMessage: '',
    placeholder: '',
  };

  public autoCompleteValue: any = { text: '' };

  public otherLayerFromFilters: any = {
    layer: null,
  };

  private source: VectorSource<any> = new VectorSource();

  public features: any[] = [];

  public isMobile: boolean =
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|BB|PlayBook|IEMobile|Windows Phone|Kindle|Silk|Opera Mini/i.test(
      navigator.userAgent
    );

  constructor(
    private mapService: MapService,
    private regionFilterService: RegionFilterService,
    private mapAPIService: MapAPIService,
  ) {}

  public ngOnInit(): void {
    let self = this;

    this.selectedSearchOption = 'region';

    this.source.on('addfeature', function (vectorSourceEvent) {
      const text = new Style({
        stroke: new Stroke({
          color: PRIMARY_COLOR,
          width: 3,
        }),
        image: new CircleStyle({
          radius: 5,
          fill: new Fill({
            color: PRIMARY_COLOR,
          }),
        }),
      });

      vectorSourceEvent.feature!.setStyle(text);
      self.features.push(vectorSourceEvent.feature);
    });

    this.onChangeSearchOption();
  }

  public ngOnDestroy(): void {}

  public onClearFilter() {
    this.updateRegion(DEFAULT_REGION);

    this.autoCompleteValue = { text: '' };

    this.mapService.resetZoom();
  }

  public onChangeSearchOption() {
    this.textsComponentesFilters = {
      placeholder:
        'controls.filter_texts.search_placeholder_' + this.selectValue,
      emptyMessage: 'controls.filter_texts.search_failed_' + this.selectValue,
    };
  }

  public filterSearch(event: AutoCompleteCompleteEvent): void {
    let query: string = event.query;

    switch (this.selectValue.toLowerCase()) {
      case 'region':
        this.mapAPIService.getRegions(query).subscribe((result) => {
          this.listForAutoComplete = result.search;
        });
        break;
      case 'car':
        this.mapAPIService.getCARS(query).subscribe((result) => {
          this.listForAutoComplete = result.search;
        });
        break;
      case 'uc':
        this.mapAPIService.getUCs(query).subscribe((result) => {
          this.listForAutoComplete = result.search;
        });
        break;
    }
  }

  public onSelectFilter(event: any) {
    switch (this.selectValue) {
      case 'region':
        this.updateRegion(event);

        this.zoomExtent();

        break;
      default:
        this.updateAreaOnMap(event);

        break;
    }
  }

  private updateRegion(region: any = DEFAULT_REGION) {
    this.selectRegion = region;

    this.mapService.removeLayer(this.otherLayerFromFilters.layer);
    this.mapService.removeLayer(this.regionsLimits);

    this.regionFilterService.updateRegionFilter(this.selectRegion);
  }

  private zoomExtent() {
    if (this.selectRegion.type == '') return;

    let map = this.mapService.map;

    this.mapAPIService
      .getExtent(this.selectRegion)
      .subscribe((extentResult: ArrayBuffer) => {
        let features = new GeoJSON().readFeatures(extentResult, {
          dataProjection: 'EPSG:4326',
          featureProjection: 'EPSG:3857',
        });

        this.regionsLimits = this.createVectorLayer(features);

        this.mapService.addLayer(this.regionsLimits);

        // this.source = this.regionsLimits.getSource();
        this.source.clear();
        // @ts-ignore
        this.source.addFeature(features[0]);
        // @ts-ignore
        let extent = features[0].getGeometry().getExtent();

        map.getView().fit(extent, { duration: 1000 });
      });
  }

  private createVectorLayer(features: any) {
    return new VectorLayer({
      zIndex: 100000000,
      source: new VectorSource({ features }),
      style: [
        new Style({
          stroke: new Stroke({
            color: '#dedede',
            width: 3 + 1,
          }),
        }),
        new Style({
          stroke: new Stroke({
            color: '#666633',
            width: 3,
          }),
        }),
      ],
    });
  }

  private updateAreaOnMap(event: any) {
    if (this.selectRegion != DEFAULT_REGION) {
      this.onClearFilter()
    }

    this.mapService.removeLayer(this.otherLayerFromFilters.layer);

    this.autoCompleteValue = event;

    let vectorSource = new VectorSource({
      features: new GeoJSON().readFeatures(event.geojson, {
        dataProjection: 'EPSG:4326',
        featureProjection: 'EPSG:3857',
      }),
    });

    this.otherLayerFromFilters.layer = new VectorLayer({
      zIndex: 99,
      source: vectorSource,
      properties: {
        key: 'filter',
        type: 'filter',
      },
      style: [
        new Style({
          stroke: new Stroke({
            color: '#363230',
            width: 4,
          }),
        }),
        new Style({
          stroke: new Stroke({
            color: '#363230',
            width: 4,
            lineCap: 'round',
          }),
        }),
      ],
    });

    this.mapService.addLayer(this.otherLayerFromFilters.layer);

    let extent = this.otherLayerFromFilters.layer.getSource().getExtent();
    
    this.mapService.map.getView().fit(extent, { duration: 1800 });
  }
}
