import {IInputs, IOutputs} from "./generated/ManifestTypes";
import DataSetInterfaces = ComponentFramework.PropertyHelper.DataSetApi;
type DataSet = ComponentFramework.PropertyTypes.DataSet;

const elemRecordId: string = "elemRecId";


export class SVGControl implements ComponentFramework.StandardControl<IInputs, IOutputs> {
	// Cached context object for the latest updateView
	private contextObj: ComponentFramework.Context<IInputs>;

	// Div element created as part of this control's main container
	private mainContainer: HTMLDivElement;

	// Image element created as part of this control's table
	private svgContainer: HTMLDivElement;

	private randomString: string;

    private svg: SVGGraphicsElement;
    private vbox: number[];

	private zoomLevel = 1;
	private zoomToId: string;

	private tscale = 2;

	private _notifyOutputChanged: () => void;
	/**
	 * Empty constructor.
	 */
	constructor()
	{

	}

	/**
	 * Used to initialize the control instance. Controls can kick off remote server calls and other initialization actions here.
	 * Data-set values are not initialized here, use updateView.
	 * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to property names defined in the manifest, as well as utility functions.
	 * @param notifyOutputChanged A callback method to alert the framework that the control has new outputs ready to be retrieved asynchronously.
	 * @param state A piece of data that persists in one session for a single user. Can be set at any point in a controls life cycle by calling 'setControlState' in the Mode interface.
	 * @param container If a control is marked control-type='standard', it will receive an empty div element within which it can render its content.
	 */
	public init(context: ComponentFramework.Context<IInputs>, notifyOutputChanged: () => void, state: ComponentFramework.Dictionary, container:HTMLDivElement)
	{
		// Add control initialization code

		//Generate random string to prefix dom elements
		this.randomString = Random.newString();

		// Need to track container resize so that control could get the available width. The available height won't be provided even this is true
		context.mode.trackContainerResize(true);

		// Set pageSize of dataset
		context.parameters.dataSet.paging.setPageSize(100);

		// Create main container div. 
		this.mainContainer = document.createElement("div");
		this.mainContainer.classList.add("main-container");
		
		// Create svg container div and append to main container. 
		this.svgContainer = document.createElement("div");
		this.mainContainer.classList.add("svg-container");
		this.svgContainer.setAttribute("id", this.randomString + "svg-container");

		// Adding the main container to the container DIV.
		this.mainContainer.appendChild(this.svgContainer);
		container.appendChild(this.mainContainer);
		
		this._notifyOutputChanged = notifyOutputChanged;
	}


	/**
	 * Called when any value in the property bag has changed. This includes field values, data-sets, global values such as container height and width, offline status, control metadata values such as label, visible, etc.
	 * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to names defined in the manifest, as well as utility functions
	 */
	public updateView(context: ComponentFramework.Context<IInputs>): void
	{
		// Add code to update control view
		this.contextObj = context;

		// Set SVG content
		if(this.contextObj.parameters.svg != null){
			if(this.contextObj.parameters.svg.raw != null) {
				this.svgContainer.innerHTML = this.contextObj.parameters.svg.raw.toString();
				this.initSVG();
			}		
		}

		// Set zoom level
		if(this.contextObj.parameters.zoomLevel != null){
			if(this.contextObj.parameters.zoomLevel.raw != null) {
				this.zoomLevel = this.contextObj.parameters.zoomLevel.raw;
			}		
		}

		// Read records from dataset
		if(!this.contextObj.parameters.dataSet.loading){
			if(this.contextObj.parameters.dataSet.sortedRecordIds.length > 0)
			{
				// Loop through records
				for(let currentRecordId of this.contextObj.parameters.dataSet.sortedRecordIds){
					// Alias workaround
					var idColumn = this.contextObj.parameters.dataSet.columns.find(x => x.alias === "id");
					var idColumnName = idColumn == null ? "id" : idColumn.name;
					var fillColumn = this.contextObj.parameters.dataSet.columns.find(x => x.alias === "fill");
					var fillColumnName = fillColumn == null ? "fill" : fillColumn.name

					// Find referenced SVG elements
					var svgObjCollection = document.getElementsByClassName(this.contextObj.parameters.dataSet.records[currentRecordId].getFormattedValue(idColumnName).toLowerCase().replace(/\s/g, ""));
					
					// Set fill color of found SVG elements
					for (let i = 0; i < svgObjCollection.length; i++) {
						let svgObj = <SVGElement>svgObjCollection[i];
						if(svgObj != null){
							if(fillColumn != null) {
								svgObj.style.fill = this.contextObj.parameters.dataSet.records[currentRecordId].getFormattedValue(fillColumnName);
							}
							// Add onclick event to SVG element
							svgObj.addEventListener("click", this.onElementClick.bind(this));
	
							// Set the recordId on the SVG element
							svgObj.setAttribute(elemRecordId, currentRecordId);
						}
					}
				}
			}
		}

		//reset zoom
		this.reset();

		if(this.contextObj.parameters.scale != null) {
			if(this.contextObj.parameters.scale.raw != null) {
				this.tscale = this.contextObj.parameters.scale.raw;
			}
		}

		// Zoom to SVG element if configured
		if(this.contextObj.parameters.zoomToId != null) {
			if(this.contextObj.parameters.zoomToId.raw != null) {
				this.zoomToId = this.contextObj.parameters.zoomToId.raw.toString();

				if(this.zoomToId != "") {
					let svgElem: any = document.getElementById(this.zoomToId);
					if(svgElem != null) {
						//ZOOM
						this.zoomToElement(this.zoomToId);
					}
				}
			}
		}
	}

