import React from 'react';
import JSONEditor, { JSONEditorOptions } from 'jsoneditor';

export class JsonEditor<T> extends React.Component<{ json: T, className?: string, options?: JSONEditorOptions, onChange?: (json: T) => void }, {}, any> {
  private _containerRef = React.createRef<HTMLDivElement>();
  private _jsonEditor: JSONEditor | undefined;

  private onChange() {
    if (this.props.onChange) {
      this.props.onChange(this._jsonEditor?.get());
    }
  }

  componentDidMount() {
    if (this._containerRef.current) {
      this._jsonEditor = new JSONEditor(this._containerRef.current, { ...this.props.options, onChange: () => this.onChange() });
      this._jsonEditor.set(this.props.json);
    }
  }

  componentDidUpdate() {
    this._jsonEditor?.set(this.props.json);
  }

  componentWillUnmount() {
    this._jsonEditor?.destroy();
    this._jsonEditor = undefined;
  }

  render() {
    return <div className={this.props.className} ref={this._containerRef} />
  }
}
