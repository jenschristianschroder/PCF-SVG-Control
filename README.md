# PCF-SVG-Control

A Power Apps custom control to display SVG drawing and manipulate it based on a dynamic dataset

Control allows you to configure a SVG drawing source (inline or via data source) and a related dataset to manipulate the fill colors of the SVG file.

The SVG drawing is manipulated via the id and class tags on the SVG elements.

## Examples

### Floor plan seat allocation

![Floor plan seat allocation](/Documentation/Back%20to%20work%20Example.gif)

### Geo stats visualization

![Geo stats visualization](/Documentation/GeoStats%20Example.gif)

### Technical drawing checklist

![Technical drawing checklist](Documentation/Technical%20Drawing%20Example.gif)

## How to use

After adding the control to your canvas app you must configure the following:

### SVG Property

SVG property - Insert your SVG drawing inline or add it via data source
Make sure the relevant elements have the properties ***id*** and ***class*** set correctly. See hydraulicram below for an example.

Example (Technical Drawing SVG (shortened for readability)):

```html:
    <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 600 600' id='svg' version='1.0'> 

        <g id='layer1'>

            <g id='hydraulicram'>

                <rect

                    transform='matrix(0.98857004,-0.15076231,0.1603625,0.98705819,0,0)'

                    ry='2.5898221'

                    y='156.58168'

                    x='343.46832'

                    height='25.639238'

                    width='15.235045'

                    id='rect3328'

                    class='hydraulicram'

                    style='display:inline;overflow:visible;visibility:visible;opacity:1;fill:none;fill-opacity:1;stroke:#000000;
                    stroke-width:1.00002348;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:4;stroke-dasharray:none;stroke-dashoffset:0;stroke-opacity:1;marker:none;enable-background:accumulate' />

                <path ... />

            </g>

        </g>

    </svg>
```

### Dataset property

The configured dataset should include fields that can be mapped to the ***id*** and ***class*** properties of the SVG drawing

Example (Technical Drawing dataset)

```html:

ClearCollect(parts,

    { number: 1, part: "Hydraulic ram", objname: "hydraulicram", fillColor: "#ffffff" },

    { number: 2, part: "Hinge mechanism", objname: "hingemechanism", fillColor: "#ffffff" },

    { number: 3, part: "Strut", objname: "strut", fillColor: "#ffffff" },

    { number: 4, part: "Wheel boss", objname: "wheelboss", fillColor: "#ffffff" },

    { number: 5, part: "Wheel", objname: "wheel", fillColor: "#ffffff" },

    { number: 6, part: "Wing", objname: "wing", fillColor: "#ffffff" }

)

```