	/**
   * Row Click Event handler for the associated row when being clicked
   * @param event
   */
	private onElementClick(event: Event): void {
		let elementRecordId = (event.currentTarget as HTMLDivElement).getAttribute(elemRecordId);
		if (elementRecordId) {
			const record = this.contextObj.parameters.dataSet.records[elementRecordId];

			this.contextObj.parameters.dataSet.setSelectedRecordIds([elementRecordId]);
			this.contextObj.parameters.dataSet.openDatasetItem(record.getNamedReference());

			this._notifyOutputChanged();
		}

	}
	

	/** 
	 * It is called by the framework prior to a control receiving new data. 
	 * @returns an object based on nomenclature defined in manifest, expecting object[s] for property marked as “bound” or “output”
	 */
	public getOutputs(): IOutputs
	{
		return {};
	}

	/** 
	 * Called when the control is to be removed from the DOM tree. Controls should use this call for cleanup.
	 * i.e. cancelling any pending remote calls, removing listeners, etc.
	 */
	public destroy(): void
	{
		// Add code to cleanup control if necessary
	}

	// Initialize SVG 
	// Need the viewbox properties to facilitate zoom functionality
	private initSVG():void 
	{
		this.vbox = [0, 0, 0, 0];

		let _svgElement = document.querySelector("#" + this.randomString + "svg-container svg");
		if(_svgElement != null)
		{
			// The main SVG object and its current viewBox
			this.svg = _svgElement as SVGGraphicsElement;

			// Parse the viewBox properties
			let _viewbox = this.svg.getAttribute('viewBox');
			if(_viewbox != null) {
				let _vbox = _viewbox.split(' ');
				this.vbox[0] = parseFloat(_vbox[0]);
				this.vbox[1] = parseFloat(_vbox[1]);
				this.vbox[2] = parseFloat(_vbox[2]);
				this.vbox[3] = parseFloat(_vbox[3]);
			}
		}
    }

	// Reset SVG to original state
    private reset():void {
		this.svg.setAttribute("viewBox", ""+this.vbox[0]+" "+this.vbox[1]+" "+this.vbox[2]+" "+this.vbox[3]);
    }

	// Zoom to SVG element by manipulating the viewbox properties
    private zoomToElement(elementId: string) {
		// the current center of the viewBox
		var cx=this.vbox[0]+this.vbox[2]/2;
		var cy=this.vbox[1]+this.vbox[3]/2;

		let element = this.svg.querySelector('#' + elementId) as SVGGraphicsElement;
		if(element != null && this.svg != null) {
			let bbox = element.getBBox();
			let _domMatrix = element.getScreenCTM();

			if(_domMatrix != null) {
				//SVGElement.prototype.getTransformToElement || function(toElement) { return toElement.getScreenCTM().inverse().multiply(this.getScreenCTM()); };
				let matrix = _domMatrix.inverse().multiply(this.svg.getScreenCTM() as DOMMatrixInit);

				// the new center
				let newx = (bbox.x + bbox.width/2)*matrix.a + matrix.e;
				let newy = (bbox.y + bbox.height/2)*matrix.d + matrix.f;

				// the corresponding top left corner in the current scale
				let absolute_offset_x = this.vbox[0] + newx - cx;
				let absolute_offset_y = this.vbox[1] + newy - cy;

				// the new scale
				let scale = bbox.width*matrix.a/this.vbox[2] * (6 - this.zoomLevel);

				let scaled_offset_x = absolute_offset_x + this.vbox[2]*(1-scale)/this.tscale; //tscale = 2
				let scaled_offset_y = absolute_offset_y + this.vbox[3]*(1-scale)/this.tscale; //tscale = 2;
				let scaled_width = this.vbox[2]*scale;
				let scaled_height = this.vbox[3]*scale;

				this.svg.setAttribute("viewBox", ""+scaled_offset_x+" "+scaled_offset_y+" "+scaled_width+" "+scaled_height);
			}
		}
	}
}

// Generate random string
class Random {
	static newString() {
	  return 'axxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
		var r = Math.random() * 16 | 0,
		  v = c == 'x' ? r : (r & 0x3 | 0x8);
		return v.toString(16);
	  });
	}
  }