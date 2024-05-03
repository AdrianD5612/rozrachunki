import React, { Component } from 'react';
import dynamic from "next/dynamic";

var CanvasJSChart = dynamic(
  () =>
    import('@canvasjs/react-charts').then((mod) => mod.default.CanvasJSChart),
  { ssr: false }
);

class App extends Component {
  render() {
    return (
      <div>
        <CanvasJSChart
          options={this.props.options}
          //onRef={(ref) => (this.chart = ref)}
        />
      </div>
    );
  }
}

export default App;