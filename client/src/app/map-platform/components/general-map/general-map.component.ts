// TODO: O botão de resetar zoom ou não deveria resetar a geometri ou não deveria se chamar resetar zoom.

/**
 * Angular imports.
 */
import { OnDestroy } from '@angular/core';
import { ElementRef, HostListener } from '@angular/core';
import { OnInit, ViewChild, Component } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';

/**
 * PrimeNg imports.
 */
import { MessageService } from 'primeng/api';
import { PrimeNGConfig, SelectItem } from 'primeng/api';

/**
 * OpenLayers imports.
 */
import Map from 'ol/Map';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import CircleStyle from 'ol/style/Circle';
import VectorSource from 'ol/source/Vector';
import TileGrid from 'ol/tilegrid/TileGrid';
import * as Proj from 'ol/proj';
import { MapEvent, Overlay } from 'ol';
import { Interaction, Modify, Snap } from 'ol/interaction';
import { BingMaps, XYZ } from 'ol/source';
import { GeoJSON } from 'ol/format';
import { Fill, Stroke, Style } from 'ol/style';
import { transform, transformExtent } from 'ol/proj';
import { Pixel } from 'ol/pixel';
import * as OlExtent from 'ol/extent.js';

/**
 * Core imports.
 */
import { LocalizationService } from '@core/internationalization/localization.service';
import { RulerAreaCtrl, RulerCtrl } from '@core/interactions/ruler';

/**
 * Interfaces imports.
 */
import { Ruler, Job, RegionFilter } from '@core/interfaces';
import { DirtyType, LayerLegend } from '@core/interfaces';
import { Control, Descriptor, DescriptorType } from '@core/interfaces';
import { DescriptorGroup, DescriptorLayer } from '@core/interfaces';

/**
 * Services imports.
 */
import {
  DownloadService,
  MapAPIService,
  GalleryService,
} from '../../../@core/services';
import { RegionFilterService, DEFAULT_REGION } from '../../../@core/services';
import { GoogleAnalyticsService } from '../../../@core/services';
import { DescriptorService } from '../../../@core/services';

import { MapService } from '@core/services/map.service';

import { saveAs } from 'file-saver';

/**
 * PDFMaker imports.
 */
//import pdfMake from 'pdfmake/build/pdfmake';
//import pdfFonts from 'pdfmake/build/vfs_fonts';

/**
 * TURF imports.
 */
import * as turfHelper from '@turf/helpers';
import buffer from '@turf/buffer';
import turfDistance from '@turf/distance';
import booleanPointInPolygon from '@turf/boolean-point-in-polygon';
import turfCentroid from '@turf/centroid';

/**
 * Environment imports.
 */
import { environment } from '../../../../environments/environment';

/**
 * RXJS imports.
 */
import { Subscription } from 'rxjs';

/**
 * NgRecaptcha imports.
 */
import { OlMapComponent } from '@core/components/ol-map/ol-map.component';
import { LayerService } from '@core/services/layer.service';
import BaseLayer from 'ol/layer/Base';
import { UserInfoComponent } from '@core/components/user-info-dialog/user-info-dialog.component';
import { SwipeComponent } from './swipe/swipe.component';
import { DrawAreaComponent } from './draw_area/draw_area.component';

//pdfMake.vfs = pdfFonts.pdfMake.vfs;

// TODO: Medição não parece estar funcionando legal. Não é possivel cancelar o clique e manter a figura no mapa.
// TODO: Quando desenha poligonos ao terminar o desenho:
//    a) As vezes não é possivel fechar o poligono pois o texto fica na frente.
//    b) Ele abre as informações do ponto que foi clicado por ultimo.

const PROJECTION = Proj.get('EPSG:900913');

const PRIMARY_COLOR = window
  .getComputedStyle(document.body)
  .getPropertyValue('--primary')
  .trim();

@Component({
  selector: 'app-general-map',
  templateUrl: './general-map.component.html',
  styleUrls: [
    './general-map.component.scss',
    './responsivity/general-map.component-mobile.scss',
  ],
  providers: [MessageService],
})
export class GeneralMapComponent implements OnInit, OnDestroy, Ruler {
  @ViewChild(UserInfoComponent) userInfo!: UserInfoComponent;

  @ViewChild('video') video!: ElementRef;
  @ViewChild('wfsCard') wfsCard!: ElementRef;

  @ViewChild(OlMapComponent) olMap!: OlMapComponent;
  @ViewChild(SwipeComponent) swipeComponent!: SwipeComponent;
  @ViewChild(DrawAreaComponent) drawAreaComponent!: DrawAreaComponent;

  public features: any[] = [];

  private source: VectorSource<any> = new VectorSource();

  public mapSubscription: Subscription = new Subscription();
  public descriptorSubscription: Subscription = new Subscription();
  public regionFilterSubscription: Subscription = new Subscription();

  public env: any = environment;

  public action!: Function;

