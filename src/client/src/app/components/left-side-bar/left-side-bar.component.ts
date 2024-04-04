import {
  Component,
  EventEmitter,
  AfterViewInit,
  Renderer2,
  ElementRef,
  Output,
  HostListener,
  Input,
  SimpleChanges, ChangeDetectorRef
} from '@angular/core';

import { LocalizationService } from "../../@core/internationalization/localization.service";
import {
  Menu,
  Descriptor,
  DescriptorType,
  DescriptorLayer,
  DescriptorMetadata,
  Metadata
} from "../../@core/interfaces";
import { MessageService } from "primeng/api";
import { MenuItem } from 'primeng/api';
import { Fill, Stroke, Style } from "ol/style";
import Text from "ol/style/Text";
import Graticule from 'ol-ext/control/Graticule';
import Compass from 'ol-ext/control/Compass';
import { GoogleAnalyticsService } from "../services/google-analytics.service";
import {loadFeaturesXhr} from "ol/featureloader";
import {ActivatedRoute, Router} from "@angular/router";
import { environment } from "../../../environments/environment";

@Component({
  selector: 'app-left-side-bar',
  templateUrl: './left-side-bar.component.html',
  styleUrls: ['./left-side-bar.component.scss'],
  providers: [MessageService]
})

export class LeftSideBarComponent implements AfterViewInit {
  @Input() descriptor: Descriptor;
  @Input() loadingDownload: any;
  @Output() onSideBarToggle = new EventEmitter<boolean>();
  @Output() onNavBarToggle = new EventEmitter<boolean>();
  @Output() onMenuToggle = new EventEmitter<boolean>();
  @Output() onMenuSelected = new EventEmitter<any>();
  @Output() onChangeLng = new EventEmitter<any>();
  @Output() updateCharts = new EventEmitter<any>();
  @Output() onLayerChangeVisibility = new EventEmitter<any>();
  @Output() onLayerChangeTransparency = new EventEmitter<any>();
  @Output() onDownload = new EventEmitter<any>();
  @Output() onChangeMap = new EventEmitter<any>();
  @Output() onChangeLimits = new EventEmitter<any>();
  @Output() displayFilter = new EventEmitter<any>();

  public token: number;
  public basemap: any;
  public basesmaps: any[];
  public limits: any[];
  public limit: any;

  public options: any[];
  public option: any;

  items: MenuItem[];

  public display: boolean;
  public open: boolean;
  public map: any;
  public lang: string;
  public menu: Menu[];
  public innerHeigth: number;
  public layersSideBar: boolean;
  public layersSideBarMobile: boolean;
  public showFilter: boolean;
  public layersTitle: string;
  public menuMobile: Menu[];
  public currentMenu: Menu;
  public optionsGroups: any;
  public expendGroup: boolean;
  public expendGroup2: boolean;

  public displayStatistics: boolean;
  public displayStatisticsMobile: boolean;

  public textSearch: string;
  public results: string[];
  public groupLayers: any[];

  public metadata: Metadata;
  public displayMetadata: boolean;
  public COMMIT_ID = `Build: ${environment.COMMIT_ID}`

