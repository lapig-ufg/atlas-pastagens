import { Component, OnInit } from '@angular/core';
import {LocalizationService} from "../../../@core/internationalization/localization.service";
import {LangChangeEvent} from "@ngx-translate/core";

@Component({
  selector: 'app-artigos',
  templateUrl: './artigos.component.html',
  styleUrls: ['./artigos.component.scss']
})
export class ArtigosComponent implements OnInit {

  search: string;

  articles: Article[];

  constructor(private localizationService: LocalizationService) {
    this.articles =  [
      {
        id: 0,
        title: this.localizationService.translate('hotsite.articles.0.title'),
        image: "../../../../assets/hotsite/images/artigos/Assessing the Wall-to-Wall Spatial and Qualitative Dynamics of the Brazilian Pasturelands 2010–2018.jpeg",
        doi: "https://doi.org/10.3390/rs14041024",
        authors: "Santos et al., 2022",
        abstract:this.localizationService.translate('hotsite.articles.0.abstract'),
        published:new Date(2022,1,4),
      },
      {
        id: 1,
        title: this.localizationService.translate('hotsite.articles.1.title'),
        image: "../../../../assets/hotsite/images/artigos/Shaping the Brazilian landscape.png",
        doi: "https://doi.org/10.21203/rs.3.rs-819697/v1",
        authors: "Parente et al., 2021",
        abstract:this.localizationService.translate('hotsite.articles.1.abstract'),
        published: new Date(2021,8,19),
      },
      {
        id: 2,
        title: this.localizationService.translate('hotsite.articles.2.title'),
        image: "../../../../assets/hotsite/images/artigos/Biomassa seca estimada em áreas de pastagens.png",
        doi: "https://doi.org/10.21680/2177-8396.2020v32n2ID22641",
        authors: "Veloso et al., 2021",
        abstract: this.localizationService.translate('hotsite.articles.2.abstract'),
        published:  new Date(2021,2,28),
      },
      {
        id: 3,
        title: this.localizationService.translate('hotsite.articles.3.title'),
        image: "../../../../assets/hotsite/images/artigos/Modelling gross primary.png",
        doi: "https://doi.org/10.1016/j.rsase.2020.100288",
        authors: "Veloso et al., 2020",
        abstract: this.localizationService.translate('hotsite.articles.3.abstract'),
        published:  new Date(2020,1,21),
      },
      {
        id: 4,
        title: this.localizationService.translate('hotsite.articles.4.title'),
        image: "../../../../assets/hotsite/images/artigos/Land use dynamics.png",
        doi: "https://doi.org/10.1590/S1678-3921.pab2019.v54.00138",
        authors: "Sano et al., 2019",
        abstract: this.localizationService.translate('hotsite.articles.4.abstract'),
        published:  new Date(2019,6,1),
      },
      {
        id: 5,
        title: this.localizationService.translate('hotsite.articles.5.title'),
        image: "../../../../assets/hotsite/images/artigos/Landsat-based assessment.png",
        doi: "https://doi.org/10.1016/j.apgeog.2021.102585",
        authors: "Gosh et al., 2021",
        abstract: this.localizationService.translate('hotsite.articles.5.abstract'),
        published:  new Date(2021,10,8),
      },
      {
        id: 6,
        title: this.localizationService.translate('hotsite.articles.6.title'),
        image: "../../../../assets/hotsite/images/artigos/Development of a technological index.png",
        doi: "https://doi.org/10.1590/0101-7438.2018.038.01.0117",
        authors: "Oliveira et al., 2018",
        abstract: this.localizationService.translate('hotsite.articles.6.abstract'),
        published:  new Date(2018,4,4),
      },
      {
        id: 7,
        title: this.localizationService.translate('hotsite.articles.7.title'),
        image: "../../../../assets/hotsite/images/artigos/Degradation trends based on MODIS-derived.png",
        doi: "https://doi.org/10.1016/j.rsase.2018.04.014",
        authors: "Fernandes et al., 2018",
        abstract: this.localizationService.translate('hotsite.articles.7.abstract'),
        published:  new Date(2018,5,1),
      },
      {
        id: 8,
        title: this.localizationService.translate('hotsite.articles.8.title'),
        image: "../../../../assets/hotsite/images/artigos/The seasonal carbon and water.png",
        doi: "https://doi.org/10.1016/j.isprsjprs.2016.02.008",
        authors: "Arantes et al., 2016",
        abstract: this.localizationService.translate('hotsite.articles.8.abstract'),
        published:  new Date(2016,4,8),
      },
      {
        id: 9,
        title: this.localizationService.translate('hotsite.articles.9.title'),
        image: "../../../../assets/hotsite/images/artigos/Assessing Pasture Degradation.png",
        doi: "https://doi.org/10.3390/rs10111761",
        authors: "Pereira et al., 2018",
        abstract: this.localizationService.translate('hotsite.articles.9.abstract'),
        published:  new Date(2018,11,8),
      },
      {
        id: 10,
        title: this.localizationService.translate('hotsite.articles.10.title'),
        image: "../../../../assets/hotsite/images/artigos/Estimating Greenhouse Gas.png",
        doi: "https://doi.org/10.1007/s10584-012-0443-3",
        authors: "Bustamante et al., 2012",
        abstract: this.localizationService.translate('hotsite.articles.10.abstract'),
        published:  new Date(2012,5,17),
      },
      {
        id: 11,
        title: this.localizationService.translate('hotsite.articles.11.title'),
        image: "../../../../assets/hotsite/images/artigos/Increasing importance of.png",
        doi: "https://doi.org/10.1038/s41558-018-0081-5",
        authors: "Sloat et al., 2018",
        abstract: this.localizationService.translate('hotsite.articles.11.abstract'),
        published:  new Date(2018,2,18),
      },
      {
        id: 12,
        title: this.localizationService.translate('hotsite.articles.12.title'),
        image: "../../../../assets/hotsite/images/artigos/Monitoring the brazilian pasturelands.png",
        doi: "https://doi.org/10.1016/j.jag.2017.06.003",
        authors: "Parente et al., 2017",
        abstract: this.localizationService.translate('hotsite.articles.12.abstract'),
        published:  new Date(2017,7,20),
      },
      {
        id: 13,
        title: this.localizationService.translate('hotsite.articles.13.title'),
        image: "../../../../assets/hotsite/images/artigos/Assessing the Spatial and Occupation Dynamics of the Brazilian Pasturelands.png",
        doi: "https://doi.org/10.3390/rs10040606",
        authors: " Parente e Ferreira, 2018",
        abstract: this.localizationService.translate('hotsite.articles.13.abstract'),
        published:  new Date(2018,4,14),
      },
      {
        id: 14,
        title: this.localizationService.translate('hotsite.articles.14.title'),
        image: "../../../../assets/hotsite/images/artigos/Assessing the pasturelands and livestock dynamics in Brazil, from 1985 to 2017.png",
        doi: "https://doi.org/10.1016/j.rse.2019.111301",
        authors: "Parente et al., 2019",
        abstract: this.localizationService.translate('hotsite.articles.14.abstract'),
        published:  new Date(2019,6,6),
      },
      {
        id: 15,
        title: this.localizationService.translate('hotsite.articles.15.title'),
        image: "../../../../assets/hotsite/images/artigos/Biophysical Properties of Cultivated Pastures in the Brazilian Savanna Biome.png",
        doi: "https://doi.org/10.3390/rs5010307",
        authors: "Ferreira et al., 2013",
        abstract: this.localizationService.translate('hotsite.articles.15.abstract'),
        published:  new Date(2013,1,17),
      },
      {
        id: 16,
        title: this.localizationService.translate('hotsite.articles.16.title'),
        image: "../../../../assets/hotsite/images/artigos/Livestock intensification potential in Brazil based on agricultural census and satellite data analysis.png",
        doi: "https://doi.org/10.1590/S0100-204X2018000900009",
        authors: "Arantes et al., 2018",
        abstract: this.localizationService.translate('hotsite.articles.16.abstract'),
        published:  new Date(2018,9,1),
      },
      {
        id: 17,
        title: this.localizationService.translate('hotsite.articles.17.title'),
        image: "../../../../assets/hotsite/images/artigos/MODIS estimates of pasture productivity in the Cerrado based on ground and Landsat-8 data extrapolations.png",
        doi: "https://doi.org/10.1117/1.JRS.12.026006",
        authors: "Brito et al., 2018",
        abstract: this.localizationService.translate('hotsite.articles.17.abstract'),
        published:  new Date(2018,4,20),
      },
      {
        id: 18,
        title: this.localizationService.translate('hotsite.articles.18.title'),
        image: "../../../../assets/hotsite/images/artigos/Caracterização biofísica e potencial à intensificação sustentável da pecuária brasileira em pastagens.png",
        doi: "https://repositorio.bc.ufg.br/tede/handle/tede/8075",
        authors: "Arantes, Arielle Elias (2017)",
        abstract: this.localizationService.translate('hotsite.articles.18.abstract'),
        published:  new Date(2017,12,18),
      },
      {
        id: 19,
        title: this.localizationService.translate('hotsite.articles.19.title'),
        image: "../../../../assets/hotsite/images/artigos/Pastagens degradadas, uma herança dos imóveis rurais desapropriados para os assentamentos rurais do Cerrado goiano.png",
        doi: "https://doi.org/10.14393/RCT153508",
        authors: "Gosh et al., 2020",
        abstract: this.localizationService.translate('hotsite.articles.19.abstract'),
        published:  new Date(2020,6,30),
      },
      {
        id: 20,
        title: this.localizationService.translate('hotsite.articles.20.title'),
        image: "../../../../assets/hotsite/images/artigos/Land-use dynamics in a Brazilian agricultural frontier region, 1985-2017.png",
        doi: "https://doi.org/10.1016/j.landusepol.2020.104740",
        authors: "Lopes et al., 2020",
        abstract: this.localizationService.translate('hotsite.articles.20.abstract'),
        published:  new Date(2020,5,25),
      },
      {
        id: 21,
        title: this.localizationService.translate('hotsite.articles.21.title'),
        image: "../../../../assets/hotsite/images/artigos/The livestock in Goiás seen through the GIS Window.png",
        doi: "https://doi.org/10.26895/geosaberes.v11i0.819",
        authors: "Lopes et al., 2020",
        abstract: this.localizationService.translate('hotsite.articles.21.abstract'),
        published:  new Date(2020,4,10),
      },
      {
        id: 22,
        title: this.localizationService.translate('hotsite.articles.22.title'),
        image: "../../../../assets/hotsite/images/artigos/Tecnologia e degradação de pastagens na pecuária no Cerrado brasileiro.png",
        doi: "https://doi.org/10.14393/SN-v32-2020-55795",
        authors: "Oliveira et al., 2020",
        abstract: this.localizationService.translate('hotsite.articles.22.abstract'),
        published:  new Date(2020,9,8),
      },
      {
        id: 23,
        title: this.localizationService.translate('hotsite.articles.23.title'),
        image: "../../../../assets/hotsite/images/artigos/Monitoring of Carbon Stocks in Pastures in the Savannas of Brasil through Ecosystem Modeling on a Regional Scale.png",
        doi: "https://doi.org/10.3390/land12010060",
        authors: "Santos et al., 2022",
        abstract: this.localizationService.translate('hotsite.articles.23.abstract'),
        published:  new Date(2022,12,26),
      },
    ];
  }

  ngOnInit() {
    this.articles = this.articles.sort((a,b)=>(a.published > b.published)?-1:1)
    this.localizationService.translateService.onLangChange.subscribe((langChangeEvent: LangChangeEvent) => {

      this.articles.forEach(article =>{
        article.title = this.localizationService.translate('hotsite.articles.'+article.id+'.title');
        article.abstract =  this.localizationService.translate('hotsite.articles.'+article.id+'.abstract');
      })
    });
  }
}



export interface Article {
  id: number;
  title: string;
  image: string;
  doi: string;
  authors: string;
  abstract: string;
  published:Date;
}