  public bmaps: any = [
    {
      layer: new TileLayer({
        properties: {
          key: 'mapbox',
          type: 'bmap',
          visible: true,
        },
        source: new XYZ({
          wrapX: false,
          url: 'https://api.mapbox.com/styles/v1/mapbox/light-v10/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoidGhhcmxlc2FuZHJhZGUiLCJhIjoiY2thaHAxcDM5MGx2dzJ4dDExaGQ0bGF3ciJ9.kiB2OzG3Q0THur8XLUW3Gg',
        }),
        visible: true,
      }),
    },
    {
      layer: new TileLayer({
        properties: {
          key: 'mapbox-dark',
          type: 'bmap',
          visible: false,
        },
        source: new XYZ({
          wrapX: false,
          url: 'https://api.mapbox.com/styles/v1/mapbox/dark-v10/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoidGhhcmxlc2FuZHJhZGUiLCJhIjoiY2thaHAxcDM5MGx2dzJ4dDExaGQ0bGF3ciJ9.kiB2OzG3Q0THur8XLUW3Gg',
        }),
        visible: false,
      }),
    },
    {
      layer: new TileLayer({
        properties: {
          key: 'bing',
          type: 'bmap',
          visible: false,
        },
        preload: Infinity,
        source: new BingMaps({
          key: 'VmCqTus7G3OxlDECYJ7O~G3Wj1uu3KG6y-zycuPHKrg~AhbMxjZ7yyYZ78AjwOVIV-5dcP5ou20yZSEVeXxqR2fTED91m_g4zpCobegW4NPY',
          imagerySet: 'Aerial',
        }),
        visible: false,
      }),
    },
    {
      layer: new TileLayer({
        properties: {
          key: 'google',
          type: 'bmap',
          visible: false,
        },
        source: new XYZ({
          url: 'https://mt{0-3}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',
        }),
        visible: false,
      }),
    },
    {
      layer: new TileLayer({
        properties: {
          key: 'google-hybrid',
          type: 'bmap',
          visible: false,
        },
        source: new XYZ({
          url: 'https://mt{0-3}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}',
        }),
        visible: false,
      }),
    },
    {
      layer: new TileLayer({
        properties: {
          key: 'estradas',
          type: 'bmap',
          visible: false,
        },
        preload: Infinity,
        source: new BingMaps({
          key: 'VmCqTus7G3OxlDECYJ7O~G3Wj1uu3KG6y-zycuPHKrg~AhbMxjZ7yyYZ78AjwOVIV-5dcP5ou20yZSEVeXxqR2fTED91m_g4zpCobegW4NPY',
          imagerySet: 'Road',
        }),
        visible: false,
      }),
    },
    {
      layer: new TileLayer({
        properties: {
          key: 'relevo',
          type: 'bmap',
          visible: false,
        },
        source: new XYZ({
          url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Shaded_Relief/MapServer/tile/{z}/{y}/{x}',
        }),
        visible: false,
      }),
    },
    {
      layer: new TileLayer({
        properties: {
          key: 'planet',
          type: 'bmap',
          visible: false,
        },
        source: new XYZ({
          url: 'https://tiles{0-3}.planet.com/basemaps/v1/planet-tiles/global_quarterly_2021q2_mosaic/gmap/{z}/{x}/{y}.png?api_key=d6f957677fbf40579a90fb3a9c74be1a',
        }),
        visible: false,
      }),
    },
  ];

  public layersLegend: LayerLegend[] = [];
  public selectedLayers: string[] = [];

  private isLayerHighResolution: boolean = false;

  public showFormPoint: boolean = false;
  public controlOptions: boolean = false;
  public _displayLayers!: boolean;
  public showRightSideBar!: boolean;
  public drawing: boolean = false;
  public lat!: number;
  public lon!: number;
  public classes!: string;

  public controlKeys: string[] = [
    'filter',
    'swipe',
    'drawArea',
    'measure',
    'measureArea',
  ];

  // TODO: Ferramenta de desenhar pontos.
  // TODO: Ferramentas de desenhar poderiam estar dentro da ferramenta de análise.
  public controlObjs: { [key: string]: Control } = {
    filter: {
      icon: 'fg-map-search',
      active: false,
      onClick: () => this.onSearch(),
    },
    swipe: {
      icon: 'fg-flip-h',
      active: false,
      onClick: () => this.onSwipe(),
    },
    drawArea: {
      icon: 'fg-polygon-pt',
      active: false,
      onClick: () => this.onDrawArea(),
    },
    measure: {
      icon: 'fg-measure',
      active: false,
      onClick: () => this.onMeasure(),
    },
    measureArea: {
      icon: 'fg-measure-area',
      active: false,
      onClick: () => this.onMeasureArea(),
    },
  };

  public popupOverlay!: Overlay;

  public featureCollections: any[] = [];

  public popupRegion: any = {
    coordinate: [],
    attributes: [],
    properties: {},
    geojson: {},
  };

  public tileGrid: TileGrid;

  public year: any;
  public isShowIformats: boolean = true;

  private interaction!: Interaction;

