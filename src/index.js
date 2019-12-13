
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

        const nav1 = document.createElement("p")
        nav1.textContent = "start here";

        document.getElementById("nav-1").appendChild(nav1);

        nav1.addEventListener('click', function(){
          console.log('hmmmmm')
          $('html, body').animate({ scrollTop: $('#main-container').offset().top }, 'slow');
          return false;
        })

        const prev1Icon = document.getElementById("prev-1-icon");
        const prev1 = document.createElement("i");
        prev1.setAttribute("class", "fas fa-angle-up")
        prev1Icon.appendChild(prev1)
        prev1Icon.addEventListener('click', function(){
          console.log('hmmmmm')
          $('html, body').animate({ scrollTop: $('#landing').offset().top }, 'slow');
          return false;
        })

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

                    let allAudioFeatures = [];
                    audioFeatures.forEach(part => {
                      part.audio_features.forEach(datum => {
                        if (datum) allAudioFeatures.push(datum)
                      })
                    })
                    console.log(allAudioFeatures)
                      
                    const nav2 = document.createElement("i")
                    nav2.setAttribute("class","fas fa-angle-down");
                    nav2.setAttribute("onClick", "scroll1()")
                    nav2Icon = document.getElementById("nav-2-icon")
                    nav2Icon.appendChild(nav2);

                    nav2Icon.addEventListener('click', function(){
                      $('html, body').animate({ scrollTop: $('#sunburst-container').offset().top }, 'slow');
                      return false;
                    })

                    //Sunburst Chart

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



                    let colors = d3.scaleOrdinal()
                      .domain(dataByKey)
                      .range(["#8dd3c7","#ffffb3","#bebada","#fb8072","#80b1d3","#fdb462","#b3de69","#fccde5","#d9d9d9","#bc80bd","#ccebc5","#ffed6f"]);


                    console.log('testing')
                      
                    const sunburstX = d3.scaleLinear()
                      .range([0, 2 * Math.PI])
                    const sunburstY = d3.scaleSqrt()
                      .range([0, 350])

                    const partition = d3.partition()

                    const sunburstArc = d3.arc()
                      .startAngle(function(d){ return Math.max(0, Math.min(2 * Math.PI, sunburstX(d.x0))) })
                      .endAngle(function(d){ return Math.max(0, Math.min(2 * Math.PI, sunburstX(d.x1))) })
                      .innerRadius(function(d){ return Math.max(0, sunburstY(d.y0)) })
                      .outerRadius(function(d){ return Math.max(0, sunburstY(d.y1)) })

                    let sunburstColors = d3.scaleOrdinal(d3.schemeCategory20c)

                    let root = {children: []}
                    for (let i=0; i < 12; i++){
                      root.children.push({name: i, children: dataByKey[i], size: dataByKey[i].length })
                    }
                    root.children.forEach(child => {
                      child.children.forEach(track => {track.size = sunburstY(child.size)})
                    })

                    console.log(root)

                    root = d3.hierarchy(root)
                      .sum(function(d){ 
                        if (d.size) return d.size
                      })


                    const sunburstArea = d3.select("#sunburst").append("svg")
                      .attr("width", 700)
                      .attr("height", 700)
                      .append("g")
                      .attr("transform", "translate(350, 350)")
                    

                    const sunburst = sunburstArea.selectAll('.path')
                      .data(partition(root).descendants())
                      .enter()
                      .append("g")
                        .attr('class', 'path')
                        
                    sunburst.append('path')    
                      .attr("d", sunburstArc)
                      .style("fill", function(d){ 
                        if (!d.parent) return "black"
                        return sunburstColors((d.children ? d : d.parent).data.name)
                      })
                      .attr('id', function(d){
                        if (!d.parent) return 'root-level'
                      })
                      .style('opacity', function(d){ if (!d.parent) return 0; else return 1})
                      .attr("stroke", "black")
                      .attr("stroke-opacity", "0.5")
                      .attr("class", function(d){
                        if (d.parent && d.children) return "selectors key-level"
                        else return "selectors"
                      })
                      .on('click', click)

                        
                    let level = 0

                    function click(d){
                        
                      if (!d.children){

                        if (d3.select('#key-player')) d3.select('#key-player').remove();

                        let foreignObject = testWindow.append('foreignObject')
                          .attr('width', 80)
                          .attr('height', 80)
                        let player = foreignObject.append("xhtml:iframe")
                          .attr('id', 'key-player')
                          .attr('src', 'https://open.spotify.com/embed/track/' + d.data.id)
                          .attr('allow', 'encrypted-media')
                          .style('border-radius','20px')              
                      }

                      if (d.children && d.parent && level !== 1){
                        level = 1
                        if (d3.select('#key-player')) d3.select('#key-player').remove();
                        
                        d3.selectAll(".key-level").classed("no-hover", true)
                        d3.select("#root-level").classed("no-hover", true)

                        d3.select('#root-level').style('fill',sunburstColors(d.data.name)).style('opacity', 1).attr('stroke', sunburstColors(d.data.name))
                        sunburstArea.transition()
                          .duration(650)
                          .tween("scales", function() {
                            let xd = d3.interpolate(sunburstX.domain(), [d.x0, d.x1])
                            let yd = d3.interpolate(sunburstY.domain(), [d.y0, 1])
                            let yr = d3.interpolate(sunburstY.range(), [d.y0 ? 10 : 0, 350])
                            return function(t){ sunburstX.domain(xd(t)); sunburstY.domain(yd(t)).range(yr(t))}
                          })
                          .selectAll("path")
                            .attrTween("d", function(d){return function(){return sunburstArc(d)}})

                        
                        sunburstArea.selectAll('text')
                          .remove()
                        
                        setTimeout(function(){
                          sunburstArea.append('text')
                            .text(keys[d.children[0].data.key])
                            .attr('x', -7 - 4.15*(keys[d.children[0].data.key].length - 1))
                            .attr('y', -150)
                            .style('font-family', 'Roboto')
                            .style('font-size', 17)

                          sunburstArea.append('text')
                            .text('back')
                            .attr('x', -13.75)
                            .attr('y', 165)
                            .style('cursor', 'default')
                            .style('font-family', 'Roboto')
                            .style('font-size', 14)
                            .on('click', function(){
                              d3.select('#root-level').dispatch('click');
                            });
                        }, 200)

                        sunburstArea.selectAll('path')
                          .attr("stroke-width", function(data){
                            return (data.parent && data.children) ? 0 : 1
                          });

                        d3.selectAll('.selectors').on('click',function(){
                          d3.select(this).on('click',null);
                        });

                        if (!d.loaded){
                          setTimeout(function(){
                            let foreignDiv = sunburstArea.append('foreignObject')
                              .attr('x', -14)
                              .attr('y', -14)
                              .attr('width', 35)
                              .attr('height', 35)
                            
                            let loading = foreignDiv.append('xhtml:div')
                              .attr('id', 'loading-spin')

                            request.post(authOptions, function(error, response, body){
                              if (!error && response.statusCode === 200){
                                let token = body.access_token;
                                let successTrack = 0
                                d.children.forEach((track, index) => {
                                  let options = {
                                    url: 'https://cors-anywhere.herokuapp.com/https://api.spotify.com/v1/tracks/' + track.data.id,
                                    headers: {
                                      'Authorization': 'Bearer ' + token
                                    },
                                    json: true
                                  };
                                  
                                  request.get(options, function(error, response, body){

                                    let rotation
                                    
                                    if (index < d.children.length / 2) rotation = -90 + ((index + 0.5) / d.children.length) * 360
                                    else {
                                      newIndex = index - d.children.length/2

                                      rotation = -90 + ((newIndex + 0.5) / d.children.length) * 360
                                    }
                                    console.log(body)
                                    track.name = body.name
                                    track.artists = []
                                    body.artists.forEach(artist => {track.artists.push(artist.name)})
                                    track.firstArtist = track.artists[0]
                                    track.albumName = body.album.name
                                    track.releaseDate = body.album.release_date
                                    
                                    let artistNameTrack = body.artists[0].name
                                    if (artistNameTrack.length > 17) {
                                      artistNameTrack = artistNameTrack.slice(0, 17) + "..."
                                      track.firstArtist = track.firstArtist.slice(0, 17) + "..."
                                    }
                                    sunburstArea.append("text")
                                      .text(artistNameTrack)
                                      .attr("transform", function() {
                                        return ( "translate(" + sunburstArc.centroid(d.children[index]) + ") rotate(" + rotation.toString() +")")
                                      })
                                      .style("text-anchor", "middle")
                                      .style("font-size", 14)
                                      .style("opacity", "0")
                                      .attr("class", "key-text")
                                      .style("font-family", "Roboto")
                                        .transition()
                                        .duration(100)
                                        .style('opacity', "1")
                                    successTrack += 1
                                    if (successTrack === d.children.length) {
                                      d3.selectAll('.selectors').on('click', click)
                                      d.loaded = true;
                                      foreignDiv.remove();
                                    }
                                  })
                                })
                              }
                            })
                          }, 650)
                        } else {
                          d3.selectAll('.selectors').on('click', click)
                          
                          setTimeout(function(){
                            d.children.forEach((track, index) => {
                              let rotation
                              if (index < d.children.length / 2) rotation = -90 + ((index + 0.5) / d.children.length) * 360
                              else {
                                newIndex = index - d.children.length/2

                                rotation = -90 + ((newIndex + 0.5) / d.children.length) * 360
                              }
                              sunburstArea.append("text")
                                      .text(track.firstArtist)
                                      .attr("transform", function() {
                                        return ( "translate(" + sunburstArc.centroid(d.children[index]) + ") rotate(" + rotation.toString() +")")
                                      })
                                      .style("text-anchor", "middle")
                                      .style("font-size", 14)
                                      .style("opacity", "0")
                                      .attr("class", "key-text")
                                      .style("font-family", "Roboto")
                                        .transition()
                                        .duration(100)
                                        .style('opacity', "1")

                            })
                          }, 700)
                          console.log('poop')
                        }

                      }
                            
                      if (!d.parent && level !== 0){

                        level = 0
                        if (d3.select('#key-player')) d3.select('#key-player').remove();

                        d3.selectAll(".key-level").classed("no-hover", false)

                        d3.select('#root-level').style('fill', 'white' )
                        sunburstArea.transition()
                          .duration(650)
                          .tween("scales", function() {
                            let xd = d3.interpolate(sunburstX.domain(), [d.x0, d.x1])
                            let yd = d3.interpolate(sunburstY.domain(), [d.y0, 1])
                            let yr = d3.interpolate(sunburstY.range(), [d.y0 ? 10 : 0, 350])
                            return function(t){ sunburstX.domain(xd(t)); sunburstY.domain(yd(t)).range(yr(t))}
                          })
                          .selectAll("path")
                            .attrTween("d", function(d){return function(){return sunburstArc(d)}})

                        sunburstArea.selectAll('text')
                          .remove()
                        
                        setTimeout(function(){
                          sunburstArea.selectAll('path')
                              .attr("stroke-width", 1)
                        }, 600)
                        setTimeout(function(){
                          sunburst.append('text')
                            .text(function(data){ 
                              if (data.parent === null) return ""
                              if (data.children) {
                                // debugger
                                let key = data.children[0].data.key
                                return keys[key]
                              }
                              else return ""
                            })
                            .attr("transform", function(data) { return ( "translate(" + sunburstArc.centroid(data) + ")" )})
                            .style("text-anchor", "middle")
                            .style("font-size", 14)
                            .style("font-family", "Roboto")
                            .attr("class", "key-text")

                        }, 800)
                          
                      }
                        console.log(d)
                        

                    }

                    const testWindow = sunburstArea.append("svg")
                      .attr("height", 350)
                      .attr("width", 350)
                      .attr('x', -40)
                      .attr('y', -40)


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
                        .attr("class", "key-text")


                    // Scatterplot
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