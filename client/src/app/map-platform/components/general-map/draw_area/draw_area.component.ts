/**
 * Angular imports.
 */
import { Component, OnInit, Input, OnDestroy, ViewChild } from '@angular/core';

/**
 * Interfaces imports.
 */
import { RulerAreaCtrl } from '@core/interactions/ruler';
import { UserInfo } from '@core/interfaces/user_info';

/**
 * Services imports.
 */
import { AnalysisService } from '@core/services';
import { MapService } from '@core/services/map.service';

/**
 * PrimeNg imports.
 */
import { MessageService } from 'primeng/api';

/**
 * Open Layers imports.
 */
import { GeoJSON } from 'ol/format';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import { Fill, Stroke, Style } from 'ol/style';
import CircleStyle from 'ol/style/Circle';
import { Interaction, Modify, Snap } from 'ol/interaction';
import { UserInfoComponent } from '@core/components/user-info-dialog/user-info-dialog.component';
import { ReCaptchaV3Service } from 'ng-recaptcha';
import { Feature, Overlay } from 'ol';
import { DialogMessageComponent } from '@core/components/dialog-message/dialog-message.component';

const PRIMARY_COLOR = window
  .getComputedStyle(document.body)
  .getPropertyValue('--primary')
  .trim();

// TODO: Remover marcação com area da região quando a mesma for removida.

@Component({
  selector: 'app-draw-area',
  templateUrl: './draw_area.component.html',
  styleUrls: ['./draw_area.component.scss'],
})
export class DrawAreaComponent implements OnInit, OnDestroy {
  @ViewChild(UserInfoComponent) userInfo!: UserInfoComponent;
  @ViewChild(DialogMessageComponent) dialog!: DialogMessageComponent;

  private interaction!: Interaction;
  private vector: VectorLayer<any> = new VectorLayer(
    {properties: {
      key: 'draw'
    }}
  );
  private modify!: Modify;
  private snap: any;

  public features: any[] = [];

  public defaultStyle: Style = new Style({
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

  public highlightStyle: Style = new Style({
    fill: new Fill({
      color: 'rgba(255,255,255,0.52)',
    }),
    stroke: new Stroke({
      color: '#03f4fc',
      width: 3,
    }),
    image: new CircleStyle({
      radius: 5,
      fill: new Fill({
        color: '#fcba03',
      }),
    }),
  });

  private source: VectorSource<any> = new VectorSource();

  public isMobile: boolean =
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|BB|PlayBook|IEMobile|Windows Phone|Kindle|Silk|Opera Mini/i.test(
      navigator.userAgent
    );

  constructor(
    private mapService: MapService,
    private messageService: MessageService,
    private recaptchaV3Service: ReCaptchaV3Service,
    private analysisService: AnalysisService
  ) {}

  public ngOnInit(): void {
    let self = this;

    this.source.on('addfeature', function (ev) {
      const style = self.defaultStyle.clone();

      ev.feature!.setStyle(style);

      self.features.push(ev.feature);
    });    
  }

  public ngOnDestroy(): void {
    this.removeInteraction(true);
  }

  public draw() {
    this.initVectorLayerInteraction();

    this.addInteraction(new RulerAreaCtrl(this, true).getDraw(), false);
  }

  public unselect(): void {
    this.removeInteraction();
  }

  public getMap(): any {
    return this.mapService.map;
  }

  public getSource(): VectorSource {
    return this.source;
  }

  public getOverlay(overlay: Overlay) {
    return overlay;
  }

  public addOverlay(overlay: Overlay): void {
    let map = this.mapService.map;

    map.addOverlay(overlay);
  }

  // TODO: Não deveria existir.
  public addDrawInteraction(name: any): void {
    if (name === 'None') return;

    this.addInteraction(new RulerAreaCtrl(this, true).getDraw(), true);
  }

  public addInteraction(interaction: Interaction, removeInteraction: boolean = false): void {
    if (removeInteraction) this.removeInteraction(false);

    this.vector.setZIndex(1000000);

    this.mapService.addLayer(this.vector);

    this.modify = new Modify({ source: this.source });
    this.mapService.addInteraction(this.modify);

    this.interaction = interaction;
    this.mapService.addInteraction(this.interaction);

    this.snap = new Snap({ source: this.source });
    this.mapService.addInteraction(this.snap);
  }

  public removeInteraction(removeAll: boolean = false): void {
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
  }

  public initVectorLayerInteraction() {
    this.vector = new VectorLayer({
      zIndex: 100000,
      source: this.source,
      style: this.defaultStyle,
    });
  }

  public onHoverFeature(feature: any, leave: boolean = false) {
    const style = feature!.getStyle();

    if (leave) {
      style.setFill(this.defaultStyle.getFill());
      style.setStroke(this.defaultStyle.getStroke());
      style.setImage(this.defaultStyle.getImage());
    } else {
      style.setFill(this.highlightStyle.getFill());
      style.setStroke(this.highlightStyle.getStroke());
      style.setImage(this.highlightStyle.getImage());
    }

    feature.setStyle(style);
  }

  public onRemoveFeature(index: any, feature: any) {
    if (feature == null) return;

    this.source.removeFeature(feature);
    this.features.splice(index, 1);
  }

  // TODO: Open get user info on save.
  public onSave() {
    this.userInfo.getUserInfo().subscribe((user: UserInfo) => {
      this.saveGeoFile(user);
    });
  }

  public onCancel() {
    this.onRemoveFeature(0, this.features[0])
    this.removeInteraction();
  }

  // TODO: Recaptcha as service;
  public saveGeoFile(userInfo: UserInfo) {
    this.recaptchaV3Service
      .execute('importantAction')
      .subscribe((recaptcha: string) => {
        let geoJson = JSON.parse(this.getGeoJsonFromFeature());

        geoJson.features[0].properties = { id: 0 };

        this.analysisService
          .saveGeojson(geoJson, userInfo, recaptcha)
          .subscribe({
            next: (response) => {
              this.dialog.message(response.status)
            },
          });
      });
  }

  private getGeoJsonFromFeature(): string {
    let geom: Feature<any>[] = [];

    let writer = new GeoJSON({
      dataProjection: 'EPSG:4326',
      featureProjection: 'EPSG:3857',
    });

    this.source.getFeatures().forEach(function (feature) {
      let feat = new Feature(feature.getGeometry()!.clone().transform('EPSG:3857', 'EPSG:4326'));

      feat.setProperties(feature.getProperties());

      geom.push(feat);
    });

    return writer.writeFeatures(geom);
  }
}