  private vector: VectorLayer<any> = new VectorLayer();
  private modify!: Modify;
  private draw: any;
  private snap: any;
  public defaultStyle: Style;
  public geoJsonStyles: any = {
    Point: new Style({
      image: new CircleStyle({
        radius: 5,
        stroke: new Stroke({
          color: PRIMARY_COLOR,
          width: 1,
        }),
      }),
    }),
    LineString: new Style({
      stroke: new Stroke({
        color: PRIMARY_COLOR,
        width: 1,
      }),
    }),
    MultiLineString: new Style({
      stroke: new Stroke({
        color: PRIMARY_COLOR,
        width: 1,
      }),
    }),
    MultiPoint: new Style({
      image: new CircleStyle({
        radius: 5,
        stroke: new Stroke({ color: 'red', width: 1 }),
      }),
    }),
    MultiPolygon: new Style({
      stroke: new Stroke({
        color: PRIMARY_COLOR,
        width: 1,
      }),
      fill: new Fill({
        color: 'rgba(255, 255, 0, 0.1)',
      }),
    }),
    Polygon: new Style({
      stroke: new Stroke({
        color: PRIMARY_COLOR,
        lineDash: [5],
        width: 3,
      }),
      fill: new Fill({
        color: 'rgba(22, 38, 35, 0.4)',
      }),
    }),
    GeometryCollection: new Style({
      stroke: new Stroke({
        color: PRIMARY_COLOR,
        width: 2,
      }),
      fill: new Fill({
        color: 'magenta',
      }),
      image: new CircleStyle({
        radius: 10,
        stroke: new Stroke({
          color: PRIMARY_COLOR,
        }),
      }),
    }),
    Circle: new Style({
      stroke: new Stroke({
        color: PRIMARY_COLOR,
        width: 2,
      }),
      fill: new Fill({
        color: 'rgba(255,0,0,0.2)',
      }),
    }),
  };

  public displayGallery: boolean = false;
  public gallery: any = [];

  public galleryResponsiveOptions: any[] = [
    {
      breakpoint: '1024px',
      numVisible: 5,
    },
    {
      breakpoint: '768px',
      numVisible: 3,
    },
    {
      breakpoint: '560px',
      numVisible: 1,
    },
  ];

  public otherLayerFromFilters: any = {
    layer: null,
    strokeColor: '#363230',
  };

  public legendExpanded: boolean = true;
  public isMobile: boolean;

  public displayFormJob: boolean = false;
  public job!: Job;
  public emailValid: boolean = true;

  constructor(
    private galleryService: GalleryService,
    private layerService: LayerService,
    private mapService: MapService,
    private descriptorService: DescriptorService,
    private regionFilterService: RegionFilterService,
    public localizationService: LocalizationService,
    private downloadService: DownloadService,
    private decimalPipe: DecimalPipe,
    private mapAPIService: MapAPIService,
    private messageService: MessageService,
    private primengConfig: PrimeNGConfig,
    private googleAnalyticsService: GoogleAnalyticsService
  ) {
    this.action = this.initDescriptor;

    this.descriptorSubscription.add(
      descriptorService.getDescriptor().subscribe({
        next: (descriptor: Descriptor | null) => {
          if (descriptor == null) return;

          this.action(descriptor);
        },
      })
    );

    this.regionFilterSubscription.add(
      regionFilterService.getRegionFilter().subscribe({
        next: (filter: RegionFilter) => {
          this.refreshLayersSource()
        },
      })
    )

    if (
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|BB|PlayBook|IEMobile|Windows Phone|Kindle|Silk|Opera Mini/i.test(
        navigator.userAgent
      )
    ) {
      this.legendExpanded = false;
      this.isMobile = true;
    } else {
      this.isMobile = false;
    }

    this.tileGrid = new TileGrid({
      extent: PROJECTION!.getExtent(),
      resolutions: this.getResolutions(PROJECTION),
      tileSize: 512,
    });

    this.defaultStyle = new Style({
      fill: new Fill({
        color: 'rgba(255,255,255,0.52)',
      }),
      stroke: new Stroke({
        color: this.otherLayerFromFilters.strokeColor,
        width: 6,
        lineCap: 'round',
      }),
      image: new CircleStyle({
        radius: 5,
        fill: new Fill({
          color: PRIMARY_COLOR,
        }),
      }),
    });

    this.initVectorLayerInteraction();

    this.mapService.addEvent('moveend', (event: MapEvent) =>
      this.onZoom(event)
    );
    this.mapService.addEvent('singleclick', (event: MapEvent) =>
      this.onDisplayFeatureInfo(event)
    );
  }

  public ngOnInit(): void {
    const self = this;
    this.primengConfig.ripple = true;
  }

  public ngOnDestroy(): void {
    this.descriptorSubscription.unsubscribe();
    this.mapSubscription.unsubscribe();
  }

  private onZoom(event: MapEvent): void {
    let zoom = event.map.get('view').get('zoom');

    if (!this.isLayerHighResolution && zoom >= 9) {
      this.isLayerHighResolution = true;

      this.refreshLayersSource();
    } else if (this.isLayerHighResolution && zoom < 9) {
      this.isLayerHighResolution = false;

      this.refreshLayersSource();
    }
  }

  private initDescriptor(descriptor: Descriptor) {
    this.initBasemaps(descriptor.basemaps);
    this.initLayers(descriptor.groups);
    this.initLimits(descriptor.limits);

    this.initLayersSelected(descriptor.groups);

    this.action = this.updateDescriptor;
  }

  private initBasemaps(basemaps: DescriptorLayer[]): void {
    basemaps.forEach((basemap: DescriptorLayer) => {
      basemap.types.forEach((type: DescriptorType) => {
        this.bmaps.forEach((bmap: any) => {
          if (type.valueType === bmap.layer.get('key')) {
            this.mapService.addLayer(bmap.layer);
          }
        });
      });
    });
  }

