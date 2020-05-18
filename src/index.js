
import { CLIENT_ID, CLIENT_SECRET } from './keys.js';
const request = require('request');
const client_id = CLIENT_ID // Your client id
const client_secret = CLIENT_SECRET; // Your secret

// refresh page at the top
window.onbeforeunload = function () {
  document.getElementsByTagName("BODY")[0].style.display = "none";
  window.scrollTo(0, 0);
}

// main program run
document.addEventListener('DOMContentLoaded', () => {
  
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
      // request 49 latest album/single releases

      let token = body.access_token;
      let options = {
        url: 'https://cors-anywhere.herokuapp.com/https://api.spotify.com/v1/browse/new-releases?limit=49',
        headers: {
          'Authorization': 'Bearer ' + token
        },
        json: true
      };

      // will store trackIds in array below
      const trackIds = [];

      request.get(options, function(error, response, body) {
        
        // console.log(body);

        // remove loading dots once API call provides response, replace it with navigation start button
        document.getElementById("loading-dots-1").remove();

        const nav1 = document.createElement("span")
        nav1.textContent = "start";
        nav1.setAttribute("id", "start-button")

        document.getElementById("nav-1").appendChild(nav1);

        nav1.addEventListener('click', function(){
          $('html, body').animate({ scrollTop: $('#main-container').offset().top }, 'slow');
          return false;
        })

        const prev1Icon = document.getElementById("prev-1-icon");
        const prev1 = document.createElement("i");
        prev1.setAttribute("class", "fas fa-angle-up")
        prev1Icon.appendChild(prev1)
        prev1Icon.addEventListener('click', function(){
          $('html, body').animate({ scrollTop: $('#landing').offset().top }, 'slow');
          return false;
        })

        // create SVG to display album art and information

        const svg = d3.select("#main").append("svg")
          .attr("width", 448)
          .attr("height", 448)

        const infoWindow = d3.select("#main").append("svg")
          .attr("width", 458)
          .attr("height", 448)
          .attr('x', 448)

        const albumArtInstructions = infoWindow.append('text')
          .attr("x", 42)
          .attr("y", 175)
          .attr("font-family", "Roboto")

        const albumArtInstructions2 = infoWindow.append('text')
        .attr("x", 38)
        .attr("y", 200)
        .attr("font-family", "Roboto")
        .text("new music. Click an image to listen and get more details.")

        const albumArtInstructions3 = infoWindow.append('text')
        .attr("x", 108)
        .attr("y", 250)
        .attr("font-family", "Roboto")
        .text("When ready, click the arrow below")

        const albumArtInstructions4 = infoWindow.append('text')
        .attr("x", 118)
        .attr("y", 275)
        .attr("font-family", "Roboto")
        .text("to browse new releases by key.")

        const showArtInstructions = function(){
          albumArtInstructions.text("Browsing album art provides a visual way to discover")
          albumArtInstructions2.text("new music. Click an image to listen and get more details.")
          albumArtInstructions3.text("When ready, click the arrow below")
          albumArtInstructions4.text("to browse new releases by key.")
        }

        showArtInstructions();

        const albumText = infoWindow.append('text')
          .attr("x", 10)
          .attr("y", 300)
          .attr("font-family", "Roboto")
          .attr("font-size", "19px")
          // .on('click', function(){console.log("okfinethen")})

        const artistText = infoWindow.append('text')
          .attr("x", 10)
          .attr("y", 320)
          .attr("font-family", "Roboto")
          .attr("font-size", "16px")


        const releaseDateText = infoWindow.append('text')
          .attr("x", 10)
          .attr("y", 340)
          .attr("font-family", "Roboto")
          .attr("font-size", "16px")

        // map data from API response to images using D3 
        let artwork = svg.selectAll("image")
          .data(body.albums.items);
        
        let firstArtClick = true;

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
          .attr('class', 'album-image')
          
          // when clicking album art image, display information and preview

          .on('click', function (d, i) {
            if (firstArtClick) {
              const infoIcon = infoWindow.append('image')
                .attr('xlink:href', 'https://track-record-app.s3-us-west-1.amazonaws.com/question-circle-regular.png')
                .attr('x', 435)
                .attr('y', 10)
                .attr('width', 20)
                .attr('height', 20)
                .on('click', function(){
                  albumText.text("");
                  artistText.text("");
                  releaseDateText.text("");
                  showArtInstructions();
                  if (d3.select('#album-player')) d3.select('#album-player').remove();
                  if (d3.select('#showImage')) d3.select('#showImage').remove();
                })

              firstArtClick = false;
            }

            if (d3.select('#showImage')) d3.select('#showImage').remove();
            
            infoWindow.append('image')
              .attr('xlink:href', d.images[1].url)
              .attr('x', 10)
              .attr('y', 0)
              .attr('width', 250)
              .attr('height', 250)
              .attr('id', 'showImage')
            
            let foreignObject = infoWindow.append('foreignObject')
              .attr('x', 10)
              .attr('y', 370)
              .attr('width', 448)
              .attr('height', 80)

            if (d3.select('#album-player')) d3.select('#album-player').remove();

            let player = foreignObject.append("xhtml:iframe")
                .attr('id', 'album-player')
                .attr('src', 'https://open.spotify.com/embed/album/' + d.id)
                .attr('allow', 'encrypted-media')

            
            // truncate and display artist and album names
            let artists = [];
            d.artists.forEach(artist => {
              artists.push(artist.name)
            })

            let artistNames = artists.join(", ")
            if (artistNames.length > 48) artistNames = artistNames.slice(0,48) + "..."

            let date = new Date(d.release_date)
            date = date.toString().split(" ");
            date = [date[1], date[2], date[3]].join(" ")

            let albumName = d.name
            if (albumName.length > 48){
              albumName = albumName.slice(0,48) + "..."
            }

            // remove instructions
            albumArtInstructions.text("")
            albumArtInstructions2.text("")
            albumArtInstructions3.text("")
            albumArtInstructions4.text("")
            

            albumText.text("")
            albumText.text(albumName)

            artistText.text("")
            artistText.text("Artist: " + artistNames)
            
            releaseDateText.text("Released: " + date)

          })
          
          //highlight album images on mouseover
          .on('mouseover', function (d, i) {
            d3.select(this).transition()
                 .duration('50')
                 .attr('opacity', '.85')
          })
          .on('mouseout', function (d, i) {
            d3.select(this).transition()
                 .duration('50')
                 .attr('opacity', '1');
          })
        
        // make API call to get tracks from all 49 albums
        let successCounter = 0
        
        body.albums.items.forEach((album) => {
          let albumUrl = 'https://cors-anywhere.herokuapp.com/https://api.spotify.com/v1/albums/' + album.id + '/tracks';
          let albumOptions = {
            url: albumUrl,
            headers: {
              'Authorization': 'Bearer ' + token
            },
            json: true
          };

          // request tracks for each album
          request.get(albumOptions, function(error, response, body){

            body.items.forEach(track => {
              // push track IDs in API response into trackIds array
              trackIds.push(track.id)
            });

            successCounter += 1;
            
            // when finished grabbing all trackIDs, recursively request all audio features from each track ID
            // 100 tracks at a time, until there are no more tracks remaining

            if (successCounter === 49){
              let audioFeatures = [];
              let numRecursions = Math.floor(trackIds.length/100) + 1;
              
              // console.log(trackIds)
              let errors = false;

              function fetchAllTracks(ids){
                if (ids.length === 0) return;
                let firstHundred = ids.slice(0, 100);
                let remaining = ids.slice(100)
                let tracksUrl = 'https://cors-anywhere.herokuapp.com/https://api.spotify.com/v1/audio-features?ids=' + firstHundred.join("%2C") 
                let tracksOptions = {
                url: tracksUrl,
                headers: {
                  'Authorization': 'Bearer ' + token
                  },
                json: true
                };

                request.get(tracksOptions, function(error, response, body){
                  if (!error && response.statusCode === 200){
                    // push API response body (audio features for 100 tracks) into audioFeatures array
                    audioFeatures.push(body);
                    if (audioFeatures.length === numRecursions){
                      // flatten audio features array
                      let allAudioFeatures = [];
                      audioFeatures.forEach(part => {
                        part.audio_features.forEach(datum => {
                          if (datum) allAudioFeatures.push(datum)
                        })
                      })
                      // console.log(allAudioFeatures)

                      // create navigation button to go back to album image from sunburst chart
                      const prev2 = document.createElement("i")
                      prev2.setAttribute("class", "fas fa-angle-up");
                      const prev2Icon = document.getElementById("prev-2-icon");
                      prev2Icon.appendChild(prev2);
                      prev2Icon.addEventListener('click', function(){
                        $('html, body').animate({ scrollTop: $('#main-container').offset().top }, 'slow');
                        return false;
                      })


        

                    // initialize data object and key arrays
                    let dataByKey = {};
                    const keys = ["C", "Db/C#", "D", "Eb", "E", "F", "Gb/F#", "G", "Ab", "A", "Bb", "B"]
                    const circleOfFifths = ["C", "G", "D", "A", "E", "B", "Gb/F#", "Db/C#", "Ab", "Eb", "Bb", "F"]
                    
                    // push tracks into data object, organized in order of Circle of Fifths
                    allAudioFeatures.forEach((track) => {
                      let key = keys[track.key]
                      let order = circleOfFifths.indexOf(key);
                      if (!dataByKey[order]) {    
                        dataByKey[order] = []
                      }
                      dataByKey[order].push(track)
                      })

                    // let colors = d3.scaleOrdinal()
                    //   .domain(dataByKey)
                    //   .range(["#8dd3c7","#ffffb3","#bebada","#fb8072","#80b1d3","#fdb462","#b3de69","#fccde5","#d9d9d9","#bc80bd","#ccebc5","#ffed6f"]);
                    
                
                    // create Sunburst Chart
                    
                    const sunburstHeight = document.getElementById("sunburst").offsetHeight;
                    const sunburstWidth = document.getElementById("sunburst").offsetWidth;
                    
                    const sunburstX = d3.scaleLinear()
                      .range([0, 2 * Math.PI])
                    const sunburstY = d3.scaleSqrt()
                      .range([0, sunburstHeight/2])

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

                    root = d3.hierarchy(root)
                      .sum(function(d){ 
                        if (d.size) return d.size
                      })


                    const sunburstArea = d3.select("#sunburst").append("svg")
                      .attr("width", sunburstWidth)
                      .attr("height", sunburstHeight)
                      .attr("id","sunburst-svg")
                      .append("g")
                      .attr("transform", "translate(" + ((sunburstWidth/2)).toString() + ", " + ((sunburstHeight/2)).toString() + ")")
                    

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
                      // .style("opacity", 0)
                      .attr("stroke", "black")
                      .attr("stroke-opacity", "0.5")
                      .attr("class", function(d){
                        if (d.parent && d.children) return "selectors key-level"
                        else return "selectors"
                      })
                      .on('click', click)

                        
                    let level = 0
                    
                    // click function - main interactive aspect of Sunburst
                    
                    function click(d){
                      // remove initial instructions
                      if (d.parent) {
                        if (d3.select('#key-instructions')) d3.select('#key-instructions').remove();
                      }
                      
                      if (d3.selectAll('.sunburst-artist-text')) d3.selectAll('.sunburst-artist-text').remove();
                      if (d3.selectAll('.sunburst-name-text')) d3.selectAll('.sunburst-name-text').remove();
                      if (d3.select('#key-level-instructions')) d3.select('#key-level-instructions').remove();
                      // when clicking on an outermost slice
                      if (!d.children){
                        // remove any spotify players and append a new one
                        if (d3.select('#key-player')) d3.select('#key-player').remove();
                        
                        let foreignObject = keyWindow.append('foreignObject')
                          .attr('width', 80)
                          .attr('height', 80)
                        let player = foreignObject.append("xhtml:iframe")
                          .attr('id', 'key-player')
                          .attr('src', 'https://open.spotify.com/embed/track/' + d.data.id)
                          .attr('allow', 'encrypted-media')
                          .style('border-radius','20px')
                        
                        if (d.hasInfo){
                          sunburstArea.append("text")
                            .text(d.firstArtist)
                            .attr('y', 100)
                            .attr('class', 'sunburst-artist-text')
                            .style('font-family', 'Roboto')
                            .style('text-anchor', 'middle')
                          
                          sunburstArea.append("text")
                            .text('"' + d.name + '"')
                            .attr('y', -100)
                            .attr('class', 'sunburst-name-text')
                            .style('font-family', 'Roboto')
                            .style('text-anchor', 'middle')
                          
                        } else {
                          d3.selectAll('.selectors').on('click',function(){
                            d3.select(this).on('click', null);
                          });
                          request.post(authOptions, function(error, response, body){
                            if (!error && response.statusCode === 200){
                              let token = body.access_token;
                              let options = {
                                url: 'https://cors-anywhere.herokuapp.com/https://api.spotify.com/v1/tracks/' + d.data.id,
                                headers: {
                                  'Authorization': 'Bearer ' + token
                                },
                                json: true
                              };
                              request.get(options, function(error, response, body){
                                d.hasInfo = true
                                d.name = body.name
                                d.artists = []
                                body.artists.forEach(artist => {d.artists.push(artist.name)})
                                d.firstArtist = d.artists[0]
                                d.albumName = body.album.name
                                d.releaseDate = body.album.release_date

                                sunburstArea.append("text")
                                  .text(d.firstArtist)
                                  .attr('y', 100)
                                  .attr('class', 'sunburst-artist-text')
                                  .style('font-family', 'Roboto')
                                  .style('text-anchor', 'middle')

                                sunburstArea.append("text")
                                  .text('"' + d.name + '"')
                                  .attr('y', -100)
                                  .attr('class', 'sunburst-name-text')
                                  .style('font-family', 'Roboto')
                                  .style('text-anchor', 'middle')

                                d3.selectAll('.selectors').on('click', click)
                                
                              })


                            }
                          })
                        }
                        
                      }

                    // when clicking a mid level slice (key level)

                      if (d.children && d.parent && level !== 1){
                        level = 1
                        if (d3.select('#key-player')) d3.select('#key-player').remove();
                        
                        // no hover effects on text of data points (?)
                        d3.selectAll(".key-level").classed("no-hover", true)
                        d3.select("#root-level").classed("no-hover", true)
                        
                        // make root level data point blend in
                        d3.select('#root-level').style('fill',sunburstColors(d.data.name)).style('opacity', 1).attr('stroke', sunburstColors(d.data.name))
                        
                        // animation transition
                        sunburstArea.transition()
                          .duration(650)
                          .tween("scales", function() {
                            let xd = d3.interpolate(sunburstX.domain(), [d.x0, d.x1])
                            let yd = d3.interpolate(sunburstY.domain(), [d.y0, 1])
                            let yr = d3.interpolate(sunburstY.range(), [d.y0 ? 10 : 0, sunburstHeight/2])
                            return function(t){ sunburstX.domain(xd(t)); sunburstY.domain(yd(t)).range(yr(t))}
                          })
                          .selectAll("path")
                            .attrTween("d", function(d){return function(){return sunburstArc(d)}})

                        
                        sunburstArea.selectAll('text')
                          .remove()
                        const backButton = sunburstArea.append('text')
                        let currentKey = keys[d.children[0].data.key];
                        
                        setTimeout(function(){
                          // add key name and back button to data points
                          
                          sunburstArea.append('text')
                            .text(currentKey)
                            // .attr('x', -7 - 4.15*(keys[d.children[0].data.key].length - 1))
                            .attr('y', -1 - sunburstHeight * 0.21)
                            .style('font-family', 'Roboto')
                            .style('font-size', 17)
                            .style('text-anchor', 'middle')

                          backButton.text('back')
                            .attr('x', -13.75)
                            .attr('y', sunburstHeight * 0.24)
                            .style('cursor', 'default')
                            .style('font-family', 'Roboto')
                            .style('font-size', 14)
                        }, 200)

                        // remove stroke from key level data points
                        sunburstArea.selectAll('path')
                          .attr("stroke-width", function(data){
                            return (data.parent && data.children) ? 0 : 1
                          });
                        
                        // disable clickability of all data points until all have loaded
                        d3.selectAll('.selectors').on('click',function(){
                          d3.select(this).on('click', null);
                        });

                        // create a loading spinner while songs load
                        if (!d.loaded){
                          setTimeout(function(){
                            let foreignDiv = sunburstArea.append('foreignObject')
                              .attr('x', -14)
                              .attr('y', -14)
                              .attr('width', 35)
                              .attr('height', 35)
                            
                            let loading = foreignDiv.append('xhtml:div')
                              .attr('id', 'loading-spin')

                            // request Spotify API for information about songs in that key
                            request.post(authOptions, function(error, response, body){
                              if (!error && response.statusCode === 200){
                                let token = body.access_token;
                                
                                let successTrack = 0

                                d.children.forEach((track, index) => {
                                  
                                  if (track.hasInfo){
                                    let artistNameTrack = track.artists[0]
                                    if (artistNameTrack.length > 14) {
                                      artistNameTrack = artistNameTrack.slice(0, 14) + "..."
                                      track.firstArtist = track.firstArtist.slice(0, 14) + "..."
                                    }

                                    let rotation
                                    if (index < d.children.length / 2) rotation = -90 + ((index + 0.5) / d.children.length) * 360
                                    else {
                                      let newIndex = index - d.children.length/2

                                      rotation = -90 + ((newIndex + 0.5) / d.children.length) * 360
                                    }
                                    // append artist names to data points
                                    sunburstArea.append("text")
                                      .text(artistNameTrack)
                                      .attr("transform", function() {
                                        return ( "translate(" + sunburstArc.centroid(d.children[index]) + ") rotate(" + rotation.toString() +")")
                                      })
                                      .style("text-anchor", "middle")
                                      //find-me
                                      .style("font-size", 7.5 + Math.floor(sunburstHeight * 0.01))
                                      .style("opacity", "0")
                                      .attr("class", "key-text")
                                      .style("font-family", "Roboto")
                                        .transition()
                                        .duration(100)
                                        .style('opacity', "1")

                                    successTrack += 1
                                    if (successTrack === d.children.length) {
                                      // data now loaded! make data points clickable, remove loading spinner
                                      d3.selectAll('.selectors').on('click', click)
                                      d.loaded = true;
                                      
                                      foreignDiv.remove();
                                      
                                      backButton.on('click', function(){
                                        d3.select('#root-level').dispatch('click');
                                        setTimeout(showKeyInstructions, 800);
                                      })
                                      backButton.style('cursor', 'pointer');
                                    }

                                  } else {
                                    let options = {
                                      url: 'https://cors-anywhere.herokuapp.com/https://api.spotify.com/v1/tracks/' + track.data.id,
                                      headers: {
                                        'Authorization': 'Bearer ' + token
                                      },
                                      json: true
                                    };
                                    
                                    request.get(options, function(error, response, body){

                                      // append artist information to data slice
                                      let rotation
                                      
                                      if (index < d.children.length / 2) rotation = -90 + ((index + 0.5) / d.children.length) * 360
                                      else {
                                        let newIndex = index - d.children.length/2

                                        rotation = -90 + ((newIndex + 0.5) / d.children.length) * 360
                                      }
                                      
                                      track.hasInfo = true
                                      track.name = body.name
                                      track.artists = []
                                      body.artists.forEach(artist => {track.artists.push(artist.name)})
                                      track.firstArtist = track.artists[0]
                                      track.albumName = body.album.name
                                      track.releaseDate = body.album.release_date
                                      
                                      let artistNameTrack = track.artists[0]
                                      if (artistNameTrack.length > 14) {
                                        artistNameTrack = artistNameTrack.slice(0, 14) + "..."
                                        track.firstArtist = track.firstArtist.slice(0, 14) + "..."
                                      }

                                      sunburstArea.append("text")
                                        .text(artistNameTrack)
                                        .attr("transform", function() {
                                          return ( "translate(" + sunburstArc.centroid(d.children[index]) + ") rotate(" + rotation.toString() +")")
                                        })
                                        .style("text-anchor", "middle")
                                        //find-me
                                        .style("font-size", 7.5 + Math.floor(sunburstHeight * 0.01))
                                        .style("opacity", "0")
                                        .attr("class", "key-text")
                                        .style("font-family", "Roboto")
                                          .transition()
                                          .duration(100)
                                          .style('opacity', "1")
                                      successTrack += 1
                                      if (successTrack === d.children.length) {
                                        // data now loaded! make data points clickable, remove loading spinner
                                        d3.selectAll('.selectors').on('click', click)
                                        d.loaded = true;
                                        foreignDiv.remove();

                                        // sunburstArea.append('text')
                                        //   .text('These are new releases in the key of ' + currentKey)
                                        //   .style('font-family', 'Roboto')
                                        //   .style('font-size', 12)
                                        //   .attr('x', sunburstWidth * -0.09)

                                        backButton.on('click', function(){
                                          d3.select('#root-level').dispatch('click');
                                          setTimeout(showKeyInstructions, 800);
                                        })
                                        backButton.style('cursor', 'pointer');
                                      }
                                    })
                                  }
                                })
                              }
                            })
                          }, 650)
                        } else {
                          //if data is already loaded
                          // make data points clickable, append stored artist information to data points
                          d3.selectAll('.selectors').on('click', click)
                          
                          // add cursor pointer to back button somehow
                          backButton.on('click', function(){
                            d3.select('#root-level').dispatch('click');
                            setTimeout(showKeyInstructions, 800);
                          })

                          
                          setTimeout(function(){
                            d.children.forEach((track, index) => {
                              let rotation
                              if (index < d.children.length / 2) rotation = -90 + ((index + 0.5) / d.children.length) * 360
                              else {
                                let newIndex = index - d.children.length/2

                                rotation = -90 + ((newIndex + 0.5) / d.children.length) * 360
                              }
                              sunburstArea.append("text")
                                      .text(track.firstArtist)
                                      .attr("transform", function() {
                                        return ( "translate(" + sunburstArc.centroid(d.children[index]) + ") rotate(" + rotation.toString() +")")
                                      })
                                      .style("text-anchor", "middle")
                                      //find-me
                                      .style("font-size", 7.5 + Math.floor(sunburstHeight * 0.01))
                                      .style("opacity", "0")
                                      .attr("class", "key-text")
                                      .style("font-family", "Roboto")
                                        .transition()
                                        .duration(100)
                                        .style('opacity', "1")

                            })
                          }, 700)
                        }

                      }
                      
                      // when clicking the root level data point, from the key level (level 1)                      
                      if (!d.parent && level !== 0){

                        level = 0
                        
                        // remove any spotify players
                        if (d3.select('#key-player')) d3.select('#key-player').remove();

                        d3.selectAll(".key-level").classed("no-hover", false)

                        d3.select('#root-level').style('fill', 'white' )
                        
                        // animation transition
                        sunburstArea.transition()
                          .duration(650)
                          .tween("scales", function() {
                            let xd = d3.interpolate(sunburstX.domain(), [d.x0, d.x1])
                            let yd = d3.interpolate(sunburstY.domain(), [d.y0, 1])
                            let yr = d3.interpolate(sunburstY.range(), [d.y0 ? 10 : 0, sunburstHeight/2])
                            return function(t){ sunburstX.domain(xd(t)); sunburstY.domain(yd(t)).range(yr(t))}
                          })
                          .selectAll("path")
                            .attrTween("d", function(d){return function(){return sunburstArc(d)}})
                        
                        // remove all text
                        sunburstArea.selectAll('text')
                          .remove()
                        
                        // append key information text
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
                    }

                    const keyWindow = sunburstArea.append("svg")
                      .attr("height", 350)
                      .attr("width", 350)
                      .attr('x', -40)
                      .attr('y', -40)
                    
                    // define a function to show instructions for sunburst chart
                    const showKeyInstructions = function(){
                      if (level == 0){
                        const keyInstructions = sunburstArea.append("svg")
                          .attr("id", "key-instructions")
                          .attr("height", 350)
                          .attr("width", 350)
                          .attr('x', -114)
                          .attr('y', -60)

                        keyInstructions.append("text")
                          .text("Click a slice with a key label")
                          .attr('x', 28)
                          .attr('y', 40)
                          .style("font-size", 14)
                          .style("font-family", "Roboto")

                        keyInstructions.append("text")
                          .text("to browse all songs in that key")
                          .attr('x', 21)
                          .attr('y', 60)
                          .style("font-size", 14)
                          .style("font-family", "Roboto")

                        keyInstructions.append("text")
                          .text("or click on an outer slice to listen")
                          .attr('x', 14)
                          .attr('y', 80)
                          .style("font-size", 14)
                          .style("font-family", "Roboto")

                        keyInstructions.append("text")
                          .text("to a preview of a song in a certain key.")
                          .attr('x', 0)
                          .attr('y', 100)
                          .style("font-size", 14)
                          .style("font-family", "Roboto")
                      }
                    }

                    showKeyInstructions();

                    sunburst.append("text")
                        .text(function(d){ 
                          if (d.parent === null) return ""
                          if (d.children) {
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
                    
                    // create down arrow to allow access to this part of the page from previous page, remove loading dots
                    const browseByKeyText = document.createTextNode("browse by key")
                    const lineBreak = document.createElement("br");
                    const nav2 = document.createElement("i")
                    nav2.setAttribute("class","fas fa-angle-down");
                    nav2.setAttribute("id","down-arrow-nav");
                    
                    document.getElementById("loading-dots-2").remove();

                    const nav2Icon = document.getElementById("nav-2-icon");
                    nav2Icon.append(browseByKeyText);
                    nav2Icon.append(lineBreak)
                    nav2Icon.appendChild(nav2);

                    let firstTimeNav2 = true;
                    nav2Icon.addEventListener('click', function(){
                      $('html, body').animate({ scrollTop: $('#sunburst-container').offset().top }, 'slow');
                      if (firstTimeNav2) {
                        firstTimeNav2 = false;
                        // animate opacity appearing for sunburst wheel
                      }
                      return false;
                    })


                    // Scatterplot
                    const graphHeight = 500;
                    const graphWidth = 500;
                    const scaleTempo = d3.scaleLinear()
                      .domain([0, 230])
                      .range([0, graphWidth])

                    const scaleDanceability = d3.scaleLinear()
                      .domain([1,0])
                      .range([0,graphHeight])

                    const scaleValence = d3.scaleLinear()
                      .domain([0,1])
                      .range(['#52a9ff', '#ff9452']);

                    const graph = d3.select("#scatterplot").append("svg")
                      .attr("width", graphWidth)
                      .attr("height", graphHeight)

                    const trackInfoWindow = d3.select("#scatterplot").append("svg")
                      .attr("width", graphWidth)
                      .attr("height", graphHeight)
                      .attr('x', graphWidth)
                    
                    trackInfoWindow.append("text")
                      .text("Organizing the data by Spotify's metrics provides an interesting")
                      .attr("x", 25)
                      .attr("y", 30)
                      .style("text-anchor", "left")
                      .style("font-family", "Roboto")
                      .style("font-size", 15)
                    
                    trackInfoWindow.append("text")
                      .text("way to visualize and discover new music.")
                      .attr("x", 25)
                      .attr("y", 50)
                      .style("text-anchor", "left")
                      .style("font-family", "Roboto")
                      .style("font-size", 15)

                    trackInfoWindow.append("text")
                      .text("The x-axis of this graph represents a song's tempo,")
                      .attr("x", 25)
                      .attr("y", 85)
                      .style("text-anchor", "left")
                      .style("font-family", "Roboto")
                      .style("font-size", 15)

                    trackInfoWindow.append("text")
                      .text("measured in beats per minute (BPM).")
                      .attr("x", 25)
                      .attr("y", 105)
                      .style("text-anchor", "left")
                      .style("font-family", "Roboto")
                      .style("font-size", 15)

                    trackInfoWindow.append("text")
                      .text("The y-axis of this graph represents the danceability of a song,")
                      .attr("x", 25)
                      .attr("y", 140)
                      .style("text-anchor", "left")
                      .style("font-family", "Roboto")
                      .style("font-size", 15)

                    trackInfoWindow.append("text")
                      .text("0 being the least danceable while 1 being the most danceable.")
                      .attr("x", 25)
                      .attr("y", 160)
                      .style("text-anchor", "left")
                      .style("font-family", "Roboto")
                      .style("font-size", 15)

                    trackInfoWindow.append("text")
                      .text("The color of the data point represents the mood of the song -")
                      .attr("x", 25)
                      .attr("y", 195)
                      .style("text-anchor", "left")
                      .style("font-family", "Roboto")
                      .style("font-size", 15)

                    trackInfoWindow.append("text")
                      .text("the more orange a circle is the happier the song, while")
                      .attr("x", 25)
                      .attr("y", 215)
                      .style("text-anchor", "left")
                      .style("font-family", "Roboto")
                      .style("font-size", 15)

                    trackInfoWindow.append("text")
                      .text("the more blue a circle is the sadder the song.")
                      .attr("x", 25)
                      .attr("y", 235)
                      .style("text-anchor", "left")
                      .style("font-family", "Roboto")
                      .style("font-size", 15)

                    trackInfoWindow.append("text")
                      .text("The size of the data point represents how much energy the song has.")
                      .attr("x", 25)
                      .attr("y", 270)
                      .style("text-anchor", "left")
                      .style("font-family", "Roboto")
                      .style("font-size", 15)

                    trackInfoWindow.append("text")
                      .text("Larger circles have more energy, while smaller ones have less.")
                      .attr("x", 25)
                      .attr("y", 290)
                      .style("text-anchor", "left")
                      .style("font-family", "Roboto")
                      .style("font-size", 15)
                    
                    trackInfoWindow.append("text")
                      .text("(Both happiness and energy values range from 0 to 1,")
                      .attr("x", 25)
                      .attr("y", 320)
                      .style("text-anchor", "left")
                      .style("font-family", "Roboto")
                      .style("font-size", 14)

                    trackInfoWindow.append("text")
                      .text("with 0 being the least happy and energetic, and 1 being the most.)")
                      .attr("x", 25)
                      .attr("y", 340)
                      .style("text-anchor", "left")
                      .style("font-family", "Roboto")
                      .style("font-size", 14)

                    const trackTempoText = trackInfoWindow.append("text")
                      .attr('x', 25)
                      .attr("y", 375)
                      .text("")
                      .style("font-family", "Roboto")
                      .style("font-weight", "bold")
                      .style("fill","#1286FE")
                    
                    const trackDanceabilityText = trackInfoWindow.append("text")
                      .attr('x', 25)
                      .attr("y", 400)
                      .text("")
                      .style("font-family", "Roboto")
                      .style("font-weight", "bold")
                      .style("fill","#1286FE")

                    const trackHappinessText = trackInfoWindow.append("text")
                      .attr('x', 200)
                      .attr("y", 375)
                      .text("")
                      .style("font-family", "Roboto")
                      .style("font-weight", "bold")
                      .style("fill","#1286FE")
                    
                    const trackEnergyText = trackInfoWindow.append("text")
                      .attr('x', 200)
                      .attr("y", 400)
                      .text("")
                      .style("font-family", "Roboto")
                      .style("font-weight", "bold")
                      .style("fill","#1286FE")

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
                        return graphHeight - d.danceability * graphHeight - 10
                      })
                      .attr("r", function(d){
                        return d.energy * 10
                      })
                      .attr("fill", function(d){
                        return scaleValence(d.valence)
                      })
                      .attr('cursor', 'pointer')

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
                          .attr('x', 25)
                          .attr('y', graphHeight - 80)
                          .attr('width', graphWidth - 25)
                          .attr('height', 80)
                        let player = foreignObject.append("xhtml:iframe")
                          .attr('id', 'track-player')
                          .attr('src', 'https://open.spotify.com/embed/track/' + d.id)
                          .attr('allow', 'encrypted-media')

                        trackTempoText.text("Tempo: " + d.tempo);
                        trackDanceabilityText.text("Danceability: " + d.danceability);
                        trackHappinessText.text("Happiness: " + d.valence);
                        trackEnergyText.text("Energy: " + d.energy)
                        
                      })
                    
                    const yAxis = graph.append("svg")
                      .append("g")
                      .attr("transform", "translate(45,10)")
                      .call(d3.axisLeft(scaleDanceability).tickSize(0))

                    const firstYTick = d3.select(yAxis.selectAll('.tick')["_groups"][0][10])
                    const secondYTick = d3.select(yAxis.selectAll('.tick')["_groups"][0][9]);
                    firstYTick.attr('visibility', 'hidden');
                    secondYTick.attr('visibility', 'hidden');

                    const yAxisLabel = graph.append("svg")
                      .append("text")
                      .text("Danceability")
                      .attr("transform", "rotate(-90)")
                      .attr("x", -275)
                      .attr("y", 15)
                      .style("font-family", "Roboto")
                      .style("font-size", 15)

                    const xAxis = graph.append("svg")
                      .append("g")
                      .attr("transform", "translate(0," + (graphHeight - 35).toString() +")")
                      .call(d3.axisBottom(scaleTempo).tickSize(0))
                    

                    const firstXTick = d3.select(xAxis.selectAll('.tick')["_groups"][0][0]);
                    const secondXTick = d3.select(xAxis.selectAll('.tick')["_groups"][0][1]);
                    firstXTick.attr('visibility', 'hidden');
                    secondXTick.attr('visibility', 'hidden');
                    
                    const xAxisLabel = graph.append("svg")
                      .append("text")
                      .text("Tempo")
                      .attr("x", 280)
                      .attr("y", 495)
                      .style("font-family", "Roboto")
                      .style("font-size", 15)
                      .style("text-anchor", "middle")

                    const rectangle1 = graph.append("svg")
                      .append("rect")
                      .attr("x", -5)
                      .attr("y", 455)
                      .attr("width", 50)
                      .attr("height", 25)
                      .style("fill", "white")

                    const rectangle2 = graph.append("svg")
                      .append("rect")
                      .attr("x", 0)
                      .attr("y", 466)
                      .attr("width", 50)
                      .attr("height", 35)
                      .style("fill", "white")
                    
                    const scatterplotInstructions = document.createElement("p");
                    scatterplotInstructions.innerText = "Click on a circle to listen and get more information.";
                    scatterplotInstructions.setAttribute("id", "scatterplot-instructions");
                    document.getElementById("scatterplot").appendChild(scatterplotInstructions);
                    
                    const nav3 = document.createElement("i");
                    nav3.setAttribute("class","fas fa-angle-down");
                    let firstTimeNav3 = true;

                    const browseByMetricsText = document.createTextNode("browse by metrics")
                    const br = document.createElement("br")
                    const nav3Icon = document.getElementById("nav-3-icon")
                    nav3Icon.append(browseByMetricsText);
                    nav3Icon.append(br);
                    nav3Icon.appendChild(nav3);
                    nav3Icon.addEventListener('click', function(){
                      $('html, body').animate({ scrollTop: $('#scatterplot-container').offset().top }, 'slow');
                      if (firstTimeNav3){
                        graph.selectAll("circle")
                          .transition()
                          .delay(function(d,i){return(i*3)})
                          .duration(2000)
                          .attr("cx", function(d){
                            return scaleTempo(d.tempo)
                          })
                          .attr("cy", function(d){
                            return graphHeight - d.danceability * graphHeight
                          })
                        firstTimeNav3 = false;
                      }

                      return false;
                    })

                    const prev3 = document.createElement("i");
                    prev3.setAttribute("class", "fas fa-angle-up");
                    const prev3Icon = document.getElementById("prev-3-icon");
                    prev3Icon.appendChild(prev3);
                    prev3Icon.addEventListener('click', function(){
                      $('html, body').animate({ scrollTop: $('#sunburst-container').offset().top }, 'slow');
                      return false;
                    })

                  }
                } else {
                  console.log("try again later Spotify isn't working")
                  if (errors === false){
                    const errorMessage = document.createElement("p")
                    errorMessage.textContent = "Spotify's API isn't responding, try browsing by key later";
                    errorMessage.addEventListener("click", function(){
                      location.reload();
                    })
                    let loadingDots = document.getElementById("loading-dots-2");
                    if (loadingDots) loadingDots.remove();
                    nav2Icon = document.getElementById("nav-2-icon");
                    nav2Icon.append(errorMessage);
                    errors = true;
                  }
                }

              })
                // recursive call from fetching all tracks
                return fetchAllTracks(remaining);

              }

              fetchAllTracks(trackIds);

            }

          });
          
        })
      });
    } else {
      console.log("not available try again later")
    }
  });
});