import { Component, OnInit, Input } from '@angular/core';
import Map from 'ol/Map';
import { MessageService} from 'primeng/api';
import GeoJSON from 'ol/format/GeoJSON';
import VectorLayer from 'ol/layer/Vector';
import Style from 'ol/style/Style';
import VectorSource from 'ol/source/Vector';
import Stroke from 'ol/style/Stroke';

import { HttpHeaders } from '@angular/common/http';
import { AreaService } from '../../services/area.service';
import { GoogleAnalyticsService } from '../../services/google-analytics.service';
import {LocalizationService} from "../../../@core/internationalization/localization.service";
import {DomSanitizer, SafeResourceUrl} from "@angular/platform-browser";
import {Job, JobStatus} from "../../../@core/interfaces/job";


@Component({
  selector: 'app-leftsidebar-area',
  templateUrl: './area.component.html',
  styleUrls: ['./area.component.scss']
})
export class AreaComponent implements OnInit {
  @Input() map: Map;
  @Input() lang: string;
  @Input() set token(value: number) {
    if (value) {
      this.layerFromConsulta.token = value;
    }
  }


  public httpOptions: any;
  public displayTutorial: boolean = false;
  public tutorialUrl: SafeResourceUrl;
  public displayFormJob: boolean;
  public job: Job;
  public emailValid: boolean = true;
  public data: any = {};
  public objectFullScreenChart: any = {};
  public chartsArea = [] as any;
  /** Variables for upload shapdefiles **/
  public layerFromUpload: any = {
    label: null,
    layer: null,
    checked: false,
    visible: null,
    loading: false,
    dragArea: true,
    error: false,
    strokeColor: '#2224ba',
    token: '',
    analyzedAreaLoading: false,
    analyzedArea: {},
    heavyAnalysis: {},
    heavyAnalysisLoading: false
  };

  loadingPrintReport: boolean;

  public layerFromConsulta: any = {
    label: null,
    layer: null,
    checked: false,
    visible: null,
    loading: false,
    dragArea: true,
    error: false,
    strokeColor: '#257a33',
    token: '',
    analyzedAreaLoading: false,
    analyzedArea: {},
    heavyAnalysis: {},
    heavyAnalysisLoading: false
  };

  // Variável para controlar as promisses de cada análise realizada. Para o plataform-base tem apenas o areainfo.
  // Nas demais deve-se criar o controle para cada análise.
  public isPromiseFinished = {
    areainfo: false,
    // desmatperyear: false,
    // car: false,
    // terraclass: false,
    // focos: false,
    // queimadas: false
  };

  selectedIndexUpload: number;