  private initLayers(groups: DescriptorGroup[]): void {
    groups.forEach((group: DescriptorGroup) => {
      group.layers.forEach((layer: DescriptorLayer) => {
        layer.types.forEach((type: DescriptorType) => {
          this.layerService
            .createLayer(type)
            ?.then((tileLayer: TileLayer<any>) => {
              this.mapService.addLayer(tileLayer);
            });
        });
      });
    });
  }

  private initLimits(limits: DescriptorLayer[]): void {
    limits.forEach((limit: DescriptorLayer) => {
      limit.types.forEach((type: DescriptorType) => {
        this.layerService
          .createLayer(type)
          ?.then((tileLayer: TileLayer<any>) => {
            this.mapService.addLayer(tileLayer);
          });
      });
    });
  }

  private updateDescriptor(descriptor: Descriptor): void {
    let { dirty, layer, layerType } = descriptor.dirtyBit;

    if (dirty == DirtyType.CLEAN) return;

    switch (layerType) {
      case 'layertype':
        this.handleLayerUpdate(layer!, dirty);
        break;
      case 'basemap':
        this.handleBasemapUpdate(layer!, dirty);
        break;
      case 'limits':
        this.handleLimitUpdate(layer!, dirty);
        break;
    }
  }

  private handleLayerUpdate(layerId: string, dirty: DirtyType): void {
    let descriptorLayer: DescriptorLayer =
      this.descriptorService.getLayer(layerId);

    switch (dirty) {
      case DirtyType.VISIBILITY:
        this.mapService.updateLayerVisibility(
          descriptorLayer.selectedType,
          descriptorLayer.visible
        );

        this.handleLayerSelected(descriptorLayer.selectedTypeObject!);
        break;
      case DirtyType.TRANSPARENCY:
        this.mapService.updateLayerOpacity(
          descriptorLayer.selectedType,
          descriptorLayer.opacity!
        );
        break;
      case DirtyType.SOURCE:
        descriptorLayer.types.forEach((descriptorType: DescriptorType) => {
          this.mapService.updateLayerSource(
            descriptorType.valueType,
            this.layerService.parseURLs(descriptorType)
          );
        });
        break;
      case DirtyType.TYPE:
        descriptorLayer.types.forEach((type: DescriptorType) => {
          this.mapService.updateLayerVisibility(type.valueType, false);
        });

        this.mapService.updateLayerVisibility(
          descriptorLayer.selectedType,
          true
        );

        break;
    }
  }

  // TODO: Deveria ter uma propriedade no descriptor com a resolução da layer.
  private refreshLayersSource(): void {
    this.mapService.layers.forEach((layer: BaseLayer) => {
      if (layer.get('type') === 'layertype')
        this.mapService.updateLayerSource(
          layer.get('key'),
          this.layerService.parseURLs(
            layer.get('descriptorType'),
            this.isLayerHighResolution
          )
        );
    });
  }

  private handleBasemapUpdate(layerId: string, dirty: DirtyType): void {
    let basemap: DescriptorLayer =
      this.descriptorService.getBsemapById(layerId);

    switch (dirty) {
      case DirtyType.VISIBILITY:
        this.updateBasemapVisibility(basemap);
        break;
    }
  }

  public updateBasemapVisibility(descriptorLayer: DescriptorLayer): void {
    let visible = descriptorLayer.selectedTypeObject!.visible;

    if (visible) {
      descriptorLayer.types.forEach((descriptorType: DescriptorType) => {
        this.mapService.updateLayerVisibility(descriptorType.valueType, false);
      });
    }

    this.mapService.updateLayerVisibility(
      descriptorLayer.selectedType,
      visible!
    );
  }

  private handleLimitUpdate(layerId: string, dirty: DirtyType): void {
    let limit: DescriptorLayer = this.descriptorService.getLimit(layerId);

    switch (dirty) {
      case DirtyType.VISIBILITY:
        this.updateLimitVisibility(limit);
        break;
    }
  }

  public updateLimitVisibility(descriptorLayer: DescriptorLayer): void {
    let visible = descriptorLayer.selectedTypeObject!.visible;

    if (visible) {
      descriptorLayer.types.forEach((descriptorType: DescriptorType) => {
        this.mapService.updateLayerVisibility(descriptorType.valueType, false);
      });
    }

    this.mapService.updateLayerVisibility(
      descriptorLayer.selectedType,
      visible!
    );
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    if (
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|BB|PlayBook|IEMobile|Windows Phone|Kindle|Silk|Opera Mini/i.test(
        navigator.userAgent
      )
    ) {
      this.legendExpanded = false;
      this.isMobile = true;
    } else {
      this.isMobile = false;
    }
  }

  searchPoint() {
    if (this.lat && this.lon) {
      this.showFormPoint = !this.showFormPoint;
    }
  }

  private getResolutions(projection: any) {
    let projExtent = projection.getExtent();
    let startResolution = OlExtent.getWidth(projExtent) / 256;
    let resolutions = new Array(22);
    for (let i = 0, ii = resolutions.length; i < ii; ++i) {
      resolutions[i] = startResolution / Math.pow(2, i);
    }
    return resolutions;
  }