  constructor(
    protected el: ElementRef,
    public localizationService: LocalizationService,
    protected renderer: Renderer2,
    protected messageService: MessageService,
    protected cdRef: ChangeDetectorRef,
    public router: Router,
    public route: ActivatedRoute,
    protected googleAnalyticsService: GoogleAnalyticsService,
  ) {
    this.metadata = { header: { title: '', description: '' }, data: [] };
    this.displayMetadata = false;
    this.showFilter = false;
    this.open = true;
    this.layersSideBar = false;
    this.layersSideBarMobile = false;
    this.map = {};
    this.limits = [];
    this.options = [];
    this.menu = [
      {
        index: 0,
        key: 'layers',
        icon: 'fg-layers',
        show: false
      },
      {
        index: 1,
        key: 'statistics',
        icon: 'bx bx-bar-chart-alt',
        show: false
      },
      {
        index: 2,
        key: 'area',
        icon: 'fg-polygon-hole-pt',
        show: false
      },
      {
        index: 3,
        key: 'options',
        icon: 'fg-map-options-alt',
        show: false
      }
    ];
    this.menuMobile = [
      {
        index: 0,
        key: 'layers',
        icon: 'fg-layers',
        show: false
      },
      {
        index: 1,
        key: 'statistics',
        icon: 'bx bx-bar-chart-alt',
        show: false
      },
      {
        index: 2,
        key: 'area',
        icon: 'fg-polygon-hole-pt',
        show: false
      },
      {
        index: 3,
        key: 'options',
        icon: 'fg-map-options-alt',
        show: false
      }

    ];
    this.currentMenu = {
      index: 0,
      key: 'layers',
      icon: 'fg-layers',
      show: false
    }
    this.optionsGroups = {
      basemaps: false,
      limits: false,
      settings: false,
      options: false
    };
    this.expendGroup = false;
    this.expendGroup2 = false;
  }

  ngAfterViewInit(): void {
    this.basesmaps = [
      {
        name: this.localizationService.translate('basemaps.mapbox'),
        key: 'mapbox',
        type: 'bmap',
        checked: true
      },
      {
        name: this.localizationService.translate('basemaps.mapbox-dark'),
        key: 'mapbox-dark',
        type: 'bmap',
        checked: false
      },
      {
        name: this.localizationService.translate('basemaps.google'),
        key: 'google',
        type: 'bmap',
        checked: false
      },
      {
        name: this.localizationService.translate('basemaps.google-hybrid'),
        key: 'google-hybrid',
        type: 'bmap',
        checked: false
      }
    ];
    this.options = [
      {
        name: this.localizationService.translate('options.graticule'),
        key: 'graticule',
        type: 'bmap',
        control: new Graticule({
          stepCoord: 1,
          margin: 5,
          style: new Style({
            fill: new Fill({
              color: 'rgb(255,255,255)',
            }),
            stroke: new Stroke({
              color: 'rgb(0,0,0)',
              lineDash: [.1, 5],
              width: 0.14,
            }),
            text: new Text({
              font: 'bold 10px Montserrat',
              offsetY: 20,
              fill: new Fill({ color: 'rgb(0,0,0)' }),
              stroke: new Stroke({ color: 'rgb(255,255,255)', width: 1 })
            })
          }),
          projection: 'EPSG:4326',
          formatCoord: function (c) {
            return c.toFixed(1) + "°"
          }
        }),
        checked: false
      },
      // {
      //   name: this.localizationService.translate('options.compass'),
      //   key: 'compass',
      //   type: 'options',
      //   control: this.createCompass(0),
      //   showLines: false,
      //   checked: false
      // }
    ];
    this.lang = this.localizationService.currentLang();
    this.innerHeigth = window.innerHeight - 180;

    const self = this;
    if(!(/Android|webOS|iPhone|iPad|iPod|BlackBerry|BB|PlayBook|IEMobile|Windows Phone|Kindle|Silk|Opera Mini/i.test(navigator.userAgent))){
      this.route.paramMap.subscribe(function (params) {
        const token = params.get('token');
        if(token){
          self.setTokenGeometryToSearch(parseInt(token))
        }
      });
    }

    this.cdRef.detectChanges();
  }

  onChangeBaseMap(bmap, event) {
    this.basesmaps.map((b) => {
      b.checked = bmap.key === b.key;
    });

    this.basemap = this.basesmaps.find(b => bmap.key === b.key);
    this.basemap.layer.layer.state_.visible = event.checked;
    this.onChangeMap.emit({ layer: this.basemap.layer, updateSource: false });
  }

