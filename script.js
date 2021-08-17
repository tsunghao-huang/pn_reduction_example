var w = 660;
var h = 600;
var linkDistance = 120;

var colors = d3.scale.category10();
const toggleBtns = document.querySelectorAll(".toggle-btns");
const pnImgs = document.querySelectorAll('.pn-img');
const pnImgTitles = document.querySelectorAll('.pn-img-title');

const edgeColor = "gray";
const rootNodeColor = "#BADA55";
const regularNodeColor = "pink";
const leafNodeColor = "#4CED";

// const rootNodeColor = "#11B695";
// const regularNodeColor = "#FFF700";
// const leafNodeColor = "pink";

toggleBtns.forEach((btn) => { btn.addEventListener('click', switchLock) });


function switchLock() {
    toggleBtns.forEach((btn, ind) => {
        if (btn.classList.contains('locked-btn')) {
            btn.classList.remove('locked-btn');
            btn.innerHTML = '<i class="fas fa-lock-open"></i>';
            pnImgs[ind].classList.remove('locked');
            pnImgTitles[ind].classList.remove('locked');
        } else {
            btn.classList.add('locked-btn');
            btn.innerHTML = '<i class="fas fa-lock"></i>';
            pnImgs[ind].classList.add('locked');
            pnImgTitles[ind].classList.add('locked');
        }
    })
}

