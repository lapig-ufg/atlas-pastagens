//TODO: Estatisticas de carbono não estão sendo exibidas corretamente.

/**
 * Angular imports.
 */
import { Component, OnDestroy } from '@angular/core';

/**
 * Services imports.
 */
import {
  ChartService,
  DEFAULT_REGION,
  DescriptorService,
  RegionFilterService,
} from '../../../@core/services';

/**
 * Interfaces imports.
 */
import {
  Descriptor,
  DescriptorGroup,
  DescriptorLayer,
  DescriptorType,
  DirtyType,
} from '@core/interfaces';
import { RegionFilter } from '@core/interfaces';

/**
 * Rxjs imports.
 */
import { Subscription } from 'rxjs';

/**
 * PDF imports.
 */
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * CSV imports.
 */
import { mkConfig, generateCsv, download } from 'export-to-csv';

import { SortEvent } from 'primeng/api';
import {
  AccordionTabCloseEvent,
  AccordionTabOpenEvent,
} from 'primeng/accordion';

@Component({
  selector: 'app-statistics-sidebar',
  templateUrl: './statistics-sidebar.component.html',
  styleUrls: ['./statistics-sidebar.component.scss'],
})
class StatisticsSidebarComponent implements OnDestroy {
  private static _accordionTabExpanded: number[] = [0];

  private descriptorSubscription: Subscription = new Subscription();
  private regionFilterSubscription: Subscription = new Subscription();

  public summaryKeys: string[] = [
    'region',
    'pasture',
    'pasture_quality',
    'carbono',
  ];

  public summaryData: Map<string, any> = new Map<string, any>();
  public graphsData: Array<any> = [];
  public rankingData: Array<any> = [];
  public dialogData: any | null;

  // TODO: Estatisticas foram setadas para 1 ano antes do correto. DB não esta retornando dados para o ano certo.
  public layersForStatistics: any = {
    pasture: {
      layer: 'pasture',
      group: 'pasture_general',
      year: 2022,
      switch: true,
    },
    pasture_quality: {
      layer: 'pasture_quality',
      group: 'pasture_general',
      year: 2022,
      switch: false,
    },
    carbono: {
      layer: 'biomassa',
      group: 'pasture_carbon_general',
      year: 2020,
      switch: false,
    },
  };

  public regionFilter: RegionFilter = DEFAULT_REGION;

  constructor(
    private descriptorService: DescriptorService,
    private regionFilterService: RegionFilterService,
    private chartService: ChartService
  ) {
    this.regionFilterSubscription.add(
      this.regionFilterService.getRegionFilter().subscribe({
        next: (regionFilter: RegionFilter) => {
          this.regionFilter = regionFilter;

          this.getAllSummaryData();
          this.getGraphsData();
          this.getRanking();
        },
      })
    );

    this.descriptorSubscription.add(
      this.descriptorService
        .getDescriptor()
        .subscribe((descriptor: Descriptor | null) => {
          if (descriptor === null) return;

          this.updateLayersForStatistics(descriptor);
        })
    );
  }

  ngOnDestroy(): void {
    this.descriptorSubscription.unsubscribe();
    this.regionFilterSubscription.unsubscribe();
  }

  get accordionTabExpanded() {
    return StatisticsSidebarComponent._accordionTabExpanded;
  }

  public onAccordionTabOpen(event: AccordionTabOpenEvent): void {
    StatisticsSidebarComponent._accordionTabExpanded.push(event.index);
  }

  public onAccordionTabClose(event: AccordionTabCloseEvent): void {
    StatisticsSidebarComponent._accordionTabExpanded =
      StatisticsSidebarComponent._accordionTabExpanded.filter(
        (element) => element !== event.index
      );
  }

  private updateLayersForStatistics(descriptor: Descriptor): void {
    let dirtyBit = descriptor.dirtyBit;

    Object.keys(this.layersForStatistics).forEach((summaryKey: string) => {
      if (this.layersForStatistics[summaryKey].layer !== dirtyBit.layer) return;

      let descriptorLayer = this.descriptorService.getLayer(dirtyBit.layer!);

      switch (dirtyBit.dirty) {
        case DirtyType.VISIBILITY:
          this.layersForStatistics[summaryKey].switch = descriptorLayer.visible;
          break;
        case DirtyType.SOURCE:
          let year = parseInt(
            descriptorLayer.selectedTypeObject?.filterSelected?.split('=')[1]!
          );

          this.layersForStatistics[summaryKey].year = year;

          this.getLayerSummaryData(summaryKey);
          this.getRanking();
          break;
      }
    });
  }

