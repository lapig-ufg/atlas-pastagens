// TODO: Sera que o descriptor não deveria ser um objeto?
// TODO: É necessário blindar o descriptor de possiveis mudanças. Fazer isso na API.

export enum Dirty { CLEAN, VISIBILITY, TRANSPARENCY, TYPE, SOURCE }

export interface DirtyBit {
  dirty: Dirty;
  layer?: string;
  layerType?: string;
}

export interface DescriptorFilterValues {
  valueFilter: string;
  viewValueFilter: any;
}

export interface DescriptorMetadata {
  title: string;
  description: string;
}

export interface DescriptorTypeOrigin {
  sourceService: string;
  typeOfTMS: string;
  url?: string;
  epsg?: string;
}

export interface DescriptorMapCardAttributes {
  column: string;
  label: string;
  columnType: string;
  enum?: Array<string>
  dict?:any
}

export interface DescriptorMapCard {
  show: string;
  attributes: DescriptorMapCardAttributes;
}

export interface DescriptorDownload {
  csv: boolean;
  gpkg: boolean;
  layerTypeName: string;
  raster: boolean | string;
  shp: boolean;
  loading?:boolean;
}

/**
 * Opacity não poderia ficar em DescriptorLayer, já que é algo pra camada toda?
 */
export interface DescriptorType {
  alertMessage?: string;
  download: DescriptorDownload;
  filterHandler?: string;
  filterLabel?: string;
  filterSelected?: string;
  filters?: DescriptorFilterValues[];
  layerLimits?: boolean;
  metadata?: DescriptorMetadata[];
  opacity: number;
  origin: DescriptorTypeOrigin;
  regionFilter?: boolean;
  type: string;
  typeLabel?: string;
  typeLayer: string;
  valueType: string;
  viewValueType: string;
  visible?: boolean;
  wfsMapCard: DescriptorMapCard;
}

/*
export interface DescriptorBaseMap {
  idLayer: string;
  visible: boolean;
  selectedType: string;
  types: DescriptorType[];
  selectedTypeObject?: DescriptorType;
}

export interface DescriptorLimit {
  idLayer: string;
  visible: boolean;
  types: DescriptorType[];
  selectedType: string;
  selectedTypeObject?: DescriptorType;
}
*/

export interface DescriptorLayer {
  idLayer: string;
  labelLayer: string;
  visible: boolean;
  opacity?: number;
  types: DescriptorType[];
  selectedType: string;
  selectedTypeObject?: DescriptorType;
}

export interface DescriptorGroup {
  idGroup: string;
  labelGroup: string;
  groupExpanded: boolean;
  layers: DescriptorLayer[];
}

export interface Descriptor {
  dirtyBit: DirtyBit;
  groups: DescriptorGroup[];
  basemaps: DescriptorLayer[];
  limits: DescriptorLayer[];
}