  public initLayersSelected(descriptorGroups: DescriptorGroup[]): void {
    descriptorGroups.forEach((descriptorGroup: DescriptorGroup) => {
      descriptorGroup.layers.forEach((descriptorLayer: DescriptorLayer) => {
        descriptorLayer.types.forEach((descriptorType: DescriptorType) => {
          if (!descriptorType.visible) return;

          this.selectedLayers.push(descriptorType.valueType);

          this.layersLegend.push({
            key: descriptorType.valueType,
            label: descriptorType.typeLabel!,
            filter: descriptorType.filterSelected!,
            filterHandler: descriptorType.filterHandler!,
            expanded: true,
          });
        });
      });
    });

    this.updateZIndex();
  }

  public handleLayerSelected(descriptorType: DescriptorType): void {
    let isIncluded = this.selectedLayers.includes(descriptorType.valueType);

    if (isIncluded) {
      this.selectedLayers = this.selectedLayers.filter(
        (valueType: string) => descriptorType.valueType != valueType
      );

      this.layersLegend = this.layersLegend.filter(
        (layerLegend: LayerLegend) =>
          descriptorType.valueType != layerLegend.key
      );
    } else {
      this.selectedLayers.push(descriptorType.valueType);

      this.layersLegend.push({
        key: descriptorType.valueType,
        label: descriptorType.typeLabel!,
        filter: descriptorType.filterSelected!,
        filterHandler: descriptorType.filterHandler!,
        expanded: true,
      });
    }

    this.updateZIndex();
  }

  public toggleLayerLegend(legend: LayerLegend): void {
    legend.expanded = !legend.expanded;
  }

  private updateZIndex() {
    this.selectedLayers.forEach((valueType: string, index: number) => {
      this.mapService.updateLayerZIndex(valueType, index + 1);
    });
  }

  public updateLayersOrder(event: CdkDragDrop<string[]>) {
    moveItemInArray(
      this.selectedLayers,
      event.previousIndex,
      event.currentIndex
    );

    moveItemInArray(this.layersLegend, event.previousIndex, event.currentIndex);

    this.updateZIndex();
  }

  downloadSLD(valueType: string) {
    const layerType = this.descriptorService.getType(valueType);

    let name: string | undefined = '';

    if (layerType.filterHandler === 'layername') {
      name = layerType.filterSelected;
    } else {
      name = layerType.valueType;
    }

    this.downloadService
      .downloadRequestSLD(name)
      .toPromise()
      .then((blob: any) => {
        saveAs(blob, name + '.sld');
        layerType.download.loading = false;
      })
      .catch((error) => {
        this.messageService.add({
          life: 2000,
          severity: 'error',
          summary: this.localizationService.translate('sld.msg_error_title'),
          detail: this.localizationService.translate('sld.msg_error', {
            name: name + '.zip',
          }),
        });
      });
  }

  private initVectorLayerInteraction() {
    this.vector = new VectorLayer({
      zIndex: 100000,
      source: this.source,
      style: this.defaultStyle,
    });
  }

  public onSearch() {
    this.controlObjs['filter'].active = !this.controlObjs['filter'].active;
    this.controlOptions = true;
  }

  public onMeasure(): void {
    this.controlObjs['measure'].active = !this.controlObjs['measure'].active;
    if (this.controlObjs['measure'].active) {
      this.addInteraction(new RulerCtrl(this).getDraw());
      this.googleAnalyticsService.eventEmitter(
        'Activate',
        'GeoTools',
        'RulerLine'
      );
    } else {
      this.unselect();
    }
  }

  public onMeasureArea(): void {
    this.controlObjs['measureArea'].active =
      !this.controlObjs['measureArea'].active;
    if (this.controlObjs['measureArea'].active) {
      this.addInteraction(new RulerAreaCtrl(this).getDraw());
      this.googleAnalyticsService.eventEmitter(
        'Activate',
        'GeoTools',
        'RulerArea'
      );
    } else {
      this.unselect();
    }
  }

  onSwipe() {
    this.controlOptions = true;
    this.controlObjs['swipe'].active = !this.controlObjs['swipe'].active;
    this.googleAnalyticsService.eventEmitter('Activate', 'GeoTools', 'Swipe');

    if (!this.controlObjs['swipe'].active) this.swipeComponent.clean();
  }

  public onDrawArea(): void {
    this.controlOptions = true;

    this.controlObjs['drawArea'].active = !this.controlObjs['drawArea'].active;

    this.drawing = this.controlObjs['drawArea'].active;

    if(!this.controlObjs['drawArea'].active) this.drawAreaComponent.unselect();
  }

  getOverlay(overlay: Overlay) {
    return overlay;
  }

  onClearGeometries() {
    let map = this.mapService.map;

    this.features = [];
    this.source.clear();

    this.mapService.removeInteraction(this.interaction);
    this.mapService.removeLayer(this.vector);
    this.mapService.removeInteraction(this.modify);
    this.mapService.removeInteraction(this.snap);

    // @ts-ignore
    this.interaction = null;

    // @ts-ignore
    this.modify = null;
    this.snap = null;
    this.initVectorLayerInteraction();

    map.getOverlays().getArray().slice(0)
      .forEach((over) => {
        const properties = over.getOptions();
        if (properties.hasOwnProperty('id')) {
          if (properties.id === 'popup-info') over.setPosition(undefined);
        } else {
          map.removeOverlay(over);
        }
      });

    this.mapService.layers.forEach((layer: BaseLayer) => {
      if (layer.get('key') === 'points') {
        this.mapService.removeLayer(layer);
      }
    });

    this.lat = 0;
    this.lon = 0;

    this.controlObjs['point'].active = false;
    this.controlObjs['drawArea'].active = false;
    this.drawing = false;
  }

