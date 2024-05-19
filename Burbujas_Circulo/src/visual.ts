import powerbi from "powerbi-visuals-api";
import DataView = powerbi.DataView;
import VisualConstructorOptions = powerbi.extensibility.visual.VisualConstructorOptions;
import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;
import IVisual = powerbi.extensibility.visual.IVisual;
import * as React from "react";
import * as ReactDOM from "react-dom";
import {ReactCircleCard, IProps} from "./component"; // Importa IProps aquí
import "./../style/visual.less";

export class Visual implements IVisual {
    private target: HTMLElement;
    private reactRoot: React.ComponentElement<IProps, ReactCircleCard>;

    constructor(options: VisualConstructorOptions) {
        const maxVal = 0; // Inicializa maxVal con un valor por defecto
        this.reactRoot = React.createElement(ReactCircleCard, {xData: [], categories: [], y2Data: [], displayName:"Rojo", width: 300, height: 300});
        this.target = options.element;

        ReactDOM.render(this.reactRoot, this.target);
    }

    public update(options: VisualUpdateOptions) {
        const dataView: DataView = options.dataViews[0];
        
    
        const xData = dataView.categorical.categories[0].values; // Esto es un array de strings
        const categories = dataView.categorical.categories[1].values
        const y2Data = dataView.categorical.values[0].values.map(value => value === null ? null : Number(Number(value).toFixed(2)));
        const displayName = dataView.categorical.values[0].source.displayName;
        const width = options.viewport.width;
        const height = options.viewport.height;
        // Imprime los datos por consola
        console.log("y2Data:", width);
        console.log("y2Data:", height);
        // Actualiza el componente React con los nuevos datos
        this.reactRoot = React.createElement(ReactCircleCard, {xData: xData, categories: categories, displayName:displayName, y2Data: y2Data} as IProps);
        ReactDOM.render(this.reactRoot, this.target);
    }
}
