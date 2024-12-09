/**
 * Angular imports.
 */
import { Component, OnInit, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

/**
 * PrimeNg imports.
 */
import { MessageService } from 'primeng/api';

/**
 * Service imports.
 */
import { GoogleAnalyticsService, DescriptorService } from '@core/services';

/**
 * Interface imports.
 */
import { DescriptorGroup, DescriptorLayer, LayerSwipe } from '@core/interfaces';

/**
 * RXJS imports.
 */
import { Subscription } from 'rxjs';

/**
 * Descriptor imports.
 */
import { Descriptor, DescriptorType } from '@core/interfaces';

/**
 * OpenLayer imports.
 */
import Swipe from 'ol-ext/control/Swipe';
import { MapService } from '@core/services/map.service';
import { AutoCompleteCompleteEvent } from 'primeng/autocomplete';
import BaseLayer from 'ol/layer/Base';
import { LayerService } from '@core/services';

@Component({
  selector: 'app-swipe',
  templateUrl: './swipe.component.html',
  styleUrls: ['./swipe.component.scss'],
})
export class SwipeComponent implements OnInit, OnDestroy {
  @Output() handleLayersLegend: EventEmitter<any> = new EventEmitter();

  private desciptorSubscription: Subscription = new Subscription();

  private swipe: Swipe;

  private backupLayers: BaseLayer[] = [];

  public leftLayer: BaseLayer | null = null;
  public rightLayer: BaseLayer | null = null;

  public leftLayerDescriptor: DescriptorType | null = null;
  public rightLayerDescriptor: DescriptorType | null = null;

  private availableLayers: SuggestionLayer[] = [];

  public suggestions: SuggestionLayer[] = [];

  public inputLeft: string = '';
  public inputRight: string = '';

  public isMobile: boolean =
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|BB|PlayBook|IEMobile|Windows Phone|Kindle|Silk|Opera Mini/i.test(
      navigator.userAgent
    );

  constructor(
    private layerService: LayerService,
    private mapService: MapService,
    private descriptorService: DescriptorService,
    public googleAnalyticsService: GoogleAnalyticsService,
    public messageService: MessageService,
    public route: ActivatedRoute
  ) {
    this.desciptorSubscription.add(
      this.descriptorService.getDescriptor().subscribe({
        next: (descriptor: Descriptor | null) => {
          if (this.availableLayers.length != 0 || descriptor == null) return;

          this.fetchAvailableLayers(descriptor);
        }
      })
    );
  }

  public ngOnInit(): void {
    this.saveMapCurrentState();

    this.googleAnalyticsService.eventEmitter('Activate', 'GeoTools', 'Swipe');
  }

  ngOnDestroy(): void {
    this.desciptorSubscription.unsubscribe();

    this.clean();
  }

  private fetchAvailableLayers(descriptor: Descriptor): void {
    descriptor.groups.forEach((group: DescriptorGroup) => {
      group.layers.forEach((layer: DescriptorLayer) => {
        layer.types.forEach((type: DescriptorType) => {
          this.availableLayers.push({
            key: type.valueType,
            name: type.viewValueType,
          });
        });
      });
    });
  }

  public onSelectedLayer(event, side: boolean): void {
    this.createSwipe();

    let descriptorType = JSON.parse(JSON.stringify(this.descriptorService.getType(event.key)));

    this.layerService.createLayer(descriptorType)?.then((baselayer: BaseLayer) => {
      baselayer.setVisible(true);

      this.mapService.addLayer(baselayer);

      switch (side) {
        case false:
          this.swipe.removeLayers(this.leftLayerDescriptor);

          this.leftLayer = baselayer;
          this.leftLayerDescriptor = descriptorType;
          break;
        case true:
          this.swipe.removeLayer(this.rightLayerDescriptor);

          this.rightLayer = baselayer;
          this.rightLayerDescriptor = descriptorType;
      }
      
      this.swipe.addLayer(baselayer, side);

      //this.handleLayersLegend.emit({ valueType: event.key, visible: true });
    });
  }

  private createSwipe(): void {
    if (this.swipe != null) return;

    this.swipe = new Swipe();

    this.mapService.addControl(this.swipe);

    this.mapService.clean();
  }

  public onCleanInput(side: boolean): void {
    switch (side) {
      case false:
        this.inputLeft = '';

        if (this.leftLayer == null) break;

        this.swipe.removeLayer(this.leftLayer);
        this.mapService.removeLayer(this.leftLayer);

        this.leftLayer = null;
        this.leftLayerDescriptor = null;

        break;
      case true:
        this.inputRight = '';

        if (this.rightLayer == null) break;

        this.swipe.removeLayer(this.rightLayer);
        this.mapService.removeLayer(this.rightLayer);

        this.rightLayer = null;
        this.rightLayerDescriptor = null;

        break;
    }

    /*this.handleLayersLegend.emit({
      valueType: inputLayer.key,
      visible: false
    });*/

    if (this.leftLayerDescriptor === null && this.rightLayerDescriptor === null) this.clean();
  }

  public clean(): void {
    this.mapService.clean();

    this.recoverMapOldState();

    this.mapService.removeControl(this.swipe);

    this.swipe = null;

    this.leftLayerDescriptor = null;
    this.rightLayerDescriptor = null;
  }

  // Change layer source.
  public changeDate(event: any, side: boolean): void {
    let layerURLs: string[] = []

    switch (side) {
      case false:
        this.leftLayerDescriptor!.filterSelected = event.value;

        layerURLs = this.layerService.parseLayersURL(this.leftLayerDescriptor!, false);

        this.mapService.updateLayerSource(this.leftLayerDescriptor!.valueType, layerURLs);

        break;
      case true:
        this.rightLayerDescriptor!.filterSelected = event.value;

        layerURLs = this.layerService.parseLayersURL(this.rightLayerDescriptor!, false);

        this.mapService.updateLayerSource(this.rightLayerDescriptor!.valueType, layerURLs);

        break;
    }
  }

  private saveMapCurrentState(): void {
    this.backupLayers = this.mapService.layers.filter((layer: BaseLayer) => layer.get('type') === 'layertype');
  }

  private recoverMapOldState(): void {
    this.mapService.addLayers(this.backupLayers);
  }

  public search(event: AutoCompleteCompleteEvent) {
    this.suggestions = [];

    let queryNormalized = this.normalize(event.query);

    this.availableLayers.forEach((layer) => {
      let layerNormalized = this.normalize(layer.name);

      let result = this.normalize(layer.name).includes(this.normalize(event.query));

      if (layerNormalized.includes(queryNormalized)) this.suggestions.push(layer);
    });
  }

  normalize(value: string): string {
    return value
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }
}

interface SuggestionLayer {
  key: string;
  name: string;
}