  removeInteraction(removeAll: boolean = false): void {
    this.features = [];
    if (removeAll) this.source.clear();

    this.mapService.removeInteraction(this.interaction);

    if (removeAll) this.mapService.removeLayer(this.vector);

    this.mapService.removeInteraction(this.modify);
    this.mapService.removeInteraction(this.snap);

    // @ts-ignore
    if (removeAll) this.interaction = null;

    // @ts-ignore
    if (removeAll) this.modify = null;
    if (removeAll) this.snap = null;
    this.initVectorLayerInteraction();
    this.drawing = false;
  }

  addDrawInteraction(name: any): void {
    this.drawing = true;

    if (name === 'None') return;

    this.addInteraction(new RulerAreaCtrl(this, true).getDraw(), name, true);
  }

  addInteraction(interaction: Interaction, type: string = '', removeInteraction: boolean = false): void {
    if (removeInteraction) this.removeInteraction(true);

    this.vector.setZIndex(1000000);

    this.interaction = interaction;
    this.drawing = true;

    this.mapService.addLayer(this.vector);

    if (type === 'Polygon') {
      this.modify = new Modify({ source: this.source });
      this.mapService.addInteraction(this.modify);
      this.mapService.addInteraction(this.interaction);
    } else {
      this.mapService.addInteraction(this.interaction);
    }

    this.snap = new Snap({ source: this.source });
    this.mapService.addInteraction(this.snap);
  }

  addOverlay(overlay: Overlay): void {
    let map = this.mapService.map;

    map.addOverlay(overlay);
  }

  getMap(): Map {
    let map = this.mapService.map;

    return map;
  }

  // @ts-ignore
  getSource(): VectorSource {
    return this.source;
  }

  unselect(): void {
    this.drawing = false;
    this.controlObjs['measureArea'].active = false;
    this.controlObjs['measure'].active = false;
    this.removeInteraction();
  }

  onExtentBrazil() {
    let map = this.mapService.map;

    map.getView().fit([], { duration: 900 });
  }

  printRegionsIdentification(token: any) {
    let dd = {
      pageSize: { width: 400, height: 400 },
      pageOrientation: 'portrait',
      content: [],
      styles: {
        titleReport: {
          fontSize: 16,
          bold: true,
        },
        textFooter: {
          fontSize: 9,
        },
        textImglegend: {
          fontSize: 9,
        },
        header: {
          fontSize: 18,
          bold: true,
          margin: [0, 0, 0, 10],
        },
        data: {
          bold: true,
        },
        subheader: {
          fontSize: 16,
          bold: true,
          margin: [0, 10, 0, 5],
        },
        codCar: {
          fontSize: 11,
          bold: true,
        },
        textObs: {
          fontSize: 11,
        },
        tableDpat: {
          margin: [0, 5, 0, 15],
          fontSize: 11,
        },
        tableHeader: {
          bold: true,
          fontSize: 13,
          color: 'black',
        },
        token: {
          bold: true,
          fontSize: 16,
        },
        metadata: {
          background: '#0b4e26',
          color: '#fff',
        },
      },
    };

    // @ts-ignore
    dd.content.push({
      image: this.localizationService.translate('area.token.logo'),
      width: 90,
      alignment: 'center',
    });
    // @ts-ignore
    dd.content.push({
      text: this.localizationService.translate('area.token.description'),
      alignment: 'center',
      margin: [10, 10, 20, 0],
    });
    // @ts-ignore
    dd.content.push({
      text: token,
      alignment: 'center',
      style: 'token',
      margin: [20, 20, 20, 10],
    });

    // @ts-ignore
    dd.content.push({
      qr: 'https://atlasdaspastagens.ufg.br/map/' + token.toString(),
      fit: '200',
      alignment: 'center',
    });

    const filename =
      this.localizationService.translate('area.token.title') +
      ' - ' +
      token +
      '.pdf';
    // const win = window.open('', '_blank');
    // pdfMake.createPdf(dd).open({}, win);
    // TODO: Fix it.
    //pdfMake.createPdf(dd).download(filename);

    this.googleAnalyticsService.eventEmitter(
      'Print_Identification_Token_Layer',
      'Upload',
      'uploadLayer'
    );
  }

  //-----------------> Filters:

  handleFilters(layerType: DescriptorType): string {
    let msFilter = 'true';

    let filters: any[] = [];

    if (layerType.filters!.length > 0) {
      if (layerType!.filterHandler == 'msfilter' && layerType!.filters)
        filters.push(layerType!.filterSelected);

      if (layerType!.regionFilter && this.regionFilterService.currentMsFilter)
        filters.push(this.regionFilterService.currentMsFilter);

      msFilter = filters.join('%20AND%20');
    }

    return '&MSFILTER=' + msFilter;
  }

