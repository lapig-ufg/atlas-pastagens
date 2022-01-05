import {
  Component,
  EventEmitter,
  OnInit,
  Renderer2,
  ElementRef,
  Output,
  HostListener,
  Input, SimpleChanges, ViewChild, ViewChildren, ChangeDetectorRef, QueryList
} from '@angular/core';
import { LocalizationService } from "../../@core/internationalization/localization.service";
import { ChartService } from '../services/charts.service';
import { MatDialog } from '@angular/material/dialog';
import { CustomerService } from '../services/customer.service';
import { Customer } from 'src/app/@core/interfaces/customer';
import { Descriptor, Layer, Legend, Menu } from "../../@core/interfaces";
import Map from 'ol/Map';

import { UIChart } from 'primeng/chart';
import { GoogleAnalyticsService } from "../services/google-analytics.service";

@Component({
  selector: 'app-right-side-bar',
  templateUrl: './right-side-bar.component.html',
  providers: [CustomerService],
  styleUrls: ['./right-side-bar.component.scss']

})
export class RightSideBarComponent implements OnInit {

  @Output() onMenuSelected = new EventEmitter<any>();
  @Output() onSideBarToggle = new EventEmitter<boolean>();
  @Input() descriptor: Descriptor;



  @Input() set displayOptions(value: boolean) {
    this.onSideBarToggle.emit(value);
    this._displayOptions = value;
  }

  @Input() set mobile(value: boolean) {
    this._mobile = value;
  }

  @ViewChildren('chartU') chartU: QueryList<UIChart>;

  public Legendas: Legend[];
  public map: Map;
  public _displayOptions: boolean;
  public _mobile: boolean;
  public innerHeigth: number;

  public chartsArea3 = [] as any;
  public chartsArea2 = [] as any;
  public chartsArea1 = [] as any;
  public tableRankings = [] as any;
  public infoResumo: any;

  //Charts Variables
  public selectRegion: any;
  public objectFullScreenChart: any = {};


  public options: any;
  public groupLayers: any[];
  //End Charts Variables

  public expandGroups: any;
  public cardsToDisplay: any;




  @Output() onChangeMap = new EventEmitter<any>();
  @Output() onChangeLimits = new EventEmitter<any>();

  public display: boolean;
  public open: boolean;
  public lang: string;
  public menu: Menu[];
  public currentMenu: Menu;
  public layersTitle: string;
  public displayFilter: boolean;
  public layersSideBar: boolean;
  public layersSideBarMobile: boolean;
  public displayFullScreenCharts: boolean;
  public displayDashboard: boolean;
  public chartObject: any;
  public filterSelectedOnLayersForStatistics: string;


  constructor(
    private el: ElementRef,
    private customerService: CustomerService,
    private localizationService: LocalizationService,
    private chartService: ChartService,
    private googleAnalyticsService: GoogleAnalyticsService,
    private renderer: Renderer2,
    public dialog: MatDialog,
    private cd: ChangeDetectorRef
  ) {
    //Mobile Variable
    this._mobile = false;

    //Charts Variables
    this.displayFullScreenCharts = false;
    this.displayDashboard = false;
    this.chartObject = {};


    this.selectRegion = {
      type: 'country',
      text: 'BRASIL',
      value: 'Brasil'
    };

    this.filterSelectedOnLayersForStatistics = "year=2020"


    this.lang = this.localizationService.currentLang();

    this.expandGroups = {
      resumo: true,
      area1: false,
      area2: false,
      area3: false,
      rankingTable: false
    }

    this.cardsToDisplay = {
      resumo: true,
      area1: true,
      area2: true,
      area3: false,
      rankingTable: true
    }

    // this.updateStatistics(this.selectRegion)


    this.layersSideBar = false;
    this.layersSideBarMobile = false;
    this.currentMenu = {
      index: 0,
      key: 'layers',
      icon: 'fg-layers',
      show: false
    }
    this.displayFilter = false;

  }

  ngOnInit(): void {

    this.updateStatistics(this.selectRegion);

    this.innerHeigth = window.innerHeight;

    this._displayOptions = false;

    this.options = {
      //display labels on data elements in graph
      plugins: {
        datalabels: {
          align: 'end',
          anchor: 'end',
          borderRadius: 4,
          backgroundColor: 'teal',
          color: 'white',
          font: {
            weight: 'bold',
          },
        },
        // display chart title
        title: {
          display: true,
          fontSize: 16,
        },
        legend: {
          position: 'bottom',
        },
      },
    };


  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.innerHeigth = window.innerHeight;
  }


  openDashboard() {
    this.displayDashboard = true;
  }

  openCharts(chart) {

    let obj = {
      title: chart.title,
      text: chart.text,
      type: chart.type,
      data: chart.data,
      options: chart.options,
      fullScreen: true
    }

    this.objectFullScreenChart = obj;

  }

  setMap(map) {
    this.map = map;
  }

