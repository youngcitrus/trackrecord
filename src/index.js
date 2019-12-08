
const request = require('request');
const client_id = '2ac94934ad554c1c86adad5ab47d1553'; // Your client id
const client_secret = 'fc3d2d3ece504bea8f552847bf0b5c44'; // Your secret

document.addEventListener('DOMContentLoaded', () => {
  console.log('hi');

  //request auth token from Spotify API

  const authOptions = {
      url: 'https://cors-anywhere.herokuapp.com/https://accounts.spotify.com/api/token',
      headers: {
        'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64'))
          },
      form: {
        grant_type: 'client_credentials'
          },
      json: true
  };

  request.post(authOptions, function(error, response, body) {
    if (!error && response.statusCode === 200) {
  
      // use the access token to access the Spotify Web API
      // request 50 latest album/single releases

      let token = body.access_token;
      let options = {
        url: 'https://cors-anywhere.herokuapp.com/https://api.spotify.com/v1/browse/new-releases?limit=49',
        headers: {
          'Authorization': 'Bearer ' + token
        },
        json: true
      };

      const trackIds = [];
      const albums = [];

      request.get(options, function(error, response, body) {
        
        console.log(body);

        const svg = d3.select("#main").append("svg")
          .attr("width", 448)
          .attr("height", 448)

        const infoWindow = d3.select("#main").append("svg")
          .attr("width", 448)
          .attr("height", 448)
          .attr('x', 448)

        const svgText = infoWindow.append('text')
          .attr("x", 100)
          .attr("y", 200)
          .attr("font-family", "Roboto")
          .text("Click an album image for details")

        const svgText2 = infoWindow.append('text')
          .attr("x", 100)
          .attr("y", 225)
          .attr("font-family", "Roboto")
          .text("When ready click the arrow below for more data")

        const albumText = infoWindow.append('text')
          .attr("x", 0)
          .attr("y", 300)
          .attr("font-family", "Roboto")
          .attr("font-size", "19px")

        const artistText = infoWindow.append('text')
          .attr("x", 0)
          .attr("y", 320)
          .attr("font-family", "Roboto")
          .attr("font-size", "16px")


        const releaseDateText = infoWindow.append('text')
          .attr("x", 0)
          .attr("y", 340)
          .attr("font-family", "Roboto")
          .attr("font-size", "16px")

        const albumType = infoWindow.append('text')
          .attr("x", 0)
          .attr("y", 360)
          .attr("font-family", "Roboto")
          .attr("font-size", "16px")

        let artwork = svg.selectAll("image")
          .data(body.albums.items);
        
        artwork.enter()
          .append("image")
          .attr('xlink:href', function(d){
            return d.images[2].url
          })
          .attr('width', 64)
          .attr('height', 64)
          .attr('x', function(d, i){
            return (i % 7) * 64
          })
          .attr('y', function(d, i){
            return Math.floor(i / 7) * 64
          })

          .on('mouseover', function (d, i) {
            
            d3.select(this).transition()
                 .duration('50')
                 .attr('opacity', '.85')
          })
          
          .on('click', function (d, i) {
          
            infoWindow.append('image')
              .attr('xlink:href', d.images[1].url)
              .attr('x', 0)
              .attr('y', 0)
              .attr('width', 250)
              .attr('height', 250)
              .attr('id', 'showImage')

            let foreignObject = infoWindow.append('foreignObject')
              .attr('x', 0)
              .attr('y', 370)
              .attr('width', 448)
              .attr('height', 80)

            if (d3.select('#album-player')) d3.select('#album-player').remove();

            let player = foreignObject.append("xhtml:iframe")
                .attr('id', 'album-player')
                .attr('src', 'https://open.spotify.com/embed/album/' + d.id)
                .attr('allow', 'encrypted-media')

            let artists = [];
            d.artists.forEach(artist => {
              artists.push(artist.name)
            })
            // let artistsDisplay = "Artist: " + artists.join(", ");

            let date = new Date(d.release_date)
            date = date.toString().split(" ");
            date = [date[1], date[2], date[3]].join(" ")

            let albumName = d.name
            if (albumName.length > 48){
              albumName = albumName.slice(0,48) + "..."
            }

            svgText.text("")
            svgText2.text("")

            albumText.text("")
            albumText.text(albumName)

            artistText.text("")
            artistText.text("Artist: " + artists.join(", "))
            
            releaseDateText.text("Released: " + date)

          })
          
          .on('mouseout', function (d, i) {
            d3.select(this).transition()
                 .duration('50')
                 .attr('opacity', '1');
          })

        
        let successCounter = 0
        
        body.albums.items.forEach((album) => {

          // albums.push(album.name);

          // make API call to get tracks from albums
          let albumUrl = 'https://cors-anywhere.herokuapp.com/https://api.spotify.com/v1/albums/' + album.id + '/tracks';
          let albumOptions = {
            url: albumUrl,
            headers: {
              'Authorization': 'Bearer ' + token
            },
            json: true
          };
          
          request.get(albumOptions, function(error, response, body){

            body.items.forEach(track => {
              // track.artists.forEach(artist => {console.log('artist:' + artist.name)});
              // console.log('track:' + track.name)
              trackIds.push(track.id)
            });

            successCounter += 1;
            if (successCounter === 49){
              let audioFeatures = [];
              let numRecursions = Math.floor(trackIds.length/100) + 1;

              function fetchAllTracks(ids){
                if (ids.length === 0) return;
                firstHundred = ids.slice(0, 100);
                remaining = ids.slice(100)
                let tracksUrl = 'https://cors-anywhere.herokuapp.com/https://api.spotify.com/v1/audio-features?ids=' + firstHundred.join("%2C") 
                let tracksOptions = {
                url: tracksUrl,
                headers: {
                  'Authorization': 'Bearer ' + token
                  },
                json: true
                };

                request.get(tracksOptions, function(error, response, body){
                  audioFeatures.push(body);
                  if (audioFeatures.length === numRecursions){
                    // console.log('test')
                    // console.log(audioFeatures)
                    // console.log(audioFeatures.length)
                    let allAudioFeatures = [];
                    audioFeatures.forEach(part => {
                      part.audio_features.forEach(datum => {
                        // console.log(datum)
                        if (datum) allAudioFeatures.push(datum)
                      })
                    })
                    console.log(allAudioFeatures)
                    
                    const graphHeight = 800;
                    const graphWidth = 800;
                    const scaleTempo = d3.scaleLinear()
                      .domain([40, 230])
                      .range([0, graphWidth])

                    const scaleValence = d3.scaleLinear()
                      .domain([0,1])
                      .range(['#52a9ff', '#ff9452']);

                    const graph = d3.select("#scatterplot").append("svg")
                      .attr("width", graphWidth)
                      .attr("height", graphHeight)

                    const trackInfoWindow = d3.select("#scatterplot").append("svg")
                      .attr("width", 448)
                      .attr("height", 448)
                      .attr('x', 800)
                    
                    const trackTempoText = trackInfoWindow.append("text")
                      .attr('x', 25)
                      .attr("y", 25)
                      .text("")
                    
                    const trackDanceabilityText = trackInfoWindow.append("text")
                      .attr('x', 25)
                      .attr("y", 200)
                      .text("")

                    const dataPoints = graph.selectAll("circle")
                      .data(allAudioFeatures)

                    dataPoints.enter()
                      .append("circle")
                      .attr("class", "track-data-point")
                      // .attr("cx", function(d){
                      //   return scaleTempo(d.tempo)
                      // })
                      .attr("cx", -20)
                      .attr("cy", function(d){
                        return graphHeight - d.danceability * 800
                      })
                      .attr("r", function(d){
                        return d.energy * 10
                      })
                      .attr("fill", function(d){
                        return scaleValence(d.valence)
                      })

                      .on('mouseover', function (d, i) {
                        d3.select(this).transition()
                             .duration('50')
                             .attr('opacity', '.70')
                      })

                      .on('mouseout', function (d, i) {
                        d3.select(this).transition()
                             .duration('50')
                             .attr('opacity', '1');
                      })

                      .on('click', function (d) {
                        if (d3.select('#track-player')) d3.select('#track-player').remove();
                        let foreignObject = trackInfoWindow.append('foreignObject')
                          .attr('x', 0)
                          .attr('y', 370)
                          .attr('width', 448)
                          .attr('height', 80)
                        let player = foreignObject.append("xhtml:iframe")
                          .attr('id', 'track-player')
                          .attr('src', 'https://open.spotify.com/embed/track/' + d.id)
                          .attr('allow', 'encrypted-media')

                        trackTempoText.text("Tempo: " + d.tempo)
                        trackDanceabilityText.text("Danceability: " + d.danceability)
                        
                      })

                      graph.selectAll("circle")
                          .transition()
                          .delay(function(d,i){return(i*3)})
                          .duration(2000)
                          .attr("cx", function(d){
                            return scaleTempo(d.tempo)
                          })
                          .attr("cy", function(d){
                            return graphHeight - d.danceability * 800
                          })
                      
                      let dataByKey = {};
                      const keys = ["C", "Db/C#", "D", "Eb", "E", "F", "Gb/F#", "G", "Ab", "A", "Bb", "B"]
                      const circleOfFifths = ["C", "G", "D", "A", "E", "B", "Gb/F#", "Db/C#", "Ab", "Eb", "Bb", "F"]
                      allAudioFeatures.forEach((track) => {
                        let key = keys[track.key]
                        let order = circleOfFifths.indexOf(key);
                        if (!dataByKey[order]) {    
                          dataByKey[order] = []
                          // dataByKey[key]["order"] = order
                        }
                        dataByKey[order].push(track)
                      })
                      console.log(dataByKey)
                      // let dataByKeyArray = Object.values(dataByKey)
                      // console.log(dataByKeyArray)

                      const pie = d3.pie()
                        .value(function(d) {return d.value.length})
                        .sort(null)
                        
                      const arc = d3.arc()
                        .innerRadius(300)
                        .outerRadius(380)
                      
                      const labelArc = d3.arc()
                        .innerRadius(200)
                        .outerRadius(200)

                      let colors = d3.scaleOrdinal()
                        .domain(dataByKey)
                        .range(["#8dd3c7","#ffffb3","#bebada","#fb8072","#80b1d3","#fdb462","#b3de69","#fccde5","#d9d9d9","#bc80bd","#ccebc5","#ffed6f"]);

                      let dataReady = pie(d3.entries(dataByKey))

                      let pieChartArea = d3.select("#pie-chart").append("svg")
                        .attr("width", 800)
                        .attr("height", 800)
                        .append("g")
                        .attr("transform", "translate(400, 400)")
                      
                      const g = pieChartArea.selectAll('.arc')
                        .data(dataReady)
                        .enter()
                        .append('g')
                          .attr('class', 'arc')
                      g.append('path')
                        .attr('d', arc)
                        .attr('fill', function(d){ return(colors(d.data.key)) })
                        .attr("stroke", "black")
                        .style("stroke-width", "2px")
                        .style("opacity", 0.7)
                      g.append("text")
                          .text(function(d){return circleOfFifths[d.data.key]})
                          .attr("transform", function(d) { return ( "translate(" + arc.centroid(d) + ")" )})
                          .style("text-anchor", "middle")
                          .style("font-size", 17)
                          .style("font-family", "Roboto")


                      console.log('testing')
                      
                      const sunburstX = d3.scaleLinear()
                        .range([0, 2 * Math.PI])
                      const sunburstY = d3.scaleLinear()
                        .range([0, 400])

                      const partition = d3.partition()

                      const sunburstArc = d3.arc()
                        .startAngle(function(d){ return Math.max(0, Math.min(2 * Math.PI, sunburstX(d.x0))) })
                        .endAngle(function(d){ return Math.max(0, Math.min(2 * Math.PI, sunburstX(d.x1))) })
                        .innerRadius(function(d){ return Math.max(0, sunburstY(d.y0)) })
                        .outerRadius(function(d){ return Math.max(0, sunburstY(d.y1)) })

                      let sunburstColors = d3.scaleOrdinal(d3.schemeCategory20c)

                      let root = {name: "dataByKey", children: []}
                      for (let i=0; i < 12; i++){
                        root.children.push({name: i, children: dataByKey[i], size: dataByKey[i].length})
                      }

                      console.log("what")

                      root = d3.hierarchy(root)
                        .sum(function(d){ 
                          if (d.size) return d.size
                          else {
                            let key = keys[d.key]
                            let order = circleOfFifths.indexOf(key)
                            if (root.children[order]){
                              return (root.children[order].size)
                            }
                          };
                        })

                      // console.log(partition(root).descendants())

                      const sunburstArea = d3.select("#sunburst").append("svg")
                        .attr("width", 800)
                        .attr("height", 800)
                        .append("g")
                        .attr("transform", "translate(400, 400)")
                      
                      
                      // sunburstArea.selectAll("path")
                      //   .data(partition(root).descendants())
                      //   .enter()
                      //   .append("path")
                      //     .attr("d", sunburstArc)
                      //     .style("fill", function(d){ return sunburstColors((d.children ? d : d.parent).data.name) })
                      //     .attr("stroke", "black")
                      //       .append("text")
                      //       .text(function(d){ 
                      //         if (d.parent == null) return null
                      //         if (d.children) {
                      //           debugger
                      //           let key = d.children[0].data.key
                      //           return keys[key]
                      //         }
                      //       })

                      const sunburst = sunburstArea.selectAll('.path')
                        .data(partition(root).descendants())
                        .enter()
                        .append("g")
                          .attr('class', 'path')
                         
                      sunburst.append('path')    
                        .attr("d", sunburstArc)
                        .style("fill", function(d){ return sunburstColors((d.children ? d : d.parent).data.name) })
                        .attr("stroke", "black")
                        // .on('mouseover', function (d, i) {
                        //   if (d.parent){
                        //     d3.select(this).transition()
                        //         .duration('50')
                        //         .attr('opacity', '.85')
                        //   }
                        // })
                        // .on('mouseout', function (d, i) {
                        //   d3.select(this).transition()
                        //        .duration('50')
                        //        .attr('opacity', '1');
                        // })
                        .on('click', click)

                        let level = 0;

                        function click(d){
                          sunburstArea.transition()
                            .duration(750)
                            .tween("scales", function() {
                              let xd = d3.interpolate(sunburstX.domain(), [d.x0, d.x1])
                              let yd = d3.interpolate(sunburstY.domain(), [d.y0, 1])
                              let yr = d3.interpolate(sunburstY.range(), [d.y0 ? 10 : 0, 400])
                              return function(t){ sunburstX.domain(xd(t)); sunburstY.domain(yd(t)).range(yr(t))}
                            })
                            .selectAll("path")
                              .attrTween("d", function(d){return function(){return sunburstArc(d)}})
                          
                          // sunburstArea.selectAll('text')
                          //   .text("")


                          if (d3.select('#key-player')) d3.select('#key-player').remove();
                          if (!d.children){
                            let foreignObject = testWindow.append('foreignObject')
                              .attr('x', 0)
                              .attr('y', 370)
                              .attr('width', 448)
                              .attr('height', 80)
                            let player = foreignObject.append("xhtml:iframe")
                              .attr('id', 'key-player')
                              .attr('src', 'https://open.spotify.com/embed/track/' + d.data.id)
                              .attr('allow', 'encrypted-media')
                            level = 2
                          }
                          console.log(d)
                          

                        }

                      const testWindow = d3.select("#sunburst").append("svg")
                        .attr("height", 400)
                        .attr("width", 400)
                        .attr('x', 800)


                      sunburst.append("text")
                          .text(function(d){ 
                            if (d.parent === null) return ""
                            if (d.children) {
                              // debugger
                              let key = d.children[0].data.key
                              return keys[key]
                            }
                            else return ""
                          })
                          .attr("transform", function(d) { return ( "translate(" + sunburstArc.centroid(d) + ")" )})
                          .style("text-anchor", "middle")
                          .style("font-size", 14)
                          .style("font-family", "Roboto")

                      


                        

                  }

                })
                return fetchAllTracks(remaining);

              }

              fetchAllTracks(trackIds);

            }

          });
          
        })
      });
    }
  });
});