  //----------------> Features:
  getFeatures(layer: any, bbox: any): Promise<any> {
    return new Promise<any>((resolve) => {
      let typeName = '';
      let msFilter = '&MSFILTER=1=1';
      if (typeof layer === 'string') {
        typeName = layer;
      } else {
        let layerType: DescriptorType = layer.get('descriptorType');
        typeName = layerType.valueType;
        if (layerType.hasOwnProperty('filters')) {
          msFilter = this.handleFilters(layerType);
        }
      }
      const url =
        `${environment.OWS}/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=${typeName}&outputFormat=application/json&bbox=${bbox},EPSG:4326${msFilter}`.trim();
      this.mapAPIService.getFeatures(url).subscribe(
        (features) => {
          if (typeof layer === 'string') {
            //do nothing
          } else {
            features['layerType'] = layer.get('descriptorType');
          }
          resolve(features);
        },
        (error) => {
          console.error(error);
          resolve(false);
        }
      );
    });
  }

  getFeatureToDisplay(pointClick: any, features: any) {
    features.forEach((feat: any) => {
      if (feat.geometry.type == 'Point') {
        feat['distance'] = turfDistance(
          turfHelper.point(pointClick),
          turfHelper.point(feat.geometry.coordinates)
        );
      } else {
        if (
          booleanPointInPolygon(
            turfHelper.point(pointClick),
            turfHelper.polygon(feat.geometry.coordinates)
          )
        ) {
          feat['distance'] = 0;
        } else {
          feat['distance'] = turfDistance(
            turfHelper.point(pointClick),
            turfCentroid(turfHelper.polygon(feat.geometry.coordinates))
          );
        }
      }
    });

    // TODO: Existem formas mais eficientes de retornar o menor valor.
    features.sort(
      (a: any, b: any) => parseFloat(a.distance) - parseFloat(b.distance)
    );

    return [features[0]];
  }

  closePopup() {
    const closer = document.getElementById('popup-closer');
    // @ts-ignore
    this.popupOverlay.setPosition(undefined);
    // @ts-ignore
    closer.blur();

    this.popupRegion = {
      coordinate: [],
      attributes: [],
      properties: {},
      geojson: {},
    };

    this.mapService.layers.forEach((layer) => {
      if (layer) {
        if (layer.get('key') === 'popup-vector') {
          this.mapService.removeLayer(layer);
        }
      }
    });
  }