fetch('./DAG/DAG.json').then(response => response.json())
    .then((dataset) => {

        var svg = d3.select("body")
            .append("svg")
            // .attr({ "width": w, "height": h })
            .attr("preserveAspectRatio", "xMinYMin meet")
            .attr("viewBox", `0 0 ${w} ${h}`)
        // .call(d3.behavior.zoom().on("zoom", function () {
        //     svg.attr("transform", "translate(" + d3.event.translate + ")" + " scale(" + d3.event.scale + ")")
        // }))
        // .append("g");

        var force = d3.layout.force()
            .nodes(dataset.nodes)
            .links(dataset.edges)
            .size([w, h])
            .linkDistance([linkDistance])
            .charge([-600])
            .theta(0.1)
            .gravity(0.06)
            .start();

        var edges = svg.selectAll("line")
            .data(dataset.edges)
            .enter()
            .append("line")
            .attr("id", function (d, i) { return 'edge' + i })
            .attr('marker-end', 'url(#arrowhead)')
            .style("stroke", edgeColor)
            .style("pointer-events", "none");

        function nodeColor(n) {
            if (n.name == 'root') {
                return rootNodeColor;
            } else if (n.t_net && n.p_net) {
                return leafNodeColor;
            } else {
                return regularNodeColor;
            }
        };

        var nodes = svg.selectAll("circle")
            .data(dataset.nodes)
            .enter()
            .append("circle")
            .attr({ "r": 10 })
            // .style("fill",function(d,i){return colors(i);})
            .style("fill", (n) => nodeColor(n))
            .call(force.drag);

        const tooltip = d3.select('body')
            .append('div')
            .attr("class", "tooltip")
            .style("opacity", 0);


        var nodelabels = svg.selectAll(".nodelabel")
            .data(dataset.nodes)
            .enter()
            .append("text")
            .attr({
                "x": function (d) { return d.x; },
                "y": function (d) { return d.y; },
                "class": "nodelabel",
                "stroke": "black",
                "font-size": 12,
                "cursor": "pointer"
            })
            .text(function (d) { return d.name; })
            // Tooltip stuff after this
            .on("mouseover", function (d) {
                tooltip.transition()
                    .duration(500)
                    .style("opacity", 0);
                tooltip.transition()
                    .duration(200)
                    .style("opacity", .6);
                tooltip.html(`${d.name}<br/>T-net: ${d.t_net}<br/>P-net: ${d.p_net}`)
                    .style("left", (d3.event.pageX + 5) + "px")
                    .style("top", (d3.event.pageY + 5) + "px");
            })
            .on('mouseout', () => tooltip.style('opacity', 0));

        // updagte img src upon click
        nodelabels.on("click", (n) => {
            pnImgs.forEach((pnImg, ind) => {
                if (!pnImg.classList.contains('locked')) {
                    pnImg.src = `./png/${n.name}.png`;
                    pnImgTitles[ind].innerText = n.name;
                    pnImgTitles[ind].style.backgroundColor = nodeColor(n);
                }
            });
        });

        var edgepaths = svg.selectAll(".edgepath")
            .data(dataset.edges)
            .enter()
            .append('path')
            .attr({
                'd': function (d) { return 'M ' + d.source.x + ' ' + d.source.y + ' L ' + d.target.x + ' ' + d.target.y },
                'class': 'edgepath',
                'fill-opacity': 0,
                'stroke-opacity': 0,
                'fill': 'blue',
                'stroke': 'red',
                'id': function (d, i) { return 'edgepath' + i }
            })
            .style("pointer-events", "none");

        var edgelabels = svg.selectAll(".edgelabel")
            .data(dataset.edges)
            .enter()
            .append('text')
            .style("pointer-events", "none")
            .attr({
                'class': 'edgelabel',
                'id': function (d, i) { return 'edgelabel' + i },
                'dx': linkDistance / 2,
                'dy': 10,
                'font-size': 12,
                'fill': edgeColor
            });

        edgelabels.append('textPath')
            .attr('xlink:href', function (d, i) { return '#edgepath' + i })
            .style("pointer-events", "none")
            .text(function (d, i) { return d.label });


        svg.append('defs').append('marker')
            .attr({
                'id': 'arrowhead',
                'viewBox': '-0 -5 10 10',
                'refX': 25,
                'refY': 0,
                //'markerUnits':'strokeWidth',
                'orient': 'auto',
                'markerWidth': 8,
                'markerHeight': 7,
                'xoverflow': 'visible'
            })
            .append('svg:path')
            .attr('d', 'M 0,-5 L 10 ,0 L 0,5')
            .attr('fill', edgeColor)
            .attr('stroke', edgeColor);


        // legends
        const legendX = 10;
        const legendYD = 16;
        svg.append("circle")
            .attr("cx", legendX)
            .attr("cy", h - (h / legendYD))
            .attr("r", 6)
            .attr('class', 'legend-dot')
            .style("fill", rootNodeColor);

        svg.append("text")
            .attr("x", legendX + 8)
            .attr("y", h - (h / legendYD) + 3)
            .text("root (input Petri net)")
            .style("font-size", "14px")
            .attr("alignment-baseline", "middle");

        svg.append("circle")
            .attr("cx", legendX)
            .attr("cy", h - (h / legendYD) + 20)
            .attr("r", 6)
            .attr('class', 'legend-dot')
            .style("fill", leafNodeColor);

        svg.append("text")
            .attr("x", legendX + 8)
            .attr("y", h - (h / legendYD) + 20 + 3)
            .text("leaf node (T-net & P-net)")
            .style("font-size", "14px")
            .attr("alignment-baseline", "middle");

        svg.append("circle")
            .attr("cx", legendX)
            .attr("cy", h - (h / legendYD) + 40)
            .attr("r", 6)
            .attr('class', 'legend-dot')
            .style("fill", regularNodeColor);

        svg.append("text")
            .attr("x", legendX + 8)
            .attr("y", h - (h / legendYD) + 40 + 3)
            .text("other reduced Petri net")
            .style("font-size", "14px")
            .attr("alignment-baseline", "middle");

        force.on("tick", function () {

            edges.attr({
                "x1": function (d) { return d.source.x; },
                "y1": function (d) { return d.source.y; },
                "x2": function (d) { return d.target.x; },
                "y2": function (d) { return d.target.y; }
            });

            nodes.attr({
                "cx": function (d) { return d.x; },
                "cy": function (d) { return d.y; }
            });

            nodelabels.attr("x", function (d) { return d.x; })
                .attr("y", function (d) { return d.y; });

            edgepaths.attr('d', function (d) {
                var path = 'M ' + d.source.x + ' ' + d.source.y + ' L ' + d.target.x + ' ' + d.target.y;
                //console.log(d)
                return path
            });

            edgelabels.attr('transform', function (d, i) {
                if (d.target.x < d.source.x) {
                    bbox = this.getBBox();
                    rx = bbox.x + bbox.width / 2;
                    ry = bbox.y + bbox.height / 2;
                    return 'rotate(180 ' + rx + ' ' + ry + ')';
                }
                else {
                    return 'rotate(0)';
                }
            });
        });

    })