  hideSideBar() {
    this.onSideBarToggle.emit(false);
  }

  handleMenu(menu, mobile = false) {

    this.menu.map(m => {
      return m.show = false
    });
    this.currentMenu = menu;
    this.layersTitle = this.localizationService.translate('menu.' + menu.key);

    if (menu.key == 'filters') {
      this.displayFilter = !this.displayFilter;
    } else {
      this.menu[menu.index].show = true;
    }
    if (mobile) {
      this.layersSideBarMobile = true;
      // this.onMenuSelected.emit({show: this.layersSideBarMobile, key: menu.key});

    } else {
      this.layersSideBar = true;
      this.onMenuSelected.emit({ show: this.layersSideBar, key: menu.key })
    }

  }


  handleLang(lng) {
    this.lang = lng;
  }

  updateStatistics(region?) {

    if (region) {
      this.selectRegion = region;
    } else {
      this.selectRegion = {
        type: 'country',
        text: 'BRASIL',
        value: 'Brasil'
      };
    }
    this.updateResumo();
    this.updateArea1Charts();
    this.updateArea2Charts();
    // this.updateArea3Charts();
    this.updateAreaTable();

  }

  updateResumo() {

    let params: string[] = [];
    params.push('lang=' + this.localizationService.currentLang())
    params.push('typeRegion=' + this.selectRegion.type)
    params.push('valueRegion=' + this.selectRegion.value)
    params.push('textRegion=' + this.selectRegion.text)
    // params.push('year=')

    let textParam = params.join('&') + '&' + this.filterSelectedOnLayersForStatistics

    this.chartsArea2 = []

    this.chartService.getResumo(textParam).subscribe(tempResumo => {


      this.infoResumo = tempResumo;
    }, error => {
      console.error(error)
    })

  }



  updateArea1Charts() {
    this.chartsArea1 = []
    let params: string[] = [];
    params.push('lang=' + this.localizationService.currentLang())
    params.push('typeRegion=' + this.selectRegion.type)
    params.push('valueRegion=' + this.selectRegion.value)
    params.push('textRegion=' + this.selectRegion.text)
    let textParam = params.join('&');

    this.chartService.getArea1(textParam).subscribe(tempChartsArea1 => {

      this.chartsArea1 = tempChartsArea1;
    }, error => {
      console.error(error)
    });

  }


  updateArea2Charts() {

    let params: string[] = [];
    params.push('lang=' + this.localizationService.currentLang())
    params.push('typeRegion=' + this.selectRegion.type)
    params.push('valueRegion=' + this.selectRegion.value)
    params.push('textRegion=' + this.selectRegion.text)
    // params.push('year=')

    let textParam = params.join('&') + '&' + this.filterSelectedOnLayersForStatistics

    this.chartsArea2 = []

    this.chartService.getArea2(textParam).subscribe(tempChartsArea2 => {


      this.chartsArea2 = tempChartsArea2;
    }, error => {
      console.error(error)
    })

  }

  updateArea3Charts() {
    this.chartsArea1 = []
    let params: string[] = [];
    params.push('lang=' + this.localizationService.currentLang())
    params.push('typeRegion=' + this.selectRegion.type)
    params.push('valueRegion=' + this.selectRegion.value)
    params.push('textRegion=' + this.selectRegion.text)

    let textParam = params.join('&') + '&' + this.filterSelectedOnLayersForStatistics

    this.chartService.getArea3(textParam).subscribe(tempChartsArea3 => {

      this.chartsArea3 = tempChartsArea3;
    }, error => {
      console.error(error)
    });
  }

  updateAreaTable() {
    this.tableRankings = []
    let params: string[] = [];
    params.push('lang=' + this.localizationService.currentLang())
    params.push('typeRegion=' + this.selectRegion.type)
    params.push('valueRegion=' + this.selectRegion.value)
    params.push('textRegion=' + this.selectRegion.text)
    // params.push('year=')

    let textParam = params.join('&') + '&' + this.filterSelectedOnLayersForStatistics

    this.chartService.getAreaTable(textParam).subscribe(tempTables => {

      for (let tab of tempTables) {

        tab.exportCols = [];
        let rows_labels = tab.rows_labels.split('?');
        let columnsTitle = tab.columnsTitle.split('?');

        for (let i = 0; i < rows_labels.length; i++) {
          tab.exportCols.push({ field: rows_labels[i], header: columnsTitle[i] })
        }

      }

      this.tableRankings = tempTables;
    }, error => {
      console.error(error)
    });

  }

  receiveFilterLayer(selectedLayers) {

    for (const [key, value] of Object.entries(this.filterSelectedOnLayersForStatistics)) {
      let result = selectedLayers.find(x => x.valueType.includes('pasture'));

      if (result) {
        if (this.filterSelectedOnLayersForStatistics !== result.filterSelected) {
          this.filterSelectedOnLayersForStatistics = result.filterSelected
          this.updateStatistics(this.selectRegion);
        }
      }
    }

  }



}