  // TODO: Não esta mostrando info do ponto quando clicado, apenas do municipio.
  private onDisplayFeatureInfo(event: any): void {
    if (this.drawing) return;

    let map = this.mapService.map;

    let self = this;

    // Resetando variveis de controle.
    this.featureCollections = [];

    this.popupRegion = {
      coordinate: [],
      attributes: [],
      properties: {},
      geojson: {},
    };

    this.wfsCard.nativeElement.style.visibility = 'hidden';

    this.mapService.layers.forEach((layer) => {
      if (layer.get('key') === 'popup-vector') {
        this.mapService.removeLayer(layer);
      }
    });

    // Transforma as coordenadas do click para a projeção desejada.
    this.popupRegion.coordinate = transform(
      event.coordinate,
      'EPSG:3857',
      'EPSG:4326'
    );

    const bufferedPoint = buffer(
      { type: 'Point', coordinates: this.popupRegion.coordinate },
      20,
      {
        units: 'kilometers',
      }
    );

    const bufferSource = new VectorSource({
      features: new GeoJSON().readFeatures(bufferedPoint, {
        dataProjection: 'EPSG:4326',
        featureProjection: 'EPSG:3857',
      }),
    });

    const bbox = transformExtent(
      bufferSource.getExtent(),
      'EPSG:3857',
      'EPSG:4326'
    );

    const pixel: Pixel = map.getEventPixel(event.originalEvent);
    let promises: any[] = [];

    promises.push(this.getFeatures('municipios_info', bbox));

    map.forEachFeatureAtPixel(pixel, function (layer: any) {
      const layerType: DescriptorType = layer.get('descriptorType');
      if (
        layer.get('type') === 'layertype' &&
        layerType.typeLayer === 'vectorial' &&
        layer.getVisible() &&
        layerType.wfsMapCard.show
      ) {
        promises.push(self.getFeatures(layer, bbox));
      }
    });

    Promise.all(promises)
      .then((layersFeatures) => {
        if (layersFeatures.length <= 0) return;

        layersFeatures.forEach((featureCollection, index) => {
          if (featureCollection.features.length <= 0) return;

          if (index === 0) {
            featureCollection.features = this.getFeatureToDisplay(
              this.popupRegion.coordinate,
              featureCollection.features
            );

            this.popupRegion.geojson = featureCollection;
            this.popupRegion.properties =
              featureCollection.features[0].properties;

            this.mapAPIService.getMunicipalitiesAtributes().subscribe({
              next: (response) => {
                this.popupRegion.attributes = response;
              },
            });
          } else {
            featureCollection.features = this.getFeatureToDisplay(
              this.popupRegion.coordinate,
              featureCollection.features
            );
            featureCollection['expanded'] = true;

            if (featureCollection.layerType.hasOwnProperty('gallery')) {
              let params: string[] = [];

              params.push(
                'id=' +
                  featureCollection.features[0].properties[
                    featureCollection.layerType.gallery.id_column
                  ]
              );
              params.push(
                'tablename=' + featureCollection.layerType.gallery.tableName
              );
              let textParam = params.join('&');

              this.galleryService.getGalleryListById(textParam).subscribe(
                (files: any) => {
                  let filesToDisplay = {};
                  let arrKeys = Object.keys(files);
                  arrKeys.sort();

                  arrKeys.forEach((key) => {
                    filesToDisplay[key] = [];

                    if (files[key].length > 0) {
                      files[key].forEach((element) => {
                        let params = {
                          category: key,
                          tablename:
                            featureCollection.layerType.gallery.tableName,
                          id: featureCollection.features[0].properties[
                            featureCollection.layerType.gallery.id_column
                          ],
                          filename: element,
                        };

                        filesToDisplay[key].push(
                          '/service/gallery' +
                            '/field/' +
                            params.category +
                            '/' +
                            params.tablename +
                            '/' +
                            params.id +
                            '/' +
                            params.filename
                        ); // vetor com os endereços gerados pelo service abaixo. ALTERAR
                      });
                    }
                  });

                  let index = 0;

                  this.gallery = [];
                  for (let [key, value] of Object.entries(filesToDisplay)) {
                    // @ts-ignore
                    if (value.length > 0) {
                      // @ts-ignore
                      const items = value.map((url) => {
                        return {
                          type: key === 'videos_drone' ? 'video' : 'image',
                          url: environment.production
                            ? url
                            : environment.APP_URL + url,
                        };
                      });
                      this.gallery.push({
                        title: this.localizationService.translate(
                          'gallery.' + key
                        ),
                        key: key,
                        items: items,
                        activeIndex: 0,
                        show: true,
                      });
                      index++;
                    }
                  }
                },
                (error) => {
                  console.error(error);
                }
              );
            }

            this.featureCollections.push(featureCollection);
          }
        });

        if (this.featureCollections.length > 0) {
          this.featureCollections.forEach((featureJson) => {
            const vectorSource = new VectorSource({
              features: new GeoJSON().readFeatures(featureJson, {
                dataProjection: 'EPSG:4326',
                featureProjection: 'EPSG:3857',
              }),
            });
            const vectorLayer = new VectorLayer({
              source: vectorSource,
              // @ts-ignore
              style: (feature) =>
                this.geoJsonStyles[feature.getGeometry()!.getType()],
              properties: {
                key: 'popup-vector',
              },
              visible: true,
              zIndex: 100000,
            });
            this.mapService.addLayer(vectorLayer);
          });
        }

        if (
          this.popupRegion.geojson.hasOwnProperty('features') &&
          this.featureCollections.length <= 0
        ) {
          const vectorSource = new VectorSource({
            features: new GeoJSON().readFeatures(this.popupRegion.geojson, {
              dataProjection: 'EPSG:4326',
              featureProjection: 'EPSG:3857',
            }),
          });
          const vectorLayer = new VectorLayer({
            source: vectorSource,
            // @ts-ignore
            style: (feature) =>
              this.geoJsonStyles[feature.getGeometry()!.getType()],
            properties: {
              key: 'popup-vector',
            },
            visible: true,
            zIndex: 100000000,
          });
          this.mapService.addLayer(vectorLayer);
        }

        this.wfsCard.nativeElement.style.visibility = 'visible';
        this.wfsCard.nativeElement.style.bottom = '12px';
        this.wfsCard.nativeElement.style.left = '-50px';

        const container = document.getElementById('popup');
        // @ts-ignore
        this.popupOverlay = new Overlay({
          id: 'popup-info',
          element: container!,
          autoPan: false,
        });
        this.popupOverlay.setPosition(event.coordinate);
        map.addOverlay(this.popupOverlay);
      })
      .catch((error) => {
        console.error(error);
      });
  }

  public getAttributeValue(type: any, value: any) {
    let formattedValue: string | number | null = '';
    const lang = this.localizationService.currentLang();
    switch (type) {
      case 'integer':
        if (lang === 'pt') {
          formattedValue = this.decimalPipe.transform(value, '', 'pt-BR');
        } else {
          formattedValue = this.decimalPipe.transform(value, '', 'en-US');
        }
        break;
      case 'double':
        if (lang === 'pt') {
          formattedValue = this.decimalPipe.transform(value, '1.0-2', 'pt-BR');
        } else {
          formattedValue = this.decimalPipe.transform(value, '1.0-2', 'en-US');
        }
        break;
      case 'date':
        const isBrazilianDate = value.includes('/');
        if (isBrazilianDate) {
          formattedValue = value;
        } else {
          // TODO: Fix it.
          //formattedValue = moment(value).format('DD/MM/YYYY');
        }
        break;
      case 'string':
        formattedValue = value;
        break;
      default:
        formattedValue = value;
        break;
    }
    return formattedValue;
  }

  public loadVideo(key: any) {
    if (key === 'videos_drone') {
      const player = this.video.nativeElement;
      if (player) {
        player.load();
      }
    }
  }

  public onResetZoom(): void {
    this.mapService.resetZoom();
  }

  closeDetailsWindow() {
    Object.keys(this.controlObjs).forEach((key) => {
      this.controlObjs[key].active = false;
    });

    this.controlOptions = !this.controlOptions;

    this.drawing = false;
  }
}