  onChangeLimit(limit, event) {
    this.limits.map((l) => {
      l.checked = limit.get('key') === l.get('key');
    });

    limit.state_.visible = event.checked;
    this.onChangeLimits.emit({ layer: { layer: limit }, updateSource: false });
  }

  onChangeOption(option) {

    if (option.checked) {
      this.map.addControl(option.control);
    } else {
      this.map.removeControl(option.control);
    }

    // this.map.updateSize();
  }

  createCompass(showLines: number): Compass {
    return new Compass({
      className: "top",
      rotateWithView: true,
      style: new Stroke({ color: this.readStyleProperty('primary'), width: showLines })
    });
  }

  onChangeCompass(option) {
    if (option.checked && option.showLines) {
      this.map.removeControl(option.control);
      option.control = this.createCompass(1);
      this.map.addControl(option.control);
    } else {
      this.map.removeControl(option.control);
      option.control = this.createCompass(0);
      this.map.addControl(option.control);
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.hasOwnProperty('descriptor')) {
      if (changes.descriptor.currentValue) {
        this.descriptor = changes.descriptor.currentValue;
        this.descriptor.groups.forEach(group => {
          group.layers.forEach(layer => {
            layer.types.forEach(typeLayer => {
              typeLayer.download['loading'] = false;
            })
          });
        });
      }
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.innerHeigth = window.innerHeight - 180;
  }

  toggleMenu() {
    this.open = !this.open;
    this.onMenuToggle.emit(this.open);
    setTimeout(() => {
      this.map.updateSize()
    });
  }

  handleLang(lng) {
    this.lang = lng;
    localStorage.setItem('lang', this.lang);
    this.localizationService.useLanguage(this.lang).then(r => {
      this.layersTitle = this.localizationService.translate('menu.' + this.currentMenu.key);
      this.onChangeLng.emit()
      this.updateCharts.emit()
    });
    window.location.reload();
  }

  onSideBarShow() {
    const div = this.renderer.createElement('div');
    const img = this.renderer.createElement('img');
    this.renderer.addClass(div, 'header');
    this.renderer.addClass(img, 'logo');
    this.renderer.setProperty(img, 'src', '../../../assets/logos/atlas_logo_01.png')
    this.renderer.setProperty(img, 'alt', 'Logo');
    this.renderer.appendChild(div, img);
    this.renderer.listen(div, 'click', (event) => {
      window.location.href = '/'
    })
    this.renderer.insertBefore(this.el.nativeElement.querySelector(".p-sidebar-header"), div, this.el.nativeElement.querySelector(".p-sidebar-close"))
    this.map.updateSize();
  }

  hideSidebar() {
    this.currentMenu.show = false;
    setTimeout(() => {
      this.map.updateSize()
    });
  }

  handleMenu(menu, mobile = false) {

    this.menu.map(m => {
      return m.show = false
    });

    this.currentMenu = menu;

    this.layersTitle = this.localizationService.translate('menu.' + menu.key);

    if (menu.key == 'statistics') {
      this.displayStatistics = !this.displayStatistics;
      this.layersSideBar = false;
      this.onSideBarToggle.emit(this.layersSideBar);
    } else {
      this.menu[menu.index].show = true;
      this.layersSideBar = true;
    }

    if (mobile) {
      this.layersSideBarMobile = true;
      if (menu.key == 'statistics') {
        this.onNavBarToggle.emit(this.layersSideBarMobile);
      }
      // this.onMenuSelected.emit({show: this.layersSideBarMobile, key: menu.key});

    } else {
      if (menu.key == 'statistics') {
        this.onNavBarToggle.emit(this.layersSideBarMobile);
      } else {
        this.layersSideBar = true;
        this.onMenuSelected.emit({ show: this.layersSideBar, key: menu.key })
      }
    }

  }


  checkButton(e){
    if(e === false){
      return false
    }
    if(typeof e === "string"){
      return true
    }
    return true
  }

  search(event) {
    // this.mylookupservice.getResults(event.query).then(data => {
    //   this.results = data;
    // });
  }

  setMap(map) {
    this.map = map;
  }

  enableMetadata(layer) {
    return layer.type.hasOwnProperty('metadata') && layer.type.visible;
  }

  getType(types: DescriptorType[], selectedType: string) {
    return types.find(type => {
      type.download['loading'] = false;
      return type.valueType === selectedType
    });
  }

  formatMetadata(metadata: DescriptorMetadata[]) {
    let dt: Metadata = {
      header: { title: '', description: '' },
      data: []
    };
    metadata.forEach((item, index) => {
      if (index > 0) {
        dt.data.push(item)
      } else {
        dt.header = item;
      }
    });
    return dt;
  }

  showButtonInfo(layerType) {
    return layerType.metadata && layerType.visible;
  }

  showMetadata(layer: DescriptorLayer) {
    this.metadata = { header: { title: '', description: '' }, data: [] };
    const layerType = layer.types.find(type => {
      return type.valueType === layer.selectedType;
    });
    if (layerType!.metadata) {
      this.metadata = this.formatMetadata(layerType!.metadata);
      this.displayMetadata = true;
    } else {
      this.metadata = { header: { title: '', description: '' }, data: [] };
      this.displayMetadata = false;
    }
  }

  isDetails(data) {
    return (data === 'Detalhes' || data === 'Details' || data === 'URL');
  }

  download(type, layer, ev) {
    this.onDownload.emit({ tipo: type, layer: layer, e: ev });
  }

  onChangeTransparency(layer, ev) {
    //"Changing layer visibility...");
    this.onLayerChangeTransparency.emit({ layer: layer, opacity: ev.target.value })
  }

  changeLayerVisibility(layer: DescriptorLayer, updateSource = false) {
    layer.selectedTypeObject = this.getType(layer.types, layer.selectedType);
    layer.selectedTypeObject!.visible = layer.visible;
    this.onLayerChangeVisibility.emit({ layer: layer.selectedTypeObject, updateSource: updateSource })
  }

  onFilter() {
    this.showFilter = !this.showFilter;
    this.displayFilter.emit(this.showFilter);
    setTimeout(() => {
      this.map.updateSize()
    });
    this.cdRef.detectChanges();
  }

  handleMenuActive(menu) {
    let classes = '';
    if (menu.key == 'statistics') {
      classes = this.displayStatistics ? 'menu-active' : '';
    } else {
      classes = menu.show ? 'menu-active' : '';
    }
    return classes;
  }

  setBasemaps(bmaps) {
    this.basesmaps.forEach(bmap => {
      const layerBasemap = bmaps.find(map => { return map.layer.get('key') === bmap.key });

      bmap['layer'] = layerBasemap
      bmap['name'] = layerBasemap.layer.get('label')
    });
  }

  setLayerVisible(typeLayerValue: string) {
    const self = this;
    this.descriptor.groups.forEach(group => {
      group.layers.forEach(layer => {
        layer.types.forEach(typeLayer => {
          if (typeLayer.valueType === typeLayerValue) {
            group.groupExpanded = true;
            layer.visible = true;
            layer.selectedType = typeLayerValue;
            layer.selectedTypeObject = self.getType(layer.types, layer.selectedType);
          }
        })
      });
    })
  }

  setTokenGeometryToSearch(token: number) {
    this.token = token;
    this.handleMenu({
      index: 2,
      key: 'area',
      icon: 'fg-polygon-hole-pt',
      show: true
    })
  }

  setLimits(limits: any[]) {
    limits.forEach(limit => {
      limit['checked'] = limit.getVisible();
      limit['key'] = limit.get('key');
    });
    this.limits = limits;
  }

  readStyleProperty(name: string): string {
    let bodyStyles = window.getComputedStyle(document.body);
    return bodyStyles.getPropertyValue('--' + name).trim();
  }

}
