export interface LayerLegend {
    key: string;
    label: string;
    filter: string | null;
    filterHandler: string | null;
    expanded: boolean;
}