  private getAllSummaryData(): void {
    this.summaryKeys.forEach((key: string) => {
      this.getLayerSummaryData(key);
    });
  }

  private getLayerSummaryData(summaryKey: string): void {
    let year: string = '2022';

    if (summaryKey !== 'region')
      year = this.layersForStatistics[summaryKey].year;

    this.chartService
      .getSummary(summaryKey, this.regionFilter, year)
      .subscribe({
        next: (summary: any) => {
          this.summaryData.set(summaryKey, {
            data: summary,
            year: year,
          });
        },
        error: (error) => {
          console.error(error);
        },
      });
  }

  private getGraphsData(): void {
    this.chartService.getPastureGraph(this.regionFilter).subscribe({
      next: (graphsData: Array<any>) => {
        this.graphsData = graphsData;
      },
      error: (error) => {
        console.error(error);
      },
    });
  }

  private getRanking(): void {
    this.chartService.getRankingTables(this.regionFilter, '2022').subscribe({
      next: (rankingTables) => {
        for (let element of rankingTables) {
          let rows_labels: Array<string> = element.rows_labels.split('?');
          let columnsTitle: Array<string> = element.columnsTitle.split('?');

          element.exportCols = [];

          for (let i = 0; i < rows_labels.length; i++) {
            element.exportCols.push({
              dataKey: rows_labels[i],
              header: columnsTitle[i],
            });
          }
        }

        this.rankingData = rankingTables;
      },
      error: (error) => {
        console.error(error);
      },
    });
  }

  public onFullscreenMode(graph: any) {
    this.dialogData = {
      title: graph.title,
      text: graph.text,
      type: graph.type,
      data: graph.data,
      options: graph.options,
      fullScreen: true,
    };
  }

  /**
   * Export Ranking Table as CSV.
   */
  public onExportCSV(table: any): void {
    // TODO: Optimize it.
    const csvConfig = mkConfig({
      fieldSeparator: ';',
      quoteStrings: true,
      decimalSeparator: 'locale',
      showTitle: false,
      filename: table.id,
      title: table.text,
      useTextFile: false,
      useBom: true,
      useKeysAsHeaders: true,
    });

    let sortOrder = {};

    let i = 1;

    for (let el of table.exportCols) {
      sortOrder[el.dataKey] = i;
      i++;
    }

    sortOrder['originalValue'] = i;

    if (table.rows_labels.toLowerCase().includes('city')) {
      sortOrder['cityCode'] = ++i;
    }

    const res = table.data.map((o) =>
      Object.assign(
        {},
        ...Object.keys(o)
          .sort((a, b) => sortOrder[a] - sortOrder[b])
          .map((x) => {
            return { [x]: o[x] };
          })
      )
    );

    download(csvConfig)(generateCsv(csvConfig)(res));
  }

  /**
   * Export Ranking Table as PDF.
   */
  public onExportPDF(table: any): void {
    const doc = new jsPDF();

    autoTable(doc, {
      columnStyles: { 3: { halign: 'center' } },
      columns: table.exportCols,
      body: table.data,
    });

    doc.save(table.title + '.pdf');
  }

  /**
   * Custom sort for p-table.
   */
  public sortRankingTable(event: SortEvent): void {
    event.data?.sort((value1: any, value2: any) => {
      let result: number;

      switch (event.field) {
        case 'index':
          let indexA: number = parseInt(
            value1[event.field ? event.field : ''].replace('º', '')
          );
          let indexB: number = parseInt(
            value2[event.field ? event.field : ''].replace('º', '')
          );

          result = indexA < indexB ? -1 : indexA > indexB ? 1 : 0;

          return Number(event.order) * result;
        case 'value':
          let valueA: number = value1['originalValue'];
          let valueB: number = value2['originalValue'];

          result = valueA < valueB ? -1 : valueA > valueB ? 1 : 0;

          return Number(event.order) * result;
        default:
          let stringA: string = value1[event.field ? event.field : ''];
          let stringB: string = value2[event.field ? event.field : ''];

          result = stringA.localeCompare(stringB);

          return Number(event.order) * result;
      }
    });
  }
}

export { StatisticsSidebarComponent };
