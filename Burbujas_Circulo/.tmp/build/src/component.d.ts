import * as React from 'react';
export interface IProps {
    xData: string[];
    y2Data: number[];
    displayName: string;
    categories: string[];
    width: number;
    height: number;
}
export declare class ReactCircleCard extends React.Component<IProps> {
    private svgRef;
    private simulation;
    constructor(props: IProps);
    componentDidMount(): void;
    componentDidUpdate(): void;
    drawChart(): void;
    render(): React.JSX.Element;
}