  constructor(
    private areaService: AreaService,
    private googleAnalyticsService: GoogleAnalyticsService,
    public localizationService: LocalizationService,
    private sanitizer: DomSanitizer,
    private messageService: MessageService
  ) {
    this.displayFormJob = false;
    this.clearJob();
    this.httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    };
    this.tutorialUrl = this.sanitizer.bypassSecurityTrustResourceUrl('src/assets/documents/' + this.localizationService.currentLang() + '/tutorial.pdf')
  }

  ngOnInit(): void {

  }

  clearJob(){
    this.job = {
      name: '',
      email: '',
      status: JobStatus.pending,
      token: '',
      lang: this.localizationService.currentLang(),
      acceptTerms: true,
      application: 'ATLAS',
      datetime: new Date(),
    }
  }


  public onFileComplete(data: any) {

    let map = this.map;
    this.layerFromUpload.checked = false;
    this.layerFromUpload.error = false;

    if (this.layerFromUpload.layer != null) {
      map.removeLayer(this.layerFromUpload.layer);
    }
    if (!data.hasOwnProperty('features')) {
      return;
    }
    this.data = data;
    this.displayFormJob = true;
  }

  changeTextUpload($e) {

    if (this.layerFromConsulta.error) {
      this.layerFromConsulta = {
        label: null,
        layer: null,
        checked: false,
        visible: null,
        loading: false,
        dragArea: true,
        error: false,
        strokeColor: '#257a33',
        token: '',
        analyzedAreaLoading: false,
        analyzedArea: {},
      };
    }
  }

  onChangeCheckUpload(event) {
    let map = this.map;
    this.layerFromUpload.checked = !this.layerFromUpload.checked;

    if (this.layerFromUpload.checked) {

      map.addLayer(this.layerFromUpload.layer);
      let extent = this.layerFromUpload.layer.getSource().getExtent();
      map.getView().fit(extent, { duration: 1800 });

    } else {
      map.removeLayer(this.layerFromUpload.layer);
    }

  }

  async printRegionsIdentification(token) {
    console.log("TO DO")
  }

  analyzeUploadShape(fromConsulta = false) {

    this.isPromiseFinished = {
      areainfo: false
    };

    let params: string[] = [];

    if (fromConsulta) {
      params.push('token=' + this.layerFromConsulta.token)
      this.googleAnalyticsService.eventEmitter("Analyze-Consulta-Upload-Layer", "Upload", this.layerFromConsulta.token);
    }
    else {
      params.push('token=' + this.layerFromUpload.token)
      this.googleAnalyticsService.eventEmitter("Analyze-Upload-Layer", "Upload", this.layerFromUpload.token);
    }

    this.doAnalysisAreaInfo(fromConsulta, params) //Trigger Analysis AreaInfo

  }

  async doAnalysisAreaInfo(fromConsulta, params) {
    let self = this;

    if (fromConsulta) {
      this.layerFromConsulta.analyzedAreaLoading = true; // criar um loading para cada análise, para controlar a abertura do card.
      this.layerFromConsulta.error = false;

      try {

        let result = await this.areaService.analysisAreaInfo(params.join('&')).toPromise()
        this.layerFromConsulta.analyzedArea = result;
        this.layerFromConsulta.analyzedAreaLoading = false;

        this.checkIfAllPromiseAreDone(fromConsulta, 'areainfo')

      } catch (err) {
        self.layerFromConsulta.analyzedAreaLoading = false;
        self.layerFromConsulta.error = true;
      }

    } else {
      this.layerFromUpload.analyzedAreaLoading = true;

      this.layerFromUpload.error = false;

      try {
        let result = await this.areaService.analysisAreaInfo(params.join('&')).toPromise()
        this.layerFromUpload.analyzedArea = result;
        this.layerFromUpload.analyzedAreaLoading = false;

        this.checkIfAllPromiseAreDone(fromConsulta, 'areainfo')
      } catch (err) {
        self.layerFromUpload.analyzedAreaLoading = false;
        self.layerFromUpload.error = true;
      }

    }

  }

  clearUpload(fromConsulta = false) {
    if (fromConsulta) {
      this.layerFromConsulta.analyzedArea = {}
      this.map.removeLayer(this.layerFromConsulta.layer);
      this.layerFromConsulta.visible = false;
      this.layerFromConsulta.checked = false;
      this.layerFromConsulta.token = '';
      this.layerFromConsulta.error = false;
    } else {
      this.layerFromUpload.analyzedArea = {}
      this.map.removeLayer(this.layerFromUpload.layer);
      this.layerFromUpload.visible = false;
      this.layerFromUpload.checked = false;
    }
    //this.updateRegion(this.defaultRegion);
  }

  getCitiesAnalyzedArea(fromConsulta = false) {
    let cities = '';
    if (fromConsulta) {
      if (this.layerFromConsulta.analyzedArea.regions_intersected.hasOwnProperty('city')) {
        for (let [index, city] of this.layerFromConsulta.analyzedArea.regions_intersected.city.entries()) {
          let citiesCount = this.layerFromConsulta.analyzedArea.regions_intersected.city.length;
          if (citiesCount === 1) {
            cities += city.name + '.';
            return cities;
          }
          if (index === citiesCount - 1) {
            cities += city.name + '.';
          } else {
            cities += city.name + ', ';
          }
        }
      }
    } else {
      if (this.layerFromUpload.analyzedArea.regions_intersected.hasOwnProperty('city')) {
        for (let [index, city] of this.layerFromUpload.analyzedArea.regions_intersected.city.entries()) {
          let citiesCount = this.layerFromUpload.analyzedArea.regions_intersected.city.length;
          if (citiesCount === 1) {
            cities += city.name + '.';
            return cities;
          }
          if (index === citiesCount - 1) {
            cities += city.name + '.';
          } else {
            cities += city.name + ', ';
          }
        }
      }
    }

    return cities;
  }
  getStatesAnalyzedArea(fromConsulta = false) {
    let states = '';
    if (fromConsulta) {
      if (this.layerFromConsulta.analyzedArea.regions_intersected.hasOwnProperty('state')) {
        for (let [index, state] of this.layerFromConsulta.analyzedArea.regions_intersected.state.entries()) {
          let statesCount = this.layerFromConsulta.analyzedArea.regions_intersected.state.length;
          if (statesCount === 1) {
            states += state.name + '.';
            return states;
          }
          if (index === statesCount - 1) {
            states += state.name + '.';
          } else {
            states += state.name + ', ';
          }
        }
      }
    } else {
      if (this.layerFromUpload.analyzedArea.regions_intersected.hasOwnProperty('state')) {
        for (let [index, state] of this.layerFromUpload.analyzedArea.regions_intersected.state.entries()) {
          let statesCount = this.layerFromUpload.analyzedArea.regions_intersected.state.length;
          if (statesCount === 1) {
            states += state.name + '.';
            return states;
          }
          if (index === statesCount - 1) {
            states += state.name + '.';
          } else {
            states += state.name + ', ';
          }
        }
      }
    }

    return states;
  }

  checkIfAllPromiseAreDone(fromConsulta, source) {
    let self = this;
    let done = true;

    this.isPromiseFinished[source] = true;

    // this.delay(1000).then(any => {
    //your task after delay.
    for (const [key, val] of Object.entries(this.isPromiseFinished)) {
      // use key and val
      if (val == false) {
        done = false;
      }
    }

    if (done) {
      if (fromConsulta) {

        let dados = {
          token: this.layerFromConsulta.token,
          analysis: this.layerFromConsulta.analyzedArea
        }

        this.saveCompleteAnalysis(dados)
      }
      else {
        let dados = {
          token: this.layerFromUpload.token,
          analysis: this.layerFromUpload.analyzedArea
        }
        this.saveCompleteAnalysis(dados)
      }
    }
    // });
  }

  private saveCompleteAnalysis(dados) {
    try {
      this.areaService.saveAnalysisOnDB(dados).subscribe(result => {
      }, (err) => {
        console.error('Não foi possível cadastrar cadastrar a requisição do relatório')
      });
    } catch (err) {
      console.error('Não foi possível cadastrar cadastrar a requisição do relatório')
    }
  }

  async decideConsultaShape() {
    let self = this;
    this.layerFromConsulta.error = false;

    let params: string[] = []
    params.push('token=' + this.layerFromConsulta.token)
    params.push('origin=ATLAS')
    params.push('lang=' + this.localizationService.currentLang())
    this.chartsArea = [];
    try {
      let result = await this.areaService.getSavedAnalysis(params.join('&')).toPromise()

      if (typeof result === 'object' && result !== null) {
        console.log(result)
        this.chartsArea = [...result.pasture, ...result.pasture_quality]
        this.layerFromConsulta.analyzedArea = result;
      }
      else {
        this.analyzeUploadShape(true);
      }

    } catch (err) {
      self.layerFromConsulta.analyzedAreaLoading = false;
      self.layerFromConsulta.error = true;
    }

  }

  async printAnalyzedAreaReport(fromConsulta = false) {
    this.loadingPrintReport = true;
    this.loadingPrintReport = false;

    this.googleAnalyticsService.eventEmitter("Print-Report-Analyzed-Upload", "Upload", this.layerFromConsulta.token);
  }

  async searchUploadShape() {
    let params: string[] = [];
    let self = this;


    this.layerFromConsulta.analyzedAreaLoading = true;
    params.push('token=' + this.layerFromConsulta.token)
    this.layerFromConsulta.error = false;
    // let urlParams = '/service/upload/findgeojsonbytoken?' + params.join('&');

    try {
      // let result = await this.http.get(urlParams, this.httpOptions).toPromise()

      let parameters = params.join('&')
      let result = await this.areaService.getGeoJsonByToken(parameters).toPromise()

      this.layerFromConsulta.analyzedArea = result;
      this.layerFromConsulta.analyzedAreaLoading = false;
      this.loadLayerFromConsultaToMap();

      this.googleAnalyticsService.eventEmitter("Get-Upload-Token-FromDB", "Upload", this.layerFromConsulta.token);

    } catch (err) {
      self.layerFromConsulta.analyzedAreaLoading = false;
      self.layerFromConsulta.error = true;
    }

  }

  loadLayerFromConsultaToMap() {
    const currentMap = this.map;
    const vectorSource = new VectorSource({
      features: (new GeoJSON()).readFeatures(this.layerFromConsulta.analyzedArea.geojson, {
        dataProjection: 'EPSG:4326',
        featureProjection: 'EPSG:3857'
      })
    });
    this.layerFromConsulta.layer = new VectorLayer({
      zIndex: 1000000,
      source: vectorSource,
      style: [
        new Style({
          stroke: new Stroke({
            color: this.layerFromConsulta.strokeColor,
            width: 4
          })
        }),
        new Style({
          stroke: new Stroke({
            color: this.layerFromConsulta.strokeColor,
            width: 4,
            lineCap: 'round'
          })
        })
      ]
    });
    currentMap.addLayer(this.layerFromConsulta.layer);
    const extent = this.layerFromConsulta.layer.getSource().getExtent();
    currentMap.getView().fit(extent, { duration: 1800 });

  }

  openTutorial() {
    this.tutorialUrl = this.sanitizer.bypassSecurityTrustResourceUrl('assets/documents/' + this.localizationService.currentLang() + '/tutorial.pdf');
    this.displayTutorial = !this.displayTutorial
  }

  validationMobile() {
    return !(/Android|webOS|iPhone|iPad|iPod|BlackBerry|BB|PlayBook|IEMobile|Windows Phone|Kindle|Silk|Opera Mini/i.test(navigator.userAgent));
  }

  sendRequestJob(){
    let data = this.data;
    this.job.token = data.token;
    this.areaService.saveJob(this.job).subscribe(result => {
      this.displayFormJob = false;
      if (data.features.length > 1) {
        this.layerFromUpload.loading = false;

        this.layerFromUpload.visible = false;
        this.layerFromUpload.label = data.name;
        this.layerFromUpload.layer = data;
        this.layerFromUpload.token = data.token;

      } else {
        this.layerFromUpload.loading = false;

        if (data.features[0].hasOwnProperty('properties')) {

          let auxlabel = Object.keys(data.features[0].properties)[0];
          this.layerFromUpload.visible = false;
          this.layerFromUpload.label = data.features[0].properties[auxlabel];
          this.layerFromUpload.layer = data;
          this.layerFromUpload.token = data.token;

        } else {
          this.layerFromUpload.visible = false;
          this.layerFromUpload.label = data.name;
          this.layerFromUpload.layer = data;
          this.layerFromUpload.token = data.token;
        }
      }

      this.layerFromUpload.visible = true;
      let vectorSource = new VectorSource({
        features: (new GeoJSON()).readFeatures(data, {
          dataProjection: 'EPSG:4326',
          featureProjection: 'EPSG:3857'
        })
      });
      this.layerFromUpload.layer = new VectorLayer({
        zIndex: 100000,
        source: vectorSource,
        style: [
          new Style({
            stroke: new Stroke({
              color: this.layerFromUpload.strokeColor,
              width: 4
            })
          }),
          new Style({
            stroke: new Stroke({
              color: this.layerFromUpload.strokeColor,
              width: 4,
              lineCap: 'round',
            })
          })
        ]
      });
      this.googleAnalyticsService.eventEmitter("UploadLayer", "Upload", "Submit_Token");
      this.clearJob()
      this.messageService.add({ life: 2000, severity: 'success', summary: this.localizationService.translate('area.save_message_success.title', { token: data.token }), detail: this.localizationService.translate('area.save_message_success.msg') })
    }, error => {
      this.clearJob()
      this.displayFormJob = false;
      this.messageService.add({ severity: 'error', summary: this.localizationService.translate('area.save_message_error.title'), detail: this.localizationService.translate('area.save_message_error.msg') });
    })
  }

  validateEmail() {
    const pattern = new RegExp('^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$');
    this.emailValid = pattern.test(this.job.email)
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
}
